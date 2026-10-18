# Revised Agentic AI Engineering: editorial and rendering contract

The user authorized revision of the whole supplied book, prioritizing simple connected explanation, useful analogies, distinctive diagrams and intact page units. Preserve the original 39-chapter curriculum, its substantive section topics, ShopAssist and AegisOps. This is a rewritten edition, not a short summary or a new review. The original PDF remains the reference and is not overwritten.

## Writing

- Read the complete source extract and relevant audit findings for each chapter before rewriting it.
- Use ordinary connected prose. Explain a term before relying on it. Show why one step leads to the next. Avoid a chapter that is mostly bullets, slogans or a checklist.
- Use one main everyday analogy per chapter, develop it through the engineering explanation, and explicitly mark where it breaks. A secondary analogy is useful only for a genuinely different mechanism.
- Preserve every substantive topic in the original chapter. Merge repetition, not technical distinctions. Keep worked examples, operational trade-offs, failure modes, exercises and interview/design questions.
- Aim for 2,500-4,000 words per normal chapter, and more where necessary for the framework and capstone chapters. Do not pad to a count or cut necessary material to meet it.
- Correct the audited inconsistencies. Clearly distinguish working example, pseudocode and production extension. Do not assert runnable, safe, durable or exactly-once without the corresponding mechanism/evidence.
- Keep individual prose paragraphs roughly 50-110 words so each can stay intact. Prefer compact complete code listings of at most 32 lines and 72 characters per line; split longer source into named complete functions rather than arbitrary fragments. Ordinary snippets may have explicitly described service interfaces, but not hidden critical safety checks.
- Include four self-check questions with answers, and two or three exercises with concrete acceptance criteria and solution guidance per chapter. Preserve the original exercises' main learning targets.
- Link volatile protocol/framework statements to primary official sources, with an edition date. Reuse verified audit sources; verify new uncertain claims. Do not invent benchmark results or personal production stories.
- Use ASCII hyphens. Do not put original PDF page references into the reader-facing prose; chapter references remain stable. Record source mapping separately.

## Chapter files

Write chapters as `chapters/NN.md`. First line: `# N. Original chapter title`.

Use `##` for substantive section headings and `###` for subheadings. Preserve the original major section topics, even when giving a heading plainer wording. Ordinary Markdown paragraphs, lists, links, small tables and fenced code are supported.

Custom blocks end with a line containing only `:::`. Do not nest custom blocks.

```
:::analogy The restaurant order slip
A concise story, a clear mapping to this chapter, and a sentence beginning
"Where it stops:" that names the analogy's limit.
:::

:::note The rule to remember
One useful paragraph connecting this example to an engineering decision.
:::

:::diagram
{"kind":"flow","title":"A proposal becomes an action","nodes":[{"label":"Propose","detail":"The model names a tool.","role":"model"},{"label":"Check","detail":"The runtime applies policy.","role":"policy"},{"label":"Execute","detail":"The gateway performs the action.","role":"action"}],"caption":"A tool request has no authority on its own.","insight":"Only the runtime crosses the execution boundary."}
:::

:::check
{"question":"Why does a valid tool request still need authorization?","answer":"Its shape says nothing about whether this principal may perform this action on this resource."}
:::

:::exercise
{"title":"Reject a denied action","task":"Build a fake executor and pass it a rejected approval.","done_when":["The tool invocation count stays at zero.","The audit record states why execution stopped."],"solution":"Check the decision outcome before checking binding and expiry; use a fake tool counter to prove that rejection has no side effect."}
:::
```

## Diagram vocabulary

Supply 3-5 original diagrams per chapter, situated next to the explanation they teach. Vary forms by meaning; do not render every concept as a row of boxes. All text should be short enough to read at book size. No more than 7 main items per figure. Never claim a drawing is proportional unless it is encoded by numeric values.

Common fields: `kind`, `title`, `caption`, `insight`. Optional `nodes` carry `label` (up to 30 characters), `detail` (up to 70 characters), and `role` (`model`, `runtime`, `policy`, `action`, `success`, `data`, `external`).

- `flow`: 3-6 ordered nodes, optional `loop_label` for a return path.
- `cycle`: 4-6 nodes in a feedback loop; optional `center` label.
- `layers`: 3-6 ordered conceptual parts drawn as an exploded assembly. Sizes are not quantitative. Each node's detail explains ownership or responsibility.
- `boundary`: 3-5 nodes crossing a labeled trust/authority boundary; provide `boundary_label` and `gate_after` (zero-based node index).
- `anatomy`: 4-7 fields of one record/tool/context, drawn as an object with numbered callouts; optional `object_label`.
- `comparison`: `left` and `right` objects, each with `title` and `items` (3-5 short strings). A before/after or fixed/adaptive comparison, not a straw-man baseline.
- `sequence`: `actors` (3-4 short names) and `messages` (4-7 objects with `from` and `to` zero-based actor indices, `label`, optional `role`).
- `budget`: `segments` (3-6 objects with `label`, positive numeric `value`, optional `role`), `unit`, and optional `total`. Totals must agree. Areas encode actual values; small labels appear in a keyed legend.
- `timeline`: 3-6 nodes describing a crash/recovery, delivery, or release sequence.
- `network`: a `center` label and 3-6 peripheral nodes; use only for relationships, not a hidden time sequence.
- `state`: 3-6 main nodes plus `branches` (up to 3 objects with `from` zero-based node index, `label`, `detail`, `role`). Main states form an explicit forward path; put retry behavior in the caption rather than implying an unspecified edge.

Every diagram must agree with the prose and code. "Rejected", "expired", "outcome unknown", and "verified complete" are distinct states. Read-only does not mean harmless. A local ledger does not by itself guarantee one external effect.

## Ownership and integration

- Foundations writer owns chapters 01-14 and a complete runnable `examples/mini_harness.py` plus its deterministic checks. Keep the harness intentionally small and document its exact persistence and side-effect contract.
- Runtime writer owns chapters 15-30.
- Production writer owns chapters 31-39 and appendices A-E as `appendices.md`. Rework existing glossary, readiness checklist, interview bank, sources and four fictional case studies. Appendices F/G are generated from the revised chapter exercises/self-checks, so answers cannot drift from questions.
- Each writer creates `coverage-NAME.json`: one record per owned chapter with source headings and their corresponding revised headings, corrected audit IDs, and any limitation. Do not silently drop a substantive source topic.
- The lead owns front matter, diagram rendering, typesetting, final source/package integration, page-level validation and rendering.

## Publication checks

Each paragraph, analogy, diagram with caption, small table/row, code function and question stays intact. If an element cannot fit on a page at readable size, rewrite it into independent named units. Headings cannot be detached. All figure and contents page numbers are generated after pagination. Source chapters remain editable alongside the PDF.
