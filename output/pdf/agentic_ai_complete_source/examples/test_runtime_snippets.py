"""Execute the exact manuscript functions; no hand-copied replacements."""
from contextlib import nullcontext
from pathlib import Path
import re
from types import SimpleNamespace as S
import unittest

CHAPTERS = Path(__file__).resolve().parents[1] / "chapters"
MARKER = "PRIVATE_SYNTHETIC_MARKER customer@example.test"


def load_function(chapter, name):
    text = (CHAPTERS / f"{chapter:02}.md").read_text()
    blocks = re.findall(r"```python\n(.*?)```", text, re.S)
    block = next(block for block in blocks if f"def {name}(" in block)
    namespace = {}
    exec(compile(block, f"chapter-{chapter}-{name}", "exec"), namespace)
    return namespace[name]


class ApprovalOrderingTests(unittest.TestCase):
    def check(self, *, decided=10, executed=10, expires=30,
              commit_seq=4, execution_seq=5, outcome="approved",
              digest="d8", include=True):
        event = S(kind="effect_executed", approval_required=True,
                  proposal_id="P-8", proposal_digest="d8",
                  executed_at=executed, executed_seq=execution_seq)
        decision = S(outcome=outcome, digest=digest,
                     decided_at=decided, expires_at=expires,
                     committed_seq=commit_seq)
        return load_function(24, "check_protected_effects")(
            [event], {"P-8": decision} if include else {})

    def test_retrospective_approval_is_rejected(self):
        self.assertIn("approval after execution",
                      self.check(decided=20, executed=10))

    def test_equal_clock_time_needs_prior_durable_commit(self):
        self.assertEqual(self.check(), [])
        for commit_seq in (5, 6):
            with self.subTest(commit_seq=commit_seq):
                self.assertIn("approval not committed before execution",
                              self.check(commit_seq=commit_seq))

    def test_wall_clock_alone_cannot_override_causal_order(self):
        self.assertIn("approval not committed before execution",
                      self.check(decided=9, commit_seq=8))

    def test_expiry_is_exclusive(self):
        self.assertEqual(self.check(executed=29), [])
        for executed in (30, 31):
            self.assertIn("expired approval used",
                          self.check(executed=executed))

    def test_existing_outcome_and_binding_rules_remain(self):
        self.assertIn("missing approved decision", self.check(include=False))
        self.assertIn("missing approved decision", self.check(outcome="rejected"))
        self.assertIn("approval binding mismatch", self.check(digest="changed"))

    def test_non_effects_and_unprotected_effects_are_outside_scope(self):
        events = [S(kind="tool_proposed"),
                  S(kind="effect_executed", approval_required=False)]
        self.assertEqual(load_function(24, "check_protected_effects")(
            events, {}), [])


class BootstrapLimitTests(unittest.TestCase):
    def test_constant_observed_differences_are_degenerate(self):
        interval = load_function(25, "paired_case_interval")
        self.assertEqual(interval([(1, 1), (1, 1)]), (0, 0))
        self.assertEqual(interval([(0, 1), (0, 1)]), (1, 1))
        with self.assertRaises(ValueError):
            interval([(1, 1)])


class TelemetryPrivacyTests(unittest.TestCase):
    def exported_spans(self, parent=None, fail=True):
        # A real SDK and exporter exercise context-manager exit behaviour.
        from opentelemetry.sdk.trace import TracerProvider
        from opentelemetry.sdk.trace.export import SimpleSpanProcessor
        from opentelemetry.sdk.trace.export.in_memory_span_exporter import (
            InMemorySpanExporter,
        )
        exporter = InMemorySpanExporter()
        provider = TracerProvider()
        provider.add_span_processor(SimpleSpanProcessor(exporter))
        tracer = provider.get_tracer("manuscript-regression")
        response = S(input_tokens=12, output_tokens=3)

        class Model:
            name = "synthetic-model"

            def generate(self, messages, tools):
                if fail:
                    raise ValueError(MARKER)
                return response

        class Measurements:
            calls = []

            def record_model_call(self, bucket, usage, *, elapsed_s):
                self.calls.append((bucket, usage, elapsed_s))

        metrics = Measurements()
        context = S(run_id="R1", release="v1", context_ref="C1",
                    metric_bucket="support")
        boundary = nullcontext()
        if parent is not None:
            boundary = tracer.start_as_current_span("parent", **parent)
        try:
            with boundary:
                result = load_function(26, "traced_model_call")(
                    Model(), [], [], context, tracer, metrics)
                self.assertIs(result, response)
        except ValueError as error:
            self.assertTrue(fail)
            self.assertEqual(str(error), MARKER)
        finally:
            provider.force_flush()
            spans = exporter.get_finished_spans()
            provider.shutdown()
        return spans, metrics

    def assert_no_marker(self, span):
        # Inspect all exported attributes, events and status, not just a field.
        self.assertNotIn(MARKER, span.to_json())

    def test_error_span_has_safe_type_status_and_no_exception_payload(self):
        from opentelemetry.trace import StatusCode
        spans, metrics = self.exported_spans()
        self.assertEqual(len(spans), 1)
        span = spans[0]
        self.assert_no_marker(span)
        self.assertEqual(span.events, ())
        self.assertEqual(span.attributes["error.type"], "ValueError")
        self.assertEqual(span.status.status_code, StatusCode.ERROR)
        self.assertIsNone(span.status.description)
        self.assertEqual(metrics.calls, [])

    def test_default_parent_still_captures_rethrown_private_error(self):
        spans, _ = self.exported_spans(parent={})
        child, parent = spans
        self.assert_no_marker(child)
        self.assertIn(MARKER, parent.to_json())
        self.assertTrue(any(MARKER in event.attributes.get(
            "exception.message", "") for event in parent.events))
        self.assertTrue(any(MARKER in event.attributes.get(
            "exception.stacktrace", "") for event in parent.events))
        self.assertIn(MARKER, parent.status.description)

    def test_same_policy_on_parent_covers_this_export_path(self):
        spans, _ = self.exported_spans(parent={
            "record_exception": False, "set_status_on_exception": False})
        self.assertEqual(len(spans), 2)
        for span in spans:
            self.assert_no_marker(span)

    def test_success_path_keeps_usage_and_bounded_metric_bucket(self):
        spans, metrics = self.exported_spans(fail=False)
        self.assertEqual(spans[0].attributes["gen_ai.usage.input_tokens"], 12)
        self.assertEqual(spans[0].attributes["gen_ai.usage.output_tokens"], 3)
        self.assertEqual(len(metrics.calls), 1)
        self.assertEqual(metrics.calls[0][0], "support")
        self.assertGreaterEqual(metrics.calls[0][2], 0)


if __name__ == "__main__":
    unittest.main()
