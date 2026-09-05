import { createHash, randomBytes } from 'node:crypto';

import { mkdir, unlink, writeFile } from 'node:fs/promises';

import { dirname, resolve } from 'node:path';

import { parseArgs } from 'node:util';

import { NestFactory } from '@nestjs/core';

import { AppModule } from '../app.module';

import { PrismaService } from '../prisma/prisma.service';

/*
 * Every newly generated AppSumo code is
 * worth exactly one stacking unit.
 *
 * 1 redeemed code  -> Tier 1
 * 2 redeemed codes -> Tier 2
 * 3 redeemed codes -> Tier 3
 *
 * The existing tier column remains in the
 * database for backward compatibility with
 * codes that were generated before stacking.
 */
const BASE_CODE_TIER = 'TIER_1' as const;

type GeneratorOptions = {
  count: number;
  batchLabel: string;
  outputPath: string;
};

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

function hashCode(code: string) {
  return createHash('sha256').update(normalizeCode(code), 'utf8').digest('hex');
}

function createCode() {
  /*
   * 18 random bytes = 144 bits
   * of randomness.
   */
  const randomPart = randomBytes(18)
    .toString('hex')
    .toUpperCase()
    .match(/.{1,6}/g)
    ?.join('-');

  if (!randomPart) {
    throw new Error('Unable to generate AppSumo code.');
  }

  return `QUFO-AS-${randomPart}`;
}

function createCodeHint(code: string) {
  return `${code.slice(0, 7)}...${code.slice(-6)}`;
}

function escapeCsvValue(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function parseOptions(): GeneratorOptions {
  const { values } = parseArgs({
    options: {
      count: {
        type: 'string',
        default: '1',
      },

      batch: {
        type: 'string',
      },

      output: {
        type: 'string',
      },
    },
  });

  const count = Number(values.count);

  if (!Number.isInteger(count) || count < 1 || count > 10_000) {
    throw new Error('--count must be an integer between 1 and 10000.');
  }

  const batchLabel = values.batch?.trim();

  if (!batchLabel) {
    throw new Error('--batch is required.');
  }

  if (batchLabel.length > 100) {
    throw new Error('--batch must not exceed 100 characters.');
  }

  const output = values.output?.trim();

  if (!output) {
    throw new Error('--output is required.');
  }

  return {
    count,
    batchLabel,
    outputPath: resolve(process.cwd(), output),
  };
}

async function main() {
  const options = parseOptions();

  const codes = Array.from(
    {
      length: options.count,
    },

    () => createCode(),
  );

  /*
   * Ensure there are no duplicate
   * plaintext codes in this batch.
   */
  if (new Set(codes).size !== codes.length) {
    throw new Error('Duplicate codes were generated. Run the command again.');
  }

  const csvRows = [
    ['code', 'tier', 'batchLabel'],

    ...codes.map((code) => [code, BASE_CODE_TIER, options.batchLabel]),
  ];

  const csv = csvRows
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\n');

  await mkdir(dirname(options.outputPath), {
    recursive: true,
  });

  /*
   * "wx" refuses to overwrite an
   * existing file.
   */
  await writeFile(options.outputPath, `${csv}\n`, {
    encoding: 'utf8',
    flag: 'wx',
    mode: 0o600,
  });

  let application: Awaited<
    ReturnType<typeof NestFactory.createApplicationContext>
  > | null = null;

  try {
    application = await NestFactory.createApplicationContext(AppModule, {
      logger: ['error', 'warn'],
    });

    const prisma = application.get(PrismaService);

    await prisma.appSumoCode.createMany({
      data: codes.map((code) => ({
        codeHash: hashCode(code),
        codeHint: createCodeHint(code),
        tier: BASE_CODE_TIER,
        status: 'AVAILABLE' as const,
        batchLabel: options.batchLabel,
      })),
    });
  } catch (error) {
    /*
     * Remove the CSV if the database
     * insert failed. This prevents us
     * from keeping codes that cannot
     * actually be redeemed.
     */
    await unlink(options.outputPath).catch(() => undefined);

    throw error;
  } finally {
    if (application) {
      await application.close();
    }
  }

  console.log(
    [
      `Generated ${options.count} AppSumo stacking code(s).`,
      'Each code adds one tier, up to Tier 3.',
      `Stored tier value: ${BASE_CODE_TIER}`,
      `Batch: ${options.batchLabel}`,
      `CSV: ${options.outputPath}`,
      'Keep this CSV private. Plaintext codes cannot be recovered from the database.',
    ].join('\n'),
  );
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);

  process.exitCode = 1;
});
