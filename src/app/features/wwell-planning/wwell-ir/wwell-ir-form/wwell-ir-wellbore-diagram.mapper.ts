import { WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import {
  IntegratedRequirement,
  IntegratedRequirementCasingRow,
  IntegratedRequirementFormationTop,
  IntegratedRequirementWellDesignFlags,
} from '@models/wwell-planning/integrated-requirement.model';
import { ICasingIR } from '@shared/models/wwell/casing-ir.model';
import { IDrlgCsg } from '@shared/models/wwell/drlg-csg.model';
import { ITopsIR } from '@shared/models/wwell/tops-ir.model';
import { IWellDesign } from '@shared/models/wwell/well-design.model';
import { parseInchSize } from '@shared/utils/wellbore-math.util';
import {
  WwellIrFormRawValue,
  WwellIrRawCasingRow,
  WwellIrRawFormationTop,
  WwellIrRawHydrology,
  WwellIrRawProgramMain,
  WwellIrRawReference,
} from './wwell-ir-form.types';

/**
 * Adapts IR data into the `WellboreDiagramData` shape the shared `app-well-bore-view` component
 * (presentation/well-bore-view) expects — so both the wizard (live, still-being-edited raw form
 * value) and the read-only IR detail page (a submitted `IntegratedRequirement`) can embed that
 * component unmodified: the wizard as an always-animated "Well Design View" step
 * (`buildWellboreDiagramData`), the detail page as a static as-submitted diagram
 * (`buildWellboreDiagramDataFromIntegratedRequirement`).
 *
 * An Integrated Requirement is always a plan, never an as-drilled record, so no `drlgCasings`
 * entry produced here ever carries a real bottom depth (`wCsgBotDpth`/`wLnrBotDepth`).
 * `well-bore-view`'s renderers only switch a casing/liner to the green "actual" gradient when
 * a matching `drlgCasings` row has a real bottom depth — so every shape here always renders
 * with the steel/silver "planned" gradient, even though `drlgCasings` is no longer always
 * empty (see `buildLinerTopAnchors` below).
 */

const LINER_TYPE = 'Liner';

/**
 * A freshly added (or still-mid-edit) Casing/Formation Top row starts out with empty/null
 * field values — but `mat-select`/number inputs still exist and produce SOME value the moment
 * a user makes any single selection (e.g. just picking "Liner" from the Type dropdown before
 * touching Size or Depth). Mapping every row unconditionally meant a half-filled row already
 * rendered a shape/label on the diagram (a "Liner @ 0" annotation with no real size or depth
 * behind it) as soon as it existed, rather than once it actually described something real. These
 * gates require every field the diagram actually draws from before a row counts — reused by both
 * the Subsurface & Construction step's live preview and the Well Design View step (both call
 * `buildWellboreDiagramData`).
 */
function isRenderableCasingRow(row: WwellIrRawCasingRow): boolean {
  return !!row.type && !!row.sizeIn && row.depthFtBgl !== null && row.depthFtBgl !== undefined;
}

function isRenderableFormationTop(row: WwellIrRawFormationTop): boolean {
  return !!row.name && row.depthFt !== null && row.depthFt !== undefined;
}

const COMPLETION_OPEN_HOLE = 'Open Hole';
const COMPLETION_SCREENED = 'Screened';
const COMPLETION_SCREENED_GRAVEL_PACK = 'Screened + Gravel Pack';
const COMPLETION_LINER_PERFORATED = 'Liner + Perforated';
/** Used to be the 5th `WWELL_COMPLETION_OPTIONS` entry (wwell-planning-reference-data.config.ts) —
 *  was never wired into `deriveCompletionElementFlags` below, so picking it left every completion-
 *  element flag 'N' (same as picking nothing at all): with no Casing/Formation Top rows either,
 *  the whole Wellbore Preview card would silently vanish instead of drawing anything. Maps to the
 *  same `perforatedFlg`/`resolvePerforatedIntervalInfo`/`renderPrePerforatedLiner` path "Liner +
 *  Perforated" uses — that renderer already handles the no-target-liner case gracefully (falls
 *  back to a generic "Perforated Interval" label via its own `perfTitle`/`linerOdSz: null`
 *  branch, see wellbore-depth.helpers.ts's `resolvePerforatedIntervalInfo`), which is exactly
 *  "perforated through casing, no liner implied" — the distinction "Liner + Perforated" 's own 7"
 *  liner convention doesn't apply to.
 *
 *  Removed from `WWELL_COMPLETION_OPTIONS` itself (no longer pickable in the Completion dropdown)
 *  — kept here, still checked below, purely so a previously-saved record whose `completion` text
 *  already contains this exact line keeps deriving the same flags/remarks it always did, instead
 *  of silently reverting to 'N' the next time it's opened and saved. */
const COMPLETION_CASED_PERFORATED = 'Cased & Perforated';

/**
 * `requestReference.targetDepthFt` has no backing column on `exad_gwd_ir_header` itself — see
 * `wwell-ir-summary.mapper.ts`'s `targetDepthFt: 0` (the list endpoint still always reads back 0).
 * It's read-only in the UI and now DOES round-trip for a record linked to a well, sourced from
 * that well's own `exad_rcd_prewap.target_dpth` (see `mergeIrDetailBlocksIntoIntegratedRequirement`
 * — the linked-well GET join, not exad_gwd_ir_header) — but an IR with no linked request still has
 * no source for it at all, and reads back 0 the same as before. This fallback below covers exactly
 * that remaining gap: whenever `targetDepthFt` isn't a real positive number (no link yet, or the
 * link's own well has no target_dpth), the diagram falls back to this fixed placeholder depth so
 * completion elements (Open Hole, Gravel Pack, Liner Screen, Perforated Interval — see
 * `resolveCompletionBottomDepth`'s 'none'/'single-fallback' rule kinds, which draw straight down to
 * `totalDepth`) still get a sensible depth to draw against instead of collapsing to zero height at
 * ground level. A real positive `targetDepthFt` (from the linked well, or typed this session before
 * any reload) always wins over this fallback — see `assembleWellboreDiagramData` below.
 */
const STATIC_TARGET_DEPTH_FT = 1000;

/**
 * Never used to match a real casing — `casing.renderer.ts` / `wellbore-depth.helpers.ts`
 * match `drlgCasings` rows to casings by `wCsgOdSz === csg.csgSize`, so this sentinel must be
 * a value no user-entered casing size could ever equal. Only `buildLinerTopAnchors`' rows use
 * this; they're read exclusively through `wLnrOdSz`, never `wCsgOdSz`.
 */
const LINER_ANCHOR_SENTINEL = '__wwell_ir_liner_anchor__';

/** Same sentinel role as `LINER_ANCHOR_SENTINEL` above, for `buildShoeAnchorFallback`'s row —
 *  never used to match a real casing or liner. */
const SHOE_ANCHOR_SENTINEL = '__wwell_ir_shoe_anchor__';

/**
 * `casing.renderer.ts`'s `getCasingTier` derives each casing's on-screen half-width purely
 * from its position in this array via `indexOf` (tier 0 = narrowest, each later tier wider) —
 * it never reads `csgSize` for width, only for the text label. It also paints casings in this
 * same array order, later entries on top, so whichever entry ends up widest is also drawn last
 * — the standard "wide, shallow casing painted over a narrow, deep one" telescoping look.
 *
 * Sorting by SIZE (ascending — smallest first, so the largest entered size lands last/widest)
 * is what makes width actually track the number the user typed, rather than depth order. For
 * well-formed data (size decreasing with depth, real telescoping construction) this produces
 * the exact same order as depth-descending would — size and depth are inversely correlated
 * there, so there's no behavior change for the common case. It only diverges for physically
 * inverted rows (a deeper casing entered wider than a shallower one, flagged separately by
 * `findInvertedCasingSizeRows` in wwell-ir-casing-warnings.util.ts) — there, the wider-but-
 * deeper entry now paints last and can fully cover the narrower-but-shallower one in their
 * overlapping depth range, since two casings can't actually nest that way in reality either.
 * That's an unavoidable consequence of a genuinely invalid combination, not a rendering bug —
 * see `casing.renderer.ts` (off-limits to edit) for why: `buildCasingPath` always draws a
 * casing as a full tube from ground level (0) to its own depth, so the only way to reflect its
 * real entered size is via this array's order.
 *
 * Unparseable sizes sort as 0in (narrowest/first) — the safest fallback, since
 * `isRenderableCasingRow` already guarantees `sizeIn` is non-empty text, just not necessarily
 * a `parseInchSize`-recognizable number.
 */
function mapCasings(rows: readonly WwellIrRawCasingRow[]): ICasingIR[] {
  const casings: ICasingIR[] = rows.map(row => ({
    csgSize: row.sizeIn,
    csgType: row.type,
    csgDepth: row.depthFtBgl ?? 0,
    csgRemarks: row.remarks || null,
  }));
  return [...casings].sort((a, b) => (parseInchSize(a.csgSize) ?? 0) - (parseInchSize(b.csgSize) ?? 0));
}

/**
 * The wizard's "Top Of Liner (TOL)" field (`tolFtBgl`, shown only for Liner rows) is optional —
 * most IR liners never get one filled in. `liner.renderer.ts`'s `rawLinersFromIR` only treats
 * `wLnrTopDepth` as a genuine top-of-liner value (and shows the "TOL @ ..." label/tooltip row)
 * when `LinerEntry.hasActualTop` is true, which it derives straight from whether this anchor's
 * `wLnrTopDepth` is a real positive number — so this must leave `wLnrTopDepth` unset (`null`)
 * whenever the user hasn't entered one, rather than silently filling it with a computed guess
 * that would then get mislabeled as a real measured depth.
 *
 * This builds synthetic `IDrlgCsg` "anchor" entries carrying ONLY `wLnrTopDepth` (when
 * provided) per liner — never `wLnrBotDepth` or a real `wCsgOdSz` — because `rawLinersFromIR`
 * gates `hasActual` (and therefore the green-vs-silver color choice) strictly on
 * `wLnrBotDepth`, and gates the casing-actual lookup strictly on `wCsgOdSz`. Leaving both unset
 * keeps every casing and liner silver.
 *
 * When TOL is left blank, `rawLinersFromIR` falls back to its own `chainTop` chaining instead:
 * the shallowest liner hangs from the deepest structural casing's shoe; each deeper liner hangs
 * from the liner immediately above it (matching the physical assumption already baked into
 * `renderLinerShapes`'s `hangerY`). Casing rows whose type is Conductor, Surface, Intermediate,
 * or Production are all "structural" here — anything that isn't `'Liner'`, exactly matching how
 * casing.renderer.ts itself distinguishes casing from liner (`csgType !== 'Liner'`).
 *
 * An explicit `tolFtBgl` doesn't otherwise perturb that chain: the next liner's fallback top is
 * still this row's own `depthFtBgl` (its shoe), not its `tolFtBgl`, since a liner physically
 * hangs from the casing/liner above it regardless of how far down its own top was entered.
 */
function buildLinerTopAnchors(rows: readonly WwellIrRawCasingRow[]): IDrlgCsg[] {
  const linersShallowToDeep = rows
    .filter(row => row.type === LINER_TYPE)
    .slice()
    .sort((a, b) => (a.depthFtBgl ?? 0) - (b.depthFtBgl ?? 0));

  return linersShallowToDeep.map(row => ({
    wCsgOdSz: LINER_ANCHOR_SENTINEL,
    wCsgBotDpth: 0,
    wLnrOdSz: row.sizeIn,
    wLnrTopDepth: row.tolFtBgl ?? null,
    wLnrBotDepth: null,
  }));
}

/**
 * Lets Open Hole / Screened / Screened + Gravel Pack draw immediately from Program Details, even
 * before a single Casing row has been entered — otherwise `completion.renderer.ts`'s
 * `renderOpenHoleAndScreen`/`renderGravelPackDesign` both bail out on `!casings.length &&
 * !drlgCasings.length`, since with zero casing rows `casings` is `[]` and `buildLinerTopAnchors`
 * above also returns `[]` (no Liner rows either). Only fires when there are no renderable Casing
 * rows at all — once one exists, `casings.length > 0` already satisfies that guard on its own.
 *
 * Deliberately NOT added to `casings` — it must never itself look like a declared casing. Kept to
 * `drlgCasings`, with `wCsgBotDpth: 0`, so it stays invisible everywhere that array is read:
 * - `uniqueCasingsByOd`/`resolveLastCasingShoe` (casing.renderer.ts / liner.renderer.ts) both skip
 *   any entry with `wCsgBotDpth <= 0`, so `renderCasingsFromActual`'s "no IR casing plan" fallback
 *   path never draws a phantom casing pipe from it.
 * - `rawLinersFromDrlg` (liner.renderer.ts) requires a truthy `wLnrOdSz`, left unset here, so it's
 *   never mistaken for a liner either.
 * - `resolveShoeDepth`'s `drlgCasings[0]?.wCsgBotDpth ?? 0` fallback reads `0` from this row —
 *   the exact same value it already returns when `drlgCasings` is empty — so the completion
 *   interval anchors at ground level (`resolveLinerRule`'s `kind: 'none'` case) with no other
 *   change in behavior. The element then spans ground level → target depth, the same placeholder
 *   interval already used whenever no liner qualifies, until real Casing rows give it a real shoe.
 */
function buildShoeAnchorFallback(renderableCasings: readonly WwellIrRawCasingRow[]): IDrlgCsg[] {
  if (renderableCasings.length > 0) return [];
  return [{ wCsgOdSz: SHOE_ANCHOR_SENTINEL, wCsgBotDpth: 0, wLnrOdSz: null, wLnrTopDepth: null, wLnrBotDepth: null }];
}

function mapGeologicTops(
  rows: readonly WwellIrRawFormationTop[],
  surfaceElevationFtAsl: number | null,
): ITopsIR[] {
  return rows.map(row => {
    const planTvdDepth = row.depthFt ?? 0;
    return {
      stLongCd: row.name,
      planTvdDepth,
      planSsDepth: surfaceElevationFtAsl !== null ? surfaceElevationFtAsl - planTvdDepth : 0,
    };
  });
}

const FLOW_TEST_TYPE = 'flow-test';

/**
 * Derives the water-level fields `water-level.renderer.ts`'s `renderWaterLevel` reads —
 * `wellDesign.staWaterLvl` (a bare number, the actual depth it draws the line at) and
 * `wellDesign.swLvlTxt` (free text: presence of "flow" anywhere in it is that renderer's own
 * flag for "this is a flowing well, not a static level" — see its `isFlowing` check — and for a
 * flowing well it also re-parses the psi value straight back out of this same string via
 * `parseSiwhpPsi`, rather than taking a separate numeric field).
 *
 * Mirrors the Estimated Hydrology step's own test-type split (see `buildHydrogeologyRows` in
 * wwell-ir-detail-rows.util.ts): a flow test's wellhead pressure (SIWHP) draws as an above-ground
 * riser, a pump test's estimated water level draws as a below-ground line — the renderer can only
 * ever draw one of the two per well, same as the form only ever collects one.
 */
function buildWaterLevelFields(hydrology: WwellIrRawHydrology): Pick<IWellDesign, 'staWaterLvl' | 'swLvlTxt'> {
  if (hydrology.testType === FLOW_TEST_TYPE) {
    return hydrology.siwhpPsi !== null
      ? { staWaterLvl: null, swLvlTxt: `Flowing — SIWHP: ${hydrology.siwhpPsi} psi` }
      : { staWaterLvl: null, swLvlTxt: null };
  }

  return hydrology.estimatedWaterLevelFt !== null
    ? { staWaterLvl: hydrology.estimatedWaterLevelFt, swLvlTxt: `Static WL: ${hydrology.estimatedWaterLevelFt} ft` }
    : { staWaterLvl: null, swLvlTxt: null };
}

/**
 * Derives completion-element flags/remarks from the "Completion" dropdown (Program
 * Details step) plus, for Open Hole, the conditionally-shown "Open Hole Size" field.
 * `well-bore-view`'s renderers gate Open Hole strictly on a parseable inch size in
 * `ohRemarks`, and Gravel Pack / Liner Screen strictly on non-empty remarks text — the
 * constant fallback labels below exist only to satisfy those gates when the dropdown
 * implies the element but no free-text remarks field exists for it in this form.
 *
 * "Liner + Perforated" only actually renders once a Casing-table Liner row is exactly 7"
 * OD — that 7" convention is hardcoded inside liner.renderer.ts (PRE_PERF_LINER_SIZE_IN)
 * and is intentionally left untouched here.
 *
 * Water level / pump depth (`pump-and-depth.renderer.ts`'s `renderPump`, gated on `pumpLvl`)
 * come from the Estimated Hydrology step instead — see `buildWaterLevelFields` above.
 * `estimatedPumpDepthFt` is only ever populated for a pump test (see the field's own
 * `visibleWhen` in wwell-ir-form.schema.ts), so it's naturally `null` — no pump drawn — on a
 * flow-test record.
 */
/**
 * `programDetails.main.completion`'s field is `type: 'rich-textarea'` (see its own comment in
 * wwell-ir-form.schema.ts), NOT a single-pick select — `WwellRichTextareaComponent` lets any
 * number of `WWELL_COMPLETION_OPTIONS` be checked at once, and each checked option becomes its
 * own `\n`-joined line in the control's plain-text value (see that component's own doc comment
 * and `toggleOption`/`commitFromBox`). Checking both "Open Hole" and "Screened", for instance,
 * commits the control as `"Open Hole\nScreened"`, never the bare string `'Open Hole'` — so
 * `deriveCompletionElementFlags` below must check "is this option one of the checked lines?", not
 * "does the whole value equal this option?". A straight `completion === COMPLETION_OPEN_HOLE`
 * only ever matched the single-selection case; checking two or more options (or an option plus a
 * free-typed line) always fell through to every flag being 'N', which is exactly why the DB never
 * saw any flag flip to 'Y' once more than one box was checked.
 */
function selectedCompletionLabels(completion: string): ReadonlySet<string> {
  return new Set(
    completion
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0),
  );
}

/**
 * The completion-element flag/remarks derivation itself — pulled out of buildWellDesignFromForm
 * so wwell-ir-payload.mapper.ts's buildWellDesignRow can compute the exact same
 * exad_gwd_well_design.{oh,gp,perforated,ls}_flg/remarks values for the actual save payload,
 * rather than these two call sites drifting apart. See IntegratedRequirementWellDesignFlags'
 * own doc comment for why the real table needs these written, not just this app's own
 * `completion` text.
 */
export function deriveCompletionElementFlags(
  completion: string,
  openHoleSizeIn: string | null,
): IntegratedRequirementWellDesignFlags {
  const selected = selectedCompletionLabels(completion);
  const isOpenHole = selected.has(COMPLETION_OPEN_HOLE);
  const isGravelPack = selected.has(COMPLETION_SCREENED_GRAVEL_PACK);
  const isScreened = selected.has(COMPLETION_SCREENED) || isGravelPack;
  const isLinerPerforated = selected.has(COMPLETION_LINER_PERFORATED);
  const isCasedPerforated = selected.has(COMPLETION_CASED_PERFORATED);
  const isPerforated = isLinerPerforated || isCasedPerforated;
  const ohSizeText = openHoleSizeIn?.trim() || null;

  return {
    ohFlg: isOpenHole ? 'Y' : 'N',
    // exad_gwd_well_design has no column of its own for the open hole size — oh_remarks is the
    // only place it can travel to the backend, so it's baked in as "<size> Open Hole" (matching
    // this app's other size-prefixed labels, e.g. perforatedRemarks' '7" Pre-Perforated Liner',
    // and completion.renderer.ts's own hardcoded '8 1/2" Open Hole' fallback). See
    // `parseOpenHoleSizeFromRemarks` for the reverse: pulling the size back out on load.
    ohRemarks: isOpenHole && ohSizeText ? `${ohSizeText} ${COMPLETION_OPEN_HOLE}` : null,
    gpFlg: isGravelPack ? 'Y' : 'N',
    gpRemarks: isGravelPack ? 'Gravel Pack' : null,
    perforatedFlg: isPerforated ? 'Y' : 'N',
    perforatedRemarks: isLinerPerforated ? '7" Pre-Perforated Liner' : isCasedPerforated ? 'Cased & Perforated' : null,
    lsFlg: isScreened ? 'Y' : 'N',
    lsRemarks: isScreened ? 'Screen' : null,
  };
}

/** Reverses the `"<size> Open Hole"` encoding `deriveCompletionElementFlags` bakes into
 *  `ohRemarks` above — the only way the open hole size round-trips through a save/reload, since
 *  there's no dedicated backend column for it. Anything that doesn't end in the expected suffix
 *  (a legacy record saved before this encoding existed, or genuinely unrelated free text) is left
 *  blank rather than guessed at. */
export function parseOpenHoleSizeFromRemarks(ohRemarks: string | null | undefined): string | null {
  if (!ohRemarks) return null;
  const suffix = ` ${COMPLETION_OPEN_HOLE}`;
  if (!ohRemarks.endsWith(suffix)) return null;
  return ohRemarks.slice(0, -suffix.length).trim() || null;
}

/**
 * True once any completion element flag is 'Y' — the same "is a completion element actually
 * selected" test `deriveCompletionElementFlags`' four callers each need, whether the flags came
 * from a live Completion pick or a persisted `wellDesignFlags` row. Used by the emptiness gates
 * below so a record with only a well_design row (no Casing/Formation Top data at all) still shows
 * the diagram instead of the empty state — see `hasWellboreDiagramData` and
 * `hasWellboreDiagramDataForIntegratedRequirement`.
 */
function hasCompletionElementFlags(flags: IntegratedRequirementWellDesignFlags | null | undefined): boolean {
  return !!flags && (flags.ohFlg === 'Y' || flags.gpFlg === 'Y' || flags.perforatedFlg === 'Y' || flags.lsFlg === 'Y');
}

/**
 * `persistedFlags` — `ir.programDetails.wellDesignFlags`, the real exad_gwd_well_design row a GET
 * fetched back (see IntegratedRequirementWellDesignFlags) — wins over re-deriving from
 * `programMain.completion` whenever it's available: `completion` (exad_gwd_ir_header.completion,
 * VARCHAR2(4000) free text) and the well_design flags are two separately-persisted columns/tables
 * that this app always writes together (buildWellDesignRow), but nothing stops them disagreeing —
 * a record saved before this flags round-trip existed, a legacy/imported row, or any write to
 * exad_gwd_well_design from outside this app entirely. Trusting the actual fetched flags over a
 * re-derivation is what makes the diagram match what's really in the DB rather than silently
 * going blank whenever the two drift apart. Only the live-editing path (no fetched record to trust
 * yet, or the user is actively picking a new Completion — see buildWellboreDiagramDataFromIntegratedRequirement)
 * falls back to deriving from `programMain` itself.
 */
function buildWellDesignFromForm(
  programMain: WwellIrRawProgramMain,
  hydrology: WwellIrRawHydrology,
  persistedFlags?: IntegratedRequirementWellDesignFlags | null,
): IWellDesign {
  return {
    name: null,
    prewapSeq: null,
    ...buildWaterLevelFields(hydrology),
    pumpLvl: hydrology.estimatedPumpDepthFt,
    ...(persistedFlags ?? deriveCompletionElementFlags(programMain.completion, programMain.openHoleSizeIn || null)),
  };
}

/** Shared tail for both entry points below — takes already-normalized raw rows so the actual
 *  gating/mapping (isRenderable*, mapCasings, buildLinerTopAnchors, mapGeologicTops,
 *  buildWellDesignFromForm) is written once regardless of whether the source was a live,
 *  still-being-edited form value or a submitted `IntegratedRequirement`. */
function assembleWellboreDiagramData(
  wellName: string,
  targetDepthFt: number,
  casingRows: readonly WwellIrRawCasingRow[],
  formationRows: readonly WwellIrRawFormationTop[],
  surfaceElevationFtAsl: number | null,
  programMain: WwellIrRawProgramMain,
  hydrology: WwellIrRawHydrology,
  persistedWellDesignFlags?: IntegratedRequirementWellDesignFlags | null,
): WellboreDiagramData {
  const renderableCasings = casingRows.filter(isRenderableCasingRow);
  const renderableFormationTops = formationRows.filter(isRenderableFormationTop);
  /**
   * `completion.renderer.ts`'s `resolveCompletionBottomDepth` (rule kinds 'none' /
   * 'single-fallback' — i.e. no liner shoe to anchor the bottom to, which is exactly the "just a
   * Completion pick, no Casing rows yet" case this file's own `buildShoeAnchorFallback` exists
   * for) draws Open Hole / Gravel Pack / Liner Screen straight down to `data.totalDepth` — so
   * passing raw `targetDepthFt` through unchanged left the element's bottom pinned to its top
   * (ground level) whenever Target Depth reads as 0, making it technically present in the DOM but
   * zero-height/invisible. Resolving it once here (real value if positive, else
   * `STATIC_TARGET_DEPTH_FT`) and reusing that everywhere below — `totalDepth` and `targetDepth`
   * (and `displayDepth`, until a formation top goes past it) — keeps the whole diagram (scale,
   * ground line, completion elements, total-depth label) consistent instead of some parts anchoring
   * to a real value and others to a fallback.
   */
  const resolvedTargetDepthFt = targetDepthFt > 0 ? targetDepthFt : STATIC_TARGET_DEPTH_FT;
  /**
   * Presentation draws its depth scale around whichever is deeper, the target depth or the deepest
   * formation top (`selectDisplayDepth` in well-data.selectors.ts) — this keeps that rule, minus its
   * padding: the scale is drawn to the target depth, which is what an IR is planned against, and is
   * only redrawn once a top is added (or edited) below it. Only tops count, as there; a casing row
   * deeper than the target still runs off the end of the scale.
   */
  const deepestTopFt = Math.max(0, ...renderableFormationTops.map(row => row.depthFt ?? 0));

  return {
    wellName,
    totalDepth: resolvedTargetDepthFt,
    // The shared diagram's own vertical domain is `max(totalDepth, displayDepth)`, so this moves
    // the diagram and (through `resolveScaleDepthFt`) the ruler and gridlines together.
    displayDepth: Math.max(resolvedTargetDepthFt, deepestTopFt),
    casings: mapCasings(renderableCasings),
    drlgCasings: [...buildLinerTopAnchors(renderableCasings), ...buildShoeAnchorFallback(renderableCasings)],
    geologicTops: mapGeologicTops(renderableFormationTops, surfaceElevationFtAsl),
    hydrogeology: null,
    prewap: null,
    rigActivity: null,
    currentDepth: 0,
    targetDepth: resolvedTargetDepthFt,
    mudCirculation: [],
    wellDesign: buildWellDesignFromForm(programMain, hydrology, persistedWellDesignFlags),
  };
}

/**
 * Gates the *entire* diagram — depth scale, ground level line, and total-depth label included,
 * not just individual casing/formation-top shapes (see `isRenderableCasingRow`/
 * `isRenderableFormationTop` above). Before any row is complete, `well-bore-view` still draws
 * that scaffold around nothing: a bare 0–500ft ruler, a "GROUND LEVEL" line, and a
 * "TOTAL DEPTH: 0 FT" label with no actual construction data behind any of it. Callers should
 * check this first and render an empty state instead of the diagram until it's true.
 */
export function hasWellboreDiagramData(raw: WwellIrFormRawValue): boolean {
  return (
    raw.subsurface.casing.some(isRenderableCasingRow) ||
    raw.subsurface.formationTops.some(isRenderableFormationTop) ||
    hasCompletionElementFlags(
      deriveCompletionElementFlags(raw.programDetails.main.completion, raw.programDetails.main.openHoleSizeIn || null),
    )
  );
}

export function buildWellboreDiagramData(raw: WwellIrFormRawValue): WellboreDiagramData {
  return assembleWellboreDiagramData(
    raw.reference.main.wellName,
    raw.reference.main.targetDepthFt ?? 0,
    raw.subsurface.casing,
    raw.subsurface.formationTops,
    raw.reference.main.surfaceElevationFtAsl,
    raw.programDetails.main,
    raw.hydrogeology.main,
  );
}

/** `IntegratedRequirementCasingRow`/`FormationTop`/`ProgramDetails` are already-resolved
 *  (non-nullable) counterparts of the wizard's raw row types — these just fill in the raw
 *  shape's optional-text fields (`remarks`/`openHoleSizeIn`) with `''` in place
 *  of `null`, since a submitted IR's `null` here means the same "nothing entered" as the
 *  wizard's `''`. */
function toRawCasingRows(rows: readonly IntegratedRequirementCasingRow[]): WwellIrRawCasingRow[] {
  return rows.map(row => ({
    type: row.type,
    sizeIn: row.sizeIn,
    depthFtBgl: row.depthFtBgl,
    tolFtBgl: row.tolFtBgl,
    remarks: row.remarks ?? '',
  }));
}

function toRawFormationRows(rows: readonly IntegratedRequirementFormationTop[]): WwellIrRawFormationTop[] {
  return rows.map(row => ({
    name: row.name,
    depthFt: row.depthFt,
    subSeaFtAsl: row.subSeaFtAsl ?? null,
  }));
}

function toRawProgramMain(ir: IntegratedRequirement): WwellIrRawProgramMain {
  return {
    completion: ir.programDetails.completion,
    openHoleSizeIn: ir.programDetails.openHoleSizeIn ?? '',
    acidization: ir.programDetails.acidization,
    transmission: ir.programDetails.transmission,
  };
}

/** `IntegratedRequirementHydrogeology`/`TestProgram` are two separate domain groups that the
 *  wizard's single "Estimated Hydrology" step (and its one flat `WwellIrRawHydrology` raw shape —
 *  see wwell-ir-form.types.ts) collects together — recombine them here the same way. */
function toRawHydrology(ir: IntegratedRequirement): WwellIrRawHydrology {
  return {
    testType: ir.testProgram.testType,
    aquifer: ir.hydrogeology.aquifer,
    siwhpPsi: ir.testProgram.siwhpPsi ?? null,
    estimatedTdsPpm: ir.hydrogeology.estimatedTdsPpm,
    estimatedRateGpm: ir.testProgram.estimatedRateGpm,
    h2sPpm: ir.hydrogeology.h2sPpm,
    estimatedWaterLevelFt: ir.testProgram.estimatedWaterLevelFt,
    estimatedPumpDepthFt: ir.hydrogeology.estimatedPumpDepthFt,
  };
}

/** Same emptiness gate as `hasWellboreDiagramData`, for the IR editor/detail page. `liveCasingRows`/
 *  `liveFormationRows` let the editor substitute its Casing/Formation Tops sections' in-progress
 *  FormArray values while those sections are open for editing — pass `null`/omit for either one
 *  still reads straight from `ir`. `liveProgramMain` does the same for Program Details: while that
 *  section is open for live edit, the gate reacts to the Completion the user is actively picking
 *  right now, same as `buildWellboreDiagramDataFromIntegratedRequirement` below; otherwise it
 *  trusts the persisted `ir.programDetails.wellDesignFlags` (falling back to re-deriving from
 *  `ir.programDetails.completion` for a record fetched before that round-trip existed) — so a
 *  record carrying only a well_design row (no Casing/Formation Top data at all) still shows the
 *  diagram instead of the empty state. */
export function hasWellboreDiagramDataForIntegratedRequirement(
  ir: IntegratedRequirement,
  liveCasingRows?: readonly WwellIrRawCasingRow[] | null,
  liveFormationRows?: readonly WwellIrRawFormationTop[] | null,
  liveProgramMain?: WwellIrRawProgramMain | null,
): boolean {
  const casingRows = liveCasingRows ?? toRawCasingRows(ir.casing);
  const formationRows = liveFormationRows ?? toRawFormationRows(ir.formationTops);
  const completionFlags = liveProgramMain
    ? deriveCompletionElementFlags(liveProgramMain.completion, liveProgramMain.openHoleSizeIn || null)
    : (ir.programDetails.wellDesignFlags ??
      deriveCompletionElementFlags(ir.programDetails.completion, ir.programDetails.openHoleSizeIn));
  return (
    casingRows.some(isRenderableCasingRow) ||
    formationRows.some(isRenderableFormationTop) ||
    hasCompletionElementFlags(completionFlags)
  );
}

/**
 * Structural equality for `WellboreDiagramData`.
 *
 * The editor rebuilds the diagram's data on every keystroke in any section it live-edits, because the
 * builders below are pure functions returning a fresh object each call. Angular's signals compare with
 * `Object.is`, so a fresh-but-identical object still counts as a change — and `well-bore-view`'s redraw
 * effect then fades the whole drawing out over 120ms and re-animates it from scratch. Typing a client
 * name or a geologist, neither of which the diagram draws, restarted the animation.
 *
 * Handing this to `computed(..., { equal })` makes the signal keep the previous object whenever the
 * newly-built one is equivalent, so nothing downstream sees a change and the diagram holds still.
 *
 * Deliberately a whole-object comparison rather than a list of the fields that "matter": getting this
 * wrong in the conservative direction costs one redundant redraw, whereas a hand-maintained field list
 * silently stops updating the diagram the day someone adds a field to the model.
 */
export function wellboreDiagramDataEqual(
  a: WellboreDiagramData | null,
  b: WellboreDiagramData | null,
): boolean {
  return deepEquals(a, b);
}

/** Plain-data structural comparison. The diagram data is JSON-shaped — numbers, strings, nulls, arrays
 *  and object literals — so there are no Dates, Maps or cycles to account for here. */
function deepEquals(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') return false;

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    return a.every((item, i) => deepEquals(item, b[i]));
  }

  const aRecord = a as Record<string, unknown>;
  const bRecord = b as Record<string, unknown>;
  const aKeys = Object.keys(aRecord);
  if (aKeys.length !== Object.keys(bRecord).length) return false;
  // `in` rather than a truthiness check, so a key explicitly set to undefined on one side and absent
  // on the other is still treated as a difference.
  return aKeys.every(key => key in bRecord && deepEquals(aRecord[key], bRecord[key]));
}

/** Detail/editor-page counterpart of `buildWellboreDiagramData` — same live `app-well-bore-view`
 *  diagram, fed from a submitted `IntegratedRequirement` instead of the in-progress wizard form,
 *  so those pages show the real engineering rendering instead of the lighter
 *  `wwell-ir-design-preview` sketch. See `hasWellboreDiagramDataForIntegratedRequirement` above
 *  for what `liveCasingRows`/`liveFormationRows` are for — the editor passes its Casing/Formation
 *  Tops sections' live FormArray values while they're open, so the preview updates as rows are
 *  added/edited instead of only once that section is saved.
 *
 *  `liveProgramMain`/`liveHydrology` are the same idea for Program Details (Completion — the
 *  element flags in `buildWellDesignFromForm`) and Estimated Hydrology (static water level / SIWHP
 *  / pump depth): without these, picking a different Completion or test type while that section is
 *  open wouldn't move the diagram until the whole record was saved, unlike casing/formation-top
 *  edits, which already updated it live.
 *
 *  `liveReference` completes that set for the Request Reference section, which owns Target Depth,
 *  Surface Elevation and Well Name. Without it those three alone kept reading the last-saved record while
 *  every other section updated live, so editing Target Depth moved nothing until the whole IR was saved —
 *  and since Target Depth is what `totalDepth`, `displayDepth` and the depth scale are all derived from,
 *  that one gap froze the entire vertical extent of the drawing mid-edit.
 *
 *  While Program Details is open for live edit (`liveProgramMain` set), the diagram must react to
 *  the Completion the user is actively picking right now — so this deliberately does NOT pass
 *  `ir.programDetails.wellDesignFlags` (the last-fetched, possibly-stale real DB flags) through in
 *  that case, only once the section is closed/not being edited. See buildWellDesignFromForm's own
 *  doc comment for why the persisted flags win over re-derivation the rest of the time. */
export function buildWellboreDiagramDataFromIntegratedRequirement(
  ir: IntegratedRequirement,
  liveCasingRows?: readonly WwellIrRawCasingRow[] | null,
  liveFormationRows?: readonly WwellIrRawFormationTop[] | null,
  liveProgramMain?: WwellIrRawProgramMain | null,
  liveHydrology?: WwellIrRawHydrology | null,
  liveReference?: WwellIrRawReference | null,
): WellboreDiagramData {
  return assembleWellboreDiagramData(
    liveReference?.wellName ?? ir.requestReference.wellName,
    liveReference ? (liveReference.targetDepthFt ?? 0) : ir.requestReference.targetDepthFt,
    liveCasingRows ?? toRawCasingRows(ir.casing),
    liveFormationRows ?? toRawFormationRows(ir.formationTops),
    liveReference ? liveReference.surfaceElevationFtAsl : ir.requestReference.surfaceElevationFtAsl,
    liveProgramMain ?? toRawProgramMain(ir),
    liveHydrology ?? toRawHydrology(ir),
    liveProgramMain ? null : ir.programDetails.wellDesignFlags,
  );
}
