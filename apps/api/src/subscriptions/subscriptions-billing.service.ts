import {
  BadGatewayException,
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
import { PayPalService } from './providers/paypal.service';
import { Prisma } from '../generated/prisma/client';
import { getAppSumoEntitlements } from './constants/appsumo-entitlements';

@Injectable()
export class SubscriptionsBillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pricingService: SubscriptionPricingService,
    private readonly payMongoService: PayMongoService,
    private readonly payPalService: PayPalService,
    private readonly configService: ConfigService,
  ) {}

  private readonly pendingCheckoutReuseMs = 30 * 60 * 1000; // 30 minutes

  private get subscriptionEnabled(): boolean {
    const value = this.configService.get<string>('SUBSCRIPTION_ENABLED');

    /*
     * Default ON for safety.
     *
     * Only an explicit false disables
     * SaaS subscription billing.
     */
    return value?.trim().toLowerCase() !== 'false';
  }

  private ensureSubscriptionEnabled(): void {
    if (!this.subscriptionEnabled) {
      throw new NotFoundException(
        'Subscription billing is not available in this deployment.',
      );
    }
  }

  private async findReusablePendingCheckout(input: {
    organizationId: string;

    provider: 'PAYMONGO' | 'PAYPAL';

    amount: Prisma.Decimal;

    currency: string;

    periodMonths: number;
  }) {
    const cutoff = new Date(Date.now() - this.pendingCheckoutReuseMs);

    return this.prisma.subscriptionPayment.findFirst({
      where: {
        organizationId: input.organizationId,

        provider: input.provider,

        status: 'PENDING',

        amount: input.amount,

        currency: input.currency,

        periodMonths: input.periodMonths,

        providerReference: {
          not: null,
        },

        checkoutUrl: {
          not: null,
        },

        createdAt: {
          gte: cutoff,
        },
      },

      orderBy: {
        createdAt: 'desc',
      },
    });
  }

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

  private addOneCalendarMonth(date: Date) {
    const result = new Date(date);

    const originalDay = result.getUTCDate();

    result.setUTCDate(1);

    result.setUTCMonth(result.getUTCMonth() + 1);

    const lastDay = new Date(
      Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0),
    ).getUTCDate();

    result.setUTCDate(Math.min(originalDay, lastDay));

    return result;
  }

  private resolveNextPaidPeriod(subscription: {
    trialEndsAt: Date;

    currentPeriodEnd: Date | null;
  }) {
    const now = new Date();

    let periodStart: Date;

    /*
     * If there is already a future
     * paid period, stack after it.
     */
    if (subscription.currentPeriodEnd && subscription.currentPeriodEnd > now) {
      periodStart = subscription.currentPeriodEnd;
    }

    /*
     * Otherwise preserve remaining
     * trial time.
     */
    else if (subscription.trialEndsAt > now) {
      periodStart = subscription.trialEndsAt;
    }

    /*
     * Expired / past due:
     * start immediately.
     */
    else {
      periodStart = now;
    }

    const periodEnd = this.addOneCalendarMonth(periodStart);

    return {
      periodStart,
      periodEnd,
    };
  }

  private async finalizePaidSubscriptionPayment(input: {
    paymentId: string;
    paidAt: Date;
  }) {
    const maxAttempts = 3;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            const payment = await tx.subscriptionPayment.findUnique({
              where: {
                id: input.paymentId,
              },

              select: {
                id: true,
                subscriptionId: true,
                status: true,
              },
            });

            if (!payment) {
              throw new NotFoundException('Subscription payment not found.');
            }

            /*
             * Webhook / browser retry safety.
             */
            if (payment.status === 'PAID') {
              return {
                processed: false,
                reason: 'already_paid',
                paymentId: payment.id,
              };
            }

            if (payment.status !== 'PENDING') {
              return {
                processed: false,
                reason: `payment_${payment.status.toLowerCase()}`,
                paymentId: payment.id,
              };
            }

            const subscription = await tx.subscription.findUnique({
              where: {
                id: payment.subscriptionId,
              },

              select: {
                id: true,
                trialEndsAt: true,
                currentPeriodStart: true,
                currentPeriodEnd: true,
              },
            });

            if (!subscription) {
              throw new NotFoundException('Subscription not found.');
            }

            /*
             * IMPORTANT:
             * Compute the credited month
             * from the LATEST subscription state.
             */
            const { periodStart, periodEnd } =
              this.resolveNextPaidPeriod(subscription);

            const claimed = await tx.subscriptionPayment.updateMany({
              where: {
                id: payment.id,
                status: 'PENDING',
              },

              data: {
                status: 'PAID',

                paidAt: input.paidAt,

                periodStart,
                periodEnd,

                failedAt: null,
                cancelledAt: null,
              },
            });

            if (claimed.count !== 1) {
              return {
                processed: false,
                reason: 'already_processed',
                paymentId: payment.id,
              };
            }

            /*
             * Preserve the beginning of the
             * existing paid subscription while
             * extending only its ending date.
             */
            const subscriptionPeriodStart =
              subscription.currentPeriodStart ?? periodStart;

            await tx.subscription.update({
              where: {
                id: payment.subscriptionId,
              },

              data: {
                status: 'ACTIVE',

                currentPeriodStart: subscriptionPeriodStart,

                currentPeriodEnd: periodEnd,

                cancelAtPeriodEnd: false,
                cancelledAt: null,
              },
            });

            return {
              processed: true,

              paymentId: payment.id,

              status: 'PAID',

              creditedPeriodStart: periodStart,

              creditedPeriodEnd: periodEnd,

              currentPeriodStart: subscriptionPeriodStart,

              currentPeriodEnd: periodEnd,
            };
          },
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          },
        );
      } catch (error) {
        const shouldRetry =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2034' &&
          attempt < maxAttempts - 1;

        if (shouldRetry) {
          continue;
        }

        throw error;
      }
    }

    throw new BadGatewayException('Unable to finalize subscription payment.');
  }

  async handlePayPalOrderApprovedWebhook(orderId: string) {
    this.ensureSubscriptionEnabled();

    const payment = await this.prisma.subscriptionPayment.findFirst({
      where: {
        provider: 'PAYPAL',

        providerReference: orderId,
      },

      select: {
        id: true,
        organizationId: true,
        status: true,
      },
    });

    if (!payment) {
      console.warn(
        '[PayPal Webhook] No SubscriptionPayment for order:',
        orderId,
      );

      return {
        processed: false,
        reason: 'payment_not_found',
      };
    }

    if (payment.status === 'PAID') {
      return {
        processed: false,
        reason: 'already_paid',
      };
    }

    /*
     * Reuse our existing secure capture flow.
     *
     * This means even if the customer closes
     * their browser, webhook can capture it.
     */
    return this.capturePayPalOrder(payment.organizationId, orderId);
  }

  async handlePayPalCaptureCompletedWebhook(input: {
    orderId: string;

    captureId: string;

    amount: string;

    currency: string;

    paidAt: Date;
  }) {
    this.ensureSubscriptionEnabled();

    const payment = await this.prisma.subscriptionPayment.findFirst({
      where: {
        provider: 'PAYPAL',

        providerReference: input.orderId,
      },

      select: {
        id: true,
        amount: true,
        currency: true,
        status: true,
      },
    });

    if (!payment) {
      console.warn(
        '[PayPal Webhook] Payment not found for completed capture:',
        input.orderId,
      );

      return {
        processed: false,
        reason: 'payment_not_found',
      };
    }

    if (payment.status === 'PAID') {
      return {
        processed: false,
        reason: 'already_paid',
        paymentId: payment.id,
      };
    }

    /*
     * Verify amount.
     */
    const expectedAmount = new Prisma.Decimal(payment.amount);

    const receivedAmount = new Prisma.Decimal(input.amount);

    if (!expectedAmount.equals(receivedAmount)) {
      throw new BadGatewayException('PayPal webhook amount does not match.');
    }

    /*
     * Verify currency.
     */
    if (payment.currency.toUpperCase() !== input.currency.toUpperCase()) {
      throw new BadGatewayException('PayPal webhook currency does not match.');
    }

    const result = await this.finalizePaidSubscriptionPayment({
      paymentId: payment.id,

      paidAt: input.paidAt,
    });

    return {
      ...result,

      captureId: input.captureId,
    };
  }

  async handlePayPalCaptureDeniedWebhook(orderId: string) {
    this.ensureSubscriptionEnabled();

    const result = await this.prisma.subscriptionPayment.updateMany({
      where: {
        provider: 'PAYPAL',

        providerReference: orderId,

        status: 'PENDING',
      },

      data: {
        status: 'FAILED',

        failedAt: new Date(),
      },
    });

    return {
      processed: result.count > 0,
    };
  }

  async getBillingSummary(tenant: TenantContext) {
    this.ensureSubscriptionEnabled();

    const now = new Date();

    const customerEmailPeriodStart = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );

    const customerEmailResetsAt = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
    );

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

            source: true,
            accessType: true,
            appSumoTier: true,
            appSumoActivatedAt: true,

            trialStartedAt: true,
            trialEndsAt: true,

            currentPeriodStart: true,
            currentPeriodEnd: true,

            cancelAtPeriodEnd: true,
            cancelledAt: true,
          },
        },
        customerEmailUsages: {
          where: {
            periodStart: customerEmailPeriodStart,
          },

          take: 1,

          select: {
            customerEmailsSent: true,
          },
        },
        storageUsage: {
          select: {
            bytesUsed: true,
          },
        },
      },
    });

    if (!organization || !organization.subscription) {
      throw new NotFoundException('Subscription not found.');
    }

    const subscription = organization.subscription;

    const effective = resolveSubscriptionState(subscription);

    const entitlements =
      subscription.source === 'APPSUMO' &&
      subscription.accessType === 'LIFETIME' &&
      subscription.appSumoTier
        ? getAppSumoEntitlements(subscription.appSumoTier)
        : null;

    const customerEmailsUsed =
      organization.customerEmailUsages[0]?.customerEmailsSent ?? 0;

    const customerEmailUsage = entitlements
      ? {
          used: customerEmailsUsed,

          limit: entitlements.monthlyCustomerEmailLimit,

          remaining: Math.max(
            0,

            entitlements.monthlyCustomerEmailLimit - customerEmailsUsed,
          ),

          periodStart: customerEmailPeriodStart,

          resetsAt: customerEmailResetsAt,
        }
      : null;

    const storageBytesUsed = Number(organization.storageUsage?.bytesUsed ?? 0n);

    const storageUsage = entitlements
      ? {
          usedBytes: storageBytesUsed,

          limitBytes: entitlements.maxStorageBytes,

          remainingBytes: Math.max(
            0,

            entitlements.maxStorageBytes - storageBytesUsed,
          ),

          percentageUsed: Math.min(
            100,

            entitlements.maxStorageBytes > 0
              ? (storageBytesUsed / entitlements.maxStorageBytes) * 100
              : 0,
          ),
        }
      : null;

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

      entitlements,
      customerEmailUsage,
      storageUsage,

      pricing: {
        plan: price.plan,

        amount: price.amount.toFixed(2),

        currency: price.currency,

        periodMonths: price.periodMonths,
      },

      /*
       * Lifetime customers must not
       * see recurring renewal actions.
       */
      canRenew:
        subscription.accessType === 'RECURRING' &&
        ['TRIALING', 'ACTIVE', 'PAST_DUE', 'EXPIRED'].includes(
          effective.status,
        ),
    };
  }

  async createCheckout(
    tenant: TenantContext,
    dto: CreateSubscriptionCheckoutDto,
  ) {
    this.ensureSubscriptionEnabled();
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

            source: true,
            accessType: true,
            appSumoTier: true,
            appSumoActivatedAt: true,

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

    if (
      subscription.accessType === 'LIFETIME' &&
      subscription.status === 'ACTIVE'
    ) {
      throw new BadRequestException(
        'This workspace already has active lifetime access.',
      );
    }

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

    const reusablePayment = await this.findReusablePendingCheckout({
      organizationId: organization.id,

      provider: dto.provider,

      amount: price.amount,

      currency: price.currency,

      periodMonths: price.periodMonths,
    });

    if (reusablePayment) {
      return {
        message: 'Existing subscription checkout reused.',

        reused: true,

        payment: {
          ...reusablePayment,

          amount: reusablePayment.amount.toFixed(2),
        },
      };
    }

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
      if (price.currency !== 'USD') {
        throw new BadRequestException(
          'PayPal is only available for international USD subscription billing.',
        );
      }

      try {
        const webUrl = this.configService.getOrThrow<string>('WEB_URL');

        const paypal = await this.payPalService.createOrder({
          paymentId: payment.id,

          organizationName: organization.name,

          amount: payment.amount.toFixed(2),

          currency: 'USD',

          returnUrl: `${webUrl}/settings?tab=subscription&payment=paypal-return`,

          cancelUrl: `${webUrl}/settings?tab=subscription&payment=cancelled`,
        });

        const updated = await this.prisma.subscriptionPayment.update({
          where: {
            id: payment.id,
          },

          data: {
            providerReference: paypal.orderId,

            checkoutUrl: paypal.approvalUrl,
          },
        });

        return {
          message: 'Subscription checkout created successfully.',

          payment: {
            ...updated,

            amount: updated.amount.toFixed(2),
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
    this.ensureSubscriptionEnabled();
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
    this.ensureSubscriptionEnabled();
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

  async capturePayPalOrder(organizationId: string, orderId: string) {
    this.ensureSubscriptionEnabled();
    /*
     * --------------------------------------------------
     * 1. Find the QUFO SubscriptionPayment
     * --------------------------------------------------
     */

    const payment = await this.prisma.subscriptionPayment.findFirst({
      where: {
        organizationId,

        provider: 'PAYPAL',

        providerReference: orderId,
      },

      select: {
        id: true,

        subscriptionId: true,

        organizationId: true,

        provider: true,

        providerReference: true,

        amount: true,

        currency: true,

        status: true,

        paidAt: true,
      },
    });

    if (!payment) {
      throw new NotFoundException('PayPal subscription payment not found.');
    }

    /*
     * --------------------------------------------------
     * 2. Idempotency
     *
     * If the browser refreshes after payment,
     * do NOT capture / credit another month.
     * --------------------------------------------------
     */

    if (payment.status === 'PAID') {
      return {
        processed: false,

        reason: 'already_paid',

        paymentId: payment.id,
      };
    }

    if (payment.status !== 'PENDING') {
      throw new BadRequestException(
        'This subscription payment cannot be captured.',
      );
    }

    /*
     * --------------------------------------------------
     * 3. Capture the approved PayPal order
     * --------------------------------------------------
     */

    const capture = await this.payPalService.captureOrder(orderId, payment.id);

    if (capture.status !== 'COMPLETED') {
      throw new BadGatewayException(
        `PayPal capture was not completed. Status: ${capture.status}`,
      );
    }

    /*
     * --------------------------------------------------
     * 4. Find the completed capture
     * --------------------------------------------------
     */

    const purchaseUnit = capture.purchase_units?.find(
      (unit) => unit.reference_id === payment.id,
    );

    if (!purchaseUnit) {
      throw new BadGatewayException(
        'PayPal purchase unit does not match the subscription payment.',
      );
    }

    const capturedPayment = purchaseUnit.payments?.captures?.find(
      (item) => item.status === 'COMPLETED',
    );

    if (!capturedPayment) {
      throw new BadGatewayException('Completed PayPal capture was not found.');
    }

    /*
     * --------------------------------------------------
     * 5. Verify captured amount + currency
     *
     * Never trust payment amount from browser.
     * Compare PayPal against QUFO's stored record.
     * --------------------------------------------------
     */

    const capturedAmount = capturedPayment.amount;

    if (!capturedAmount) {
      throw new BadGatewayException('PayPal capture amount is missing.');
    }

    if (
      capturedAmount.currency_code.toUpperCase() !==
      payment.currency.toUpperCase()
    ) {
      throw new BadGatewayException('PayPal capture currency does not match.');
    }

    const expectedAmount = new Prisma.Decimal(payment.amount);

    const actualAmount = new Prisma.Decimal(capturedAmount.value);

    if (!expectedAmount.equals(actualAmount)) {
      throw new BadGatewayException('PayPal capture amount does not match.');
    }

    /*
     * --------------------------------------------------
     * 6. Resolve actual PayPal paid timestamp
     * --------------------------------------------------
     */

    const paidAtValue =
      capturedPayment.update_time ?? capturedPayment.create_time;

    const paidAt = paidAtValue ? new Date(paidAtValue) : new Date();

    /*
     * --------------------------------------------------
     * 7. Finalize payment + subscription
     *
     * IMPORTANT:
     *
     * We calculate the subscription period HERE,
     * not when the checkout was created.
     *
     * Therefore:
     *
     * Payment #1
     * Sep 25 → Oct 25
     *
     * Payment #2
     * Oct 25 → Nov 25
     *
     * Payment #3
     * Nov 25 → Dec 25
     *
     * even if those checkout rows were originally
     * created with an older/stale period.
     * --------------------------------------------------
     */

    const maxAttempts = 3;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            /*
             * Re-read payment INSIDE transaction.
             *
             * Another request may already have
             * processed it after our initial query.
             */
            const latestPayment = await tx.subscriptionPayment.findUnique({
              where: {
                id: payment.id,
              },

              select: {
                id: true,

                subscriptionId: true,

                status: true,
              },
            });

            if (!latestPayment) {
              throw new NotFoundException('Subscription payment not found.');
            }

            if (latestPayment.status === 'PAID') {
              return {
                processed: false,

                reason: 'already_paid',

                paymentId: latestPayment.id,
              };
            }

            if (latestPayment.status !== 'PENDING') {
              throw new BadRequestException(
                'This subscription payment can no longer be processed.',
              );
            }

            /*
             * Read the LATEST subscription state.
             *
             * This is what fixes the multiple-renewal bug.
             */
            const subscription = await tx.subscription.findUnique({
              where: {
                id: latestPayment.subscriptionId,
              },

              select: {
                id: true,

                status: true,

                trialEndsAt: true,

                currentPeriodStart: true,

                currentPeriodEnd: true,
              },
            });

            if (!subscription) {
              throw new NotFoundException('Subscription not found.');
            }

            /*
             * Determine where THIS paid month
             * should actually begin.
             */
            const { periodStart, periodEnd } =
              this.resolveNextPaidPeriod(subscription);

            /*
             * Claim this payment.
             *
             * Only a PENDING row can become PAID.
             */
            const claimedPayment = await tx.subscriptionPayment.updateMany({
              where: {
                id: latestPayment.id,

                status: 'PENDING',
              },

              data: {
                status: 'PAID',

                paidAt,

                /*
                 * Replace stale reserved period
                 * with the ACTUAL credited period.
                 */
                periodStart,

                periodEnd,

                failedAt: null,

                cancelledAt: null,
              },
            });

            if (claimedPayment.count !== 1) {
              return {
                processed: false,

                reason: 'already_processed',

                paymentId: latestPayment.id,
              };
            }

            /*
             * Keep the ORIGINAL paid-period start
             * if there is already an active paid
             * subscription.
             *
             * Example:
             *
             * Existing:
             * Sep 25 → Oct 25
             *
             * Renew:
             * Oct 25 → Nov 25
             *
             * Subscription becomes:
             * currentPeriodStart = Sep 25
             * currentPeriodEnd   = Nov 25
             *
             * This is more accurate than changing
             * currentPeriodStart to Oct 25.
             */
            const subscriptionPeriodStart =
              subscription.currentPeriodStart ?? periodStart;

            await tx.subscription.update({
              where: {
                id: latestPayment.subscriptionId,
              },

              data: {
                status: 'ACTIVE',

                currentPeriodStart: subscriptionPeriodStart,

                currentPeriodEnd: periodEnd,

                cancelAtPeriodEnd: false,

                cancelledAt: null,
              },
            });

            return {
              processed: true,

              paymentId: latestPayment.id,

              status: 'PAID',

              captureId: capturedPayment.id,

              paidAt,

              creditedPeriodStart: periodStart,

              creditedPeriodEnd: periodEnd,

              currentPeriodStart: subscriptionPeriodStart,

              currentPeriodEnd: periodEnd,
            };
          },

          /*
           * Prevent two simultaneous successful
           * renewals from reading the same
           * currentPeriodEnd and crediting the
           * same month.
           */
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          },
        );
      } catch (error) {
        /*
         * Prisma P2034 =
         * transaction conflict / deadlock.
         *
         * Retry because another renewal may
         * have extended the subscription first.
         */
        const shouldRetry =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2034' &&
          attempt < maxAttempts - 1;

        if (shouldRetry) {
          continue;
        }

        throw error;
      }
    }

    throw new BadGatewayException(
      'Unable to finalize PayPal subscription payment.',
    );
  }
}
