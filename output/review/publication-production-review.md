# Publication production review: chapters 27–39 and companion

Date: 17 October 2026. This is an AI-assisted technical and copy review, not a human expert review or production certification.

## Coverage and conclusion

Read all thirteen chapter sources (27–39), all 26 related A/B visual lessons and all thirteen C research lessons. Read the three assigned prior revision reviews, the companion README, RAG_LAB.md, RUNTIME_LABS.md, CAPSTONE_LAB.md, dependency files, capstone implementation and tests, and the exact-snippet test entry points. The production chapters consistently distinguish architectural requirements, constructed examples, measured local integration and unexecuted deployment work.

One newly reproduced P2 defect was corrected after the lead explicitly expanded the edit scope to the two capstone Python files. No remaining material defect was identified in the reviewed chapter content or documented local setup. This conclusion covers the stated teaching/simulation scope; it does not certify the proposed production architecture, every possible malformed payload, or unexecuted cloud integrations.

## Corrected defect

**P2: invalid temporal data could produce verified recovery.** Before the fix, `covered_window` validated counts but compared clocks and availability without validating their numeric domain. Python comparisons with NaN are false, allowing invalid values to bypass readiness checks:

```python
rows = fixture()
rows[-1]['available'] = float('nan')
verify(rows, 37, 667)  # returned 'recovered'
verify(fixture(), 37, float('nan'))  # returned 'recovered'
```

Negative infinity as availability also recovered. Strings and null values could instead raise TypeError. The new regression was written and run before the implementation: one test produced 11 failing assertions and six expected missing-validation TypeErrors.

`examples/capstone_lab.py` now checks `completed`, `now`, and every interval's `start`, `end` and `available` before arithmetic or comparisons. Accepted values are nonnegative integer or finite float seconds, excluding Boolean values and implicit string coercion. Invalid temporal data returns `insufficient`. The fixture uses one common synthetic clock, and `available` means the complete interval can be read; therefore the interval must satisfy `start < end <= available`. Availability exactly at the interval end remains accepted. The separate 30-second global ingestion watermark still governs eligibility to evaluate. Fractional seconds remain supported.

`test_invalid_observation_times_cannot_establish_recovery` covers NaN, positive/negative infinity, null, string, Boolean and negative values across all five time fields, availability before completion of its interval, the equality boundary and fractional-second watermark boundaries. The complete capstone suite then passed: **9 tests, 7.165 seconds, OK**, with ResourceWarning treated as error. Chapter 38 now states the units and temporal validation contract.

## Other source changes

- Chapter 28: corrected the prose reference from `require_quality_floor` to the actual `meets_quality_floor` helper.
- Chapter 31: clarified that preapproved Claude tool calls can bypass the permission callback, so registry enforcement must also cover exposure/execution; restored a missing blank line before a heading. The official permission guide explicitly documents this callback behavior.
- Chapter 33: replaced a cloud blog URL that failed to load in the browsing tool with the fetched official Gemini Enterprise Agent Platform overview. This does not establish that the old URL is universally broken.
- Chapter 36: stated the selected model tier for each cost stage, making the existing arithmetic reproducible without inferring the tiers from the resulting costs.
- Chapter 38: documented the corrected time-domain validation described above.

No other chapters, visual/research lesson JSON, examples, build files, PDF, Angular files or historical review reports were edited by this review. No commits, external messages or human reviews were performed.

## Clean setup and executed commands

Extracted `output/pdf/Agentic_AI_Engineering_complete_source.zip` with Python's zipfile into a fresh temporary directory. At extraction, all **39 chapter files and 17 example files** matched the working source byte-for-byte. This was the source ZIP, not a new extraction of the PDF's embedded attachment. The lead owns final attachment/ZIP freshness checks after integration.

Extraction root:

```text
/var/folders/26/hyjctzxd59d3l3n7b54tnc780000gn/T/publication-production-degby43i/agentic_ai_complete_source
```

Created fresh virtual environments using `/Users/junedalam/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3`: Python 3.12.14, SQLite 3.53.1, macOS arm64. Installation used pip's available wheel cache; each environment began empty. No customer data, provider credentials or business effects were used.

| Environment | Install | Result |
|---|---|---|
| `/tmp/publication-production-base` | Standard library only | Three documented demos and 35 tests passed |
| `/tmp/publication-production-runtime` | `python -m pip install -r examples/requirements-runtime.txt` | Install succeeded; `pip check` clean; 11 tests passed |
| `/tmp/publication-production-mcp` | `python -m pip install 'mcp[cli]==2.3.0'` | Install succeeded; `pip check` clean; 5 tests passed, no skip |
| `/tmp/publication-production-capstone` | `python -m pip install -r examples/requirements-capstone.txt` | Install succeeded; `pip check` clean; original 8 tests passed |

From the extraction root, executed each standard-library demo and the following suite command with its corresponding pattern:

```bash
/tmp/publication-production-base/bin/python examples/mini_harness.py
/tmp/publication-production-base/bin/python examples/rag_lab.py
/tmp/publication-production-base/bin/python examples/judge_attack_lab.py
/tmp/publication-production-base/bin/python -W error::ResourceWarning \
  -m unittest discover -s examples -p 'test_mini_harness.py' -v
# Same discovery command for test_rag_lab.py and test_judge_attack_lab.py.
```

- Harness: waiting → completed verified; one refund; 19 tests passed.
- Retrieval: fixed/adaptive outputs matched the guide, including absent evidence and bounded no-progress outcomes; printed recall 0.666667, RR 0.500000 and nDCG 0.530721; 8 tests passed.
- Judge fixture: complete grading, two negative cases and two positive cases per variant, no default-fixture false accepts or attack flips; 8 tests passed. These are designed fixture outcomes, not model-quality measurements.

From extracted `examples/`:

```bash
/tmp/publication-production-runtime/bin/python -W error::ResourceWarning \
  -m unittest test_runtime_snippets -v
/tmp/publication-production-mcp/bin/python -W error::ResourceWarning \
  -m unittest test_foundations_snippets.py -v
```

The 11 runtime tests inspect actual exported local OpenTelemetry spans. The five foundation tests include a real local MCP stdio server/client launched from the chapter listings; the optional test did not skip.

From the extraction root:

```bash
/tmp/publication-production-capstone/bin/python examples/capstone_lab.py /tmp/publication-production-incident start
/tmp/publication-production-capstone/bin/python examples/capstone_lab.py /tmp/publication-production-incident approve
/tmp/publication-production-capstone/bin/python examples/capstone_lab.py /tmp/publication-production-incident resume
/tmp/publication-production-capstone/bin/python -W error::ResourceWarning \
  -m unittest discover -s examples -p 'test_capstone*.py' -v
```

CLI output: `paused`, `recovered`, `recovered`. Original capstone suite: 8 tests passed in 8.139 seconds, including real LangGraph/SQLite persistence, actual subprocess loss after the fake commit and competing-revision reconciliation. Thus the original extracted release reproduced **59 passing tests** across separate documented environments: 19 + 8 + 8 + 11 + 5 + 8.

After the timing fix, ran the same capstone discovery command from the working source root: **9 tests passed**, so the revised set contains **60 distinct tests**. The final complete package must include the new source/test and updated active guide counts; the other 51 tests were unchanged by this review. Historical eight-/59-test reports are historical evidence and should not be rewritten as new runs.

An exploratory all-files discovery command in the empty base environment failed as expected: 52 discovered entries, five errors for absent LangGraph/OpenTelemetry and one MCP skip. This is not a documented quick-start regression: the README explicitly instructs separate optional environments. All documented environment-specific paths above succeeded. No combined-environment compatibility claim is made. MCP pins the top-level package rather than a full transitive lock; reproduction beyond this resolved run still depends on compatible resolver output.

## Additional manuscript verification

All fourteen Python code blocks in chapters 27–39 parse with Python's AST parser; all inline diagram, check and exercise JSON parses. This is syntax verification, not execution of every illustrative adapter.

Independently recomputed all Wilson interval rows in lessons 27B, 38B and 39C using z=1.96. The 108/120 and 110/120 lower bounds agree with approximately 83.33% and 85.34%. Recomputed Chapter 36's seven stage costs and total USD 1.40475, Chapter 30's 32 KiB/token and 128 MiB/4096-token KV estimate, the 2.45 weighted score and the 667-second watermark. No arithmetic discrepancy found.

## Primary-source checks

Sources were fetched or searched and opened on 17 October 2026. These checks support the stated concepts and dated API descriptions, not deployment certification:

- Error-budget burn normalization: [Google SRE, Alerting on SLOs](https://sre.google/workbook/alerting-on-slos/).
- Prefix-cache trust-group salting and timing exposure: [vLLM prefix-cache design](https://docs.vllm.ai/en/latest/design/prefix_caching/).
- Iteration-level scheduling and changing batch membership: [ORCA, USENIX OSDI 2022](https://www.usenix.org/conference/osdi22/presentation/yu).
- Transactional scheduling obligations and duplicate delivery: [AWS transactional outbox](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html), [SQS at-least-once delivery](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues-at-least-once-delivery.html).
- Interrupt restart, static-plus-dynamic routing and interrupted-node migration: [LangGraph interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts), [Graph API](https://docs.langchain.com/oss/python/langgraph/graph-api).
- SDK approval interruption, state serialization and application-owned review: [OpenAI guardrails and human review](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals), [running agents](https://developers.openai.com/api/docs/guides/agents/running-agents). No provider API was called.
- ToolCallingAdvisor registration in Spring AI 2.0: [Spring's June 12, 2026 release explanation](https://spring.io/blog/2026/06/12/spring-ai-2-0-0-GA-available-now/). Microsoft framework terminology/version date: [April 3, 2026 version 1.0 announcement](https://devblogs.microsoft.com/agent-framework/microsoft-agent-framework-version-1-0/).
- Preapproval versus tool availability and callback bypass: [Claude Agent SDK permissions](https://code.claude.com/docs/en/agent-sdk/permissions).
- Cedar enforcement at the gateway: [Amazon Bedrock AgentCore policy concepts](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/policy-core-concepts.html). Google runtime/session/memory responsibilities: [official Agent Platform overview](https://docs.cloud.google.com/gemini-enterprise-agent-platform/agents).
- Workflow determinism, activity I/O and cancellation/heartbeat requirements: [Temporal workflow definition](https://docs.temporal.io/workflow-definition), [Python message passing](https://docs.temporal.io/develop/python/workflows/message-passing), [Python cancellation](https://docs.temporal.io/develop/python/workflows/cancellation). The installed Temporal 1.34.0 source/docstring independently confirms `wait_condition` returns None and raises asyncio.TimeoutError on timeout; no server timer was exercised.
- Histogram aggregation and the invalidity of averaging instance quantiles: [Prometheus histogram guidance](https://prometheus.io/docs/practices/histograms/).
- Untrusted execution still needs mounts/network/resource policy: [gVisor security model](https://gvisor.dev/docs/architecture_guide/security/). Position-sensitive judging: [Zheng et al., LLM-as-a-Judge](https://arxiv.org/abs/2306.05685). Proportion interval method: [NIST confidence intervals](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm).
- Idempotency retention is finite under the cited API v1 contract: [Stripe idempotent requests](https://docs.stripe.com/api/idempotent_requests).
- Referenced protocol edition exists: [MCP 2026-07-28 specification](https://modelcontextprotocol.io/specification/2026-07-28). The separate MCP smoke test does not establish the capstone's protocol integration.

## Explicit limits and release handoff

No Temporal server, history replay, durable timer, server cancellation delivery or worker-registration integration was executed. No PostgreSQL server or tenant-isolation SQL deployment was executed. No live model, provider billing, cloud deployment, Kubernetes cluster, real GitOps controller, monitoring backend, authentication service, A2A transport or customer effect was used. The capstone's world, identity and clock remain trusted local fixtures with single-writer assumptions.

This review did not render pages, inspect the final PDF or verify an assistive reader, embedded attachment or final rebuilt source ZIP. The lead retains packaging, updated guide counts, final source freshness and layout verification. The earlier claim of 59 tests applies to the extracted pre-fix release; the timing revision has fresh nine-test capstone evidence and must be included in the final distribution.
