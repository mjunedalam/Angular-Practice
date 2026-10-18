# Retrieval laboratory, edition 2026-10-17

Run from this examples directory with Python 3.12 (standard library only):

```bash
python rag_lab.py
python -m unittest test_rag_lab.py test_foundations_snippets.py
```

This is a runnable lexical/control simulation, not actual neural embeddings,
BM25, a cross-encoder, or an LLM quality benchmark. No model weights, credentials,
remote effects or production data are used. The corpus is immutable source data
inside rag_lab.py, edition `toy-policy-2026-10-17`. Scoring is unique term overlap,
case-folded with the shown regular expression; ties sort by exact ID. Both paths
use k=2, the same current-version/tenant filter and deterministic support rules.
The adaptive default is capped at three backend operations; parent lookups count.

| ID | Purpose |
|---|---|
| returns/v2#4a | Matchable child; lacks complete rule; parent pointer |
| returns/v2#4 | Authoritative fictional rule: unused 30 days, faulty 90 days |
| catalog/v1#blender | Packaging/colour distractor; not policy support |
| manual/v1#ZX-41 | Exact identifier and reset instruction |
| returns/v1#4 | Superseded seven-day rule; always filtered |
| private/v1#1 | Other tenant; always filtered |

`money back` deliberately has no initial lexical matches. The scripted rewrite
`return unused goods` encodes a fixture assumption about ordinary unused returns,
not general language understanding. `interpret` implements only these fixture
contracts; it is not a semantic entailment checker. The colour fixture cannot be
answered by this policy interpreter even though the catalog mentions colour; its
expected abstention tests declared scope. A real general assistant would route
that question to a different answer contract.

Expected measured output (executed with Python 3.12):

```text
corpus=toy-policy-2026-10-17; lexical/toy controller; no LLM
fixed | ZX-41 | answered | queries=1 | sufficient
adaptive | ZX-41 | answered | queries=1 | sufficient
fixed | return faulty blender | insufficient_evidence | queries=1 | fixed_complete
adaptive | return faulty blender | answered | queries=2 | sufficient
fixed | money back | insufficient_evidence | queries=1 | fixed_complete
adaptive | money back | answered | queries=2 | sufficient
fixed | lunar delivery insurance | insufficient_evidence | queries=1 | fixed_complete
adaptive | lunar delivery insurance | insufficient_evidence | queries=2 | no_progress
fixed | colour | insufficient_evidence | queries=1 | fixed_complete
adaptive | colour | insufficient_evidence | queries=2 | no_progress
worked recall=0.666667 RR=0.500000 nDCG=0.530721
```

The exception trace is `search:return faulty blender`, adding child and catalog,
then `parent:returns/v2#4`, adding the rule plus exception. The fixed path abstains
rather than inventing an eligibility rule. The no-answer and repeated-evidence
fixtures stop at no_progress after two operations. No supported answer means no
refund authority: this lab performs retrieval and interpretation only.

The metric fixture has three relevant corpus IDs A/B/C and ranking X/A/B.
Recall@3=2/3, reciprocal rank=1/2. Binary gain and log2(rank+1) discount give
DCG=1.13093, ideal DCG=2.13093, nDCG=0.530721. Duplicate IDs are removed before
scoring. Zero-relevant cases raise instead of silently entering the recall mean;
measure their abstention separately. These values describe this toy fixture only.

Extend it by replacing the lexical scorer with a pinned real encoder/index,
recording its manifest and preserving filters, then comparing held-out labels.
Separately replace the scripted controller with a bounded model decision. Report
retrieval metrics, answer support, queries, latency and cost under the actual
implementation; do not attribute this deterministic result to an unrun LLM.

## Optional MCP transport smoke test

Chapter 14 contains the complete server, client function and client entry point.
The regression test extracts these exact listings into a temporary directory,
launches the subprocess and asserts its actual synthetic response. In an isolated
environment install `mcp[cli]==2.3.0`, then run:

```bash
python -m unittest test_foundations_snippets.py
```

Tested: Python 3.12, MCP 2.3.0, local stdio, synthetic public data. The companion
smoke test is skipped if MCP is absent. A separate edition check exercised invalid
window, disallowed service, allowed resource and disallowed resource. No OAuth,
remote server, production metrics or multi-tenant MCP deployment was tested.
Generic dict output in this SDK returned a JSON text block; the client normalizes
it when structured_content is absent. Exact provider/database dependency locks
belong to the deployments that exercise those integrations.

## PostgreSQL prerequisite lab

Chapter 13 provides a disposable PostgreSQL 15+ schema, invoker view, underlying
RLS policy, two-tenant query and transaction cleanup checks. These SQL listings
were not executed: local libpq tools existed but initdb could not locate a
postgres server binary. An unrelated listening database was deliberately unused.
Treat the two-tenant, unbound-session and pooled rollback checks as required
integration work before claiming the application isolates real tenants. A custom
session setting is trusted middleware state only for the narrow typed-query path;
arbitrary generated SQL must not be allowed to change its own tenant identity.
