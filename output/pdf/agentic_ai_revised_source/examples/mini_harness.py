"""A small durable teaching harness, Python 3.11+, stdlib only.

Contracts:
* One advancing writer per run. Distributed leases/fencing are out of scope.
* State is SQLite JSON. Payment effects use a separate SQLite service with
  atomic key deduplication and balance checks. This is the downstream
  contract behind the crash-recovery guarantee, not a universal API claim.
* Absolute deadlines and usage survive restarts. Calls are local synchronous
  operations; arbitrary network timeouts/hard cancellation are not supplied.
* Scripted model responses cost exactly one illustrative accounting unit.
* API callers supply authenticated principals/approvers. This demo does not
  implement an HTTP identity service; current scope lookup can be injected.

Run the demonstration: python examples/mini_harness.py
Run checks: python -m unittest discover -s examples -v
"""
from __future__ import annotations

import argparse
from contextlib import closing, contextmanager
import hashlib
import json
import os
import sqlite3
import tempfile
import time
import uuid
from pathlib import Path
from typing import Callable

PAYMENT = "PAY-8F2K1Q9ZTX"
DEFAULT_LIMITS = {
    "max_turns": 8, "max_tool_calls": 12,
    "max_cost_minor": 8, "deadline_s": 120, "approval_s": 30,
}
TOOL_VERSIONS = {"get_payment": "1.0.0", "refund": "1.0.0"}
TERMINAL = {"completed", "incomplete", "denied", "invalid",
            "limited", "cancelled", "expired", "unknown"}


@contextmanager
def connection(path):
    with closing(sqlite3.connect(path)) as db:
        with db:
            yield db


def canonical(value):
    return json.dumps(value, sort_keys=True, separators=(",", ":"))


def effect_key(tenant, args):
    identity = {"tenant": tenant, "payment": args["payment_id"],
                "currency": args["currency"],
                "amount_minor": args["amount_minor"]}
    return hashlib.sha256(canonical(identity).encode()).hexdigest()


def approval_binding(state, call, args):
    reviewed = {
        "run_id": state["run_id"],
        "principal": {k: state["principal"][k] for k in ("tenant", "user")},
        "tool": call["name"], "version": TOOL_VERSIONS[call["name"]],
        "reviewed_args": args,
    }
    return hashlib.sha256(canonical(reviewed).encode()).hexdigest()


def validate_call(call):
    if not isinstance(call, dict) or not isinstance(call.get("id"), str):
        raise ValueError("call must have a string identifier")
    if call.get("name") not in {"get_payment", "refund"}:
        raise ValueError("unknown tool")
    args = call.get("args")
    if not isinstance(args, dict):
        raise ValueError("arguments must be an object")
    if not isinstance(args.get("payment_id"), str):
        raise ValueError("payment_id must be a string")
    if call["name"] == "get_payment":
        if set(args) != {"payment_id"}:
            raise ValueError("unexpected lookup argument")
        return dict(args)
    required = {"payment_id", "currency", "amount_minor", "evidence"}
    if set(args) != required or args["currency"] != "INR":
        raise ValueError("refund shape/currency is invalid")
    if type(args["amount_minor"]) is not int or args["amount_minor"] <= 0:
        raise ValueError("amount must be a positive integer in minor units")
    if not isinstance(args["evidence"], str) or len(args["evidence"]) > 500:
        raise ValueError("evidence must be a bounded string")
    return dict(args)


class Store:
    def __init__(self, path):
        self.path = str(path)
        with connection(self.path) as db:
            db.execute("CREATE TABLE IF NOT EXISTS runs "
                       "(id TEXT PRIMARY KEY, body TEXT NOT NULL)")

    def save(self, state):
        with connection(self.path) as db:
            db.execute("INSERT INTO runs VALUES (?, ?) "
                       "ON CONFLICT(id) DO UPDATE SET body=excluded.body",
                       (state["run_id"], canonical(state)))

    def load(self, run_id):
        with connection(self.path) as db:
            row = db.execute("SELECT body FROM runs WHERE id=?",
                             (run_id,)).fetchone()
        if row is None:
            raise KeyError(run_id)
        state = json.loads(row[0])
        if state.get("schema_version") != 1:
            raise ValueError("unsupported state schema")
        return state


class Payments:
    """Local fake service: effect key + balance update commit atomically."""
    def __init__(self, path):
        self.path = str(path)
        with connection(self.path) as db:
            db.execute("CREATE TABLE IF NOT EXISTS payments ("
                       "id TEXT PRIMARY KEY, tenant TEXT, owner TEXT, "
                       "captured INTEGER, refunded INTEGER DEFAULT 0)")
            db.execute("CREATE TABLE IF NOT EXISTS refunds ("
                       "effect_key TEXT PRIMARY KEY, payment TEXT, "
                       "amount INTEGER, result TEXT)")
            db.execute("INSERT OR IGNORE INTO payments "
                       "VALUES (?, 'northwind', 'cust-77', 100, 0)",
                       (PAYMENT,))

    def read(self, payment):
        with connection(self.path) as db:
            row = db.execute("SELECT tenant, owner, captured, refunded "
                             "FROM payments WHERE id=?", (payment,)).fetchone()
        if row is None:
            raise ValueError("unknown payment")
        return dict(zip(("tenant", "owner", "captured", "refunded"), row))

    def result(self, key):
        with connection(self.path) as db:
            row = db.execute("SELECT result FROM refunds WHERE effect_key=?",
                             (key,)).fetchone()
        return json.loads(row[0]) if row else None

    def refund(self, key, principal, args):
        with connection(self.path) as db:
            db.execute("BEGIN IMMEDIATE")
            row = db.execute("SELECT tenant, owner, captured, refunded "
                             "FROM payments WHERE id=?",
                             (args["payment_id"],)).fetchone()
            if not row or row[:2] != (principal["tenant"], principal["user"]):
                raise PermissionError("payment ownership changed")
            if key != effect_key(principal["tenant"], args):
                raise ValueError("key does not match the business effect")
            old = db.execute("SELECT result FROM refunds WHERE effect_key=?",
                             (key,)).fetchone()
            if old:
                return json.loads(old[0])
            amount = args["amount_minor"]
            if amount > row[2] - row[3]:
                raise ValueError("amount exceeds refundable balance")
            result = {"refund_id": f"RF-{key[:12]}", "status": "succeeded",
                      "payment_id": args["payment_id"], "amount_minor": amount}
            db.execute("UPDATE payments SET refunded=refunded+? WHERE id=?",
                       (amount, args["payment_id"]))
            db.execute("INSERT INTO refunds VALUES (?, ?, ?, ?)",
                       (key, args["payment_id"], amount, canonical(result)))
            return result

    def count(self):
        with connection(self.path) as db:
            return db.execute("SELECT count(*) FROM refunds").fetchone()[0]


class Harness:
    def __init__(self, state_path, payment_path, clock=time.time,
                 current_scopes: Callable | None = None):
        self.store = Store(state_path)
        self.payments = Payments(payment_path)
        self.clock = clock
        self.current_scopes = current_scopes or (
            lambda principal: set(principal["scopes"]))

    def state(self, run_id):
        return self.store.load(run_id)

    def emit(self, state, kind, **data):
        state["events"].append({"seq": len(state["events"]) + 1,
                                "kind": kind, "at": self.clock(), **data})

    def start(self, goal, principal, script, limits=None):
        chosen = {**DEFAULT_LIMITS, **(limits or {})}
        if any(type(v) is not int or v <= 0 for v in chosen.values()):
            raise ValueError("limits must be positive integers")
        if set(chosen) != set(DEFAULT_LIMITS):
            raise ValueError("unknown limit")
        if set(principal) != {"tenant", "user", "scopes"}:
            raise ValueError("invalid principal")
        if not all(isinstance(principal[k], str) for k in ("tenant", "user")):
            raise ValueError("invalid identity")
        if not isinstance(principal["scopes"], list):
            raise ValueError("scopes must be a list")
        state = {"schema_version": 1, "run_id": uuid.uuid4().hex,
                 "goal": goal, "principal": json.loads(canonical(principal)),
                 "status": "running", "limits": chosen,
                 "created_at": self.clock(),
                 "deadline_at": self.clock() + chosen["deadline_s"],
                 "script": script, "cursor": 0, "queue": [],
                 "pending": None, "accepted": {}, "observations": [],
                 "events": [], "reason": None,
                 "usage": {"turns": 0, "tool_calls": 0, "cost_minor": 0}}
        self.emit(state, "run_started")
        self.store.save(state)
        return state["run_id"]

    def finish(self, state, status, reason):
        state["status"], state["reason"] = status, reason
        self.emit(state, "run_finished", status=status, reason=reason)
        self.store.save(state)
        return state

    def allowed(self, state, call, args):
        principal = state["principal"]
        scope = "refunds:execute" if call["name"] == "refund" else "payments:read"
        if scope not in self.current_scopes(principal):
            return False
        payment = self.payments.read(args["payment_id"])
        return (payment["tenant"], payment["owner"]) == (
            principal["tenant"], principal["user"])

    def check_budget(self, state, operation):
        if self.clock() >= state["deadline_at"]:
            return "deadline"
        usage, limits = state["usage"], state["limits"]
        if operation == "model":
            if usage["turns"] >= limits["max_turns"]:
                return "max_turns"
            if usage["cost_minor"] + 1 > limits["max_cost_minor"]:
                return "max_cost"
        if operation == "tool" and usage["tool_calls"] >= limits["max_tool_calls"]:
            return "max_tool_calls"
        return None

    def observe(self, state, call, data, deduplicated=False):
        state["observations"].append({"call_id": call["id"],
                                      "tool": call["name"], "data": data,
                                      "deduplicated": deduplicated})
        state["queue"].pop(0)
        self.emit(state, "tool_result", call_id=call["id"], data=data)
        self.store.save(state)

    def execute(self, state, call, crash_after_effect=False):
        try:
            args = validate_call(call)
            if not self.allowed(state, call, args):
                return self.finish(state, "denied", "forbidden")
        except (ValueError, KeyError, TypeError) as error:
            return self.finish(state, "invalid", str(error))
        if reason := self.check_budget(state, "boundary"):
            return self.finish(state, "limited", reason)
        if call["name"] == "get_payment":
            if reason := self.check_budget(state, "tool"):
                return self.finish(state, "limited", reason)
            state["usage"]["tool_calls"] += 1
            self.observe(state, call, self.payments.read(args["payment_id"]))
            return state
        key = effect_key(state["principal"]["tenant"], args)
        intent = state["accepted"].get(key)
        if intent and intent["status"] == "confirmed":
            self.observe(state, call, intent["result"], True)
            return state
        if intent and intent["status"] == "pending":
            result = self.payments.result(key)
            if result:
                intent.update(status="confirmed", result=result)
                self.observe(state, call, result, True)
                return state
        if not intent:
            if reason := self.check_budget(state, "tool"):
                return self.finish(state, "limited", reason)
            digest = approval_binding(state, call, args)
            state["pending"] = {"call": call, "binding": digest,
                                "effect_key": key,
                                "tool_version": TOOL_VERSIONS[call["name"]],
                                "expires_at": self.clock() +
                                state["limits"]["approval_s"]}
            state["status"] = "waiting"
            self.emit(state, "approval_requested", binding=digest, effect_key=key)
            self.store.save(state)
            return state
        if reason := self.check_budget(state, "tool"):
            return self.finish(state, "limited", reason)
        state["usage"]["tool_calls"] += 1
        self.store.save(state)
        try:
            result = self.payments.refund(key, state["principal"], args)
        except (ValueError, PermissionError) as error:
            return self.finish(state, "denied", str(error))
        if crash_after_effect:
            os._exit(77)
        intent.update(status="confirmed", result=result)
        self.observe(state, call, result)
        return state

    def verified(self, state):
        intents = state["accepted"]
        return bool(intents) and all(
            intent["status"] == "confirmed" and
            self.payments.result(key) == intent["result"]
            for key, intent in intents.items())

    def run(self, run_id):
        state = self.state(run_id)
        while state["status"] == "running":
            if state["queue"]:
                self.execute(state, state["queue"][0])
                continue
            if reason := self.check_budget(state, "model"):
                return self.finish(state, "limited", reason)
            if state["cursor"] >= len(state["script"]):
                return self.finish(state, "incomplete", "script_exhausted")
            # This fake model has a declared, fixed cost of one unit.
            state["usage"]["turns"] += 1
            state["usage"]["cost_minor"] += 1
            response = state["script"][state["cursor"]]
            state["cursor"] += 1
            self.emit(state, "model_called")
            if response.get("final"):
                ok = self.verified(state)
                return self.finish(state, "completed" if ok else "incomplete",
                                   "verified" if ok else "unverified_finish")
            calls = response.get("calls")
            if not isinstance(calls, list) or not calls:
                return self.finish(state, "invalid", "missing_calls")
            if len(calls) > 16:
                return self.finish(state, "invalid", "batch_too_large")
            state["queue"] = calls
            self.store.save(state)
        return state

    def resume(self, run_id, approved, approver, binding,
               crash_after_effect=False):
        state = self.state(run_id)
        if state["status"] != "waiting" or not state["pending"]:
            raise ValueError("run has no resumable approval")
        if approver != "reviewer":
            raise PermissionError("untrusted approver")
        if type(approved) is not bool:
            raise ValueError("approval outcome must be boolean")
        pending = state["pending"]
        call = pending["call"]
        args = validate_call(call)
        actual = approval_binding(state, call, args)
        if binding != pending["binding"] or actual != binding:
            raise ValueError("approval does not bind this exact effect")
        if not approved:
            self.emit(state, "approval_resolved", binding=binding,
                      approved=False, approver=approver,
                      decided_at=self.clock())
            return self.finish(state, "denied", "approval_rejected")
        if reason := self.check_budget(state, "boundary"):
            return self.finish(state, "limited", reason)
        if self.clock() >= pending["expires_at"]:
            return self.finish(state, "expired", "approval_expired")
        key = effect_key(state["principal"]["tenant"], args)
        review = {"approver": approver, "decided_at": self.clock(),
                  "binding": binding, "approved": True,
                  "tool": call["name"],
                  "tool_version": TOOL_VERSIONS[call["name"]]}
        state["accepted"][key] = {"status": "pending", "call": call,
                                  "review": review}
        state["pending"] = None
        state["status"] = "running"
        self.emit(state, "approval_resolved", effect_key=key, **review)
        # Accepted intent is durable before the separate payment transaction.
        self.store.save(state)
        self.execute(state, call, crash_after_effect=crash_after_effect)
        return self.run(run_id)

    def cancel(self, run_id):
        state = self.state(run_id)
        if state["status"] not in TERMINAL:
            self.finish(state, "cancelled", "requested")

    def refund_count(self):
        return self.payments.count()

    def refunded_minor(self, payment):
        return self.payments.read(payment)["refunded"]


def demonstration():
    with tempfile.TemporaryDirectory() as directory:
        root = Path(directory)
        harness = Harness(root / "state.sqlite", root / "payments.sqlite")
        principal = {"tenant": "northwind", "user": "cust-77",
                     "scopes": ["payments:read", "refunds:execute"]}
        args = {"payment_id": PAYMENT, "currency": "INR",
                "amount_minor": 100, "evidence": "verified duplicate"}
        script = [{"calls": [{"id": "c1", "name": "refund", "args": args}]},
                  {"final": True}]
        rid = harness.start("refund duplicate", principal, script)
        waiting = harness.run(rid)
        print("before review:", waiting["status"])
        finished = harness.resume(rid, True, "reviewer",
                                  waiting["pending"]["binding"])
        print("after review:", finished["status"], finished["reason"])
        print("refunds:", harness.refund_count())


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--crash-after-effect", nargs=4,
                        metavar=("STATE_DB", "PAYMENTS_DB", "RUN_ID", "NOW"))
    options = parser.parse_args()
    if options.crash_after_effect:
        state_db, payment_db, rid, now = options.crash_after_effect
        harness = Harness(state_db, payment_db, clock=lambda: float(now))
        binding = harness.state(rid)["pending"]["binding"]
        harness.resume(rid, True, "reviewer", binding, crash_after_effect=True)
    else:
        demonstration()
