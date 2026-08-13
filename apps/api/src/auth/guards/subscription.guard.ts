import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

import type { AuthenticatedRequest } from '../types/authenticated-request.type';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
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

    const now = new Date();

    /*
     * Free trial
     */
    if (subscription.status === 'TRIALING') {
      if (subscription.trialEndsAt > now) {
        return true;
      }

      await this.prisma.subscription.updateMany({
        where: {
          organizationId: tenant.organizationId,

          status: 'TRIALING',
        },

        data: {
          status: 'EXPIRED',
        },
      });

      subscription.status = 'EXPIRED';

      this.throwSubscriptionRequired(
        'Your QUFO free trial has ended. Subscribe to continue making changes.',
      );
    }

    /*
     * Paid subscription
     */
    if (subscription.status === 'ACTIVE') {
      if (
        subscription.currentPeriodEnd &&
        subscription.currentPeriodEnd < now
      ) {
        await this.prisma.subscription.updateMany({
          where: {
            organizationId: tenant.organizationId,

            status: 'ACTIVE',
          },

          data: {
            status: 'PAST_DUE',
          },
        });

        subscription.status = 'PAST_DUE';

        this.throwSubscriptionRequired('Your subscription requires renewal.');
      }

      return true;
    }

    this.throwSubscriptionRequired(
      'This workspace is currently read-only. An active subscription is required to make changes.',
    );
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
