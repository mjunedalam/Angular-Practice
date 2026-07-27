#!/usr/bin/env -S npx tsx
/**
 * Encodes any .docx file into a base64 .txt file.
 *
 * Usage:
 *   npx tsx scripts/encode-manual-base64.ts
 *   npx tsx scripts/encode-manual-base64.ts <input.docx> <output.base64.txt>
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

interface EncodeOptions {
  readonly inputPath: string;
  readonly outputPath: string;
}

function parseArgs(argv: readonly string[]): EncodeOptions {
  const [inputArg, outputArg] = argv;
  const inputPath = resolve(inputArg ?? 'docs/agwa-user-manual.docx');
  const outputPath = resolve(outputArg ?? 'docs/agwa-user-manual.docx.base64.txt');
  return { inputPath, outputPath };
}

function encodeDocxFile({ inputPath, outputPath }: EncodeOptions): void {
  const buffer = readFileSync(inputPath);
  const base64 = buffer.toString('base64');
  writeFileSync(outputPath, base64);
  console.log(`Encoded ${buffer.length} bytes → ${base64.length} base64 chars`);
  console.log(`Wrote ${outputPath}`);
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  try {
    encodeDocxFile(options);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to encode: ${message}`);
    process.exit(1);
  }
}

main();
