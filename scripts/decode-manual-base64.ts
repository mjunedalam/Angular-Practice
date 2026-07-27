#!/usr/bin/env -S npx tsx
/**
 * Decodes docs/agwa-user-manual.docx.base64.txt back into a .docx file.
 *
 * Usage:
 *   npx tsx scripts/decode-manual-base64.ts
 *   npx tsx scripts/decode-manual-base64.ts <input.base64.txt> <output.docx>
 */
import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';

interface DecodeOptions {
  readonly inputPath: string;
  readonly outputPath: string;
}

function parseArgs(argv: readonly string[]): DecodeOptions {
  const [inputArg, outputArg] = argv;
  const inputPath = resolve(inputArg ?? 'docs/agwa-user-manual.docx.base64.txt');
  const outputPath = resolve(outputArg ?? 'docs/agwa-user-manual.docx');
  return { inputPath, outputPath };
}

function decodeBase64File({ inputPath, outputPath }: DecodeOptions): void {
  const base64 = readFileSync(inputPath, 'utf8').trim();
  const buffer = Buffer.from(base64, 'base64');
  writeFileSync(outputPath, buffer);
  console.log(`Decoded ${base64.length} base64 chars → ${buffer.length} bytes`);
  console.log(`Wrote ${outputPath}`);
}

function main(): void {
  const options = parseArgs(process.argv.slice(2));
  try {
    decodeBase64File(options);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to decode: ${message}`);
    process.exit(1);
  }
}

main();
