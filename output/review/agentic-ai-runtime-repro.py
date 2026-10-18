"""Read-only reproductions for the chapters 15-30 audit. No manuscript edits."""
from contextlib import nullcontext
from importlib.metadata import version
from pathlib import Path
import re
from types import SimpleNamespace as S

ROOT = Path(__file__).resolve().parents[2]
CHAPTERS = ROOT / "output/pdf/agentic_ai_complete_source/chapters"


def snippet(chapter, function):
    blocks = re.findall(r"```python\n(.*?)```", (CHAPTERS / f"{chapter}.md").read_text(), re.S)
    return next(block for block in blocks if f"def {function}" in block)


scope = {}
exec(snippet(24, "check_protected_effects"), scope)
effect = S(kind="effect_executed", approval_required=True, proposal_id="P-8",
           proposal_digest="d8", executed_at=10)
decision = S(outcome="approved", digest="d8", decided_at=20, expires_at=30)
problems = scope["check_protected_effects"]([effect], {"P-8": decision})
print("Ch24: executed_at=10; decided_at=20; expires_at=30; problems=", problems)
assert problems == [], "Manuscript no longer reproduces the reported ordering gap"
assert not decision.decided_at <= effect.executed_at < decision.expires_at

from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor
from opentelemetry.sdk.trace.export.in_memory_span_exporter import InMemorySpanExporter

MARKER = "PRIVATE_SYNTHETIC_MARKER customer@example.test"


class FailingModel:
    name = "fake"

    def generate(self, *args):
        raise ValueError(MARKER)


def trace_case(code, parent=False):
    namespace = {}
    exec(code, namespace)
    exporter = InMemorySpanExporter()
    provider = TracerProvider()
    provider.add_span_processor(SimpleSpanProcessor(exporter))
    tracer = provider.get_tracer("book-audit")
    try:
        with tracer.start_as_current_span("outer.default") if parent else nullcontext():
            namespace["traced_model_call"](
                FailingModel(), [], [],
                S(run_id="R1", release="v1", context_ref="C1"), tracer, None,
            )
    except ValueError:
        pass
    results = []
    for span in exporter.get_finished_spans():
        results.append({
            "span": span.name,
            "message_leaks": any(MARKER in e.attributes.get("exception.message", "") for e in span.events),
            "stack_leaks": any(MARKER in e.attributes.get("exception.stacktrace", "") for e in span.events),
            "status_leaks": MARKER in (span.status.description or ""),
        })
    provider.shutdown()
    return results


original = snippet(26, "traced_model_call")
fixed_in_memory = original.replace(
    'tracer.start_as_current_span("agent.model.call")',
    'tracer.start_as_current_span("agent.model.call", record_exception=False, set_status_on_exception=False)',
)
print("OpenTelemetry SDK:", version("opentelemetry-sdk"))
unfixed = trace_case(original)
fixed = trace_case(fixed_in_memory)
outer = trace_case(fixed_in_memory, parent=True)
print("Ch26 manuscript:", unfixed)
print("Ch26 both flags off (in-memory change only):", fixed)
print("Ch26 fixed child with default enclosing span:", outer)
assert all(unfixed[0][key] for key in ("message_leaks", "stack_leaks", "status_leaks"))
assert not any(fixed[0][key] for key in ("message_leaks", "stack_leaks", "status_leaks"))
assert any(row["span"] == "outer.default" and row["message_leaks"] for row in outer)
