# Publication audit: chapters 14-26

Reviewed 17 October 2026. This is an **AI-assisted editorial and technical audit**, not an independent human expert review, legal opinion or publication certification.

## Result

No new material technical defect or contradiction was found in this scoped pass. Two grammatical errors were corrected in chapters 24 and 26. The prior repairs to proposal supersession, approval-before-effect ordering, judge evaluation and OpenTelemetry exception privacy remain intact. No code listing, diagram, substantive section, exercise or self-check was changed.

## Source coverage

Read all thirteen complete Markdown chapters (approximately 40,147 whitespace-delimited words including embedded diagram/check/exercise data), all 26 A/B visual lessons, and all 13 C research lessons. This was a source-content review; it did not render or inspect the final PDF. Also read `EDITORIAL_CONTRACT.md`, the prior `revision-runtime-review.md` and `revision-runtime-report.md`, and the MCP smoke-test scope in `examples/RAG_LAB.md`.

| Chapter | Full source and associated lessons reviewed | Main checks and result |
|---|---|---|
| 14 - MCP | `chapters/14.md`, `visual_lessons/14.json`, `research_lessons/14.json` | Modern/legacy protocol distinction, SDK v2 shape, optional extensions, host exposure versus server authority, audience separation, async and uncertain effects. No new defect found. |
| 15 - A2A | `15.md`, `15.json` in both lesson directories | Task identity, input-required continuation, terminal completion versus artifact acceptance, optional Send Message idempotency, lost creation response. Lessons agree with the prose. |
| 16 - Workflow graphs | `16.md`, both `16.json` files | Every investigation re-entry consumes the shared budget; joins preserve missing evidence; checkpoints do not supply effect deduplication; activity completion and retry remain distinct. |
| 17 - Multi-agent architecture | `17.md`, both `17.json` files | Supervisor ownership, report provenance, correlated errors, shared budgets and measured reasons for parallelism. Recomputed the budget and constructed schedules. |
| 18 - Human oversight | `18.md`, both `18.json` files | Outcome, digest, entitlement, expiry, active proposal/version, downstream preconditions and idempotency remain separate. Supersession guidance explicitly addresses delayed workers and accepted downstream effects. |
| 19 - Security | `19.md`, both `19.json` files | Injection, tool metadata poisoning, renderer egress, SSRF redirects, filesystem races and reader/actor authority. Visual boundaries retain explicit implementation assumptions. |
| 20 - Identity | `20.md`, both `20.json` files | User/workload/task intersection, separate background principal, RFC 8693 actor object, audience and scope, current cache entitlement, tenant isolation. No automatic narrowing or one-use token claim. |
| 21 - Sandboxing | `21.md`, both `21.json` files | Container/gVisor/microVM distinctions, resource limits during capture, reaper, credentials outside code, package integrity and artifact release. Pseudocode dependencies are stated rather than represented as implemented guarantees. |
| 22 - Governance | `22.md`, both `22.json` files | Purpose and placement remain separate; re-identifiable tokens, lineage, backup deletion, protected audit anchors and scoped legal summaries. No universal compliance claim or legal deadline was added. |
| 23 - Reliability | `23.md`, both `23.json` files | Retry classification/budget, same-operation identity, downstream dedupe retention, uncertain effects, compensation phase and ownership. Lessons preserve unresolved obligations. |
| 24 - Testing | `24.md`, both `24.json` files | Effects versus refusal text, fixture isolation, trusted approval sequence/common clock, exclusive expiry, replay and fault boundaries. Corrected one article. |
| 25 - Evaluation | `25.md`, both `25.json` files | Distinct cases versus repeats, paired inference, Wilson gate, kappa denominators, judge injection and grading errors, constant-difference bootstrap limitation. Recomputed displayed arithmetic. |
| 26 - Observability | `26.md`, both `26.json` files | Trace/audit distinction, metrics cardinality, private reasoning limits, nested duration arithmetic, both exception opt-out flags and parent propagation warning. Corrected one article. |

The repeated approval, least-privilege and recovery rules serve different integration boundaries across these chapters. Their meanings remain consistent; removing that repetition would risk losing local prerequisites. The diagrams' assumptions and constructed-example labels adequately separate teaching cases from empirical benchmarks. No substantive content was removed to shorten the manuscript.

## Applied corrections

| ID | Location | Before | After | Basis |
|---|---|---|---|---|
| PUB-R01 | `chapters/24.md:73`, Simulation and property-based fake-model tests | `a unavailable approval service` | `an unavailable approval service` | Indefinite article before a vowel sound. |
| PUB-R02 | `chapters/26.md:114`, Agent-native trace views | `a oversized observation` | `an oversized observation` | Indefinite article before a vowel sound. |

Only these two chapter files and this report were written by this audit. No source lesson, example implementation, renderer, build file, PDF or release marker was changed.

## Verification performed in this pass

Used `/Users/junedalam/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3` for read-only structural and numerical checks, with a successful exit status.

- Parsed all 54 embedded diagram objects, 52 self-checks and 39 exercises in the thirteen chapters as JSON.
- Parsed all 21 Python code blocks with `ast.parse`; this is syntax checking, not an integration test.
- Parsed all 26 associated lesson JSON files and checked every `before_heading` anchor against its chapter.
- Compared SHA-256 fingerprints captured immediately before editing: all fenced code blocks, headings and embedded diagrams are byte-for-byte unchanged. Only the complete-source hashes for chapters 24 and 26 changed.
- Executed the exact two pure Chapter 25 calculation helpers, without editing them. All four Wilson rows in lesson 25A agree within floating-point tolerance: lower bounds 0.9213457381 for 45/45; 0.9493470602 for 72/72; 0.9500062466 for 73/73; and 0.9104209437 for 190/200. The stated 72/73 perfect-case threshold is correct for z=1.96 and the specified two-sided rule.
- The exact paired helper returned `(0, 0)` for two zero differences and `(1, 1)` for two constant unit differences, agreeing with the chapter's explicit warning against interpreting these as future-case certainty.
- Independently recalculated the constructed judge table: agreement 0.85, marginal expected agreement 0.592, kappa 0.6323529412, and false acceptance 9/30 = 30%.
- Independently recalculated lesson 17B's remaining budget as USD 0.47 and lesson 17C's schedules as 13, 7, 9 and 14 seconds. The 26C nested intervals imply 12 seconds elapsed and four seconds outside investigation, not the sum of all span durations.
- Checked all 35 unique citation URLs in these chapter files with bounded HTTP requests: 34 returned HTTP 200. ISO returned HTTP 403 to the direct checker, but its official page was successfully retrieved through the web tool. The MCP versioning URL likewise returned HTTP 200 after an initial web-tool retrieval error. Neither was classified as a broken citation. HTTP reachability alone is not verification of every page claim or fragment anchor.

The prior runtime report records SDK/exporter and judge-lab tests. Those results were reviewed as existing evidence, not represented as newly rerun tests here. No live model, remote payment, sandbox provider, OAuth deployment, workflow cluster or MCP transport integration was exercised in this pass.

## Primary-source spot verification

The following primary pages were opened on 17 October 2026 to check edition-sensitive or easily misinterpreted claims. Their scope is the listed claim, not blanket certification of a chapter.

| Claim checked | Primary evidence | Finding |
|---|---|---|
| MCP 2026-07-28 removes initialization handshake, uses request metadata/discovery and moves tasks to an extension | [MCP changelog](https://modelcontextprotocol.io/specification/2026-07-28/changelog), [specification](https://modelcontextprotocol.io/specification/2026-07-28) | Matches Chapter 14. |
| SDK v2 is the documented stable line and supports modern/legacy modes | [Python SDK](https://py.sdk.modelcontextprotocol.io/), [protocol versions](https://py.sdk.modelcontextprotocol.io/protocol-versions/), [deprecated features](https://py.sdk.modelcontextprotocol.io/deprecated/) | Matches the chapter's named API era and deprecation discussion. This check did not rerun the pinned 2.3.0 smoke test. |
| Authorization is optional in core; protected HTTP uses audience validation; Client ID Metadata Documents are preferred over deprecated DCR | [MCP authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization) | Matches the qualified protocol statements. |
| A2A Send Message deduplication is optional | [A2A 1.0 specification, section 3.3.1](https://a2a-protocol.org/v1.0.0/specification/#331-idempotency) | Stable message ID alone is correctly not presented as a guarantee. |
| Replay requires deterministic workflow code; external/model calls belong in activities | [Temporal Workflow Definition](https://docs.temporal.io/workflow-definition) | Matches Chapters 16/23 and lesson 16C. |
| JWT delegation actor claim is an object identifying the current actor | [RFC 8693, section 4.1](https://www.rfc-editor.org/rfc/rfc8693.html#section-4.1) | Matches Chapter 20; lifetime and narrowing remain provider-policy choices. |
| gVisor is a userspace application kernel with deployment-specific limits | [gVisor architecture](https://gvisor.dev/docs/architecture_guide/intro/) | Matches the qualified sandbox comparison; no universal strength or startup claim is made. |
| Firecracker host setup is part of production isolation | [Firecracker production host setup](https://github.com/firecracker-microvm/firecracker/blob/main/docs/prod-host-setup.md) | The chapter correctly retains host/jailer configuration as a requirement. |
| EU AI Act obligations differ by risk/role and phase | [European Commission overview](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai) | The high-level, dated summary remains appropriately scoped. No detailed legal applicability conclusion was attempted. |
| ISO/IEC 42001 concerns AI management systems | [Official ISO page](https://www.iso.org/standard/42001) | Matches Chapter 22's distinction from individual-answer correctness. |
| Hypothesis function-scoped fixtures are not reset for every generated input | [Hypothesis health-check reference](https://hypothesis.readthedocs.io/en/latest/reference/api.html#hypothesis.HealthCheck.function_scoped_fixture) | Matches Chapter 24 and lesson 24C. |
| Wilson and kappa definitions | [NIST proportion intervals](https://itl.nist.gov/div898/handbook/prc/section2/prc241.htm), [scikit-learn kappa](https://scikit-learn.org/0.24/modules/generated/sklearn.metrics.cohen_kappa_score.html) | Matches the printed definitions and arithmetic. |
| Candidate-carried judge injection is a demonstrated attack surface | [Shi et al., JudgeDeceiver](https://arxiv.org/abs/2403.17710) | The chapter accurately confines the citation to the attack surface and does not borrow a rate for its fixture. |
| SciPy's degenerate-data warning concerns BCa | [SciPy bootstrap](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.bootstrap.html) | Correctly distinguished from the book's percentile helper. |
| OpenTelemetry span context defaults enable exception and error-status handling | [Python trace API](https://opentelemetry-python.readthedocs.io/en/latest/api/trace.html#opentelemetry.trace.Tracer.start_as_current_span) | Both explicit flags remain present; the parent/framework exposure caveat is retained. |

The remaining research lessons were inspected for their full local text, teaching assumptions, arithmetic and agreement with the chapter. This pass did not reopen and revalidate every research lesson's linked source document.

## Unresolved items and publication limits

1. **Nonblocking editorial consistency:** Chapter 14 primarily uses US spelling (`authorization`, `normalization`); much of chapters 15-26 uses UK spelling (`authorisation`, `normalised`). Both are correct, but the final edition should follow a house style. A full-book spelling pass was deliberately not performed within this limited correction scope, especially because public API names, titles and citations must remain exact.
2. **No new scoped technical blocker identified.** That finding is limited to this source review and the calculations above. It does not turn illustrative adapters, policy interfaces or distributed fencing contracts into executed implementations.
3. **Production and independent review remain separate evidence.** Final PDF layout/link accessibility, live integrations and any independent human domain/editorial review were outside this assignment. Existing prior-review and integration limits remain in force; this report must not be described as human peer review or universal publication readiness.
