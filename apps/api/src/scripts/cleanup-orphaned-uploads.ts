import { NestFactory } from '@nestjs/core';

import { createInterface } from 'node:readline/promises';

import { stdin as input, stdout as output } from 'node:process';

import { AppModule } from '../app.module';

import { OrphanedUploadsCleanupService } from '../uploads/orphaned-uploads-cleanup.service';

async function main() {
  const terminal = createInterface({
    input,
    output,
  });

  let application: Awaited<
    ReturnType<typeof NestFactory.createApplicationContext>
  > | null = null;

  try {
    const confirmation = (
      await terminal.question(
        'Type CLEANUP to remove orphaned quotation uploads older than the retention period: ',
      )
    )
      .trim()
      .toUpperCase();

    if (confirmation !== 'CLEANUP') {
      console.log('Cleanup cancelled.');

      return;
    }

    application = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn'],
    });

    const cleanupService = application.get(OrphanedUploadsCleanupService);

    const result = await cleanupService.cleanup();

    console.log('');
    console.log('Orphan upload cleanup completed.');

    console.log(`Cutoff: ${result.cutoff.toISOString()}`);

    console.log(`Scanned: ${result.scanned}`);

    console.log(`Referenced: ${result.referenced}`);

    console.log(`Removed: ${result.removed}`);

    console.log(`Failed: ${result.failed}`);
  } finally {
    terminal.close();

    if (application) {
      await application.close();
    }
  }
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));

  process.exitCode = 1;
});
