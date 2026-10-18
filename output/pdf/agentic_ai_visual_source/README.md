# Agentic AI Engineering — Visual Learning Edition

This source package builds two complementary PDFs:

- The complete visual learning edition: all 39 revised chapters, 146 existing vector figures, 78 additional full-page visual labs, exercises, source references and regenerated index.
- The visual atlas: the same 78 labs, a reading guide, clickable chapter directory and linked prediction answers.

Each lab teaches through a concrete example, three reading cues and an unanswered prediction prompt. Answers are separated from the prompt and linked both ways. Appendix H contains those answers in the full book.

## Editable files

- `chapters/01.md`–`39.md`: complete chapter prose and existing figure specifications.
- `visual_lessons/01.json`–`39.json`: new concrete examples, semantic diagram data, questions and answers.
- `visual_learning.py`: the 13 new vector layouts and numerical validation.
- `build_book.py`: book layout, page units and atlas integration.
- `build_index.py`, `build_all.py`, `verify_book.py`: navigation, reproducible build and automated checks.
- `VISUAL_AUDIT.md`: chapter-by-chapter diagnosis and the teaching change.
- `examples/`: the original executable mini-harness and its 19 tests. These files are preserved from the previous verified revision; the visual expansion does not change that program.

## Rebuild

Install the dependencies in `requirements.txt`, then run:

```sh
python3 build_all.py
```

The build expects Arial and Georgia on macOS, or their licensed font files in a sibling `fonts/` folder. It also expects DejaVuSansMono in that folder or one of the configured system/runtime locations. Font files are not redistributed here. Outputs are written to this folder's parent.

The build creates both PDFs, refreshes the concept index, applies Roman front-matter and Arabic body page labels, validates all text blocks and diagram labels, verifies internal links and checks chapter preservation. A separate visual inspection remains necessary after changing diagram data or renderer code; text extraction is not a replacement for page images.

## Scope and provenance

The 39 chapter manuscripts and the executable example are unchanged from the prior revised learning edition. The visual expansion is dated 17 October 2026; existing source checks remain dated 12-13 October 2026. New records, counts, costs and outcomes are fictional teaching examples, not benchmarks or evidence of deployed systems.

`source_preservation.json`, `quality_report.json`, `atlas_quality_report.json` and `visual_qa_report.json` record the delivered edition's checks. The manuscript keeps paragraphs, code blocks, complete figures, examples and questions as indivisible page units. Whole chapters naturally span pages. Every new visual lab fits on one complete page.

The full book contains the detailed reasoning, code and exercises. The atlas is a companion for visual review, not a substitute for those contracts and limitations.
