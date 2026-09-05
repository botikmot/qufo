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
 * codes generated before stacking.
 */
const BASE_CODE_TIER = 'TIER_1' as const;

const MIN_APPSUMO_CODES = 100;

const MAX_APPSUMO_CODES = 10_000;

type GeneratorOptions = {
  count: number;

  batchLabel: string;

  /*
   * AppSumo-ready CSV containing only
   * one code per row with no header.
   */
  outputPath: string;

  /*
   * Private internal reference containing
   * the code, tier, and batch label.
   */
  auditOutputPath: string;
};

function normalizeCode(code: string) {
  return code.trim().toUpperCase();
}

function hashCode(code: string) {
  return createHash('sha256').update(normalizeCode(code), 'utf8').digest('hex');
}

function createCode() {
  /*
   * AppSumo codes must be completely
   * alphanumeric.
   *
   * QUFOAS prefix: 6 characters
   * Random portion: 36 hexadecimal characters
   * Total length: 42 characters
   *
   * 18 random bytes = 144 bits of randomness.
   */
  const randomPart = randomBytes(18).toString('hex').toUpperCase();

  return `QUFOAS${randomPart}`;
}

function createCodeHint(code: string) {
  return `${code.slice(0, 8)}...${code.slice(-6)}`;
}

function escapeCsvValue(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function createAuditOutputPath(outputPath: string) {
  if (outputPath.toLowerCase().endsWith('.csv')) {
    return `${outputPath.slice(0, -4)}-audit.csv`;
  }

  return `${outputPath}-audit.csv`;
}

function validateGeneratedCodes(codes: string[]) {
  if (new Set(codes).size !== codes.length) {
    throw new Error('Duplicate codes were generated. Run the command again.');
  }

  for (const code of codes) {
    /*
     * AppSumo accepts only letters and
     * numbers, with a length of 3-200.
     */
    if (!/^[A-Z0-9]{3,200}$/.test(code)) {
      throw new Error(
        `Generated code does not meet AppSumo requirements: ${createCodeHint(
          code,
        )}`,
      );
    }
  }
}

function parseOptions(): GeneratorOptions {
  const { values } = parseArgs({
    options: {
      count: {
        type: 'string',

        default: String(MIN_APPSUMO_CODES),
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

  if (
    !Number.isInteger(count) ||
    count < MIN_APPSUMO_CODES ||
    count > MAX_APPSUMO_CODES
  ) {
    throw new Error(
      `--count must be an integer between ${MIN_APPSUMO_CODES} and ${MAX_APPSUMO_CODES}.`,
    );
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

  const outputPath = resolve(process.cwd(), output);

  const auditOutputPath = createAuditOutputPath(outputPath);

  if (outputPath === auditOutputPath) {
    throw new Error('AppSumo and audit output paths must be different.');
  }

  return {
    count,

    batchLabel,

    outputPath,

    auditOutputPath,
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

  validateGeneratedCodes(codes);

  /*
   * Official AppSumo upload file:
   *
   * - No header
   * - No additional columns
   * - One code per row
   * - No blank rows
   */
  const appSumoCsv = `${codes.join('\n')}\n`;

  /*
   * Private internal reference file.
   * Do not upload this file to AppSumo.
   */
  const auditRows = [
    ['code', 'tier', 'batchLabel'],

    ...codes.map((code) => [code, BASE_CODE_TIER, options.batchLabel]),
  ];

  const auditCsv = `${auditRows
    .map((row) => row.map(escapeCsvValue).join(','))
    .join('\n')}\n`;

  let appSumoFileCreated = false;

  let auditFileCreated = false;

  let application: Awaited<
    ReturnType<typeof NestFactory.createApplicationContext>
  > | null = null;

  try {
    await mkdir(dirname(options.outputPath), {
      recursive: true,
    });

    await mkdir(dirname(options.auditOutputPath), {
      recursive: true,
    });

    /*
     * "wx" refuses to overwrite an
     * existing file.
     */
    await writeFile(options.outputPath, appSumoCsv, {
      encoding: 'utf8',

      flag: 'wx',

      mode: 0o600,
    });

    appSumoFileCreated = true;

    await writeFile(options.auditOutputPath, auditCsv, {
      encoding: 'utf8',

      flag: 'wx',

      mode: 0o600,
    });

    auditFileCreated = true;

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
     * Delete only the files created by
     * this execution. Existing files are
     * never removed.
     */
    if (auditFileCreated) {
      await unlink(options.auditOutputPath).catch(() => undefined);
    }

    if (appSumoFileCreated) {
      await unlink(options.outputPath).catch(() => undefined);
    }

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
      `AppSumo CSV: ${options.outputPath}`,
      `Private audit CSV: ${options.auditOutputPath}`,
      '',
      'Upload only the AppSumo CSV.',
      'Never commit or publicly share either CSV.',
    ].join('\n'),
  );
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);

  process.exitCode = 1;
});
