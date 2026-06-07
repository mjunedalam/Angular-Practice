#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SHORT_HASH_LENGTH = 7;
const PROPERTIES_PATH = path.join(__dirname, '..', 'src', 'app', 'application-properties.json');

function gitOutput(command, fallback) {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch {
    return fallback;
  }
}

const branch = gitOutput('git rev-parse --abbrev-ref HEAD', 'local');
const commitHash = gitOutput(`git rev-parse --short=${SHORT_HASH_LENGTH} HEAD`, '0000000');

const properties = JSON.parse(fs.readFileSync(PROPERTIES_PATH, 'utf8'));
const updated = { ...properties, branch, commitHash, env: 'LOCAL' };

fs.writeFileSync(PROPERTIES_PATH, `${JSON.stringify(updated, null, 2)}\n`);
console.log(`[build-info] branch=${updated.branch} commitHash=${updated.commitHash} env=${updated.env}`);
