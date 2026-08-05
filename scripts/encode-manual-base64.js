#!/usr/bin/env node
/**
 * Encodes any .docx file into a base64 .txt file.
 *
 * Usage:
 *   node scripts/encode-manual-base64.js
 *   node scripts/encode-manual-base64.js <input.docx> <output.base64.txt>
 */
const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');

function parseArgs(argv) {
  const [inputArg, outputArg] = argv;
  const inputPath = resolve(inputArg ?? 'docs/agwa-user-manual.docx');
  const outputPath = resolve(outputArg ?? 'docs/agwa-user-manual.docx.base64.txt');
  return { inputPath, outputPath };
}

function encodeDocxFile({ inputPath, outputPath }) {
  const buffer = readFileSync(inputPath);
  const base64 = buffer.toString('base64');
  writeFileSync(outputPath, base64);
  console.log(`Encoded ${buffer.length} bytes → ${base64.length} base64 chars`);
  console.log(`Wrote ${outputPath}`);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  try {
    encodeDocxFile(options);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to encode: ${message}`);
    process.exit(1);
  }
}

main();
