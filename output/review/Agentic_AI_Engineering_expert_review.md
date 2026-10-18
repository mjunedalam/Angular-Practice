# Agentic AI Engineering: whole-book technical and teaching review

Review date: 17 October 2026. Edition reviewed: the complete illustrated book, 822 PDF pages, 39 chapters, 273 visuals, including 117 A/B/C visual labs. This report concerns the complete book, not a separate visual edition.

**Assessment:** The book has a strong systems-engineering foundation, especially its treatment of authority, state, recovery, evidence, evaluation and operational ownership. It needs targeted code corrections and a stronger bridge from concepts to runnable implementations. Keep the overall structure and selected cover while addressing those gaps.

The book is an agent-application engineering text. Chapter 1 explicitly excludes a full account of neural-network training. It should retain that focus while adding enough ML/DL intuition for readers to understand the models and retrieval components they operate.

Page references below give **printed page first, PDF viewer page second**. Body printed pages are 12 lower than PDF pages. Priorities distinguish corrections from worthwhile additions; an optional teaching improvement is not evidence that an existing statement is false.

## 1. Corrections to make before the next publication

| ID | Priority | Location: printed / PDF | Finding | Required change |
|---|---|---|---|---|
| C1 | High: privacy contract | Chapter 26, 429 / 441 | The OpenTelemetry wrapper can automatically record exception text and stack traces, despite saying it avoids exception messages. | Disable automatic exception recording and automatic exception-status text; apply the policy to enclosing instrumentation; test exported spans. |
| C2 | Medium: incomplete test oracle | Chapter 24, 393 / 405 | The protected-effect checker accepts an approval recorded after execution, provided its digest matches and expiry is later. | Check that a valid decision existed before the effect, as well as remaining unexpired. |
| C3 | Medium: selection correctness | Chapter 8, 126 / 138 | Optional high-priority context can consume capacity before a required item, causing an avoidable failure. | Reserve the full required set before admitting optional material. |
| C4 | Low: arithmetic wording | Chapter 1, 9 / 21 | Four retries at each of two layers are described as sixteen attempts. | Say four total attempts per layer, or change the result to twenty-five for four additional retries per layer. |

### C1: observability must honor its own privacy promise

[Chapter 26, line 48](/Users/junedalam/angular-with-ngrx/Angular-Practice/output/pdf/agentic_ai_complete_source/chapters/26.md:48) uses `start_as_current_span()` with defaults, then rethrows an exception. Setting a safe `error.type` attribute does not disable the context manager's separate automatic recording. The exact manuscript block was exercised with a synthetic private marker and an in-memory exporter; the marker reached exception telemetry. This is a defect in the example, not evidence that actual user data has leaked.

The local correction is:

```python
with tracer.start_as_current_span(
    "agent.model.call",
    record_exception=False,
    set_status_on_exception=False,
) as span:
    ...
```

Keep explicit bounded error classification and an error status without raw exception text. Because the exception propagates, parent spans and auto-instrumentation need the same privacy policy. The acceptance test must search event attributes, stack traces, status descriptions and enclosing spans for a synthetic marker. The [OpenTelemetry Python API](https://opentelemetry-python.readthedocs.io/en/latest/api/trace.html#opentelemetry.trace.Tracer.start_as_current_span) documents the default flags; the local reproduction establishes their consequence for this exact snippet.

### C2: an approval cannot authorize an earlier effect

[Chapter 24, line 86](/Users/junedalam/angular-with-ngrx/Angular-Practice/output/pdf/agentic_ai_complete_source/chapters/24.md:86) checks decision outcome, digest and expiry, but not its start time. An effect at time 10 with a matching approval created at 20 and expiring at 30 produces no reported problem. That contradicts the chapter's stated approval-before-execution invariant.

The fixture contract should include an authoritative decision time or ordered authorization record, and verify:

```python
if not decision.decided_at <= event.executed_at < decision.expires_at:
    problems.append("approval not valid at execution time")
```

Use comparable trusted timestamps or an authoritative causal ordering, not arbitrary clocks from unrelated workers. Keep authentication, entitlement and proposal binding checks. Add cases for approval after execution, expiry exactly at execution, and a valid earlier approval. This finding concerns the test helper; it is not a demonstrated bypass of the separate Chapter 11 executor.

### C3: required context needs reservation, not merely an overflow error

[Chapter 8, line 87](/Users/junedalam/angular-with-ngrx/Angular-Practice/output/pdf/agentic_ai_complete_source/chapters/08.md:87) sorts solely by `priority`. In a deterministic fake-count test with 100 units available, it admits an optional 60-unit item, then raises when a required 50-unit item arrives. The required item fits when considered alone.

Count and reserve all required items first. If those exceed capacity, fail explicitly; otherwise select optional items within the remainder. Then render the chosen items in the intended presentation order, keeping text and provenance paired. The current behavior fails closed, so this is an avoidable availability/selection failure rather than a data leak. Test feasible required content, an impossible required set, optional overflow, and reordered candidates. Character counting in the reproduction is only a fake token counter.

### C4: use one vocabulary for retry arithmetic

[Chapter 1, line 81](/Users/junedalam/angular-with-ngrx/Angular-Practice/output/pdf/agentic_ai_complete_source/chapters/01.md:81) should say: “If the SDK permits four total attempts and the application permits four total attempts, one logical operation can produce sixteen downstream attempts.” Four additional retries at both layers instead permit `(1 + 4) × (1 + 4) = 25`. Visual lab 1C already uses the clearer total-attempt convention. The mechanism agrees with [AWS retry guidance](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/).

## 2. Additions with the greatest learning value

### A. Add a compact model and representation primer

Place a short optional bridge before or within Chapter 1, then refer back to it from Chapter 12. Explain:

- AI, ML, deep learning and language models as related concepts, without implying all AI uses deep learning.
- Training changes weights; ordinary inference uses the current weights and supplied context. Stored application memory and retrieved documents are different mechanisms.
- Tokens become representations; attention mixes information across positions; a language-model output distribution supports next-token generation. Mark this as a simplified account of a conventional transformer language model.
- An embedding model supplies representations for matching; a generator supplies output tokens. They may be different models with different objectives.

Use a familiar analogy, then immediately show its boundary. A library catalog is useful for explaining retrieval, but vector coordinates are not literal subject labels or a truth score. Full backpropagation derivations, CNN training and a survey of every RL algorithm would dilute this book's scope. The [original Transformer paper](https://arxiv.org/html/1706.03762v7) is a suitable primary reference for the attention/representation bridge, with the historical architecture distinguished from modern decoder-only variants.

### B. Teach retrieval with one complete numerical example

Chapter 12's dense-search description is correct but compressed (183 / 195). Add a small compatible embedding-space example with an explicit similarity calculation, then contrast a bi-encoder retrieval stage with a cross-encoder reranker. Query and document encoders may differ, but their representations and preprocessing must be compatible. Record model revision, dimensionality, preprocessing and metric; explain what requires a new index or re-embedding.

The worked example should carry the same question through chunks, candidates, ranks, selected context, citations and an answer or insufficient-evidence outcome. Keep an exact identifier and a policy exception so readers see why dense search alone may miss something important. The [Sentence Transformers retrieve-and-rerank documentation](https://www.sbert.net/examples/sentence_transformer/applications/retrieve_rerank/README.html) supports the architectural distinction.

The metrics section (191 / 203) names MRR and nDCG but does not work them through. Add one ranked list with relevance labels and calculate recall@k, reciprocal rank and nDCG under stated assumptions. The existing RRF and Wilson labs are useful and should remain. [Stanford's ranked-retrieval chapter](https://nlp.stanford.edu/IR-book/html/htmledition/evaluation-of-ranked-retrieval-results-1.html) supports the distinction between ranked and set-based evaluation.

### C. Add one runnable baseline-RAG-to-agentic-RAG lab

The source package contains a functioning Chapter 11 harness, but the RAG chapters mainly supply component helpers and exercises. Add a small versioned corpus, labeled queries, a runnable baseline and one bounded adaptive extension. The same fixtures should expose a missing exception, stale document, no-answer question and repeated evidence.

Compare baseline retrieval and adaptive retrieval on the same cases. Record accepted evidence, actual source-query count, grounded outcome, latency and cost where measurable. Clearly separate synthetic numbers from measured output. This gives readers an experiment that explains when extra autonomy earns its cost.

### D. Make retrieval and SQL implementation prerequisites explicit

Two consequential details deserve compact worked boxes:

1. **Filtered ANN retrieval:** show why an approximate candidate scan followed by filtering may return fewer than k eligible results. Keep the authority boundary intact while adjusting search effort or using an exact authorized baseline. The current text is qualified and does not promise a particular internal execution order. [pgvector's filtering guidance](https://github.com/pgvector/pgvector#filtering) supplies the implementation detail.
2. **PostgreSQL views and RLS:** Chapter 13's query function delegates access configuration to its caller (205–206 / 217–218). Show which underlying table policies apply, whether the view uses invoker or owner security, and why a runtime role must not unintentionally bypass RLS. For pooled shared-role connections, bind authenticated tenant context through a trusted transaction-scoped mechanism. Test tenant A attempting to read tenant B through the actual view. [PostgreSQL view semantics](https://www.postgresql.org/docs/current/sql-createview.html) and [row-security rules](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) support this clarification.

These are implementation-readiness additions, not proof that the explicitly caller-configured SQL snippet is inherently unsafe.

### E. Connect the MCP example into a runnable path

Chapter 14 starts a stdio server (218 / 230), then shows a client function taking a URL (219 / 231). Both pieces can be valid separately, but the server command does not produce that URL. Choose one end-to-end transport: either let the client launch the stdio subprocess through the SDK's transport configuration, or show the corresponding HTTP server command and local URL. Include the entry point, expected output and resolved dependency version. See the [official SDK transport guide](https://py.sdk.modelcontextprotocol.io/client/transports/).

This is a practical integration gap. It is not a reason to replace the chapter's verified SDK 2 and 2026 protocol account with older initialization examples.

### F. Show how the capstone's layers share ownership

Chapters 31–39 are useful architecture and build guidance, but the package does not include a working AegisOps/LangGraph/Temporal implementation. Add one narrow executable path before broadening the platform: fake incident → evidence → immutable proposal → approval → simulated effect → independent verification.

Document one owner for durable lifecycle, graph state, retries, deadlines, cancellation and effect identity. If Temporal and LangGraph coexist, explain which graph work runs inside an activity and what an activity retry can repeat. Keep the existing phase exit tests; they already establish a good incremental development discipline.

Also define rollback through the chosen change system. A live Kubernetes edit may be reconciled away under the controller's policy; Argo CD also restricts rollback while automatic sync is enabled. Specify the supported desired-state change and completion conditions. See [Argo CD's automated-sync policy](https://argo-cd.readthedocs.io/en/stable/user-guide/auto_sync/). This is a missing adapter contract, not a claim that the manuscript contains a specific broken command.

Chapter 38's pure recovery verifier is careful about its input contract (645–646 / 657–658), but the observation adapter deserves a worked example. Show how a confirmed action-completion time between scrape boundaries becomes ten valid, covered buckets, with units, traffic denominators, delayed data and evidence IDs. Aggregate suitable histogram data rather than averaging instance p95 values; [Prometheus explains this distinction](https://prometheus.io/docs/practices/histograms/). Include a fixture that fails for missing coverage and a clear policy for a failed recovery window.

Record an exact tested dependency matrix alongside the runnable examples. The book already recommends pinning versions; the missing element is an executed baseline covering the framework, checkpoint store, provider SDK, workflow SDK and negotiated protocol.

### G. Put model adaptation choices where readers first need them

Chapter 30 already explains fine-tuning and distillation correctly (507 / 519). Add a compact earlier decision map linking four diagnoses to different interventions:

- Unclear instructions or output contract: improve prompting/schema and test the change.
- Missing or changing factual material: improve retrieval and source lifecycle.
- Stable recurring behavior with reviewed training data: evaluate fine-tuning against simpler options.
- Serving cost or latency: evaluate routing, caching, distillation or serving changes without discarding quality gates.

Do not present these as mutually exclusive or universally successful. Keep the detailed operating discussion in Chapter 30.

### H. Complete distribution and accessibility

Chapter 11 tells readers to run `examples/mini_harness.py` from a “revised-source directory” (173 / 185). The complete PDF has no embedded files or stable companion-download link. The code exists locally in the source package; the issue is how a PDF-only reader obtains it. Add a clear, versioned companion link or embed the scripts and README as attachments, while continuing to deliver one complete book.

The PDF also has no structure tree. Visual clarity and extractable text are valuable, but they do not establish accessible reading order or diagram descriptions. For an accessible digital edition, add tags, heading structure, reading order and meaningful figure alternatives, then validate with an appropriate reader. This is an accessibility enhancement, not a failed visual-layout check.

### I. Extend evaluation to attacks on the judge itself

Chapter 25 covers calibration and common judge biases (411 / 423). Add a case where an evaluated answer contains instructions attempting to manipulate the grader. The [JudgeDeceiver paper](https://arxiv.org/abs/2403.17710) demonstrates this attack surface; ordinary quality calibration does not by itself test it.

Use paired clean and injected candidates with unchanged substantive answers. Keep the rubric separate from candidate content, constrain the grading output, and combine model judgments with independent checks or human adjudication where needed. Measure incorrect acceptance under attack. These are controls to evaluate, not a claim that prompt separation alone solves injection. Connect this exercise to the existing security and adversarial-testing chapters.

### J. Clarify two subtle edge cases

- **Proposal replacement:** Chapter 18 explains new proposal digests and current-state checks (283–284 / 295–296). Explicitly mark an old approved proposal as superseded when a replacement becomes active, and show a stale worker being rejected by an authoritative version check. If the old action was already accepted downstream, reconcile it before assuming replacement cancels it. This makes an existing safety principle concrete; no duplicate effect was demonstrated in the supplied implementation.
- **Degenerate bootstrap samples:** Chapter 25's paired resampling helper (416 / 428) can return a zero-width difference interval when all observed paired differences are identical. That is expected empirical-bootstrap behavior, not proof of equivalence on future cases. Add this limitation and explain that the two-case input minimum is a shape check, not a sample-size recommendation. The detailed runtime report includes the reproduction.

## 3. Arrangement: preserve the structure, improve the entry points

The ten-part progression is coherent: foundations → runtime → knowledge/interoperability → orchestration → security → reliability → operations → platforms → design review → capstones. Keep the 39-chapter structure and its cross-references.

The preface already offers reading routes and warns readers to study action controls before enabling consequential operations. Do not describe those as absent. Improve the routes in three specific ways:

| Reader need | Proposed route or insertion | Reason |
|---|---|---|
| New to ML/LLMs | Prerequisite checklist and compact representation primer → Chapters 1–2 | Establish model/context/retrieval vocabulary before operating contracts. |
| Choosing whether an agent is needed | One-page preview of Chapter 35's decision process near Chapters 2–3 | Give readers a reason for each pattern before the framework survey. Keep the complete review chapter late. |
| Learning collaboration | Chapters 16 → 17 → 15 as an alternate route | Understand workflow, delegation and ownership before remote-agent protocol details. No forced renumbering is necessary. |
| Building retrieval | Chapters 12 → 13 → selected parts of 25–26, with the runnable lab | Connect retrieval mechanisms to measurable quality and diagnosis immediately. This strengthens the existing preface route. |
| Implementing a capstone | Chapter 35 design decision → 36 contract → 37 milestones → 38 hardening → 39 alternatives | Preserve the existing build progression and add a concrete reference implementation. |

Add a small “You should already know / After this chapter you can / Continue with” block to chapters with substantial prerequisites. Keep it short enough to avoid repetitive front matter on every page.

## 4. Visual learning: improve what the pictures explain

The current 273 visuals are not merely decoration: many require the reader to inspect a record, identify a false inference, predict a failure or calculate a budget. Preserve those lessons and the explicit limits on analogies. The largest visual gap is in representations and algorithm mechanics; adding more generic component boxes would have limited value.

Prioritize these original diagrams, each with a concrete question and worked answer:

| Placement | New or replacement visual | What the learner should be able to do |
|---|---|---|
| Chapter 1 | Tokens → representations → attention → next-token distribution, plus a separate training/inference strip | Distinguish changing weights from changing the request context. |
| Chapter 12 | A query and three small fictional vectors with calculated cosine similarity | Reproduce the ranking and explain why similarity does not prove factual support. |
| Chapter 12 | Bi-encoder retrieval versus joint query-passage reranking | Explain the efficiency/interaction tradeoff without treating raw scores as probabilities. |
| Chapter 12 | A policy section split badly, then rebuilt with its exception and parent locator | Show how chunking can change the answer. |
| Chapter 12 | Ranked result cards with relevant/not-relevant labels and metric arithmetic | Calculate recall, reciprocal rank and nDCG with the stated labels. |
| Chapter 13 | Fixed baseline and adaptive search on the same question and corpus | Identify the specific observation that justifies another query, and the stop condition. |
| Chapters 13/20 | Principal → connection identity → view → table policy | Locate where cross-tenant access is actually rejected. |
| Chapters 24/26 | Executed-before-approved timeline and a synthetic error moving into telemetry | Predict the exact failures in C1/C2 and verify the corrected boundaries. |
| Chapters 32/37 | Temporal lifecycle around graph work, including an interrupted activity and retry | Assign ownership and identify what may replay versus execute again. |
| Chapters 36–38 | Git desired state → deployment controller → live revision → observed recovery | Distinguish requesting rollback, convergence and business recovery. |

Use consistent labels and actual data relationships. A real timeline should align positions to time; a duration comparison should say it compares durations. Keep toy data clearly labeled. Retain the selected cover, fonts and color vocabulary. Existing whitespace that preserves intact paragraphs, code, cards and figure-caption groups supports the user's stated page-break requirement.

## 5. Revision order and acceptance criteria

1. **Correct C1–C4.** Add the precise counterexamples to the relevant snippet checks. Verify that privacy checks inspect exported telemetry and that approval ordering rejects retrospective decisions.
2. **Repair the learning path into working code.** Connect the MCP transport example; make the existing harness discoverable from the PDF; supply one runnable retrieval lab and one narrow capstone integration.
3. **Add the compact model/embedding bridge and ranked-retrieval arithmetic.** Prefer replacing repeated abstract explanation where possible. More pages are useful only if they teach a new mechanism.
4. **Clarify database and workflow/deployment contracts, and expand evaluation.** Include two-tenant RLS tests, one graph/activity retry trace, a GitOps-aware rollback fixture, telemetry coverage checks, a superseded-proposal case and judge-injection pairs.
5. **Rebuild and verify the single complete PDF.** Regenerate contents/index/link destinations after pagination changes; rerender affected sections and check intact blocks. Preserve the current cover direction.

The current PDF has not been revised by this audit. The changes above are concrete recommendations for its next edition.

## Review evidence and detailed coverage

The section reports below contain chapter-by-chapter assessments, exact source locations, supporting primary sources and additional optional visual ideas:

- [Foundations, chapters 1–14](/Users/junedalam/angular-with-ngrx/Angular-Practice/output/review/agentic-ai-audit-foundations.md)
- [Runtime, security and operations, chapters 15–30](/Users/junedalam/angular-with-ngrx/Angular-Practice/output/review/agentic-ai-audit-runtime.md)
- [Frameworks, capstones and appendices, chapters 31–39 and A–I](/Users/junedalam/angular-with-ngrx/Angular-Practice/output/review/agentic-ai-audit-production.md)
- [Syntax, PDF structure and source-integrity checks](/Users/junedalam/angular-with-ngrx/Angular-Practice/output/review/agentic-ai-audit-checks.json)
- [Context-selector reproduction](/Users/junedalam/angular-with-ngrx/Angular-Practice/output/review/agentic-ai-context-repro.json)
- [Approval and OpenTelemetry reproduction script](/Users/junedalam/angular-with-ngrx/Angular-Practice/output/review/agentic-ai-runtime-repro.py)
- [Approval and OpenTelemetry reproduction results](/Users/junedalam/angular-with-ngrx/Angular-Practice/output/review/agentic-ai-runtime-repro-results.txt)

The review covers the chapter text and all 117 visual lessons, plus appendices. All 54 Python code blocks parsed successfully; parsing is not proof of runtime correctness. The companion's 19 deterministic tests and demo passed in the production review. Extra reproductions exposed C1–C3 despite those existing tests. The OpenTelemetry reproduction was independently rerun with SDK 1.45.1: the original wrapper exported the synthetic marker, the locally corrected child span did not, and an enclosing span with default settings still exported it. Current framework/protocol claims were checked against selected primary sources, and all claimed defects were checked in their full local context. Relevant PDF pages were rendered for exact page references and visual context. This is not a claim that every SDK snippet, external service integration, remote link or possible input has been exhaustively tested.
