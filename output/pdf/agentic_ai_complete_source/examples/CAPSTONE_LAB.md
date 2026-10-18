# AegisOps: one real graph, a simulated world

This October 17, 2026 companion executes LangGraph itself. Investigation, approvals, GitOps state, rollout and monitoring are local deterministic fixtures. No credentials, model API, cluster, Git remote or telemetry backend is used.

From the source-package root:

```bash
python3 -m venv /tmp/aegis-env
/tmp/aegis-env/bin/pip install -r examples/requirements-capstone.txt
/tmp/aegis-env/bin/python examples/capstone_lab.py /tmp/aegis-new start
/tmp/aegis-env/bin/python examples/capstone_lab.py /tmp/aegis-new approve
/tmp/aegis-env/bin/python examples/capstone_lab.py /tmp/aegis-new resume
/tmp/aegis-env/bin/python -m unittest discover -s examples -p 'test_capstone*.py' -v
```

Use a fresh incident folder. Recorded output from actual separate processes:

```text
paused
recovered
recovered
Ran 9 tests
OK
```

The suite kills a subprocess with `os._exit(73)` after the fake effect transaction commits and before the graph checkpoints execute's return. Restart runs pending work; another invocation observes terminal state. It checks that the durable effect count is exactly one. Other tests exercise proposal alteration, future/expired approval, supersession, competing desired revision, cancellation fence, rollout mismatch, missing/late telemetry, invalid histogram counts, malformed clocks and timestamps, units, failed thresholds, alerts and dependency checks. A separate subprocess regression commits the effect, crashes, advances desired state to `git-42`, then resumes the real graph. It returns `reconciliation-required`, preserves the accepted effect row and its unset completion, and never queries recovery telemetry. Repeated invocation retains this explicit handoff status; operator reconciliation or a reviewed new proposal is required. The test runtime is deliberately not a performance benchmark.

## Tested dependency matrix

| Component | Actually installed/tested | Extent |
|---|---|---|
| Python | 3.12.14, macOS arm64 | All nine tests |
| SQLite runtime | 3.53.1 | Real on-disk graph and domain files |
| langgraph | 1.2.16 | StateGraph, interrupt, Command, restart |
| langgraph-checkpoint | 4.3.0 | Graph persistence |
| langgraph-checkpoint-sqlite | 3.1.2 | SqliteSaver context manager |
| langgraph-prebuilt | 1.1.1 | Resolved dependency, not used directly |
| langchain-core | 1.6.12 | Resolved framework dependency |
| temporalio | 1.34.0 | SDK definitions imported; activity and signal boundary called locally |
| Temporal server | None | No workflow history replay, timers or delivery tested |
| Provider SDK/model | None | No provider claims or model measurement |
| MCP/A2A transport/protocol | None | No protocol negotiated in this slice |

`requirements-capstone.txt` is the complete `pip freeze` from the tested disposable environment. `pip check` reports no broken requirements. Reproduce on the listed platform first; a freeze is not a cross-platform deployment certification.

## Record and authority contracts

The sole fixture incident is `lab / inc-7 / order-api`. Its graph thread is `lab:inc-7:graph-v1`. The proposal digest includes operation, target, expected Git head, version, scope, risk, evidence and verification contract. Local code supplies the trusted fixture, not user JSON. Alice and Bob represent two privileged risk-4 approvers. `approve` inserts one immutable approval with `decided=10`, `expires=100`; execution at logical time 20 validates the active digest and interval. It never accepts a Boolean as authority. Editing the active proposal rejects a stale worker. The same digest defines one logical effect identity, so approval cannot be used for a second different effect.

The domain SQLite transaction atomically fences cancellation, checks expected desired head and records the fake effect. `git-41` may become a digest-derived commit targeting `image-40` only if still current. A competing head fails closed. Reconciliation requires the exact observed commit, unchanged desired head and ready rollout before completion at time 37. A commit receipt alone leaves `completed` null. SQLite is modeling a downstream service's atomic conditional effect contract; it does not make a real Git commit atomic with your database.

Ten exact intervals begin at second 37 and end at second 637, with a 30-second readiness watermark at 667. Two instance cumulative histogram increments sum to [90,98,100] at [.1,.2,infinity] seconds. The conservative p95 upper bound is 200 ms, error ratio 0/100 is 0. The criteria remain at most 300 ms, at most .005 errors, at least 100 requests per interval and healthy required alerts/dependencies. Do not average instance quantiles. Exact range-query coverage is a fixture contract; minute scrape interpolation is not implemented. Clock and timestamp values must be nonnegative finite seconds, excluding Boolean, null and string values. Each complete interval must satisfy start < end <= available; availability exactly at its end is allowed. The independent 30-second watermark still applies. Malformed count increases/counter resets, invalid times, late availability and missing intervals cannot pass. The failed original window remains failed; a coordinator must explicitly choose bounded replan or escalation.

## Temporal integration boundary: code provided, server not exercised

`capstone_temporal.py` defines an SDK workflow and activity rather than a server mock. Register `IncidentWorkflow` and `graph_step` in a worker on one task queue, and start with stable workflow ID `lab:inc-7:lifecycle-v1`. Supply a durable shared incident directory accessible to the activity workers; enforce single writer per thread and workflow-ID conflict rejection. A trusted external approval API must persist the record before signaling its ID. Never expose the fixture CLI as an unauthenticated approval endpoint.

Temporal owns deterministic lifecycle sequencing, a fifteen-minute approval timer and bounded activity retry. The graph owns node progress/checkpoints. Activity attempts have 30-second start-to-close, two-minute schedule-to-close and three total attempts; no graph retry policy multiplies this budget. A paused graph returns `paused` immediately. Completed workflow activity history would suppress replay of its work; an unrecorded reply may retry and reload the saved thread. The local suite calls the decorated activity and signal handler directly. It does not execute a Temporal workflow and does not establish server replay, timers, cancellation delivery or worker behavior.

Cancellation requires a control API that persists `control.cancelled=1` in the domain transaction before requesting Temporal cancellation, then reconciles accepted effects. The sample's `WAIT_CANCELLATION_COMPLETED` is not a submission fence: asyncio cancellation cannot terminate its helper thread. Domain cancellation and submission serialize; accepted work is not undone. Add a real authenticated cancellation API, cooperative heartbeats/worker policy, fenced multi-worker storage and server restart/replay/cancellation tests before integrating. The logical fixture clock must become a trusted clock, and real provider/identity/GitOps/monitoring adapters need their own operating evidence.

Official API references checked for this edition: [LangGraph interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts), [persistence](https://docs.langchain.com/oss/python/langgraph/persistence), [Temporal message passing](https://docs.temporal.io/develop/python/workflows/message-passing), [Temporal cancellation](https://docs.temporal.io/develop/python/workflows/cancellation), [Argo CD sync](https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/), [Prometheus histograms](https://prometheus.io/docs/practices/histograms/).
