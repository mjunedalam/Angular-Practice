# Technical audit: chapters 15–30

Reviewed 17 October 2026. **Two reproducible publication corrections** were found: automatic exception disclosure in Chapter 26 and acceptance of retrospective approval in Chapter 24's trajectory checker. Three additional teaching improvements are separated below from demonstrated errors. Most of the distributed-systems, security and statistical qualifications in these chapters are sound and should be preserved.

## Scope and method

- Read the complete text, code, embedded diagram specifications, self-checks, exercises and sources in `chapters/15.md` through `chapters/30.md`; read all 32 A/B visual lessons and 16 C research lessons, including their answers and assumptions.
- Source root: `/Users/junedalam/angular-with-ngrx/Angular-Practice/output/pdf/agentic_ai_complete_source`.
- Reviewed edition: [822-page complete PDF](/Users/junedalam/angular-with-ngrx/Angular-Practice/output/pdf/Agentic_AI_Engineering_complete.pdf). Pages below are **one-based PDF page / printed page**. `layout_manifest.json` mappings were checked against actual PDF text for the findings.
- Visually inspected rendered PDF pages 300, 405, 416, 422, 441, 448, 513 and 517. This is a technical-content review of all assigned figure specifications plus targeted rendered-page inspection, not a claim of pixel-level review of every page.
- Executed the exact Chapter 24 and Chapter 26 snippets, extracting them directly from Markdown. Recalculated every interval in labs 25A and 27B, the kappa example and the dense KV-cache arithmetic. Verified material protocol/runtime claims and disputed behavior against primary sources.
- No manuscript, lesson source or PDF was edited. The review and read-only reproducer are separate artifacts.

Priority: **P1** high-priority publication correction; **P2** consequential correction or explicitly identified coverage gap; **P3** optional teaching improvement. A coverage gap is not a claim that the printed statement is false.

## Reproducible corrections

### R1 — P1: the privacy-preserving telemetry wrapper automatically exports the exception it rethrows

**Location:** [Chapter 26, lines 39–58](/Users/junedalam/angular-with-ngrx/Angular-Practice/output/pdf/agentic_ai_complete_source/chapters/26.md:39), especially lines 48 and 58. **PDF 441 / printed 429.**

**Printed claim:** “It deliberately avoids raw prompts, tool arguments and exception messages.” The example enters `tracer.start_as_current_span("agent.model.call")`, catches an exception, records only its type, then executes `raise` inside that context manager.

**Demonstrated problem:** OpenTelemetry's default context manager records an escaping exception automatically. The manual `except` block does not suppress that behavior because it rethrows the exception. With the manuscript snippet and **opentelemetry-sdk 1.45.1**, a synthetic private marker appeared in `exception.message`, `exception.stacktrace`, and the span status description. The code therefore contradicts its own privacy claim and the chapter's source-allowlist recommendation. This is observable with a normal configured SDK/exporter; it does not require malicious instrumentation.

**Concrete correction:** explicitly disable both automatic paths on this span and retain the manually selected safe status/type:

```python
with tracer.start_as_current_span(
    "agent.model.call",
    record_exception=False,
    set_status_on_exception=False,
) as span:
    ...
```

**Necessary scope qualification:** this protects this span only. A rethrown exception can still be captured by a default enclosing span or framework instrumentation. Apply the same recording policy at enclosing instrumentation boundaries, or translate errors to an approved safe representation before they cross those boundaries. Collector redaction remains defense in depth. Do not promise that the local opt-out sanitizes all tracing.

**Verification:** the reproducer below checks the original block, the two-flag change made only in memory, and a fixed child nested inside a default parent. Results:

```text
SDK 1.45.1
Original child: message=True, stack=True, status=True
Fixed child:    message=False, stack=False, status=False
Default parent around fixed child: message=True, stack=True, status=True
```

**Primary evidence:** [OpenTelemetry Python `Tracer.start_as_current_span` API](https://opentelemetry-python.readthedocs.io/en/latest/api/trace.html#opentelemetry.trace.Tracer.start_as_current_span) documents default automatic recording/status flags. The [OpenTelemetry `use_span` implementation](https://opentelemetry-python.readthedocs.io/en/latest/_modules/opentelemetry/trace.html#use_span) shows the escaping-exception path and its propagation to parents. The exact status-description behavior reported here was also executed against the stated SDK version.

### R2 — P2: the protected-effect checker accepts an approval created after execution

**Location:** [Chapter 24, lines 83–104](/Users/junedalam/angular-with-ngrx/Angular-Practice/output/pdf/agentic_ai_complete_source/chapters/24.md:83), especially lines 93–100. **Checker: PDF 405 / printed 393.** The preceding instruction says to verify the approved decision and “timing.” Chapter 25 explicitly states that “an approved decision should precede execution” at [line 35](/Users/junedalam/angular-with-ngrx/Angular-Practice/output/pdf/agentic_ai_complete_source/chapters/25.md:35).

**Demonstrated problem:** `check_protected_effects` checks outcome, digest and whether execution occurred before expiry, but never checks whether approval existed when the effect happened. A valid, correctly bound decision made afterward returns no problems. The adjacent qualification assumes authenticated, entitlement-validated decisions; neither property establishes temporal precedence. This matters because the function is presented as a trajectory checker, whose job includes detecting a faulty executor's ordering violation.

**Tiny fixture** (after loading the printed function):

```python
from types import SimpleNamespace as S

effect = S(kind="effect_executed", approval_required=True,
           proposal_id="P-8", proposal_digest="d8", executed_at=10)
decision = S(outcome="approved", digest="d8", decided_at=20,
             expires_at=30)
assert check_protected_effects([effect], {"P-8": decision}) == []
# This passes in the manuscript despite execution preceding approval.
```

**Concrete correction:** add an approval commit/decision timestamp or authoritative event sequence to the contract and enforce `decision.decided_at <= event.executed_at < decision.expires_at`. Prefer a durable causal sequence when timestamps come from different clocks; the checker must not infer authorization order from unsynchronized wall clocks. Keep the existing identity/binding/entitlement checks. Add a negative case where a legitimate approver approves the correct proposal after the mutation.

**Primary evidence:** [OWASP Transaction Authorization, §§2.5 and 2.8](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html#25-application-should-control-which-transaction-state-transitions-are-allowed) requires controlled authorization ordering and an authorization gate tied to execution. The code failure is independently reproducible and contradicts the book's own stated ordering rule.

## Important additions and limitations — not demonstrated factual errors

### G1 — P2 coverage improvement: explicitly supersede the old proposal when a human replaces it

**Location:** [Chapter 18, lines 25–31, 49–63](/Users/junedalam/angular-with-ngrx/Angular-Practice/output/pdf/agentic_ai_complete_source/chapters/18.md:25), **PDF 295–296 / printed 283–284**; [lab 18B, lines 68–146](/Users/junedalam/angular-with-ngrx/Angular-Practice/output/pdf/agentic_ai_complete_source/visual_lessons/18.json:68), **PDF 300 / printed 288**.

**Context:** “A modification creates a new proposal with a new digest”; lab 18B retains an approved P-208 while switching the active pointer to P-209. This correctly prevents P-208's decision authorizing P-209. It leaves the other half of replacement implicit: a delayed worker must not execute P-208 itself after it has been replaced. The helper only receives immutable historical records and cannot observe that replacement.

**Suggested addition:** state that replacing a pending proposal atomically marks its predecessor superseded and advances the run's active proposal/version. Protected execution verifies that live state under a compare-and-set/owned transaction, not merely historical approval validity. If P-208 has already been accepted downstream, reconcile it before treating P-209 as a replacement. Add the three events “P-208 approved → P-209 replaces it → delayed P-208 resume rejected” to the diagram or exercise.

**Qualification:** the lab already mentions an active proposal pointer, and the book elsewhere teaches current state and fencing. This is a missing explicit lifecycle edge and enforcement contract, not evidence that the complete intended architecture necessarily executes both refunds. [OWASP transaction modification guidance](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html#26-transaction-data-should-be-protected-against-modification) supports invalidating/resetting prior authorization when transaction data changes.

### G2 — P2 coverage gap: threat-model the judge as an application receiving untrusted candidate content

**Location:** [Chapter 25, lines 63–71](/Users/junedalam/angular-with-ngrx/Angular-Practice/output/pdf/agentic_ai_complete_source/chapters/25.md:63), **PDF 423 / printed 411**. The section covers position, verbosity/family bias, human calibration and critical false accepts, but not adversarial instructions embedded in the answer being graded.

**Why it matters:** an answer or tool result being evaluated can contain a forged grader instruction. The evaluator is then another prompt-injection target; a good benign calibration confusion matrix does not establish robustness to score manipulation. This is distinct from ordinary stochastic grading error and directly affects release gates and feedback datasets. Chapter 19 and Chapter 24 already cover general injection, so the needed addition is an explicit application of that trust boundary to the judge, not a new generic injection chapter.

**Suggested addition:** add paired clean/injected candidate tests with the same underlying task answer; keep rubric and verdict schema outside candidate-controlled fields; withhold credentials/tools the judge does not need; validate grader outputs; route suspicious or disputed cases to independent adjudication. Measure attack-conditioned false acceptance separately. Do not promise that delimiters or sanitization alone solve semantic injection.

**Suggested diagram:** candidate/evidence data cross into a grader that has fixed rubric, constrained output and independent outcome checks. Show the attack changing only the candidate text, not the true task result.

**Primary evidence:** Shi et al., [Optimization-based Prompt Injection Attack to LLM-as-a-Judge / JudgeDeceiver](https://arxiv.org/abs/2403.17710), demonstrates attacks carried in candidate responses. This supports the threat model, not a claim that the book's unspecified judge has a particular measured attack success rate.

### G3 — P3 statistical teaching limitation: show the degenerate-bootstrap case explicitly

**Location:** [Chapter 25, lines 119–136](/Users/junedalam/angular-with-ngrx/Angular-Practice/output/pdf/agentic_ai_complete_source/chapters/25.md:119), **PDF 428 / printed 416**.

**Observed edge case:** `paired_case_interval([(1, 1), (1, 1)])` returns `(0, 0)`. Every resample is identical, so the helper cannot express uncertainty about unseen discordance. This is the natural behavior of the stated percentile algorithm, not an arithmetic defect. The manuscript appropriately calls it illustrative, requires an appropriate production method, and addresses clustering and predeclared analysis. Preserve those qualifications.

**Suggested addition:** place an explicit warning beside the helper that a zero-width empirical interval from constant differences does not establish equivalence on future cases. Return/label insufficient evidence under the gate's predeclared sample policy, or use a reviewed inference method for the actual binary/continuous paired estimand. Explain why `len(pairs) >= 2` is an input-shape guard, not a defensible release sample-size rule. [SciPy's bootstrap reference](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.bootstrap.html) separately documents degenerate-distribution limitations; its warning about BCa must not be misquoted as saying this percentile function itself returns NaN.

## Chapter-by-chapter coverage

All listed chapters and A/B/C lessons were read in full. “No demonstrated error” means no actionable error was established in this review; it is not a formal proof of correctness. Lab pages list PDF pages; subtract 12 for printed pages.

| Chapter | PDF / printed range | A, B, C lab pages | Assessment |
|---|---|---|---|
| 15 A2A and remote agents | 239–255 / 227–243 | 240, 249, 252 | No demonstrated error. Optional Send Message dedupe and terminal-task follow-up semantics match the primary protocol. |
| 16 Graph orchestration | 257–273 / 245–261 | 258, 267, 269 | No demonstrated error. Every re-entry shares the stated guard; replay is separated from activity retry and external effects. |
| 17 Multi-agent architecture | 274–291 / 262–279 | 275, 288, 283 | No demonstrated error. Correlated opinions, root ownership and coordination cost are explicitly qualified. Ledger and critical-path examples are consistent. |
| 18 Human oversight | 292–309 / 280–297 | 293, 300, 306 | Strong binding/current-entitlement/conditional-write treatment. G1 makes replacement of an old approved proposal operationally explicit. |
| 19 Security | 311–327 / 299–315 | 312, 320, 324 | No demonstrated error. Reader/actor typing is not treated as trust; renderer egress, redirects, DNS and file races are included. |
| 20 Identity | 328–344 / 316–332 | 329, 335, 341 | No demonstrated error. User/workload/task intersection, background principals, token-exchange policy and `act` object are carefully distinguished. |
| 21 Sandboxing | 345–360 / 333–348 | 346, 357, 354 | No demonstrated error. No universal sandbox-strength ranking; limits, reapers, secret separation and artifact authorization are explicit. |
| 22 Governance | 361–378 / 349–366 | 362, 370, 374 | No demonstrated error. Purpose, placement, re-identification, lineage, hold/backup limits and external integrity anchoring are separately addressed. |
| 23 Reliability | 380–396 / 368–384 | 381, 385, 392 | No demonstrated error. Unknown effects, downstream dedupe horizons, persistent compensation and shared retry budgets are correctly scoped. |
| 24 Testing | 397–414 / 385–402 | 398, 406, 410 | **R2:** checker misses approval-before-effect ordering. Other fake/model/effect distinctions and property-fixture cautions are sound. |
| 25 Evaluation | 415–433 / 403–421 | 416, 422, 427 | Numerical examples verified. G2 adds judge injection; G3 strengthens the bootstrap limitation. Held-out data and cluster-aware analysis already exist. |
| 26 Observability | 435–452 / 423–440 | 436, 444, 448 | **R1:** code leaks exceptions despite claimed privacy. Trace/audit distinction, cardinality, provenance and nested-duration arithmetic are otherwise sound. |
| 27 AgentOps | 453–469 / 441–457 | 454, 460, 464 | No demonstrated error. Canary share is not statistical confidence; mutation brakes do not undo past effects; hard safety events have no positive budget. |
| 28 Cost/routing | 470–485 / 458–473 | 471, 478, 481 | No demonstrated error. Eligibility precedes price; billing assumptions, semantic false hits and unknown usage are explicit. |
| 29 Platform | 487–505 / 475–493 | 488, 500, 494 | No demonstrated error. State/effect fencing, outbox duplicates, ownership and region/dedupe recovery are explicitly separated. |
| 30 Gateway/inference | 506–522 / 494–510 | 507, 513, 517 | No demonstrated error. KV arithmetic, continuous batch roster and uncertainty of throughput gains are correct under their assumptions. |

## Diagrams and numerical examples that would add understanding

These are editorial opportunities, not missing-concept accusations. The book already has 48 visual lessons in this range; replacing a less informative drawing is preferable to mechanically adding another lab to every chapter. The highest-value choices are the approval ordering/supersession sequence, judge trust boundary, correlated-vote example and measured cascade example.

| Chapter / source anchor | Suggested addition or replacement | What it teaches beyond existing material |
|---|---|---|
| 15, lines 79–85 | One lost-creation-response trace with the same retry at 5 minutes and after a 24-hour retention expiry. | The retention caveat already exists in 15B; a time-axis comparison makes the boundary easier to apply. |
| 16, lines 98–104 | Three evidence updates `{E1,E2}`, `{E2,E3}`, `{E2 with conflicting payload}` merged in different orders. | Existing loop/freshness/replay lessons do not calculate reducer behavior; demonstrate idempotence, commutativity and conflict detection without suggesting they apply to all fields. |
| 17, lines 94–100 | Three voters each with 0.8 correctness: independent majority correctness is `0.8³ + 3×0.8²×0.2 = 0.896`; perfectly correlated correctness stays 0.8. | The correlation warning already exists. A small probability tree turns it into an inspectable counterexample to multiplying confidence. Also compare a deterministic concurrent-tool baseline before attributing 17C's speedup to agents. |
| 18, lines 25–31 and 116–120 | Put proposal version, approval commit, supersession and effect acceptance on one causal timeline. | Repairs R2's related cross-chapter misconception and supplies G1's missing edge; a second queue diagram is less urgent. |
| 19, lines 69–75 | DNS/redirect sequence showing preliminary hostname approval, changed address and actual connection-time denial. | 19B already covers this concept; a connection timeline could replace its decision tree if readers confuse a string check with enforcement. |
| 20, lines 33–51 | A subject/actor/audience claim-to-enforcement map; an expired credential is refreshed through the broker without changing business permission. | Complements the existing permission matrix and wrong-audience lab without implying RFC 8693 guarantees short lifetimes. |
| 21, lines 73–79 | One release manifest containing a real PNG, an SVG, a formula-bearing CSV and an unrelated file, each with parser/size/entitlement outcome. | Makes artifact release a separate boundary from contained execution; do not portray a hash or file extension as safety proof. |
| 22, lines 68–74 | A copy graph from one source to checkpoint, cache, summary, evaluation example and backup, with separate deletion/hold states. | Existing 22A describes deletion conditions and 22C derivation; the graph connects both across an actual fan-out of copies. |
| 23, lines 29–31 | Three retrying layers, each allowing three attempts, can send up to `3³ = 27` leaf attempts for one request; show one designated retry owner. | Shared allowance is already taught in 23C. This exposes multiplicative amplification across stack layers, not merely across callers. |
| 24, lines 83–104 | Side-by-side traces with approval at t=5/effect t=10 versus effect t=10/approval t=20, same digest and expiry t=30. | Directly demonstrates why R2's extra ordering assertion matters. |
| 25, lines 117–139 | A paired 2×2 table: both succeed, baseline only, candidate only, both fail; compute the same mean gain with different discordance. | Paired comparisons already exist, but the relationship between pairing and uncertainty is not numerically worked. Add G3's all-ties counterexample. |
| 26, research lesson 26C lines 16–50 | Replace zero-origin duration bars with aligned interval/Gantt spans: run 0–12, investigation 2–10, model 2–7, tool 7–10. | Current numbers and labels are correct. The revised geometry would itself show nesting and the 4 seconds outside investigation instead of requiring the reader to reconstruct it from labels. |
| 27, lines 89–91 | Fixed-window canary evidence card with traffic eligibility, allocation unit, actual counts, comparison method and next review rule. | The text already explains sequential/multiple-slice issues. Make the observation and decision contract visible rather than inventing a universal promotion threshold. |
| 28, lines 55–57 | For 100 cases: small route costs 1 unit/case, accepts 80 and escalates 20; 4 accepted answers are wrong; fallback costs 5 units/case and fixes all 20. Total 200 units, 96 successes, cost/success ≈2.08; strong-only fictional baseline 500 units/100 successes. | Existing lessons cover reservation, cache false hits and parallel latency. This explicitly combines detector false acceptance with savings and a quality floor; 98% required quality would reject the cheaper cascade. All counts must be labelled constructed. |
| 29, lines 98–108 | Regional restore timeline in which run state survives but its downstream dedupe retention has expired; mutation remains blocked pending lookup. | Fencing/outbox diagrams already exist. This connects distinct RPO/retention contracts without implying failover gives exactly-once effects. |
| 30, lines 81–95 | Extend the verified 32 KiB/token example: 4 GiB remaining KV allowance yields at most 131,072 dense stored tokens, or 32 requests of 4,096 tokens before omitted overhead/headroom. | The existing KV figure is correct. This adds an admission calculation, explicitly a simplified upper bound rather than total device capacity or a throughput claim. |

## Prerequisites and explanations worth making explicit

- The workflow/platform chapters already name atomic transactions, optimistic concurrency, fencing, outbox/inbox and downstream deduplication. The useful improvement is a compact prerequisite cross-reference linking each guarantee to its owner/store/effect boundary; do not misreport these concepts as absent.
- Chapter 25 presumes readers can distinguish an estimand, a sampling unit and an experimental allocation unit. One worked table can connect these: target deployment population → distinct case/family → repeated model trials → paired release difference. The existing held-out, clustering and multiple-testing caveats should remain.
- Approval and authorization examples benefit from an explicit causal-event model. Expiry, revocation/supersession, one-operation identity and current resource version protect different conditions. Digest equality alone addresses none of their timing.
- The inference chapter already distinguishes prefill/decode, KV versus weights, and throughput versus latency. Add a resource calculation, not an unqualified claim that quantization, parallelism or batching is always faster.

## Checks that should not be turned into findings

- A2A 1.0 Send Message deduplication is optional as stated, and terminal tasks cannot be restarted for refinement. [A2A specification §3.3.1](https://a2a-protocol.org/v1.0.0/specification/#331-idempotency); [Life of a Task](https://a2a-protocol.org/latest/topics/life-of-a-task/).
- Temporal replay uses deterministic orchestration; ordinary network/model calls belong in activities, whose retries remain a separate matter. The book explicitly preserves that distinction. [Temporal Workflow Definition](https://docs.temporal.io/workflow-definition#deterministic-constraints).
- RFC 8693 does not promise automatic scope narrowing or fixed lifetime; the `act` claim is an object. Chapter 20 correctly states both. [RFC 8693 §4.1](https://www.rfc-editor.org/rfc/rfc8693.html#section-4.1).
- Sandbox isolation has configuration-dependent limits; Chapter 21 does not claim a universal technology ranking. [gVisor security architecture](https://gvisor.dev/docs/architecture_guide/intro/) and [production guidance](https://gvisor.dev/docs/user_guide/production/).
- The broad, role-specific AI Act summary does not state a stale universal deadline; it directs readers to current applicability. [European Commission AI Act overview](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai).
- The Wilson lower bounds are 0.9213457381 for 45/45, 0.9493470602 for 72/72, and 0.9500062466 for 73/73 using the stated z=1.96 method. The 73-case claim is correct under that exact rule. All eight intervals in labs 25A and 27B matched recomputation within 1e-12.
- The calibration confusion matrix sums to 100: 64 true passes, 6 false fails, 9 false passes, 21 true fails. Agreement=0.85, marginal expected agreement=0.592, kappa=0.63235294, false acceptance among unfaithful answers=9/30=30%.
- Chapter 30's dense KV example is correct: `2×16×8×64×2 = 32768` bytes/token; 4,096 tokens use 128 MiB under the stated exclusions. Its continuous-batching C lesson correctly admits C at boundary 2 and completes C at boundary 5.
- vLLM documents per-request cache salting and trust-group isolation. Chapter 30's claim is qualified and supported. [vLLM prefix-cache design](https://docs.vllm.ai/en/latest/design/prefix_caching/).
- The existing analogies all state where they stop. None in the assigned chapters was shown to make a false guarantee once its qualification was read. Optional diagram improvements above should not be presented as factual defects.

## Reproduction files and commands

Read-only script: [agentic-ai-runtime-repro.py](/Users/junedalam/angular-with-ngrx/Angular-Practice/output/review/agentic-ai-runtime-repro.py). It extracts the two exact code blocks from the current source and applies the proposed Chapter 26 change in memory only. It uses a synthetic marker, fake model and in-memory span exporter; no external model/payment call occurs.

Temporary environment retained for rerun: `/tmp/agentic-audit-runtime-venv`, Python 3.12 with `opentelemetry-sdk==1.45.1`.

```bash
/tmp/agentic-audit-runtime-venv/bin/python /Users/junedalam/angular-with-ngrx/Angular-Practice/output/review/agentic-ai-runtime-repro.py
```

To recreate the temporary dependency environment if needed, create a Python virtual environment and install `opentelemetry-sdk==1.45.1`, then run the script above. No project dependency was changed.

Rendered review pages are under `/Users/junedalam/angular-with-ngrx/Angular-Practice/tmp/pdfs/agentic-audit-runtime/`. They verify page references and selected diagram geometry; they are not a revised edition.
