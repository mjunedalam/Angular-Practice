# Work Log

Running log of what was actually done, session by session. Newest entry at the bottom — append, don't rewrite history.

---

## 2026-09-03 (Thursday)

**IR editor — loading states, unsaved-changes guard, rich remarks fields**

- Added `unsaved-changes.guard.ts` (`CanDeactivateFn`) so navigating away from the wwell-ir
  master-detail page with unsaved edits (an open section, an unsaved "New IR" draft) prompts
  Save / Discard / Stay instead of silently discarding — `WwellIrComponent.canDeactivate()` is the
  reference implementation.
- Added `wwell-ir-editor-loading` (skeleton component) and a `wwell-detail-loading` cleanup, plus
  new loading-delay constants (`wwell-planning-loading.constants.ts`) so save/update/delete round
  trips show a deliberate skeleton instead of a layout jump.
- Added `WwellRichTextareaComponent` — a "dropdown + big textarea" control for the IR Program
  Details remarks fields (Acidization, Transmission, Logging, Mud Logging, Sampling, Flow Test,
  Development/Testing), which carry long multi-line legacy remarks that a plain `<select>` can't
  hold.
- Reworked `wwell-ir.store.ts`, `wwell-ir-editor.component.ts`, `wwell-ir-section-edit.util.ts`,
  and `wwell-ir-detail-response.mapper.ts` around per-section edit/save state.
- First cut of the geologist name→id stopgap in `wwell-planning-reference-data.config.ts`
  (`WWELL_GEOLOGIST_ID_BY_NAME`) — later replaced entirely, see 2026-09-06.
- Captured several real backend proc signatures under `docs/ir/` (`get_gwd_ops_member_prc.sql`,
  `get_wf_next_id_fnc.sql`, `update_ir_sap_wf_prc.sql`, `error.sql`) and a large `update_ir_data_prc.sql`
  refresh.

**Later the same day:** extended `wwell-ir-view-well-design` with an editable view, adjusted
`wwell-ir-form.schema.ts`/`wwell-ir-payload.mapper.ts`/`wwell-ir-payload.model.ts` for the header
row's fuller field set, and expanded `wwell-ir-payload.mapper.spec.ts` coverage.

Also asked (no code change): how to bump a package's pinned version given `npm dist-tags` showing
a newer release than package.json has, and why an `overrides` entry (e.g. `js-yaml: 4.3.0`) might
be pinned below the latest dist-tag rather than just tracking `latest`.

---

## 2026-09-06

**GWD ops members → Geologist Contact dropdown, end to end**

- Backend (`~/Downloads/Misc/agwa-planning`, not the `code-with-quarkus 3` scaffold):
  `04-agwa-queries-package.sql`'s local dev mock for `get_gwd_ops_member_prc` returned only 3 fake
  rows (`emp_id`/`emp_name`/`job_title`). Replaced it with two real rows (Meshari Abu Rashid, Nawaf
  Alansari) using the full production column set (`FULL_NAME`, `EMPNUM`, `EMP_EMAIL`, `TELEPHONE`,
  etc.), captured from an actual `/planning/api/v1/gwd-ops-members` response. Applied live via
  `sqlplus` against the already-running Oracle container (no volume recreation needed) and verified
  by invoking the procedure directly.
- Frontend — wired the Geologist Contact "Primary"/"Secondary" pickers to that endpoint, following
  the existing "Link to Request" live-Signal pattern instead of a new one:
  - `wwell-ir-payload.model.ts` — added `GwdOpsMember`/`GwdOpsMemberRaw` + mapper.
  - `wwell-ir.service.ts` — `getGwdOpsMembers()`.
  - `wwell-ir.state.ts` / `wwell-ir.store.ts` — state, `loadGwdOpsMembers()`, and a
    `geologistOptions` computed (FULL_NAME list) shared by both dropdowns.
  - `wwell-ir-form.schema.ts` / `wwell-ir-editor.component.ts` / `wwell-ir.component.ts` — schema
    wiring and load-once-at-init.
  - Removed the now-dead static `WWELL_GEOLOGIST_OPTIONS` list.
- **Bug found and fixed while wiring the save path:** the existing "TEMPORARY stopgap"
  (`WWELL_GEOLOGIST_ID_BY_NAME`, added 2026-09-03) claimed
  `exad_gwd_ir_header.cont_geologist`/`sub_cont_geologist` were `NUMBER(3)`, too small for a real
  employee number, and mapped display names to small fabricated ids instead. Checked the actual
  schema (`01-schema.sql`) and the authoritative `docs/ir/EXAD_GWD_IR_HEADER.md` — the column is
  really `NUMBER(8)`, which fits a real `EMPNUM` fine. Removed the stopgap map entirely and replaced
  it with a live `FULL_NAME → EMPNUM` map (`WwellIrStore.geologistEmpNumByName`, sourced from the
  same GWD ops members fetch) threaded through `WwellIrSaveContext` into
  `buildWwellIrBulkSavePayload`, so a save now persists the geologist's real EMPNUM.
- Verified throughout: `tsc --noEmit` clean, ESLint clean, all 37 `wwell-ir` Jest tests passing
  (fixed 2 that broke from the store-mock missing the new signals).

**Later the same day: IR letter → PDF, rendered server-side (Qute + openhtmltopdf)**

User shared screenshots of the legacy JasperReports "Integrated Requirements" letter template
(GWD letterhead, Well Location table, Area Water Well table, approval sign-off table, CC/Letterbook
footer) and asked for a matching downloadable PDF, backend-driven, built in
`~/Downloads/Misc/agwa-planning` (chosen over `code-with-quarkus 3` since agwa-planning already
owns the full IR REST API/DB — `code-with-quarkus 3` has no IR domain classes at all, only an
untyped JSON passthrough in its unrelated morning-report feature).

- **Backend** (agwa-planning): new `GET /planning/api/v1/integrated-requirements/{irSeq}/letter-pdf`
  on `IntegratedRequirementResource`, backed by:
  - `service/IrLetterService.java` — reuses the existing `getByIrSeq()` detail call (same
    `{table,data}` blocks the JSON detail endpoint already returns) rather than a new mapper/proc.
    Resolves the geologist name via the existing GWD ops-members lookup, the approver name/title
    via `publish_by`/`publish_flg`/`publish_dt` matched against ops-members by `NETWORK_ID`, and
    "generated by" via the requesting user's own JWT identity.
  - `template/IrLetterTemplate.java` + `templates/irLetter.html` — a Qute HTML template (first one
    in this project; mirrors `code-with-quarkus 3`'s `mr.html` convention). CSS lives inside a
    Qute `{| ... |}` unparsed block — plain `<style>{...}</style>` breaks Qute's parser, which
    otherwise tries to read literal CSS curly braces as expressions.
  - `pdf/HtmlToPdfRenderer.java` — new `openhtmltopdf-core`/`openhtmltopdf-pdfbox:1.0.10`
    dependency (nothing pre-existing did HTML→PDF in either backend). **Real bug hit and fixed:**
    those artifacts need `pdfbox`+`fontbox` on the same version (2.0.24), but something deeper in
    the Quarkus/Camel dependency graph pulls in `fontbox:3.0.4`, which Maven's nearest-wins
    mediation picked over the matching 2.0.24 — threw
    `NoSuchMethodError: TTFParser.parse(InputStream)` at PDF-render time. Fixed with an explicit
    `fontbox:2.0.24` entry in `<dependencyManagement>`.
  - `util/LegacyIrTextUtil.java` — Java port of the Angular `stripLegacyIrHtml` (regex-based, not a
    DOMParser port) for the header's legacy `<HTML>...</HTML>`-dump remarks columns.
  - `planning.letter.division-head-name` config property — no "division head" sign-off column
    exists anywhere in this schema, so that one field is a configurable placeholder rather than
    invented data, consistent with how this project has always flagged genuine gaps.
  - Adding the new dependency killed the running `quarkus:dev` process (a pom.xml dependency change
    can't hot-swap into a live JVM's classpath, only a full restart can) — restarted it, then
    verified the endpoint live via `curl` with the shared mock JWT: real 2-page PDF,
    `application/pdf`, correct data pulled from IR-9006.
- **Frontend**: `wwell-ir.service.ts` gained `downloadLetterPdf(irSeq)` (blob GET); the existing
  `WwellIrViewLetterComponent` (the client-side-only "Letter" tab) got a "Download PDF" toolbar
  button that calls it and saves the blob via a synthetic `<a download>` click.
- Verified live end-to-end via gstack browse (mock JWT injected into `localStorage['agwa_token']`
  to get past the SSO login wall): clicked into IR-9006 → Letter tab → Download PDF, confirmed a
  real `GET .../9006/letter-pdf → 200` network call and zero console errors. Also confirmed
  `tsc --noEmit`, `ng lint`, and all 37 `wwell-ir` Jest tests clean (no new tests added, per the
  standing "skip new tests during wwell-ir redesign" direction).

**Later still: rich test IR + wellbore diagram, Casing Program table, and an APPROVED/REJECTED/PENDING
status stamp on the letter PDF (backend-only, agwa-planning)**

User asked for one new, richly-populated IR test record (3+ formation tops, 5 casing rows, full
Program Details/Hydrogeology), then — after sharing a real production-rendered example of this
letter (an Outlook email stamped "APPROVED") — pointed out the wellbore/casing diagram was entirely
missing from the downloaded PDF, and asked for the letter's look to be brought in line with that
reference: bigger sans-serif font, bold in more places, and a visible APPROVED/REJECTED/PENDING
status indicator.

- Created IR-9022 via the bulk-save POST. Hit `ORA-01400` on `st_long_cd` — Oracle's `JSON_TABLE`
  silently returns `NULL` (not an error) when a JSON string value overflows a declared
  `VARCHAR2(10)` column, so a full aquifer name ("Umm Er Radhuma") got silently dropped and then
  failed the NOT NULL check downstream. Fixed by using the short formation codes from
  `WWELL_IR_FORMATION_OPTIONS` instead of full names.
- `sap_wf_id`/`sap_wf_status` (added 2026-09-03 for the SAP workflow PATCH) were being written but
  never read back — added both to `get_ir_data_prc`'s header projection and reapplied live.
  Stamped IR-9022 → APPROVED, IR-9006 → REJECTED, left IR-9004 unstamped to exercise the
  `publish_flg`-derived PENDING fallback.
- New `pdf/WellboreDiagramBuilder.java` — pure Java geometry (parses casing sizes like `12 5/8"`,
  depth-scales everything into a fixed-size box) producing plain data records that
  `IrLetterData`/`irLetter.html` render as absolutely-positioned CSS div rectangles/dashed
  lines/labels — deliberately not embedded SVG, to avoid a second Batik-dependency version-conflict
  risk on top of the one already hit with pdfbox/fontbox. Casing rows are emitted widest-first so
  normal DOM paint order alone produces the correct telescoping-pipe look (no z-index needed).
- Added a real "Casing Program:" table (Type/Size/Depth/Remarks) — the reference photo showed this
  section actually renders as a table in production, correcting an earlier read of the original
  cropped JRXML screenshot. Casing rows are now sorted by depth ascending for a top-down read.
- Restyled `irLetter.html`: sans-serif font stack at a larger base size (was Times New Roman
  10.5pt), section headings now italic/underlined/navy (were plain bold black), table headers now
  navy with white text (were light grey). Bolded the well name once in a reworded intro sentence,
  rather than string-matching/re-injecting markup into the free-text `gen_remarks` field.
- **Real bug caught by actually rendering and viewing the PDF pages, not just checking HTTP 200:**
  the wellbore diagram was getting split mid-box across a page break on first render. Fixed with
  `page-break-inside: avoid` on its container — works even with absolutely-positioned children,
  since the container's own box is still subject to normal page-break flow-fitting.
- Verified live across all three status paths (IR-9022 APPROVED, IR-9006 REJECTED, IR-9004 PENDING
  fallback) by actually reading the rendered PDF pages — installed `pypdf` to split multi-page PDFs
  since no PDF/image CLI tool (poppler, ImageMagick, pdftk, qpdf) is installed on this Mac; macOS's
  built-in `sips -s format png` rasterizes whichever single page it's given. Confirmed correct stamp
  color/label, correct diagram geometry on both a 5-casing and a 2-casing record, and the page-break
  fix holding in all three.

**Later still: swapped PDF engine to iText, and the wellbore diagram is now a real UI snapshot**

User feedback: the CSS-div wellbore schematic "not look good"; asked to switch the backend's PDF
library to iText for "more features", and pointed out the app already has a much richer D3/SVG
wellbore diagram (the same one on the Well Design tab, already shown in the Letter tab's own
"3. Well Bore Diagram" section) that should be rendered in the UI and snapshotted into the report
instead of a server-side redraw. Also asked that tables and the diagram never split across a page.

- **Backend** (agwa-planning): swapped `openhtmltopdf` for iText's pdfHTML add-on
  (`com.itextpdf:html2pdf:6.3.3` — confirmed via research before implementing, including that it
  supports the CSS Fragmentation `break-inside`/`page-break-inside: avoid` properties more reliably
  than openhtmltopdf did). User was told upfront that iText defaults to AGPL v3 licensing (vs.
  openhtmltopdf's more permissive one) and chose to proceed; also chose an engine-only swap (keep
  the existing Qute+CSS template) over a full native iText rewrite. `WellboreDiagramBuilder.java`
  (the CSS-div geometry builder) is deleted entirely — the diagram is now a client-captured PNG
  embedded via a plain `<img>` tag. The letter endpoint changed from `GET` to `POST` since the
  image now rides along in the request body.
  - Real bug: with no custom font config, pdfHTML doesn't reliably fall back to a sans-serif look
    from generic CSS keywords the way a browser does — it silently rendered everything in a serif
    face. Fixed by leading every font stack with the literal name `Helvetica` (one of iText's
    built-in standard fonts, always available).
- **Frontend**: added a `wwell-ir-wellbore-snapshot.util.ts` that captures the Letter tab's already
  -rendered depth-scale + wellbore SVGs into one PNG (canvas composite), sent as base64 in the
  Download PDF request. Two real bugs found via live testing, not just type-checking: (1) a nested
  icon `<svg>` inside the diagram was wrongly captured as a third panel — fixed by only capturing
  SVGs with no `<svg>` ancestor; (2) the D3-rendered "TOTAL DEPTH: 0 FT" label (meant to stay hidden
  when there's no target depth) was leaking into the capture because the CSS property that hides it
  (`display: none`) wasn't in the snapshot's inlined-style property list — fixed by adding it.
  Documented, accepted limitation: a capture taken within ~1-2s of the tab first mounting can catch
  the diagram's one-time entrance animation mid-flight; not fixed (would touch every renderer file
  for an edge case unlikely to matter in practice).
- Verified live end-to-end via gstack browse: real Download PDF click → network log confirmed a
  ~236KB POST response (vs. ~6-7KB before, proving a real image rode along); since gstack can't
  retrieve a browser-triggered blob download directly, closed the loop by running the identical
  capture-then-POST logic inside the live page's own JS context and writing the PDF response
  straight to disk — byte-identical size to the real click. Read the resulting PDF pages directly:
  the actual live-rendered wellbore diagram (gradient casing pipes, static water level, geologic
  horizon ticks, leader-line labels) appears exactly as shown on-screen, ghost label gone. Backend
  `test-compile` and frontend `tsc`/`eslint`/all 37 `wwell-ir` Jest tests clean throughout.

## 2026-09-08

### IR attachments: two real, uploadable slots that become letter PDF pages

Split the IR editor's `7.0 Attachments` section into two named sub-sections — **7.1 Location Map**
(icon `map`, optional) and **7.2 Initiation Request** (icon `assignment`, required) — and made them
real stored files that get appended to the downloaded letter PDF as trailing pages.

- **The gap this closed**: `attachmentNames` was filename-only *everywhere* in the app — the shared
  `WwellAttachmentDropzoneComponent` (also used by wwell-requests / land-affairs / wlda) only ever
  held `File` objects in browser memory, and `wwell-ir.service.ts` documented that the backend has
  no column for them and would 415 if sent. Nothing was ever persisted, so nothing survived a
  reload and the letter PDF could only ever print names. The form schema had *always* described the
  two slots (`wwell-ir-form.schema.ts`, with a comment naming "7.0 Location Map / 8.0 Initiation
  Request"), but the rail merged them into one entry because there was no persisted way to tell
  which name came from which slot. Per-slot storage is what finally made that split real.
- **Backend (agwa-planning)**: new `IrAttachmentStorageService` stores files at
  `<root>/ir-<irSeq>/<slot>/<sanitized-name>`, root from `planning.ir.attachments.dir` defaulting to
  `<user.home>/.agwa-planning/ir-attachments`. Built with `java.nio.Path` throughout so separators
  are correct on macOS and Windows with no branching. The config property is `Optional<String>`, not
  a defaulted String — SmallRye *fails* the conversion on a blank value rather than treating it as
  absent (found by the dev server refusing to restart). Slot is an enum, never a raw path segment.
  Validation: extension allowlist (pdf/jpg/png), **magic-byte sniff** (extension alone is trivially
  spoofed and these bytes are fed straight to iText), 25 MB cap, filename reduced to its basename
  with separators/`:`/control chars stripped. Writes land in the destination dir first, then
  `ATOMIC_MOVE`, so a reader sees the old file or the new one, never a partial copy.
  Four endpoints on `IntegratedRequirementResource` (upload/list/download/delete).
- **PDF**: new `IrAttachmentPdfAppender` merges via the iText kernel that `html2pdf` already pulls
  in — **no new dependency**. PDF attachments contribute their pages verbatim; images get one
  captioned A4 page. A corrupt attachment is logged and skipped rather than failing the whole
  download — the same tolerance the wellbore snapshot already gets. (`Paragraph.setBold()` doesn't
  exist in this iText version; used `StandardFonts.HELVETICA_BOLD` instead.)
- **Frontend**: `attachmentNames: string[]` removed from the domain model in favour of
  `attachments: IrAttachment[]`, loaded per ir_seq by its own endpoint alongside the approval
  timeline (it can't ride in the detail blocks). Deliberately not optimistic — only the server knows
  whether the format passed validation. `busyAttachmentSlot` is a slot, not a boolean, so one slot
  uploading doesn't freeze the other. Uploads need a persisted ir_seq, so a never-saved draft shows
  "Save the integrated requirement before attaching files." The rail's single 7.0 leaf became two
  children; the existing "one section anchor per leaf" test is what guards that alignment.
- **Verified live, not just statically**: real upload through the browser UI → `POST .../attachments/
  location-map` 200 → slot re-rendered with name/size/actions → `POST .../letter-pdf` returned
  **4 pages** (3 letter + 1 appended) with `pdftotext` confirming the "Location Map" caption on page
  4; delete through the UI returned 200 and reverted the slot to its dropzone. Also confirmed by
  curl that a `.txt`, a text file renamed `.pdf`, and a `../../../evil.png` filename are all
  rejected or sanitized (the traversal name landed as `evil.png` *inside* its slot dir). Build,
  `eslint`, and all 434 Jest tests clean. Test uploads cleaned off disk afterward.

## 2026-09-10

### IR letter PDF: Horizons / Formation Tops was silently dropped

Traced a "the formation tops are missing from the downloaded PDF" report to the gap: `get_ir_data_prc`
already fetches `exad_gwd_ir_tops` (per-horizon name + TVD depth + sub-sea depth, saved by the
Angular form's `formationTops` section into `exad_gwd_ir_tops` via `buildTopsRows` in
`wwell-ir-payload.mapper.ts`), but `IrLetterDataAssembler` (agwa-planning) never read that block —
only the header's free-text `tops_remarks` note surfaced, buried as one row inside "Program Details"
well after Casing Program.

- **Backend (agwa-planning)**: added `IrLetterData.TopsRow(name, tvdDepthFt, ssDepthFt)` +
  `topsRows` field/builder wiring, and `IrLetterDataAssembler.buildTopsRows` — reads
  `exad_gwd_ir_tops`, sorts by `plan_tvd_dpth` (shallowest first, mirroring how casing rows sort by
  `csg_depth`), maps `st_long_cd`/`plan_tvd_dpth`/`plan_ss_dpth` straight through `orDash`.
- **Template (`irLetter.html`)**: new "Horizons / Formation Tops:" section (`data-table
  keep-together`, same pattern as Casing Program including the `{#else}` "No formation tops
  recorded." fallback) inserted between Well Location and Casing Program per the user's explicit
  placement request, with the existing `tops_remarks` rendered as a `Remarks:` line under the table.
  Removed the now-redundant "Formation Tops" row from the Program Details spec-table (user confirmed
  dedup) and renumbered the trailing `Table N.` captions (Casing Program 2→3, Area Water Wells 3→4,
  Approval 4→5).
- Scoped as a bounded fix via the brainstorming skill — user explicitly declined broader "enterprise
  ready" polish for this pass (letterhead/stamp/pagination were already judged sufficient) and asked
  to scope future asks with concrete pain points instead.
- No existing Java tests cover `IrLetterDataAssembler`/`IrLetterData` (not even the `CasingRow`
  pattern this mirrors), so none were added — verified via `mvn -q -o compile` only (clean build,
  agwa-planning's `quarkus:dev` was live so `clean` was avoided per prior incident).

## 2026-09-15

### IR "Submit for Review" → SAP AAE workflow trigger, end to end

Wired the wwell-ir Submit for Review button to SAP AAE's workflow engine, in the exact order the
flow requires: **mint workflow id → call SAP /trigger → only on SAP success, stamp the IR header.**

- **`SapService`** (`core/services/sap/`) posts `POST {sapServiceUrl}/trigger?native_response=false`.
  The three `HttpContext` opt-outs on that call are load-bearing, each for a failure reproduced
  live: `SKIP_AUTH` (authInterceptor was attaching AGWA's own JWT to an external host — captured on
  the wire), `SKIP_AUTO_LOGOUT` (errorInterceptor treats any 401 as session expiry, so one SAP 401
  signed the user out of AGWA mid-submit *and*, returning `EMPTY`, stopped the store's own error
  handler from ever running — spinner stuck, id unrecorded), and `SUPPRESS_GLOBAL_ERROR` (the store
  raises its own toast). Regression test in `sap.service.spec.ts` asserts all three.
- **`WwellIrStore.submitIrForReview`** runs the three steps. A SAP failure surfaces
  `sapTriggerError` and leaves the header untouched — the PATCH is never reached. Removed the old
  `submitIrForReview()` service call: it POSTed to an endpoint that never existed (404) behind a
  `catchError` that fabricated success, so the status was never actually persisted.
- **agwa-planning**: `GET /planning/api/v1/sap-workflow/next-id` (new — wraps `get_wf_next_id_fnc`,
  added to `EXAD_AGWA_QUERIES_PKG`). The `PATCH .../integrated-requirements/{irSeq}/sap-workflow`
  already existed and wraps `update_ir_sap_wf_prc`.
- **New standalone service `sap-service`** (`~/Downloads/Misc/sap-service`, Quarkus 3 / Java 21,
  port 9090) mocks SAP's `/trigger` contract: 200 `{"message":"Agents were successfully resolved"}`
  and pydantic-shaped 422 `detail[]`. Deliberately separate from agwa-planning — it is a test
  double, not part of the product — and deliberately unauthenticated, because the real call carries
  no AGWA token either. 4 tests green. Point `sapServiceUrl` back at the real host when on the
  corporate network; no code change needed.

**Why the mock exists:** `sap-dev.apps.ocpb.enp.aramco.com.sa` is NXDOMAIN off the Aramco network
(so is `eccenterprisegis...`), so the reported "error on Submit for Review" was environmental. That
investigation is what surfaced the two interceptor bugs above.

**Verified live through the UI**, not just statically: `next-id` 200 → `POST :9090/trigger` 200 →
`PATCH .../9006/sap-workflow` 200, with `exad_gwd_ir_header` confirming `sap_wf_id=9053`,
`sap_wf_status=SUBMITTED` and the mock's log confirming it received `ALAMMX1O_IRA_9053`. The failure
path was proved by pointing `sapServiceUrl` at a dead port: SAP call refused → **no PATCH fired**,
session survived, button re-enabled, error toast raised. Config restored byte-identical after.

**Known gaps (not fixed):**
- The list read still derives IR status from `publish_flg` alone (`wwell-ir-summary.mapper.ts`);
  nothing reads `sap_wf_status`, so the submitted status reverts on refresh.
- `sap_wf_id` is a `NUMBER` column and `update_ir_sap_wf_prc` takes `p_wf_id IN NUMBER`, so only the
  sequence (`9053`) is stored — the composite `ALAMMX1O_IRA_9053` sent to SAP is reconstructed from
  network id + scenario + seq, never persisted whole.
- `get_wf_next_id_fnc` shares `exad_gwd_sq01` with `ir_seq`, so ids come out as `..._9053`, not the
  short `..._0006` in the spec screenshot. Matches the proc as supplied.
- A network-level SAP failure toasts the browser's raw "Failed to fetch" rather than the store's
  "Failed to trigger the SAP review workflow" default.

### Submit for Review gave no feedback on success

Follow-up on the same flow: clicking Submit for Review looked like it did nothing. The whole
three-step flow completes in ~200ms locally, and its only visible trace was the button quietly
disappearing (status leaves `WWELL_IR_SUBMITTABLE_STATUSES`, so `canSubmitForReview` drops it).

- **Success toast** (`wwell-ir.component.ts`) — new settled-edge effect on `updatingIrStatus`,
  mirroring the existing `creatingIr` save effect exactly, including its "skip when the error slot
  is set" guard so a failure never double-reports. Toasts `"IR-9006 submitted for review."`.
- **Loader**: the editor footer's button spinner was already correct — measured live at 11ms→221ms
  before the button is removed, so it works and is simply too fast to notice against a local mock.
  Left as-is rather than adding an artificial minimum duration. The *read-only view's* "Request
  Approval" button, however, only swapped its label to "Submitting…" with no spinner — brought in
  line with the editor (`mat-spinner` replacing the `send` icon, `MatProgressSpinnerModule` added).
- **`errorMessage` fallback bug** (`wwell-ir.store.ts`): a refused connection arrives as an
  `HttpErrorResponse` with `status: 0` whose `error` is the transport's own `TypeError`, so the
  helper's "prefer the backend's `{ message }`" branch surfaced `"Failed to fetch"` verbatim as if
  it were a server message. Now returns the caller's own copy for `status === 0`. Affects every
  toast this store raises, not just SAP. Covered by a new store test (TDD: RED then GREEN).

**Method note:** my first measurement said the spinner was stuck on for 4s+ after a fully successful
submit. That was a false positive — I had captured the button node before clicking, and it is
*detached* on success (`document.contains(...) === false`), freezing its last state. A second
attempt then reported the button vanishing at 16ms, also wrong: the live-query selector matched on
the `send` icon's text, which the spinner *replaces*. Only the third measurement (live query on
`footer.ire__footer button`, matching the label alone) was sound. Worth remembering — a captured
node and a text selector that overlaps the state being measured both lie confidently.

Verified live end to end after the change: spinner visible, `"IR-9006 submitted for review."` on
success with all three calls 200; against a dead port, only `"Failed to trigger the SAP review
workflow"` and **no PATCH**. Config restored byte-identical. Lint clean, 452/452 Jest tests pass.

### `workflow_id` stopped carrying the network id/scenario suffix

Per request, `SapTriggerRequest.workflow_id` now sends the raw minted seq as-is (`String(seq)`,
e.g. `"6"`) instead of the composite `{NETWORK_ID}_IRA_{seq}` string. Removed
`buildSapWorkflowId`/`WWELL_IR_SAP_WF_SEQ_PAD_LENGTH` from `wwell-ir-sap.config.ts` entirely —
`triggerSapWorkflow` (`wwell-ir.store.ts`) just passes `workflow_id: String(seq)`.
`initiator_network_id`/`requester_network_id` are unaffected, still the plain network id.

### Approval Workflow sidebar wired to real SAP `GET /display`, mock chain removed

The IR "Approval Workflow" sidebar (`wwell-ir.component.html`) previously rendered a client-side
mock chain (`wwell-ir-chain.mock.ts`, picked deterministically off `irSeq`) behind a "Mocked" chip.
Replaced end to end with SAP AAE's real `GET /display?process_id=1406&wf_obj_id={sap_wf_id}`.

- **`sap-service` mock** (`~/Downloads/Misc/sap-service`): new `SapDisplayResource` (`GET /display`)
  alongside the existing `/trigger`. Deterministic per `wf_obj_id` (hashed mod 4, same "stable
  across re-fetches" reasoning as the mock chain it replaces) across a fixed three-level
  "Geological Operations" chain (Initiator → Lead Geologist → Manager Ground Water); missing
  `process_id`/`wf_obj_id` → 422 in the same `SapValidationError` shape `/trigger` already uses.
  New DTOs `SapWorkflowHeader`/`SapRemark`/`SapApprovalStep`/`SapWorkflowStatusResponse`. 5 new
  tests (9/9 green), README updated with the new contract.
- **`SapService.getWorkflowStatus(processId, wfObjId)`** (Angular) — same three cross-origin
  `HttpContext` opt-outs as `trigger()` (SKIP_AUTH/SKIP_AUTO_LOGOUT/SUPPRESS_GLOBAL_ERROR), now
  shared via a `sapContext` getter. New model `sap-workflow-status.model.ts`.
- **`IntegratedRequirement.sapWfId`** (new field) — the detail GET's `exad_gwd_ir_header` block
  already carried `sap_wf_id`/`sap_wf_status` in its JSON (`get_ir_data_prc`); only the Angular side
  was never reading it. Now flows through `IrHeaderRow` → `mergeIrDetailBlocksIntoIntegratedRequirement`.
  The list endpoint doesn't have it (`sapWfId: null` default in `wwell-ir-summary.mapper.ts`), so
  it's only known after a selection's detail fetch resolves one.
- **`WwellIrStore.loadIrApprovalTimeline`** reshaped from `rxMethod<number>` (irSeq) to
  `rxMethod<{irSeq, sapWfId}>`, called internally — from `loadIrDetail`'s and `createIr`'s success
  handlers once `sapWfId` is known, and again from `triggerSapWorkflow`'s success so the sidebar
  updates immediately after a submit instead of waiting for a reselect. No longer a public store
  method. `sapWfId === null` short-circuits (no SAP call, chain left untouched — it still backs
  `chainBorderColor`'s accent strip in edit mode, not only the view-mode sidebar).
- **`wwell-ir-approval.mapper.ts`** (new) maps SAP's `approval_chain` onto the existing
  `ApprovalChainStep[]` shape the shared `app-wwell-approval-timeline` renderer already knows how to
  draw. Status heuristic (SAP's exact semantics aren't documented to us): a level with a real
  `response` is approved/rejected (rejection = case-insensitive "reject" match); the *last* level
  with a real `received_date` but no response is `in-progress` (currently awaiting action); earlier
  such levels (e.g. the Initiator's own receipt) read as `approved` (already passed); unreached
  levels are `pending`. 7 mapper tests cover just-initiated / mid-chain / fully-approved / rejected /
  date-fallback cases.
- Removed `wwell-ir-chain.mock.ts` and the "Mocked" chip entirely. Sidebar now shows "Not yet
  submitted for review." (timeline hidden) when `sapWfId` is null, "Loading status…" while the SAP
  call is in flight, and the real per-level chain otherwise.

16 new/updated store tests, 60 wwell-ir + sap tests green, 465/465 full Jest suite green, lint
clean, production build clean.

## 2026-09-20

### wwell-ir editor — Attachments card showed the old doc name after Replace

- **Symptom:** on 7.1/7.2, picking a replacement via the swap icon left the row showing the *old*
  file's name, size and type icon (with the "not uploaded yet" note), while View opened the new file.
- **Root cause:** `wwell-ir-editor.component.html` resolved name/size/icon with
  `stored ? stored.X : pending!.X`. On Replace both exist until the upload lands, so the stored
  (old) record always won — the reverse of `viewAttachment`/`removeAttachment`, which prefer the
  staged file. Backend was fine (`IrAttachmentStorageService.store` clears the slot and returns the
  new name); the post-upload path was fine too (`withAttachment` swaps the slot's record).
- **Fix:** the three expressions now prefer `pending` over `stored`. Template-only change.
- Existing wwell-ir Jest suites green (63 tests); `ngc --noEmit` on the app config clean. No new
  specs, per the standing "defer spec coverage during the wwell-ir redesign" call. Not reproduced in
  a live browser (dev server/backend weren't running).

### wwell-ir 1.0 Wellbore Details — Target Aquifer is now a read-only field

- `wwell-ir-form.schema.ts`: `targetAquifer` changed from a required `select` (formation options) to a
  read-only `text` field with the same `placeholder: 'auto'` + hint as Target Depth. `required` dropped
  — a permanently-disabled control is excluded from validity, so it would be dead weight.
- `wwell-ir-editor.component.ts` (`applyLinkedRequestWell`): removed the `setLinkedFieldLock(...,
  'targetAquifer', ...)` call (it `.enable()`d the control whenever the linked well had no aquifer,
  which would have made the read-only field editable again), and the field is now blanked when the
  newly-linked well supplies none, so a previous link's value can't linger un-clearable.
- Known limit, unchanged: the value only comes from the eligible-wells list (`target_form`), which
  can't resolve an already-saved IR's link, and `exad_gwd_ir_header` has no column for it — so a saved
  IR reloads with Target Aquifer blank. Previously a hand-picked value reverted after save anyway.
- `ngc --noEmit`, eslint on both files, and the wwell-planning Jest suites (67 tests) all pass. Not
  checked in a live browser.

### Comment cleanup

- Removed every comment (170 in `wwell-ir-editor.component.ts`, 55 in `wwell-ir-form.schema.ts`) using the
  TypeScript parser, so nothing inside strings was touched; code is identical modulo comments (checked by
  printing both ASTs with comments off). `ngc --noEmit`, eslint on both files and the wwell-planning Jest
  suites (67 tests) pass. `console.log` calls were left as-is — they aren't comments.

### wwell-ir — first `eligible-for-ir` red in Network tab + Target Aquifer not populating

- **Red first `eligible-for-ir` row:** not a backend failure (endpoint 200s every time, ~40 ms). `loadLinkedRequestWells`
  is triggered in `ngOnInit` and again by the first-selection effect; as a `switchMap` rxMethod, the second trigger
  aborted the first in-flight request, which Chrome draws red as "(canceled)". Proved with a forced race (delay that URL,
  re-enter the route: two loads 2 ms apart, first aborted after 3 ms). Fixed: `switchMap` → `exhaustMap` in
  `wwell-ir.store.ts`; the same race now sends one request that completes. (The red `permissions` :8080 and SAP `display`
  :9090 rows are just services that aren't running.)
- **Target Aquifer empty, two independent causes:**
  1. *New IR (link picker):* the live local Oracle was stale — `exad_rcd_prewap` had no `target_form`/`expl_wb_name` and the
     old `get_ir_wells_prc` body (init scripts only run on a fresh volume), so the API returned `targetAquifer: null`. Applied
     `ALTER TABLE` + `target_form` seeds + re-ran `04-agwa-queries-package.sql` on the live container. `expl_wb_name` left NULL
     on purpose (seed values don't match the Supporting Business dropdown options — open decision).
  2. *Saved IR (what a reload shows):* the eligible list can't resolve an already-linked well, and the detail's
     `EXAD_RCD_PREWAP` block (prod returns `p.*`) carried `target_form` but Angular never read it. Added `target_form` to
     `IrLinkedWellRow` and `targetAquifer: linkedWell?.target_form ?? existing…` in
     `mergeIrDetailBlocksIntoIntegratedRequirement`; the local `get_ir_data_prc` stand-in now emits `target_form` too.
- Also refreshed the stale `IrEligibleWell` doc comment (Target Aquifer is now always read-only).
- **Verified live (headless browser + curl):** saved IR-9006 shows `Target Aquifer: Umm Er Radhuma`; picking HAIL_500 → `Biyadh`,
  HAIL_615 → `Wasia`, field disabled; 40 concurrent API calls all 200; one `eligible-for-ir` request per reload. ESLint clean,
  full Jest 84 suites / 470 tests green, `ngc --noEmit` clean. Did not save a new IR end to end (would create/delete a row in
  the dev DB); the saved-IR read path it would use is the one verified on IR-9006.

### wwell-ir 1.0 Wellbore Details — BI Number and Supporting Business are now read-only fields

- `wwell-ir-form.schema.ts`: `client` (BI Number) and `supportingBusiness` changed from required `select`s to read-only `text`
  fields (same treatment as Target Aquifer/Target Depth); dropped their option-list imports and `required` validators.
- **Supporting Business** is sourced from the linked well's `expl_wb_name` (`supportings` in the prod `get_ir_wells_prc`):
  `applyLinkedRequestWell` now patches it (blank when the well has none) and no longer passes it through `setLinkedFieldLock`,
  which would have re-enabled it. For a saved IR, `IrLinkedWellRow.expl_wb_name` is read in
  `mergeIrDetailBlocksIntoIntegratedRequirement` (prod's `p.*` block already carries it); the local `get_ir_data_prc` stand-in
  in agwa-planning now emits it too and was re-applied to the live container. `expl_wb_name` seeds restored — a text field can
  show `Exploration`/`Producing`, which the old dropdown couldn't.
- **BI Number has no data source anywhere** (prod `get_ir_wells_prc` returns no BI column; `exad_rcd_prewap` has none; Active
  Well takes BI from a rig block), so it is read-only and blank until the proc/table supplies one — left unwired on purpose
  rather than guessing a column name.
- Verified live: saved IR-9006 shows `Supporting Business: Exploration`; HAIL_500 → `Producing`, RXYD_140 → `Exploration`; a
  well with no value blanks the fields and they stay disabled (tested by temporarily nulling one row, then restored and
  checked against the 03 seed script). ESLint clean, `ngc --noEmit` clean, full Jest 84 suites / 470 tests green.

### Comment cleanup (git-staged files)

- Stripped every comment from the staged Angular files with the TypeScript parser (`wwell-ir-detail-response.mapper.ts` 70
  comments, `wwell-ir-payload.model.ts` 24; the editor and schema were already clean), then re-staged those two paths so the
  index itself is comment-free. AST-equality check (comments off), eslint, `ngc --noEmit` and full Jest (470 tests) pass.
  The agwa-planning repo's staged SQL/Java files were deliberately left alone.
