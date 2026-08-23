#!/usr/bin/env node

/**
 * Dumps every currently git-staged file's full content into a single Markdown
 * file, in exactly the format `scripts/apply-doc-files.js` expects — so the
 * two scripts pair up: this one snapshots the staging area into docs/p2.md,
 * that one replays docs/p2.md back onto disk.
 *
 * Output format, per staged file:
 *   ## [A|M] <path/relative/to/repo/root>
 *
 *   ```<lang>
 *   <verbatim staged file content>
 *   ```
 *
 * The tag mirrors `git diff --staged --name-status`'s status code (A for a
 * new file, M for anything else — renames/copies collapse to M, since the
 * destination path is what actually gets written back). Deleted files carry
 * no content to dump and are skipped with a note; binary files are skipped
 * the same way, since a fenced code block can't represent them faithfully.
 *
 * Usage:
 *   node scripts/dump-staged-files.js [docPath] [--dry-run]
 *
 *   docPath    Path to write the dump to (default: docs/p2.md)
 *   --dry-run  List what would be written without touching docPath
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const LANG_BY_EXT = {
  ts: 'ts',
  tsx: 'tsx',
  js: 'js',
  jsx: 'jsx',
  mjs: 'js',
  cjs: 'js',
  html: 'html',
  scss: 'scss',
  css: 'css',
  json: 'json',
  md: 'md',
  py: 'python',
  sh: 'bash',
  yml: 'yaml',
  yaml: 'yaml',
  sql: 'sql',
};

function parseArgs(argv) {
  const args = argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const docPath = args.find(arg => !arg.startsWith('--')) ?? 'docs/p2.md';
  return { docPath, dryRun };
}

function git(args, repoRoot) {
  return execFileSync('git', args, { cwd: repoRoot, encoding: 'utf8', maxBuffer: 1024 * 1024 * 256 });
}

/** `--name-status -M` reports renames/copies as 3-tab-separated fields
 *  (`R100\told\tnew`) instead of the usual 2 (`M\tpath`) — only the
 *  destination path matters here, since that's what's actually staged. */
function parseNameStatus(output) {
  return output
    .split('\n')
    .filter(Boolean)
    .map(line => {
      const fields = line.split('\t');
      const rawStatus = fields[0];
      const filePath = fields.length === 3 ? fields[2] : fields[1];
      const statusChar = rawStatus[0];
      return { statusChar, filePath };
    });
}

/** `--numstat` prints `-\t-\t<path>` for binary files (no meaningful add/remove
 *  line counts) — that's the one reliable, porcelain-stable way to tell a binary
 *  file apart from a text one without shelling out to `file` or reading bytes. */
function findBinaryPaths(repoRoot) {
  const output = git(['diff', '--staged', '--numstat'], repoRoot);
  const binary = new Set();
  for (const line of output.split('\n')) {
    if (!line) continue;
    const [added, removed, filePath] = line.split('\t');
    if (added === '-' && removed === '-') binary.add(filePath);
  }
  return binary;
}

function languageFor(filePath) {
  const ext = path.extname(filePath).slice(1).toLowerCase();
  return LANG_BY_EXT[ext] ?? '';
}

function collectStagedFiles(repoRoot) {
  const nameStatusOutput = git(['diff', '--staged', '--name-status', '-M'], repoRoot);
  const entries = parseNameStatus(nameStatusOutput);
  const binaryPaths = findBinaryPaths(repoRoot);

  const files = [];
  for (const { statusChar, filePath } of entries) {
    if (statusChar === 'D') {
      console.error(`Skipping ${filePath}: deleted (nothing to dump).`);
      continue;
    }
    if (binaryPaths.has(filePath)) {
      console.error(`Skipping ${filePath}: binary file (can't be represented in a fenced code block).`);
      continue;
    }

    // Staged (index) content, not the working-tree file — matches what would
    // actually be committed, even if the working tree has since diverged further.
    const content = git(['show', `:${filePath}`], repoRoot);
    const tag = statusChar === 'A' ? 'A' : 'M';
    files.push({ tag, filePath, content, lang: languageFor(filePath) });
  }
  return files;
}

function renderDump(files) {
  return files
    .map(({ tag, filePath, content, lang }) => {
      const body = content.endsWith('\n') ? content : `${content}\n`;
      return `## [${tag}] ${filePath}\n\n\`\`\`${lang}\n${body}\`\`\`\n`;
    })
    .join('\n');
}

function main() {
  const { docPath, dryRun } = parseArgs(process.argv);
  const repoRoot = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  const absoluteDocPath = path.resolve(repoRoot, docPath);

  const files = collectStagedFiles(repoRoot);
  if (files.length === 0) {
    console.error('No staged files with content to dump (nothing staged, or everything skipped above).');
    process.exit(1);
  }

  const dump = renderDump(files);

  if (dryRun) {
    for (const { tag, filePath, content } of files) {
      console.log(`[dry-run] [${tag}] would dump: ${filePath} (${Buffer.byteLength(content, 'utf8')} bytes)`);
    }
    console.log(`Would write ${files.length} file(s) to ${docPath}.`);
    return;
  }

  fs.mkdirSync(path.dirname(absoluteDocPath), { recursive: true });
  fs.writeFileSync(absoluteDocPath, dump);
  for (const { tag, filePath } of files) {
    console.log(`[${tag}] dumped: ${filePath}`);
  }
  console.log(`Wrote ${files.length} file(s) to ${docPath}.`);
}

main();
