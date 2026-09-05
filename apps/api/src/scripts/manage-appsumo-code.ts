import { NestFactory } from '@nestjs/core';

import { createInterface } from 'node:readline/promises';

import { stdin as input, stdout as output } from 'node:process';

import { AppModule } from '../app.module';

import { AppSumoService } from '../appsumo/appsumo.service';

async function main() {
  const terminal = createInterface({
    input,
    output,
  });

  let application: Awaited<
    ReturnType<typeof NestFactory.createApplicationContext>
  > | null = null;

  try {
    const actionInput = (await terminal.question('Action (refund/revoke): '))
      .trim()
      .toLowerCase();

    const targetStatus: 'REFUNDED' | 'REVOKED' | null =
      actionInput === 'refund'
        ? 'REFUNDED'
        : actionInput === 'revoke'
          ? 'REVOKED'
          : null;

    if (!targetStatus) {
      throw new Error('Action must be either "refund" or "revoke".');
    }

    const code = (await terminal.question('AppSumo code: ')).trim();

    if (!code) {
      throw new Error('AppSumo code is required.');
    }

    const confirmation = (
      await terminal.question(`Type ${targetStatus} to confirm: `)
    )
      .trim()
      .toUpperCase();

    if (confirmation !== targetStatus) {
      console.log('Operation cancelled.');

      return;
    }

    application = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn'],
    });

    const appSumoService = application.get(AppSumoService);

    const result = await appSumoService.deactivateCode(code, targetStatus);

    console.log('');
    console.log(result.message);
    console.log(`Code: ${result.codeHint}`);
    console.log(`Status: ${result.codeStatus}`);

    if (result.organizationId) {
      console.log(`Organization: ${result.organizationId}`);
    }

    if (result.subscription) {
      console.log(`Subscription: ${result.subscription.status}`);

      console.log(
        `Remaining tier: ${result.subscription.appSumoTier ?? 'NONE'}`,
      );
    }
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
