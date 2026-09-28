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

### wwell-ir 1.0 Wellbore Details — bold, readable text on read-only (disabled) fields

- Root cause (measured live): Material paints disabled fields at 38% alpha, so read-only values/labels (BI Number, Supporting
  Business, Water Well Name, Target Aquifer/Depth, Surface Elevation, Coordinates) were ~2:1 contrast at weight 400 on the
  grey field fill.
- Added `ire__section--wellbore` to the section root and a scoped rule in `wwell-ir-editor.component.scss`: every field value
  in the section is semibold (600); disabled values/suffixes are `$navy`, disabled labels `$muted` — same look as the view-mode
  `dt`/`dd`. Other sections and the shared dynamic-form styles are untouched.
- Verified live: disabled value contrast 16.7:1, label 5.06:1 (AA needs 4.5:1); editable fields now semibold too. ESLint,
  `ngc --noEmit` and the wwell-ir Jest suites pass.

### wwell-ir editor — New IR opens Wellbore Details in edit; header title follows Link to Request live

- **Header title** (`ire__title`) read `ir().requestReference.wellName`, i.e. the saved/draft record, so picking a Link to
  Request filled Water Well Name in the form but the title stayed "Untitled Well" until Save. New `headerTitle` computed reads
  `requestReferenceEdit.liveValue()` while the section is open (falls back to `ir()` otherwise, then "Untitled Well"), so it
  updates the instant `applyLinkedRequestWell` patches `wellName`. `requestReferenceEdit` is now typed
  `SectionEditState<FormGroup, WwellIrRawReference>` so `liveValue()` is not `unknown`.
- **New IR opens 1.0 Wellbore Details in edit** — a constructor effect (declared after the `ir().id` one, whose
  `closeAllSections()` would otherwise undo it) calls `requestReferenceEdit.open()` when `ir().irSeq == null`. It tracks the
  whole `ir()` rather than the id because a draft's id is always `'draft'`: its object only changes on a fresh New IR or after
  Discard. `open()` is a no-op when already open, so typed input is never overwritten. The pencil is hidden while editing.
- **Unsaved-changes prompt** — step 1 being open on a draft would have made `hasUnsavedChanges` true for an untouched New IR
  and popped the "Unsaved changes" dialog on every row switch. New `hasUnsavedReferenceEdits` counts it only once the form is
  `dirty` (reads `liveValue()` so it re-evaluates per edit, since `dirty` is not a signal). Other sections unchanged.
- Specs: the two editor specs that assumed a draft opens read-only behind a pencil were rewritten for the new behaviour; no
  new specs added (deferred during the redesign). No dedicated test covers the dirty-gating.
- Verified live (dev server + mock :7070): New IR → step 1 open, title "Untitled Well"; pick HAIL_615 → title "HAIL_615"
  with nothing saved, matching Water Well Name; dirty draft + row click → "Unsaved changes" dialog; untouched draft + row
  click → switches silently; dirty draft → New IR → Discard → step 1 reopens clean with "Untitled Well"; saved IR-9004/9029
  still show step 1 read-only. ESLint, `tsc --noEmit -p tsconfig.app.json` and the wwell-ir Jest suites (63 tests) pass.

### wwell-ir 1.0 Wellbore Details — Coordinates read-only

- `coordinates` in `wwell-ir-form.schema.ts` is now `readonly: true` (placeholder `auto` + the same "From the linked well" hint as
  Target Depth/Aquifer/Supporting Business). `required` and the coordinates `pattern` were dropped — a disabled control is
  never validated, and a `*` on a field the author can't type in was misleading. The now-unused
  `WWELL_APPROVAL_COORDINATES_PATTERN` import was removed from the IR schema (the Requests/WLDA forms still use it).
- Why read-only is correct: `wwell-ir-payload.mapper.ts` never sends `coordinates`, and on read they come only from the linked
  well (`surfacen`/`surfacee`), so a hand-typed value was silently lost after Save.
- `applyLinkedRequestWell` no longer routes `coordinates` through `setLinkedFieldLock` (its `enable()` branch, for a well with no
  coordinates, would have re-enabled the field) and always patches it — blank when the well has none, like Target Aquifer /
  Supporting Business, so switching links can't leave a stale value the author can't edit. Surface Elevation still locks/unlocks.
- Verified live: New IR → Coordinates disabled, no `*`, placeholder `auto`; pick RXYD_140 → `25.4023°N, 43.8871°E`, still
  disabled, header title `RXYD_140`. No mock well lacks coordinates, so the blank-for-no-coordinates branch is by reading only.
  ESLint, `tsc --noEmit -p tsconfig.app.json`, wwell-planning Jest (67 tests) pass.

### wwell-ir editor — Sections/Timeline choice now survives editor rebuilds

- Symptom: after switching to Sections (or back to Timeline) the view snapped back to Timeline. Root cause: `viewMode` was a
  per-instance signal on `WwellIrEditorComponent` and `ngOnInit` forced `'timeline'`; the list page destroys and rebuilds the
  editor on a row switch (`isSelecting()` loading skeleton) and on the view→edit toggle, so every rebuild restarted at the default.
- Reproduced live first, with an editor-element identity probe, before changing anything (Sections selected): existing-IR Save →
  kept (same editor instance, `createIr` never touches `irDetailLoading`/selection); New IR from an open editor → kept;
  **row switch → reset**; **eye icon → Edit → reset**.
- Fix: `viewMode` is now a public `model<WwellIrEditorViewMode>('timeline')` on the editor, two-way bound from
  `WwellIrComponent.editorViewMode` (`[(viewMode)]`), a sticky signal next to `detailMode` for the same reason. `ngOnInit` removed;
  `expandedTimelineSteps` starts with every step expanded so a rebuilt editor in Timeline still opens fully expanded.
  Lives for the route's lifetime only — a full page reload or leaving the page returns to the Timeline default.
- Verified live after the fix: Sections survives row switch, eye→Edit and New IR; Timeline survives a row switch with all 7
  steps still expanded; default on a fresh load is still Timeline. The live checks did two no-change saves (open a section, Save,
  identical data) on IR-9006 and IR-9007 in the local mock, so their "updated" stamps moved. No new specs (deferred); the
  existing default-Timeline spec still covers the default. ESLint, `ngc --noEmit` and wwell-planning Jest (67 tests) pass.

### wwell-ir editor loading shimmer — follows the Sections/Timeline view

- The load shimmer (`app-wwell-ir-editor-loading`) was always the Sections layout (left rail + stacked cards), even with Timeline
  selected, so Timeline users saw a layout that vanished on load. It now takes a `viewMode` input, fed from the sticky
  `WwellIrComponent.editorViewMode` (`[viewMode]="editorViewMode()"` in the `isSelecting()` branch), so it matches the layout that
  is about to render.
- Timeline shimmer mirrors the real one: 4 header icon chips, the dot-and-line stepper (`.irel__step` / `.irel__step-rail` /
  `.irel__dot`, the same `display: contents` vs flex trick the editor uses so one card loop serves both modes), a status-pill bar
  on each card head, and the Wellbore Preview panel (320px, 260px ≤1100px, full width ≤900px). Sections shimmer is unchanged.
- The cards now come from one `@for` over `CARD_FIELD_COUNTS` (was hand-copied blocks), and the shimmer gradient is a `shimmer`
  mixin (was repeated). `.irel__preview` is `border-box`: without it the panel measured 351px at desktop and overflowed the body
  by ~31px when stacked (caught by measuring live at 1440 and 820 wide).
- Verified live by delaying the detail GET in the page and screenshotting: Timeline selected → timeline shimmer (dots, preview,
  no rail); Sections selected → rail + cards (no dots/preview); preview 320px at 1440, equal to the body at 820, no horizontal
  overflow. ESLint, `ngc --noEmit` and wwell-planning Jest pass. No new specs (deferred).

### wwell-planning — light/dark theme, Geist typography, wellbore + depth scale

- **Direction ("Instrument"):** Geist + Geist Mono (self-hosted via `@fontsource-variable/geist` and `geist-mono`, added to
  `package.json`), cool neutrals, hairline borders, a monochrome ink primary button, cobalt kept for signals only. The toggle lives
  inside the module (`app-wwell-theme-toggle` in the header of the 4 pages), defaults to the OS theme and remembers the choice.
- **Token architecture:** `shared/_wwell-theme.scss` is the single source of truth — `--wp-*` custom properties declared by
  `light-tokens` / `dark-tokens` mixins on `:root` and switched by `data-wp-theme` on `<html>` (overlays render on `<body>`, so the
  attribute has to live on the root; the `wp-` prefix keeps other features from reading them). `wwell-design-tokens.scss` keeps its
  Sass names but every value is now `var(--wp-*)`; Sass colour functions can't act on `var()`, so `tokens.alpha($c, n%)` compiles to
  `color-mix(in srgb, …, transparent)`. Status colours (`WWELL_STATUS_COLORS`, the IR/requests configs) are `--wp-st-*` trios.
- **Runtime:** `WwellThemeService` (root-provided, signals, `localStorage` key `wwell-theme` in try/catch, 260ms cross-fade guarded
  by `prefers-reduced-motion`). Material 20.2 `mat.theme(theme-type: color-scheme)` follows `color-scheme: var(--wp-scheme)`; the app
  only calls `mat.core()`, so unthemed Material buttons rendered transparent with a black label on dark — new `_wwell-material.scss`
  (`buttons`, `form-fields`) sets them from tokens on each page/dialog/editor/view root. Select panels (portalled) read the same tokens.
- **Wellbore, depth scale, letter:** the shared `features/presentation/well-bore-view` is untouched — `_wwell-wellbore.scss` re-points
  its variables and recolours its hardcoded SVG presentation attributes only under wwell-planning wrappers, so Presentation renders as
  before. Depth scale rewritten (hairline axis, muted ticks, tabular Geist Mono labels with a surface halo). The printed letter is
  `.wp-paper`, which re-declares the LIGHT token set, so the letter and the wellbore PNG snapshot embedded in the PDF stay
  paper-white in both themes (the snapshot inlines computed colours onto a white canvas); it sits on a sunken tray in dark.
- **Typography retune:** weights 800→650 and 700→600 across the module's component stylesheets (36 + 50 declarations), heavy-title
  tracking −0.01em→−0.018em, and row codes/eyebrows (`*__row-code`, `*__eyebrow` — every one shows an ID like `REQ-00231` /
  `IR-9006`) now use Geist Mono with tabular numerals. Ad-hoc radii (7/10/18px) were left as-is rather than remapped to the 6/8/12
  `--wp-radius-*` tokens.
- **Verified:** WCAG AA on sampled states in both themes (token-level script + an in-page sweep of the rendered text; 0 real
  failures after tuning the subtle/danger/tint tokens); all 29 entry stylesheets compile with `sass`; ESLint and `ngc --noEmit`
  clean; wwell-planning Jest 67 passing. Live at 768/1024/1440 × light/dark on all 4 pages: no horizontal overflow, no clipped row
  codes. No new specs, per the standing "defer spec coverage" call.
- **Known, not fixed (pre-existing, in the shared renderer):** casing / ground / water labels can overlap on some wells (e.g. the
  `18" Intermediate` and `7" Liner` labels on IR-9006); fixing it means editing the Presentation renderer, out of scope here.

### wwell-ir read display — no pills/ovals around picked options; 2.0 General reformatted

- **Symptom (light and dark):** in 2.0 General (and 1.0 Target Aquifer, Hydrogeology Aquifer/Test Type, and the view page's cards) every
  option-type value sat in a bordered 999px pill. A multi-select's picks are one newline-joined string, so the pill wrapped the whole
  block — Transmission became a large oval. Each 2.1/2.2 sub-section also drew a faint box edge.
- **Cause 1:** `.ire__view-value--badge` (editor) / `.kv-card__value--badge` (view) — removed. **Cause 2:** `.ire__group
  .ire__section--sub` reset border and radius but kept `.ire__section`'s `box-shadow`/background — now `none`/`transparent`.
- **Format:** new `app-wwell-ir-kv-value` (`wwell-ir/wwell-ir-kv-value/`) is the value half of every read row (4 sites in the editor, 1 in
  `wwell-ir-view-kv-card`). Plain values stay text; picks are listed one per line with a small dot and hanging indent once there is
  more than one (so a wrapped "Aquifer Performance Test (APT)" can't read as two picks), and a single pick is plain text.
- `KvRow.badge` renamed `options` (it no longer means "render as a badge"); only the util's 10 rows and the 5 templates used it.
- Verified live in light and dark (editor timeline + view page). ESLint, `ngc --noEmit` and wwell-planning Jest (67 tests) pass. No new
  specs, per the standing "defer spec coverage" call.

### wwell-ir wellbore view — premium panel, complete dark/light theme, legible Expand view

Scope was `wwell-ir/` only: the shared Presentation renderer (`features/presentation/well-bore-view`) is untouched, and the theme
partial moved from `wwell-planning/shared/_wwell-wellbore.scss` to `wwell-ir/_wwell-ir-wellbore-theme.scss` (only wwell-ir uses it).

- **Bug found while checking dark:** Sections view never included the wellbore theme, and even where it was included the diagram's own
  `[_nghost] .geo-axis { stroke: #000 }` (0,2,0) tied the override's specificity, so stylesheet order decided. Result: geologic labels,
  axis, WASI/UMER codes and "TOTAL DEPTH" were near-black on the dark surface. The theme now compiles to (0,3,0) under `.wbp .wbp__stage`
  (`wellbore-theme($ng-deep: false)` for the `ViewEncapsulation.None` panel; the letter and others keep the `::ng-deep` form).
- **`app-wwell-ir-wellbore-panel`** (new, `wwell-ir/wwell-ir-wellbore-panel/`) replaces three hand-rolled copies of the card (editor
  Sections + Timeline sidebar share one template; view page Well Design). Header (title, well name), readouts (total depth, static WL,
  casing strings, formation tops — only those with data), a stage with depth gridlines drawn in the diagram's own coordinates from the
  same scale/tick interval as the axis (`buildDepthTicks`/`pickTickInterval`), a legend of only the elements actually drawn (from the
  casing types and `ohFlg/gpFlg/lsFlg/perforatedFlg`), and a designed empty state. Figure size comes from the layout (aspect ratio and
  depth-scale share computed), sized with container-query units so the SVGs (`preserveAspectRatio="none"`) never stretch.
- **Expand** opens the same panel in a dialog with `FULLSCREEN_DIAGRAM_LAYOUT` + `isFullscreen` — the layout Presentation uses — so
  labels are actually readable (the inline preview is ~6–12px text by design). The panel renders itself in the `ng-template`, so there is
  one implementation. **While it is open the inline diagram is unmounted**: the shared renderer gives casing clip-paths/gradients fixed SVG
  ids and `url(#id)` resolves to the first match, so two diagrams mounted together made the dialog's casing vanish (seen live).
- **Layouts** (`wwell-ir-preview-diagram-layout.ts`): preview is taller (1000 vs 650) so shoes a few hundred feet apart get more px/ft,
  and `wellboreViewWidth` 780→870 stops the right-hand casing labels clipping at the viewBox edge (`casingCenterX` stays — left-anchored
  labels like "Flowing — SIWHP" need it to clear the "Geologic Horizons" heading; tried 385, it collided). New sidebar layout (520 wide)
  gives the drawing ~50% more pixels; in that form the leader labels are hidden (`wbp--compact`) because they render at ~6px and collide —
  hover tooltips still work and every label is in Expand.
- Depth scale: no own gradient/rounded tray any more (it sits on the stage), hairline edge only. The letter/PDF path is unchanged; the
  paper scope still resolves the light tokens (checked in dark: axis `rgb(10,13,20)` on white).
- Verified live in light and dark on IR-9006/9004/9019 + empty-state IRs: Timeline sidebar, Sections, view Well Design, Expand dialog;
  1440/1024/768 widths, no overflow, figure always inside the stage. In-page contrast sweep 0 failures in both themes; SVG label
  colours on the stage ≥ 4.9:1 (light) / ≥ 7:1 (dark). Sass (all sheets), ESLint, `ngc --noEmit`, wwell-planning Jest (67) pass. No new
  specs, per the standing "defer spec coverage" call.
- **Known, not fixed (shared renderer):** labels that land on the same depth still overlap — e.g. IR-9006's `PS @ 344` pump label on
  the `18" Intermediate @ 320` casing label, and the `SIWHP` arrow over the `GROUND LEVEL` label on IR-9019. Fixing needs collision
  avoidance in Presentation's renderer.

### wwell-ir depth scale — always runs to the target depth

- **Ask:** the depth scale must be drawn to the target depth, always. It was fed `displayDepth`, which `wwell-ir-wellbore-diagram.mapper.ts`
  computed as the deepest of target / casing rows / formation-top rows with a 500 ft floor — so a deeper row or a shallow target stretched
  or padded the scale — and the ruler's last label stopped at the last regular tick (a 3,200 ft well ended its labels at 3,000).
- **Fix at the source:** `displayDepth` is now the resolved target depth (`computeDisplayDepthFt` and `MIN_SCALE_DEPTH_FT` removed). The shared
  diagram's own vertical domain is `max(totalDepth, displayDepth)`, so it moves with the ruler and they stay aligned. The depth scale, the
  panel's gridlines and the letter now all read `targetDepth` explicitly.
- **Ruler ends on the target:** new `buildScaleTicks` (`wwell-ir-depth-scale/wwell-ir-depth-ticks.util.ts`) = the regular ticks plus the target
  depth as the final tick; a regular tick too close to print beside it (26 viewBox units) is dropped, and one that lands exactly on it isn't
  repeated. The last tick is drawn in the accent colour (neutral when no real target depth exists and the scale ends at the 1,000 ft
  placeholder). Depth axis and panel gridlines share the util, so a gridline always continues a tick.
- **Found while checking:** in the Expand dialog the new last tick and the "TOTAL DEPTH" label were cut off — Presentation's fullscreen layout
  ends the drawing exactly at the SVG's bottom edge (`80 + 860 = 940`). `WWELL_IR_EXPANDED_DIAGRAM_LAYOUT` adds 60 units under the drawing;
  the drawing itself is unchanged. (The label was silently missing there before this.)
- **Behaviour change to know about:** a casing or formation-top row deeper than the target depth now runs off the end of the scale instead of
  stretching it. There is no warning for that yet (the editor only warns on inverted casing sizes).
- Verified live on IR-9006 / 9004 / 9019: ticks end `…3,000, 3,200` / `…2,800, 2,950` / `…3,500, 4,100`, in the editor sidebar, Expand
  dialog, and the Letter tab. Sass (all sheets), ESLint, `ngc --noEmit`, wwell-planning Jest (67) pass; no new specs (standing call).

### wwell-planning theme — dark contrast dial + Appearance popover

- **Ask:** dark mode had too much contrast; wanted a custom way / slider to control it.
- **Dial, not a second palette:** the dark neutrals in `shared/_wwell-theme.scss` (page/surface steps, lines, ink/text/muted/subtle, CTA,
  tooltip, shimmer, wellbore outline/pad) are now `dial(HIGH, SOFT)` = `color-mix(in srgb, HIGH var(--wp-contrast, 50%), SOFT)`. HIGH is the
  previous dark palette (100% is byte-identical to before — verified page/surface/ink/text/CTA rgb); SOFT lifts surfaces to a lighter
  charcoal and eases text down. Accent, semantic, status and wellbore domain colours are untouched. Light theme is untouched.
- **AA holds across the range:** anchors were checked with a script at 0/25/50/75/100% — every text tier ≥ 4.6:1 on every surface (the first
  SOFT `subtle` was 4.4 and had to be brightened), control borders ≥ 3.3:1, CTA label ≥ 12:1. Live in-page sweep at 0% (worst case) on all
  four pages + the Expand dialog: 0 failing text nodes; tooltip 12.1:1.
- **Default is 50%**, softer than the old dark (ink-on-surface 13.1:1 vs 17.1:1). See the light-dial entry below for the per-theme
  variables (`--wp-contrast-dark` / `--wp-contrast-light`) that replaced the single `--wp-contrast` first written here.
- **`WwellThemeService`:** adds `mode` (`light | dark | system`) / `setMode`, and `contrast` / `setContrast` / `resetContrast`. Contrast is
  written to `<html>` as `--wp-contrast`, persisted under `wwell-contrast` (cleared when equal to the default); choosing System clears
  `wwell-theme`. Storage failures still only cost persistence.
- **`app-wwell-theme-toggle`:** keeps the one-press sun/moon switch and adds a joined `tune` button opening an Appearance popover
  (CDK connected overlay, focus-trapped, ESC/backdrop close, focus returns to the trigger): Light / Dark / System segmented radios and a native
  range slider (Soft ↔ High, live %), Reset.
- Verified live: keyboard (Home/End on the slider), persistence across reload, Reset, Light/System/Dark switching, ESC focus restore,
  popover on-screen at 375px (`cdkConnectedOverlayPush`). Sass (30 sheets + styles.scss), ESLint, `ngc --noEmit`, wwell-planning Jest (67)
  pass; no new specs (standing call).
- **Gotcha:** `viewChild.required<ElementRef<HTMLElement>>('x', { read: ElementRef })` doesn't type-check (explicit generic drops the `read`
  overload) — use `viewChild.required('x', { read: ElementRef<HTMLElement> })`. And `#ref` on a `mat-icon-button` is the Material component,
  not the element, so `read: ElementRef` is required to focus it.
- **Also fixed (UX):** the wwell-ir master-column search placeholder was 266px of text in a 159px input (40% cut off: "Search by code, well,").
  Now "Search code, well…" (132px); the full "by code, well, request or client" wording moved to `aria-label` + `title`.
  **Found, not fixed (needs a design call):** the status-chip strip is 436px of chips in a 182px window with no scroll cue, so
  "Submit for Review" / "In Review" and most of "In Progress" are invisible until you scroll a strip with a hidden scrollbar.

### wwell-planning theme — contrast dial for light too

- **Ask:** allow the contrast slider in the light theme as well (a dimmed, lower-glare look, like dark's Soft end).
- **Per-theme dials:** `_wwell-theme.scss` now has `dark-tone()` / `light-tone()`; each dialed token is `color-mix(in srgb, HIGH <dial>, SOFT)`
  reading `--wp-contrast-dark` (fallback 50%) or `--wp-contrast-light` (fallback 100%). Light's High end is the unchanged standard palette and
  is the default (a fresh light theme looks exactly as before); Soft (0%) dims page/surface/lines to a cool grey (surface `#ebeef2`, page
  `#dde1e8`) and darkens ink/text and the fixed-colour text (accent, danger, success, warning, wellbore ground/target/actual/water) so they
  keep pace with the darker grounds. 34 light tokens are dialed (55 in total with dark's 21).
- **`.wp-paper` never follows the dial:** `light-tokens($dialed: false)` returns the High values untouched — the compiled `.wp-paper` block is
  byte-identical to before, and a live probe at light 0% still resolves paper to white / ink `rgb(10,13,20)`. The IR letter and the wellbore
  PNG that ships in the PDF are unaffected.
- **Service:** `WwellThemeService` keeps a dial per theme (`DEFAULT_CONTRASTS = { dark: 50, light: 100 }`); `contrast` / `setContrast` /
  `resetContrast` / `isContrastDefault` act on the theme that is showing. Both CSS variables are always written to `<html>`, so a theme
  switch repaints at the right contrast in one step. Storage: dark keeps `wwell-contrast` (an already-saved value still applies), light
  uses `wwell-contrast-light`; a value equal to its default clears its key.
- **Popover:** the slider is always enabled; label/aria-label/hint follow the theme ("Light contrast", "Lower it to cut glare in bright rooms.").
- **AA check:** scripted at 0/25/50/75/100% — the bar is "no pairing worse than it is at High today" (the all-grounds metric is stricter than
  real usage, so current values already sit at 4.3–4.5 on it): every fixed-colour token at Soft is ≥ its High-end value; ink ≥ 9.6, text ≥
  7.5, muted ≥ 5.4, subtle ≥ 5.0, control border ≥ 4.8. Live in-page sweep at light 0% on all four pages + the Expand dialog: 0 failures.
- Verified live: default 100% (Reset disabled), Home → 0% moves only the light variable/key, dark stays at 50%, Light↔Dark keeps each theme's
  value, Reset in light clears `wwell-contrast-light`. Sass (30 sheets + styles.scss), ESLint, `ngc --noEmit` pass; no new specs (standing call).

### wwell-planning UX audit pass (requests / WLDA / land-affairs pages, both themes)

- **Search placeholders** on Requests, WLDA Approvals and Land Affairs Approvals were cut off in the 159px input ("Search by req #, clier").
  Now "Search req #, client…" (143px, measured live); the full "by req #, client or well name" wording moved to `aria-label` + `title`
  (same fix as the IR page).
- **Approval Chain header** (`wwell-approval-timeline`): "Approval Chain — REQ-\n00252" broke mid-code in the narrow column. The title is one
  flex item now with the code in a `white-space: nowrap` span, so it wraps at the space ("APPROVAL CHAIN —" / "REQ-00252"). First attempt
  made the code its own flex item (it jumped to the far right) — caught only by looking at the screenshot, not by the geometry checks.
- Checked and clean: no horizontal overflow on any of the four pages at 1024 / 768 / 375.
- **Found, not fixed (needs a call):** status-chip strip on IR (3 of 5 chips hidden, no scroll cue); every page load shows stacked red
  "Failed to fetch" / "HTTP 404 Not Found" toasts that overlap the detail header's status pill; "New Request" primary button also appears on
  the two approvals queues; Land Affairs' two-line title pushes its list ~22px lower than the other pages; selected record / view / filters
  are not in the URL; broken AGWA logo in the app shell (outside the module).
- Sass (30 sheets + styles.scss), ESLint, `ngc --noEmit`, wwell-planning Jest (67) pass; no new specs (standing call).

### sap-service, New IR button, wellbore statistics, timeline dots, themed Letter

- **sap-service started:** `~/Downloads/Misc/sap-service` is a standalone Quarkus mock of SAP AAE's `/trigger` and `/display` (port 9090, matches
  `sapServiceUrl` in `external-config.json`). Started with `./mvnw quarkus:dev -Dquarkus.console.enabled=false` (no `clean`). Health `UP`; the IR
  page's "Approval Workflow" sidebar now loads and the "Failed to load the SAP approval workflow status" toast is gone. The remaining "Failed to
  fetch" on the other pages is the daily-operations/email service on 8080, which is not running (planning on 7070 is).
- **Incident:** `shared/wwell-theme-toggle/wwell-theme-toggle.component.scss` was found truncated to 0 bytes (mtime 17:32, after my last edit) — the
  toggle rendered unstyled (icons stacked, no border, 40px). Cause unknown (not one of my commands; the file was open in the IDE). Restored from
  the staged copy, which held every edit; re-verified live (32×32, joined border).
- **New IR button** (`wwell-ir.component.{html,scss}`): was 40px tall beside the 32px toggle group, its "+" stranded left, and `box-shadow: none`
  stripped the CTA's own depth token. Now a full-width primary action row (`.wwell-ir__actions`) sharing the toggle's 32px height, plus icon in a
  tinted chip that turns a quarter on hover, `var(--wp-cta-shadow)` depth, press/focus states, and a real busy state (CSS ring + "Creating…",
  `aria-busy`) instead of just greying. Reduced-motion respected. Checked light/dark; busy state checked by cloning its markup (a real click would
  create a record).
- **Wellbore statistics** (`wwell-ir-wellbore-panel/`): new pure util `wwell-ir-wellbore-facts.util.ts` derives everything from data the diagram
  already draws — stat tiles (total depth, static water level, water column, deepest shoe with size/type, pump setting), a well-profile bar
  (surface→TD: cased vs open/below-shoe share, water and pump markers), a casing program table and formation tops table. A shoe deeper than the
  target depth is flagged (tile + row + "below TD" text) — closes the "deeper than target depth" gap noted earlier. In the Expand dialog the
  extras sit in a right-hand rail beside the diagram (grid; stacks under 900px); compact sidebar gets the tables the hidden leader labels lose.
  Added `$radius-pill` to the design tokens. No new specs (standing call) — the util is pure and easy to spec when that pause ends.
- **Timeline circles:** `.ire__tl-dot--done.ire__tl-dot--active` — Timeline view opens every step, so a completed circle was also "active" and the
  later `--active` rule repainted its ring/halo cobalt. Done now wins: green fill, green ring, green halo (checked computed styles: all six done
  circles green, the pending one keeps cobalt).
- **Letter follows the theme:** the sheet no longer carries a permanent `.wp-paper` (it is themed, and follows the contrast dials). Two safeguards so
  paper stays paper: (1) `captureWellboreSnapshot` now rasterizes an off-screen copy of the diagram row inside a `.wp-paper` wrapper, so the PNG sent to
  the PDF is ink-on-white whatever the screen theme — verified: capture in dark vs light gives an identical pixel hash (3468×2520, 96.06% white);
  (2) `beforeprint`/`afterprint` pin the sheet back to `.wp-paper` while the browser prints (checked while in dark). The server-side PDF is unaffected.
  Sweep on the Letter tab: 0 failing text nodes at dark 0/50/100% and light 0/100%.
- **Test-harness note:** zsh doesn't word-split `set -- $combo`, so an empty value wrote `--wp-contrast-dark: %`, which invalidates every dark token
  (black on navy). The app never writes that (the service clamps and always emits `N%`), but an *invalid* value bypasses the `var(--x, 50%)` fallback.
- Sass (30 sheets + styles.scss), ESLint, `ngc --noEmit`, wwell-planning Jest (67) pass.

### Full test IR (IR-9065) — HAIL_500, every section populated

- **What:** one IR created through the real API (`POST /planning/api/v1/integrated-requirements`, all six table blocks INSERT, the same shape
  `buildWwellIrBulkSavePayload` produces) linked to HAIL_500 (prewap 5009 — one of the two wells with no IR yet). Read back and checked against the
  payload row by row, then checked in the app (all sections "Completed" except Attachments; Wellbore Preview + Expand verified).
- **Contents:** 5 casings per the user's program — Conductor 30" @ 120, Surface 24" @ 400, Intermediate 18" @ 1,500 ("a8" read as 18), Production
  13" @ 2,000, Liner 9" @ 3,300; well design flags Open Hole (6 1/2"), Screened, Screened + Gravel Pack, pump at 800 ft; 5 tops (DMM 120, RUS 480,
  UMER 760, ARUM 1,450, WASI 2,150); 3 offset wells (EP A 1187 / 1203 / 1266); Estimated Hydrology pump-test with all six visible fields (WASI, 185 ft
  water level, 800 ft pump depth, 2,100 ppm TDS, 1,500 GPM, 3 ppm H2S); Program Details every group filled; both geologists; letter no.
  LTR-2026-0500. Draft — not submitted to SAP. (First insert used a 24/18 5/8/13 3/8/9 5/8/7 5/8 program; replaced by the one above.)
- **Local mock data changed:** `exad_rcd_prewap` 5009 (HAIL_500) `target_dpth` **3,100 → 3,800** (dev DB only; the 03 seed file still says 3,100 and
  would revert on a rebuild). The 3,300 ft liner shoe sat below the old target depth, where the depth scale ends, so the open hole / screen / gravel
  pack had no interval to draw in. With 3,800 they get 500 ft below the shoe (cased 87% / open hole 13%). Revert: `UPDATE exad_rcd_prewap SET
  target_dpth = 3100 WHERE prewap_seq = 5009`.
- **Two things learned the hard way (both changed the data after first insert):**
  - `csg_size` holds the bare number (`24`, `18 5/8`) — the shared renderer appends the `"` itself, so `24"` drew as `24""`. The form placeholder
    (`e.g., 20"`) is misleading; UI-created IRs store bare numbers. Size is part of the PK (`ir_seq, csg_size`), so fixing it was DELETE + INSERT.
  - A **7"** liner is the app's "screen liner" (Rule 2/3): open hole, gravel pack and screen all end at its shoe and their labels collide with the
    liner label. Any non-7" liner (7 5/8" tried, then the user's 9") puts them below the shoe down to TD, each labelled cleanly.
  - Casing save order matters: `05-agwa-iud-package.sql` runs the MERGE (INSERT/UPDATE) **before** the DELETE, both keyed on `(ir_seq, csg_size)`
    only. To re-use a size with a different type/depth, send it as an UPDATE (a DELETE + INSERT of the same size ends with the row deleted). By
    reading the proc, the editor's own diff (`casingKey` = type + size) looks like it hits this when a row's Type is changed but its Size kept —
    not tested in the UI.
- **Finding, not changed:** production's `update_ir_data_prc` declares `distanct`, `spec_capacity`, `plan_ss_dpth` (and every other measured
  column) as `NUMBER(22)` — scale 0 — so decimals are rounded on save (2.4 km → 2, 7.81 GPM/ft → 8, sub-sea 485.2 → 485). The local
  `05-agwa-iud-package.sql` copies it. Only `est_sta_water_lvl`, `est_water_quality`, `est_productivity`, `siwhp` are bare `NUMBER`.
- **Not populated (no column / no UI path):** BI Number (no source on the link record), Offset Wells remarks (`water_remarks` is always sent null and
  never read back), attachments (separate upload API). `gen_remarks` left null — the UI never writes it.
- Creating an IR removes its well from `GET /wells/eligible-for-ir` (eligibility = no IR yet), so only RXYD_140 is left to try the New IR flow on.

### wwell-ir depth scale — redraws when a formation top goes past the target depth

- **Ask:** keep Presentation's scale rule — draw around whichever is deeper, the deepest formation top or the target depth — but in the IR base
  it on the target depth and redraw only once a top is added below it. Presentation's `selectDisplayDepth` (`core/store/shared/well-data.selectors.ts`)
  is `max(target/current depth, deepest planned top, deepest actual top) + 500 ft`; `presentation/` and the shared renderer are untouched.
- **Mapper** (`wwell-ir-wellbore-diagram.mapper.ts`): `displayDepth = max(resolved target depth, deepest renderable formation top)`; `totalDepth` /
  `targetDepth` stay the target, so the "TOTAL DEPTH" label and the open hole / screen / gravel pack interval stay on the target. The shared diagram's
  domain is `max(totalDepth, displayDepth)`, so the drawing follows. No padding (the ruler still ends exactly on what it is drawn to). It reacts to
  live editing too — the editor feeds the mapper the Formation Tops FormArray while a row is being edited.
- **Ruler / gridlines / Letter:** new `resolveScaleDepthFt` (the same `max(totalDepth, displayDepth)`) in `wwell-ir-depth-ticks.util.ts`;
  `buildScaleTicks(scaleDepth, drawingHeight, targetDepth)` now marks the target as its own accent tick and, when the scale runs past it, ends
  on the scale's end as a neutral tick (dropped if it is too close to the target to print beside it). `app-wwell-ir-depth-scale` got a
  `targetDepth` input; the panel (ruler + gridlines) and the Letter bind `scaleDepth()` + `targetDepth`.
- **Unchanged on purpose:** only tops extend the scale, as in Presentation — a casing shoe deeper than the target still runs off the end (and is
  still flagged "below TD" in the panel). Default case (no top past the target) is identical: ruler `… 3,500 [3,800]`.
- **Verified live on IR-9065 (target 3,800):** typing 4,300 into the WASI depth in the editor (unsaved) → ruler `… 3,500 [3,800] 4,000 4,300`,
  10 gridlines, WASI label at the bottom edge unclipped, TOTAL DEPTH still 3,800, in the sidebar and the Expand dialog; cancelling the row edit
  returns it to `… [3,800]`. Then saved WASI at 4,300 temporarily: the Letter draws the same extended ruler; restored to 2,150 afterwards
  (DB re-read). `ngc --noEmit`, ESLint, Jest (wwell-planning + core selectors + presentation, 160) pass; no new specs (standing call).
- **Seen while checking, not changed:** the Formation Tops "Sub-sea" column (editor table and Letter) shows floating-point noise —
  `485.20000000000005`, `-154.79999999999995` — because sub-sea is recomputed as elevation − depth on the client instead of using the stored
  (rounded) value or rounding the result. Also, cancelling an inline row edit left the editor's unsaved-changes guard armed (it prompted when
  opening the view page).

### wwell-ir wellbore panel — profile first, then the diagram, then the figures

- **Ask:** re-order the Wellbore Preview panel to Well profile → wellbore diagram → the readout tiles (Total depth / Static water level / Water
  column / Deepest shoe / Pump setting), and improve the diagram's UX. Panel-local only (`wwell-ir-wellbore-panel/`); the shared renderer and
  `presentation/` are untouched.
- **Order:** template is now header → profile → diagram (`.wbp__stage`) → legend → tiles → casing program / formation tops. Expand dialog: the
  profile takes a full-width row under the header (`grid-template-areas: head / profile / stage+stats / stage+facts / legend+facts`); below 900px
  it stacks in DOM order.
- **Well profile redesigned (user: "better design of well profile, skinny, more informative, items reflected"):** the single 10px bar + four
  key lines became one strip carrying every item, in a card ~119px tall in the sidebar (was ~135px).
  Lanes on one shared width: formation tops (tick + code) above; the **track** below — one segment per string where it runs (shoe to shoe), the liner
  in its own tone, the open stretch hatched — then **pins** for static water (round head) and pump (diamond head) with their values. Under it,
  Cased / Open hole as range + share. Header right: `0 – 3,800 ft`. Wider forms (view page, Expand) put each figure on one line and the
  segments say more ("18″ Intermediate", "Open hole" chip); the open segment's screen / gravel pack are named only when there is room (≥13rem),
  not drawn over the hatch (tried — noise at sidebar width).
  New files: `wwell-ir-wellbore-profile.util.ts` (model: segments/tops/markers/facts/aria description; equal-depth strings resolve to the narrower;
  gravel-pack rows are not strings; tops past TD are off the strip) and `wwell-ir-wellbore-labels.util.ts` (greedy label placement at the strip's
  *measured* width — a `ResizeObserver` on the strip feeds a signal — trying longer text first: `Water 185 ft` → `185 ft` → `185`; a label never
  crosses another pin; a top whose code doesn't fit stays a tick). Segment text visibility is pure CSS (container queries on each segment). The
  facts util lost its profile code (`profile` moved out of `WellboreFacts`).
  Two things found while building it: (1) a pins box overlapping the track's grid cell was auto-placed into a second, zero-width column — all
  three lanes now say `grid-column: 1`; (2) a full-height pin line struck through the segment labels, so pins are a short tick into the track's foot
  plus a head below. The strip is one `role="img"` with a generated sentence (no hover, per the earlier call).
- **Profile polish (user: "use some other shape for water/pump, and more design improvement"):** water is now a drop and the pump a submersible
  pump (discharge pipe, motor body, intake) — inline SVGs hanging from the pin tick, label beside them (label offset 6→9px in the placer). Also:
  strings shade top-to-bottom like the diagram's pipe (`--wbp-a/--wbp-b`; the dark theme runs the same stops the other way up via
  `[data-wp-theme='dark']`), a small wedge at each string's shoe (a real child element, because a container can't query its own pseudo-element),
  and a 2px water-blue line along the track's foot from the static water level to TD — the water column on the strip itself (a line, not a wash).
  Card ~121px in the sidebar. Checked sidebar + Expand, light + dark.
- **Real pump + shared pictograms + tile gauges (user: "use a real pump shape", "statics must use the same icon, and on the line show how much
  below — the dot was showing from the beginning"):** new `wwell-ir-wellbore-glyph.component.ts` — one tiny inline-SVG component used by the profile
  pins *and* the readout tiles: drop (water), pump (volute with impeller ring, motor block with ribs, outlet pipe on the centre line so it hangs from
  its pin by the pipe; the earlier capsule/submersible read as a bottle/spark plug at large scale), guide shoe, and ground-bar-plus-down-arrow
  for total depth. Previewed large on light/dark before wiring. The tile's old dot/bar `locator` is now a `gauge` (`WellboreStat.glyph` + `gauge`):
  the well as a hairline, **filled from the surface down to the depth** (that is "how much below ground"), the glyph on the fill's end; the water
  column fills its own stretch (water level → TD) with the drop where it starts. Glyphs centre themselves with `translate(-50%)` so the wider
  pump needs no special-casing; pin labels stand 12px off the pin. Card ~124px in the sidebar.
  Slip caught by diffing the compiled selectors: a slice edit deleted `.wbp__pin--water` (the water pin fell back to the accent colour) — restored.
- **Tiles:** each got a locator hairline (dot = a depth, blue bar = the water column) on its foot, aligned across a row (`margin-top:auto`), so
  where each figure sits along the well is visible at a glance. `WellboreStat` gained `locator`.
- **Tried and removed (user: "some part of the well bore shows a different grey-blue background, I want it the same"):** a 7% water-blue wash
  from the static water level down (a rect in the grid SVG, behind the drawing). It read as a second background over the plot only — the axis
  column and everything above the water level stayed the stage's own tone. Gone (rect, `waterZone`, SCSS); the stage is `surface-alt` edge to
  edge, and the water level is shown only by the shared diagram's own dashed line/label and the profile bar's marker. Checked: no SVG element in
  the diagram paints a large fill (only the transparent `g.wellbore-root`).
- **Motion:** entrance only, compositor properties, once — bar draws in (`scaleX`), markers drop on, tiles rise in turn.
  `prefers-reduced-motion: reduce` turns all panel animation/transition off.
- **Tried and removed (user: "remove the reading on hover, that line causing the issues"):** a hover depth probe — crosshair line over the
  diagram, depth tag on the ruler, needle + readout on the profile, an invisible range scrubber on the bar, tile-hover linking. All of it is
  gone (component signals/handlers, template, SCSS, `wwell-ir-wellbore-probe.util.ts`, `WellboreStat.depthFt`); nothing on the panel reacts to
  hover any more except what the shared diagram already did (its own casing/label tooltips).
- **Slip caught while removing it:** the first SCSS cut ran to the wrong marker and also deleted the legend, casing/tops tables, empty state and
  the wellbore-theme include. Gates stayed green (Sass still compiled) — only a screenshot showed an unstyled legend. Restored verbatim and
  checked by diffing the compiled selector set against the pre-removal compile: only probe selectors differ.
- **Verified live (IR-9065, sidebar, dark):** order `head > profile > stage > legend > stats > facts`; hovering the diagram shows no line, tag
  or readout (DOM has none of them); tiles show their locators; legend and tables styled. `ngc --noEmit`, ESLint, Sass, Jest (wwell-planning +
  core selectors + presentation, 160) pass; no new specs (standing call).
- **Seen, not changed:** IR-9065 is no longer a draft — `SAP_WF_ID` 9067, `SAP_WF_STATUS` "In Progress" (submitted from the UI outside my
  runs). In Expand the shared diagram's own casing hover tooltip's "Cemented; shoe above Wasia top" line overlaps its "est bottom depth" row —
  that's inside the shared renderer.

## 2026-09-21

### wwell-ir wellbore panel — glass profile and a depth-reading slider

- **Ask ("still improvement, and glass effect with a custom controller slider"):** the slider's purpose was never pinned
  down (both clarifying answers came back as "UI glass effect"), so it is a **depth reader** — the one control the panel was missing.
  - *Glass:* theme tokens `--wp-glass-fill/rim/sheen/shadow` in `_wwell-theme.scss` (light + dark; overlays, so the contrast dial leaves them).
    The profile card is the backdrop — two soft pools of the water and accent colours, `isolation`+`overflow:hidden`, so the page and the plot
    stay one flat colour (the earlier grey-blue complaint). On it a frosted plate (`backdrop-filter: blur(14px) saturate(1.6)`, top rim, soft
    shadow) holds the strip and the readout; the track gets a glass-tube sheen; the reading chips and the tiles catch the same light.
  - *Slider:* a native `<input type="range">` (keyboard/touch/AT for free) laid on the strip's track, widened by one bead and pulled out half a
    bead each side so the bead's centre travels exactly the track's width (measured: slider 946.6–1213.4 over track 956.6–1203.4). A glass bead,
    focus ring, snaps to 10 ft (1 ft when TD is not a multiple of 10). It reads `readWellboreAt(profile, depth)` — string there, formation
    ("In UMER"), "N ft below water" — as chips under the strip, and lights the stretch it names with an accent ring. Not hover: the slider is
    dragged/clicked/keyed, nothing is drawn over the diagram, and nothing shows until it is first used (thumb at the surface, a hint line).
    Chips reserve two rows in the sidebar so a reading never shifts what is below; the open hole's "Screen · Gravel pack" is left to the wider
    forms (with it the string alone would take a row). `aria-valuetext` carries the same sentence; the strip is a `group` (was `img`, which
    would have hidden the input from AT), its lanes stay `aria-hidden`.
  - *Height:* a first cut with a separate rail row made the sidebar card 216px (was ~124) — against "skinny" — so the slider moved onto the track:
    186px, stable across depths. Profile/marker/top types gained `depthFt`; `readWellboreAt` lives in the profile util.
  - *Verified live (IR-9065; sidebar, Expand, view-page Well Design; light + dark):* readings at 0/185/1,250/3,300/3,800 ft (185 = "At water
    level"; 3,300 = open hole, 3,800 also shows the completion in the wide forms); Home/End/arrows/Tab focus ring; no console errors.
    `ngc --noEmit`, ESLint, Sass (compiled selectors only added, none removed), full Jest (84 suites, 470) pass; no new specs (standing call).

### wwell-ir page + wellbore panel — hairline gutters, a real type scale, an aligned bottom part

- **Ask:** "the bottom part is unaligned and random … make the fonts a little bigger, not easily readable" and "there is a lot of free space at the
  bottom, top and left of the page — fill it, leave only a line".
- **Gutters:** the page had ~40px of dead space per side (`.wwell-ir` padding 1.5rem + `.wwell-ir__detail-panel` .25rem + `.ire` .75rem) and
  20/10/11px gaps between cards. One `--wwell-gutter: 0.375rem` on `.wwell-ir` now drives the page padding and the master/detail gap
  (`wwell-ir.component.scss`), the editor's `.ire` gap and `.ire__body` gap (its padding is 0), the view page's `.irv` gap and view-layout gap
  (custom property, so it inherits). The Timeline preview sidebar is `--ire-preview-w: clamp(20rem, 27vw, 27rem)` (was fixed 320px; 389px at
  1440) — the diagram and its figures scale with its width. Sibling pages (requests / WLDA / land affairs) keep their own 1.5rem; not touched.
- **Type scale:** `--wbp-fs-micro/small/body/figure` = 11 / 12 / 13 / 17px on `.wbp`; nothing on the panel is under 11px now (it was 9.6–10.6px: eyebrows,
  strip labels, tile labels, legend, chips). Strip track 16→18px, lanes 14/18→17/21; `LABEL_FONT_PX` in the label placer 9.6→11 (it measures
  the labels it places — keep it equal to `--wbp-fs-micro`), `PIN_OFFSET_PX` 12→14 (the pump icon is 19px wide); container-query thresholds scaled.
- **Bottom part as one system** (it was a ragged flex-wrap legend, a pile of tiles with an odd fifth tile spanning the full row at twice the gauge
  length, and tables whose columns sized per row): every block is now an eyebrow + one bordered card, one rhythm (`--wbp-block-gap`).
  Legend = auto-fill grid with a fixed swatch column (labels shortened: "Water level", "Perforated" so two columns fit). Key depths = one list card:
  label left, figure right-aligned in mono, gauge under at one length for every row, the qualifier ("9″ Liner") beside the label (`WellboreStat`
  unchanged). Casing program / Formation tops share columns through `subgrid`. Wide forms (view page, Sections) lay the three cards side by side
  (`.wbp__data`); the Expand rail keeps its grid areas (`.wbp__data { display: contents }`).
- **The drawing's own type:** SVG text is set in viewBox units, so it printed at 9–10px in the sidebar and 6–9px in Expand (its figure is
  height-limited, scale 0.42). Sidebar: overrides in the panel SCSS (ruler/geologic 22 units, titles 18–19, total depth 23) and
  `WWELL_IR_SIDEBAR_DIAGRAM_LAYOUT` depth axis 105→124 wide (`depthAxisX` 72→91) so "3,800" at 22 units (66 wide, mono) is not clipped.
  Expand: the profile's header row now carries Cased / Open hole (−36px), the legend loses its eyebrow, the dialog is `min(96vh, 960px)` — scale
  0.42→0.52 — and the type is lifted a third (ruler 24, geologic 26, leader labels 26/21, in-bore sizes 28). Caps: the two-line titles ("Geologic
  Horizons", "DEPTH (FT BGL)") stay ≤19 units because the renderer's line spacing is fixed at 19–20 units — 23 made the lines overlap (seen, fixed).
- **Also fixed:** the view page uses `DIAGRAM_LAYOUT` (1040 units), where the casing remarks ("(Driven, cemented to surface)") ran ~25 units past the
  right edge and were cut mid-word; it now uses a copy 60 units wider (`LEADER_LABEL_ROOM`, local to `wwell-ir-view-well-design`).
- **Verified live (IR-9065; sidebar, Sections view, view-page Well Design, Expand; light + dark):** gaps measured 6px on all four sides; eyebrows and
  card tops line up across the three wide columns (identical `top`); readout reserves two rows so nothing shifts; tick labels clear of the viewBox edge
  (x-min 18 in Expand, 3+ in the sidebar before the extra axis room, now more). `ngc --noEmit`, ESLint, Sass (selectors removed vs the glass build: only the
  old tile/`:has`/`--top` rules, all replaced), full Jest (84 suites, 470) pass; no new specs (standing call).
- **Seen, not changed:** in the wide forms the shared renderer's "Static WL: 185 ft" label sits on the top geologic code ("DMM") — renderer-internal.

### wwell-ir wellbore panel — maximised view: no scrolling, one-line legend under the drawing, a calmer window

- **Ask:** "once we maximise the well bore view … it must not have any scrolling, everything visible, and the legends (Ground level, Water level,
  Casing, Liner, Open hole, Gravel pack, Liner screen, Formation top) must fit in one single line" — then, mid-work: "legends must be in the area
  of the wellbore view, minimize the gap in between, and reduce some size of the window".
- **Window:** `expand()` opens `min(max(92vw, 1240px), 98vw, 1760px)` × `min(max(92vh, 700px), 98vh, 1100px)` (was `min(96vh, 960px)`, then briefly
  98% / 2000×1240). The floors keep a small window whole (the figures need ~700px of height); the caps stop a 4K monitor adding only margin. The panel
  host inside the dialog is a size container (`.wp-wellbore-dialog app-wwell-ir-wellbore-panel { container: wbp-dialog / size }`), so
  `.wbp--expanded` re-grids by the dialog's own size.
- **Legend:** directly under the drawing, in the drawing's own column (`grid-area: legend`; the rail — `.wbp__data`, now a real grid item spanning
  the stage and legend rows — stands beside both). Eight entries in one non-wrapping flex row, centered, 18px between them (was spread over the
  whole dialog width); no eyebrow. Narrower dialogs (≤1190px) step the key down to 12px / 10px gaps (811 → 716px natural width); ≤1087px it wraps.
- **No scroll, by tier:** dense rail (gauge 12px, rows .22rem) fits a ≥816px-high dialog beside the drawing; `@container wbp-dialog (min-height:
  980px)` gives the rail its room back. Under 816px high (a 768–813px browser window) the three cards cannot stack (~570px), so
  `(max-height: 815px) and (min-width: 1140px)` puts them in two columns (Key depths 15rem | Casing program + Formation tops 13.5rem) beside the
  drawing and lets the key run under the drawing *and* the key depths (the drawing's column alone is ~690px, the key needs 811).
- **Drawing type:** SVG text is in viewBox units, so its on-screen size follows the drawing's scale. Stage ≤680px high lifts it a third (tick 24,
  geologic 26, leader 26/21 units); ≤600px lifts it once more (tick 28, geologic 29, leader 30, total depth 31). The casing remarks stay at 21
  units — at 24 they ran past the drawing's right edge and were cut mid-word (seen, reverted).
- **Verified live (IR-9065, dark + light):** dialog share, panel / rail scroll, legend rows and gaps, on-screen tick size — all no scroll, one legend
  row, 18px gaps, zero SVG text outside the drawing (probe in screen space): 1180×768 (tick 10.9px), 1240×768, 1280×720 (10.9), 1353×813 (12.3, the
  window in the user's last screenshot), 1366×768 (11.1), 1440×900 (14.5), 1512×982 (16.6), 1536×864 (13.6), 1920×1080 (12.3), 2560×1440 (14.2; dialog
  1760×1100). `ngc --noEmit`, ESLint, Sass, full Jest (84 suites, 470) pass; no new specs (standing call).
- **Limit (chosen):** a dialog narrower than ~1140px *and* shorter than 816px (a small browser window) keeps the single rail, which scrolls (315/208 at
  1090×768, where the key also wraps to two rows); three columns there shrink the drawing until its figures are 8–9px (scale 0.28–0.34), so the scroll is the lesser evil.
- **Seen, not changed:** the shared renderer's hover popover ("PLANNED DMM 120 ft") appears over the top geologic row when the pointer rests there.

### App shell — "Monolith" top bar + left nav, Light/Dark, Legacy switch (and an agwa-planning restart)

- **Ask:** put the Theme / Appearance control in the main top bar; redesign the left nav and top bar (logo image, icons, item order preserved); the shell
  follows Light/Dark; one toggle switches to the legacy (navy) shell; the dark shell must **not** be blue. Four mockups were shown; the user chose
  **B — "Monolith"** (pure black/white, Geist + Geist Mono, hairlines, 4px radii, active item = inverted block, red only for the bell badge and the lock chip).
- **Mechanism:** `WwellThemeService` gained `shell` (`'mono' | 'legacy'`, persisted as `wwell-shell`, written to `<html data-shell>`; `setLegacyShell()`,
  `isLegacyShell`). Component SCSS is split into partials scoped by `:host-context([data-shell=…])` — `_top-navbar-{mono,legacy}.scss`,
  `_left-sidenav-{mono,legacy}.scss` — so there is no template branching. **Legacy is the old SCSS verbatim, only re-scoped** (compiled output diffed:
  identical rule bodies apart from the scoping). `layout/_shell-theme.scss` holds the `--shell-*` tokens (light "Paper"; dark `#050505`-family neutrals)
  and `--shell-bar-h` (56px mono / 62px legacy), which `layout.component.scss`, the morning-report loading bar and the presentation canvas height now
  read instead of a hardcoded 62px.
- **Top bar:** flat 56px hairline; the 244px brand cell lines its hairline up with the rail edge; `<app-wwell-theme-toggle />` sits between the bell and the
  user menu (removed from the header of Requests, WLDA Approvals, Land Affairs Approvals and Integrated Requirements). The Appearance popover carries the
  Legacy switch (`role="switch"`).
- **Left nav:** 244 / 64px rail. A `li.sidenav__hl` glides behind the active item — `offsetLeft/Top/Width/Height` of `.sidenav__btn--active` are measured in a
  `requestAnimationFrame` (from an `effect` on `activeRoute`/`collapsed`, plus a `ResizeObserver`) into `--hl-x/-y/-w/-h`; `sidenav--glide` turns the
  transition on after the first placement, so the initial paint doesn't slide in from the corner.
- **Fixed after verifying live:** the mono bar was `content-box`, so 56px + the 1px hairline = 57px against `--shell-bar-h` and bar + content overflowed the
  viewport by 1px (814 vs 813) → `box-sizing: border-box` on the mono bar (legacy keeps its own 62 + 1, untouched by design). The username rendered in
  Arial because buttons don't inherit `font-family` → `button { font-family: inherit }` inside `.top-navbar`.
- **Verified:** full Jest 85 suites / 481 tests (new: theme-service spec ×6, top-navbar child-order test, sidenav order / single `aria-current` / highlight
  tests); `ng build` and ESLint clean on the changed files. Live (gstack browse, real mock-SSO login against the real backends): light, dark, legacy on/off,
  collapsed rail, user dropdown, Requests, Integrated Requirements at 1353×813 and 820×~800 — bar 56px, bar + content = viewport, no horizontal scroll,
  all eight nav items in the original order.
- **Left as is, by the user's call:** the broken footer logo (`assets/images/agwa-logo.svg`, 404) and the blue-tinted dark tokens of the planning pages
  (`#0f131a` family — they read slightly navy beside the true-black shell). No new tests beyond the above; nothing committed.
- **agwa-planning backend (checked and restarted at the user's request):** it was *listening* on 7070 but wedged — unauthenticated calls answered 401
  instantly, every authenticated call hung. Thread dump: all `executor-thread-*` parked on the `ReentrantLock` in `WriterHandler.doPublish`, reached from
  `RequestLoggingFilter.filter` (the first thing an authenticated request does; the 401 path never gets there). `lsof` showed stdin/stdout/stderr of both the
  `mvn quarkus:dev` launcher and the app JVM as `(revoked)` — the terminal that started them was gone, so console writes blocked while holding the log lock.
  Oracle was healthy, so not a database problem. Stopped exactly launcher 70814 + app 70898 (SIGTERM ignored → SIGKILL), restarted with
  `nohup ./mvnw -o quarkus:dev > <log> 2>&1 < /dev/null` so stdio is a file and `/dev/null` (log: the session scratchpad's `agwa-planning-dev.log`).
  Up in ~7s; `wells/eligible-for-ir`, `integrated-requirements`, `gwd-ops-members` → 200 in milliseconds, no token → 401.

### wwell-ir editor — a "+" button adds a row directly (Horizons, Casing, Area Water Wells)

- **Ask:** "to add a new record/row in Horizons, Casing, Area Well give a plus icon button — it opens one form — instead of click Edit and then click Add new; it is duplication."
- **Change:** each of the three sections' heads now has a `+` (`add`) icon button beside the pencil, grouped in the existing `.ire__section-actions`. It opens a
  **one-row form** — a card above the table (`.ire__add-block`) — built from the section's own schema `rowFields` as a flat section (`singleRowSection()` in
  `wwell-ir-editor.component.ts`). So Area Water Wells shows all 14 fields, not the table's 4, and Casing's Top-of-Liner appears when Type = Liner. The key
  fields are required in this form only (horizon: formation + depth; casing: type + size + depth; well: EP A Num + aquifer, already required). State is three
  `SectionEditState<FormGroup>` instances (`formationTopAdd` / `casingAdd` / `offsetWellAdd`) — the existing class, no new files.
  "Add" (`commitNewRow`) opens the section's own `SectionEditState` *silently* and appends the row to its live FormArray — the same array inline edits and deletes
  write to — then toasts "… added — click Save to apply." The section never flips into its big edit form. The pencil closes an open add form and opens the full one;
  the full form keeps its own "+ Add …" button (the New IR wizard still uses the repeatable group).
- **Duplicate guard:** Save matches rows on a natural key (horizon: formation; casing: type + size; well: EP A Num), so a "new" row whose key is already taken would
  silently overwrite that row as an UPDATE. `commitNewRow` refuses it with a warning and keeps the form open. `casingKey` / `topKey` / `waterKey` are now exported
  from `wwell-ir-payload.mapper.ts` and shared, so the guard can't drift from what Save does.
- **Deliberately not "unsaved":** an open, uncommitted add form is not part of `hasUnsavedChanges` — only rows already in the live arrays are (otherwise the
  Save / Discard / Stay prompt's "Save" would silently drop the half-typed row). `closeAllSections()` closes the add forms on record switch and after Save.
- **Verified live** (real mock-SSO login against the real backends; light and dark): each form opens in one click; required fields gate "Add"; the new row lands in the
  table; a second DMM horizon is refused with the form kept open; "+" on Casing doesn't collapse its step (click stopped from reaching the toggle); the pencil swaps
  the add form for the full form; inline row edit is unaffected. Save payload captured with `fetch` intercepted so **nothing was persisted** (the backend log shows zero
  writes): existing rows `action: ""`, new rows `INSERT`, and the well's TD / RPM / SWL — fields the inline row can't reach — made it into the water row.
- `ngc`, ESLint and the 7 wwell-planning Jest suites (73 tests) pass; no new specs (standing call for the wwell-ir redesign).
- **Seen, not changed:** the Horizons Sub-sea column shows floating-point noise (`212.29999999999995`) — `subSeaFt()` isn't rounded.

### wwell-ir — legacy HTML in General (Program Details) is parsed on load and saved back as plain text

- **Ask:** some legacy records hold HTML (`<p>`, `<br>`) in the General section's fields; "as soon as it's encountered, parse it, and once the user hits Save,
  update it — no HTML tags saved."
- **Root cause:** `stripLegacyIrHtml` (`wwell-ir-legacy-html.util.ts`) — which `mergeIrDetailBlocksIntoIntegratedRequirement` already applies to the eight Program
  Details columns (`completion`/`cmpl_type`, `acidization`, `dt_rmks`, `logging`, `mud_rmks`, `sampling`, `flow_rmks`, `dev_pump_test`) — only recognised the old
  `<HTML>…</HTML>` "Save As HTML" dumps (`/<html[\s>]/i`). These records hold bare rich-text fragments — `<p>…</p><p><br></p>` followed by plain option lines
  (`Open Hole`, `Screened`) — so they passed through with their tags.
- **Parser:** detection is now a whitelist of real tag names (html, body, p, br, div, span, font, b, i, u, s, strong, em, ul, ol, li, h1–6, a, sub, sup, hr, pre,
  blockquote, table, tr, td, th), so plain text with a stray `<` (`PWL < SWL`, `<5000 ppm`) is never rewritten. `<br>` and the closing `</p> </div> </li>
  </h1-6> </tr>` become line breaks; `DOMParser` decodes entities (`&nbsp;`, `&amp;`, `&quot;`); blank paragraphs (`<p><br></p>`) are dropped.
- **Save on an untouched record:** `saveAll()` answered "No changes to save." unless something had been edited, so opening a legacy record and pressing Save would never
  write the cleaned text back. The detail mapper now stamps `hasLegacyMarkup` (new optional `IntegratedRequirement` field) from the *raw* header values, and
  `saveAll()` lets a flagged record through — the header `UPDATE` then carries the cleaned text. It is deliberately not part of `hasUnsavedChanges` (that would
  raise the unsaved-changes prompt every time the user leaves a legacy record). It clears itself: every detail fetch, including the post-save refetch, recomputes it.
- **Verified:** parser against the exact strings from the user's screenshot plus edge cases (throwaway spec, deleted — no new specs, standing call): paragraphs →
  separate lines, option lines kept, `<HTML>` dumps still work, stray `<` untouched, idempotent. Live, with the detail response intercepted to inject those strings
  and writes blocked: the read view and all eight edit-form fields show no tags; Save with **no edits** now sends the record with clean text (no tags, no entities
  anywhere in the payload), while a clean record with no edits still answers "No changes to save." `ngc`, ESLint, full Jest (85 suites / 481 tests). One existing
  expectation (`wwell-ir.store.spec.ts`, "inserts the confirmed record") gained `hasLegacyMarkup: false`.
- **Not covered, for follow-up:** other remarks columns (`tops_remarks`, offset-well remarks, casing remarks, well-design flag remarks) don't go through the parser; and
  the backend letter's `LegacyIrTextUtil` (agwa-planning) has the same `<html`-only detection, so the PDF of a not-yet-re-saved record would still show raw `<p>` tags.
- **Seen in the data:** `;590`, `7;;`, `didn;t`, `9-5/8;` look like `&nbsp;` / `&quot;` / `&#39;` whose `&…` part was stripped before the value reached us — the quote
  characters are already gone from the stored text, so the parser can't restore them (entities still present in a value are decoded).
- **Dev backend log note:** it shows one write at 15:29 — an INSERT of an Area Water Well (EP A Num 3454, aquifer "test") on IR-9065. Not from my sessions (they block
  writes and hadn't opened 9065); it is a test row from another client, left alone.

### wwell-ir wellbore panel — Well Profile redesigned as a reusable component set ("Log tracks", Strata palette)

- **Ask:** replace the profile strip with direction B — log tracks on one depth axis — no design checks, a water drop at the static level, and select-a-block
  (highlight the span on the scale, and a coverage lane above the formations); Strata colours; and the profile "must be separate components so we can
  re-use, enable or disable easily any time".
- **Components** (`features/wwell-planning/shared/wwell-profile/`, all standalone / OnPush, barrel `index.ts`): `app-wwell-profile` (the strip: Covered /
  Formation / Casing / Water lanes on one axis, depth-reader slider, `selection = model()`), `app-wwell-profile-selection` (idle how-to, or what the
  selection covers with % bars; same `selection` model), `app-wwell-profile-hydrology` (yield hero + TDS / H₂S; `compact` for a rail short on height).
  Pure logic beside them: `wwell-profile.builder.ts` (diagram data → `WwellProfile`; structural `sameWwellProfile` so an unrelated edit doesn't drop the
  selection), `-coverage.util` (`coverageOf`), `-reading.util` (`readWellboreAt`), `-format.util`, `wwell-profile.model.ts`. No store — selection is a
  `model()` the host binds, which is also what lights the matching casing-program / formation-tops row (`wbp__row--lit`).
- **One switch:** `WWELL_IR_WELL_PROFILE_ENABLED` (`wwell-ir.config.ts`) is the default of the panel's `profileEnabled` input, so any place can override it.
  Off = the panel as it was before the strip (Key depths card back, no profile, no hydrology). Checked both ways live.
- **Hydrology path:** the IR diagram mapper deliberately leaves `hydrogeology: null` (`well-bore-view` marks the target top from it), so the hydrology
  travels on its own `hydrology` input — `buildWellboreHydrologyFromIntegratedRequirement(ir, liveHydrology?)`; the editor passes the live draft, so the card
  and the aquifer band follow an unsaved edit.
- **Colours:** `--wp-profile-*` tokens in `_wwell-theme.scss` (sandstone rock ramp, emerald aquifer, indigo selection, water wash, steel), light + dark,
  contrast-checked; nothing under 12px.
- **Removed:** the old strip / plate / pins / slider CSS (~630 lines of the panel's SCSS), `wwell-ir-wellbore-profile.util.ts`,
  `wwell-ir-wellbore-labels.util.ts`. The format helpers the facts util needed moved down into `wwell-profile-format.util.ts` (shared no longer depends on the feature).
- **Layout calls:** ≥1140px container (Expand dialog, wide view): left rail = Hydrology + Selection, right = tables. Narrower: the **Selection card is hidden**
  (the strip's chip and the lit table rows carry the selection) rather than stacked over the tables, and in the inline Well Design view the hydrology card
  is `compact` so all five Formation Tops rows still fit at 1353×813.
- **Found live and fixed:** (1) `.wprof button {background:none…}` beat every component class (steel bars, water column invisible) → a `bare-button` mixin;
  (2) the head readout wrapped in narrow views → single row, ellipsis, hint hidden; (3) no aquifer / hydrology → the `hydrology` input above;
  (4) **Escape cleared the selection and also closed the Expand dialog** → the strip now consumes Escape while something is selected; a second Escape closes.
- **Verified** (real SSO login, IR-9065 / HAIL_500, 1353×813, light + dark): idle, casing / formation / water selections (coverage lane, range bar + chip,
  Selection card, lit rows), Escape / Clear, slider readout, Expand from the view and from the editor preview, switch off. Edge data pushed through the editor
  *without saving*: liner shoe 4,000 ft > TD 3,800 (bar runs to TD + amber "shoe 200 ft below TD" flag) and pump 120 ft above the 185 ft water level (pin folds
  beside the drop; water label moves into the column). Builder / coverage / reader also run against 10 edge inputs (duplicate-depth strings, tops at one depth,
  no tops, no casings, water / pump outside the well, gravel-pack rows, TD 0). Dev build, `tsc`, ESLint and full Jest (85 suites / 481 tests) pass; no new specs (standing call).
- **Seen, not changed:** in the shoe-below-TD case the shared diagram's own "TOTAL DEPTH" label overlaps the liner — that is `well-bore-view`, not this panel.

### wwell-ir wellbore panel — a real 3D cutaway (Section ⇄ 3D)

- **Ask ("the current well bore view looks good but it is 2D — give proper 3D, use the best skill, look on the web / download / setup / refer"):** nothing
  was installed — Three.js 0.185 was already a dependency; cutaway technique and three docs were researched. Scope (asked): **all three panel forms** —
  compact sidebar, Expand dialog, View → Well Design "fit" form. The Presentation page stays 2D.
- **What it is:** a half-section cutaway — the back half of concentric cylinders, flat section planes on z≈0, half-ring caps (analytic, no stencil buffer).
  PBR (`RoomEnvironment` via PMREM, ACES); render-on-demand (IntersectionObserver / ResizeObserver, damped `OrbitControls`); a camera flight from face-on to
  the angled home view (skipped under reduced motion). Depth is to scale; widths follow the real casing sizes but are nested strictly, so strings never
  overlap (schematic). Strata use the profile strip's rock ramp (`bandRockSteps`, moved to `wwell-profile-rock.util.ts` — the strip's colours are unchanged).
  Colours are read from the `--wp-profile-*` tokens at runtime and a MutationObserver on `<html>` re-themes, so **any future theme flows through**.
  Selecting a casing / formation / the water column in the strip dims everything outside that span in 3D. Depth chips are stacked in depth order with SVG
  leader lines (12px, hidden in the compact sidebar). Orbit / zoom / pan, arrow keys, double-click and the Reset button.
- **Where:** `features/presentation/well-bore-view/real-3d/cutaway/` (new): `cutaway-plan.builder` (pure: data → slabs / bands / markers), `-labels.util`,
  `-palette`, `-textures`, `-materials`, `-scene`, `-engine`, `app-wellbore-cutaway`. Panel: Section/3D toggle, Reset, and a fallback to Section when WebGL
  is missing or lost (`webglUnavailable`). Only change to the old `real-3d` code: `CasingEntry` / `resolveCasingEntries` in `casing-3d.builder.ts` are exported.
- **Lazy, and a gotcha:** `@defer (on immediate)`; the 3D chunk is ~610 kB min / ~157 kB gzip (three 556 kB, new code 16 kB; esbuild measure) and is fetched
  only on first 3D. `viewChild(WellboreCutawayComponent)` in the panel's TS **silently stopped Angular splitting it** — three.js landed in the `WwellIrComponent`
  route chunk. Now a `#cutaway` template ref typed `CutawayViewHandle` (in the three-free `cutaway.types.ts`); the class is named only in `imports`.
  Checked in a dev build: the three chunk is referenced only by a dynamic `import()` and `main.js` never reaches it.
- **Jest:** `jest.config.js` `transformIgnorePatterns` allow-list gains `three/examples/jsm` (ESM addons). jsdom has no WebGL, so the engine has no unit
  test; the plan builder (18) and label layout (8) were written test-first. No more specs (standing call — said again this session; three specs started
  for the palette / scene / component were deleted).
- **Verified** (a CDP-driven software-WebGL Chrome — the gstack browser cannot create a WebGL context; IR-9065 / HAIL_500, 1353×813, dark + light):
  sidebar, Expand dialog (opens in 3D when the inline panel was), fit form (no page scroll, strip head clear of the tools), selection dimming, orbit drag →
  Reset, theme flip, and the no-WebGL fallback (seen in the gstack browser). `tsc` (app + spec), ESLint and full Jest (87 suites / 507 tests) pass; no console
  errors beyond the existing broken-logo 404.
- **Seen, not changed:** (1) `ng build` (production) **fails on the `anyComponentStyle` budget** — `wwell-ir-editor.component.scss` is 34.35 kB against 32 kB;
  that file and everything it `@use`s are identical to HEAD, so it predates this work. (2) The old `real-3d` engine / builders (`wellbore-3d-view` …) are still
  unused. (3) The 2D legend still shows under the 3D view. (4) The premium light / dark theme redesign (directions A–D) still waits on a pick; nothing of it is in the repo.

## 2026-09-22

### wwell-ir wellbore panel — the 3D is now a front cut section (a solid block, seen nearly face-on)

- **Ask ("i dont like the 3d … use ur own best decision … see attached, it looks front cut section"):** the reference is a wide, near face-on block
  with a patterned cut face, a round bore through it and pill labels on the right — not an orbiting pipe. The first 3D (a narrow half-cylinder shell seen at
  ~30° / 11°) was replaced; the engine, plan, scene and panel wiring are the same modules, reworked.
- **Composition:** the block is a real box (`plan.shellRadius` = its half-width 13.6, `plan.blockDepth` 9 — about 2/3 as wide as tall) with the well slimmed
  (widest string 4.4) so it reads as a channel through ground. Home view is near face-on: azimuth −0.26 rad, elevation 0.12, so the left side and the top (with
  the bore's half-round rim) show. The room for the chips is a **projection offset** (`camera.setViewOffset`), not a shifted orbit target, so orbiting spins
  the block in place. The top / bottom faces are the block less the bore (`ShapeGeometry` with an `absarc` notch); sides and back are flat planes.
- **Cut face:** lithology-style hatch by depth order (stipple → brick → bedding lines → coarse blocks → cross, zigzag for the target aquifer), coarser tiles
  (`ROCK_TILE` 6.4 units), drawn nine times per tile so repeats have no seam, and registered to the world (`tileToWorld`) so a pattern runs on across depth
  slabs. A hairline (`LineSegments`) outlines the face and marks each formation top. **The patterns tell layers apart; the well design carries no lithology, so
  they are not a claim about the rock.**
- **Labels:** pills (glass fill, 12px Geist Mono, a lit dot for water and TD) in one aligned column; each leader starts on the block's silhouette edge
  (front or back edge, whichever is further right on screen). `--wp-font-mono` / `--wp-font-ui` / `--wp-font-display` now exist as custom properties.
- **Verified live** (CDP software-WebGL Chrome, dark + light): fit form, compact sidebar, Expand dialog; orbit → Reset still works. `tsc` (app + spec), ESLint
  and full Jest (87 suites / 507 tests) pass. No new specs (standing call); the plan builder's existing specs pass unchanged.

### App theme — "Aurora Glass" (direction A) replaces the monochrome "Instrument" / "Monolith" look

- **Ask:** implement the Aurora Glass A theme from the direction previews (the user's earlier complaint: white buttons on dark, black buttons on light, plain type).
- **Palette:** `_wwell-theme.scss` re-mapped, both themes, still riding the contrast dials (`dark-tone` / `light-tone`): deep navy / cool paper grounds, sky
  (`#7dd3fc` dark, `#0b62c4` light) as the signal colour, rounder radii (8 / 12 / 18, buttons 12). Scripted check across the dial at 0/25/50/75/100%: every text
  tier ≥ 4.5:1, control outlines ≥ 3:1, gradient-button text ≥ 4.6:1 at every stop, shell text ≥ 4.5:1 on the frosted bar / rail over the worst aurora pool.
- **Primary action:** an aurora gradient (`--wp-cta-bg`: cyan→blue with navy ink in dark, sky→cobalt with white ink in light), glow lifting on hover. Written once in
  `styles.scss` (`.mat-mdc-unelevated-button`) and **switched on per module by `wmat.buttons`**, which sets inherited `--wp-btn-*` custom properties; anywhere they
  are unset every declaration falls back to Material's own value, so buttons in other features are unchanged. (Doing it with per-component `::ng-deep` blocks put
  ~1.5 kB into each of ten component styles and pushed the editor further past its error budget.)
- **Shell:** `_shell-theme.scss` rewritten — bar and rail are frosted (`backdrop-filter`), the current page is a tinted, ringed pane (never an inverted block),
  the avatar is a gradient circle, Outfit for the brand. The layout paints the aurora (`--wp-atmosphere`) and grain once on `.dashboard`; pages are transparent over
  it in the mono shell (`--wp-page-bg`), opaque in Legacy. Legacy still works (checked).
- **Glass:** `glass-panel` mixin (`--wp-panel-bg` / `-shadow` / `-blur`) on the IR list, detail header, tabs, approval card, editor header / sections / footer, and
  the Requests / WLDA / Land Affairs masters, detail headers and cards. Flat surfaces stay flat for controls and tables.
- **Type:** Outfit (new dependency `@fontsource-variable/outfit`, self-hosted like Geist) for page and panel headings; Geist and Geist Mono as before.
- **Verified live** (dark + light): IR editor, Well Design (fit form), compact sidebar, Expand dialog, Requests page, Appearance popover, Legacy shell.
- **Seen, not changed:** (1) `ng build` production still fails on the `anyComponentStyle` error budget — `wwell-ir-editor.component.scss` is 35.23 kB against 32 kB
  (34.35 before this theme; it was already over); the request forms sit ~80 bytes over the 20 kB warning. (2) Pages outside wwell-planning (dashboard, active-wells,
  presentations, morning report) keep their own styles — only the shell chrome and the transparent layout background reach them. (3) Dialog surfaces stay opaque
  (`--wp-surface-raised`); frosting them would need a blur on the overlay. (4) ~~The old `real-3d` builders are still unused~~ — wrong: the Presentation page's 3D toggle uses them (see the removal entry below). (5) The broken-logo 404 and its toast.

### wwell-ir — the 3D is removed; the view screen gets a type step-up

- **Ask:** "i dont like 3d lets remove it and also improve the view screen … same fonts typography, font size a little bigger etc".
- **3D removed:** `real-3d/cutaway/` deleted; the wellbore panel's Section/3D toggle, Reset and `@defer` block gone (panel restored to its pre-3D form, keeping only
  the Outfit `.wbp__heading`); `bandRockSteps` / `wwell-profile-rock.util.ts` gone (the strip computes its steps locally again); the `three/examples/jsm` Jest
  allow-list and the `casing-3d.builder.ts` exports reverted. **Left alone:** the Presentation page's own 3D toggle (`wellbore-view-toggle` →
  `real-3d/wellbore-3d-view`) — it is used and has a spec — so `three` stays installed. Say the word to remove that too.
- **View screen** (`wwell-ir-view/*`): header title 17.6 → 20.8px (Outfit), eyebrow / progress / status pill 12 → 13px, tabs 14 → 15px with a ringed active pane,
  card titles Outfit 15px (they were Geist 13px on the KV and Well Design cards), field labels 12 → 13px, values 14 → 15px / weight 500, table heads 13px and cells
  15px. Cards are glass panes like the rest of the app (`view-card` / `view-card-title` mixins in `wwell-design-tokens.scss`). Identifiers and measurements
  (IR #, Letter Number, depths, coordinates, TDS / rate / H2S, numeric table cells) are Geist Mono via a new optional `KvRow.mono`. The Letter's masthead and section
  headings are Outfit and its Date / IR # / Letter # are mono (body stays 14px). The approval card's title and its timeline text are a step up, through
  `--wtl-fs` / `--wtl-name-fs` on the shared vertical timeline (unset elsewhere, so WLDA / Land Affairs approvals are unchanged).
- **Editor header** given the same metrics as the view header (both 68px) so switching Edit ⇄ View doesn't shift.
- **Two of my own regressions caught live and backed out:** widening the approval sidebar 200 → 232px squeezed the Well Design panel until its profile strip clipped
  "Water level"; a 15px Letter body made the Coordinates / Surface Elevation pairs wrap. Both stay at their old values. The Offset Water Wells table (14 columns)
  overflowed its card at the larger type — its headings now wrap and cell padding is 0.5rem, so all 14 columns fit at 1353px.
- **Checked:** `tsc` (app + spec), ESLint on `wwell-planning`, full Jest (85 suites / 481 tests — the two cutaway specs went with the folder); Details / Well Design /
  Letter and the editor screenshotted live in dark and light. No new specs (standing call).
- **Seen, not changed:** `ng build` production still fails on `wwell-ir-editor.component.scss` (≈35.2 kB vs the 32 kB error budget; it was over before this work).
