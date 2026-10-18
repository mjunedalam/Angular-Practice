# Foundations revision report - 17 October 2026

## Changed files

All paths below are inside `output/pdf/agentic_ai_complete_source/` unless noted.

- `chapters/01.md`: corrected extra-retry versus total-attempt vocabulary (C4/F-01); compact ML/deep-learning/representations/transformer/training/inference bridge and analogy limit; one original flow figure.
- `chapters/02.md`: early architecture decision and prompting/retrieval/fine-tuning/serving diagnosis preview, linked to Chapters 30/35.
- `chapters/08.md`: reserves all required context before optional selection (C3/F-02), retains ranked presentation/paired provenance and explicit infeasible-set failure; worked counterexample.
- `chapters/12.md`: compatible query/document embedding configuration, worked cosine, bi-encoder/cross-encoder distinction, ANN filtering/recall, rule/exception expansion, worked recall/RR/nDCG and runnable-lab route. New vectors, comparison and ranking figures.
- `chapters/13.md`: runnable toy trace; PostgreSQL underlying-table RLS, invoker-view semantics, role bypass, authenticated transaction-local identity, pool cleanup and writable-setting caveat; disposable two-tenant SQL setup/checks; two original figures.
- `chapters/14.md`: complete matched stdio server/client/entry-point path pinned to MCP 2.3.0; direct script `mcp.run(transport="stdio")`; tested content normalization when structured_content is absent.
- `examples/rag_lab.py`, `examples/test_rag_lab.py`, `examples/RAG_LAB.md`: versioned lexical corpus and fixed/adaptive control lab, explicit toy scope, exact ID, rule exception, stale/foreign tenant, no-answer, repeated evidence, cap, rewrite and metric checks; measured expected output.
- `examples/test_foundations_snippets.py`: executes actual chapter context listing and optional actual MCP subprocess listing, not copied functions.

Existing chapter substantive sections, all four checks and three exercises per chapter, original figures, and A/B/C lesson files were retained. No renderer, shared README, Angular files, commits or PDF builds changed by this worker.

## Executed evidence

Bundled Python: `/Users/junedalam/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3` (3.12).

- Before fixes, context regression reproduced `ValueError: required item does not fit` for optional 60/required 50 in capacity 100; retry wording assertion failed. Two other context tests already passed.
- After fixes, four core regression tests pass. With isolated `/tmp/agentic-foundations-venv`, `mcp[cli]==2.3.0`, all five `test_foundations_snippets.py` tests pass, including extraction and real stdio subprocess invocation.
- Eight `test_rag_lab.py` tests pass. Demo output is captured verbatim in RAG_LAB.md. Fixed/adaptive both answer exact ZX-41 in one query; exception and rewrite improve from abstention to supported fixture answer with two queries; no-answer/repeated evidence abstain and stop at two. Worked recall=.666667, RR=.5, nDCG=.530721.
- Additional actual SDK check passed invalid window, forbidden tool service, allowed runbook and forbidden runbook (four checks). Negotiated protocol reported `2026-07-28`. Synthetic result: checkout-api, window 60, p50=210, p95=1800, synthetic=True.
- Real execution caught two integration gaps before finalization: package has no `mcp.__main__`, so direct server script is used; dict output returned JSON text with structured_content=None, so explicit normalization was added.
- All owned chapter Python blocks parse. Maximum 29 lines and 69 columns across final listings. All diagram JSON parses; each owned chapter still has four checks/three exercises.

## Explicit limits and integration needs

- No neural embedding, learned reranker, model planner or LLM benchmark was run. The lab is lexical overlap plus explicitly labeled fixture rewrite/interpreter. Claims are restricted to fixture outcomes.
- Local libpq tools existed, but isolated initdb failed because no matching postgres server binary exists. An unrelated listening database was unused. SQL setup is concrete and reader-testable, but **not executed**. Required release/deployment integration: PostgreSQL 15+ actual runtime role, A-to-B denial through view, B view, fresh unbound session, pool commit/rollback cleanup, timeout and role escalation checks. Custom settings are not a defense against arbitrary SQL; manuscript explicitly restricts this identity technique to reviewed typed operations.
- MCP smoke covers synthetic local stdio only, no remote OAuth or real metrics. RAG_LAB.md states this clearly. Optional smoke skips without MCP installed; standard-library core tests remain runnable.
- Lead renderer needs the offered `vectors` kind (`query`, items with `label`/`vector`) and `ranking` kind (items with `label`/`relevance`, `total_relevant`, `k`). JSON uses the agreed schemas. Other new figures use existing flow/comparison/boundary kinds.
- Rebuild source ZIP, companion attachment and PDF with new files; regenerate index/navigation and inspect new figure layouts and split MCP client units. No PDF rendering performed by this worker.

## Primary source checks

Checked via web on 17 October 2026; direct links are included at the relevant manuscript explanations.

- Transformer architecture and causal-mask distinction: https://arxiv.org/abs/1706.03762 (original encoder-decoder architecture explicitly distinguished from all modern causal implementations).
- Compatible dual-encoder retrieval: https://arxiv.org/abs/2004.04906 (used architecture only; no research benchmark imported into lab claims).
- Bi-encoder versus cross-encoder shortlist tradeoff: https://sbert.net/examples/cross_encoder/applications/README.html
- ANN post-scan filtering and iterative scans: https://github.com/pgvector/pgvector#filtering
- View invoker/owner privileges and policy semantics: https://www.postgresql.org/docs/current/sql-createview.html
- Underlying-table RLS, default deny, owner/superuser/BYPASSRLS behavior: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- Actual stdio target and subprocess lifecycle: https://py.sdk.modelcontextprotocol.io/client/transports/
- SDK Client and result contracts: https://py.sdk.modelcontextprotocol.io/client/

The context correction and ranked arithmetic rely on executable counterexamples and direct arithmetic, not an external authority claim.
