# Capstone revision review

Reviewed 17 October 2026. Read-only source review; only this requested report was written. No source edits, commits, PDF build or agents.

## Finding

**[P2] Preserve a reconciliation failure as a domain outcome instead of passing `None` to telemetry.** `output/pdf/agentic_ai_complete_source/examples/capstone_lab.py:185–186` unconditionally calls `fixture(completed)`, although `reconcile` explicitly returns `None` when the current desired revision differs from the accepted effect, rollout is not ready, or observation does not match. A concurrent desired-state change after the fake commit but before restart therefore crashes the observe node with `TypeError` (`None + integer`) instead of recording a pending/conflict/escalation outcome. This does not cause duplicate effects or false recovery, but prevents the advertised restart/reconciliation path from producing an inspectable status for a valid uncertain-convergence condition. Return an explicit non-recovered state when completion is unconfirmed, retaining the effect identity, and exercise it through graph restart rather than only the standalone reconciliation helper.

Reproduced with a fresh directory: `start` → `approve` with `CAPSTONE_CRASH_AFTER_COMMIT=1` (exit 73) → update the fake desired revision to `git-42` → `resume` (exit 1 in observe). This uses the simulated competing-revision boundary already present in the lab, not a real Git backend.

## Verification and coverage

Command, from `output/pdf/agentic_ai_complete_source`:

```text
/tmp/capstone-venv/bin/python -W error::ResourceWarning -m unittest discover -s examples -p 'test_capstone*.py' -v
Ran 7 tests in 2.690s
OK
```

Read revision-capstone-report.md, the approved whole-book expert review, both capstone modules, all seven tests, CAPSTONE_LAB.md, and the additions with surrounding text in chapters 31, 32, 36, 37 and 38.

- Actual LangGraph/SqliteSaver path, persisted interrupt, separate-process resume, process exit after effect commit, terminal reload and one logical ledger effect are exercised. The stable effect key correctly permits reconciliation after authority expires or cancellation follows acceptance.
- Approval digest, active proposal, privileged fixture identities, distinct quorum, validity equality boundaries, expected desired revision and cancellation transaction are coherent for the explicitly trusted local simulation. Logical clock values are synthetic and are not represented as wall-clock enforcement.
- Temporal workflow/activity ownership and bounded attempt settings match the manuscript. The helper-thread cancellation limitation, required persisted submission fence, single writer/shared storage assumptions and absence of server replay/timer/delivery tests are explicitly disclosed. Direct SDK-decorated function calls do not establish actual Temporal delivery; the report correctly avoids claiming that they do.
- GitOps is a conditional desired-state/ledger simulation. Readiness and exact observed revision are checked by the reconciliation helper; a real Git transaction, controller, authentication and atomic cross-system operation are not claimed.
- Ten off-minute intervals, watermark 667, 100 requests, error fraction .005, histogram aggregation [90,98,100], and conservative 200 ms bound agree with Chapter 38. Missing/late data and invalid counts are tested. Backend coverage, actual alerts/dependencies and histogram counter semantics remain declared adapter contracts.
- No other material contradiction found between these additions and their stated simulation/integration limits. The standalone rollout mismatch test does not cover the graph failure above. No Temporal server, provider, live GitOps, metrics backend, PDF layout or distribution artifact was tested in this review.

## Follow-up review: P2 resolved

Re-reviewed the updated observe guard (`examples/capstone_lab.py:186–189`), the new `test_restart_with_competing_revision_requires_reconciliation` regression, and the corresponding report, lab-guide and Chapter 32 claims. The guard records `reconciliation-required` before creating telemetry when completion is unconfirmed. Graph state retains the accepted effect identity; the regression checks unchanged accepted ledger data with null completion, the competing desired revision, successful subprocess exit, persisted graph status and repeated resume. The documented terminal handoff requires explicit reconciliation and does not claim automatic recovery.

Re-ran the same ResourceWarning-as-error command above after this change:

```text
Ran 8 tests in 4.596s
OK
```

The previously reported P2 is resolved. No remaining material findings in the reviewed capstone revision within its declared simulation scope. Earlier seven-test output is historical; the current reviewed suite has eight tests. Temporal server behavior and external integrations remain outside the evidence, as documented. No implementation files were modified by this review.

## Final PDF visual spot check

Inspected full rendered PNGs `tmp/pdfs/agentic-revision-final/page-610.png`, `page-687.png`, `page-709.png` and `page-723.png` (printed pages 597, 674, 696 and 710) from the final complete build.

No material visual issues on these four pages. Figure titles, labels, captions and insight lines are readable and remain together; no clipping, overlap, broken lines or footer collisions observed. Figure 32.5 correctly places process loss after the domain effect commit and before the graph return checkpoint. Figure 36.4 binds the same incident/thread/proposal/approval/effect/evidence identities as the executable slice; its following cost-model prose fits the page. Figure 37's sequence arrows preserve the paused activity return, external approval signal, bounded resume and change-ledger reply; its caption correctly distinguishes replay from activity retry. Figure 38.2 preserves the off-minute endpoints and watermark, and distinguishes evaluation eligibility from recovery acceptance. Its numbered cards show ordered events rather than a proportional time axis; the timestamp labels carry the actual durations.

This was a four-page visual spot check, not an independent review of all 892 PDF pages. The P2 source fix was verified in the preceding eight-test follow-up; its inclusion in the final build was reported by the lead rather than separately established from these diagram pages. No implementation, manuscript, renderer or PDF edits were made.
