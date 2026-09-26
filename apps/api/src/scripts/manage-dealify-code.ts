import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client';

import { createHash } from 'node:crypto';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured.');
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

function hashCode(code: string) {
  return createHash('sha256').update(code, 'utf8').digest('hex');
}

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

  const normalizedCode = normalizeCode(rawCode);

  const codeHash = hashCode(normalizedCode);

  const code = await prisma.dealifyCode.findUnique({
    where: {
      codeHash,
    },

    select: {
      id: true,
      codeHint: true,
      tier: true,
      status: true,
      organizationId: true,
    },
  });

  if (!code) {
    throw new Error('Dealify code not found.');
  }

  const targetStatus = action === 'revoke' ? 'REVOKED' : 'REFUNDED';

  console.log('\nDealify code');
  console.log(`Code hint: ${code.codeHint}`);
  console.log(`Tier: ${code.tier}`);
  console.log(`Current status: ${code.status}`);
  console.log(`Target status: ${targetStatus}`);
  console.log(`Organization: ${code.organizationId ?? 'none'}`);

  console.log(
    '\nNOTE: This script currently reads the code and should be wired to the DealifyService before production use.',
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
