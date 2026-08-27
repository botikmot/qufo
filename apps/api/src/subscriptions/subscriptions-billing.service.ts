import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import type { TenantContext } from '../auth/types/tenant-context.type';

import { resolveSubscriptionState } from './utils/subscription-state.util';

import { SubscriptionPricingService } from './subscription-pricing.service';
import { CreateSubscriptionCheckoutDto } from './dto/create-subscription-checkout.dto';
import { ConfigService } from '@nestjs/config';

import { PayMongoService } from './providers/paymongo.service';

@Injectable()
export class SubscriptionsBillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: SubscriptionPricingService,
    private readonly payMongoService: PayMongoService,
    private readonly configService: ConfigService,
  ) {}

  private addMonths(date: Date, months: number) {
    const result = new Date(date);

    const originalDay = result.getDate();

    result.setDate(1);

    result.setMonth(result.getMonth() + months);

    const lastDay = new Date(
      result.getFullYear(),
      result.getMonth() + 1,
      0,
    ).getDate();

    result.setDate(Math.min(originalDay, lastDay));

    return result;
  }

  async getBillingSummary(tenant: TenantContext) {
    const organization = await this.prisma.organization.findUnique({
      where: {
        id: tenant.organizationId,
      },

      select: {
        id: true,

        name: true,

        countryCode: true,

        subscription: {
          select: {
            id: true,

            plan: true,

            status: true,

            trialStartedAt: true,

            trialEndsAt: true,

            currentPeriodStart: true,

            currentPeriodEnd: true,

            cancelAtPeriodEnd: true,

            cancelledAt: true,
          },
        },
      },
    });

    if (!organization || !organization.subscription) {
      throw new NotFoundException('Subscription not found.');
    }

    const subscription = organization.subscription;

    const effective = resolveSubscriptionState(subscription);

    const price = this.pricingService.getStandardMonthlyPrice(
      organization.countryCode,
    );

    return {
      subscription: {
        ...subscription,

        effectiveStatus: effective.status,

        daysRemaining: effective.daysRemaining,

        trialDaysRemaining: effective.trialDaysRemaining,
      },

      pricing: {
        plan: price.plan,

        amount: price.amount.toFixed(2),

        currency: price.currency,

        periodMonths: price.periodMonths,
      },

      canRenew: ['TRIALING', 'ACTIVE', 'PAST_DUE', 'EXPIRED'].includes(
        effective.status,
      ),
    };
  }

  async createCheckout(
    tenant: TenantContext,
    dto: CreateSubscriptionCheckoutDto,
  ) {
    const now = new Date();

    const organization = await this.prisma.organization.findUnique({
      where: {
        id: tenant.organizationId,
      },

      select: {
        id: true,

        name: true,

        countryCode: true,

        subscription: {
          select: {
            id: true,

            plan: true,

            status: true,

            trialStartedAt: true,

            trialEndsAt: true,

            currentPeriodStart: true,

            currentPeriodEnd: true,
          },
        },
      },
    });

    if (!organization || !organization.subscription) {
      throw new NotFoundException('Subscription not found.');
    }

    const subscription = organization.subscription;

    const effective = resolveSubscriptionState(subscription, now);

    const price = this.pricingService.getStandardMonthlyPrice(
      organization.countryCode,
    );

    /*
     * V1 provider rules.
     */
    const isPhilippines = organization.countryCode?.toUpperCase() === 'PH';

    if (isPhilippines && dto.provider !== 'PAYMONGO') {
      throw new BadRequestException(
        'PayMongo is currently used for Philippine subscriptions.',
      );
    }

    if (!isPhilippines && dto.provider !== 'PAYPAL') {
      throw new BadRequestException(
        'PayPal is currently used for international subscriptions.',
      );
    }

    /*
     * Determine when the newly
     * purchased month begins.
     */
    let periodStart = now;

    if (effective.status === 'TRIALING' && subscription.trialEndsAt > now) {
      periodStart = subscription.trialEndsAt;
    } else if (
      effective.status === 'ACTIVE' &&
      subscription.currentPeriodEnd &&
      subscription.currentPeriodEnd > now
    ) {
      periodStart = subscription.currentPeriodEnd;
    }

    const periodEnd = this.addMonths(periodStart, price.periodMonths);

    const payment = await this.prisma.subscriptionPayment.create({
      data: {
        organizationId: organization.id,

        subscriptionId: subscription.id,

        provider: dto.provider,

        amount: price.amount,

        currency: price.currency,

        status: 'PENDING',

        periodMonths: price.periodMonths,

        periodStart,

        periodEnd,
      },

      select: {
        id: true,

        provider: true,

        amount: true,

        currency: true,

        status: true,

        periodMonths: true,

        periodStart: true,

        periodEnd: true,

        checkoutUrl: true,

        createdAt: true,
      },
    });

    if (dto.provider === 'PAYMONGO') {
      if (price.currency !== 'PHP') {
        throw new BadRequestException(
          'PayMongo checkout requires PHP billing.',
        );
      }

      const webUrl =
        this.configService.get<string>('WEB_URL') ?? 'http://localhost:3000';

      /*
       * Decimal pesos -> centavos.
       *
       * PHP 499.00 -> 49900
       */
      const amountCentavos = price.amount
        .mul(100)
        .toDecimalPlaces(0)
        .toNumber();

      try {
        const checkout = await this.payMongoService.createCheckoutSession({
          paymentId: payment.id,
          organizationName: organization.name,
          amountCentavos,
          successUrl: `${webUrl}/settings?tab=subscription&payment=success`,
          cancelUrl: `${webUrl}/settings?tab=subscription&payment=cancelled`,
        });

        const updatedPayment = await this.prisma.subscriptionPayment.update({
          where: {
            id: payment.id,
          },

          data: {
            providerReference: checkout.sessionId,

            checkoutUrl: checkout.checkoutUrl,
          },

          select: {
            id: true,

            provider: true,

            providerReference: true,

            amount: true,

            currency: true,

            status: true,

            periodMonths: true,

            periodStart: true,

            periodEnd: true,

            checkoutUrl: true,

            createdAt: true,
          },
        });

        return {
          message: 'Subscription checkout created successfully.',

          payment: {
            ...updatedPayment,

            amount: updatedPayment.amount.toFixed(2),
          },
        };
      } catch (error) {
        await this.prisma.subscriptionPayment.update({
          where: {
            id: payment.id,
          },

          data: {
            status: 'FAILED',

            failedAt: new Date(),
          },
        });

        throw error;
      }
    }

    if (dto.provider === 'PAYPAL') {
      throw new BadRequestException('PayPal checkout is not available yet.');
    }

    return {
      message: 'Subscription checkout prepared successfully.',

      payment: {
        ...payment,

        amount: payment.amount.toFixed(2),
      },
    };
  }

  async handlePayMongoPaidWebhook(input: {
    subscriptionPaymentId: string;

    checkoutSessionId: string;

    paidAt: Date;
  }) {
    const { subscriptionPaymentId, checkoutSessionId, paidAt } = input;

    return this.prisma.$transaction(async (tx) => {
      const payment = await tx.subscriptionPayment.findUnique({
        where: {
          id: subscriptionPaymentId,
        },

        select: {
          id: true,
          provider: true,
          providerReference: true,
          subscriptionId: true,
          organizationId: true,
          status: true,
          periodStart: true,
          periodEnd: true,
        },
      });

      if (!payment) {
        throw new NotFoundException('Subscription payment not found.');
      }

      if (payment.provider !== 'PAYMONGO') {
        throw new BadRequestException('Invalid payment provider.');
      }

      if (
        payment.providerReference &&
        payment.providerReference !== checkoutSessionId
      ) {
        throw new BadRequestException(
          'PayMongo checkout session does not match.',
        );
      }

      /*
       * Webhook retry protection
       */
      if (payment.status === 'PAID') {
        return {
          processed: false,
          reason: 'already_paid',
        };
      }

      if (!payment.periodStart || !payment.periodEnd) {
        throw new BadRequestException(
          'Subscription payment period is missing.',
        );
      }

      await tx.subscriptionPayment.update({
        where: {
          id: payment.id,
        },

        data: {
          status: 'PAID',

          paidAt,

          providerReference: checkoutSessionId,

          failedAt: null,

          cancelledAt: null,
        },
      });

      await tx.subscription.update({
        where: {
          id: payment.subscriptionId,
        },

        data: {
          status: 'ACTIVE',

          currentPeriodStart: payment.periodStart,

          currentPeriodEnd: payment.periodEnd,

          cancelAtPeriodEnd: false,

          cancelledAt: null,
        },
      });

      return {
        processed: true,

        paymentId: payment.id,

        status: 'PAID',

        currentPeriodStart: payment.periodStart,

        currentPeriodEnd: payment.periodEnd,
      };
    });
  }

  async getPaymentHistory(organizationId: string) {
    const payments = await this.prisma.subscriptionPayment.findMany({
      where: {
        organizationId,
      },

      orderBy: {
        createdAt: 'desc',
      },

      select: {
        id: true,

        provider: true,

        providerReference: true,

        amount: true,

        currency: true,

        status: true,

        periodMonths: true,

        periodStart: true,

        periodEnd: true,

        paidAt: true,

        failedAt: true,

        cancelledAt: true,

        refundedAt: true,

        createdAt: true,
      },
    });

    return {
      payments: payments.map((payment) => ({
        ...payment,

        amount: payment.amount.toFixed(2),
      })),
    };
  }
}
