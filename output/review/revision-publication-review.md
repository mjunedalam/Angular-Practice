# Publication pipeline review

No material publication regression found in the reviewed changes.

Scope: read-only source comparison against `tmp/pdfs/agentic-revision-baseline/Agentic_AI_Engineering_complete_source.zip`; reviewed `pdf_semantics.py`, `analytical_figures.py`, `build_all.py`, `build_book.py` integration and `verify_book.py`. No full build or source edits performed.

Evidence:

- Vector directions normalize coordinates consistently with the unit-circle axes. The current chapter 12 fixture produces cosine values 0.8, 0.6 and -1.0. Point IDs are now A/B/C; the next full build must include this source revision.
- Ranking computation uses binary DCG, an ideal ranking bounded by both k and total relevant items, and reciprocal rank within the stated cutoff. Independent standard-library arithmetic confirms nDCG@3 = 0.5307212739772434 for the printed example, matching 0.531; recall is 2/3 and reciprocal rank is 1/2.
- The tag writer connects page MCIDs to structure elements and page ParentTree arrays; annotation StructParent keys occupy a disjoint range after all page keys. Link annotations receive OBJR relationships. Standard roles are used. Running page furniture is marked Artifact. This is a basic flat structure, with explicit linear table alternatives and no PDF/UA certification claim.
- The companion ZIP includes examples, pinned requirements, guides and chapter files needed by exact-snippet tests, excludes bytecode caches, and is byte-for-byte checked after PDF attachment round trip. Reviewed example filesystem accesses require only these packaged locations or temporary databases.
- Chapter freshness verification now compares the actual build manifest hashes to current chapter sources, allowing intentional manuscript revisions while detecting stale output. Existing label extraction, bounds, overlaps, chapter sequence, visual-source hashes, cover order and internal destination checks remain.

Verification limits (not newly introduced release blockers): the text-preservation check compares rendered units with extraction, so it is not an independent proof that every manuscript sentence entered the parser. `check_structure` validates expected MCIDs, page references and figure alternatives; it does not certify heading hierarchy or assistive-reader behavior. The supplied parent-task result reports a successful 890-page first build and structure checks; this review did not independently rerun those checks because the default Python lacks ReportLab/pypdf. The known system pdftotext bbox crash also occurs on baseline and is not treated as a regression.
