import 'dotenv/config';

import { NestFactory } from '@nestjs/core';

import { AppModule } from '../app.module';
import { DealifyService } from '../dealify/dealify.service';

async function main() {
  const [, , action, rawCode] = process.argv;

  if (action !== 'revoke' && action !== 'refund') {
    throw new Error(
      'Usage: pnpm exec ts-node src/scripts/manage-dealify-code.ts revoke|refund CODE',
    );
  }

  if (!rawCode) {
    throw new Error('Dealify code is required.');
  }

  const targetStatus = action === 'revoke' ? 'REVOKED' : 'REFUNDED';

  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  try {
    const dealifyService = app.get(DealifyService);

    console.log('\n========================================');
    console.log('QUFO Dealify Code Manager');
    console.log('========================================');
    console.log(`Action: ${action.toUpperCase()}`);
    console.log(`Target status: ${targetStatus}`);

    const result = await dealifyService.deactivateCode(rawCode, targetStatus);

    console.log('\nOperation completed successfully.');
    console.log(`Code hint: ${result.codeHint}`);
    console.log(`Tier: ${result.tier}`);
    console.log(`Code status: ${result.codeStatus}`);
    console.log(`Organization: ${result.organizationId ?? 'none'}`);
    console.log(`Already processed: ${result.alreadyProcessed ? 'yes' : 'no'}`);

    if (result.subscription) {
      console.log('\nSubscription:');
      console.log(`Status: ${result.subscription.status}`);
      console.log(`Source: ${result.subscription.source}`);
      console.log(`Access type: ${result.subscription.accessType}`);
      console.log(`Dealify tier: ${result.subscription.dealifyTier ?? 'none'}`);
      console.log(
        `Dealify activated: ${
          result.subscription.dealifyActivatedAt
            ? result.subscription.dealifyActivatedAt.toISOString()
            : 'none'
        }`,
      );

      if ('cancelledAt' in result.subscription) {
        console.log(
          `Cancelled at: ${
            result.subscription.cancelledAt
              ? result.subscription.cancelledAt.toISOString()
              : 'none'
          }`,
        );
      }
    } else {
      console.log('\nSubscription: none');
    }
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error('\nOperation failed.');
  console.error(error);
  process.exitCode = 1;
});
