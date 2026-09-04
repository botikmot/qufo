import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  PayloadTooLargeException,
} from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { Prisma } from '../generated/prisma/client';

import type { WorkspaceAssetKind } from '../generated/prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { getAppSumoEntitlements } from '../subscriptions/constants/appsumo-entitlements';

export type StorageReservation =
  | {
      tracked: false;
    }
  | {
      tracked: true;

      organizationId: string;

      reservedBytes: bigint;

      limitBytes: bigint | null;
    };

@Injectable()
export class WorkspaceStorageService {
  constructor(
    private readonly prisma: PrismaService,

    private readonly configService: ConfigService,
  ) {}

  async reserve(
    organizationId: string,
    requestedByteSize: number,
  ): Promise<StorageReservation> {
    /*
     * Self-hosted installations do
     * not use SaaS storage quotas.
     */
    if (!this.trackingEnabled) {
      return {
        tracked: false,
      };
    }

    if (!Number.isSafeInteger(requestedByteSize) || requestedByteSize <= 0) {
      throw new BadRequestException('Invalid upload size.');
    }

    const requestedBytes = BigInt(requestedByteSize);

    return this.runSerializable(async (tx) => {
      const organization = await tx.organization.findUnique({
        where: {
          id: organizationId,
        },

        select: {
          subscription: {
            select: {
              source: true,

              accessType: true,

              status: true,

              appSumoTier: true,
            },
          },
        },
      });

      if (!organization) {
        throw new NotFoundException('Organization not found.');
      }

      const subscription = organization.subscription;

      let limitBytes: bigint | null = null;

      if (subscription?.source === 'APPSUMO') {
        if (
          subscription.accessType !== 'LIFETIME' ||
          subscription.status !== 'ACTIVE' ||
          !subscription.appSumoTier
        ) {
          throw new ForbiddenException('AppSumo lifetime access is inactive.');
        }

        const entitlements = getAppSumoEntitlements(subscription.appSumoTier);

        limitBytes = BigInt(entitlements.maxStorageBytes);
      }

      const usage = await tx.organizationStorageUsage.upsert({
        where: {
          organizationId,
        },

        create: {
          organizationId,

          bytesUsed: 0n,
        },

        update: {},

        select: {
          id: true,

          bytesUsed: true,
        },
      });

      /*
       * Direct recurring subscriptions
       * are tracked but currently have
       * no AppSumo storage limit.
       */
      if (limitBytes === null) {
        await tx.organizationStorageUsage.update({
          where: {
            id: usage.id,
          },

          data: {
            bytesUsed: {
              increment: requestedBytes,
            },
          },
        });

        return {
          tracked: true,

          organizationId,

          reservedBytes: requestedBytes,

          limitBytes: null,
        };
      }

      if (requestedBytes > limitBytes) {
        throw this.createLimitError(usage.bytesUsed, limitBytes);
      }

      const maximumCurrentUsage = limitBytes - requestedBytes;

      /*
       * Conditional increment prevents
       * concurrent uploads from exceeding
       * the lifetime tier allowance.
       */
      const claimed = await tx.organizationStorageUsage.updateMany({
        where: {
          id: usage.id,

          bytesUsed: {
            lte: maximumCurrentUsage,
          },
        },

        data: {
          bytesUsed: {
            increment: requestedBytes,
          },
        },
      });

      if (claimed.count !== 1) {
        const latest = await tx.organizationStorageUsage.findUniqueOrThrow({
          where: {
            id: usage.id,
          },

          select: {
            bytesUsed: true,
          },
        });

        throw this.createLimitError(latest.bytesUsed, limitBytes);
      }

      return {
        tracked: true,

        organizationId,

        reservedBytes: requestedBytes,

        limitBytes,
      };
    });
  }

  async finalize(
    reservation: StorageReservation,

    storageKey: string,

    actualByteSize: number,

    kind: WorkspaceAssetKind,
  ) {
    if (!reservation.tracked) {
      return;
    }

    if (
      !storageKey ||
      !Number.isSafeInteger(actualByteSize) ||
      actualByteSize <= 0
    ) {
      throw new BadRequestException('Invalid stored asset.');
    }

    const actualBytes = BigInt(actualByteSize);

    const difference = actualBytes - reservation.reservedBytes;

    await this.runSerializable(async (tx) => {
      if (difference > 0n) {
        if (reservation.limitBytes === null) {
          await tx.organizationStorageUsage.update({
            where: {
              organizationId: reservation.organizationId,
            },

            data: {
              bytesUsed: {
                increment: difference,
              },
            },
          });
        } else {
          const maximumCurrentUsage = reservation.limitBytes - difference;

          const adjusted = await tx.organizationStorageUsage.updateMany({
            where: {
              organizationId: reservation.organizationId,

              bytesUsed: {
                lte: maximumCurrentUsage,
              },
            },

            data: {
              bytesUsed: {
                increment: difference,
              },
            },
          });

          if (adjusted.count !== 1) {
            const usage = await tx.organizationStorageUsage.findUniqueOrThrow({
              where: {
                organizationId: reservation.organizationId,
              },

              select: {
                bytesUsed: true,
              },
            });

            throw this.createLimitError(
              usage.bytesUsed,
              reservation.limitBytes,
            );
          }
        }
      } else if (difference < 0n) {
        await tx.organizationStorageUsage.update({
          where: {
            organizationId: reservation.organizationId,
          },

          data: {
            bytesUsed: {
              decrement: -difference,
            },
          },
        });
      }

      await tx.organizationStoredAsset.create({
        data: {
          organizationId: reservation.organizationId,

          storageKey,

          kind,

          byteSize: actualBytes,
        },
      });
    });
  }

  async releaseReservation(reservation: StorageReservation) {
    if (!reservation.tracked) {
      return;
    }

    await this.prisma.organizationStorageUsage.updateMany({
      where: {
        organizationId: reservation.organizationId,

        bytesUsed: {
          gte: reservation.reservedBytes,
        },
      },

      data: {
        bytesUsed: {
          decrement: reservation.reservedBytes,
        },
      },
    });
  }

  async releaseAsset(storageKey: string) {
    if (!this.trackingEnabled || !storageKey) {
      return;
    }

    await this.runSerializable(async (tx) => {
      const asset = await tx.organizationStoredAsset.findUnique({
        where: {
          storageKey,
        },
      });

      /*
       * Profile photos and legacy
       * assets are not registered.
       */
      if (!asset) {
        return;
      }

      await tx.organizationStoredAsset.delete({
        where: {
          id: asset.id,
        },
      });

      await tx.organizationStorageUsage.updateMany({
        where: {
          organizationId: asset.organizationId,

          bytesUsed: {
            gte: asset.byteSize,
          },
        },

        data: {
          bytesUsed: {
            decrement: asset.byteSize,
          },
        },
      });
    });
  }

  private get trackingEnabled() {
    /*
     * Same secure default as the
     * SubscriptionGuard.
     */
    return (
      this.configService
        .get<string>('SUBSCRIPTION_ENABLED')
        ?.trim()
        .toLowerCase() !== 'false'
    );
  }

  private createLimitError(usedBytes: bigint, limitBytes: bigint) {
    return new PayloadTooLargeException({
      statusCode: 413,

      code: 'STORAGE_LIMIT_REACHED',

      message: 'Your workspace storage limit has been reached.',

      storage: {
        usedBytes: Number(usedBytes),

        limitBytes: Number(limitBytes),
      },
    });
  }

  private async runSerializable<T>(
    operation: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    const maxAttempts = 3;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      try {
        return await this.prisma.$transaction(operation, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });
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

    throw new Error('Storage transaction failed.');
  }
}
