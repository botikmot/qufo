import 'dotenv/config';

import { createHash, randomBytes } from 'node:crypto';
import { mkdir, rename, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { PrismaPg } from '@prisma/adapter-pg';

import {
  DealifyCodeStatus,
  DealifyTier,
  PrismaClient,
} from '../generated/prisma/client';

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

const DEFAULT_COUNT = 1000;

const OUTPUT_DIR = path.resolve(process.cwd(), 'generated/dealify');

const CODE_PREFIX = 'QUFO';

//const RANDOM_BYTES = 18;

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

function hashCode(code: string) {
  return createHash('sha256').update(code, 'utf8').digest('hex');
}

/**
 * Generates a cryptographically random
 * uppercase alphanumeric segment.
 *
 * Ambiguous characters are excluded:
 * I, O, 0, 1
 */
function randomSegment(length: number) {
  const bytes = randomBytes(length);

  let result = '';

  for (let index = 0; index < length; index += 1) {
    result += ALPHABET[bytes[index] % ALPHABET.length];
  }

  return result;
}

function generateCode() {
  return `${CODE_PREFIX}-${randomSegment(18)}`;
}

function parseCount(raw?: string) {
  if (!raw) {
    return DEFAULT_COUNT;
  }

  const count = Number(raw);

  if (!Number.isInteger(count) || count < 1 || count > 10000) {
    throw new Error('Count must be an integer between 1 and 10,000.');
  }

  return count;
}

function parseTier(raw?: string): DealifyTier {
  if (raw === 'TIER_2') {
    return DealifyTier.TIER_2;
  }

  if (raw === 'TIER_3') {
    return DealifyTier.TIER_3;
  }

  throw new Error('Tier must be TIER_2 or TIER_3.');
}

function csvEscape(value: string) {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replaceAll('"', '""')}"`;
  }

  return value;
}

async function generateTier(
  tier: DealifyTier,
  count: number,
  batchLabel: string,
) {
  console.log('');
  console.log(`Generating ${count} ${tier} codes...`);

  const rows: Array<{
    code: string;
    codeHash: string;
    codeHint: string;
  }> = [];

  const hashes = new Set<string>();

  while (rows.length < count) {
    const code = normalizeCode(generateCode());

    const codeHash = hashCode(code);

    /*
     * Protect against an extremely
     * unlikely collision inside this batch.
     */
    if (hashes.has(codeHash)) {
      continue;
    }

    /*
     * Also protect against a collision
     * with an existing database code.
     */
    const existing = await prisma.dealifyCode.findUnique({
      where: {
        codeHash,
      },

      select: {
        id: true,
      },
    });

    if (existing) {
      continue;
    }

    hashes.add(codeHash);

    rows.push({
      code,
      codeHash,
      codeHint: code.slice(-8),
    });

    if (rows.length % 100 === 0 || rows.length === count) {
      console.log(`Prepared ${rows.length}/${count}`);
    }
  }

  const timestamp = new Date()
    .toISOString()
    .replaceAll(':', '-')
    .replace(/\.\d{3}Z$/, 'Z');

  const tierNumber = tier === DealifyTier.TIER_2 ? '2' : '3';

  const baseName = `dealify-tier-${tierNumber}-${timestamp}`;

  const csvPath = path.join(OUTPUT_DIR, `${baseName}.csv`);

  const auditPath = path.join(OUTPUT_DIR, `${baseName}-audit.csv`);

  const csvTempPath = `${csvPath}.tmp`;

  const auditTempPath = `${auditPath}.tmp`;

  /*
   * Official Dealify CSV:
   *
   * one plaintext code per row
   * no header
   */
  const csvContent = rows.map((row) => row.code).join('\n') + '\n';

  /*
   * Private audit CSV:
   * no plaintext usable code.
   */
  const auditHeader = [
    'codeHash',
    'codeHint',
    'tier',
    'status',
    'batchLabel',
  ].join(',');

  const auditRows = rows.map((row) =>
    [
      csvEscape(row.codeHash),
      csvEscape(row.codeHint),
      tier,
      DealifyCodeStatus.AVAILABLE,
      csvEscape(batchLabel),
    ].join(','),
  );

  const auditContent = [auditHeader, ...auditRows, ''].join('\n');

  await mkdir(OUTPUT_DIR, {
    recursive: true,
  });

  /*
   * Write temporary files first.
   */
  await writeFile(csvTempPath, csvContent, {
    encoding: 'utf8',
    mode: 0o600,
  });

  await writeFile(auditTempPath, auditContent, {
    encoding: 'utf8',
    mode: 0o600,
  });

  try {
    /*
     * Create database records first.
     */
    await prisma.dealifyCode.createMany({
      data: rows.map((row) => ({
        codeHash: row.codeHash,
        codeHint: row.codeHint,
        tier,
        status: DealifyCodeStatus.AVAILABLE,
      })),
    });

    /*
     * Only expose the final CSV filenames
     * after DB insertion succeeds.
     */
    await rename(csvTempPath, csvPath);

    await rename(auditTempPath, auditPath);
  } catch (error) {
    /*
     * Best-effort cleanup.
     *
     * IMPORTANT:
     * If DB insertion succeeds but file rename
     * fails, we intentionally do NOT delete
     * database records automatically.
     *
     * This prevents accidental code loss.
     */
    await Promise.allSettled([unlink(csvTempPath), unlink(auditTempPath)]);

    throw error;
  }

  return {
    tier,
    count,
    csvPath,
    auditPath,
  };
}

async function main() {
  const [, , rawTier, rawCount] = process.argv;

  const tier = parseTier(rawTier);

  const count = parseCount(rawCount);

  const environment = process.env.NODE_ENV ?? 'development';

  console.log('');
  console.log('========================================');
  console.log('QUFO Dealify Production Code Generator');
  console.log('========================================');
  console.log(`Environment: ${environment}`);
  console.log(`Tier: ${tier}`);
  console.log(`Count: ${count}`);
  console.log('');

  if (
    environment === 'production' &&
    process.env.DEALIFY_CODE_GENERATION_APPROVED !== 'true'
  ) {
    throw new Error(
      'Production code generation is blocked. Set DEALIFY_CODE_GENERATION_APPROVED=true explicitly.',
    );
  }

  const batchLabel = `DEALIFY-${tier}-${new Date().toISOString()}`;

  const result = await generateTier(tier, count, batchLabel);

  console.log('');
  console.log('Generation completed successfully.');
  console.log(`Tier: ${result.tier}`);
  console.log(`Codes: ${result.count}`);
  console.log(`CSV: ${result.csvPath}`);
  console.log(`Audit: ${result.auditPath}`);
  console.log('');
}

main()
  .catch((error) => {
    console.error('');
    console.error('Code generation failed:');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
