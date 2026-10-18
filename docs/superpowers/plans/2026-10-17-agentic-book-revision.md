# Agentic book audited revision implementation plan

> **For agentic workers:** Use the parallel-agent and subagent-driven-development workflow for isolated manuscript domains; the lead integrates and verifies the complete publication.

**Goal:** Apply the approved whole-book audit to one complete, illustrated, reproducible learning edition.

**Architecture:** Retain the existing 39 chapters, A/B/C lessons, cover, typography and ReportLab pipeline. Expand explanations in their existing chapters, add original vector figures, add deterministic runnable companions, then regenerate navigation and validate the single PDF.

**Tech Stack:** Markdown/JSON manuscript, Python, ReportLab, pypdf, Poppler; small isolated Python example environments.

**Spec:** `output/review/Agentic_AI_Engineering_expert_review.md`, approved by the user's “Let's Go ahead”. Detailed domain evidence is in the three linked audit reports.

## Global constraints

- Deliver one complete book at `output/pdf/Agentic_AI_Engineering_complete.pdf`; do not create another visual book.
- Keep cover artwork and selected typography. Preserve substantive chapter topics and all 117 A/B/C labs.
- Keep paragraphs, figures/captions, analogy cards, code units and questions intact on pages.
- Use original editable vector figures, simple connected explanations, explicit analogy limits and labeled toy data.
- Distinguish teaching simulations, real framework execution, and actual production deployment.
- Never use live credentials, effects, clusters or remote user data in examples.
- Do not edit Angular source or commit unrelated untracked publication files.

## Task 1: Foundations and retrieval

**Files:** chapters 01/02/08/12/13/14; new `examples/rag_lab.py`, `examples/test_rag_lab.py`, `examples/RAG_LAB.md`; scoped snippet regression tests.

- [x] Correct retry vocabulary and required-context reservation, with counterexamples.
- [x] Add ML/DL/representation bridge, architecture/adaptation decision preview, compatible embeddings, cosine arithmetic, bi-encoder/reranker contrast and ranked metrics.
- [x] Add a tiny runnable baseline/adaptive retrieval comparison with labeled fixtures and repeat/no-answer/stale/exception cases.
- [x] Explain ANN filtering and PostgreSQL RLS prerequisites; make the MCP transport pair runnable and version-scoped.
- [x] Run meaningful example/regression tests; self-review math and citations.

## Task 2: Runtime, evaluation and telemetry

**Files:** chapters 18/24/25/26; scoped regression tests and runnable judge-evaluation fixture under examples.

- [x] Fix approval ordering and OpenTelemetry flags, including parent-span policy.
- [x] Prove the original edge cases fail then the revised snippets pass with actual exported spans.
- [x] Add proposal supersession, adversarial judge evaluation and degenerate-bootstrap explanation.
- [x] Add concise timelines/comparisons that make these mechanisms inspectable.
- [x] Run scoped tests and check source claims against primary references.

## Task 3: Working capstone integration

**Files:** chapters 31/32/36/37/38, companion `examples/capstone_*`, pinned dependencies and instructions.

- [x] Build a small executable graph with durable checkpoint, bound approval, fake effect ledger and independent recovery verification.
- [x] Test process restart/resume and stale/superseded proposals without live effects.
- [x] Specify a concrete Temporal/graph ownership bridge and crash boundary; provide executable integration logic where feasible and accurately label external-server requirements.
- [x] Make GitOps desired-state revision checks, completion and monitoring-bucket contracts concrete.
- [x] Supply measured expected outputs and a tested version matrix; run tests.

## Task 4: Editorial and publication integration

**Files:** front_matter.md, chapter 11 companion instructions, build_book.py, build_all.py, verify_book.py, README, new focused rendering/accessibility helpers only as needed.

- [x] Improve beginner/collaboration/retrieval/capstone routes and prerequisite blocks.
- [x] Integrate new vector mechanics while preserving all existing lessons and figure-answer links.
- [x] Embed the runnable companion in the PDF with accurate extraction instructions.
- [x] Add semantic reading-order/figure-description support without claiming unverified PDF/UA conformance.
- [x] Replace obsolete no-source-change verification with checks against current build inputs and preserved topic coverage.
- [x] Rebuild to stable pagination/index, run all examples and syntax/layout/link/bounds checks.
- [x] Render affected content and covers; inspect diagrams, code and page transitions; fix defects.
- [x] Update source ZIP and release evidence, deliver the single complete PDF.

## Execution ledger

- Approval: user authorized the recommendations in the completed expert review.
- Ruling: work in the existing publication directory because the manuscript and assets are untracked user artifacts; a Git worktree would omit them. Backup current PDF/source ZIP under `tmp/pdfs/agentic-revision-baseline/` before edits. No Git commits or Angular changes.
- Preflight ownership: foundations owns 01/02/08/12/13/14; runtime owns 18/24/25/26; production owns 31/32/36/37/38; lead owns front matter, 11, renderer/build/verifiers and packaging. Shared interfaces are companion filenames and standard diagram schema; writers do not change renderer or general README.
- Preflight consistency: all tasks preserve chapter numbers and existing labs; added figures are allowed by the new revision contract. Test only actual claimed behavior; do not present mocks as executed cloud integrations.

- Task 1 complete: 13 tests including actual MCP stdio; independent review found no material issues. PostgreSQL deployment remains explicitly unexecuted.
- Task 2 complete: 19 scoped tests; independent review found no material issues.
- Task 3 complete: 8 tests after independent reviewer found and implementer fixed competing-revision reconciliation; scoped re-review passed. Temporal server behavior remains explicitly unexecuted.
- Publication pass 1: 890 pages, 287 visuals, 1,131 internal links, no unit/diagram layout issues. Visual inspection found long vector point labels; shortened and guarded before final rebuild. Tags and embedded attachment round-trip checked.

- Task 4 complete: final 892-page PDF, 287 visuals, 1,131 internal links; no layout/bounds issues. Extracted final attachment passed all 59 tests. Original headings and 117 labs retained; complete source ZIP refreshed.
