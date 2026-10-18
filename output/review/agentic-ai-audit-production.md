# Agentic AI Engineering: production and capstone audit

Reviewed 17 October 2026. Scope: chapters 31–39, all 27 associated A/B/C lessons, appendices A–I, and the Chapter 11 runnable example and tests. This is a review, not a revised edition. Book sources and PDF were not edited.

**Conclusion:** no confirmed high-severity factual error, current-API contradiction, or unsafe instruction was found in this assigned material. The strongest improvements are practical integration examples. The book accurately labels its framework snippets as teaching units or adapter pseudocode, its AegisOps design as a blueprint, and its benchmarks, budgets, and targets as illustrative. Those qualifications matter: the absence of a complete production system is not itself a broken promise.

Source paths below are relative to `output/pdf/agentic_ai_complete_source/`. PDF page numbers are one-based viewer pages. Printed body page = PDF page minus 12, verified against the rendered PDF. The source of page mappings is `layout_manifest.json`.

## Priority improvements, distinguished from factual defects

### P2 — Supply one runnable framework and capstone vertical slice

**Classification:** material practical addition; not a false SDK listing.

**Locations:** `chapters/31.md:49–71` (adapter pseudocode and explicit disclaimer), `chapters/32.md:141–163` (AegisOps graph exercise, PDF 555 / printed 543), `chapters/36.md:155–159` (reference repository/README, PDF 630 / printed 618), and `chapters/38.md:125–141` (completion and portfolio requirements). Chapter 31 begins on PDF 523 / printed 511; Chapter 32 on PDF 541 / printed 529.

The supplied runnable files are `examples/mini_harness.py` and `examples/test_mini_harness.py`; their README correctly identifies them as Chapter 11 material. The other Python files in this source package build or verify the book. There is no runnable LangGraph graph, framework comparison adapter, Temporal workflow, or AegisOps scaffold in this package. Chapter 32 explains the Graph API thoroughly but does not demonstrate a complete `StateGraph` construction, compilation, first invocation, saved thread identity, and resumed invocation. Its capstone code is a useful pure policy function.

**Proposed addition:** a small fake-incident program with pinned dependencies, a compiled graph, a persistent checkpointer, one bound approval pause, one effect ledger, one post-action verifier, and one process-restart test. Include commands and expected output. A second engine adapter can reuse the same domain services and contract tests to make Chapter 31's portability exercise concrete. This need not implement every enterprise adapter or the entire nine-role architecture.

The framework itself distinguishes graph configuration, persistent thread state, and resume behavior; teaching those together would close the main implementation gap. [LangGraph Graph API](https://docs.langchain.com/oss/python/langgraph/graph-api), [persistence](https://docs.langchain.com/oss/python/langgraph/persistence), [interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts).

This finding concerns capstone/framework implementation availability. The separate PDF/source-download packaging issue is outside this subreview and should not be counted twice.

### P2 — Make the LangGraph–Temporal ownership boundary executable

**Classification:** integration clarification/addition; the current replay explanation is correct.

**Locations:** `chapters/32.md:117–121`; `chapters/36.md:139` (PDF 628 / printed 616); `chapters/37.md:128–138` (PDF 646–648 / printed 634–636). The stack puts LangGraph behind owned interfaces and Temporal in charge of durable waits. Phase 8 moves lifecycle work into Temporal activities.

The prose explains each engine's responsibilities, but a learner must still invent how graph checkpoints and Temporal activity retries interact. An activity can be retried after its graph progress was saved but before Temporal recorded completion. Conversely, a graph can reach an interrupt while the outer workflow still regards an activity as running. Without an explicit bridge, independent retry/resume paths may redo work or wait indefinitely even when each engine is used correctly in isolation.

**Proposed addition:** one ownership table and sequence with a concrete supported design: Temporal owns incident lifecycle, scheduled waits, and approval notifications; a bounded activity runs/resumes an identified graph segment. Specify the stable incident/workflow/graph-thread/proposal/effect identifiers, who records each transition, whether the graph checkpoint is retained across activity retries, how approval is read from the authoritative service, cancellation/timeouts, and how the outer workflow recognizes a returned graph pause. Show a crash between graph checkpoint commit and activity completion. Keep external-effect deduplication in the domain service.

The book correctly states that a recorded completed activity is not replayed as fresh external work and an unrecorded completion may cause retry. It also correctly states that `workflow.wait_condition(..., timeout=...)` raises `asyncio.TimeoutError`; this was verified against the current Python reference. [Temporal workflow definition](https://docs.temporal.io/workflow-definition), [Python message passing](https://docs.temporal.io/develop/python/workflows/message-passing), [wait_condition reference](https://python.temporal.io/temporalio.workflow._context.html#wait_condition), [LangGraph interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts).

### P2 — Define the GitOps rollback adapter's actual mutation and completion contract

**Classification:** production-adapter clarification; not an assertion that the book prescribes an incorrect `kubectl` command.

**Locations:** `chapters/36.md:141` names Git and Argo CD (PDF 628 / printed 616); `chapters/37.md:150–158` requires a change service to atomically check expected revision and mutate (PDF 650–651 / printed 638–639); `chapters/38.md:89–95` discusses GitOps deployment (PDF 664 / printed 652).

The abstract conditional-mutation contract is sound. Its concrete meaning is left unspecified for the named GitOps stack. Application release/version, Git desired-state revision, and Kubernetes object `resourceVersion` are different values. Argo CD does not permit its rollback operation while automated sync is enabled, and self-heal can restore desired state after a live-cluster edit. Therefore a naive implementation of the otherwise correct blueprint can have its rollback refused or reversed by reconciliation. [Argo CD automated sync policy](https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/).

**Proposed addition:** select one supported rollback path and state it explicitly. For example, an approved, conditional desired-state change to a known Git revision, followed by reconciliation and rollout observation. Name which revision is compared atomically, which service owns that check, how effect identity binds to the change, and which observations distinguish accepted request, desired-state commit, applied rollout, and completed action. Define how a concurrent deployment conflicts with the approved proposal. Begin the service-recovery window only after the chosen action-completion condition is established. An exceptional direct-cluster override needs a separately documented reconciliation policy.

### P2 — Add a worked telemetry adapter for the recovery verifier

**Classification:** practical addition; the pure verifier is correct under its stated input contract.

**Locations:** `chapters/38.md:13–47`, PDF 657–658 / printed 645–646. The verifier expects ten ordered, covered, one-minute buckets starting at the exact confirmed action-completion time. It rejects short windows, missing coverage, insufficient traffic, nonfinite metrics, threshold failures, and unresolved required alerts. Line 47 explicitly assigns authorization, units, and complete valid buckets to the observation adapter.

The difficult production step is converting real monitoring queries into that input. A completion timestamp may fall between scrape boundaries; queries may arrive late; counts may reset; and a service's p95 cannot generally be obtained by averaging instance p95 values. These concerns are not defects in the pure function, but this adapter is what makes its truthful recovery claim achievable. Prometheus explicitly distinguishes aggregatable histograms from nonaggregatable precomputed quantiles. [Prometheus histograms and summaries](https://prometheus.io/docs/practices/histograms/).

**Proposed addition:** one recorded metrics fixture and real query example covering authorized service labels, seconds-to-milliseconds conversion, error-rate denominator, histogram aggregation, bucket start/end semantics, traffic coverage, delayed-data readiness, and evidence IDs. Include a timeline where the change completes between ordinary scrape times and show which observations qualify. State whether a failed first ten-minute window triggers replanning or a newly defined later window; do not silently slide the original criterion until it passes. Existing phase exit tests should be extended, not moved later or duplicated.

## Lower-priority additions

### P3 — Record the tested dependency and protocol matrix

**Locations:** `chapters/31.md:5`, PDF 523 / printed 511; `chapters/32.md:5`, PDF 541 / printed 529; `chapters/36.md:159`, PDF 630 / printed 618; Appendix D, PDF 715–719 / printed 703–707.

The text already tells readers to pin exact patches and supporting packages, so this is not an incorrect version claim. A reproducibility appendix should give the versions actually tested by a future runnable companion: Python, framework, core/prebuilt/checkpointer packages, provider SDK, Temporal SDK/server, transport, negotiated protocol version, and test command. Framework release-family freshness alone is not a compatibility test. The current LangGraph release page includes 1.2.16 and interrupt/subgraph-resume fixes, demonstrating why an exact tested baseline is useful. Spring AI 2.0's release announcement specifies its own MCP SDK/protocol baseline; this should not be assumed identical to the latest MCP specification. [LangGraph releases](https://github.com/langchain-ai/langgraph/releases), [Spring AI 2.0 release](https://spring.io/blog/2026/06/12/spring-ai-2-0-0-GA-available-now/), [MCP 2026-07-28 specification](https://modelcontextprotocol.io/specification/2026-07-28).

### P3 — Optional malformed-script validation in the teaching harness

**Locations:** `examples/mini_harness.py:325–340`; its boundary statement in `examples/README.md:25–33`; Chapter 11's explicitly narrow scripted-model contract.

Reproduced: a script response of `None`, a list, or a string raises `AttributeError` at `response.get(...)`; usage and cursor increments have not yet been persisted, so reopening the run repeats that response. This input is outside the demonstrated structured calls/final script contract, and the book separately requires a live provider adapter to validate provider responses. **Do not promote this to a production safety defect or claim the supplied provider adapter is broken: no such adapter is supplied.**

If the harness is expanded into a reusable exercise base, validate script entries on creation or handle a typed invalid-response outcome and persist consumption consistently. Add one negative test. The existing 19 tests still pass under the documented contract.

## Current technical claims checked

| Claim | Result and primary reference |
|---|---|
| OpenAI Agents SDK supports individually approved pending calls and resumption that may interrupt again | Supported. The chapter's own `runtime.restore`/`pending_calls` methods are explicitly adapter pseudocode, not invented claims about official methods. [Agents SDK](https://developers.openai.com/api/docs/guides/agents/sdk), [guardrails and approvals](https://developers.openai.com/api/docs/guides/agents/guardrails-approvals). |
| Spring AI 2.0 places the tool loop in an auto-registered `ToolCallingAdvisor` | Supported by the [official 2.0 release announcement](https://spring.io/blog/2026/06/12/spring-ai-2-0-0-GA-available-now/). |
| Microsoft Agent Framework 1.0 and the Google Gemini Enterprise Agent Platform are current names | Supported by [Microsoft's 1.0 announcement](https://devblogs.microsoft.com/agent-framework/microsoft-agent-framework-version-1-0/) and [Google's platform announcement](https://cloud.google.com/blog/products/ai-machine-learning/the-new-gemini-enterprise-one-platform-for-agent-development). |
| Claude SDK permission mode is not a substitute for capability restrictions and per-call policy | Supported. Tool surfaces, preapproval, and request/deny behavior are distinct controls. [Claude Agent SDK permissions](https://code.claude.com/docs/en/agent-sdk/permissions). |
| AWS AgentCore gateway policy can use Cedar for tool authorization | Supported; application business invariants remain separate. [AgentCore policy concepts](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/policy-core-concepts.html). |
| LangGraph 1.2 state reducers, persistent threads, `interrupt`, `Send`, and graph migration caveats | Supported. An interrupt restarts the containing node; returned state deltas/reducers matter; a checkpoint does not reverse external effects. [Graph API](https://docs.langchain.com/oss/python/langgraph/graph-api), [interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts), [persistence](https://docs.langchain.com/oss/python/langgraph/persistence). |
| MCP 2026-07-28 and A2A 1.0 references | The versioned primary specifications exist and support the chapter's high-level roles; no protocol grants domain authorization merely through capability discovery. [MCP](https://modelcontextprotocol.io/specification/2026-07-28), [A2A](https://a2a-protocol.org/v1.0.0/specification/). |
| Queue retries and durable workflow replay do not guarantee one external effect | Supported by [SQS at-least-once delivery](https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/standard-queues-at-least-once-delivery.html) and [Temporal workflow definition](https://docs.temporal.io/workflow-definition). |
| A sandbox needs surrounding filesystem, network, identity, and resource controls | Supported by [gVisor's security model](https://gvisor.dev/docs/architecture_guide/security/). |
| LLM judging needs calibration and bias controls; small evaluation samples need intervals | Supported by the [MT-Bench/Chatbot Arena paper](https://arxiv.org/abs/2306.05685) and [NIST binomial intervals](https://www.itl.nist.gov/div898/handbook/prc/section2/prc241.htm). |

Current documentation checks establish consistency of the claims, not execution of every framework integration. No provider credentials, real payments, live clusters, or hosted workflow services were used.

## Execution and numerical checks

Run from the source-package directory:

```text
python3 examples/mini_harness.py
before review: waiting
after review: completed verified
refunds: 1

python3 -W error::ResourceWarning -m unittest discover -s examples -v
Ran 19 tests in 0.282s
OK
```

The suite includes a real subprocess termination after the fake payment ledger commits, restart reconciliation, approval binding, expiry, scope revocation, cancellation, budgets, and future-schema rejection. The README accurately states the single-writer limit, local synchronous tools, trusted caller identity, logical refund identity, and manual reconciliation boundary. These are explicit limitations, not hidden defects.

Arithmetic checks found no error: the Chapter 38 weighted example yields 2.45, improving evidence by one point adds 0.15, and its evaluation scenario allocation totals 100. The Chapter 39 Wilson lower bounds for 108/120 and 110/120 recompute to approximately 0.8333 and 0.8534. Appendix E's stated refund exposure and cost-regression deltas are arithmetically consistent. No illustrative number was treated as an independently measured product benchmark.

## Coverage ledger

All listed prose, code, checks, exercises, and A/B/C lesson data were read in full. PDF 657 was rendered and visually inspected: code and labels are legible with no observed clipping. This subreview is not a visual inspection of every page; the full-book layout audit is separate.

| Material | PDF / printed pages | Assessment |
|---|---|---|
| 31, framework implementations + A/B/C | 523–540 / 511–528 | SDK sketches are labeled honestly; current platform statements checked. Runnable comparison would improve transfer. |
| 32, LangGraph + A/B/C | 541–560 / 529–548 | Reducers, interrupt replay, subgraph deltas, persistent-state migration, and external-effect limits are sound. Main gap is executable assembly. |
| 33, Cloud & Enterprise Integration Tracks + A/B/C | 561–577 / 549–565 | Ownership, delivery/retry, and uncertainty distinctions are consistent. No material error found. |
| 34, Specialized Agent Systems + A/B/C | 579–595 / 567–583 | Sandboxing and independent acceptance criteria are correctly bounded. No material error found. |
| 35, Architecture Selection Patterns & Senior Design Review + A/B/C | 596–611 / 584–599 | Simplicity, operational ownership, and evidence-first claims are consistent. No material error found. |
| 36, AegisOps blueprint + A/B/C | 613–634 / 601–622 | Feasible as a staged simulation; explicitly not live-production certification. Risk-3 exception, risk-4 dual approval, risk-5 denial agree across prose and diagrams. Integration details deserve one concrete slice. |
| 37, capstone implementation I + A/B/C | 635–654 / 623–642 | Exit tests are already required before each phase. Correct approval and Temporal semantics; add the graph/workflow and GitOps bridges. |
| 38, capstone implementation II + A/B/C | 655–672 / 643–660 | Applied effect versus verified recovery is clear. Pure verifier and scorecard are coherent. Add observation adapter and rollout-completion examples. |
| 39, projects/assessment + A/B/C | 673–692 / 661–680 | Scope-dependent effort estimates and portfolio scoring are appropriately qualified; uncertainty math checked. |
| Appendix A, glossary | 693–702 / 681–690 | Definitions and critical distinctions consistent with assigned chapters. |
| Appendix B, readiness/review checklist | 703–708 / 691–696 | Useful architecture checklist; not presented as a certificate. |
| Appendix C, interview bank | 709–714 / 697–702 | Conceptual answers consistent; no distinct technical defect found. |
| Appendix D, tooling/further reading | 715–719 / 703–707 | Appropriate orientation; a tested-version matrix would improve reproducibility. |
| Appendix E, four failures | 720–729 / 708–717 | Clearly teaching case studies. Failure mechanisms and arithmetic are coherent. |
| Appendix F, exercise solution hints | 730–750 / 718–738 | Generated manifest contents read; assigned chapter hints agree with exercises. |
| Appendix G, visual answer key | 751–774 / 739–762 | Generated contents read; assigned A/B answers preserve the diagrams' contracts. |
| Appendix H, research lab answers | 775–804 / 763–792 | Generated contents read; assigned C answers consistent with their tasks. |
| Appendix I, research sources | 805–816 / 793–804 | All descriptions read; primary claims for 31–39 checked. Source descriptions for other chapters were not independently re-audited here. |
| Harness, README, tests | Companion source, Chapter 11 | Full read and documented commands run; 19 tests pass. Narrow teaching boundaries are candid. |

## Worthwhile visual and practical additions

The existing illustrations already teach many invariant boundaries well. Add targeted implementation views rather than more generic architecture diagrams:

- **One identity-and-ownership swimlane:** Temporal workflow, LangGraph thread/checkpointer, approval service, and change-service effect ledger, with the exact persisted IDs and the crash between graph save and activity completion.
- **A GitOps rollback timeline:** approved desired revision, conditional commit, Argo reconciliation, rollout readiness, action completion, then recovery verification. Include a competing deployment and show which revision check rejects it.
- **A real telemetry timeline:** action at an off-minute timestamp, scrape observations, late data, ten covered buckets, and the decision/evidence table.
- **A framework portability lab:** the same fake incident and contract tests through two runtime adapters; report which state, interruption, timeout, and trace fields each adapter translates.
- **A short operations packet:** one synthetic incident fixture, immutable proposal, approval record, effect ledger row, telemetry evidence, and final postmortem all sharing identities. It would let a reader inspect an entire capstone run without requiring every cloud service.

These additions address the remaining distance between a strong engineering blueprint and a reproducible learner implementation. No rewrite of the conceptual spine is indicated by this review.
