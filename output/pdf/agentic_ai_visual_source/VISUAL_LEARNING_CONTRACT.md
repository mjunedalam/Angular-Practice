# Visual learning edition — 17 October 2026

The user requested a deeper, more diagram-based learning experience after the full revised book. Preserve its 39 chapters and corrected technical explanations. Add two substantive visual lessons per chapter, integrated in the book and collected in a separate visual atlas. Each lesson is a complete page. Original and previous revised PDFs remain unchanged.

## Teaching design

The first lesson follows the chapter analogy and makes its mechanism visible. The second sits before a relevant middle/later section and works through a concrete example. Both use actual fictional records, events, values, decisions or evidence. Avoid another generic overview of named components. Make the reader inspect, predict, and explain a visible result. State assumptions and analogy limits; never encode an invented benchmark as a measurement.

Read the whole assigned chapter before writing. Keep current source prose unchanged. Use ShopAssist and AegisOps where useful. Do not invent empirical outcomes, deployment guarantees or new API/version claims. Use the chapter's established contracts and corrections. Visuals must not imply that a valid schema grants authority, a local key guarantees an external effect, a checkpoint ensures exclusive ownership, or a confident answer proves success.

## Files and common schema

Write `visual_lessons/NN.json`: an object with `chapter` (integer), `chapter_title`, `audit` (80–130 words: specific visual teaching gap and what the two lessons add), and `lessons` (exactly two objects). Each lesson:

```json
{
  "id":"1A",
  "placement":"after_analogy",
  "anchor":"",
  "title":"The form is not the refund",
  "intro":"A fictional request ...",
  "kind":"packet",
  "data":{},
  "read":["First inspect ...","Next notice ...","The result means ..."],
  "question":"What changes if ...?",
  "answer":"The expected result and why ...",
  "takeaway":"One precise lesson.",
  "assumption":"Fictional example; ..."
}
```

Lesson B uses `placement:"before_heading"` and `anchor` equal to an existing substantive `##` heading, without the Markdown prefix. Pick a middle/later heading; do not put it before Self-checks, Exercises, Edition sources, Interview drills or Key takeaways. Lesson IDs are `NA` and `NB`. Titles <=58 characters; intro <=40 words; each of exactly three `read` items <=18 words; question <=24 words; answer <=65 words; takeaway <=18 words; assumption <=24 words. Plain text only (no Markdown within JSON strings); use ASCII punctuation/dashes. Human-readable spaces around numbers. Each page carries a prediction prompt; answers are generated as a separate section/appendix, not exposed beside the question.

## Data schemas — choose the shape that teaches the concept

Use at least eight different kinds across each 13-chapter assignment. Do not use one kind more than five times in those 26 lessons. The two lessons of a chapter must use different kinds.

1. `workspace`: `zones` exactly 3 objects with `title` <=20 chars, `object` one of `folder/window/vault/server/queue/shield`, `items` 2–4 strings <=32 chars each, and `role` from model/runtime/policy/action/success/data/external. `relations` exactly 2 strings <=50 chars each, describing how the zones relate, without falsely implying a time sequence. Visual: three distinct physical containers with literal example contents.

2. `packet`: `name` <=28 chars, `fields` exactly 4 `{key,value}` objects (key<=15,value<=30); `checks` exactly 3 `{label,detail,status}` objects (label<=21,detail<=45,status pass/fail/wait); `result` <=55 chars, `result_status` pass/fail/wait. Visual: a literal request envelope beside independent stamped checks. Do not make all checks pass unless execution really is allowed under the stated assumptions.

3. `snapshots`: `frames` exactly 3 objects with `title`<=20, `event`<=35, `fields` exactly 3 `{key,value,changed}` (key<=14,value<=25,changed boolean). All frames show the same keys. `invariant`<=70 chars. Visual: three time-stamped record versions; changed cells highlighted, unchanged cells muted.

4. `swimlane`: `lanes` exactly 3 labels <=18 chars; `steps` exactly 5 objects `{time,lane,label}` (time<=10,lane integer0–2,label<=28); `wait_after` optional integer0–3; `wait_label`<=35; `result`<=65 chars. Visual: left-to-right event ownership, time labels and a visible wait band. Time positions are ordered steps, not proportional durations. All events must respect authorization and persistence ordering.

5. `matrix`: `columns` exactly 3 <=18-char labels; `rows` exactly 4 `{label,cells}` (label<=24,cells exactly3 values from allow/deny/review/unknown); `rule`<=90 chars. Visual: permission/decision grid with shape+word+colour encodings. Use concrete roles/resources/cases, not a table of vague virtues.

6. `ledger`: `unit`<=18 chars, `start` positive number; `entries` exactly 4 `{label,delta}` (label<=35, numeric delta). Each running balance must stay in [0,start]; `rule`<=90 chars. Visual: running balance, signed changes and proportional bars. Explain the reservation/settlement assumption; do not conflate concurrent permits with cumulative spend.

7. `evidence`: `claims` exactly 3 `{id,text}` (id<=6,text<=62); `sources` exactly 3 `{id,text}` (id<=6,text<=80); `links` exactly3 `{claim,source,relation}` indices0–2, each claim exactly once, relation supports/conflicts/insufficient; `verdict`<=80 chars. Source excerpts are fictional and must support their specified relation. Visual: claim-to-passage pins with numbered coloured connectors and explicit relationship labels.

8. `fork`: `input`<=65; `left` and `right` each `{title,steps,result,status}` (title<=25,steps exactly3 strings<=48,result<=65,status pass/fail/wait). Visual: same starting case, two counterfactual traces, visibly different outcomes. Describe the actual changed mechanism, not a caricature of an alternative design.

9. `tree`: `root`<=45; `branches` exactly2 `{edge,question,yes,no}` (edge<=18,question<=42,yes/no each `{label,role}` label<=42,role pass/fail/wait). Both second-level branches explicitly use YES and NO. Visual: one root split, two binary decisions and four leaves. Root edge labels must partition the stated problem meaningfully. Do not silently omit an unknown/unsupported case; narrow the setup if needed.

10. `bars`: `unit`<=18; `items` exactly4 `{label,value,role}` (label<=32,value>=0,role standard model/runtime/policy/action/success/data/external); `rule`<=90. Visual: actual proportional horizontal bars with numbers. Toy values must be identified as constructed, not measured; compare like quantities.

11. `packing`: `capacity` positive, `unit`<=15; `segments` exactly4 `{label,value,role}` (label<=25,positive value,role standard), sum must equal capacity; `excluded` exactly2 `{label,reason}` (label<=25,reason<=45). Visual: a context-capacity tray with proportional segments and deliberately excluded scraps. Reserved output capacity must be distinct from input content. State any provider-specific simplification.

12. `faultmap`: `zones` exactly3 `{title,nodes}` (title<=18,nodes exactly2 `{id,label,role}`, id unique<=6,label<=24,role standard); `edges` exactly4 `{from,to,label,status}` (IDs above,label<=42,status allow/deny). Visual: three shaded trust zones, six nodes and four numbered routes; denied paths end in a stop mark. Prefer adjacent-zone routes; never use the same ordered endpoint pair twice. Explicitly mark untrusted data and constrained effects; a drawn fence is not an implementation guarantee.

13. `intervals`: `rows` exactly4 `{label,n,k,estimate,low,high}`; n positive int,k int0–n, numeric values0–1 ordered low<=estimate<=high. `threshold` optional0–1, `method`<=90 chars. Values must be calculated and independently checked (e.g. two-sided Wilson with z=1.96). Label constructed counts as such. Visual: point estimates and interval whiskers on the same 0–100% scale, optional gate line. Statistical assumptions belong in intro/assumption/read.

## Responsibilities and quality gates

The lead owns rendering, integration, visual QA, regenerated navigation and packaging. Three independent authors own chapter JSON ranges 01–13,14–26,27–39; they do not edit prose, renderer or other authors' files. Each delivers a per-chapter audit plus validated JSON and a short report of assumptions/corrections. The full edition and visual atlas must render all lessons intact at readable type. Check source preservation, all required chapter coverage, exact numeric encodings, labels/bounds/collisions, links and page images before delivery.
