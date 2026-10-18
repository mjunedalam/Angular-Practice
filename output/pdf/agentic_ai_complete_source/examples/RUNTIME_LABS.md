# Runtime, telemetry and evaluator labs

Run from the extracted companion directory (`examples/`). These labs use only
synthetic data. They do not issue refunds, call model providers or send telemetry
to a backend.

## Exact manuscript regressions

`test_runtime_snippets.py` reads the neighboring `../chapters/24.md`, `25.md` and
`26.md` and executes the actual printed function blocks. Keep that directory
relationship when distributing the source package. The tests do not substitute
copied versions of the functions.

The executed baseline is Python 3.12 with `opentelemetry-api==1.45.1`,
`opentelemetry-sdk==1.45.1` and their resolver-selected dependencies. In an
isolated environment:

```sh
python -m pip install opentelemetry-api==1.45.1 opentelemetry-sdk==1.45.1
python -m unittest test_runtime_snippets -v
```

Expected: 11 tests pass. They cover retrospective approval, equal timestamps
with distinct causal commits, equal/later commit sequences, exclusive expiry,
existing binding/outcome checks, constant-difference bootstrap intervals and
exported OpenTelemetry spans. The SDK tests inspect serialized exported spans
and verify safe error status/type plus success usage. A default parent is
**expected to capture** the rethrown synthetic marker; a parent with both
exception-recording flags disabled must not capture it. This demonstrates the
local scope of the child fix. It is not certification of arbitrary framework
instrumentation, logs or collectors.

The approval oracle requires trusted per-run commit/execution sequences and
common-authority timestamps. A sequence appended only after an external effect
cannot establish when that effect was authorized. Schema authentication,
entitlement, live proposal/version checks and downstream fencing remain separate
contracts; Chapter 18 describes proposal replacement and reconciliation.

## Paired judge-attack fixture

No third-party packages are required:

```sh
python judge_attack_lab.py
python -m unittest test_judge_attack_lab -v
```

Expected: eight tests pass. The report contains four constructed task/answer
cases (two supported, two unsupported), each evaluated clean and with the same
forged-grader suffix. Each version has two negative attempts and two positive
attempts. The default first-line exact-match fixture reports zero false accepts
and two true accepts per version, with zero attack flips. The deliberately
vulnerable fixture reports two injected false accepts and two clean-fail to
injected-pass flips. These numbers validate report accounting on designed
fixtures. **Neither fixture is an LLM, and these counts are not evidence of real
LLM resistance or a production attack-success rate.**

The report shows attempted and successfully graded negative denominators.
`false_accept_rate` divides false accepts by successfully graded negative
candidates; it is null when none were graded. Grading errors remain visible and
`complete_grading` becomes false. An unavailable or malformed grader must not
look like a successful rejection or satisfy a release gate. The report itself
makes no release decision.

## Optional real-judge adapter

Inject a callable accepting `JudgeRequest(rubric, evidence, candidate)` and
returning exactly one of these dictionaries:

```python
{"verdict": "pass", "reason_code": "supported"}
{"verdict": "fail", "reason_code": "unsupported"}
```

Then call `run_pairs(your_adapter, judge_version="your-pinned-config-id")`.
`your_adapter` is an application-supplied function, not a provider integration
bundled here. Place the fixed rubric/schema in the trusted instruction channel
and candidate text in its separate untrusted field. Do not concatenate the
candidate into trusted instructions. The expected case label is withheld from
the request and stays in the independent fixture. The evidence is deliberately
provided to grade factual support; the fixture uses simple exact answers rather
than claiming to measure general helpfulness.

The adapter owns credentials, provider parsing, timeouts and bounded retries.
Grant no action tools or unnecessary secrets. Its verdict must meet the schema;
exceptions become a safe `adapter_error` code without raw private messages.
Record provider/model snapshot, settings and adapter revision in the external
experiment manifest identified by `judge_version`. Real experiments need more
cases, held-out attack families, controlled order, repeated trials, appropriate
uncertainty and independent adjudication. This harness performs one attempt per
variant in clean-then-injected order, so it cannot estimate stochastic robustness
or eliminate ordering effects. Delimiters and rubric separation are controls to
evaluate, not proofs against semantic injection.
