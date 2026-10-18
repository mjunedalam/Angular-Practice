# Runtime/evaluation revision report

Implemented 17 October 2026 in `output/pdf/agentic_ai_complete_source`.

## Changed files

- `chapters/18.md`: explicit atomic supersession/active-version contract; a delayed approved worker must fail the live proposal/version gate; downstream acceptance races and reconciliation are distinct from cancellation. New four-actor replacement sequence. Existing snapshot validator is accurately scoped and is not represented as a live-state fence.
- `chapters/24.md`: C2 approval oracle checks `decided_at <= executed_at < expires_at` plus `committed_seq < executed_seq`. Documents trusted same-run causal history, common-authority timestamps, equal clock/unequal sequence boundaries, unresolved evidence, and the difference between execution-boundary records and delayed post-effect logging. New before/after comparison.
- `chapters/25.md`: adversarial judge trust boundary, independent paired labels, attack-conditioned false accepts, grader errors and adjudication. Precisely scopes the deterministic fixture/optional injected adapter. Adds constant-difference bootstrap limitation without misrepresenting SciPy's BCa warning. New boundary diagram.
- `chapters/26.md`: C1 disables **both** `record_exception` and `set_status_on_exception`; keeps explicit safe type and status. Parent/framework/logging policy and source allowlist scope are explicit. New exported-error comparison.
- `examples/test_runtime_snippets.py`: executes the exact chapter functions from Markdown. Real SDK/exporter tests inspect all serialized span fields, event/message/stack/status leakage, propagation into a default parent, same policy on parent, and successful usage metrics.
- `examples/judge_attack_lab.py`: four paired toy candidates (two supported/two unsupported), independent reviewed labels, fixed grading request contract, default deterministic exact-first-line fixture, deliberately vulnerable fixture, constrained verdict validation, safe grader-error records and separate attack/clean denominators. Optional callable adapter requires an explicit version; no provider/network implementation or credentials are bundled.
- `examples/test_judge_attack_lab.py`: eight contract tests covering pair construction, independent labels/request boundary, positive and negative denominators, deliberately vulnerable score flips, malformed outputs, exceptions and partial coverage.
- `examples/RUNTIME_LABS.md`: exact commands, pinned telemetry baseline, observed outputs, schema assumptions, companion directory requirements and limits of optional live experiments.

No Angular, renderer, build, general README, existing A/B/C lesson files, PDF or release marker was modified. No dependency was installed and no agent was spawned. Every owned chapter still has four self-checks and three exercises. Existing headings/substantive topics remain. Each has five standard-schema diagrams; the four new figures raise the combined count from sixteen to twenty.

## Test evidence

Before modifying the manuscript, the new exact-snippet suite ran against the original code: **11 tests, 7 failures** (including subtests), exit 1. Failures demonstrated retrospective approval, equal/later causal commit acceptance, causally invalid ordering despite favorable timestamps, and the exported synthetic marker on all child privacy paths. Existing outcome/binding/expiry and success tests passed. The original SDK reproduction was already read as audit evidence; the historical read-only reproduction script was not changed or rerun against its now-obsolete expected manuscript.

Final commands and observed results:

```text
/tmp/agentic-audit-runtime-venv/bin/python -m unittest discover \
  -s output/pdf/agentic_ai_complete_source/examples \
  -p test_runtime_snippets.py -v
Ran 11 tests in 0.066s
OK

/Users/junedalam/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3 \
  -m unittest discover \
  -s output/pdf/agentic_ai_complete_source/examples \
  -p test_judge_attack_lab.py -v
Ran 8 tests in 0.000s
OK
```

Actual SDK environment: Python 3.12, `opentelemetry-api==1.45.1`, `opentelemetry-sdk==1.45.1`, `opentelemetry-semantic-conventions==0.66b1`, `typing_extensions==4.16.0`. The judge lab itself needs only the standard library. The initial judge-test run failed because its new module did not yet exist; subsequent complete implementation and all eight tests passed. This missing-module run is not represented as an independent behavioral reproduction.

Executed judge reports:

| Fixture | Clean negatives graded | Clean false accepts | Injected negatives graded | Injected false accepts | Attack flips |
|---|---:|---:|---:|---:|---:|
| Deterministic exact-first-line | 2 | 0 | 2 | 0 | 0 |
| Deliberately vulnerable | 2 | 0 | 2 | 2 | 2 |

Both report two true accepts per variant and zero grading errors. These are designed fixture outcomes, not model robustness measurements. No live judge was run. A broken grader produces `grading_error` and `complete_grading=False`; missing grades cannot count as correct rejections.

All seven Python blocks in owned chapters parsed. Block lengths are 12/15 (18), 17/20 (24), 19/15 (25), 28 (26), all at most 70 columns. All twenty diagram JSON objects parsed. Added sequence uses four actors and no self-message.

## Primary citations checked

These URLs were reopened on 17 October 2026 and are now cited in the relevant edition-source paragraphs:

1. OpenTelemetry Python context-manager API, default recording/status flags: https://opentelemetry-python.readthedocs.io/en/latest/api/trace.html#opentelemetry.trace.Tracer.start_as_current_span
2. Escaping exception implementation and parent propagation: https://opentelemetry-python.readthedocs.io/en/latest/_modules/opentelemetry/trace.html#use_span (already established by audit; actual behavior additionally executed on SDK 1.45.1).
3. OWASP state-transition ordering, modification and final authorization gate: https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html ; replacement anchor https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html#26-transaction-data-should-be-protected-against-modification
4. Shi et al., *Optimization-based Prompt Injection Attack to LLM-as-a-Judge* (JudgeDeceiver): https://arxiv.org/abs/2403.17710 . Supports candidate-carried injection as an attack surface; no paper rate is attributed to the book's grader.
5. SciPy bootstrap reference: https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.bootstrap.html . Its BCa degenerate-distribution warning is explicitly distinguished from this chapter's percentile function returning a constant interval.

## Lead integration needs

- Package the new four example files and preserve chapter files adjacent to `examples/` for exact manuscript extraction. If the embedded PDF companion intentionally omits chapters, add the chapter sources or revise distribution/test extraction accordingly; do not silently replace tested code with a hand-copy.
- Include the telemetry SDK/API pins above in the tested dependency matrix, or run that suite in its isolated telemetry environment. Judge tests have no extra dependency.
- Add the two new test patterns to the final release check, run the demo, and inspect all four new figures in the rebuilt PDF. Source parsing is verified; no PDF rendering or layout certification was attempted in this scope.
- Preserve the source topics and A/B/C labs; old maximum-figure assumptions need the lead's approved verifier update.
- Coordinate the capstone's active-proposal/supersession test with Chapter 18's contract. This runtime patch teaches the authoritative replacement/fencing contract but does not introduce a second fake distributed transaction engine. A historical snapshot validator alone is deliberately insufficient.
- A real judge adapter is a separate experiment requiring provider/model/adapter versions, held-out attacks, repetitions, order control, uncertainty and adjudication. The supplied deterministic fixture is only a reproducible test of measurement plumbing.
