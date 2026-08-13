import { WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { ICasingIR } from '@shared/models/wwell/casing-ir.model';
import { IDrlgCsg } from '@shared/models/wwell/drlg-csg.model';
import { ITopsIR } from '@shared/models/wwell/tops-ir.model';
import { IWellDesign } from '@shared/models/wwell/well-design.model';
import { parseInchSize } from '@shared/utils/wellbore-math.util';
import {
  WwellIrFormRawValue,
  WwellIrRawCasingRow,
  WwellIrRawFormationTop,
  WwellIrRawProgramMain,
} from './wwell-ir-form.types';

/**
 * Adapts the IR wizard's raw form value into the `WellboreDiagramData` shape the shared
 * `app-well-bore-view` component (presentation/well-bore-view) expects — so the wizard can
 * embed that component unmodified as a live, always-animated "Well Design View" step.
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

/** Mirrors wwell-ir-design-preview.renderer.ts's MIN_SCALE_DEPTH_FT: anchors the depth
 * scale to a stable minimum so a shallow/partial entry doesn't stretch across the full
 * drawing height, and so the scale's domain is never degenerate ([0, 0]) before the
 * (required, but non-linear-stepper-skippable) target depth field is filled in. */
const MIN_SCALE_DEPTH_FT = 500;

/**
 * Never used to match a real casing — `casing.renderer.ts` / `wellbore-depth.helpers.ts`
 * match `drlgCasings` rows to casings by `wCsgOdSz === csg.csgSize`, so this sentinel must be
 * a value no user-entered casing size could ever equal. Only `buildLinerTopAnchors`' rows use
 * this; they're read exclusively through `wLnrOdSz`, never `wCsgOdSz`.
 */
const LINER_ANCHOR_SENTINEL = '__wwell_ir_liner_anchor__';

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
 */
function buildWellDesignFromForm(programMain: WwellIrRawProgramMain): IWellDesign {
  const completion = programMain.completion;
  const isOpenHole = completion === COMPLETION_OPEN_HOLE;
  const isGravelPack = completion === COMPLETION_SCREENED_GRAVEL_PACK;
  const isScreened = completion === COMPLETION_SCREENED || isGravelPack;
  const isLinerPerforated = completion === COMPLETION_LINER_PERFORATED;

  return {
    name: null,
    prewapSeq: null,
    staWaterLvl: null,
    swLvlTxt: null,
    pumpLvl: null,
    ohFlg: isOpenHole ? 'Y' : 'N',
    ohRemarks: isOpenHole ? (programMain.openHoleSizeIn || null) : null,
    gpFlg: isGravelPack ? 'Y' : 'N',
    gpRemarks: isGravelPack ? 'Gravel Pack' : null,
    perforatedFlg: isLinerPerforated ? 'Y' : 'N',
    perforatedRemarks: isLinerPerforated ? '7" Pre-Perforated Liner' : null,
    lsFlg: isScreened ? 'Y' : 'N',
    lsRemarks: isScreened ? 'Screen' : null,
  };
}

function computeDisplayDepthFt(raw: WwellIrFormRawValue): number {
  const depths = [
    raw.reference.main.targetDepthFt ?? 0,
    ...raw.subsurface.casing.map(row => row.depthFtBgl ?? 0),
    ...raw.subsurface.formationTops.map(row => row.depthFt ?? 0),
  ];
  return Math.max(...depths, MIN_SCALE_DEPTH_FT);
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
    raw.subsurface.formationTops.some(isRenderableFormationTop)
  );
}

export function buildWellboreDiagramData(raw: WwellIrFormRawValue): WellboreDiagramData {
  const targetDepthFt = raw.reference.main.targetDepthFt ?? 0;
  const renderableCasings = raw.subsurface.casing.filter(isRenderableCasingRow);
  const renderableFormationTops = raw.subsurface.formationTops.filter(isRenderableFormationTop);

  return {
    wellName: raw.reference.main.wellName,
    totalDepth: targetDepthFt,
    displayDepth: computeDisplayDepthFt(raw),
    casings: mapCasings(renderableCasings),
    drlgCasings: buildLinerTopAnchors(renderableCasings),
    geologicTops: mapGeologicTops(renderableFormationTops, raw.reference.main.surfaceElevationFtAsl),
    hydrogeology: null,
    prewap: null,
    rigActivity: null,
    currentDepth: 0,
    targetDepth: targetDepthFt,
    mudCirculation: [],
    wellDesign: buildWellDesignFromForm(raw.programDetails.main),
  };
}
