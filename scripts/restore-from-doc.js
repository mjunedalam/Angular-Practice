#!/usr/bin/env node

/**
 * Restores every file documented in a source-dump file (e.g. docs/test.txt)
 * back to its real path on disk, overwriting whatever is currently there.
 *
 * The dump format this expects, per file:
 *   ## <path/relative/to/repo/root>
 *
 *   ```<lang>
 *   <verbatim file content>
 *   ```
 *
 * Usage:
 *   node scripts/restore-from-doc.js [docPath] [--dry-run]
 *
 *   docPath    Path to the dump file (default: docs/test.txt)
 *   --dry-run  List what would be written without touching disk
 */

const fs = require('fs');
const path = require('path');

const HEADER_PATTERN = /^## (.+)$/;
const FENCE_PATTERN = /^```/;

function parseArgs(argv) {
  const args = argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const docPath = args.find(arg => !arg.startsWith('--')) ?? 'docs/test.txt';
  return { docPath, dryRun };
}

function parseSections(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const sections = [];

  let state = 'idle'; // 'idle' | 'awaiting-fence' | 'in-content'
  let currentPath = null;
  let currentLines = [];

  for (const line of lines) {
    if (state === 'idle') {
      const match = HEADER_PATTERN.exec(line);
      if (match) {
        currentPath = match[1].trim();
        state = 'awaiting-fence';
      }
      continue;
    }

    if (state === 'awaiting-fence') {
      if (FENCE_PATTERN.test(line)) {
        currentLines = [];
        state = 'in-content';
      }
      continue;
    }

    if (state === 'in-content') {
      if (line === '```') {
        sections.push({ filePath: currentPath, content: `${currentLines.join('\n')}\n` });
        currentPath = null;
        currentLines = [];
        state = 'idle';
      } else {
        currentLines.push(line);
      }
    }
  }

  return sections;
}

function restoreSections(sections, repoRoot, dryRun) {
  for (const { filePath, content } of sections) {
    const absolutePath = path.join(repoRoot, filePath);

    if (dryRun) {
      console.log(`[dry-run] would write ${filePath} (${content.length} bytes)`);
      continue;
    }

    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content);
    console.log(`wrote ${filePath}`);
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
    console.error('No "## <path>" + fenced-code sections found in the doc — nothing to restore.');
    process.exit(1);
  }

  restoreSections(sections, repoRoot, dryRun);
  console.log(`${dryRun ? 'Would restore' : 'Restored'} ${sections.length} file(s) from ${docPath}.`);
}

main();
