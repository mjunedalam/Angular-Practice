# Agentic AI Engineering: editorial and production review

Prepared for Muhammed Juned Alam | 12 October 2026

## Overall assessment

The book has a strong architecture-first curriculum and a useful recurring production story. It is not ready for a final publication export. The main obstacles are specific correctness problems in worked examples, fragmented learning units, inconsistent diagram legibility and excessive page-level whitespace. These need an editorial and typesetting pass, not simply more decoration.

The strongest material separates model output from runtime authority, keeps security and operations close to implementation, and repeatedly returns to ShopAssist and AegisOps. Preserve that structure. Repair the examples that contradict those principles, then improve the layout around complete learning units.

The attached visual specimen shows a proposed direction using the book's existing navy, teal and warm accent palette. It contains three technical figures and one complete sample learning page. It is a design proof; the original 872-page book has not been rewritten or repaginated.

## Scope and how to read the findings

- Source: Agentic_AI_Engineering_ebook.pdf, supplied by the user. All page references in this review are physical PDF page numbers, which match the visible numbering in the reviewed material.
- Coverage: extracted text across all 872 pages, all 39 chapters, the preface, Appendices A-G, author pages and index. All pages were visually screened in contact sheets; selected complex or suspect pages were inspected at larger resolution.
- Inventory: 244 unique numbered figure labels, 39 memory-card labels, 295 occurrences of the ANALOGY label, and approximately 169,272 extracted words. Label counts are inventories, not quality scores; 295 includes the generic conventions label.
- Format: approximately 7.44 x 9.69 inches; exported with WeasyPrint 70.0; fonts embedded; only the cover appears in the raster-image inventory. Interior diagrams use vector/text drawing, which is a valuable foundation for redesign.
- Limits: this is an editorial, static technical and visual review. Every program was not executed, every cited URL was not tested, every diagram label was not individually magnified, and every index locator was not independently proved correct. Thumbnail coverage is not a claim of full-resolution inspection of all pages.
- Findings distinguish confirmed defects, source-dependent implementation questions and design recommendations. A clean-looking thumbnail or an empty audit flag does not certify a page as error-free.
- The machine-readable companion includes one record for every page, all 244 numbered figures and the memory-card page list. It preserves screening flags and does not disguise automated candidates as confirmed defects.

## Publication priorities

### 1. Correct the examples that teach unsafe or inconsistent behavior

These are the highest-priority examples to repair before the next edition is exported. The chapter reviews give the surrounding explanation and additional findings.

- Pages 14 and 226-246: the mini-harness is described as complete and runnable, but the displayed chapter omits required construction and helper code. Its in-memory checkpoint example also does not establish restart durability. Supply a complete tested companion file and make the printed scope explicit.
- Page 371: execute_if_still_valid checks other approval fields but does not explicitly require an approved decision. A rejected decision must never reach the mutation. Add that check plus tests for denial, expiry, changed arguments and replay.
- Page 459: the saga example can report failed_safe after compensation fails or an irreversible step has run. Preserve unresolved side effects and use an honest reconciliation/escalation state.
- Page 600: the sample permission hook allows a broad MCP tool-name prefix. Replace that with the intended explicit tool allowlist and fail closed for newly introduced tools.
- Page 636: the approval gate can overwrite human approval with an automatic record and does not enforce the later risk-5 prohibition. Preserve approval provenance and make the same risk policy apply in code, diagrams and prose.
- Pages 713 and 783: a local unique row is not, by itself, proof that an external rollback or refund happens exactly once. Show the full intent, downstream idempotency, outcome and reconciliation contract.
- Pages 734-736: align RunContext with the fields actually used by the policy example; ctx.environment is referenced without being declared in the shown model.
- Page 790: the absence of a seller_type column cannot establish a first-party-only population. A safe refusal must not invent the provenance of the reported number.
- Pages 841-842: a read-only root filesystem prevents writes, not reads of existing sensitive files. Correct the solution's isolation explanation.
- Pages 849-850: a genuine restart resets in-memory counters. The exercise should verify persisted evidence across processes rather than assert a cumulative process-local count.

The external-side-effect qualification is consistent with provider idempotency contracts, whose behavior and key retention must be understood rather than assumed: [Stripe: idempotent requests](https://docs.stripe.com/api/idempotent_requests). LangGraph also documents that interrupted nodes run again when resumed; side effects must be placed and protected accordingly: [LangGraph: interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts).

### 2. Repair obvious visual defects before replacing good diagrams

- Page 172, Figure 8.3: context-budget labels overlap or are cropped. Redraw as a clean stacked allocation with labels in a separate legend, and keep numbers outside narrow segments.
- Page 403, Figure 20.1: the permission-circle labels run together and the effective-permission label overruns its shape. The specimen's first page shows a readable alternative.
- Pages 90 and 177: exploded figures contain isolated token units where the in-plate numeric label needs repair. Keep all quantity labels intact and verify them against the adjacent annotations.
- Page 218, Figure 10.5: the figure claims token-proportional plate areas, yet the displayed ordering of areas contradicts the quantities. Either make the geometry proportional or clearly label the diagram as not to scale.
- Page 241, Figure 11.4: the resume command extends beyond its terminal card. Wrap at a safe code boundary or enlarge the card; do not clip the text.
- Page 512, Figure 26.3: the PARTS field collides with the SHEET field in the drafting footer. Give metadata a separate row or remove the decorative engineering-title block.

Many figures are already useful. For example, the exploded span on page 512 communicates a meaningful part-whole decomposition; the footer is the defect. A wholesale raster redraw would sacrifice editability and sharpness without solving the underlying layout rules.

### 3. Recompose the pages around complete learning units

The page-break issue is real, but the evidence does not support saying that all figures are split. Reviewed figures generally retain their captions. The recurring failures are split listings, stranded introductions, detached annotations, overflowing chapter openers and very sparse carryover pages.

| Pages | Observed problem | Recommended correction |
| --- | --- | --- |
| 23-24 | A heading and analogy occupy a small part of p. 23; the explanatory figure follows on p. 24. | Compose a single learning unit with the analogy and a smaller, wider figure, or place useful explanatory prose before the figure. |
| 35-37 | One model-client listing spans three pages. | Publish complete named listings for data contracts, the adapter and the client methods; keep each unit intact. |
| 153-154 | Code continues across the page boundary. | Recompose around complete declarations/functions and preserve the surrounding explanation. |
| 236-237 | Three explanatory lines are stranded on p. 236 before the executor listing. | Keep the introduction with the first complete listing unit. |
| 251-252 | A two-line pipeline introduction occupies p. 251. | Move the introduction to the figure page or rebalance the preceding page. |
| 332-338 | Analogy, figures, introduction and code are dispersed; p. 337 contains only a few code lines. | Make each graph concept a complete teaching unit and place the reducer snippet with its explanation. |
| 409-410 | Policy code crosses the boundary. | Split the presentation into complete policy rules with explicit titles. |
| 497-499 | Evaluation code spans several pages. | Present separately named runnable units; keep assertions and the values they test together. |
| 585-586 | Chapter 31's opening outline spills over. | Shorten the chapter opener's objectives and outline so the opener fits one page. |
| 600-601 | A numbered code listing continues with lines 42-49 on the next page. | Refactor into complete listings rather than leave an unlabeled tail. |
| 609-610 | Chapter 32's outline occupies a mostly empty overflow page. | Reduce the opener to a compact learning map and place detailed navigation at section starts. |
| 636-637 | Another numbered listing spills at line 41. | Separate the approval gate and following functions into complete units. |
| 650-652 | Short cloud-track notes are stranded on separate pages. | Keep architecture figure, caption and track notes together. |
| 849-850 | Code annotations are separated from their listing. | Keep markers and their explanation in one complete listing block. |
| 865-866 | One self-check answer is isolated on p. 866. | Keep each chapter's short answer group together or rebalance p. 865. |
| 867-868 | The author contact card gets its own page. | Integrate it with the author biography. |
| 869-872 | A few index entries overflow onto the last page. | Rebalance the index columns after all pagination is final. |

An automated body-text extent screen flagged 22 pages whose body text ends above 200pt on a roughly 697pt page: 5, 15, 23, 32, 119, 176, 236, 251, 272, 332, 335, 337, 391, 557, 610, 650, 652, 656, 718, 866, 868 and 872. This is a screening threshold, not a count of 22 proven bad pages. Intentional part openers and the cover should not be judged by ordinary text-page density.

## The no-split production specification

The desired result should be defined in terms that the compositor can actually verify. Each diagram and its caption, analogy box, paragraph, short example, exercise item, table row, code function and code annotation group must fit on one page. Headings stay with the content they introduce.

A chapter necessarily uses multiple pages; a single learning block should not be cut arbitrarily between them. If a block is taller than the printable page, redesign it into explicitly named, self-contained units before pagination. Do not solve overflow by shrinking the type until it is unreadable.

- Paragraphs: keep ordinary paragraphs intact. Edit unusually long paragraphs into complete shorter arguments.
- Headings: retain the heading with its first complete paragraph or illustration. Avoid a heading above a forced empty expanse.
- Analogies: keep heading, explanation, mapping and limitation together. Target a concise box that fits comfortably within the normal page grid.
- Figures: figure, caption, legend and essential notes are one unit. Use book-width diagrams with an explicit height budget. A large figure can own a page when it uses that page well.
- Tables: keep each row intact. If the entire table must fit one page, rewrite or divide it into separately titled tables with complete headers and meanings. Never allow a lone header or a truncated row.
- Listings: give every unit a listing number, purpose and file/function context. Keep a complete function with its explanation. Long examples belong in a companion repository with complete build/run instructions; the book still needs enough code to teach each mechanism.
- Exercises: keep each question and all choices together. Keep short answer groups and their explanations together.
- Chapter openers: one deliberate page containing title, purpose, prerequisites, learning outcomes and a compact map. Do not let a template overflow accidentally.
- Page balance: examine both individual pages and facing-page spreads. Eliminate sparse carryover pages caused by a figure or listing being pushed forward unnecessarily.

For an HTML/CSS source, group these units structurally and apply break-inside avoidance to the unit, with break-after avoidance on headings. Such rules are not an unconditional guarantee when content exceeds the page; manual size budgets and render checks are still required. The fragmentation specification explains break avoidance, forced-break precedence and widow/orphan controls: [W3C CSS Fragmentation](https://www.w3.org/TR/css-break-3/).

Only the PDF was supplied. The exact source-level cause of each break cannot be established from the PDF alone. Forced breaks, oversized keep-together wrappers and conservative figure sizing are plausible causes, not confirmed CSS diagnoses. A reliable whole-book repair should be made in the original manuscript/HTML, stylesheets and vector sources, followed by a fresh export and regenerated navigation.

## A more attractive diagram system

The book already has a visual vocabulary: sketches, process/architecture figures, exploded views and X-rays. Keep those purposes distinct, but make their typography, spacing and semantics consistent. Beauty here should help a reader understand a mechanism quickly and remember it accurately.

### One coherent visual language

- Use navy for the model/core component; teal for ordinary runtime flow; amber for side effects or waits; red for denial/risk; green for verified outcomes. Do not make colour the only carrier of meaning.
- Use one sans-serif family for technical labels. Reserve the handwritten treatment for a small number of conceptual opening sketches and memory hooks.
- Use short noun labels for components and verb labels for transitions. Keep detailed commentary outside the nodes.
- Give normal flow, exceptional flow, data movement and trust boundaries distinct, documented line treatments. The current description of dashed arrows as optional, conditional or asynchronous is too broad for a reader to infer one reliable meaning.
- Prefer a clear reading direction and orthogonal connectors. Show one main path first, then a few clearly labelled failure branches.
- Use real whitespace between labels, connectors and shapes. Remove grid paper, tape, decorative footers and faux depth when they consume room needed by the explanation.
- Keep vector output and editable text. Check both the original SVG/viewBox and the final PDF; clipping can occur inside a drawing even when nothing exceeds the PDF page bounds.

### Typography that survives the actual trim size

The document uses readable body typography in many places, but diagram text varies sharply. The font-coordinate screen found 40 figure-bearing pages containing non-body text below approximately 6pt. Examples include pages 26, 68, 111, 112, 160, 238, 318, 407, 783 and 795. These are page-level screening measurements from rounded extraction data, not a claim that every word of those figures has that size.

Set a working target of 9-11pt for figure labels at final book size, with 8pt as a floor for minor annotations that are still legible in a print proof. Prefer simplifying or enlarging the figure over shrinking labels. Use a consistent 1-1.5pt visual stroke and enough contrast to work in grayscale. These are design targets for this book, not a formal accessibility certification.

### Match the diagram to the concept

| Concept | Best visual form | What the reader must see |
| --- | --- | --- |
| Agent/tool loop | Numbered process or swimlane | Model intent versus runtime execution; return path; stop conditions. |
| Runtime states | State machine | Legal transitions, guards and terminal states. |
| Tool/approval exchange | Sequence diagram | Actors, time order, rechecks, rejection and replay behavior. |
| Authorization | Permission intersection or filter cards | User, workload and task constraints all apply. |
| Context budget | True proportional stacked allocation | Actual token quantities and reserved output; no misleading areas. |
| RAG | Separate indexing and query lanes | Ingestion, retrieval, authorization, evidence and answer provenance. |
| Platform architecture | Layered component diagram | Ownership, trust boundaries and control/data paths. |
| Failure and recovery | Before/after sequence or state timeline | Crash window, uncertain outcome, reconciliation and verified completion. |
| Structured object | Exploded view with a parts list | Genuine parts and relationships; scale clearly stated. |
| Hidden execution | X-ray comparison | What the user saw versus what the system actually did. |

The four-page specimen demonstrates this direction at the original trim size. It is intentionally readable at normal magnification and keeps each complete teaching unit on its page.

## Concepts, analogies and instructional rhythm

The overall progression is sound: foundations, runtime, retrieval/protocols, orchestration, security, reliability, operations, platforms, specialized systems and capstones. The chapter reviews below identify local corrections without replacing this structure.

The book's recurring examples are a strength. Use them more consistently to show accumulated state: the same refund/action ID, approval record, evidence bundle and budget ledger should carry across related chapters. Readers should see how one system becomes more robust rather than repeatedly start from an unrelated miniature.

The analogy density is high. Keep analogies that explain a difficult distinction; shorten ones that merely restate a familiar process. A strong analogy box should answer three things: what maps to what, what engineering decision follows, and where the comparison stops being accurate. The sample learning page demonstrates that last part explicitly.

Avoid implying that a human-like model description confers human judgment, authority or reliable memory. Likewise, distinguish a simulation of failure from proof of a distributed guarantee. Words such as complete, durable, exactly-once, verified and safe should match the evidence the code actually provides.

Exercises, interview drills, myths, memory cards and self-checks are useful, but five successive forms of the same summary can slow a chapter. Keep one concise synthesis, one worked application and questions that require different reasoning. Use explicit rubrics or expected outputs for capstones so readers can tell whether they have succeeded.

Current protocol/framework statements should be versioned and tied to primary sources. The review verified that the cited July 2026 MCP revision and newer SDK/framework material exist; they should not be marked wrong merely because an older reference differs. A dated source check and pinned runnable example are more useful than an unsupported claim of universal currency.

## Book production beyond the diagrams

- Preserve the useful serif body/sans-serif heading distinction and the restrained interior palette. Harmonize the cover's futuristic visual tone with the more editorial interior.
- Separate cover, title and copyright roles deliberately; make title, subtitle, author and edition hierarchy consistent. The current title/copyright page is serviceable but crowded in purpose.
- Use short running chapter titles where long titles strain the header. Keep outer/inner margins suitable for the intended binding, and proof facing pages at actual size.
- Regenerate contents, figure references and index after the final pagination. The current contents spreads and index overflow need rebalancing, not manual page-number patches.
- Distinguish screen navigation from print navigation: preserve bookmarks and internal links, and create a tagged PDF with logical reading order and meaningful figure descriptions for the final digital edition. The supplied PDF is untagged.
- Keep publication claims proportionate: references, runnable-code availability, exercise scope and version guarantees must match the delivered files.

## Recommended production order and acceptance criteria

1. Correct the technical examples and align prose, diagrams, code and answer keys around the same invariants.
2. Recover the editable manuscript, CSS and figure sources; establish one component library for learning blocks and one visual style guide.
3. Repair clipped, overlapping and misleading figures first, then harmonize the remaining figures and memory cards.
4. Recompose oversized code and tables into complete named units. Apply the no-split rules to each unit and adjust figure aspect ratios.
5. Export the full book. Rebuild the contents, index, bookmarks and cross-references from final anchors.
6. Inspect every page and every facing spread. Zoom every complex figure and code listing at final trim size, and print representative dense pages.
7. Run the published companion examples and their failure/restart tests under the pinned dependency versions. Record what was actually tested.

Release criteria: zero clipped labels; zero overlapping diagram text; zero orphaned headings, captions, table headers or answer fragments; complete code units with their annotations; no unexplained sparse carryover pages; consistent figure semantics; verified references; and technical claims supported by the examples. Intentional part-divider whitespace is acceptable and should look intentional.

The rest of this report provides the detailed chapter and appendix review, with additional page-level evidence, corrections and primary-source checks.


# Foundations and core runtime (Chapters 1-14)

## Scope and verification

- Source: /Users/junedalam/Downloads/Agentic_AI_Engineering_ebook.pdf. Review only; original unchanged.
- Read extracted text of physical PDF pages 1-309 in chapter chunks, including the preface, all of Chapters 1-14, and the Chapter 15 opener only for the boundary. The cover (p. 1) is image-only and was visually inspected. Chapter 15 substantive review belongs to the next reviewer.
- Page references below mean physical PDF page numbers. The displayed Arabic page numbers match these numbers in the body checked here; the cover, title/copyright page and part dividers intentionally omit displayed numbers.
- Visually inspected every assigned page in nine contact sheets (36-page batches, last batch partial). This establishes page composition, chapter boundaries, figure/caption grouping and conspicuous whitespace; it is not a full-resolution proof of every glyph.
- Additionally inspected 120-dpi renders of pp. 28, 90, 172, 177, 214, 218, 241, 252, 282 and 299. Full-resolution visual findings are marked explicitly below.
- Executed two small isolated Python reproductions of the p. 181 provenance mismatch and pp. 139/143 idempotency-key instability. Did not obtain or run the companion repository, execute the entire harness, install/test the MCP SDK, execute SQL against PostgreSQL, or measure a live model. Static code conclusions are distinguished from these focused reproductions.
- Page 14 explicitly says ordinary listings sometimes trim imports, helpers and error handling. Such omissions are not automatically defects. Chapter 11 is the exception: pp. 14 and 227 explicitly promise a complete runnable file.

## Overall assessment

The conceptual backbone is strong. The book consistently separates a model's proposal from the runtime's authority, and gives readers a coherent vocabulary for harness, state, context, memory, tools, skills and protocols. ShopAssist is a useful running example because duplicate charges exercise evidence, approval, uncertain side effects and recovery. The unusually consistent chapter rhythm supports learning and retrieval: analogy map, mechanics, build-it example, failures, interview drills, memory card and self-checks.

The most serious weaknesses are contracts between text, code and diagrams. A number of samples illustrate a mechanism while their prose or captions imply a stronger guarantee. Fixing these discrepancies would improve credibility more than adding more introductory explanation. The mini-harness and the context builder deserve a correctness pass before copy editing. The attractive visual vocabulary should be retained, with greater attention to factual encoding, legibility and page density.

## Priority findings

### F01  -  Chapter 11 is not reproducible from the printed listings as promised (high)

**Pages14, 226-227, 230-240.** The preface and Chapter 11 say mini_harness.py is complete and runs as shown. The chapter does not print the imports, Harness class declaration/constructor, start, _finish, idem_key, ScriptedModel, concrete argument models, registry/tool setup or REFUNDS definitions required by p. 239. The chapter is an annotated tour of selected parts of a file, rather than the complete file itself. This is distinct from the permitted omissions in ordinary listings.

**Fix:** provide the complete, versioned companion file at a persistent URL/QR code at the chapter opener and p. 239, with Python and dependency lock versions, exact commands and expected output. Change the promise to "the complete companion file runs as shown; listings below are excerpts" unless the entire file is actually printed. Add a clean-environment execution check against the published companion artifact. The p. 11 companion-code paragraph needs a directly usable entry point; this reviewer has not established whether a later appendix supplies one.

### F02  -  The mini-harness's "hard" budgets do not bound execution at each boundary (high)

**Pages232-233, 235, 237.** Budget is checked before a model call only. If a response includes many tool calls, _execute increments tool_calls and invokes each one without checking max_tool_calls, deadline or cost again. A single tool can block beyond the deadline because the shown executor has no timeout. resume executes the approved pending call before entering the budget-checked loop, and resets started to the current monotonic time, making deadline_s a fresh allowance on every resume.

**Fix:** define active-execution versus absolute-run deadlines explicitly. Enforce the selected deadline and remaining tool-call allowance before every execution, including approved resume. Make per-tool timeouts part of the executor, and cap/request remaining model output tokens and reserve estimated cost if "hard monetary cap" is intended. Explain that after-the-fact cost accounting alone can exceed the cap by one call. Add cases with a multi-call response, a blocked tool and a delayed approval. These are static control-flow findings; full harness execution was not performed.

### F03  -  The mini-harness X-ray claims process durability that its example does not demonstrate (high)

**Pages234-235, 239, 241, 246.** The demo instantiates InMemoryCheckpoints, which survives only while that store instance/process remains alive. Figure 11.4 on p. 241 says the pause survived a process exit; p. 235 describes approval arriving on a different worker. Exercise 2 on p. 246 asks readers to add SQLite and prove process-restart recovery, correctly identifying work the example has not yet done.

**Fix:** either demonstrate a durable store and a real two-process run before making those claims, or caption the X-ray as an in-process pause/resume. Retain the SQLite exercise but label the in-memory adapter's limits beside its introduction. The "checkpoint is the only copy" note is also too categorical while local RunState and model state still exist in the same process.

### F04  -  The context manifest can attribute the selected passage to the wrong source (high, reproduced)

**Page 181, lines8-9 and 20-21.** evidence_txt is constructed from rank(fresh_ev, state.goal), then zipped with the unranked fresh_ev when producing the manifest. A reversed ranking with one selected item gives the model E2 but records E1/sourceA in the manifest. This is the opposite of the chapter's provenance guarantee.

**Fix:** keep (item, rendered_text) pairs in ranked order and carry the selected item IDs through budgeting; build the manifest from those retained records. Extend it to memory, instructions, state and messages if it is to mean the whole context manifest. Also add tenant_id to the p. 179 ContextItem schema or explicitly introduce the enriched type expected by p. 181; the presented ContextItem has no such field.

### F05  -  The mutating-tool example hashes wording that the chapter says must be excluded (high, reproduced)

**Pages139 and 143, line17.** p. 139 correctly warns against hashing reason/evidence free text into effect identity. p. 143 passes the entire args.model_dump() to idempotency_key; the p. 133 model includes both reason and evidence. Rewording only the evidence changes the key for the same payment/amount. A focused reproduction confirmed unequal keys.

**Fix:** define a tool-specific effect_identity method containing canonical business fields only (including currency and tenant/resource identity where appropriate). Persist the approved intent and key before execution, then reuse that stored key on retry/resume. Use the same definition in the interview answer on p. 145. Also distinguish retry deduplication from a business rule preventing a duplicate refund proposed in a different step or run; run/step-scoped keys alone do not enforce that business rule.

### F06  -  Check-before-act is not an idempotency guarantee (high conceptual qualification)

**Pages139-140, 145.** "Check whether a refund exists before acting" is useful reconciliation, but two workers can both observe absence and both write; a previous timed-out write may also not yet be visible. p. 162 correctly discusses fencing, but the Chapter 6 fallback needs its own qualification.

**Fix:** describe check-before-act as a risk reduction unless the check and write are protected by an atomic uniqueness constraint/transaction, a downstream idempotency primitive, or a suitably enforced lock/fencing scheme. When none exists and an earlier outcome is uncertain, reconcile or escalate rather than automatically recreate the write.

### F07  -  Figure 10.5's token-size claim is contradicted by its geometry (high visual, full-resolution verified)

**Pages217-218.** The diagram says plate area is proportional to tokens. Metadata is labelled 60 tokens but its plate is visibly larger than Instructions labelled 1.4k tokens. Reference data at900 is larger than the1400-token instructions. Scripts/tests are labelled10 tokens each, while p. 217 says scripts cost no tokens at all. The right-hand numbers are readable; the quantitative encoding is wrong.

**Fix:** distinguish manifest/path/description token overhead from executed script contents. Use exact proportional geometry with a zero/near-zero execution plate represented by an icon, or explicitly say "schematic; plate size does not encode tokens." Show a separate bar chart if scale makes small items illegible. Avoid a quantitative claim that the illustration cannot honor.

### F08  -  Figure 8.3 labels overlap and clip (high visual, full-resolution verified)

**Page 172.** The 32k stacked bar's System+policy/Tool schemas/State snapshot labels run into one another; the System label is cropped at the left edge, and Memory crowds adjacent labels. The totals do correctly add up to32k. This is a labeling/layout defect, not a numerical-total defect.

**Fix:** move narrow-segment labels outside the bar with leader lines or a keyed legend, retain numeric widths, and label 0.8k/0.7k clearly. Verify at final print size. A horizontal list of labeled budget rows would preserve readability without sacrificing the single-bar overview.

### F09  -  The main Chapter 14 adapter does not use one consistent Tool contract/execution model (high integration finding)

**Pages142, 231, 237, 299, 308.** p. 299 says MCP tools go behind the Chapter 6 registry but constructs Tool with scope; Chapter 6 Tool requires version and required_scope, not scope. The fields instead resemble Chapter 11's different Tool dataclass. In addition, _caller produces an async function, whereas Chapter 11's executor directly calls tool.fn and would receive an unawaited coroutine. Exercise 1 on p. 308 asks for precisely this integration without showing the bridge.

**Fix:** choose one shared Tool contract for the teaching repository, give adapters exact version/scopes/risk fields, and make the executor uniformly async or supply an explicit sync bridge. Show creation and lifetime of the SDK2 Client context and a test that the MCP function was actually invoked. The SDK2 client names and input_schema attribute themselves are correct according to official current documentation; do not "repair" them to SDK1 names.

### F10  -  Baseline RAG is incorrectly equated with no quality control (medium-high)

**Page 274.** The comparison lists baseline RAG's Quality control as "None," even though Chapter 12 already teaches reranking, freshness, citation checks, groundedness and evaluation. Likewise rewriting and source routing can be deterministic pipeline stages; neither automatically makes RAG agentic.

**Fix:** label the column "minimal one-shot RAG" if that is the intended straw baseline, or say "fixed validation/ranking stages" versus "adaptive model-directed retrieval/checking." The actual differentiator is who controls whether/how/when to retrieve, not whether the system is sophisticated or quality-controlled.

### F11  -  The no-new-evidence rule counts arrivals rather than new evidence (medium-high)

**Page 277.** evidence += run_retrieval(sq) followed by len(evidence)==before does not detect repeated passages. Returning the same IDs each round grows the list and bypasses the intended diminishing-returns condition. The loop remains bounded by max_rounds/max_queries, so this is not literally an infinite loop.

**Fix:** maintain a ledger keyed by source/version/chunk or stable evidence ID and test for newly accepted, relevant unique entries. Count every actual source query, rather than one multi-source SubQuestion, if max_queries is meant to bound backend calls. Validate sufficiency coverage against ledger IDs rather than accepting free strings in covered.

### F12  -  Citation existence is not semantic support (medium-high)

**Pages259-261.** The prose properly distinguishes ID existence from optional entailment checks, but the X-ray claims every claim was supported. verify_citations only rejects unknown IDs; claims can be empty and answer can contain uncited statements. A real but irrelevant chunk ID passes.

**Fix:** label that sample verify_citation_ids and distinguish citation validity, citation completeness, and claim support. Make the X-ray show an explicit support checker and disclose whether it is deterministic, model-based or human-reviewed. Bind the displayed answer to validated claim records, and test an answer with no claims and an irrelevant-but-real citation.

## Chapter-by-chapter coverage and recommendations

| Section / physical pages | What works | Specific revisions and teaching/diagram recommendations |
|---|---|---|
| Preface6-15; front matter1-5 | Clear architecture-first audience, role paths, ShopAssist/AegisOps distinction, illustrative-chart disclosure and a diagram legend. The sketch/exploded/X-ray taxonomy gives the book an identifiable style. | p. 9 says security should not be skipped by action-taking agents, yet the ML/AI path lists20-22 for later. Add a required security minimum for every shipping path. On p. 13 include shape/text equivalents for color meanings so grayscale readers retain the semantics. On p. 11 give a clickable companion URL and code/release manifest. Clarify excerpt versus runnable-file promises on p. 14. |
| Chapter 1,17-41 | Excellent intent-versus-execution boundary; Pydantic after-model validation on p. 25 is a sound choice for the omitted order_id case. The waiter, deposit-slip and independent call-centre worker analogies are memorable. Provider error/retry taxonomy is actionable. | p. 37 says two repairs cost at most three calls, but generate permits four adapter attempts per call by default: up to12 raw attempts. Say three logical generations plus transport retries. generate_structured returns only the final response usage; account for failed generations/repairs independently so cost budgets reflect all calls. Implement Retry-After handling or identify it as omitted (p. 29 promises it). Treat refusal explicitly before repair. p. 28's caption names one TTFT/rate while showing three model curves; state each curve's parameters. Define whether TTFT already includes queueing to avoid double counting. Add an analogy limit: the sealed consultant has learned general knowledge, even though live/private case data must come in the folder. Modern adapters may need opaque reasoning/provider items, not only plain-text history. |
| Chapter 2,42-63 | Useful operational definition of agentic control, hybrid qualification, per-action autonomy levels and explicit stop reasons. Taxi/train and instructor brake-pedal comparisons work. The observed payment example on p. 52 shows where policy is applied. | p. 48 labels all tools deterministic because they call real systems; deterministic runtime logic does not mean deterministic external observations or every tool implementation. Replace with "controlled/testable wrapper; external behavior may vary." The narrow LLM-agent definition should be called the book's working definition, not the complete AI field's definition. p. 59 accepts a model's finish claim as completed, despite pp. 56/60 requiring controller verification: label it as a deliberately incomplete mock and point forward to p. 118. The p. 55 acceptance-rate example is illustrative evidence, not an automatic autonomy threshold; include severity and rejection-detection quality. |
| Chapter 3,64-83 | Strong control-flow framing, fair treatment of ReAct versus reviewable plans, explicit warning that a critic needs evidence/criteria, and concurrent partial-failure awareness. The editor analogy is especially good. | Figure 3.2 p. 67 implies one monotonic autonomy ordering although reflection and hierarchy are orthogonal patterns; show a small matrix of decision frequency versus decomposition/review. p. 69 slices serialized JSON arbitrarily to4000chars; bound content before serialization and preserve an explicit truncation flag. p. 71 X-ray shows a no-progress guard forcing an answer which the p. 69 sample does not implement: mark it an enhanced run or add the guard, with insufficiency checked before forced answering. p. 76 returns an unverified final revision after budget exhaustion; return a typed verification status, not a bare string whose comment says to mark state. Router confidence0.6 on p. 72 should be calibrated on held-out data, not read as universal. |
| Chapter 4,84-103 | Strong ownership/version/release discipline, examples chosen around decision boundaries, explicit warning that delimiters are not a security boundary. The sealed-envelope/safe analogy appropriately limits what formatting can guarantee. | Label Figure 4.2 p. 87 as the application's trust hierarchy; provider role hierarchies differ and system/developer are not universally interchangeable. p. 94 composition allows duplicate pack IDs while manifest silently keeps only the last version: reject duplicates/conflicts or implement the dedupe promised by Figure 4.4. p. 97 accepts arbitrary kind into an HTML-like tag: restrict kind to allowed constants, in addition to escaping text/source. Tone and reasoning-effort advice on pp. 97-99 is sensible for supported current models but needs dated provider-specific citations. p. 90 full-resolution render contains isolated "tok" labels inside several plates; remove duplicate unit fragments or print full values. |
| Chapter 5,105-125 | Precise harness/framework/platform distinction; small runtime API; useful ownership table; verified-completion step on p. 118; fail-closed policy hooks and symptom-directed diagnostic table. Flight-plan analogy explains reusable definitions. | The "one harness for all agents" recommendation is a good default, not a proof that every domain needs no new runner. Keep extension boundaries visible. p. 116 emergency escalator "immediate stop" analogy overpromises relative to the text's allowance for in-flight calls to finish: say stop scheduling immediately at the next boundary, reconcile active mutations. Ensure the simple p. 118 loop's run_checked contract explicitly includes per-tool cancellation, approval persistence and budget enforcement. Figure 5.6 p. 120 should include outcome verification, since p. 118 makes it central; output PII/format checks alone do not verify cancellation/email delivery. |
| Chapter 6,126-147 | The model-facing versus runtime-facing tool distinction is excellent; side-effect classification, scoped credentials, pinning descriptions and schema changes, and uncertain-network-outcome example are strong. | Apply F05/F06. p. 133 uses float money while p. 134 specifies two decimals: prefer integer minor units plus currency, or Decimal with quantization and business caps. p. 136 gather has no return_exceptions and no local error-envelope catcher: enforce execute_one's no-throw contract or explicitly handle per-call failure. Do not reorder all reads before writes unless independence is proved; a read can depend on an earlier write. "A hidden tool cannot be misused" on pp. 134-135/146 is too absolute: omission reduces likelihood/context cost, but the executor must reject hallucinated or unauthorized names, as the later mini-harness correctly demonstrates. Reads are not universally harmless (sensitive egress, quotas, billable operations). |
| Chapter 7,148-167 | Excellent state/context/memory separation, pointers to large payloads, event/reducer model, intent-before-effect crash sequence and explicit fencing-token explanation. The handover and change-of-watch analogies are practical. | p. 158 approval_resolved always sets running, regardless of approval decision, remaining pending approvals or terminal status. Make the reducer honor approval semantics and the legal-transition gate of p. 159; demonstrate rejection/duplicate/late events. p. 164 load_state silently accepts newer schema versions: reject unsupported future versions before Pydantic parsing. The printed state model has usage but not persisted limit/deadline/start fields, while p. 155 promises wall-time coverage; include or explicitly externalize them. Do not fault Pydantic's list defaults as shared mutable state: Pydantic handles nonhashable defaults independently. The exactly-once p. 160 caption is conditional on downstream deduplication/fencing; keep those prerequisites in the caption. |
| Chapter 8,168-185 | Strong per-source budgeting, critical facts in state, summary-drift warning, freshness/provenance and central egress control. The suitcase/photocopy analogies communicate the tradeoffs without implying summaries are exact. | Apply F04/F08. p. 173 assumes overflow always honors the budget and never verifies the final size; assert postconditions after each shrink operation and after provider serialization, counting tool/message overhead. Preserve assistant-call/tool-result pairs when pruning history. p. 181 excludes policy checks on recent_msgs/state render unless those sources were prevalidated; say so explicitly. Escape evidence id/source attributes as well as body text. Figure 8.6 p. 177 puts reserved output among plates "changes every call"; reserve is capacity, not input context sent to the model. Its in-plate labels show isolated "k" fragments; remove or complete them. |
| Chapter 9,186-207 | Treating memory as a governed data product rather than nearest-neighbor search is an excellent lesson. Semantic supersession, episodic append, reviewed procedural releases, lineage/deletion and SoR precedence are clearly distinguished. | p. 196 write gate blindly supersedes an existing record with any different accepted value; implement the higher-trust-source reconciliation promised on p. 199 before replacement. Model confidence>=0.8 is not proof that a new inferred fact should replace a verified fact. Bind subject/tenant/scope to authenticated runtime identity rather than trusting candidate fields. Show transactional supersession to prevent two current facts. On p. 189 "one call · milliseconds" is a misleading lifetime label for calls often measured in seconds/minutes; use "one call." Registers/RAM/disk analogy is about access/use patterns; persisted run state is not inherently volatile RAM. The categorical ban on restricted memory is the proposed enterprise policy, not a universal technical impossibility. |
| Chapter 10,208-224 | Progressive disclosure and reusable capability packaging are strong, with a helpful distinction between a skill loaded as know-how and a skill exposed as an operation. Deterministic refund eligibility is a good teaching center. | Apply F07. p. 212 skill.yaml/INSTRUCTIONS.md is a book-designed manifest convention; say that explicitly and distinguish it from interoperable SKILL.md conventions when mapped to platforms. p. 219 resolves ranges at build time, which is sensible; show the exact resolved version/hash in the release manifest so "pin^2" is not mistaken for immutable pinning. p. 215 makes business rules deterministic, but the reason code still comes from a probabilistic classifier; explain how a wrong classification is contained by verification and policy. Avoid "every agent behaves identically" as an outcome guarantee; shared procedure is identical, decisions may vary. |
| Chapter 11,225-246 | Building the harness in stages is the best teaching device in this section; the naive-loop defect table and intent/pending ledger make the need for each layer concrete. The scope-filter-plus-execution-policy test is a good defense demonstration. | Apply F01/F02/F03. p. 233 marks any tool-free model response completed/answered, while p. 241 calls it "goal met"; distinguish answered from verified outcome. p. 237 slices the final JSON envelope by characters, breaking it into invalid JSON; bound fields and then serialize an intact envelope. The ledger intentionally does not pass keys downstream (p. 238 acknowledges the production addition); preserve that limitation. idem_key implementation is omitted, so do not claim it excludes evidence/reason or demonstrate replay semantics that cannot be checked. p. 240 replay test exercises an existing ledger entry, not the crash window; add interruption after intent saved, then after side effect before result saved. p. 241 terminal resume line visibly spills outside its dark card. |
| Chapter 12,248-268 | Clear offline/online pipeline, sensible hybrid default, distinct dense/lexical strengths, RRF formula, structure-aware chunks and parent expansion, separate retrieval versus answer metrics, and citation/version lifecycle. Open-book and recruiter/hiring-manager analogies fit. | Apply F12. p. 259 parent expansion should preserve the actual expanded passage locator/version and recheck authorization/freshness; avoid retaining a child-only locator for unsupported parent claims. The quality claims "most" and "single most influential" need sources or softer scope. p. 264 recall_at_k divides by zero for unanswered queries with no relevant IDs, and both metrics divide by zero for an empty dataset: define unanswerable-query treatment and include it in the golden set. p. 255 calls the chart "illustrative" but also "internal support benchmark"; say "synthetic illustrative values," unless the benchmark is published with dataset/method. Figure 12.2 p. 252 is intact but is a long, narrow diagonal composition with very large unused margins; use equal side-by-side columns and an index node shared across them. |
| Chapter 13,269-288 | Good explanation of multi-source adaptive research, structured sufficiency, corrective fallback, graph versus passage retrieval, governed SQL and one evidence ledger. It correctly distinguishes research Self-RAG training from a practical approximation (p. 279). | Apply F10/F11. Add primary citations for Self-RAG, hypothetical-document retrieval and GraphRAG rather than only naming patterns. "Broaden filters" p. 278 must never broaden tenant/ACL constraints; name mutable relevance/date filters only. p. 282 SQL validator promises columns as well as tables but contains no column allowlist. It excludes any table with a name matching any CTE name, without scope/schema resolution: inspect qualified physical table references independently and resolve CTE names by scope. Reject/normalize invalid/negative/nonliteral LIMIT expressions deliberately. These are static limitations; do not advertise a confirmed SQL exploit without running against the selected SQLGlot/PostgreSQL versions. Real guarantees remain DB role/RLS/timeouts as p. 283 correctly states. |
| Chapter 14,289-308 | USB analogy is apt, function-calling versus MCP distinction is precise, host/client/server ownership is clear, and allowlist/pin/schema-drift/namespace controls are well motivated. Audience binding and no token passthrough are well covered. The stated2026-07-28 protocol and SDK2.x details were checked and are real. | Apply F09. Provide exact SDK pin and setup commands at p. 298; the default stdio sample has no real auth/tenant enforcement and the resource handler lacks the tool's service allowlist: explicitly frame it as a local demo. Add at least one raw request metadata example for the new stateless revision, since old and new peers coexist. p. 293 official tasks extension is optional and negotiated, not available on every compatible core server. "Any MCP host" portability must be scoped to compatible version, transport, features and auth. The argument map/model_from_schema helper is nontrivial; provide its tested implementation and supported JSON Schema subset in the companion. |

## Pagination and figure-system findings

### Confirmed strengths

- All assigned chapter openers are clear and intact. No table or diagram was visibly split across two pages in the contact-sheet sweep. Figure captions appear grouped with their figures in the pages examined. This is a contact-sheet result, not a guarantee of small-text readability on every page.
- The dark part dividers, restrained navy/teal palette, amber analogy tables and pale callouts give the long work a coherent identity. Memory cards support retrieval practice. X-rays effectively separate the user's view from the runtime's mechanisms.
- Full-resolution Figure 10.3 p. 214 has a correct space between its figure number and caption, despite extraction rendering "10.3A"; this is not a PDF defect.

### Confirmed/pattern findings

1. **Figure 8.3 p. 172:** label collision/clipping (F08).
2. **Figure 10.5 p. 218:** numeric plate geometry contradiction and inconsistent script-token claim (F07).
3. **Figures4.3 p. 90 and8.6 p. 177:** isolated unit labels "tok"/"k" on plates; numeric values remain in right annotations. Remove stray duplicates or render complete labels. Treat claimed proportionality as a visual requirement; p. 218 fails even monotonic ordering.
4. **Figure 11.4 p. 241:** terminal line crosses its dark card boundary; wrap long statements and test text bounds within each panel. Also correct the durability/goal-met narrative (F03).
5. **Figure 1.6 p. 28:** caption supplies one TTFT/output-rate pair while chart depicts three curves; supply per-series assumptions. The chart itself is clean and legible at inspected resolution.
6. **p. 251:** a two-line bridge occupies nearly an otherwise empty page before the full-page pipeline on p. 252. **p. 236:** a two-line executor introduction is similarly isolated before code p. 237. These are genuine density/pagination inefficiencies, not missing content. Move the bridge to the preceding page or pair it with a reflowed figure/listing; do not shrink everything indiscriminately.
7. **pp. 23/24,50/51,129/130,152/153,213/214,272/273:** section heading and short analogy/introduction precede a new page with the main diagram/code. They are readable, but the repeated pattern makes a chapter feel padded. Keep a meaningful first explanatory unit with its heading, and integrate shorter figures with prose when possible. A prose lead-in on one page and the intact full-page figure on the next is not itself a split diagram.
8. **pp. 35-37 and153-154:** code sequences continue across page boundaries. They should be typeset as numbered named listings with "continued" headers, clear logical breakpoints and the same listing identity. Prefer keeping a function/class together where it can fit at readable size. The user's no-split goal should apply to figures, table rows, callout boxes and logical code units; a multi-page source file needs planned continuation, not arbitrarily tiny type.
9. **Global diagram convention:** p. 13 promises process-step numbering throughout, but not every process diagram shown in this section uses numbered steps (e.g. Figure 12.2). Either add consistent numbering or say numbering is used where sequence is important. Sketch/memory-card numbers signify concepts, not necessarily execution order; distinguish the two.
10. **Print/accessibility:** color carries safety semantics and dark X-rays use small monospaced text on a grid. Keep the strong visual identity, but remove grid lines behind text, increase diagram label size, use icons/labels as well as color, and proof in grayscale and on paper. Contact sheets cannot validate sub-6pt lettering; the main review's font audit should govern that list.

## Pedagogical edit across the section

- Keep one anchor analogy per concept and one explicit "where the analogy stops" sentence. The model moves between predictive keyboard, consultant, waiter, doctor, driver, pilot and engine; these all illuminate one facet but can blur the boundary between a probabilistic proposal and an authorized effect. ShopAssist can be the unifying real example.
- Repeated "intent, not execution," "prompts guide/code enforces," "state truth/context view," "SoR wins" and "frameworks don't supply business authorization" statements are purposeful reinforcement. Retain a short one-line reminder in summaries, but trim repeated full paragraphs when a later chapter needs space for its new mechanism.
- Give each chapter one complete before/after trace with state, evidence, policy result and exit status. This would be more valuable than another analogy. Especially useful: a denied approval, stale fact re-fetch, duplicated passage round, repair usage accounting and crash after external success.
- Separate four listing labels: runnable companion file, excerpt from a runnable file, interface/pseudocode, and intentionally unsafe baseline. Currently the p. 14 blanket convention and Chapter 11 promises make readers infer too much from samples.
- Separate four visual labels: conceptual diagram, schematic exploded view, synthetic quantitative illustration, and measured result with method. Attractive figures should never imply accurate area/count/benchmark evidence when the data are only illustrative.
- Make self-check distractors less trivial where the topic is advanced; add one case requiring identification of a boundary condition, not just repeating the slogan. E.g. a timeout after a successful refund; a valid citation ID that does not support the claim; two concurrent workers that both passed a check.

## Primary-source verification and citation recommendations

Checked on2026-10-12. These are primary references, not evidence that every sample was executed.

- Pydantic validator documentation supports the p. 25 omitted-default/after-model-validator explanation; no correction is needed on that point. [Pydantic validators](https://docs.pydantic.dev/latest/concepts/validators/).
- Current provider guidance supports using concise task instructions and avoiding unnecessary exposed chain-of-thought demands for supported reasoning models. Provider-specific guidance should be dated rather than generalized to every current model. [OpenAI reasoning best practices](https://developers.openai.com/api/docs/guides/reasoning-best-practices).
- A normalized interface may need to preserve provider reasoning items across tool turns; plain text and tool-call fields are not sufficient for every reasoning API contract. [OpenAI reasoning guide](https://developers.openai.com/api/docs/guides/reasoning).
- Stable shared prefixes are a useful caching principle, but providers/models differ in cache routing, retention and supported controls. [OpenAI prompt caching](https://developers.openai.com/api/docs/guides/prompt-caching).
- Official2026-07-28 MCP supports stateless self-contained requests with per-request version/capability information and compatibility rules for legacy handshake peers. Chapter 14's new revision should not be flagged as fictitious. [MCP2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28), [MCP versioning](https://modelcontextprotocol.io/specification/2026-07-28/basic/versioning).
- The OAuth-related transport authorization flow is optional in MCP implementations and has actual Client ID Metadata Document/DCR deprecation guidance; application resource authorization remains necessary. [MCP authorization](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization).
- Official Python SDK2 is a documented stable line; MCPServer, Client, result.tools and input_schema are valid current concepts. Its async client lifecycle is documented, reinforcing the need to bridge the book's synchronous mini-executor deliberately. [MCP Python SDK](https://py.sdk.modelcontextprotocol.io/), [SDK client](https://py.sdk.modelcontextprotocol.io/client/).
- PostgreSQL allows auxiliary WITH statements including data-modifying operations; the book correctly checks the entire AST for writes, not only a SELECT root. CTE name/scope resolution still needs care. [PostgreSQL WITH](https://www.postgresql.org/docs/current/queries-with.html).
- Exact decimal arithmetic is appropriate for financial invariants, with explicit quantization/currency rules. [Python decimal](https://docs.python.org/3/library/decimal.html).

## Suggested acceptance checks for the revised edition

1. Run the released companion file from a clean Python3.11+ environment, using locked dependencies, and compare printed output with p. 239.
2. Exercise multi-tool budget exhaustion, denied/late approval, process restart, unknown outcomes and duplicate intent wording; verify the required state/status/evidence behavior.
3. Round-trip context manifests after ranking/pruning and ensure every manifest ID matches exactly what was sent.
4. Verify citation completeness and semantic support separately from ID existence, including unanswerable retrieval questions.
5. Proof every diagram at final book size, with text/card bounds and label collision checks; keep all figure+caption blocks, table rows and callout boxes intact.
6. Confirm a dated, pinned protocol/SDK sample for each interoperability chapter and publish the code-artifact locator in the book itself.

# Orchestration, security and operations (Chapters 15-30)

## Scope and confidence

- Reviewed the extracted text of every assigned page, in chapter/page chunks, including examples, analogy maps, exercises, assessment questions and captions. Physical PDF page numbers are used throughout; the visible folios in the inspected detailed pages agree with them.
- Inspected all 276 assigned page thumbnails through eight contact sheets, principally for page rhythm, separation of related material, figure placement and conspicuous collisions. This is an overview visual inspection, not a claim that every small label was legible at thumbnail size.
- Rendered and inspected pages **317, 338, 371, 403, 408, 512 and 579** at approximately 1600 pixels on the long side. The label defects on pages 403 and 512 below are confirmed at this larger size. Other readability recommendations are distinguished from confirmed clipping.
- This was a read-only review of the original PDF. No example was executed, no implementation repository was supplied, and runtime findings are static observations about the printed code. Undeclared teaching helpers are not automatically treated as bugs; the review flags missing checks when the printed example claims to demonstrate those very checks.
- Checked primary documentation for protocol semantics, delegated tokens, distributed locks, sandbox boundaries, privacy risks in prefix caching and governance frameworks. Source-dependent findings include links. Current implementation details should be pinned to a documented version rather than silently following a moving `latest` page.

## Overall assessment

This section has a strong engineering spine: bounded autonomy, deterministic policy enforcement, exact proposals, durable state, idempotent effects, evidence provenance, testing separate from behavioural evaluation, and economics measured against successful outcomes. Chapters 18, 19, 23, 25 and 27 form a useful chain from permission to execution to recovery to measurement to operation. The explanations usually distinguish a model's attempted unsafe behaviour from an executed unsafe action, which is a particularly valuable distinction.

The principal publication risk is **a gap between the guarantees in the prose and the examples immediately below them**. Some examples omit their central security or recovery condition, rather than merely infrastructure boilerplate. They should be corrected before readers are invited to use them as build-it exercises. There are also protocol details that need version-specific qualification and a few absolute statements that should become engineering recommendations.

Visually, the teal/navy/amber palette, restrained cards and vector drawings are consistent and attractive. The sketch, exploded-view and X-ray styles give useful variation. The strongest figures expose a hidden mechanism: approval waits without busy workers, a timeout after a successful refund, a green build that omitted live-model evaluation, and a good overall score hiding weak slices. The visual system is promising, but its decorative layer occasionally competes with the information. Pages 403 and 512 need concrete layout repairs; many near-empty pages need better composition.

## Prioritised defects and concrete repairs

### 1. P1  -  Rejected decisions can reach execution in the approval helper

**Page 371, `execute_if_still_valid`; reinforced by the safety claims on pages 370, 379-380. Confirmed in the full-size rendering.**

The helper checks matching hashes, expiry, separation of duties and current preconditions, then executes. It never checks whether the decision is **approved**. A rejected decision with matching fields passes all printed checks. This is a direct contradiction of the chapter's central invariant, not a missing SDK import.

**Repair:** make the decision outcome a typed field and return safely unless it is approved. Fetch the decision from an authenticated approval service; bind it to `approval_id` and `run_id`; check the applicable approver entitlement and required number of distinct approvers. Add a negative example in which a matching-hash rejection produces no execution. The chapter 24 rejection test is a good existing cross-reference.

### 2. P1  -  Matching stored hashes is weaker than checking the actual proposal

**Page 371; proposal binding described on pages 370 and 376.**

The helper compares `decision.args_hash` with `req.args_hash`, but never recomputes the hash from the **current action and arguments**. `ApprovalRequest` is mutable and its `args` dictionary is mutable. Changing those arguments while retaining both old hash values would pass this helper. It also does not use `approver_group` or `risk_level` to enforce the two-person rule shown elsewhere.

**Repair:** store an immutable proposal snapshot and canonical digest of action, arguments and relevant execution context; recompute/verify that digest before execution. Validate decision identity and approver policy against that snapshot. A printed comment that an outer approval service already performs these checks would reduce ambiguity, but a build-it example should show the essential invariant itself.

**Related caveat:** the read-then-execute precondition check has a race window. State can change between those two calls. For refunds or deployments, send a resource version/conditional precondition to the downstream system and enforce it atomically there. Idempotency prevents repeating the same operation; it does not establish that an outdated operation is still valid.

### 3. P1  -  Saga code reports safety after failed compensation

**Page 459, `run_saga`.**

The function returns `{"status": "failed_safe"}` after logging `needs_manual_compensation` or `compensation_failed`. In either case, completed effects may remain in place. Calling that state safe hides the exact residual risk the chapter is trying to make visible. The `undo is None` comment says approval is required, but the shown execution path does not enforce that approval.

**Repair:** collect unresolved effects and return `needs_manual_recovery`/`compensation_pending` with the remaining steps and owner. Reserve `failed_safe` for a verified safe end state. Enforce irreversible-step approval before the step. Show a failed compensation and its resulting recovery record in the exercise.

### 4. P1  -  The saga journal does not implement the claimed crash resume

**Page 459, paragraph immediately following `run_saga`; exercise 2 on page 465.**

The prose says a crash during compensation resumes compensation rather than restarting the saga. The printed code initialises `done = []` on every invocation and only **writes** journal entries. It never reloads completed steps, the current phase or pending compensations. A crash after `do` but before `journal.record` is also unresolved by this snippet.

**Repair:** persist intent before each effect, give each step and compensation a stable operation key, reconstruct phase and completed outcomes from the durable journal, and resume the remaining compensation steps. Alternatively explicitly label this function an in-memory sketch and put a durable state-machine implementation beside the crash-resume exercise. The current wording overclaims what the example demonstrates.

### 5. P1  -  A deterministic A2A `messageId` does not guarantee server deduplication

**Pages 320-322 and question 3 on page 327.**

The book correctly says the server assigns the task ID. It then treats a stable message ID as sufficient for idempotent delegation. A2A 1.0 says Send Message operations **may** be idempotent; duplicate detection by message ID is optional. A stable ID alone therefore cannot guarantee that an unmodified remote implementation will not create duplicate work. [A2A 1.0 operation semantics](https://a2a-protocol.org/v1.0.0/specification/#331-idempotency).

**Repair:** require and contract-test an explicit deduplication capability/retention policy in the agent adapter or gateway, with a durable caller mapping from logical delegation to server task. Explain the uncertain outcome when the create request succeeds remotely but its response is lost before the caller stores the task ID. Update the assessment answer to include the server-side agreement; message identity is a useful mechanism, not a universal guarantee.

### 6. P2  -  The delegation timeout path references a nonexistent field

**Page 322 compared with the envelope on page 320.**

`delegate` comments that it is idempotent on `env.task_id` and constructs `RemoteTaskTimeout(env.task_id)`, but `DelegationEnvelope` has `idempotency_key` and no `task_id`. The timeout path would fail with an attribute error for the printed model. The custom `get_or_create_task` abstraction may implement deduplication, but that requirement must be declared.

**Repair:** use the returned `task.id` for cancellation/timeout reporting, use `env.idempotency_key` for the caller operation, and explicitly persist the mapping before entering the polling loop. State that RPC deadlines are separate from the remote task deadline, so a hanging `get_task`/`cancel` cannot defeat the outer wait budget.

### 7. P2  -  The illustrative Agent Card mixes protocol field conventions

**Page 314.**

The card is expressly abridged, so omissions need not make it an invalid teaching fragment. Nevertheless the 1.0 specification uses `securityRequirements`; the example uses `security`. A complete card also needs default input/output modes, skill tags and a provider URL when a provider object is included. `provider.contact` is not the specified provider URL field. [A2A 1.0 discovery data model](https://a2a-protocol.org/v1.0.0/specification/#44-agent-discovery-objects).

**Repair:** make this a schema-valid card for a pinned version, or visibly annotate it as a partial fragment and identify omitted required fields. Place internal contact details in application metadata rather than presenting them as portable protocol fields. Version checks should validate the sample as well as the prose.

**Small chronology edit, page 311:** signed Agent Cards were already represented in version 0.3, so "1.0 adds signed Agent Cards" is misleading. Change to "1.0 supports signed Agent Cards." [A2A 0.3 specification](https://a2a-protocol.org/v0.3.0/specification/).

### 8. P2  -  The tool/agent distinction is useful but too categorical

**Pages 312-313, 322-325.**

Tools need not be deterministic, short-lived or owned locally. MCP supports asynchronous task-oriented tool execution and interaction for further input. A remote agent can itself be exposed as a tool, as the chapter correctly demonstrates later. The vending-machine/contractor contrast should distinguish **capability contracts and collaboration responsibilities**, rather than treating duration as a defining boundary. [MCP Tasks extension](https://github.com/modelcontextprotocol/ext-tasks/blob/main/specification/2026-07-28/tasks.md), [MCP input and task recovery](https://tasks.extensions.modelcontextprotocol.io/typescript/client/input-and-recovery).

**Repair:** change "tools are" to "a simple tool call often is"; add a short overlap note. Keep the complementary MCP/A2A diagram, but explain that task duration alone does not select a protocol.

### 9. P1  -  "Check before acting" is not a substitute for atomic idempotency

**Pages 455 and 463.**

Querying for an existing refund and then issuing one can race with another worker or fail after the issue request commits but before the response arrives. Reconciliation is important, but does not by itself prevent a duplicate. These pages otherwise teach the unknown-result problem well, especially the X-ray on page 456.

**Repair:** state the required contract: an atomic downstream idempotency/uniqueness constraint or an application-owned durable operation with reconciliation and manual handling when the outcome cannot be proven. Avoid promising exactly one effect for an API that lacks the necessary support. Identify checks, prevention and after-the-fact reconciliation as distinct controls.

### 10. P2  -  The mini graph engine lacks the claimed production guarantees

**Pages 335-341; graph on page 338.**

It is appropriately small, but the prose calls it typed while the execution interface is plain dictionaries and the imported `TypedDict` is unused. `max_visits` is a global cap, not a per-loop invariant. The bounded retry in `after_eval` does not apply to the `verify  ->  execute` loop. The graph does not itself implement a parallel join; `fan_out` is a separate helper. These are acceptable simplifications if named precisely.

**Repair:** label this a sequential teaching engine with dictionary state and a global visit cap. Show the actual state contract; enforce the retry limit on every re-entry into execution; return a defined escalation at budget exhaustion. Explain that checkpoint durability and lease/transaction ownership are contracts of the callback, not supplied by the in-memory graph.

**Page 341 helper:** all branch functions receive the same mutable `state`; pending tasks are cancelled without being awaited; cancelled tasks can raise when `exception()` is inspected. Provide independent input slices and await cancelled tasks with `return_exceptions=True`. State whether outputs are merged deterministically and whether reducer operations need associativity/commutativity under the chosen scheduler.

### 11. P2  -  Graph structure makes a gate mandatory only when effects are also constrained

**Pages 331-334.**

"Approval cannot be skipped" is true of the depicted route, provided nodes before approval cannot perform the protected mutation themselves. A graph whose investigation node already possesses the mutating tool can violate the safety intent without bypassing an edge.

**Repair:** add the missing condition: side-effecting tools are unavailable before the action gate and every execution is checked by the harness. The railway analogy maps control flow well; it does not prove authority confinement. A diagram should show the read-only capability boundary around the investigative node and the policy boundary around `act`.

### 12. P2  -  Reader/actor splitting reduces risk but is not a proof of safety

**Pages 390 and 396-397.**

The passage "remove any one ... or put a human or a deterministic policy gate on it  -  and the attack fails" is too unconditional. A gate must actually constrain the relevant path, and a human can be deceived. Structured output can carry attacker-selected recipients, IDs or semantic instructions while remaining schema-valid. The chapter does acknowledge that labels and sanitisation do not eliminate injection; this same precision should extend to the split architecture.

**Repair:** say the attack path is blocked **when the control is correctly enforced**. Put entitlement checks, destination restrictions and provenance validation on the reader/actor boundary; annotate the figure "typed does not mean trusted." Measure attempted and executed forbidden actions separately, as the existing later tests do.

**Page 401 question 1:** "dominant real-world threat" is an empirical prevalence claim without a supporting measurement. Rephrase as "a major threat when an agent reads attacker-controlled content." The OWASP taxonomy supports the importance of agent-specific security, not an incident-frequency ranking. Its December 2025 publication is supported by the [official announcement](https://genai.owasp.org/2025/12/09/owasp-top-10-for-agentic-applications-the-benchmark-for-agentic-security-in-the-age-of-autonomous-ai/).

### 13. P2  -  The exchanged-token drawing teaches misleading claim semantics

**Pages 406-408 and question 2 on page 416.**

RFC 8693 supports both impersonation and delegation; an exchanged token does not automatically contain both identities or guarantee narrower rights and lifetime. Those outcomes depend on authorisation-server policy and the chosen profile. The `act` claim is an object, not a bare agent string. JWT `exp` is an absolute NumericDate, not "5 minutes." [OAuth 2.0 Token Exchange, RFC 8693](https://www.rfc-editor.org/rfc/rfc8693.html).

**Repair:** say "configure token exchange to issue..." and show `act: {"sub": "agent:refunds"}` plus an example expiry timestamp. Distinguish the requested TTL from the signed expiry. The caption that **every claim narrows power** is also inaccurate: issuer, subject, actor and signature identify/authenticate information; scope/audience/time restrictions constrain use when validated. Preserve the exploded view but label the parts as identity, constraints and integrity.

**Page 411 OTP analogy:** a five-minute bearer token is reusable during its lifetime unless specifically bound/one-use. Use "short-lived visitor badge" rather than suggesting single-use semantics.

### 14. P2  -  Sandbox isolation is presented as a universal ladder and guarantee

**Pages 419-423 and 430.**

Containers sharing a host kernel and microVMs having a distinct guest boundary is a useful teaching contrast. However, gVisor and VMs have different attack surfaces and workloads; "strongest" is not a universal ordering. Starting/destroying one sandbox also does not guarantee that all remote/logged/host-side copies disappear. The chapter already mentions a reaper, which is good.

**Repair:** describe the threat assumptions and residual risks for each boundary; qualify the startup times as workload-dependent examples. Add host patching, VM jailer/runtime configuration, privileged-mount prohibition and cleanup verification. The house/glovebox metaphors should include "containment depends on sound construction and controlled openings." [gVisor security architecture](https://gvisor.dev/docs/architecture_guide/intro/), [Firecracker production host setup](https://github.com/firecracker-microvm/firecracker/blob/main/docs/prod-host-setup.md).

**Page 422:** the post-execution slice of stdout/stderr is not a demonstrated streaming output cap; the provider contract must bound output while the program runs. `{"main.py": code, **files}` permits an input called `main.py` to replace generated code unless `resolve_inputs` forbids it. Explicitly reserve names and validate file paths/sizes before writing. These are interface requirements, not claims that the undeclared provider is necessarily unsafe.

### 15. P2  -  Classification and audit examples do not enforce all depicted governance rules

**Pages 436-441.**

The text says restricted data requires a reviewed exception before reaching a model; the flow matrix grants all restricted data to `model:self-hosted:in` without showing an exception/purpose/entitlement check. Its memory rule comments that confidential data is allowed only after transformation, but `check_flow` checks only a class label. The audit schema omits the approval IDs, approvers, risk score, idempotency key and verification fields illustrated in the subsequent exploded view.

**Repair:** distinguish placement permission from purpose/entitlement/exception permission. Carry transformation status and approved exception IDs through the gate. Extend the audit schema or show how linked event types preserve the full depicted provenance chain. A chain hash needs a trusted external anchor or protected append-only storage to make wholesale rewrite detectably different; the page 448 question already teaches this, so move that condition into the implementation discussion.

**Page 438:** the deterministic token is a truncated 48-bit HMAC and is not scoped visibly by tenant/purpose. At volume, collisions and unwanted linkage need explicit handling. Label it a toy tokenisation sketch; use a tenant-scoped vault with collision checking and an opaque token with appropriate entropy. The chapter's warning about pattern-only PII detection is a strength. Tokenisation remains protected personal data where re-identification is possible; it is not anonymisation.

### 16. P2  -  The trajectory checker can pass without a valid approval

**Page 474, `check_trajectory`; related scorer on page 487.**

The checker only requires an `approval_requested` event, not an approved decision bound to the executed mutation. It also never uses the golden object's `max_steps`, and it checks tool names rather than the key arguments described in the prose. Thus a requested-but-rejected approval could satisfy this golden checker if some other code erroneously executed the action.

**Repair:** check that each mutation follows a valid matching approval where required, no mutation follows rejection/expiry, and the step budget and essential arguments are satisfied. Keep partial-order matching rather than requiring one exact trajectory for all valid solutions. Clearly distinguish attempted tool calls, proposals and executed calls in the event schema; the Chapter 25 `refund_proposed` expectation and `issue_refund` executed-call order otherwise risk confusing proposal success with financial execution.

### 17. P2  -  The evaluation example warns about dependence but still demonstrates an inflated dataset

**Pages 497-500 and exercise 1 on page 504.**

The code changes the IDs of four cases fifteen times each without varying inputs, environments or expectations. It therefore has four scenario templates, not sixty diverse cases. Page 500 correctly warns that repeats are not independent cases and recommends case-level bootstrap, yet the main worked report and exercise still use Wilson intervals over repeats. Relabelling duplicated inputs does not solve that issue for claims about scenario coverage.

**Repair:** use genuinely distinct labelled cases, record `template_id`/`case_id` separately, and provide case-clustered bootstrap or an explicit demonstration limited to the stand-in's synthetic Bernoulli process. Put the warning **before** the displayed release numbers. Keep the excellent sample-size note: the 95% Wilson lower-bound floor cannot be met by 45/45, and the stated 73-perfect-independent-cases calculation is sound.

**Page 495:** "a one-point change ... is noise" cannot be inferred solely from one marginal confidence interval. Paired outcomes can reveal a small consistent effect. Replace with "a one-point change needs a paired uncertainty analysis." The chapter already recommends paired comparisons on page 493.

**Pages 500 and 504:** kappa 0.63 is not a universal verdict that a judge is untrustworthy, nor is 0.7 a universal readiness threshold. Use a confusion matrix, critical-slice false acceptance rates and context-specific acceptance criteria; explain the chance baseline and prevalence effect. Zero observed forbidden actions is a hard release requirement, but no finite test set proves the true population rate is zero.

### 18. P2  -  Observability examples need cardinality and exception-redaction boundaries

**Pages 509 and 513-516.**

"run_id ... as attributes on every signal" should not instruct readers to put each run ID on metric dimensions; that creates unbounded time-series cardinality. The code uses tenant/model/agent labels, but does not explain the scaling/aggregation decision. The source redaction wrapper covers a finite list of attribute names, while `record_exception(e)` can record sensitive exception messages and stacks outside those fields.

**Repair:** put run IDs on spans/logs and use exemplars or trace links for metrics; use a bounded label policy with separate tenant accounting where needed. Sanitize exception data before recording it and define an allowlist for content-bearing telemetry fields. Pin the actual GenAI convention version used by the sample. The architecture of source redaction plus a Collector layer is otherwise good.

### 19. P2  -  Canary promotion compares uncertainty incompletely

**Pages 529, 534 and question 2 on page 537.**

"Canary lower bound clears baseline minus margin" is a useful conservative illustration only if the baseline is treated as known. When the baseline is measured from live traffic too, both estimates have uncertainty. Repeated checking at every rollout stage also affects nominal error rates. The graphic's traffic percentages are not sample sizes.

**Repair:** report baseline/candidate counts, slice denominators and time windows; gate on a confidence interval for their difference/non-inferiority with an explicitly planned sequential rule. Explain that a two-percent online sample of five-percent canary traffic requires enough actual observations before an automated quality rollback can be statistically justified. Preserve zero-tolerance alerts for observed unauthorised execution as a separate operational invariant.

**Page 525:** distinguish active completion latency from end-to-end completion including approvals; otherwise the 45-second completion objective and 30-minute approval objective describe conflicting denominators.

### 20. P1/P2  -  A budget comment does not enforce the quality floor

**Page 544, `choose_model`; page 548, `admit`.**

`choose_model` downgrades a large-model route whenever budget remaining is below 20%, including a high-risk route. The comment says "if quality bar allows," but the code has no such check. This conflicts with the explicit high-risk fallback rule on page 546. Admission checks also read accumulated spend without reserving capacity, so concurrent requests can pass the same last budget balance; the user rate comparison allows a request at a count of exactly 60.

**Repair:** filter every primary, downgrade and fallback through a task/risk/data-class capability policy. If no acceptable model fits the budget, stop safely or escalate. Reserve estimated spend atomically, settle to actual spend and account for in-flight calls. Decide and state whether 60 is an inclusive limit. These examples can remain compact while showing the guard that matters.

### 21. P2  -  Prefix caching is not free of security risk

**Page 546 and surrounding cache recommendations; page 578.**

Exact prefix reuse avoids the semantic false-hit risk of returning a cached answer to a merely similar question. That does not justify "free of risk" or "none" as a complete risk description. Shared prefix caches can disclose information through timing and require tenant/trust-group isolation. vLLM documents per-request cache salting specifically for this reason. [vLLM prefix-cache isolation](https://docs.vllm.ai/en/latest/design/prefix_caching/#cache-isolation-for-security).

**Repair:** say "no intended semantic substitution when correctly keyed," then state isolation, retention and provider-policy requirements. Include model/tokenizer/template/schema version in exact-response and embedding cache keys, and invalidation on permission or knowledge changes. Keep the opened/unopened-item example; it is a particularly effective semantic-cache analogy.

### 22. P1/P2  -  Leases alone do not guarantee a single writer

**Pages 459, 561, 566-568.**

The teaching says a lease ensures one worker advances a run. Expired leases can overlap with a stalled holder that resumes later. The helper takes/releases leases using only run ID; no owner/fencing token or lost-lease behaviour is shown. Optimistic concurrency protects state writes only if enforced, and does not automatically fence an external mutation. `tenant_slot_available` checks availability without visibly acquiring or releasing a slot.

**Repair:** specify owner-checked release/renewal, fencing tokens enforced at state/effect boundaries, abort-on-lost-lease semantics, atomic tenant permits, and queue-visibility renewal for steps longer than the initial timeout. The named abstractions might implement some of this internally; their required contract needs to be explicit. [Redis distributed-lock documentation](https://redis.io/docs/latest/develop/use/patterns/distributed-locks/) describes both owner-checked release and fencing requirements.

**Pages 565-566 DR:** a restored checkpoint and reused key are safe only if the idempotency record survives and remains available for the retry horizon. Add this dependency to the recovery diagram and RPO/RTO exercise; a lost dedupe store can reintroduce duplicate effects even when run state is restored correctly.

### 23. P2  -  Gateway quota reservations need settlement semantics

**Page 575; question 2 on page 584.**

The gateway reserves estimated tokens, releases the whole estimate on certain exceptions and records provider usage on success, but never visibly reconciles a successful reservation to actual usage. A transient timeout also does not prove that the provider consumed no quota or incurred no cost. The code does not visibly authenticate supplied tenant/agent IDs, though the surrounding architecture requires that.

**Repair:** distinguish concurrency permits, local rate-budget reservations, provider rate limits and financial accounting. Settle success to actual usage; release concurrency in `finally`; record/reconcile unknown consumed usage after partial/transient failures. Derive trusted identity from gateway authentication. Question 2 is reasonable for an unconsumed local reservation after a rejected rate-limited request, but should specify that condition instead of teaching an unconditional refund of every failed attempt.

### 24. P2  -  Inference performance statements need workload qualification

**Pages 573 and 578-582.**

Quantisation reduces weight storage, but does not universally increase throughput: kernels, hardware and batch/sequence workload determine the outcome. Likewise KV-cache saturation is one possible capacity knee, not the sole cause of rising latency. The quantisation documentation itself lists hardware-specific implementations. [vLLM quantisation support](https://docs.vllm.ai/en/latest/features/quantization/).

**Repair:** say "can increase throughput" and benchmark the target workload; distinguish compute/prefill/decode bottlenecks, queueing and KV pressure. Label the plot's shading "example memory-constrained regime." Keep its illustrative status prominent. The specialist-clerk analogy should not say a fine-tuned model is "useless for others": narrowing specialisation can impair general performance, but does not necessarily eliminate it.

## Confirmed visual defects and page-composition repairs

| Priority | Pages / figures | Evidence | Repair |
|---|---|---|---|
| P1 visual | **403, Figure 20.1** | Full-size: the two top Venn labels run together; the right text is clipped ("...ever d"); the centre label overruns the dark box and parts render white over the light background. | Shorten the three labels to "User permissions," "Agent ceiling," "Task scope"; use external callouts or place each in its non-overlap region; enlarge/centre the effective-permission badge. This diagram should be redrawn before print. |
| P2 visual | **512, Figure 26.3** | Full-size: `PARTS: 7 · ATTRIBUTE GROUPS` extends over the border into `SHEET: 26.3`. | Widen the second footer column or shorten to `7 groups`; measure each field independently and prevent overflow. Apply the footer fix to all exploded-view templates, then recheck. |
| P2 pagination | **335-337** | Montage plus complete extracted text: page 335 holds essentially a heading and introduction; the graph engine fills 336; page 337 contains only three reducer definitions. Related code is spread across three pages. | Recompose the introduction, engine and reducer helper as a planned spread; shorten/extract nonessential engine lines or place reducers beside the merge explanation. Avoid shrinking code to preserve a literal one-page rule. |
| P2 pagination | **311, 316, 332, 342, 360, 391, 557** | Montage: isolated short prose/lead-in pages followed by large figures or blocks; particularly 557 is nearly empty before the reference architecture on 558. | Keep a heading, substantive explanation and at least one concrete example together; place the figure on the same page or facing spread. Space is useful when deliberate, but repeated near-empty lead-ins interrupt reading and expand the book. |
| P2 listing layout | **497-499** | Text and montage: the worked evaluation program continues across three pages (line numbers 1-75), followed by output and interpretation on 500. | Treat it as a numbered multi-page listing with `Listing ... (continued)` and boundaries at complete functions, or move full runnable code to a companion and keep a complete shorter excerpt in the chapter. Do not promise that no code anywhere is split unless this is redesigned. |
| P2 typography | **314, 324, 336, 339, 371, 413, 498, 513, 575** | Long code lines wrap visually, often through strings/signatures; this is visible in the layouts and extraction. Wrapping is not in itself a runtime defect. | Reformat source at a print-appropriate line length, preserve indentation, avoid breaking string literals misleadingly, and supply copyable source separately. "Unbroken panel" and "valid copyable code" are different requirements. |
| P2 readability | **318, 357, 370, 389, 407, 458, 567** | Montage: sequence figures have numerous thin lifelines, long message labels and substantial information at reduced scale. No clipping is claimed from thumbnails alone. | Show fewer essential interactions per diagram, give long protocol fields a key beside the sequence, and use a readable minimum label size at final trim. Use landscape/facing-page treatment where needed. |
| P2 accessibility | X-rays **344, 361, 392, 428, 456, 470, 495, 531, 542, 576** | Montage: the dark half carries dense small annotation while the left half is mostly a simple interface. | Keep the compelling outside/inside contrast; simplify the inner flow to 5-7 numbered checkpoints and move explanatory prose into the caption. Check print contrast and greyscale separately; no unsupported claim that all these diagrams are unreadable. |

An important pagination distinction: intact cards/figures generally appear to be preserved in this range, but **related explanation, examples and their interpretation are repeatedly separated**. A no-split policy should be semantic, not just "each coloured rectangle stays together." Define keep rules for headings with introductions, figure plus caption, table headers plus rows, exercise questions plus answer options, and short complete listings. Allow deliberate continued listings when a whole program cannot fit legibly.

## Chapter-by-chapter instructional, analogy and diagram recommendations

| Chapter and physical scope | What works / instructional repair | Analogy assessment and refinement | Diagram recommendation |
|---|---|---|---|
| **15  -  A2A & Remote-Agent Interoperability, 309-327** | Good remote-task lifecycle, partial-trust artefacts, synchronous/streaming/async distinction and retained caller accountability. Repair protocol card and idempotence examples; show uncertain create outcomes and webhook authentication/recovery. | Contractor/work-order metaphor is memorable and appropriate. A contractor profile/signature verifies origin, not competence; a PO works only when the supplier actually deduplicates it. Vending machine overstates determinism of tools. | Keep 15.3 lifecycle and 15.4 sequence; add a mini failure path for lost creation response, caller recovery and server dedupe. Simplify 15.2 into a grouped manifest anatomy rather than implying every field is a trust guarantee. |
| **16  -  Workflow & Graph Orchestration, 329-349** | Excellent graph skeleton plus bounded exploratory nodes; good Temporal activity/replay boundary. Rename the mini-engine guarantees accurately and bound every cycle. | Railways map declared control flow well. Add that stations have constrained authority; trains can still perform harmful work at a permitted station. Reducer "cargo merge" needs a deterministic conflict rule, not merely addition. | Redraw 16.3 with explicit retry and verification loop counters and read-only vs mutation zones. Keep 16.5 durable-wait X-ray. Recompose pages 335-337. |
| **17  -  Multi-Agent Architectures, 350-365** | One of the best-balanced chapters: justification, single-agent baseline, scoped envelopes, provenance and conflicting writes. State independent evidence/correlated model failures in ensemble decisions; the printed supervisor loop is sequential despite "may be parallel." | Project manager, whiteboard and briefing-email comparisons fit. "Every delegation costs at least two model calls" on 354 is not universal: deterministic routing or a non-model worker need not do that. Say "often adds model calls." | Keep four-pattern comparison 17.2. On 17.4, retain "illustrative" conspicuously and label both curves directly; dual axes can imply a precision/crossover that is not evidence. 17.5 should expose useful work versus coordination rather than just agent count. |
| **18  -  HITL, Approval & Escalation, 366-382** | Strong exact-proposal binding, stale-approval checks, human roles, feedback governance and escalation packages. Repair approval outcome/entitlement/hash checks before the chapter's build-it can be trusted. | Cheque in signing tray and expiring quote are precise. Consent analogy explains information needs but does not imply valid consent guarantees correct clinical/engineering judgement. Bank OTP is authentication, not necessarily an independent human approval. | Keep 18.2 sequence and 18.5 approval-card anatomy. Add an explicit rejection/expiry route and a downstream atomic precondition check. Make the fatigue graph 18.4 clearly conceptual rather than measured workload advice. |
| **19  -  Agent Security Fundamentals, 384-401** | Strong architecture-first security, exfiltration channels, SSRF caveat, hostile outputs and action-based tests. Qualify universal promises about splitting, gates and threat prevalence. | Clerk without vault key is excellent. Castle metaphor can imply a clean inside/outside distinction; note internal and authorised malicious input. Counterfeit tool metaphor should show malicious *instructions/contract*, not just a mechanically defective object. | Keep 19.3 attack sequence and 19.5 X-ray. In 19.6, put "schema-valid != authorised" at the actor boundary and show checks on recipient/resource/purpose. |
| **20  -  Identity, Authorization & Delegated Access, 402-416** | Good separation of user/workload/service authority and per-tool/resource/argument checks. Correct token profile expectations, JWT examples and diagram labels. Policy sketch on 409 is illustrative; helper on 413 should explicitly supply required approval context if paired with it. | Courier/pass and limited power of attorney fit. Short-lived visitor pass is more accurate than OTP for a reusable bearer credential. Apartment privacy is useful but access must be enforced in each layer. | **Repair Figure 20.1 on 403 first.** Keep 20.3 sequence and 20.4 anatomy with true `act`/`exp` forms and labels that distinguish identity from constraints. |
| **21  -  Sandboxing & Safe Execution, 417-432** | Clear host boundary, deny-default egress, no credentials, output inspection and disposable runs. Add the provider's hard output cap, reserved filenames, host/runtime hardening and residual risks. | Glovebox, hotel turnover and apartments/houses are accessible. Avoid "whatever happens stays inside" and disposal guarantees; construction flaws, permitted openings and persistent external copies remain. | Replace 21.2 universal strength ladder with a boundary/overhead comparison matrix. Keep 21.4 secret separation; show a narrow proxy's authorised inputs/outputs and an explicit artefact release gate. |
| **22  -  Governance, Privacy & Compliance, 433-448** | Broad and practical inventory, data-flow policy, audit, retention, provider placement and autonomy review. Align the flow matrix and audit schema with the prose. General framework summaries are sound; date them and map by regulated role/use case. | Colour-coded folders and cloakroom tokens fit; tokens can remain identifiable protected data. "Broken chain makes evidence worthless in court" is an overbroad legal metaphor; say it weakens confidence and may affect admissibility. | Keep 22.2 enforcement boundaries and 22.4 audit anatomy. Add an external protected anchor to hash-chain integrity, and distinguish data location from authorisation/purpose. |
| **23  -  Reliability Engineering, 450-465** | Excellent unknown-timeout X-ray, bounded retries, no silent substitute mutations and explicit degraded modes. Fix saga safety/resume and describe atomic idempotency; retry budget is a single-process illustration, not a system-wide concurrent limiter. | Trip switch/generator and holiday compensation map well. Compensation is a business correction, not time reversal; cancellation/refund can itself fail or require fees. Cheque number presupposes a bank's atomic ledger. | Keep 23.4 timeout X-ray. Expand 23.6 saga with compensation failure and manual-recovery branch. Add a lost-lease/stale-worker fault to the recovery taxonomy. |
| **24  -  Agent Testing Strategy, 466-481** | Useful layered strategy, recorded/fake models, Hypothesis fresh-environment note and distinction from live-model evaluation. Strengthen the golden checker and make replayed side effects stubbed by contract. Avoid unsourced "most bugs" prevalence as an exam fact. | Flight simulator, plug/socket and parcel-shape testing are effective. Reference route should admit alternative valid routes; tests assert invariants/partial orders rather than one memorised route. | Keep 24.3 green-build X-ray and 24.4 CI pipeline. Annotate live-model security tests separately from fake harness security tests; the two test different properties. |
| **25  -  Evaluation & Quality, 482-504** | Most developed teaching chapter, with outcome/trajectory/grounding separation, held-out data, slices, judges, uncertainty and release gates. Rework template duplication and case-level uncertainty; soften universal kappa readiness claims. | Exam/moderation and poll margin metaphors work well. Correct working does not prove general competence, and opinion-poll precision requires representative independent samples. | Keep 25.6 slice X-ray and 25.7 worked intervals, but identify true cases, repeats and denominators on the graphic. Put baseline/candidate difference intervals beside a change claim. Use the injection gate's unattainable sample floor as a teaching callout. |
| **26  -  Observability, 506-520** | Good metadata-first telemetry, model/tool provenance and links to incidents/evals. Explain trace-vs-metric identifiers, long-wait segmentation and exception redaction. A context manifest alone cannot reconstruct content without retained/versioned sources. | Parcel tracking accurately maps trace/correlation. Chess replay shows recorded actions/context, not privileged access to a model's internal reasoning; describe that limit. | **Repair Figure 26.3 footer on 512.** Keep 26.2 causal trace but visually separate active spans from durable waits; annotate links across resume workers rather than implying one process stays open. |
| **27  -  AgentOps & Production Operations, 521-537** | Strong versioned behaviours, kill switches distinct from rollback, incident containment and quota failover planning. Specify canary statistical decision rules and separate active latency from approvals. | Airline operations and grounding fit very well; emergency checklists do not eliminate judgement. A feature flag's "instant" effect depends on propagation and checking before execution. | Keep 27.4 quality-failure X-ray. 27.3 should show counts/time alongside traffic allocation and an interval for candidate-baseline delta. Kill-switch layers overlap rather than forming one strict containment hierarchy. |
| **28  -  Cost, Latency & Model Routing, 538-552** | Useful cost per successful task, safe semantic-cache warning, evaluated fallback matrix and cost-quality frontier. Enforce quality floors in routing code; atomically reserve budgets; qualify prefix-cache safety. | Multi-stop taxi makes repeated context costs vivid; caching and session handling alter the effect, so qualify "always resend" claims. Opened/unopened return comparison is excellent. Metro pass should not imply zero privacy risk. | Keep 28.3 itemised bill X-ray, but give assumptions for estimated $0.15 savings. Use direct labels and explicit hypothetical data on 28.4 frontier. Show one rejected downgrade when the risk class requires a strong model. |
| **29  -  Production Platform Architecture, 554-570** | Coherent multi-tier reference and state/store selection. Avoid implying every production system must be multi-process; scale, duration and recovery requirements decide. State fencing/permit/visibility contracts and dedupe durability for DR. | Hospital shift handover is useful; unlike a case tag, a lease can expire while the previous doctor/worker continues. Show that limitation. Priority queues do not guarantee universal FIFO ordering. | Keep 29.2 reference architecture, simplify crossings and show control versus data paths. On 29.4 add a stale worker rejected by a fencing token. Pair 557's introduction with 558's diagram. |
| **30  -  Gateway & Self-Hosted Inference, 571-584** | Good normalisation despite compatible APIs, managed/self-hosted trade-offs and serving lifecycle. Reconcile quotas, preserve trusted identity, qualify quantisation/bottleneck claims and narrow-training absolutes. | Travel desk and taxi/car comparisons are apt. Continuous bus batching explains admission/completion; waiter notepad is useful but does not explain tensor memory size, so pair it with a precise KV formula/example. Fine-tuned clerk is specialised, not necessarily useless elsewhere. | Keep 30.3 gateway X-ray and 30.4 load curve with workload assumptions. Add one clear prefill -> decode / KV-block visual; it would teach more than another generic gateway box. Include TTFT and inter-token latency as distinct measurements. |

Part-divider pages 328, 383, 449, 505 and 553 were inspected within the assigned range; their full-page dark treatment is deliberate and coherent. They should not be counted as accidental sparse pages.

## Repetition, assessment and teaching progression

The recurring **analogy map  ->  subsection analogy  ->  myth/reality  ->  interview answer  ->  memory card  ->  takeaways  ->  exercises  ->  multiple-choice questions** structure improves retrieval practice, but the same statement is often repeated five or more times without a new worked decision. It makes chapters appear longer and reduces the distinction between recall and application.

Recommended editing policy:

1. Keep one chapter-wide analogy and use subsection analogies only where they add a genuinely different mechanism or expose a failure case. Add one sentence "where the analogy stops" for tokens, leases, compensation, judges and sandboxes.
2. Replace selected interview drills with applied choices: a request timed out after commit; an approval rejected the exact proposal; a lease expired while an old worker was paused; a 45-case critical slice cannot clear its lower-bound floor. Ask the reader to predict state and effects.
3. Keep memory cards brief and use them as actual recall prompts. The radial cards are attractive but their repeated hub-and-five-spokes structure does not represent sequence, ownership or causality; use it for concepts, not executable logic.
4. Distinguish "recommended production policy," "illustrative heuristic," "protocol guarantee" and "empirical result." Current illustrations are frequently explicitly marked illustrative, which is good; exact numeric lines and dual axes still benefit from a conspicuous "hypothetical data" label and stated assumptions.
5. Questions should test the nuanced rule rather than reward an absolute slogan. Especially revise 15.3 (optional dedupe), 19.1 (unsourced prevalence), 20.2 (configured token profile), 24.1 (unsourced bug prevalence), 25.2 (context-dependent kappa) and 30.2 (what quota reservation means).
6. Keep one evolving artefact per topic: the same approval object should appear in graph, policy, tests, traces and audit; the same logical operation ID should appear in delegation, retries, compensation and recovery. This reduces redefined helper names and makes the book feel like a cohesive engineering build.

## Attractive diagram direction

Preserve the existing palette and vector quality. Improve information hierarchy before adding decorative effects:

- **Sketches** should show the main relationship in 3-6 readable objects. Short labels, safe margins, no clipped callouts and a consistent hand-drawn font size matter more than the tape/grid decoration. Page 403 is the clearest failure of this rule.
- **Exploded views** work best for a structured object, such as an approval or audit record. Use plates to expose a meaningful grouping rather than merely translating every bullet into a large plate. Make identity, constraints and integrity use stable semantic colours. The platform stack on 559 should not imply all services form one linear execution pipeline.
- **X-rays** are the signature instructional style in this range. Preserve the visible-result/hidden-mechanism contrast, but cap the dark-side annotation count and make one decisive failure/control prominent. Use the caption to explain consequences instead of putting every sentence inside a box.
- **Sequences** should give actor roles and critical trust boundaries first; long token claims and IDs can move into a side key. Maintain arrowhead visibility and avoid line crossings through text.
- **Statistical charts** should expose denominators, uncertainty method, hypothetical-versus-measured status and the comparison being tested. The canary traffic share is an allocation parameter, not evidence of confidence by itself.
- **Serving diagrams** should show prefill, token-by-token decode, new requests entering a continuous batch, completed requests leaving it and fixed-size KV blocks. This is a missing high-value explanation in Chapter 30 and would make its otherwise list-heavy mechanics easier to understand.

## Source verification notes

The broad governance discussion on page 444 is substantially sound and appropriately tells readers to confirm current applicability. Do not turn the book's general overview into an assertion that the same obligations apply to every agent. Role, jurisdiction, use case and release timing matter. The following primary sources support the relevant distinctions:

- [A2A 1.0 specification](https://a2a-protocol.org/v1.0.0/specification/): optional Send Message idempotence and version-specific card fields.
- [A2A 0.3 specification](https://a2a-protocol.org/v0.3.0/specification/): signed-card structure pre-dates 1.0.
- [MCP Tasks extension specification](https://github.com/modelcontextprotocol/ext-tasks/blob/main/specification/2026-07-28/tasks.md): asynchronous task handles for tools; prevents a misleading duration-based MCP/A2A distinction.
- [RFC 8693](https://www.rfc-editor.org/rfc/rfc8693.html): token exchange, impersonation/delegation, actor-claim structure and authorisation-server discretion.
- [Redis distributed locks](https://redis.io/docs/latest/develop/use/patterns/distributed-locks/): owner-checked release, lease-validity limits and fencing.
- [gVisor security introduction](https://gvisor.dev/docs/architecture_guide/intro/) and [Firecracker production host setup](https://github.com/firecracker-microvm/firecracker/blob/main/docs/prod-host-setup.md): real isolation boundaries require the surrounding runtime/host configuration.
- [OWASP Agentic Top 10 announcement](https://genai.owasp.org/2025/12/09/owasp-top-10-for-agentic-applications-the-benchmark-for-agentic-security-in-the-age-of-autonomous-ai/): the December 2025 publication claim is supported.
- [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework) and [AI RMF Core](https://airc.nist.gov/airmf-resources/airmf/5-sec-core/): voluntary framework and Govern/Map/Measure/Manage functions; [Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf) is the companion resource.
- [ISO/IEC 42001](https://www.iso.org/standard/42001): AI management-system standard; do not imply certification proves that each generated answer is correct.
- [European Commission AI Act overview](https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai) and [implementation timeline](https://ai-act-service-desk.ec.europa.eu/en/ai-act/eu-ai-act-implementation-timeline): use case/role-specific phased requirements. The book wisely avoids hard-coding all deadlines; add a dated source box at final publication.
- [vLLM prefix caching](https://docs.vllm.ai/en/latest/design/prefix_caching/): shared-cache privacy and salting; [quantisation documentation](https://docs.vllm.ai/en/latest/features/quantization/): hardware-dependent implementation support.

Verification date: 12 October 2026. This review does not certify legal compliance, prove runtime correctness or claim that uninspected tiny labels are free of defects. It identifies publication repairs from the supplied PDF and supporting primary material.

# Platforms, capstones and appendices (Chapters 31-39)

## Scope and method

- Source: `/Users/junedalam/Downloads/Agentic_AI_Engineering_ebook.pdf`.
- Reviewed **all physical PDF pages 585-872 inclusive (288 pages)**: all text, including figures' text, exercises, solutions, self-check answers and index. Printed Arabic page numbers agree with physical page numbers in this range.
- Visually scanned every page through 12 contact sheets; inspected pages 592, 600, 601, 636, 637, 719, 753, 790, 849, 850 and 866 at 1600-pixel page height. Contact sheets are in `tmp/pdfs/agentic-review/production-sheets/`.
- Read-only editorial/technical review. No changes to the PDF; no full book-code execution, external deployment, cloud integration or companion-repository validation. Examples with undefined domain functions are treated as illustrative sketches, not automatically as errors.
- Primary official sources were checked for framework semantics, version currency, security and effect guarantees. Current documentation can differ from the book's exact patch version; findings based solely on that possibility are explicitly qualified.
- P1 = correct before publication because a reader could implement a false safety guarantee or unusable solution; P2 = substantive clarity, completeness, consistency or layout repair; P3 = polish.

## Overall assessment

The strongest part of this range is the progression from framework-independent ownership to a concrete incident-response capstone. The AegisOps personas, stories, risk matrix, evidence ledger, phased milestones, game days and portfolio rubric make the architecture reviewable. The focused capstones make the material usable for readers who cannot build the full platform.

The main weakness is a mismatch between strong safety claims and abbreviated implementation sketches. Approval provenance, risk-5 blocking, downstream idempotency, real process restart, scoped execution and sustained verification need to be visible in the examples used to teach those exact properties. Several are explicit defects rather than omissions expected in pseudocode. The diagrams are visually attractive and generally stay intact; the requested "nothing split" criterion is not yet met by the code, annotations, answer groups and a handful of continued logical lists.

## Strengths to preserve

1. **Responsibility mapping, pp. 589-590, 604-605, 639.** The framework/harness split makes authorization, effect safety, business budgets, audit and evaluations explicit. The X-ray diagram is more useful than another framework feature list.
2. **LangGraph teaching order, pp. 614-633.** Reducers before parallelism, interrupt re-execution before Send/subgraphs, and checkpointer versus store are sensible dependencies. The shared append-list duplication warning on p. 627 is particularly valuable.
3. **Cloud orientation, pp. 646-658.** The edition date and regional-availability warning correctly acknowledge change. The portability table is useful without requiring three deployments.
4. **Specializations, pp. 667-677.** Verification changes by environment rather than by marketing category. Tests, result rereads, citations, independent operational signals and voice read-back are appropriate checks.
5. **Pattern selection and simplification, pp. 684-692.** Indications/contraindications and "what would you remove?" counter unnecessary agent proliferation.
6. **Capstone problem framing, pp. 700-704.** Named users, fears, acceptance criteria and measurable targets connect product intent to engineering controls.
7. **Phased build, pp. 731-747.** Read-only tools and evidence precede mutation; fake dependencies, exit criteria and milestone tags give learners a practical path.
8. **Failure pedagogy, pp. 762-766, 822-831.** The six game days and four clearly identified composite incidents connect timeouts, injection, cost and judge drift to concrete controls. The fictional/composite disclosure on p. 822 is good and should remain.
9. **Track structure, pp. 780-800.** Stories  ->  diagrams  ->  milestones  ->  gates  ->  failure demo works consistently across refunds, research and coding.
10. **Appendix G, pp. 863-866.** All 36 answer letters for Chapters 31-39 match the corresponding chapter questions. The explanations generally reinforce the concepts rather than merely list letters.

## Prioritized actionable findings

### P1-01  -  Namespace-prefix permission rule is not fail-closed (pp. 600-601)

**Evidence:** `gate()` returns `PermissionResultAllow()` for every tool whose name begins `mcp__shop__`, while the intended tool list contains only `get_order` and `propose_refund`. A newly introduced `mcp__shop__issue_refund` would pass the callback even though it is absent from `allowed_tools`. The paragraph then presents the configuration as the chapter's fail-closed design.

**Why it matters:** This contradicts schema-drift and capability-allowlist teaching elsewhere, especially pp. 711 and 741. `allowed_tools` provides preapproval, not a complete tool restriction. Official permission documentation confirms that the callback handles calls not decided by preceding rules.

**Repair:** Use an exact finite allowlist in both the exposed MCP toolset and callback, deny every unknown tool, pin the discovered schema, and add a test that injects an unexpected shop mutation. Treat raw argument logging as a separate redaction decision. [Claude Agent SDK permissions](https://code.claude.com/docs/en/agent-sdk/permissions).

### P1-02  -  Approved high-risk action is recorded as automatic (p. 636, lines 19-26)

**Evidence:** `approval_gate()` validates a human decision for risk >=3, then unconditionally returns `update={"approval": {"decision": "auto"}}`. Only rejection preserves `decision`.

**Why it matters:** Successful human approval loses its identity/hash/provenance in canonical state, violating the blueprint's audit requirements. This remains a defect even in an illustrative sketch because the sketch is expressly showing the approval boundary.

**Repair:** Return the validated human approval for the approved branch; use the automatic marker only below the policy threshold. Show authorization, distinct privileged approvers where required, expiry and consumed state in the validator boundary.

### P1-03  -  LangGraph commander permits policy-blocked risk 5 (p. 636; compare p. 716)

**Evidence:** `risk_score(p) >= 3` asks for approval, and any matching approve decision proceeds to execution. There is no blocked risk >=5 branch. The later risk matrix says destructive, irreversible or unknown actions are blocked and escalated.

**Repair:** Compute risk once; block unknown/>=5 before creating an interrupt; route risk 4 through the two-person policy, risk 3 through the approved-runbook/ordinary-approval policy, and only then execute. Add a test demonstrating that an approving resume value cannot admit risk 5.

### P1-04  -  Local uniqueness is presented as sufficient for external exactly-once effects (pp. 713-714, 783-784)

**Evidence:** The explanation says an `Execution` row's unique idempotency key makes "the database itself" refuse a second rollback; Track A says a retry, replay or second worker can only find the already-existing refund because of the schema.

**Why it matters:** A local row cannot atomically commit a remote Argo or payments operation. The remote effect can complete before the local completion row is recorded; another worker can retry in that window. This is precisely the failure taught correctly on p. 836 and in Appendix E.

**Repair:** Qualify the diagram as local intent deduplication. Show durable intent before dispatch, a stable logical effect ID, downstream idempotency/reconciliation, atomic approval consumption or a recoverable reservation, and completion status. State the provider's deduplication retention assumptions. Temporal explicitly distinguishes completion recorded once from activity execution possibly more than once; Stripe's API v1 keys can be pruned after 24 hours. [Temporal activities](https://docs.temporal.io/activity-definition), [Stripe idempotent requests](https://docs.stripe.com/api/idempotent_requests).

### P1-05  -  SQLite "true two-process" solution cannot preserve its assertion (pp. 849-850)

**Evidence:** `CALLS` is an in-memory dictionary initialized to zero. The one-process demonstration closes/reopens SQLite and asserts `approval_node == 2`. P. 850 instructs readers to split at `conn.close()` and run the halves separately.

**Why it matters:** A new process resets the dictionary; running only the literal second half also lacks imports and definitions. With shared definitions initialized in the second process, its approval counter is 1, not 2. The given instruction does not produce the promised executable two-process test.

**Repair:** Provide two entry modes (`start` and `resume`) with shared definitions, isolated per-test database/thread ID, a durable instrumentation record and subprocess orchestration. Assert the combined durable count rather than a fresh process's local dictionary. Keep the current close/reopen example only if labeled explicitly as a same-process checkpoint roundtrip.

### P1-06  -  Separate execute node is insufficient to prove once-only mutation (pp. 848-850)

**Evidence:** The solution locates the side effect in its own node and increments `CALLS["execute"]`, but does not simulate a crash after the side effect and before checkpoint completion; the side effect has no downstream idempotency key.

**Repair:** Explain the exact property being demonstrated: avoiding repetition caused by approval-node restart. Add a provider fake with persisted key/effect result, kill after external success before recording completion, and resume with the same key. Do not equate one separate node with exactly-once external execution.

### P1-07  -  Read-only root filesystem does not prevent outside reads (pp. 841-842, Chapter 21 solution 1)

**Evidence:** "Reading outside the workspace" is said to be stopped by "a read-only root and mounted workspace only."

**Why it matters:** Read-only controls writes, not reads. A sandbox may still read visible image files, inappropriate mounts or secrets.

**Repair:** Name mount/namespace isolation, absent host/secret mounts, a minimal image and a file-access allowlist or OS confinement policy. Test reads of both host-only data and disallowed visible container paths separately from write restrictions. [Docker run read-only semantics](https://docs.docker.com/reference/cli/docker/container/run/).

### P1-08  -  Refusal example itself adds unsupported facts (p. 790, Figure 39.8)

**Evidence:** The diagram shows `v_refunds` has no `seller_type` field and no marketplace policy was found. The response concludes marketplace orders are excluded and quotes a first-party Q3 refund rate of 4.1% `[E2]`, though neither a coverage definition nor that result is shown.

**Why it matters:** Missing a dimension does not imply marketplace exclusion; a failed search does not prove no policy exists. This diagram teaches evidence sufficiency through an example that makes the same unsupported leap it warns against.

**Repair:** Either show a governed view definition stating first-party-only coverage and the actual 4.1% query/result evidence, or restrict the answer to the observed missing dimension/available-source gap. Phrase search outcomes as "I found no policy in the governed sources checked."

### P1-09  -  Replay rejection explanation uses the wrong condition (p. 800; related answer p. 866)

**Evidence:** The model answer says an old approval is refused because its argument hash and expiry no longer match.

**Why it matters:** Replaying the same approved proposal immediately preserves the same hash and may be unexpired. Consumption/single-use status, effect identity and authorization are the relevant controls.

**Repair:** Explain rejection through `approval_id`, action binding and consumed state, with downstream idempotency as the duplicate-effect backstop. Test immediate replay before expiry. Do not use successful execution to imply that the hash has changed.

### P1-10  -  Verification sketch does not enforce promised sustained post-action window (pp. 753-754)

**Evidence:** `window_stats(service, minutes=10)` has no action timestamp or explicit window boundaries. It checks one aggregate p. 95/error rate and current alert state. The figure promises that metrics stay within criteria for the full post-action window.

**Why it matters:** An aggregate can conceal short bad intervals; a call soon after the action can include pre-action data or an incomplete post-action window. An empty `no_new_alerts_for` makes that check vacuously pass. Missing/sparse telemetry is not modeled.

**Repair:** Include `action_completed_at`, explicit start/end, duration/sampling coverage, a minimum request count, missing-data rejection and per-bucket sustained criteria or an explicitly defined aggregate criterion. Populate the service/dependency set server-side. Show the durable polling/timer that waits for a complete window. Decide how a human risk acceptance is represented, since p. 753 permits it while pp. 704 and 754 require every RESOLVED incident to satisfy SLO recovery.

## Additional technical and consistency findings

| ID | Priority | Pages | Finding and concrete repair |
|---|---|---:|---|
| T11 | P2 | 734, 736 | `observe_metrics()` accesses `ctx.environment`, absent from the `RunContext` shown two pages earlier. Add environment/service scope to the canonical context and match constructor fixtures. The service comes from model input, so derive an allowed service scope server-side and verify membership before template interpolation. |
| T12 | P2 | 667 | `ExtractedClaim` has no stable claim ID; `ReportSection` has a flat `claim_ids` list beside paragraphs. The annotation promises every factual sentence maps to ledger IDs, which this schema cannot enforce. Use sentence/claim objects with explicit supporting IDs and a stable ledger entry ID. |
| T13 | P2 | 713, 736 | `Evidence.trusted: bool` and `trusted=True` for metric summaries conflate authenticated source, measurement validity and instruction authority. Distinguish provenance/authenticity/data validation; all payload text remains non-authoritative instructions. Add bounds for confidence and risk, validated timestamps and environment identifiers. Pydantic mutable defaults are not automatically a shared-instance bug; do not flag them as one. |
| T14 | P2 | 705, 710, 716 | The context caption/prose says only rollback and restart change production, but the tool registry also contains scaling and feature-flag changes. Draw a grouped "production changes" relationship including all four, and map its policy class. |
| T15 | P2 | 706 | "Six deployable parts" does not match the substantially larger container view. Decide which boxes are containers versus external dependencies and count consistently. The drawing is useful but should not masquerade as a complete C4 container/component specification. |
| T16 | P2 | 712 | "Only the mutating lane needs ... a scoped token" implies reads and external writes need none. Reads still require tenant-scoped authorization and credentials; ITSM/chat writes can leak data and need scope. State that privileged production mutations need the extra approval-bound token, while all lanes remain authorized. |
| T17 | P2 | 716, 719 | Direct PLAN_READY -> EXECUTING edge is labeled "risk <=2 or pre-approved runbook," permitting the reader to apply the runbook exception to risk 4. The matrix permits the exception for risk 3 only. Relabel precisely and include deterministic predicate examples. |
| T18 | P2 | 742, 745-746 | Workflow approval uses a plain string indexed by action ID; `execute_rollback()` checks hash/expiry but shows no action-ID match, approval consumption or two-person validation. Illustrative helpers are acceptable, but label the authorization/approval-record validator that supplies those guarantees and show its required contract. Clarify handling of stale-precondition typed results in the workflow. |
| T19 | P2 | 745-746 | Re-read then rollback leaves a time-of-check/time-of-use window unless the downstream service atomically checks the expected revision. Pass an expected revision/resource version to the mutation adapter and define a conflict response. Do not imply an ordinary preceding read closes concurrency races. |
| T20 | P2 | 595 | `resume()` can encounter additional interruptions but returns only `final_output`; it also approves every pending call with one Boolean. Return the same status/state/interruptions envelope as `start()`, approve exact call IDs individually, load only server-owned integrity-checked state and preserve business budgets across resumes. Current SDK documentation explicitly warns not to deserialize client-supplied approval state. [OpenAI RunState](https://openai.github.io/openai-agents-python/ref/run_state/). |
| T21 | P2 | 594-595, 600, 616-617, 784 | Financial examples use `float` and omit currency/minor-unit semantics in several contracts. Use integer minor units plus ISO currency or Decimal with explicit rounding, and bind payment/customer/currency to the proposal hash and eligibility check. The Java BigDecimal example is a good contrasting implementation. |
| T22 | P2 | 619, 640 | Literal annotations aid graph rendering and static tooling; they do not by themselves implement authorization. Add an explicit runtime route validator and mention that mixing Command with static edges can execute both branches. The prose already says validate; make the sample illustrate it. [LangGraph Graph API](https://docs.langchain.com/oss/python/langgraph/graph-api). |
| T23 | P2 | 667, 670, 735 | Read-only is repeatedly described as safe/without risk, and repository instruction files are called trusted because they live in the repo. Reads can leak confidential data and retrieve injected text; a user-submitted repo can contain hostile AGENTS.md. Identify the trusted ref/owner/provenance used to authorize instruction loading and keep read scopes/egress limits explicit. |
| T24 | P2 | 674 | Barge-in says cancel tool calls cleanly. Cancellation cannot unsend a committed mutation. Distinguish canceling speech/generation or read work from an in-flight effect that must be reconciled and reported. Treat the 1-second voice budget as an illustrative product target, not a universal conversational requirement. |
| T25 | P2 | 759-760 | Excerpt egress allowlist does not name the external flag service or secret-management endpoints drawn on p. 760. Specify sidecar/control-plane access versus workload egress and complete the policy. The YAML is clearly an excerpt, so this is a missing integration explanation, not proof of a broken deployment. |
| T26 | P2 | 783-785, 824 | Keys scoped to run/step/proposal prevent replay of one execution but not semantically duplicate refund proposals across distinct runs. Add payment-level cumulative-refund constraints, a business effect identifier and atomic refund accounting. Reconciliation on "more than one refund per order per hour" can flag legitimate partial refunds; distinguish duplicate effect IDs from permitted multi-refund behavior. |
| T27 | P2 | 785 | 90% success on n=120 does not automatically satisfy 95% interval lower bound >=85%. With a two-sided Wilson interval, 108/120 gives 83.33%; at least 110/120 gives 85.34%. Specify interval method, observational unit and required pass count. These are compatible gates, not a mathematical contradiction. |
| T28 | P2 | 756-758, 769-770 | Ten scenarios in critical slices and a 100-case suite are a learning minimum, not broad proof of production safety. Specify repeated-trial aggregation, CIs by independent case, slice minimums and hold-out/update rules. Make the 2.5 rubric a portfolio assessment, not a production certification; require safety gates independently of weighted average. |
| T29 | P2 | 769, 692, 799 | The capstone requires at least five specialists although the design principle says add an agent only for measurable benefit. Mark this as a curriculum coverage target and permit merging equivalent roles for a real deployment. |
| T30 | P2 | 729, 778, 780 | Phase Gantt extends roughly fourteen weeks, while AegisOps track says 8-12 weeks. State one consistent scope/team assumption and separate simulated portfolio build from enterprise integration. Small-track estimates are optimistic without a supplied scaffold, datasets and fixtures. |
| T31 | P2 | 732, 747, 852 | Companion AegisOps-lite and named tests are valuable, but this range provides no concrete release/tag/path or retrieval instructions. Ensure front matter actually supplies an accessible companion link and exact code/version pins. Do not certify the tests/repo without inspection. |
| T32 | P2 | 791, 797, 853 | Track C advertises dependency upgrades but the solution lists dependency lockfiles as protected. Define a reviewed upgrade mode or keep upgrades out of this track. A guard must inspect trusted base-to-result paths, renames/symlinks/submodules and actual test/config diffs; a sandbox-editable pre-commit hook is insufficient. |
| T33 | P2 | 794, 800 | Hidden tests help but are not a security boundary by themselves: the candidate code executes when tested. Run hidden tests against the candidate in an equally isolated disposable environment with no harness secrets or host privileges. |
| T34 | P2 | 837 | Forget-subject solution says backups are marked for expiry, then "done" requires searching all stores returns nothing. Define immediate serving deletion versus scheduled backup expiry, restore-time suppression and verified completion. Privacy retention is policy-specific; the appendix's 90 days-one year should remain illustrative, not a legal recommendation. |
| T35 | P2 | 839, 850 | `hash(...)` is illustrative notation, but Python learners may use randomized built-in hash. Explicitly use a canonical serialized stable digest; keep transport event dedupe separate from service/symptom correlation windows so redelivery across windows cannot reopen a run. |
| T36 | P2 | 815 | "Downstream idempotency or check-before-act" implies equal guarantees. A non-atomic preceding status check races concurrent effects. Require atomic compare-and-set/business constraint, provider dedupe, or safe outcome-unknown reconciliation/escalation. |
| T37 | P2 | 835, 838, 840, 847 | Empirical claims (10-20-point description gains, 20-40% retrieval-call reduction, 30-40% coordination warning, a few-percent billing differences) are unsourced and dataset-dependent. Label illustrative expectations or replace with a measurement procedure and reporting template. |
| T38 | P2 | 847 | Cascade cost break-even formula assumes two fixed costs and no added validation, tool/latency or quality costs. State assumptions; add cost per successful task and candidate-output token differences. The formula is correct under its simplified assumptions. |
| T39 | P2 | 830-831 | Judge policy says never ship judge and agent changes together, then says scores are compared using old/new judge for any change. Clarify calibrated measurement-version transitions and frozen datasets. Absolute never is a process choice; justify it rather than imply a universal technical rule. |
| T40 | P2 | 855-856, 860 | Some answers overclaim: user content is categorically "data, not orders"; an unavailable tool "cannot be misused"; removing a trifecta leg makes "the attack fail." Clarify authorized user intent versus retrieved/untrusted text, hidden capability access versus tool-list omission, and the specific attack class mitigated rather than all harmful outcomes. |
| T41 | P3 | 820-821 | Further reading lists titles and bare domains but not direct paper/spec/framework links or access dates. Make clickable primary links and include exact release/commit links for checked edition versions. |

## Pagination and visual findings

The design is cohesive: teal/navy typography, light colored callouts, restrained tables, sketch overview diagrams, dark X-rays and blueprint-style exploded views distinguish purposes. In the contact-sheet scan, figures and their captions were generally intact, table rows were not visibly cut, and there was no obvious overlap/clipping on inspected representative pages. This is not a full-resolution proof for every glyph on all 288 pages.

**Confirmed violations of "nothing split":**

| Pages | Unit broken | Suggested pagination repair |
|---:|---|---|
| 600-601 | Claude Agent SDK code block breaks after options; lines 42-49 are a short continuation on the next page. | Refactor into named standalone "configuration" and "run" listings with captions, or shorten the complete example enough to fit one page at readable font size. |
| 636-637 | Commander code breaks at lines 40/41; graph construction and callout legend spill to a sparse continuation page. | Make two intentionally separate listings ("nodes/policy" and "graph assembly") with repeated imports/context references, or move a concise complete listing to companion code. |
| 849-850 | SQLite code is on p. 849; its five callout explanations start p. 850. | Keep annotations with code or place numbered explanations beside their corresponding lines; do not separate code from its meaning. |
| 865-866 | Chapter 39 answer 4 alone on p. 866 (almost otherwise blank). | Keep each four-question chapter answer group together. |
| 867-868 | Author contact callout alone on the next page. | Keep biography and contact details together, reducing excessive breaks without shrinking body text. |
| 809-810, 811-812 | Checklist categories continue with one/two remaining items before the next heading. | Keep each small category group together; deliberate running prose can break, but named logical checklist groups should not. |
| 833-834, 834-835, 836-837, 837-838, 841-842, 845-846, 851-852 | Individual appendix solution items run across page boundaries. | Apply keep-together to compact solution items or split into deliberate labeled subparts. Preserve readable font; do not force whole appendices onto oversized pages. |

**Other layout repairs:**

- **Pp. 592, 625, 627, 637, 849:** semicolon-packed Python lines wrap into indented continuation lines. Visual line numbers in numbered listings reveal some wraps; the unnumbered p. 592 example is especially easy to copy as invalid indentation. This is a PDF copy/paste/formatting defect, not proof that original source syntax is wrong. Prefer one statement per source line and break calls inside parentheses.
- **Pp. 591, 593, 596, 610, 614, 635, 650, 652, 656, 668, 718, 781, 786, 792:** frequent sparse pages place small intros/TOCs/tables alone and push substantive content forward. White space is useful, but many of these do not communicate an intentional section opening. Reflow shorter intro+example or heading+figure groups.
- **P. 636 / p. 849:** code listings nearly consume the full page. Refactoring is preferable to font compression to satisfy no-split requirements.
- **P. 719:** state-machine drawing has many long, crossing/curved failure routes and a left-hand recovery loop. The states are legible; reduce route complexity with a compact global failure legend and explicit edge predicates. Correct the runbook exception at the same time.
- **Pp. 705-708, 714, 746, 764, 783, 788, 794-796:** dense system/sequence/data views are suitable reference figures, but text can be small at normal print size. Test at intended trim size and provide a linked scalable diagram in the companion package.
- **Exploded views pp. 657, 690, 708, 772, 796:** attractive as ownership/document bundles, but identical vertical plates suggest layering or request order even where parts are orthogonal. Add "conceptual ownership layers, not execution order" where appropriate. Keep actual request flow in sequence diagrams.

## Analogies and pedagogy audit

| Chapter / pages | Assessment | Improvement |
|---|---|---|
| 31, 588-591 | Car brands and universal driving licence explain concept transfer; board-game referee captures routing/checkpointing. | "Few minutes" understates incompatible lifecycle, persistence and authorization semantics. Add one sentence that knowing the concepts does not replace API/operations validation. "Resume exactly where stopped" should point immediately to whole-node restart in Chapter 32. |
| 31, 598-601 | Equipped workshop is strong for built-in tools and permission decisions. | The safety officer cannot be a namespace-prefix allow rule; align example with the analogy's finite allowed tools. Rental insurance must not imply business liability or security are transferred. |
| 32, 613-615 | Railway clock/logbook makes super-steps and reducers memorable. | "Nothing happens between ticks" is a model of synchronization, not literal time; nodes can be long-running/streaming. A checkpointer photograph does not reverse real-world side effects during replay. |
| 32, 623-624 | Restarting departure checklist accurately teaches interrupt replay. | Avoid "executes twice" as a universal exact count; multiple interrupts/retries can restart more than twice. Explain repeatability rather than promise exactly two. |
| 32, 626-632 | Split train, branch line and records office fit Send, subgraphs and cross-thread stores. | Make tenant boundary explicit in shared-memory picture, and state that map-reduce completion order need not equal result order. |
| 33, 646-658 | Building supplies, serviced apartment and movable furniture cleanly communicate supplier variation/lock-in. | "Same purpose" does not imply feature/semantics parity. Queues, identity, workflows and tenancy differ enough to require behavioral contract tests. |
| 34, 666-676 | Journalist, analyst, temp worker, night guard and plant interlocks identify the right dominant risks. | Citation is evidence support, not truth; tests are finite coverage, not proof. A one-second live-radio response is an illustrative responsiveness target. Read-only research agents still need confidentiality and egress controls. |
| 35, 683-691 | Treatments with indications/contraindications and editor's red pen support simplicity well. | Flowchart is a heuristic, not a complete architecture decision; show an example where organizational permission boundaries justify splitting otherwise similar tasks. |
| 36, 697-719 | ER analogy is sustained coherently through triage, consent, action and observation. | Frame as operational coordination, not medical equivalence. "Recent changes are the most common cause" needs a source or local-data qualification. No need to generalize real clinical consent rules to make the software point. |
| 37, 728-745 | House construction and keys-last teach sequencing; evidence bags teach provenance. | "Windows before doors" says no risk before writes, although reads introduce privacy/injection risks. State "no production mutation yet" rather than "no risk." Falsification tests weaken alternatives; normal DB p. 95 alone may not rule out all database failure modes. |
| 38, 752-768 | Post-op observation, game days and accreditation explain verification/repeatability. | Accreditation language can overstate what a 100-case portfolio proves. Distinguish demonstration against a finite test set from production evidence over time. |
| 39, 779-800 | Tellers, librarians, hidden exams and case files map well to the three tracks. | Hidden tests prove performance on unseen examples, not absence of malicious behavior. Preserve honest refusals but repair the unsupported facts in Figure 39.8. |
| E, 822-831 | Aviation incident-report analogy supports blameless learning; composites are clearly disclosed. | Avoid the blanket claim every accident produces a public report; "investigated accidents and published reports" is enough. |

**Repetition:** The analogy map, section analogy, overview sketch, X-ray/exploded view, memory card, interview answer and self-check often repeat the same lesson. This supports retrieval practice, but expert chapters spend many pages repeating ownership and safety slogans. Preserve active recall and replace some passive repetition with a counterexample or a worked artifact. The capstone adds genuinely new integration value; the duplicated checklists and interview summaries could be more compact and link to the canonical version.

## Appendix and index consistency

- **Appendix F exercise numbering:** p. 634 resets the second testing technique to 1; p. 843 labels Chapter 22's third solution as 1 after a code block; p. 845 labels Chapter 24's third solution as 1; p. 850 labels Chapter 32's exercises 3 and 4 as 1 and 2 after the combined exercises 1/2. Restore original exercise numbers. Use a structured exercise ID, not an automatically restarted list.
- **Appendix F contents, p. 832:** its item 38 is Chapter 39, with no Chapter 38 guide. Chapter 38 has extensions rather than numbered exercises, so this is not proof of missing answers, but "every exercise" should say whether the six extension challenges are included and offer done-when criteria for them.
- **P. 852 Chapter 37 solution 2:** requested dependency-outage scenario is described using high database latency and no clear single cause. Clarify which dependency is unavailable and why the result is escalation; align title, fixtures and acceptance criterion rather than silently substituting another incident.
- **Appendix G:** Chapters 31-39 letters are consistent: 31 C/A/A/C; 32 C/C/D/D; 33 A/A/A/D; 34 B/D/D/C; 35 D/B/C/A; 36 B/D/C/B; 37 A/A/C/A; 38 B/C/C/D; 39 B/A/A/C. Explanations concerning approvals, exactly-once and security need the qualifications above.
- **Index, pp. 869-872:** improve locators rather than regenerating blindly from keyword occurrences. `Property-based testing` points to 702 and 730, which concern agent justification and analogy/build sequence, not property testing. `Model routing` points to 614, whose subject is LangGraph execution. `Budget` points to 701 where US-8 mentions cost but does not teach budget enforcement. `Chaos testing` points to 781, which mentions crash/retry acceptance but does not provide a method. Some are incidental occurrences, not useful main discussions.
- **Index missing capstone navigation:** there is no `AegisOps` entry despite three central chapters, and no clear entries for evidence insufficiency/refusal, approval expiry/consumption or verification window. Add main discussion and worked-example subentries. `Send` at 613 is the analogy map; main implementation is 625-626. `Command` main implementation is 617-619. `Argument hash` should point to the original approval discussion as well as the capstone model.
- **Back matter pp. 867-868:** biography and employment/client-history claims were not independently verified; do not present the review as certifying them. Author links are readable; make sure PDF hyperlinks are live.

## Coverage record

| Section | Physical pages | Review coverage / principal assessment |
|---|---:|---|
| Chapter 31  -  Framework Mapping | 585-608 | All text + visual contact sheet; full pages 592,600,601. Strong map; exact tool allowlist and multi-interruption handling need repair; actual code split. |
| Chapter 32  -  LangGraph in Depth | 609-643 | All text + visual; full 636,637. Strong reducer/checkpoint/interrupt sequence; human approval state lost, risk5 admitted; split sketch; route-runtime validation needs emphasis. |
| Chapter 33  -  Cloud & Enterprise Integration | 644-662 | All text + visual. Useful dated orientation and portability; framework/service names broadly confirmed. Managed service layer picture should not imply identical bundled features. |
| Part IX divider | 663 | Read and visually inspected; clean part transition. |
| Chapter 34  -  Specialized Agent Systems | 664-680 | All text + visual. Good verification taxonomy; research claim schema and read-only/cancellation qualifications need work. |
| Chapter 35  -  Architecture Selection & Senior Design Review | 681-694 | All text + visual. Good simplification lens; keep diagram heuristic and evidence gates tied to operational context. |
| Part X divider | 695 | Read and visually inspected; clean part transition. |
| Chapter 36  -  AegisOps Blueprint | 696-726 | All text + visual; full 719. Strong stories, NFRs, data and risks; production-action arrows, tokens, count and runbook exception inconsistent. Cost estimate recomputed: raw model cost $1.40475, reasonably displayed ~$1.41. |
| Chapter 37  -  Build Phase by Phase | 727-749 | All text + visual. Excellent milestone/exit-criterion progression; RunContext mismatch, two-person contract and atomic revision check need repair; effort assumptions vary. |
| Chapter 38  -  Hardening, Evaluation & Game Days | 750-776 | All text + visual; full 753. Strong six game days/release flow; verification window logic and residual-risk terminal policy unclear; finite dataset/rubric overclaims. |
| Chapter 39  -  More Capstones | 777-802 | All text + visual; full 790. Strong scope alternatives and diagrams; refund guarantees and refusal provenance need repair; protected lockfile upgrade contradiction. |
| Appendix A  -  Glossary & Distinctions | 803-808 | All text + visual. Useful concise glossary; checkpoint durability and deterministic tools should be scoped, not universalized. |
| Appendix B  -  Readiness Checklist | 809-812 | All text + visual. Comprehensive evidence prompts; category groups split. Add exact evidence/owner/signoff fields in companion worksheet. |
| Appendix C  -  Interview Bank | 813-817 | All text + visual. Good concise tradeoffs; qualify check-before-act and "only decide probabilistic" for real external systems. |
| Appendix D  -  Tooling & Reading | 818-821 | All text + visual. Broad and relevant; add direct primary-source hyperlinks/edition version records rather than domains only. |
| Appendix E  -  Production Failure Cases | 822-831 | All text + visual. Very strong composite cases and clear disclosure; reconcile refund effect identity/partial refunds and measurement-version policy. |
| Appendix F  -  Exercise Solutions | 832-853 | All text + visual; full 849,850. Helpful traps/done-when pattern; same-process restart demonstration does not fulfill actual-process instruction; several numbering resets, security-read error and empirical overclaims. |
| Appendix G  -  Self-Check Answers | 854-866 | All text + visual; full 866. All reviewed31-39 letters correct; some explanations oversimplify security; last answer alone on page866. Earlier-chapter question wording was not fully crosschecked in this assignment. |
| About Author | 867-868 | All text + visual. Contact card orphan; biography not independently factchecked. |
| Index | 869-872 | All text + visual. Representative in-range locators checked; irrelevant/incidental pointers and absent capstone term; full pre585 locator validation belongs to whole-book audit. |

## Primary sources checked

Official pages support narrowly described behavior, not claims that the entire manuscript or its tests were executed.

1. [LangGraph Graph API](https://docs.langchain.com/oss/python/langgraph/graph-api)  -  reducer/Command/routing semantics and recursion config.
2. [LangGraph persistence](https://docs.langchain.com/oss/python/langgraph/persistence)  -  checkpointer versus store and in-memory limitations.
3. [LangGraph durability reference](https://reference.langchain.com/python/langgraph/types/Durability)  -  sync/async/exit modes; the checked release family exists.
4. [OpenAI RunState](https://openai.github.io/openai-agents-python/ref/run_state/)  -  JSON dictionary serialization/deserialization and trusted-state warning.
5. [Claude SDK permissions](https://code.claude.com/docs/en/agent-sdk/permissions)  -  allow/deny/callback evaluation.
6. [Spring AI2 GA](https://spring.io/blog/2026/06/12/spring-ai-2-0-0-GA-available-now/)  -  confirms auto-registered ToolCallingAdvisor and redesigned loop. Do not mark the book obsolete using Spring1 assumptions.
7. [Microsoft Agent Framework1](https://devblogs.microsoft.com/agent-framework/microsoft-agent-framework-version-1-0/)  -  confirms April2026 production release and successor framing.
8. [Microsoft overview](https://learn.microsoft.com/en-us/agent-framework/overview/)  -  relation to Semantic Kernel/AutoGen.
9. [Google Agent Platform update](https://cloud.google.com/blog/products/ai-machine-learning/whats-new-in-gemini-enterprise-agent-platform/)  -  current platform and Memory Bank terminology.
10. [AgentCore policy](https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/policy-core-concepts.html)  -  Cedar governance at gateway; does not imply all clouds have equivalent components.
11. [MCP2026-07-28 announcement](https://blog.modelcontextprotocol.io/posts/2026-07-28/)  -  confirms the named revision, stateless core and updated SDK support.
12. [Temporal activity semantics](https://docs.temporal.io/activity-definition)  -  repeat executions and downstream-idempotency requirement.
13. [Stripe idempotency](https://docs.stripe.com/api/idempotent_requests)  -  stable request keys and retention limits.
14. [Docker run](https://docs.docker.com/reference/cli/docker/container/run/)  -  read-only prohibits writes, not reads.
15. Package-index JSON checked read-only: [OpenAI Agents](https://pypi.org/pypi/openai-agents/json), [Claude Agent SDK](https://pypi.org/pypi/claude-agent-sdk/json), [LangGraph](https://pypi.org/pypi/langgraph/json). Observed current versions0.23.1,0.2.165,1.2.14 respectively; supports plausibility of the edition's minor-family pins. Exact execution claims need companion lockfiles/test logs, which were not validated here.

## Recommended repair order

1. Fix the exact permission, risk and approval-state defects.
2. Make downstream effect guarantees and real-process crash tests explicit.
3. Align sustained verification, trust boundaries, data schemas and all figures with one canonical policy.
4. Repair the refusal example and replay explanation.
5. Refactor split code into intentional listings; keep answer and annotation groups intact; reflow sparse pages.
6. Correct solution numbering, companion navigation and index locators.
7. Keep diagrams attractive while adding semantic legends; trim repetitive slogan/analogy content in expert chapters.

This report establishes review coverage for the assigned range; it does not claim the book is error-free, its companion code passes, or the capstone is operationally production-ready.