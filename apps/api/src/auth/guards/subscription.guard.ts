import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../prisma/prisma.service';

import { resolveSubscriptionState } from '../../subscriptions/utils/subscription-state.util';

import type { AuthenticatedRequest } from '../types/authenticated-request.type';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    /*
     * Self-hosted / perpetual deployments
     * do not use QUFO subscription billing.
     *
     * IMPORTANT:
     * Missing SUBSCRIPTION_ENABLED defaults
     * to enabled so SaaS billing can never be
     * accidentally bypassed.
     */
    if (!this.subscriptionEnabled) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    /*
     * Expired workspaces remain readable.
     */
    if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
      return true;
    }

    const tenant = request.tenant;

    if (!tenant) {
      throw new ForbiddenException('Organization context is required.');
    }

    const subscription = tenant.subscription;

    if (!subscription) {
      this.throwSubscriptionRequired(
        'This organization does not have an active subscription.',
      );
    }

    const effective = resolveSubscriptionState(subscription);

    /*
     * Persist state transitions
     * only when a protected write
     * request discovers that the
     * stored status is stale.
     */
    if (effective.status !== subscription.status) {
      await this.prisma.subscription.updateMany({
        where: {
          organizationId: tenant.organizationId,

          status: subscription.status,
        },

        data: {
          status: effective.status,
        },
      });

      subscription.status = effective.status;
    }

    /*
     * Usable subscriptions.
     */
    if (effective.status === 'TRIALING' || effective.status === 'ACTIVE') {
      return true;
    }

    /*
     * Trial ended.
     */
    if (effective.status === 'EXPIRED') {
      this.throwSubscriptionRequired(
        'Your QUFO access has expired. Renew your subscription to continue making changes.',
      );
    }

    /*
     * Paid subscription requires
     * renewal.
     */
    if (effective.status === 'PAST_DUE') {
      this.throwSubscriptionRequired('Your subscription requires renewal.');
    }

    /*
     * CANCELLED or any other
     * non-usable subscription
     * state.
     */
    this.throwSubscriptionRequired(
      'This workspace is currently read-only. An active subscription is required to make changes.',
    );
  }

  private get subscriptionEnabled(): boolean {
    const value = this.configService.get<string>('SUBSCRIPTION_ENABLED');

    /*
     * Default ON.
     *
     * Only an explicit "false"
     * disables subscription enforcement.
     */
    return value?.trim().toLowerCase() !== 'false';
  }

  private throwSubscriptionRequired(message: string): never {
    throw new HttpException(
      {
        statusCode: HttpStatus.PAYMENT_REQUIRED,

        code: 'SUBSCRIPTION_REQUIRED',

        message,
      },

      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}
