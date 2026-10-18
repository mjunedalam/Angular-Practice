# Chapter 11: a small durable harness

The example uses Python 3.11 or later and only the standard library. It runs locally without model credentials or network calls.

From the source-package directory:

```bash
python3 examples/mini_harness.py
python3 -W error::ResourceWarning -m unittest discover -s examples -v
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
