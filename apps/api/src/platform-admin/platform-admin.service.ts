import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

import type { ListPlatformTenantsQueryDto } from './dto/list-platform-tenants-query.dto';
import type { RenewPlatformTenantDto } from './dto/renew-platform-tenant.dto';
import { resolveSubscriptionState } from '../subscriptions/utils/subscription-state.util';

@Injectable()
export class PlatformAdminService {
  constructor(private readonly prisma: PrismaService) {}

  private async syncSubscriptionStates() {
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        status: {
          in: ['TRIALING', 'ACTIVE', 'PAST_DUE'],
        },
      },
    });

    for (const subscription of subscriptions) {
      const effective = resolveSubscriptionState(subscription);

      if (effective.status === subscription.status) {
        continue;
      }

      await this.prisma.subscription.updateMany({
        where: {
          id: subscription.id,

          status: subscription.status,
        },

        data: {
          status: effective.status,
        },
      });
    }
  }

  private getSubscriptionExpiry(
    subscription: {
      status: string;

      trialEndsAt: Date | null;

      currentPeriodEnd: Date | null;
    } | null,
  ) {
    if (!subscription) {
      return null;
    }

    if (subscription.status === 'TRIALING') {
      return subscription.trialEndsAt;
    }

    return subscription.currentPeriodEnd ?? subscription.trialEndsAt ?? null;
  }

  private getDaysUntil(date: Date | null) {
    if (!date) {
      return null;
    }

    const milliseconds = date.getTime() - Date.now();

    return Math.ceil(milliseconds / (1000 * 60 * 60 * 24));
  }

  private addMonths(date: Date, months: number) {
    const result = new Date(date);

    const originalDay = result.getDate();

    /*
     * Move temporarily to first day
     * so month overflow cannot happen.
     */
    result.setDate(1);

    result.setMonth(result.getMonth() + months);

    const lastDayOfTargetMonth = new Date(
      result.getFullYear(),
      result.getMonth() + 1,
      0,
    ).getDate();

    result.setDate(Math.min(originalDay, lastDayOfTargetMonth));

    return result;
  }

  async getDashboard() {
    await this.syncSubscriptionStates();

    const now = new Date();

    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalTenants,
      trialing,
      active,
      expired,
      pastDue,
      expiringSoon,
      newThisMonth,
      recentTenants,
    ] = await Promise.all([
      // All registered businesses
      this.prisma.organization.count(),

      // Currently on trial
      this.prisma.subscription.count({
        where: {
          status: 'TRIALING',
        },
      }),

      // Paying / renewed customers
      this.prisma.subscription.count({
        where: {
          status: 'ACTIVE',
        },
      }),

      // Already expired
      this.prisma.subscription.count({
        where: {
          status: 'EXPIRED',
        },
      }),

      // Payment / renewal issue
      this.prisma.subscription.count({
        where: {
          status: 'PAST_DUE',
        },
      }),

      // Trial or active subscription
      // ending within the next 7 days
      this.prisma.subscription.count({
        where: {
          OR: [
            {
              status: 'TRIALING',

              trialEndsAt: {
                gte: now,
                lte: sevenDaysFromNow,
              },
            },

            {
              status: 'ACTIVE',

              currentPeriodEnd: {
                gte: now,
                lte: sevenDaysFromNow,
              },
            },
          ],
        },
      }),

      // New businesses this month
      this.prisma.organization.count({
        where: {
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),

      // Latest registered businesses
      this.prisma.organization.findMany({
        orderBy: {
          createdAt: 'desc',
        },

        take: 8,

        select: {
          id: true,
          name: true,
          slug: true,
          businessType: true,
          createdAt: true,

          subscription: {
            select: {
              plan: true,
              status: true,
              trialStartedAt: true,
              trialEndsAt: true,
              currentPeriodStart: true,
              currentPeriodEnd: true,
            },
          },

          memberships: {
            where: {
              role: 'OWNER',
              isActive: true,
            },

            take: 1,

            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      stats: {
        totalTenants,
        trialing,
        active,
        expired,
        pastDue,
        expiringSoon,
        newThisMonth,
      },

      recentTenants: recentTenants.map((organization) => ({
        id: organization.id,

        name: organization.name,

        slug: organization.slug,

        businessType: organization.businessType,

        createdAt: organization.createdAt,

        owner: organization.memberships[0]?.user ?? null,

        subscription: organization.subscription,

        daysRemaining: this.getDaysRemaining(organization.subscription),
      })),
    };
  }

  private getDaysRemaining(
    subscription: {
      status: string;
      trialEndsAt: Date | null;
      currentPeriodEnd: Date | null;
    } | null,
  ) {
    if (!subscription) {
      return null;
    }

    let expiryDate: Date | null = null;

    if (subscription.status === 'TRIALING') {
      expiryDate = subscription.trialEndsAt;
    }

    if (subscription.status === 'ACTIVE') {
      expiryDate = subscription.currentPeriodEnd;
    }

    if (!expiryDate) {
      return null;
    }

    const milliseconds = expiryDate.getTime() - Date.now();

    return Math.ceil(milliseconds / (1000 * 60 * 60 * 24));
  }

  async getTenants(query: ListPlatformTenantsQueryDto) {
    await this.syncSubscriptionStates();

    const page = query.page || 1;

    const limit = query.limit || 20;

    const skip = (page - 1) * limit;

    const search = query.search?.trim();

    const where: Prisma.OrganizationWhereInput = {};

    if (search) {
      where.OR = [
        {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },

        {
          slug: {
            contains: search,
            mode: 'insensitive',
          },
        },

        {
          businessType: {
            contains: search,
            mode: 'insensitive',
          },
        },

        {
          memberships: {
            some: {
              role: 'OWNER',
              isActive: true,

              user: {
                OR: [
                  {
                    name: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },

                  {
                    email: {
                      contains: search,
                      mode: 'insensitive',
                    },
                  },
                ],
              },
            },
          },
        },
      ];
    }

    if (query.status) {
      where.subscription = {
        is: {
          status: query.status,
        },
      };
    }

    const [total, organizations] = await Promise.all([
      this.prisma.organization.count({
        where,
      }),

      this.prisma.organization.findMany({
        where,

        skip,
        take: limit,

        orderBy: {
          createdAt: 'desc',
        },

        select: {
          id: true,
          name: true,
          slug: true,
          businessType: true,
          createdAt: true,

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

          memberships: {
            where: {
              role: 'OWNER',
              isActive: true,
            },

            take: 1,

            orderBy: {
              joinedAt: 'asc',
            },

            select: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
            },
          },

          _count: {
            select: {
              memberships: true,
              customers: true,
              quotations: true,
              jobs: true,
              payments: true,
            },
          },
        },
      }),
    ]);

    const tenants = organizations.map((organization) => {
      const expiresAt = this.getSubscriptionExpiry(organization.subscription);

      return {
        id: organization.id,

        name: organization.name,

        slug: organization.slug,

        businessType: organization.businessType,

        createdAt: organization.createdAt,

        owner: organization.memberships[0]?.user ?? null,

        subscription: organization.subscription
          ? {
              ...organization.subscription,

              expiresAt,

              daysRemaining: this.getDaysUntil(expiresAt),
            }
          : null,

        usage: {
          members: organization._count.memberships,

          customers: organization._count.customers,

          quotations: organization._count.quotations,

          jobs: organization._count.jobs,

          payments: organization._count.payments,
        },
      };
    });

    const pages = Math.ceil(total / limit);

    return {
      tenants,

      pagination: {
        page,
        limit,
        total,
        pages,

        hasPreviousPage: page > 1,

        hasNextPage: page < pages,
      },
    };
  }

  async getTenant(id: string) {
    await this.syncSubscriptionStates();

    const organization = await this.prisma.organization.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        name: true,
        slug: true,
        businessType: true,

        email: true,
        phone: true,
        address: true,
        logoUrl: true,

        status: true,

        createdAt: true,
        updatedAt: true,

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

            createdAt: true,
            updatedAt: true,
          },
        },

        memberships: {
          where: {
            isActive: true,
          },

          orderBy: {
            joinedAt: 'asc',
          },

          select: {
            id: true,
            role: true,
            joinedAt: true,

            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                avatarUrl: true,
                status: true,
                lastLoginAt: true,
              },
            },
          },
        },

        _count: {
          select: {
            memberships: true,
            customers: true,
            quotations: true,
            jobs: true,
            payments: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Tenant not found.');
    }

    const expiresAt = this.getSubscriptionExpiry(organization.subscription);

    const owner =
      organization.memberships.find(
        (membership) => membership.role === 'OWNER',
      ) ?? null;

    return {
      id: organization.id,

      name: organization.name,
      slug: organization.slug,
      businessType: organization.businessType,

      email: organization.email,
      phone: organization.phone,
      address: organization.address,
      logoUrl: organization.logoUrl,

      status: organization.status,

      createdAt: organization.createdAt,

      updatedAt: organization.updatedAt,

      owner: owner?.user ?? null,

      subscription: organization.subscription
        ? {
            ...organization.subscription,

            expiresAt,

            daysRemaining: this.getDaysUntil(expiresAt),
          }
        : null,

      usage: {
        members: organization._count.memberships,

        customers: organization._count.customers,

        quotations: organization._count.quotations,

        jobs: organization._count.jobs,

        payments: organization._count.payments,
      },

      members: organization.memberships.map((membership) => ({
        id: membership.id,

        role: membership.role,

        joinedAt: membership.joinedAt,

        user: membership.user,
      })),
    };
  }

  async renewTenant(id: string, dto: RenewPlatformTenantDto) {
    const organization = await this.prisma.organization.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        name: true,

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

    if (!organization) {
      throw new NotFoundException('Tenant not found.');
    }

    const now = new Date();

    const subscription = organization.subscription;

    let periodStart = now;
    let periodEndBase = now;

    /*
     * Still on trial:
     * preserve remaining trial days.
     */
    if (subscription?.status === 'TRIALING' && subscription.trialEndsAt > now) {
      periodStart = subscription.trialEndsAt;

      periodEndBase = subscription.trialEndsAt;
    }

    /*
     * Active and not yet expired:
     * extend from existing expiry.
     */
    else if (
      subscription?.status === 'ACTIVE' &&
      subscription.currentPeriodEnd &&
      subscription.currentPeriodEnd > now
    ) {
      periodStart = subscription.currentPeriodStart ?? now;

      periodEndBase = subscription.currentPeriodEnd;
    }

    /*
     * Expired / cancelled /
     * past due / missing subscription.
     */
    else {
      periodStart = now;
      periodEndBase = now;
    }

    const newPeriodEnd = this.addMonths(periodEndBase, dto.durationMonths);

    const updatedOrganization = await this.prisma.organization.update({
      where: {
        id,
      },

      data: {
        subscription: {
          upsert: {
            /*
             * Normally this branch should not
             * happen because registration already
             * creates a subscription.
             *
             * But we keep it as a safe fallback.
             */
            create: {
              plan: 'STANDARD',
              status: 'ACTIVE',

              /*
               * Required by the current
               * Prisma schema.
               *
               * Since this is a direct paid
               * activation with no previous
               * subscription record, the
               * "trial" effectively ends now.
               */
              trialStartedAt: now,
              trialEndsAt: now,

              currentPeriodStart: periodStart,

              currentPeriodEnd: newPeriodEnd,

              cancelAtPeriodEnd: false,

              cancelledAt: null,
            },

            update: {
              status: 'ACTIVE',

              currentPeriodStart: periodStart,

              currentPeriodEnd: newPeriodEnd,

              cancelAtPeriodEnd: false,

              cancelledAt: null,
            },
          },
        },
      },

      select: {
        id: true,
        name: true,

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

            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    return {
      message: `${organization.name} subscription renewed successfully.`,

      tenant: {
        id: updatedOrganization.id,

        name: updatedOrganization.name,
      },

      subscription: updatedOrganization.subscription,
    };
  }
}
