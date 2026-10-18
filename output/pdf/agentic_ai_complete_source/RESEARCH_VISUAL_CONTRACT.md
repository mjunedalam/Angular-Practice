# Complete-book redesign: web-informed visual additions

User requests ONE complete book only: more diagrams informed by web research, refreshed typography and styling, attractive front/back covers. Retain all 39 chapter manuscripts, existing 224 diagrams and 78 visual labs. Add one new research-informed visual lesson per chapter (39 C lessons); lead adds 10 part-opening learning maps and handles covers and typography. Do not create another atlas.

## Author scope

Read your assigned full chapters, their existing A/B lesson JSON, and VISUAL_LEARNING_CONTRACT.md. Own only `research_lessons/NN.json` for your assigned range. Do not edit chapter prose, old A/B JSON, fonts, renderer, or other ranges. Browse the web using web tools: rely only on primary sources (official docs, original research papers, original engineering articles). Open the actual source before using it. The user explicitly asked for web research. Sources are references for the concept, not images to copy. No stock diagram screenshots or cloned layouts. Produce original concrete fictional teaching scenarios and visual data.

Choose a topic not already taught by that chapter's A and B labs. It should deepen a chapter mechanism: inspect a specific record, failure, tradeoff, decision or quantity. Keep explanations simple and connect to ShopAssist/AegisOps or a familiar analogy. Do not introduce newer API/version claims or unsupported product features. Prefer durable concepts. Existing manuscript source checks are not refreshed by this addition.

## JSON

Each file:
```
{
 "chapter":1,
 "design_note":"<=60 words: what new understanding this picture adds",
 "source":{
   "id":"R01",
   "title":"Exact source title",
   "url":"https://direct-primary-source-page",
   "publisher":"Organization or paper authors",
   "accessed":"2026-10-17",
   "concept":"<=45 words in your own words: narrow principle supported by this source",
   "scope":"<=30 words: what the original fictional example adds or assumes; do not suggest that its numerical results come from the source"
 },
 "lesson":{
   "id":"1C",
   "placement":"before_heading",
   "anchor":"Exact substantive ## heading in the chapter, preferably later than B",
   "title":"<=58 characters",
   "intro":"<=40 words",
   "kind":"one existing kind from VISUAL_LEARNING_CONTRACT",
   "data":{},
   "read":["three cues, each <=18 words"],
   "question":"<=24 words",
   "answer":"<=65 words",
   "takeaway":"<=18 words",
   "assumption":"<=24 words",
   "source_key":"R01",
   "source_label":"<=48 characters: short human-readable source title"
 }
}
```
Use all existing data schemas/limits from VISUAL_LEARNING_CONTRACT.md. C should use a different kind from A and B in that chapter. Use at least 7 forms across your 13 chapters, at most 3 instances of one form. Literal ASCII punctuation. No Markdown except URLs in source metadata. Each prediction answer must be inferable from the visible facts and stated assumptions. Diagrams are not performance claims.

Keep any direct source quotation at zero. Use no more than two C lessons from one exact source URL within your assignment, and keep the aggregate source-derived explanation under 160 words per URL; most of the lesson should be an original constructed case. Do not duplicate a paper's distinctive figure arrangement. Report which primary pages were opened. Check all numerical and logical invariants independently. Wilson intervals use z=1.96 and must describe the binary event consistently, whether success or failure. New plots must specify toy values as constructed.

## Validation and report

Check schema, character/word limits, anchors, forms, authority/recovery/evidence semantics, exact arithmetic and source support. Save progressively. Return a short report of topics and URLs, assumptions and any cautions. Stay available for a later rendered-page visual QA pass.
