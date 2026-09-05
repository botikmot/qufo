import { Injectable, Logger } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';

import { Cron } from '@nestjs/schedule';

import { PrismaService } from '../prisma/prisma.service';

import { UploadsService } from './uploads.service';

const DEFAULT_RETENTION_HOURS = 48;

const BATCH_SIZE = 100;

type OrphanAsset = {
  id: string;
  storageKey: string;
};

type ImageReference = {
  imageKey: string | null;
};

export type OrphanCleanupResult = {
  cutoff: Date;

  scanned: number;
  removed: number;
  referenced: number;
  failed: number;
};

@Injectable()
export class OrphanedUploadsCleanupService {
  private readonly logger = new Logger(OrphanedUploadsCleanupService.name);

  private running = false;

  constructor(
    private readonly prisma: PrismaService,

    private readonly configService: ConfigService,

    private readonly uploadsService: UploadsService,
  ) {}

  /*
   * Runs every day at 3:00 AM UTC.
   *
   * The running flag prevents another
   * cleanup from starting while the
   * previous run is still active.
   */
  @Cron('0 3 * * *', {
    name: 'orphaned-quotation-upload-cleanup',

    timeZone: 'UTC',
  })
  async handleScheduledCleanup(): Promise<void> {
    if (!this.cleanupEnabled || this.running) {
      return;
    }

    this.running = true;

    try {
      const result = await this.cleanup();

      if (result.removed > 0 || result.failed > 0) {
        this.logger.log(
          [
            'Orphan upload cleanup completed:',
            `scanned=${result.scanned}`,
            `removed=${result.removed}`,
            `referenced=${result.referenced}`,
            `failed=${result.failed}`,
          ].join(' '),
        );
      }
    } catch (error) {
      this.logger.error(
        'Orphan upload cleanup failed.',

        error instanceof Error ? error.stack : String(error),
      );
    } finally {
      this.running = false;
    }
  }

  /*
   * Public method so it can also be
   * triggered by an internal CLI tool.
   */
  async cleanup(): Promise<OrphanCleanupResult> {
    const cutoff = new Date(Date.now() - this.retentionHours * 60 * 60 * 1000);

    let lastId: string | null = null;

    let scanned = 0;

    let removed = 0;

    let referenced = 0;

    let failed = 0;

    while (true) {
      /*
       * Only quotation item uploads are
       * eligible for orphan cleanup.
       *
       * Business logos and quotation
       * signatures are never included.
       */
      const assets: OrphanAsset[] =
        await this.prisma.organizationStoredAsset.findMany({
          where: {
            kind: 'QUOTATION_ITEM',

            createdAt: {
              lte: cutoff,
            },

            ...(lastId
              ? {
                  id: {
                    gt: lastId,
                  },
                }
              : {}),
          },

          select: {
            id: true,
            storageKey: true,
          },

          orderBy: {
            id: 'asc',
          },

          take: BATCH_SIZE,
        });

      if (assets.length === 0) {
        break;
      }

      const finalAsset = assets.at(-1);

      if (!finalAsset) {
        break;
      }

      /*
       * Save the final ID before deleting
       * any asset. We use an ID range rather
       * than a Prisma cursor because a deleted
       * cursor record cannot be reused.
       */
      lastId = finalAsset.id;

      scanned += assets.length;

      const storageKeys: string[] = assets.map((asset) => asset.storageKey);

      /*
       * Find existing quotation and job
       * references in two batch queries.
       */
      const [quotationReferences, jobReferences]: [
        ImageReference[],
        ImageReference[],
      ] = await Promise.all([
        this.prisma.quotationItem.findMany({
          where: {
            imageKey: {
              in: storageKeys,
            },
          },

          select: {
            imageKey: true,
          },
        }),

        this.prisma.jobItem.findMany({
          where: {
            imageKey: {
              in: storageKeys,
            },
          },

          select: {
            imageKey: true,
          },
        }),
      ]);

      const referencedKeys = new Set<string>();

      for (const reference of [...quotationReferences, ...jobReferences]) {
        if (reference.imageKey) {
          referencedKeys.add(reference.imageKey);
        }
      }

      for (const asset of assets) {
        /*
         * Skip images already attached to
         * a quotation or job item.
         */
        if (referencedKeys.has(asset.storageKey)) {
          referenced += 1;

          continue;
        }

        /*
         * Check one more time immediately
         * before deletion.
         *
         * This reduces the possibility of
         * deleting an old upload that was
         * attached while cleanup was running.
         */
        const [quotationReference, jobReference] = await Promise.all([
          this.prisma.quotationItem.findFirst({
            where: {
              imageKey: asset.storageKey,
            },

            select: {
              id: true,
            },
          }),

          this.prisma.jobItem.findFirst({
            where: {
              imageKey: asset.storageKey,
            },

            select: {
              id: true,
            },
          }),
        ]);

        if (quotationReference || jobReference) {
          referenced += 1;

          continue;
        }

        try {
          /*
           * deleteImage() deletes the physical
           * object first, then removes the asset
           * ledger and releases its quota bytes.
           */
          await this.uploadsService.deleteImage(asset.storageKey);

          removed += 1;
        } catch (error) {
          failed += 1;

          this.logger.warn(
            [
              'Unable to delete orphan upload',
              `"${asset.storageKey}":`,
              error instanceof Error ? error.message : String(error),
            ].join(' '),
          );
        }
      }

      if (assets.length < BATCH_SIZE) {
        break;
      }
    }

    return {
      cutoff,
      scanned,
      removed,
      referenced,
      failed,
    };
  }

  private get cleanupEnabled(): boolean {
    const subscriptionsEnabled =
      this.configService
        .get<string>('SUBSCRIPTION_ENABLED')
        ?.trim()
        .toLowerCase() !== 'false';

    const cleanupEnabled =
      this.configService
        .get<string>('ORPHAN_UPLOAD_CLEANUP_ENABLED')
        ?.trim()
        .toLowerCase() !== 'false';

    return subscriptionsEnabled && cleanupEnabled;
  }

  private get retentionHours(): number {
    const configuredValue = this.configService.get<string>(
      'ORPHAN_UPLOAD_RETENTION_HOURS',
    );

    const configured = configuredValue ? Number(configuredValue) : Number.NaN;

    return Number.isFinite(configured) && configured >= 24
      ? configured
      : DEFAULT_RETENTION_HOURS;
  }
}
