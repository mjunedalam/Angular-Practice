#!/usr/bin/env bash
# Simulates N users opening the app (each "page load" = CALLS parallel /api/* GETs)
# and counts how many calls nginx rejected (503/429). Needs only bash + curl.
#
# Usage:  bash load-test-curl.sh [URL] [USERS] [CALLS] [ROUNDS]
#   bash load-test-curl.sh https://agwa-dev.apps.ocpb.enp.aramco.com.sa 100 8 3
#
# Status meaning: 401/403/404 = reached backend OK, 503/429 = blocked by nginx,
# 000 = connection failed (curl never got an HTTP response).
URL="${1:-https://agwa-dev.apps.ocpb.enp.aramco.com.sa}"; URL="${URL%/}"
USERS="${2:-100}"; CALLS="${3:-8}"; ROUNDS="${4:-3}"
THINK=1.5
PREFIXES=(planning dailyoperations email sap s3)
OUT="$(mktemp)"; trap 'rm -f "$OUT"' EXIT

page_load() {   # one page load = CALLS parallel requests
  for ((c = 0; c < CALLS; c++)); do
    curl -s -o /dev/null -m 15 -w '%{http_code}\n' \
      "$URL/api/${PREFIXES[c % 5]}/loadtest-$c" >> "$OUT" &
  done
  wait
}

user() {        # one user = ROUNDS page loads
  for ((r = 0; r < ROUNDS; r++)); do
    page_load
    ((r < ROUNDS - 1)) && sleep "$THINK"
  done
}

echo "Target: $URL | $USERS users x $ROUNDS page loads x $CALLS parallel calls"

echo; echo "=== BASELINE: 1 user ==="
page_load; sort "$OUT" | uniq -c; : > "$OUT"; sleep 3

echo; echo "=== LOAD: $USERS users ==="
start=$(date +%s)
for ((u = 0; u < USERS; u++)); do
  user &
  sleep 0.01          # spread user start-up over ~1s (100 users)
done
wait
secs=$(( $(date +%s) - start ))

total=$(wc -l < "$OUT" | tr -d ' ')
blocked=$(grep -cE '^(503|429)$' "$OUT")
failed=$(grep -c '^000$' "$OUT")
echo "status counts (count code):"; sort "$OUT" | uniq -c
echo "API calls        : $total in ${secs}s"
echo "blocked by nginx : $blocked ($(( total ? blocked * 100 / total : 0 ))%)"
((failed > 0)) && echo "connection failed: $failed  <- 000 = never reached nginx (proxy/cert/VPN?)"
