# Agentic AI Engineering: publication review handoff

Version 1.0-rc.1. Prepared 17 October 2026. Owner: Muhammed Juned Alam. Corrections: juned.alam.dev@gmail.com.

## Decision

The complete book is prepared for independent review. This is not public-release approval. The local AI-assisted source review covers all 39 chapters and their 117 integrated visual lessons. Focused corrections, companion regression tests, reference reachability, font provenance, PDF layout checks and representative rendered-page inspection are recorded separately. Human practitioner review, professional copyediting and target-reader testing have not occurred. No reviewer has been contacted.

The author explicitly requested omission of the author biography and retention of technical references. General reuse terms for the companion code await the author's choice. No open-source licence has been silently added.

## Technical corrections to confirm

1. Chapter 12, reciprocal-rank fusion: remove duplicate document IDs before assigning each list's ranks. Inserting duplicate IDs must not change the fused order. The regression executes the exact printed listing.
2. Chapter 38 and capstone: reject non-finite, negative, Boolean, null and string time values before recovery comparison. Require start < end <= available; preserve the independent 30-second watermark and fractional-second behavior.
3. Chapter 28: prose now uses the implemented meets_quality_floor helper name.
4. Chapter 31: preapproved Claude tools may bypass the permission callback. Tool registry enforcement must cover actual exposure and execution.
5. Chapter 36: explicitly name model tiers used in each existing cost stage.
6. Research lesson 06 / Appendix E: replace AWS idempotency and Strands documentation destinations. Local copyedits remove production/layout wording and repair ambiguous sentences. Full change details are in the three scoped audit reports and the source CHANGELOG.md.

## Independent technical review brief

Recruit practitioners with relevant current hands-on experience; the following is a proposed allocation, not assigned or completed work. Declare conflicts of interest and record reviewer identity, date, exact version and scope. Reviewers should examine claims and try counterexamples, not merely confirm that the tests pass.

- Foundations/RAG reviewer: chapters 1-13, every associated A/B/C lab, model and retrieval arithmetic, context reservations, rank fusion, authorization before retrieval, bounded adaptive search, and the SQLite harness.
- Runtime/security reviewer: chapters 14-26, all associated lessons, MCP/A2A version assumptions, durable control, approvals, tenant scope, sandbox escape boundaries, retry budgets, judge bias and trace privacy.
- Production reviewer: chapters 27-39, associated lessons, framework adapters, serving and cost arithmetic, state migration, recovery, capstone fault boundaries and the distinction between local evidence and production guarantees.

For each assigned chapter, verify the learning objective, explanation/analogy mapping, diagram arrows/units/assumptions, prediction answer, code boundary, numerical example, source support and prerequisites. State where an analogy stops applying. Flag misleading simplicity as well as outright errors.

Run the companion from a clean extraction. Attempt duplicate/reordered/missing evidence; changed proposal/permission; lost response after effect; invalid clocks; stale tenants; absent approvals; incomplete monitoring windows. Confirm terminal outcomes do not overstate completion. The intended local suite includes real SQLite/process loss, actual local MCP stdio, exported OpenTelemetry spans and real LangGraph persistence; external services are fixtures.

Treat live Temporal history replay/timers/cancellation and PostgreSQL deployment/tenant isolation as unexecuted integrations. Either validate them in a scoped follow-up environment or preserve the explicit limitations. Never sign off on an integration solely because an SDK import or local handler test passed.

## Severity and closure

- Critical: credible disclosure, unauthorized effect, dangerous completion claim or invalid core learning conclusion. Resolve before release.
- Major: wrong technical claim, broken required lab, incorrect answer/diagram or missing prerequisite that prevents the intended task. Resolve and rerun a relevant check before release.
- Minor: ambiguity, spelling, navigation or presentation issue without a changed technical outcome. Resolve or record an explicit editorial disposition.
- Suggestion: optional expansion or preference. Record a decision rather than silently expanding scope.

Each finding needs an ID, reviewer, version, chapter/section, PDF and printed page, evidence, expected/observed outcome, severity and proposed correction. The author records accepted/rejected/deferred with rationale. An independent reviewer closes critical and major findings against the revised version. An empty issue list is not a substitute for a signed scope statement.

## Copyeditor brief and house style

Use US English for new prose and harmonize existing mixed spellings during the professional copyedit. Preserve code identifiers, literal fixture statuses, official titles, quotations and URL spelling. Preferred terms: behavior, authorization, organization, labeled, canceled in prose; do not alter a literal cancelled field without a code review.

Define AI, ML, DL, LLM, RAG, MCP and A2A at their first meaningful use. Keep API names and pinned versions exact. Distinguish attempt/retry, proposed/approved/executed/verified, latency/duration, authority/relevance, state/memory and example/measurement. Use one base unit per calculation, explicit currency/date for prices and denominators for percentages. Identify constructed examples consistently.

Edit explanations in this order: familiar situation, concept, mechanism, diagram walkthrough, limits of the analogy, worked example, prediction/check. Remove repetition only when prerequisites remain available locally. Do not remove necessary authority/recovery conditions to make a paragraph shorter. Avoid claims such as guaranteed, safe or production-ready without scoped evidence.

Keep paragraphs, analogy cards, individual code units, exercises and diagram/caption units intact. Longer sections may span pages at these boundaries. Check headings, contents, index, source references, cross-references, captions and code after pagination changes. Reading-order tags are present, but assistive-reader behavior and PDF/UA conformance require separate validation.

## Target-reader pilot

Suggested pilot: six readers, two per route (new to agent engineering with Python basics; working application/RAG developers; experienced platform/security engineers). This is a small qualitative pilot, not a statistical usability claim. Record experience and accessibility needs with consent; do not collect unnecessary personal data. Use participant IDs in the feedback sheet.

Give each participant the complete PDF and companion ZIP, the edition/version, and their route. Ask for a 60-75 minute think-aloud session. The moderator should observe before helping; record every hint and undocumented setup step. Do not ask the author to explain the answer before measuring comprehension.

1. Five minutes: locate the contents, visual-learning instructions, references and corrections contact. Ask the reader to describe where they would begin.
2. Fifteen minutes: read one assigned concept and its A/B/C labs. Explain the analogy in their own words, identify one limit, trace a changed field/edge and predict an outcome before viewing the answer.
3. Twenty-five minutes: extract the companion and complete one route-appropriate task using only the guide. Foundations: run the harness and explain why one refund occurs after restart. RAG: compare fixed/adaptive retrieval and explain absent-evidence stopping. Platform: run capstone tests and explain why committed does not mean recovered.
4. Ten minutes: locate a technical reference and an index entry; find an answer and return to its question. Zoom one diagram and examine it in grayscale. Note small text, dense pages and confusing page transitions.
5. Ten minutes: ask what was unclear, what felt repetitive, which diagram changed their understanding and which claim they could not explain. Ask for a correction report using the supplied template.

Suggested pilot acceptance targets: both readers on each route complete its core task without an undocumented prerequisite; no unresolved severe misconception about authority, retrieval evidence or recovery; diagrams can be explained without the moderator inventing missing semantics; every reproducible navigation/setup defect is logged. If a route fails, revise and retest that route with a fresh reader. These targets are editorial decisions, not certification.

## References and provenance

The reachability register covers all URLs found in chapter, visual/research lesson, preface and appendix sources. A successful HTTP response proves reachability only. The scoped reviewers spot-checked high-risk primary claims; this is not an exhaustive reading of every cited paper. Intentional .test/.example domains are fixtures, not dead citations. ISO/ACM/EUR-Lex may restrict automated access; record access limitations without substituting unofficial copies.

The font audit compares 18 bundled files against recorded hashes. Retain the SIL Open Font License notices with redistributed fonts. The technical diagrams are editable original vectors; selected cover images were generated using AI, with prompts/provenance retained. The supplied manuscript's underlying ownership, any third-party quotations and the author's chain of rights still need author/publisher confirmation. Provenance is not a legal opinion about copyright protection.

Dependencies are installed separately, not vendored. Their own licences apply. The companion currently contains LICENSE_STATUS.txt, not an MIT grant. Decide code reuse terms before release and update the PDF, companion, metadata and source together. No author biography is needed for this edition.

Primary licensing guidance: https://openfontlicense.org/ofl-faq/ and, only if selected, https://opensource.org/license/mit . Follow the applicable publisher's current AI-content disclosure process at submission; none has been filed in this local task.

## Release gate and version policy

The author owns the release decision after: independent technical scope/sign-offs are recorded; major issues are closed with evidence; copyedit and reader pilot are complete; code licence and manuscript/artwork rights are confirmed; final PDF/companion/source hashes agree; the final proof and current page count are approved. A printer-specific interior/cover spread, bleed/spine/color checks or EPUB validation belong to the selected distribution format and are not supplied by this reading PDF.

Keep 1.0-rc.1 as the candidate identifier. Increment the candidate version for substantive review revisions and record the changes. Set a public release date only when publication actually occurs. Use chapter/section IDs alongside pages in errata because pagination changes. Do not promise fixed response times or lifetime framework compatibility. Keep the book, companion and corrections register on the same version.

## Sign-off record

Reviewer/role: ____________________  Version/hash: ____________________
Scope and chapters: __________________________________________________
Commands/platform or reading method: _________________________________
Findings and evidence IDs: ___________________________________________
Unreviewed boundaries: _______________________________________________
Decision (approve within scope / revise): ____________________________
Date: ____________________  Author disposition: ______________________
