#!/usr/bin/env node

/**
 * Applies every file documented in a source-dump file (e.g. docs/p2.md) back
 * to its real path on disk — overwriting the file if it already exists,
 * creating it (and any missing parent directories) if it doesn't.
 *
 * The dump format this expects, per file:
 *   ## [A] <path/relative/to/repo/root>
 *
 *   ```<lang>
 *   <verbatim file content>
 *   ```
 *
 * The `[A]`/`[M]`/`[D]` tag mirrors `git status` porcelain codes and is
 * stripped from the path, but it's optional — a plain `## <path>` header
 * works too, and the tag is then inferred (M if the file already exists on
 * disk, A otherwise) purely for the log line. The closing fence isn't
 * required to sit on its own line — if the dump's source file had no
 * trailing newline, the ``` ends up glued to the last content line, and this
 * parser accounts for that.
 *
 * Usage:
 *   node scripts/apply-doc-files.js [docPath] [--dry-run]
 *
 *   docPath    Path to the dump file (default: docs/p2.md)
 *   --dry-run  List what would be written without touching disk
 */

const fs = require('fs');
const path = require('path');

const HEADER_PATTERN = /^## (?:\[(A|M|D)\]\s+)?(.+)$/;
const FENCE_OPEN_PATTERN = /^```/;

function parseArgs(argv) {
  const args = argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const docPath = args.find(arg => !arg.startsWith('--')) ?? 'docs/p2.md';
  return { docPath, dryRun };
}

function extractFencedContent(blockLines) {
  const openIdx = blockLines.findIndex(line => FENCE_OPEN_PATTERN.test(line));
  if (openIdx === -1) return null;

  const rest = blockLines.slice(openIdx + 1);

  let closeIdx = -1;
  for (let i = rest.length - 1; i >= 0; i--) {
    if (rest[i].includes('```')) {
      closeIdx = i;
      break;
    }
  }
  if (closeIdx === -1) return null;

  const contentLines = rest.slice(0, closeIdx);
  const glued = rest[closeIdx].slice(0, rest[closeIdx].indexOf('```'));
  if (glued.length > 0) contentLines.push(glued);

  return `${contentLines.join('\n')}\n`;
}

function parseSections(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const headerIndexes = [];
  lines.forEach((line, i) => {
    if (HEADER_PATTERN.test(line)) headerIndexes.push(i);
  });

  const sections = [];
  for (let h = 0; h < headerIndexes.length; h++) {
    const startIdx = headerIndexes[h];
    const endIdx = h + 1 < headerIndexes.length ? headerIndexes[h + 1] : lines.length;
    const [, tag, rawPath] = HEADER_PATTERN.exec(lines[startIdx]);
    const filePath = rawPath.trim();

    const content = extractFencedContent(lines.slice(startIdx + 1, endIdx));
    if (content === null) {
      console.error(`Skipping ${filePath}: no fenced code block found under its header.`);
      continue;
    }

    sections.push({ tag, filePath, content });
  }

  return sections;
}

function applySections(sections, repoRoot, dryRun) {
  for (const { tag, filePath, content } of sections) {
    const absolutePath = path.join(repoRoot, filePath);
    const exists = fs.existsSync(absolutePath);
    const verb = exists ? 'replaced' : 'created';
    const label = tag ?? (exists ? 'M' : 'A');

    if (dryRun) {
      console.log(`[dry-run] [${label}] would be ${verb}: ${filePath} (${content.length} bytes)`);
      continue;
    }

    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content);
    console.log(`[${label}] ${verb}: ${filePath}`);
  }
}

function main() {
  const { docPath, dryRun } = parseArgs(process.argv);
  const repoRoot = process.cwd();
  const absoluteDocPath = path.resolve(repoRoot, docPath);

  if (!fs.existsSync(absoluteDocPath)) {
    console.error(`Doc file not found: ${absoluteDocPath}`);
    process.exit(1);
  }

  const markdown = fs.readFileSync(absoluteDocPath, 'utf8');
  const sections = parseSections(markdown);

  if (sections.length === 0) {
    console.error('No "## [A|M|D] <path>" + fenced-code sections found in the doc — nothing to apply.');
    process.exit(1);
  }

  applySections(sections, repoRoot, dryRun);
  console.log(`${dryRun ? 'Would apply' : 'Applied'} ${sections.length} file(s) from ${docPath}.`);
}

main();
