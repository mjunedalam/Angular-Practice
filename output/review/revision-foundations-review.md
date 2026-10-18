# Foundations revision review

**No material issues found in the reviewed revision.**

Reviewed the approved whole-book audit and foundations revision report, chapters 01, 02, 08, 12, 13 and 14, and `examples/rag_lab.py`, `test_rag_lab.py`, `test_foundations_snippets.py` and `RAG_LAB.md`. Review was limited to source and scoped execution; no manuscript changes, commits or PDF builds were made.

- **C3/C4:** Chapter 8 reserves the complete required set before optional admission and produces text/manifest from the same ranked pairs. The optional-60/required-50 counterexample, infeasible required set, presentation order and overhead regressions pass. Chapter 1 consistently distinguishes four total attempts per layer (16 downstream attempts) from four extra retries per layer (25).
- **Primer and architecture:** The added ML/transformer bridge correctly separates training, inference, request context and application state; causal attention and analogy limitations are qualified. Chapter 2's early architecture/adaptation decision map preserves the distinction between missing facts and learned behavior.
- **Retrieval arithmetic:** Independently recomputed cosine values 0.8, 0.6 and -1, and recall 2/3, RR 0.5 and binary nDCG@3 0.5307212739772434. The text states relevance, gain, discount and evaluation-depth assumptions. Compatible encoders, ANN filtering and parent expansion are qualified appropriately.
- **Bounded lab:** Actual demo output matches RAG_LAB.md. Both paths use the same tenant/current filters; parent reads consume the cap; repeated/no-answer cases stop; baseline abstention and adaptive exception/rewrite fixture outcomes match implementation. Lexical overlap, fixture-specific interpretation, the money-back assumption and absence of neural/LLM benchmarks are explicit. The toy code does not substantiate production generalization, and the manuscript does not claim that it does.
- **MCP:** The extracted actual Chapter 14 server/client listings execute together with MCP 2.3.0 through the stdio subprocess target. The smoke test verifies the returned synthetic checkout-api p95=1800 result, including fallback normalization of JSON text content. Remote authentication and production metrics remain outside the stated test scope.
- **PostgreSQL:** The setup uses underlying-table RLS, a PostgreSQL 15+ invoker view, a non-owner/non-bypass role, transaction-local identity and parameterized operations. The session-writable identity caveat correctly excludes arbitrary SQL. Two-tenant, fresh-unbound and pooled transaction cleanup verification remains explicitly required integration work: SQL was inspected but not executed in this review, consistent with the revision's disclosed missing server binary. No actual isolation guarantee is inferred from that unexecuted setup.

Verification on 17 October 2026 using `/tmp/agentic-foundations-venv/bin/python`:

- `python -m unittest discover -s output/pdf/agentic_ai_complete_source/examples -p 'test*foundations*' -v`: **5 passed**, including the actual MCP subprocess test; no skips.
- `python -m unittest discover -s output/pdf/agentic_ai_complete_source/examples -p 'test_rag_lab.py' -v`: **8 passed**.
- Ran `rag_lab.py`; all ten fixed/adaptive fixture lines and the metric line match the documented output.
- Parsed all 12 Python listings across the six scoped chapters successfully; each chapter retains four checks and three exercises.

This is a source/fixture review, not validation of PDF layout, database runtime security, remote MCP/OAuth, real models, or broad retrieval quality.

## Final rendered-page inspection

Inspected the full PNG renders from the final 892-page build in `tmp/pdfs/agentic-revision-final`: PDF viewer pages **20, 209, 214, 221, 241, 244, 148, 255 and 257** (printed pages 7, 196, 201, 208, 228, 231, 135, 242 and 244 respectively).

**No material visual defects found on these pages.** The next-token flow, shortened A/B/C vector labels and cosine legend, parent/exception comparison, ranking arithmetic, RLS boundary and fixed/adaptive comparison are legible and aligned with their captions. Diagram labels remain inside their containers; the cosine/ranking values agree with the source arithmetic. The context selector and both MCP files retain complete code units, readable indentation and adjacent assembly instructions. No clipped glyphs, overlapping labels or broken figure/caption grouping were visible on the inspected pages. This sample inspection does not assert visual coverage of the other pages.
