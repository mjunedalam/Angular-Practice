# Runnable companion to the complete book

Version 1.0-rc.1, prepared 17 October 2026: publication review candidate. Read `../LICENSE_STATUS.txt` for the pending code reuse decision. Corrections: juned.alam.dev@gmail.com.

Extract the PDF attachment or separate companion download and keep `examples/` beside `chapters/`. Run commands from their parent folder. The chapter files are included so regression tests execute the printed code itself. Start with the standard-library labs; install optional dependencies in separate virtual environments.

| Lab | Guide | Environment and scope |
|---|---|---|
| Durable harness, Chapter 11 | Below | Python 3.11+ standard library; real SQLite, fake payment service |
| Fixed/adaptive retrieval, Chapters 12-13 | RAG_LAB.md | Python 3.12 standard library; lexical search and scripted fixture interpreter |
| MCP connection, Chapter 14 | RAG_LAB.md | MCP 2.3.0; actual local stdio, synthetic metrics |
| Judge and telemetry, Chapters 24-26 | RUNTIME_LABS.md | Judge fixture: standard library; tracing: OpenTelemetry 1.45.1 |
| Graph capstone, Chapters 31-38 | CAPSTONE_LAB.md | Pinned LangGraph + SQLite; real graph, simulated external services |

## Quick start without external packages

```bash
python3 examples/mini_harness.py
python3 examples/rag_lab.py
python3 examples/judge_attack_lab.py
python3 -m unittest discover -s examples -p 'test_mini_harness.py' -v
python3 -m unittest discover -s examples -p 'test_rag_lab.py' -v
python3 -m unittest discover -s examples -p 'test_judge_attack_lab.py' -v
```

For the optional telemetry suite, install `examples/requirements-runtime.txt` into a fresh environment and run `test_runtime_snippets.py` with unittest discovery. The exact MCP snippet suite is `test_foundations_snippets.py`; its optional transport test skips when MCP is absent. The capstone has its own fully pinned requirements and commands in its guide. Running every test under one environment is not required and can mix unrelated dependency baselines.

The tested systems use no real customer data, model credentials or live business effects. Deterministic fixture results are not model-quality benchmarks. The Temporal server bridge and PostgreSQL deployment setup have explicit unexecuted integration requirements in their guides. The purpose of each limitation is to identify exactly what evidence a production adapter must still supply.

---

# Chapter 11: a small durable harness

The example uses Python 3.11 or later and only the standard library. It runs locally without model credentials or network calls.

From the source-package directory:

```bash
python3 examples/mini_harness.py
python3 -W error::ResourceWarning -m unittest discover -s examples -p 'test_mini_harness.py' -v
```

The demonstration pauses a refund for review, resumes with an approval bound to the exact request, and prints a completed result with one refund. It uses temporary SQLite databases that are removed when the demonstration exits.

The tests also launch a separate process and terminate it after the fake payment service commits. A restarted harness recovers the accepted intent and retrieves the same payment result. The payment service commits its effect key and balance change in one transaction; that downstream contract is essential to the demonstrated deduplication property.

## What the example demonstrates

- Persisted run state, absolute deadlines and usage budgets.
- Per-tool authorization, argument validation and tenant/owner checks.
- Explicit approval outcomes bound to run, principal, tool version and reviewed arguments.
- Stable logical effect identity independent of descriptive evidence.
- Rejected, expired, cancelled, limited and incomplete outcomes distinct from completion.
- Recovery after a real process exit, plus verification of the accepted fake payment effects.

## Boundaries of the example

Advance each run with one writer. The example does not supply distributed leases, fencing or concurrent workflow ownership. Its synchronous tools are local operations; it does not implement hard timeouts for arbitrary network calls.

The caller supplies an authenticated principal and approver identity. This is an internal teaching API, not an HTTP authentication service. Current authorization can be supplied through the scope lookup callback.

The effect identity represents one logical refund for a tenant, payment, currency and amount tuple. A business that supports multiple independent refunds with the same values needs a separate stable business-operation identifier. An expired deadline or revoked permission may require manual reconciliation of an already accepted effect.

Completion checks the accepted fake refund effects, not arbitrary natural-language goals. See Chapter 11 for the connection between these boundaries and production extensions.
