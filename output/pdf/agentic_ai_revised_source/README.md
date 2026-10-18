# Agentic AI Engineering — revised learning edition

Editable source for the revised edition of **Agentic AI Engineering: From First Principles to Production**, by **Muhammed Juned Alam**.

## Edit the book

- `chapters/01.md` through `39.md` are the chapter manuscripts.
- `front_matter.md`, `appendices.md` and `author_note.md` contain the surrounding material.
- `:::analogy`, `:::note`, `:::diagram`, `:::check` and `:::exercise` blocks carry the teaching components. Their grammar is documented in `EDITORIAL_CONTRACT.md`.
- Diagram JSON lives beside the explanation it teaches. Artwork is generated as vectors; its lines, colours, labels and geometry remain editable in `build_book.py`.
- Checks and exercises include their answer in the same source block. The renderer places questions in each chapter and generates Appendices F and G from those answers.
- `index_terms.json` preserves the original concept inventory and chapter associations. `build_index.py` regenerates references from the revised PDF. `index_entries.json` and `index.md` are generated outputs.
- `coverage-*.json` records the source-heading mappings and editorial corrections. These are editorial records, not reader-facing instructions.

## Build

Use Python 3.11 or later and the versions in `requirements.txt`:

```bash
python3 -m pip install -r requirements.txt
python3 build_all.py
```

The PDF is written one directory above this folder as `Agentic_AI_Engineering_revised.pdf`. Run the script from any working directory. The build repeats index generation until the chapter page references are stable, then applies Roman front-matter labels and Arabic body labels in the PDF viewer.

The design uses Arial, Georgia and DejaVu Sans Mono. On macOS, Arial and Georgia are read from `/System/Library/Fonts/Supplemental`. For another machine, place legally obtained matching font files in a local `fonts/` folder, or update the font mapping at the beginning of `build_book.py`. Font files are not redistributed in this package. Changing fonts changes pagination; regenerate the index afterward.

For a partial manuscript proof, use `python3 build_book.py --preview`. To see one example of each available diagram form, use `python3 build_book.py --atlas`. These write clearly named proof PDFs and do not replace the final edition.

## Pagination and proofing

`build_book.py` treats each paragraph, analogy, complete code listing, diagram with caption, table or table record, self-check and exercise as an indivisible unit. A heading travels with the next unit. An oversized block fails the build rather than shrinking type or cutting a unit across pages. Refactor that block into complete named units before rebuilding.

`verify_book.py` checks page bounds, duplicate units, source text preservation, diagram text bounds and label collisions. It also checks all 39 chapters and their diagram/question/exercise counts. The publication process additionally renders the PDF and inspects the page images; numerical checks do not replace a visual proof.

`layout_manifest.json` records the final unit positions and page mapping. `quality_report.json` contains machine-check results. `index_match_report.json` identifies references that used a chapter-level fallback rather than a literal matching phrase.

## Runnable example

The `examples/` directory contains the complete Chapter 11 mini-harness and its deterministic checks. Read its local documentation for the commands and exact guarantees. The book's other compact listings are teaching examples or interfaces where stated; the PDF does not claim to be a complete production deployment of every framework shown.

## Edition and preservation

The original supplied 872-page PDF is the editorial reference and is not required for rebuilding this edition. Chapter numbers and the 39-chapter curriculum are retained. Rewritten explanations connect familiar situations to implementation decisions, distinguish facts from authority, and keep the limits of each analogy visible. Framework and protocol references carry the October 2026 edition context.
