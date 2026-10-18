# Publication review: foundations, chapters 01–13

Reviewed 17 October 2026. This is an AI-assisted source, technical, and copyediting review, not human peer review or a rendered-page proofread.

## Scope and outcome

Read the complete text of all thirteen chapter Markdown sources, all thirteen corresponding visual-lesson JSON files (26 A/B lessons), and all thirteen research-lesson JSON files (13 C lessons). Compared the lessons with their chapters for conflicting terminology, arithmetic, guarantees, and examples. Read the editorial contract, source README, and prior foundations/publication review records before making changes. Previously settled corrections were retained.

One reproducible algorithm error was corrected: duplicate document IDs in an individual retrieval list could change the fused order despite the stated deduplication behavior. Four localized clarity edits were made, and eight chapter source-check dates were refreshed after relevant primary-source checks. No learning outcomes, substantive sections, headings, diagrams, checks, exercises, or lesson JSON were changed. One regression was added to the existing snippet test file with the lead agent's expanded authorization.

No additional unresolved blocker was identified in the reviewed chapter source. Publication still depends on the lead review's integration, rebuild, and rendered inspection. This review does not certify external SQL execution, provider API execution, or production readiness of the teaching examples.

## Full source coverage

“Full” below means every chapter paragraph, listing, custom block, and associated A/B/C lesson source was read. It does not imply every cited paper was read in full or every code listing was executed.

| Chapter | Full source coverage | Principal comparison / result |
| --- | --- | --- |
| 01 — LLM Runtime Fundamentals for Agent Engineers | Chapter + A/B/C | Token generation, attention caveat, retry multiplication, and bounded-runtime explanations agree. Retained the explicit distinction between attempts and retries. Source-check date refreshed. |
| 02 — What Is an AI Agent? Anatomy, Autonomy & Boundaries | Chapter + A/B/C | Delegated control, autonomy, and workflow distinctions agree; examples do not treat model output as authority. No edit. |
| 03 — Reasoning & Control Patterns | Chapter + A/B/C | ReAct, planning, structured decision records, and private reasoning distinctions are consistent. Provider-specific continuation guidance remains qualified. Source-check date refreshed. |
| 04 — Prompt & Instruction Architecture | Chapter + A/B/C | Trust boundaries, schema validation, and release/versioning guidance agree. No unsupported guarantee that prompting alone enforces authority. Source-check date refreshed. |
| 05 — Agent Harness Architecture | Chapter + A/B/C | Harness ownership of state, budgets, execution, and evidence is consistent with lessons and later executable example. No edit. |
| 06 — Tool Calling & Action Architecture | Chapter + A/B/C | Tool validation, intent identity, idempotency, retries, and downstream permissions agree. Source-check date refreshed. Research lesson C has a source-URL follow-up described below. |
| 07 — Agent State & Checkpointing | Chapter + A/B/C | Events, state snapshots, replay, and external side effects are distinguished. Corrected a stray handover phrase. |
| 08 — Context Engineering | Chapter + A/B/C | Required-item reservation and token accounting agree with extracted-listing tests. Removed a layout instruction from reader prose; source-check date refreshed. |
| 09 — Memory Architecture | Chapter + A/B/C | Provenance, retention, retrieval scope, and deletion propagation agree. Provenance is not represented as a deletion mechanism. No edit. |
| 10 — Skills & Reusable Capability Architecture | Chapter + A/B/C | Optional resources and progressive disclosure agree with the current Agent Skills specification. Replaced figure-production wording with a clear context/compute explanation. Source-check date refreshed. |
| 11 — Build a Mini Agent Harness From Scratch | Chapter + A/B/C | The durable example, failure boundaries, and explicit limitations are consistent. Existing tests and demo executed. No chapter edit. |
| 12 — RAG Foundations for Agents | Chapter + A/B/C | Retrieval metrics, embedding comparability, and relevance versus authorization remain distinct. Corrected RRF deduplication; independently checked the four lesson-B Wilson intervals. Source-check date refreshed. |
| 13 — Agentic RAG & Advanced Retrieval | Chapter + A/B/C | Adaptive retrieval, HyDE, Self-RAG qualification, GraphRAG, and SQL scope agree. Clarified that row-level policies belong to underlying tables. Existing bounded lexical lab and tests executed. Source-check date refreshed. |

The repeated treatment of authority, provenance, bounded execution, and idempotency serves distinct boundaries across the chapters. No repeated substantive section was removed. Fictional policies, currencies, and workload numbers remain scoped to their examples; no cross-lesson contradiction requiring a content change was found.

## Corrections and evidence

### RRF duplicate handling — chapter 12

The original listing assigned ranks with `enumerate(results, 1)` and then skipped previously seen IDs. A duplicate did not contribute twice, but it still displaced the ranks of later unique documents. This contradicted the stated deduplication behavior and made fusion depend on duplicate occurrence counts.

Using the exact extracted original listing and its default constant:

```text
fuse([['B', 'A'], ['A', 'B']])       -> ['A', 'B']
fuse([['B', 'B', 'A'], ['A', 'B']])  -> ['B', 'A']
```

The corrected listing uses `dict.fromkeys(results)` before assigning ranks, preserving each document's first occurrence and ranking only unique results. Prose now states that order explicitly. Added a primary documentation link for the reciprocal-rank formula and one-based rank convention: [Elastic RRF reference](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion).

`RankFusionRegression.test_duplicate_ids_do_not_change_fused_order` extracts the actual chapter listing, establishes the expected tie-broken order, and tests duplicate insertion in each input list. It does not maintain a copied implementation. The original listing fails the first duplicate case; the corrected listing passes. Additional direct checks covered empty input/lists, nonpositive constants, duplicates, and the lesson-C worked ordering `B, A, D, C` at constant 1.

### Localized copyedits

- Chapter 07: changed “admission-style handover” to “shift handover,” matching the analogy already developed in the chapter.
- Chapter 08: removed an instruction about placing small segment labels in the keyed legend from the reader-facing paragraph. The six-part synthetic allocation and figure remain unchanged.
- Chapter 10: replaced references to “metadata” and “instruction” plates as production artifacts with an explanation of execution compute versus information supplied to the model. The paragraph retains the need to measure the serialized request's actual context overhead.
- Chapter 13: changed a “view with row-level policy” to a view backed by row-level policies on its underlying tables, matching the detailed SQL explanation. No SQL statement was changed.
- Chapters 01, 03, 04, 06, 08, 10, 12, and 13: refreshed their explicit source-check date to 17 October 2026. These dates record relevant documentation verification, not a guarantee that every external page or API was exhaustively tested.

## Reference follow-up assigned to the lead

Research lesson `research_lessons/06.json` cites:

```text
https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/
```

During this pass, that URL returned a page shell containing `references-details-empty`, rather than the article text through the available reader. This observation is narrower than a universal assertion that the URL is dead in every browser. The following official AWS page returned the article body, including caller-provided request identity, atomic recording of identity with mutation, retention windows, and rejection of mismatched parameters:

[AWS: Making retries safe with idempotent APIs](https://builder.aws.com/content/3Ev0BENTyBr0XxzRk5FDZzgNYos/making-retries-safe-with-idempotent-apis)

The lead owns replacement of this reference and any consolidated reference entry. No lesson or reference file was modified by this reviewer. The related retry article's old Builders' Library address redirected successfully to [AWS: Timeouts, retries, and backoff with jitter](https://builder.aws.com/content/3EumjoZascWd1oZiEgL8ORlv3qE/timeouts-retries-and-backoff-with-jitter).

## Verification

Fresh executable checks after the chapter changes:

| Check | Result |
| --- | --- |
| `test_mini_harness.py` | 19 passed, including the real process-exit/restart case after an external commit. |
| `test_rag_lab.py` | 8 passed. |
| `test_foundations_snippets.py` in `/tmp/agentic-foundations-venv` | 6 passed, no skips, including the new RRF regression and existing actual MCP stdio pair. |
| Mini harness demonstration | Waited for review, then completed and verified; exactly one refund recorded. |
| Bounded RAG demonstration | Expected fixed/adaptive outcomes; no-progress stopping preserved. Worked metrics: recall 0.666667, reciprocal rank 0.500000, nDCG 0.530721. |
| Chapter source structure | All 20 Python listings parse; all 136 custom JSON blocks parse; all 39 lesson anchors resolve. |
| Baseline comparison | Heading arrays and every custom block remain identical. This preserves 45 diagrams, 52 checks, and 39 exercises. |
| Lesson 12B arithmetic | All four Wilson intervals independently reproduced with z = 1.96 within floating-point tolerance. |

The three test suites total 33 passing tests. The existing MCP suite extracts chapter 14 solely to run its already-established transport smoke test; this is not a claim to have source-reviewed chapter 14. Python syntax validation is not runtime execution of every listing. The PostgreSQL examples were checked against documentation, not executed against a database. No manuscript build or visual/PDF inspection was performed by this reviewer.

## Primary-source verification ledger

Relevant documentation sections and research abstracts were inspected on 17 October 2026. This is targeted verification of manuscript claims, not a complete re-review of every underlying paper or vendor implementation.

| Topic | Primary sources and verification scope |
| --- | --- |
| Transformer and attention claims | [Attention Is All You Need](https://arxiv.org/abs/1706.03762), abstract/architecture framing; [Attention is not Explanation](https://aclanthology.org/N19-1357/) and [Attention is not not Explanation](https://aclanthology.org/D19-1002/), abstracts and opposing interpretability claims. Retained the chapter's cautious claim that attention weights are not reliable evidence that a factual claim is true. |
| Workflow and agent distinctions | [Anthropic: Building effective agents](https://www.anthropic.com/engineering/building-effective-agents), workflow versus model-directed control and proportional architectural complexity. |
| ReAct and provider reasoning | [ReAct](https://arxiv.org/abs/2210.03629), abstract; [OpenAI reasoning guide](https://developers.openai.com/api/docs/guides/reasoning) and [reasoning best practices](https://developers.openai.com/api/docs/guides/reasoning-best-practices), reasoning-item continuity, model-specific behavior, and direct prompting guidance. No private chain-of-thought guarantee added. |
| Schema and numerical validation | [Pydantic validators](https://docs.pydantic.dev/latest/concepts/validators/), [Pydantic models](https://docs.pydantic.dev/latest/concepts/models/), and [Python Decimal](https://docs.python.org/3/library/decimal.html), default-validation caveats, model validators, decimal representation and context. |
| Retries, intent identity, deadlines | [AWS idempotency article](https://builder.aws.com/content/3Ev0BENTyBr0XxzRk5FDZzgNYos/making-retries-safe-with-idempotent-apis), [AWS retry/backoff article](https://builder.aws.com/content/3EumjoZascWd1oZiEgL8ORlv3qE/timeouts-retries-and-backoff-with-jitter), and [gRPC deadlines](https://grpc.io/docs/guides/deadlines/), relevant body sections on atomic identity, layered attempts, elapsed time, and cooperative cancellation. |
| Release and permission boundaries | [Google SRE release engineering](https://sre.google/sre-book/release-engineering/) and [OWASP excessive agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/), reproducible releases, narrow capabilities, and downstream user scope. |
| State and memory | [Azure event sourcing pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing), [W3C PROV-DM](https://www.w3.org/TR/prov-dm/), and [SQLite atomic commit](https://www.sqlite.org/atomiccommit.html), relevant snapshot, idempotent-consumer, derivation, and transaction-scope sections. SQLite guarantees were not generalized to independent databases. |
| Context and skills | [OpenAI prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching), [Anthropic context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents), and [Agent Skills specification](https://agentskills.io/specification), exact-prefix matching, just-in-time resource loading, required SKILL.md, and optional resource directories. Model-varying retention/pricing was not converted into a universal numeric promise. |
| Retrieval foundations | [DPR](https://arxiv.org/abs/2004.04906) and [RAG](https://arxiv.org/abs/2005.11401), abstracts; [pgvector filtering](https://github.com/pgvector/pgvector#filtering), [Sentence Transformers cross-encoders](https://sbert.net/examples/cross_encoder/applications/README.html), and [Elastic RRF](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/reciprocal-rank-fusion), relevant filtering, pair-scoring, and rank-formula sections. |
| Advanced retrieval | [Self-RAG](https://arxiv.org/abs/2310.11511) and [HyDE](https://arxiv.org/abs/2212.10496), abstracts; [Microsoft GraphRAG](https://microsoft.github.io/graphrag/), extraction, communities, and search overview. The book's simpler controller remains labeled an approximation, and generated hypothetical documents remain retrieval aids rather than evidence. |
| SQL boundaries | [PostgreSQL CREATE VIEW](https://www.postgresql.org/docs/current/sql-createview.html), [row security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html), and [WITH queries](https://www.postgresql.org/docs/current/queries-with.html), security-invoker behavior, bypass/owner caveats, and data-modifying CTEs. These document checks do not replace runtime SQL integration testing. |

## Remaining scope and handoff

No author fact or substantive policy was invented, and no new author decision is required by these localized corrections. Carry forward the documented lack of PostgreSQL runtime verification. Integrate the AWS reference repair, rebuild the publication and source bundle from the corrected sources, and inspect the affected pages for reflow as part of the lead's publication pass. Existing package/API examples were not migrated or modernized merely because newer interfaces may exist.

Changed chapter files: `01.md`, `03.md`, `04.md`, `06.md`, `07.md`, `08.md`, `10.md`, `12.md`, and `13.md`. Additional authorized change: `examples/test_foundations_snippets.py`. This report is the only new file created by this reviewer.
