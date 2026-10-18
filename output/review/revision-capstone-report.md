# Capstone revision report

Date: 17 October 2026. Scope: approved production audit P1/P2/P3 and practical capstone integration. Existing chapter topics, four checks, exercises and A/B/C companion lessons are preserved; additions were inserted into the five assigned chapters. No Angular, renderer, general README, Chapter 11, PDF or Git commit changes made.

## Changed files

- `output/pdf/agentic_ai_complete_source/chapters/31.md`: measured framework baseline and exact scope rather than broad compatibility claims.
- `chapters/32.md`: executable saver/interrupt/resume path, commands and process crash timeline.
- `chapters/36.md`: narrow incident record/authority slice and identity anatomy.
- `chapters/37.md`: concrete ownership bridge, retries/deadlines/cancellation limitation, desired-state conditional GitOps contract and two diagrams.
- `chapters/38.md`: exact off-minute telemetry adapter arithmetic, histograms, units, readiness, failure policy and timeline.
- `examples/capstone_lab.py`: real LangGraph StateGraph + SQLite saver; immutable digest-bound fixture approval; simulated atomic effect ledger; conditional desired revision; active proposal fence; cancellation fence; separate reconciliation and recovery verification; CLI.
- `examples/capstone_temporal.py`: SDK workflow/activity definitions; bounded activity returns pause, external approval-ID signal, timers/retries, explicit cancellation mode. Server integration is not claimed.
- `examples/test_capstone_lab.py`: eight tests including actual killed subprocess after ledger commit, fresh-process continuation and duplicate invocation.
- `examples/CAPSTONE_LAB.md`: full reproduction, tested matrix and integration gaps.
- `examples/requirements-capstone.txt`: full resolved pinned freeze from the tested disposable venv.

## Evidence

Executed with `/tmp/capstone-venv/bin/python`, based on bundled Python 3.12.14, SQLite 3.53.1 on macOS arm64. Installed/tested LangGraph 1.2.16, checkpoint 4.3.0, SQLite checkpointer 3.1.2, prebuilt 1.1.1, langchain-core 1.6.12 and Temporal SDK 1.34.0. Requirements file includes all resolved transitive versions. `pip check`: No broken requirements found.

```text
python examples/capstone_lab.py <fresh-directory> start
paused
python examples/capstone_lab.py <same-directory> approve
recovered
python examples/capstone_lab.py <same-directory> resume
recovered
python -W error::ResourceWarning -m unittest discover -s examples -p 'test_capstone*.py' -v
Ran 8 tests
OK
```

Final scoped run passes, plus py_compile for both companion modules. Tests cover the real effect/checkpoint crash gap, expiry equality and approval-after-execution denial, altered proposal, supersession, concurrent revision conflict, cancellation fence, rollout mismatch, missing/late telemetry, histogram invalidity/units, failure thresholds, alert/dependency failure, decorated Temporal activity boundary and duplicate signal reference. The graph subprocess really exits 73 before recording execute completion; the final domain ledger has one logical effect.

Telemetry contract matches Chapter 38: 100 requests/bucket, error ratio <= .005, latency <=300ms, ten covered exact intervals beginning at second 37, final endpoint 637, watermark 667, explicit alert/dependency criteria. Two instance histograms sum to [90,98,100] at [.1,.2,infinity] seconds; conservative p95 upper bound is 200ms. Values are synthetic, not claimed operational measurements.

Primary references browsed: LangGraph interrupts/persistence, Temporal Python message passing/cancellation, Argo CD automated-sync policy and Prometheus histograms. Links are retained beside claims and in the lab guide.

## Limits and integration needs

The graph and saver actually execute; all external world behavior is simulated. No provider SDK or model, MCP/A2A transport/protocol negotiation, cluster, real Git ref, metrics backend, Temporal server, credentials or external effects were used. The Temporal SDK definitions and activity boundary are locally exercised, but replay, timers, worker delivery and server cancellation require a server integration suite. The code explicitly warns that asyncio cancellation cannot terminate its helper thread; a trusted persisted domain fence must precede cancellation, followed by reconciliation.

SQLite requires enforced single writer per incident and trusted local fixture identity. There is no multi-worker fencing, auth API, real clock, distributed transaction, data retention/migration or operating certification. Real change integration must conditionally update desired Git state and reconcile by stable operation identity; controller readiness must reference that exact revision. Real telemetry must establish exact interval coverage and counter semantics; the fake does not interpolate scrape summaries or demonstrate backend ingestion guarantees. A failed window requires explicit replan/escalation rather than sliding until green.

Lead still owns final source/PDF packaging, rendered diagram/page verification and complete integrated test suite. The added diagram JSON uses only standard editorial-contract kinds and fields. No separate PDF was created.

## Review correction: unconfirmed completion after restart

Addressed P2 from revision-capstone-review.md. A new actual subprocess/graph regression first reproduced the TypeError after effect commit, crash and competing desired revision git-42. Observe now returns durable `reconciliation-required` when completion is unconfirmed, before creating any telemetry fixture. The accepted effect identity/digest/revision and null completion are preserved; duplicate resume retains the handoff and does not mutate git-42. This status requires explicit operator reconciliation or reviewed new work; it does not automatically slide the recovery window or resolve the incident. Final scoped suite: eight tests pass with ResourceWarning treated as error.
