#!/usr/bin/env node
/**
 * Decodes docs/AGWA-Application-User-Guide.docx.base64 back into a .docx file.
 *
 * Usage:
 *   node scripts/decode-manual-base64.js
 *   node scripts/decode-manual-base64.js <input.base64> <output.docx>
 */
const { readFileSync, writeFileSync } = require('fs');
const { resolve } = require('path');

function parseArgs(argv) {
  const [inputArg, outputArg] = argv;
  const inputPath = resolve(inputArg ?? 'docs/AGWA-Application-User-Guide.docx.base64');
  const outputPath = resolve(outputArg ?? 'docs/AGWA-Application-User-Guide.docx');
  return { inputPath, outputPath };
}

function decodeBase64File({ inputPath, outputPath }) {
  const base64 = readFileSync(inputPath, 'utf8').trim();
  const buffer = Buffer.from(base64, 'base64');
  writeFileSync(outputPath, buffer);
  console.log(`Decoded ${base64.length} base64 chars → ${buffer.length} bytes`);
  console.log(`Wrote ${outputPath}`);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  try {
    decodeBase64File(options);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Failed to decode: ${message}`);
    process.exit(1);
  }
}

main();
