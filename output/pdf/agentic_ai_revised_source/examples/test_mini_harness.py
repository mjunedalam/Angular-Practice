"""Deterministic contract checks, Python 3.11+, standard library only.
Run: python -m unittest discover -s examples -v
"""
from contextlib import closing
import importlib
import json
import sqlite3
import pathlib
import subprocess
import sys
import tempfile
import unittest

PAYMENT = "PAY-8F2K1Q9ZTX"
PRINCIPAL = {"tenant": "northwind", "user": "cust-77",
             "scopes": ["payments:read", "refunds:execute"]}
ARGS = {"payment_id": PAYMENT, "currency": "INR",
        "amount_minor": 100, "evidence": "duplicate capture"}


def request(args=None, count=1):
    return [{"calls": [
        {"id": f"c{i}", "name": "refund", "args": args or ARGS}
        for i in range(count)
    ]}, {"final": True}]


class HarnessTests(unittest.TestCase):
    def setUp(self):
        source = pathlib.Path(__file__).with_name("mini_harness.py")
        self.assertTrue(source.is_file(), "runtime not implemented")
        self.m = importlib.import_module("mini_harness")
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        root = pathlib.Path(self.tmp.name)
        self.state_db = root / "state.sqlite"
        self.payment_db = root / "payments.sqlite"
        self.now = 1000.0
        self.runtime = self.new_runtime()

    def new_runtime(self):
        return self.m.Harness(self.state_db, self.payment_db,
                              clock=lambda: self.now)

    def begin(self, script=None, principal=None, limits=None):
        return self.runtime.start(
            "refund duplicate", principal or PRINCIPAL,
            script or request(), limits=limits)

    def approve(self, run_id, approved=True):
        st = self.runtime.state(run_id)
        return self.runtime.resume(
            run_id, approved=approved, approver="reviewer",
            binding=st["pending"]["binding"])

    def test_rejected_approval_never_changes_payment(self):
        rid = self.begin()
        self.assertEqual(self.runtime.run(rid)["status"], "waiting")
        self.assertEqual(self.approve(rid, False)["status"], "denied")
        self.assertEqual(self.runtime.refund_count(), 0)

    def test_foreign_owner_cannot_create_a_proposal(self):
        foreign = {**PRINCIPAL, "user": "other"}
        st = self.runtime.run(self.begin(principal=foreign))
        self.assertEqual(st["status"], "denied")
        self.assertEqual(self.runtime.refund_count(), 0)

    def test_restart_approval_preserves_deadline_and_usage(self):
        rid = self.begin()
        before = self.runtime.run(rid)
        self.runtime = self.new_runtime()
        after = self.runtime.state(rid)
        self.assertEqual(after["deadline_at"], 1120.0)
        self.assertEqual(after["usage"], before["usage"])
        final = self.approve(rid)
        self.assertEqual(final["status"], "completed")
        self.assertEqual(self.runtime.refund_count(), 1)

    def test_expired_run_cannot_execute_approved_call(self):
        rid = self.begin(limits={"deadline_s": 5})
        self.runtime.run(rid)
        self.now = 1006.0
        self.assertEqual(self.approve(rid)["status"], "limited")
        self.assertEqual(self.runtime.refund_count(), 0)

    def test_approval_expiry_is_distinct_from_run_deadline(self):
        rid = self.begin(limits={"approval_s": 2})
        self.runtime.run(rid)
        self.now = 1003.0
        self.assertEqual(self.approve(rid)["status"], "expired")
        self.assertEqual(self.runtime.refund_count(), 0)

    def test_mismatched_or_unauthorized_signal_cannot_execute(self):
        rid = self.begin()
        self.runtime.run(rid)
        with self.assertRaises(PermissionError):
            self.runtime.resume(rid, True, "outsider", "wrong")
        with self.assertRaises(ValueError):
            self.runtime.resume(rid, True, "reviewer", "wrong")
        self.assertEqual(self.runtime.state(rid)["status"], "waiting")
        self.assertEqual(self.runtime.refund_count(), 0)

    def test_approval_from_another_run_is_not_replayable(self):
        first, second = self.begin(), self.begin()
        one = self.runtime.run(first)
        self.runtime.run(second)
        with self.assertRaises(ValueError):
            self.runtime.resume(second, True, "reviewer",
                                one["pending"]["binding"])
        self.assertEqual(self.runtime.refund_count(), 0)

    def test_approval_audit_retains_actor_time_and_digest(self):
        rid = self.begin()
        waiting = self.runtime.run(rid)
        st = self.approve(rid)
        intent = next(iter(st["accepted"].values()))
        self.assertIn("review", intent, "accepted intent lacks review audit")
        self.assertEqual(intent["review"]["approver"], "reviewer")
        self.assertEqual(intent["review"]["decided_at"], 1000.0)
        self.assertEqual(intent["review"]["binding"],
                         waiting["pending"]["binding"])

    def test_payment_service_rechecks_owner_on_deduplicated_retry(self):
        rid = self.begin()
        self.runtime.run(rid)
        self.approve(rid)
        key = self.m.effect_key("northwind", ARGS)
        with self.assertRaises(PermissionError):
            self.runtime.payments.refund(
                key, {**PRINCIPAL, "user": "other"}, ARGS)
        self.assertEqual(self.runtime.refund_count(), 1)

    def test_revoked_scope_blocks_execution_after_review(self):
        rid = self.begin()
        self.runtime.run(rid)
        self.runtime.current_scopes = lambda principal: set()
        self.assertEqual(self.approve(rid)["status"], "denied")
        self.assertEqual(self.runtime.refund_count(), 0)

    def test_expired_recovery_retains_pending_reconciliation_record(self):
        rid = self.begin()
        self.runtime.run(rid)
        proc = subprocess.run([
            sys.executable, self.m.__file__, "--crash-after-effect",
            str(self.state_db), str(self.payment_db), rid, str(self.now),
        ], capture_output=True, text=True)
        self.assertEqual(proc.returncode, 77)
        self.now = 1121.0
        self.runtime = self.new_runtime()
        st = self.runtime.run(rid)
        self.assertEqual(st["status"], "limited")
        self.assertEqual(next(iter(st["accepted"].values()))["status"],
                         "pending")
        self.assertEqual(self.runtime.refund_count(), 1)

    def test_false_finish_is_incomplete(self):
        st = self.runtime.run(self.begin(script=[{"final": True}]))
        self.assertEqual(st["status"], "incomplete")
        self.assertEqual(self.runtime.refund_count(), 0)

    def test_budget_is_checked_between_calls_and_on_resume(self):
        script = request()
        script[0]["calls"].append({
            "id": "lookup", "name": "get_payment",
            "args": {"payment_id": PAYMENT}})
        rid = self.begin(script=script, limits={"max_tool_calls": 1})
        self.runtime.run(rid)
        st = self.approve(rid)
        self.assertEqual(st["status"], "limited")
        self.assertEqual(st["usage"]["tool_calls"], 1)
        self.assertEqual(self.runtime.refund_count(), 1)

    def test_cost_reservation_prevents_an_extra_model_turn(self):
        rid = self.begin(limits={"max_cost_minor": 1})
        self.runtime.run(rid)
        st = self.approve(rid)
        self.assertEqual(st["status"], "limited")
        self.assertEqual(st["usage"]["cost_minor"], 1)
        self.runtime = self.new_runtime()
        self.assertEqual(self.runtime.run(rid)["status"], "limited")

    def test_duplicate_wording_does_not_duplicate_effect(self):
        changed = {**ARGS, "evidence": "same payment confirmed"}
        script = request()[:1] + request(changed)
        rid = self.begin(script=script)
        self.runtime.run(rid)
        st = self.approve(rid)
        self.assertEqual(st["status"], "completed")
        self.assertEqual(self.runtime.refund_count(), 1)
        self.assertEqual(self.runtime.refunded_minor(PAYMENT), 100)

    def test_process_exit_after_external_commit_recovers_once(self):
        rid = self.begin()
        self.runtime.run(rid)
        module = pathlib.Path(self.m.__file__)
        proc = subprocess.run([
            sys.executable, str(module), "--crash-after-effect",
            str(self.state_db), str(self.payment_db), rid, str(self.now),
        ], capture_output=True, text=True)
        self.assertEqual(proc.returncode, 77, proc.stderr)
        self.assertEqual(self.runtime.refund_count(), 1)
        self.runtime = self.new_runtime()
        st = self.runtime.run(rid)
        self.assertEqual(st["status"], "completed")
        self.assertEqual(self.runtime.refund_count(), 1)
        self.assertTrue(st["accepted"])

    def test_cancelled_or_terminal_run_rejects_late_approval(self):
        rid = self.begin()
        self.runtime.run(rid)
        self.runtime.cancel(rid)
        self.assertEqual(self.runtime.run(rid)["status"], "cancelled")
        with self.assertRaises(ValueError):
            self.approve(rid)
        self.assertEqual(self.runtime.refund_count(), 0)

    def test_invalid_amount_does_not_create_effect(self):
        rid = self.begin(script=request({**ARGS, "amount_minor": True}))
        self.assertEqual(self.runtime.run(rid)["status"], "invalid")
        self.assertEqual(self.runtime.refund_count(), 0)

    def test_future_state_schema_is_rejected(self):
        rid = self.begin()
        st = self.runtime.state(rid)
        st["schema_version"] = 99
        with closing(sqlite3.connect(self.state_db)) as db:
            with db:
                db.execute("UPDATE runs SET body=? WHERE id=?",
                           (json.dumps(st), rid))
        with self.assertRaises(ValueError):
            self.runtime.state(rid)


if __name__ == "__main__":
    unittest.main()
