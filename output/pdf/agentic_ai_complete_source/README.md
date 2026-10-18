# Agentic AI Engineering - complete illustrated edition

Publication review candidate **1.0-rc.1**, prepared 17 October 2026. No public release date is asserted. The complete book is `../Agentic_AI_Engineering_complete.pdf`: **894 pages, 39 chapters, 287 visuals**, including 117 visual labs and both selected covers. One complete book; no separate visual atlas is required.

## Rebuild

Use Python with ReportLab, pypdf and Pillow available. From this directory:

```sh
python3 build_all.py
```

The build regenerates the index until pagination stabilizes, applies page labels and reading-order tags, embeds the companion, exports an identical standalone companion ZIP and runs layout/link checks. `python3 verify_book.py` reruns publication checks. Poppler rendering and word-box QA are separate. The requirements and font files are included.

## Editable material

- `chapters/`, `front_matter.md`, `appendices.md`, `author_note.md`: manuscript; the latter contains corrections and updates, not a biography.
- `visual_lessons/`, `research_lessons/`: 117 integrated labs and source references.
- `build_book.py`, `visual_learning.py`, `edition_design.py`, `analytical_figures.py`: typography, layout, editable vector figures and maps.
- `assets/`, `fonts/`, `ARTWORK_PROVENANCE.md`, `COVER_DESIGN_PROMPTS.md`: selected covers, font notices and provenance.
- `examples/`: labs, isolated dependency guides and tests.
- `publication.json`, `CHANGELOG.md`, `ERRATA.md`, `LICENSE_STATUS.txt`: candidate identity, changes, corrections and pending code terms.
- `publication_review/`: scoped AI-assisted audits, detailed human-review handoff, feedback templates and evidence.
- `final_release_report.json`, `quality_report.json`, `bbox_report.json`, `example_verification.json`: current verification results.

The final embedded companion was freshly extracted; all **61 tests passed, zero skipped**. Its 60 source/metadata files matched the source and its ZIP matched the standalone download. All 55 Python chapter blocks parse. All prior chapter headings and custom diagram/check/exercise blocks are preserved. See CHANGELOG.md for new RRF and capstone timing repairs and localized corrections.

The author biography is omitted and technical references retained. Corrections: juned.alam.dev@gmail.com. Independent human technical review, professional copyediting, reader testing, code-licence selection and final rights confirmation remain pending. No reviewers were contacted and no public submission occurred.

Each paragraph, code unit, analogy card, exercise, diagram/caption and full-page lab stays together. Longer sections continue at block boundaries. Automated layout/link and whole-PDF word-box checks report zero issues; representative changed pages were rendered and inspected. This is a reading edition, not printer-specific artwork with spine, bleed or color-production settings.

The PDF contains a logical structure tree, headings, figure descriptions and linear table alternatives. Basic consistency passes; PDF/UA and assistive-reader interoperability are not certified. Real local MCP, OpenTelemetry, SQLite and LangGraph paths were exercised; external services/models are fixtures. No live Temporal server or PostgreSQL deployment was tested. The Homebrew pdftotext executable on this host crashes on the baseline too; the working bundled Poppler was used for QA.
