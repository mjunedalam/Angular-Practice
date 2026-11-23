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
import { WWELL_COMPLETION_TYPE, isLinerCompletionType } from './wwell-ir-completion-type.config';
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

/**
 * The Completion dropdown's Liner picks (Pre-Perforated / Perforated Liner + Liner Size) describe a
 * liner string exactly like a `Liner` row in the Casing table does — and the shared diagram draws a
 * liner purely from such a row (liner.renderer.ts's `rawLinersFromIR`: a shape hanging from the last
 * casing shoe, with its size label). Setting the completion alone only flipped the perforated flag,
 * so no liner appeared. This adds the liner the pick implies, run down to the well's target depth, as
 * a synthetic Casing row for the drawing only — it is never saved or shown in the Casing table.
 * Skipped when the Casing table already holds a Liner of that size, so a liner the user entered
 * themselves (with its own depth/TOL) is never doubled up.
 */
function withCompletionLiner(
  rows: readonly WwellIrRawCasingRow[],
  programMain: WwellIrRawProgramMain,
  targetDepthFt: number,
): WwellIrRawCasingRow[] {
  const linerSize = programMain.linerSizeIn?.trim();
  if (!isLinerCompletionType(programMain.completionType) || !linerSize) return [...rows];

  const wantedSize = parseInchSize(linerSize);
  const alreadyDeclared = rows.some(row => row.type === LINER_TYPE && parseInchSize(row.sizeIn) === wantedSize);
  if (alreadyDeclared) return [...rows];

  // No depth entered → run to the target depth; its top is left null so the renderer hangs it from the last casing shoe.
  return [...rows, { type: LINER_TYPE, sizeIn: linerSize, depthFtBgl: programMain.linerDepthFt ?? targetDepthFt, tolFtBgl: null, remarks: '' }];
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
  completionType = '',
  linerSizeIn: string | null = null,
  linerDepthFt: number | null = null,
): IntegratedRequirementWellDesignFlags {
  const typedFlags = flagsForCompletionType(completionType, openHoleSizeIn, linerSizeIn, { depthFt: linerDepthFt });
  if (typedFlags) return typedFlags;

  const selected = selectedCompletionLabels(completion);
  const isGravelPack = selected.has(COMPLETION_SCREENED_GRAVEL_PACK);
  const isScreened = selected.has(COMPLETION_SCREENED) || isGravelPack;
  const isLinerPerforated = selected.has(COMPLETION_LINER_PERFORATED);
  const isCasedPerforated = selected.has(COMPLETION_CASED_PERFORATED);
  const isPerforated = isLinerPerforated || isCasedPerforated;
  // Open hole is always drawn: a screen, gravel pack or liner completion sits inside it. Only a
  // cased & perforated completion has no open hole around it.
  const isOpenHole = selected.has(COMPLETION_OPEN_HOLE) || isScreened || isLinerPerforated;
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

const NO_COMPLETION_FLAGS: IntegratedRequirementWellDesignFlags = {
  ohFlg: 'N',
  ohRemarks: null,
  gpFlg: 'N',
  gpRemarks: null,
  perforatedFlg: 'N',
  perforatedRemarks: null,
  lsFlg: 'N',
  lsRemarks: null,
};

const PRE_PERFORATED_SUFFIX = WWELL_COMPLETION_TYPE.PRE_PERFORATED_LINER;
const LINER_SCREEN_LABEL = WWELL_COMPLETION_TYPE.SCREEN;

/** Remarks are compared case-insensitively, and the screen's old bare 'Screen' label equals
 *  'Liner Screen' — records saved before the Completion menu was renamed must still resolve to their pick. */
function canonicalRemark(remark: string | null): string | null {
  const text = remark?.trim().toLowerCase() ?? null;
  return text === 'screen' ? LINER_SCREEN_LABEL.toLowerCase() : text;
}

function sizedLabel(size: string | null, label: string): string {
  return size ? `${size} ${label}` : label;
}

/** Where the picked liner ends — optional: no depth means the target depth. (Its top always hangs from
 *  the last casing shoe, the renderer's own fallback.) */
interface LinerExtent {
  readonly depthFt: number | null;
}

const NO_LINER_EXTENT: LinerExtent = { depthFt: null };

/** `7" Liner Screen (depth 2500 ft)` — the depth rides in the remarks, like the size does,
 *  since exad_gwd_well_design has no column for it. Omitted when blank. */
function linerRemarks(size: string | null, label: string, extent: LinerExtent): string {
  const base = sizedLabel(size, label);
  return extent.depthFt != null ? `${base} (depth ${extent.depthFt} ft)` : base;
}

const LINER_EXTENT_SUFFIX = /\s*\(depth (\d+(?:\.\d+)?) ft\)\s*$/;

/** Reverses `linerRemarks`: the remarks without the extent suffix, plus the extent it carried. */
function splitLinerRemarks(remarks: string | null): { readonly base: string; readonly extent: LinerExtent } {
  const text = remarks ?? '';
  const match = LINER_EXTENT_SUFFIX.exec(text);
  if (!match) return { base: text, extent: NO_LINER_EXTENT };
  return {
    base: text.slice(0, match.index),
    extent: { depthFt: Number(match[1]) },
  };
}

/** Flags for the single-pick Completion dropdown, or `null` when nothing (or an unknown value) is
 *  picked — the caller then falls back to deriving from the legacy Completion Remarks text. Sizes
 *  ride in the remarks, same encoding as the open hole's (see `parseOpenHoleSizeFromRemarks`):
 *  exad_gwd_well_design has no column for either size. The perforated remarks double as the
 *  diagram's visible label (completion.renderer.ts prefers them over its generic text), which is
 *  how the entered liner size reaches the drawing. */
function flagsForCompletionType(
  completionType: string,
  openHoleSizeIn: string | null,
  linerSizeIn: string | null,
  extent: LinerExtent = NO_LINER_EXTENT,
): IntegratedRequirementWellDesignFlags | null {
  const ohSize = openHoleSizeIn?.trim() || null;
  const linerSize = linerSizeIn?.trim() || null;

  switch (completionType) {
    case WWELL_COMPLETION_TYPE.OPEN_HOLE:
      return { ...NO_COMPLETION_FLAGS, ohFlg: 'Y', ohRemarks: ohSize ? `${ohSize} ${COMPLETION_OPEN_HOLE}` : null };
    case WWELL_COMPLETION_TYPE.SCREEN:
      return { ...openHoleFlags(ohSize), lsFlg: 'Y', lsRemarks: linerRemarks(linerSize, LINER_SCREEN_LABEL, extent) };
    case WWELL_COMPLETION_TYPE.SCREEN_GRAVEL_PACK:
      return { ...openHoleFlags(ohSize), gpFlg: 'Y', gpRemarks: 'Gravel Pack', lsFlg: 'Y', lsRemarks: linerRemarks(linerSize, LINER_SCREEN_LABEL, extent) };
    case WWELL_COMPLETION_TYPE.PRE_PERFORATED_LINER:
      return { ...openHoleFlags(ohSize), perforatedFlg: 'Y', perforatedRemarks: linerRemarks(linerSize, PRE_PERFORATED_SUFFIX, extent) };
    default:
      return null;
  }
}

/** The open hole every completion pick is drawn inside — Screen, Screen with Gravel Pack and the
 *  liners all run in it, so their picks carry `ohFlg` too (the renderer keeps each of them inside
 *  the hole's width). */
function openHoleFlags(ohSize: string | null): IntegratedRequirementWellDesignFlags {
  return { ...NO_COMPLETION_FLAGS, ohFlg: 'Y', ohRemarks: ohSize ? `${ohSize} ${COMPLETION_OPEN_HOLE}` : null };
}

/** The same picks as saved before the open hole was implied (no `ohFlg` beside the completion
 *  element) — still recognised on load so an older record keeps its dropdown value. */
function legacyFlagsForCompletionType(
  completionType: string,
  linerSize: string | null,
): IntegratedRequirementWellDesignFlags | null {
  switch (completionType) {
    case WWELL_COMPLETION_TYPE.SCREEN:
      return { ...NO_COMPLETION_FLAGS, lsFlg: 'Y', lsRemarks: sizedLabel(linerSize, LINER_SCREEN_LABEL) };
    case WWELL_COMPLETION_TYPE.SCREEN_GRAVEL_PACK:
      return { ...NO_COMPLETION_FLAGS, gpFlg: 'Y', gpRemarks: 'Gravel Pack', lsFlg: 'Y', lsRemarks: sizedLabel(linerSize, LINER_SCREEN_LABEL) };
    case WWELL_COMPLETION_TYPE.PRE_PERFORATED_LINER:
      return { ...NO_COMPLETION_FLAGS, perforatedFlg: 'Y', perforatedRemarks: sizedLabel(linerSize, PRE_PERFORATED_SUFFIX) };
    default:
      return null;
  }
}

/** The liner size ridden in `lsRemarks` as `"<size> Liner Screen"` (a bare 'Screen' / 'Liner Screen' has none). */
function linerSizeFromScreenRemarks(base: string): string | null {
  if (!base || !base.toLowerCase().endsWith(LINER_SCREEN_LABEL.toLowerCase())) return null;
  return base.slice(0, -LINER_SCREEN_LABEL.length).trim() || null;
}

/** Header `cmpl_type` short codes (VARCHAR2(10)) that name a Completion pick outright. */
const COMPLETION_TYPE_BY_CODE: Readonly<Record<string, string>> = { PPL: WWELL_COMPLETION_TYPE.PRE_PERFORATED_LINER };

/** The Completion pick a header `cmpl_type` code stands for (`PPL` → Pre-perforated Liner), or `null` for anything else. */
export function completionTypeFromCode(code: string | null | undefined): string | null {
  return COMPLETION_TYPE_BY_CODE[code?.trim().toUpperCase() ?? ''] ?? null;
}

// Hand-written / legacy perforated remarks: "+/- 1570 ft of 7" Pre-Perforated Liner", "7" Pre Perforated Liner", "PPL 7in".
const PRE_PERFORATED_REMARK = /pre[\s-]*perforated|\bppl\b/i;
const LINER_SIZE_IN_REMARK = /(\d+(?:\s+\d+\/\d+|\.\d+|\/\d+)?)\s*(?:"|''|in\b)/i;

/** Reads a free-typed Pre-Perforated Liner remark: its size (`7"`), with the leading "+/- N ft of" length ignored.
 *  `null` when the text isn't a pre-perforated liner remark at all. */
function parsePrePerforatedRemark(remarks: string | null): { readonly linerSizeIn: string | null } | null {
  if (!remarks || !PRE_PERFORATED_REMARK.test(remarks)) return null;
  const withoutLength = remarks.replace(/^\s*(?:\+\/-|±)?\s*[\d,.]+\s*(?:ft|feet|')\s+of\s+/i, '');
  const size = LINER_SIZE_IN_REMARK.exec(withoutLength)?.[1]?.replace(/\s+/g, ' ').trim();
  return { linerSizeIn: size ? `${size}"` : null };
}

/**
 * Reverses `flagsForCompletionType` for a persisted exad_gwd_well_design row — the Completion pick
 * itself has no column (cmpl_type is VARCHAR2(10), too short), so it round-trips through the flags.
 * Returns `null` unless the flags are *exactly* what one dropdown pick would have produced: a
 * legacy record (several options checked, "Cased & Perforated", …) stays unresolved and keeps
 * deriving from its Completion Remarks text, instead of being silently collapsed onto one pick the
 * next time it is saved.
 */
export function resolveCompletionTypeFromFlags(
  flags: IntegratedRequirementWellDesignFlags | null | undefined,
): { readonly completionType: string; readonly linerSizeIn: string | null; readonly linerDepthFt: number | null } | null {
  if (!flags) return null;

  let completionType: string | null = null;
  let linerSizeIn: string | null = null;
  let extent = NO_LINER_EXTENT;
  if (flags.perforatedFlg === 'Y') {
    const split = splitLinerRemarks(flags.perforatedRemarks);
    const ownSize = split.base.toLowerCase().endsWith(PRE_PERFORATED_SUFFIX.toLowerCase())
      ? split.base.slice(0, -PRE_PERFORATED_SUFFIX.length).trim() || null
      : undefined;
    // A prefix like "+/- 1570 ft of 7\"" is someone else's wording, not our bare size — the lenient parse below handles it.
    if (ownSize !== undefined && !/\bft\b|\bof\b/i.test(ownSize ?? '')) {
      completionType = PRE_PERFORATED_SUFFIX;
      linerSizeIn = ownSize;
      extent = split.extent;
    } else {
      // Not our own encoding (e.g. "+/- 1570 ft of 7" Pre-Perforated Liner" from another tool): read the size out of it.
      const parsed = parsePrePerforatedRemark(flags.perforatedRemarks);
      if (parsed) {
        return { completionType: PRE_PERFORATED_SUFFIX, linerSizeIn: parsed.linerSizeIn, linerDepthFt: null };
      }
    }
  } else if (flags.gpFlg === 'Y') {
    completionType = WWELL_COMPLETION_TYPE.SCREEN_GRAVEL_PACK;
    const split = splitLinerRemarks(flags.lsRemarks);
    linerSizeIn = linerSizeFromScreenRemarks(split.base);
    extent = split.extent;
  } else if (flags.lsFlg === 'Y') {
    completionType = WWELL_COMPLETION_TYPE.SCREEN;
    const split = splitLinerRemarks(flags.lsRemarks);
    linerSizeIn = linerSizeFromScreenRemarks(split.base);
    extent = split.extent;
  } else if (flags.ohFlg === 'Y') {
    completionType = WWELL_COMPLETION_TYPE.OPEN_HOLE;
  }
  if (!completionType) return null;

  const candidates = [
    flagsForCompletionType(completionType, parseOpenHoleSizeFromRemarks(flags.ohRemarks), linerSizeIn, extent),
    legacyFlagsForCompletionType(completionType, linerSizeIn),
  ];
  const matches = candidates.some(
    candidate =>
      !!candidate &&
      (Object.keys(candidate) as (keyof IntegratedRequirementWellDesignFlags)[]).every(key =>
        key.endsWith('Remarks') && key !== 'ohRemarks' ? canonicalRemark(candidate[key]) === canonicalRemark(flags[key]) : candidate[key] === flags[key],
      ),
  );
  return matches ? { completionType, linerSizeIn, linerDepthFt: extent.depthFt } : null;
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
  const flags =
    persistedFlags ??
    deriveCompletionElementFlags(programMain.completion, programMain.openHoleSizeIn || null, programMain.completionType, programMain.linerSizeIn || null, programMain.linerDepthFt);
  return {
    name: null,
    prewapSeq: null,
    ...buildWaterLevelFields(hydrology),
    // A flow test has no pump: the pump-depth field is hidden for it, but a value saved while the IR was a pump test must not still draw one.
    pumpLvl: hydrology.testType === FLOW_TEST_TYPE ? null : hydrology.estimatedPumpDepthFt,
    ...flags,
    // The pre-perforated liner's own label already says "(Pre Perf Liner)": the remark ("7" Pre-Perforated Liner",
    // "+/- 1570 ft of 7" Pre-Perforated Liner") would only repeat it as a second line under that label. Drawing-only —
    // the saved flags (derived separately for the payload) keep their remarks.
    perforatedRemarks: flags.perforatedRemarks && PRE_PERFORATED_REMARK.test(flags.perforatedRemarks) ? null : flags.perforatedRemarks,
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
  const renderableCasings = withCompletionLiner(casingRows.filter(isRenderableCasingRow), programMain, resolvedTargetDepthFt);
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
      deriveCompletionElementFlags(
        raw.programDetails.main.completion,
        raw.programDetails.main.openHoleSizeIn || null,
        raw.programDetails.main.completionType,
        raw.programDetails.main.linerSizeIn || null,
        raw.programDetails.main.linerDepthFt,
      ),
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
    completionType: ir.programDetails.completionType,
    completion: ir.programDetails.completion,
    openHoleSizeIn: ir.programDetails.openHoleSizeIn ?? '',
    linerSizeIn: ir.programDetails.linerSizeIn ?? '',
    linerDepthFt: ir.programDetails.linerDepthFt ?? null,
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
    ? deriveCompletionElementFlags(
        liveProgramMain.completion,
        liveProgramMain.openHoleSizeIn || null,
        liveProgramMain.completionType,
        liveProgramMain.linerSizeIn || null,
        liveProgramMain.linerDepthFt,
      )
    : (ir.programDetails.wellDesignFlags ??
      deriveCompletionElementFlags(
        ir.programDetails.completion,
        ir.programDetails.openHoleSizeIn,
        ir.programDetails.completionType,
        ir.programDetails.linerSizeIn,
        ir.programDetails.linerDepthFt,
      ));
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
