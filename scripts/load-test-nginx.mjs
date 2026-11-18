#!/usr/bin/env node
/**
 * Simulates N users opening the app (each "page load" = a burst of parallel
 * /api/* GETs) and reports how many calls nginx rejected (503 / 429).
 *
 * Read-only GETs on non-existent sub-paths. The nginx rate limit runs BEFORE
 * the backend, so 401/403/404 = "passed nginx", 503/429 = "blocked by nginx".
 *
 * Usage:
 *   node scripts/load-test-nginx.mjs --url https://agwa-dev.apps.ocpb.enp.aramco.com.sa
 *   node scripts/load-test-nginx.mjs --users 100 --calls 8 --rounds 3
 *
 * Options:
 *   --url       base URL of the deployed frontend      (default: see below)
 *   --users     simulated users                        (default 100)
 *   --calls     parallel API calls per page load       (default 8)
 *   --rounds    page loads per user                    (default 3)
 *   --ramp-ms   users start spread over this window    (default 1000)
 *   --think-ms  pause between a user's page loads      (default 1500)
 *   --token     optional Bearer token (not needed to see nginx limiting)
 *
 * Internal CA? Don't disable TLS checks; trust the CA instead:
 *   NODE_EXTRA_CA_CERTS=/path/to/company-ca.pem node scripts/load-test-nginx.mjs
 *
 * NOTE: every simulated user runs from THIS machine, so nginx sees one client
 * IP. That is exactly what happens when OpenShift's router hides real client
 * IPs: all users share one bucket. 
 */
const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith('--')) {
      const next = all[i + 1];
      acc.push([a.slice(2), next && !next.startsWith('--') ? next : true]);
    }
    return acc;
  }, []),
);

const BASE = String(args.url ?? 'https://agwa-dev.apps.ocpb.enp.aramco.com.sa').replace(/\/$/, '');
const USERS = Number(args.users ?? 100);
const CALLS = Number(args.calls ?? 8);
const ROUNDS = Number(args.rounds ?? 3);
const RAMP_MS = Number(args['ramp-ms'] ?? 1000);
const THINK_MS = Number(args['think-ms'] ?? 1500);
const PREFIXES = ['planning', 'dailyoperations', 'email', 'sap', 's3'];

const headers = args.token ? { Authorization: `Bearer ${args.token}` } : {};

const errorReasons = {};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const isBlocked = (s) => s === 503 || s === 429;

async function call(i) {
  const url = `${BASE}/api/${PREFIXES[i % PREFIXES.length]}/loadtest-${i}`;
  try {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
    await res.arrayBuffer();
    return res.status;
  } catch (e) {
    // Node's fetch hides the real reason in `cause` (ENOTFOUND, ECONNREFUSED, cert errors...).
    const reason = e?.cause?.code ?? e?.cause?.message ?? e?.name ?? 'unknown';
    errorReasons[reason] = (errorReasons[reason] ?? 0) + 1;
    return 'ERR';
  }
}

/** One page load = CALLS parallel requests. Returns the list of statuses. */
const pageLoad = () => Promise.all(Array.from({ length: CALLS }, (_, i) => call(i)));

function tally(statuses, into) {
  for (const s of statuses) into[s] = (into[s] ?? 0) + 1;
}

async function runPhase(label, users, rounds) {
  const statusCounts = {};
  let pageLoads = 0;
  let failedPageLoads = 0;
  const t0 = Date.now();

  await Promise.all(
    Array.from({ length: users }, async (_, u) => {
      await sleep(users > 1 ? (u / users) * RAMP_MS : 0);
      for (let r = 0; r < rounds; r++) {
        const statuses = await pageLoad();
        tally(statuses, statusCounts);
        pageLoads++;
        if (statuses.some(isBlocked)) failedPageLoads++;
        if (r < rounds - 1) await sleep(THINK_MS);
      }
    }),
  );

  const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const blocked = Object.entries(statusCounts)
    .filter(([s]) => isBlocked(Number(s)))
    .reduce((a, [, n]) => a + n, 0);
  const secs = ((Date.now() - t0) / 1000).toFixed(1);

  console.log(`\n=== ${label} (${users} user${users > 1 ? 's' : ''}, ${secs}s) ===`);
  console.log('status counts      :', statusCounts);
  console.log(`API calls          : ${total}  (${(total / secs).toFixed(1)}/s overall)`);
  console.log(`blocked by nginx   : ${blocked}  (${((blocked / total) * 100).toFixed(1)}%)`);
  console.log(`page loads w/ error: ${failedPageLoads} of ${pageLoads}  (${((failedPageLoads / pageLoads) * 100).toFixed(1)}%)`);
  if (Object.keys(errorReasons).length) {
    console.log('connection errors  :', errorReasons, '<- requests never reached nginx');
  }
  return { blocked, total };
}

console.log(`Target: ${BASE}  | ${CALLS} parallel calls per page load, ${ROUNDS} loads per user`);
console.log('(401/403/404 = reached backend OK, 503/429 = rejected by nginx rate limit)');

await runPhase('BASELINE: 1 user', 1, 1);
await sleep(3000); // let the rate-limit bucket refill
await runPhase(`LOAD: ${USERS} users`, USERS, ROUNDS);
