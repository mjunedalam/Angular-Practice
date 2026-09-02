import { WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import {
  IntegratedRequirement,
  IntegratedRequirementCasingRow,
  IntegratedRequirementFormationTop,
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

/** Anchors the depth scale to a stable minimum so a shallow/partial entry doesn't stretch
 * across the full drawing height, and so the scale's domain is never degenerate ([0, 0]) before the
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
function buildWellDesignFromForm(programMain: WwellIrRawProgramMain, hydrology: WwellIrRawHydrology): IWellDesign {
  const completion = programMain.completion;
  const isOpenHole = completion === COMPLETION_OPEN_HOLE;
  const isGravelPack = completion === COMPLETION_SCREENED_GRAVEL_PACK;
  const isScreened = completion === COMPLETION_SCREENED || isGravelPack;
  const isLinerPerforated = completion === COMPLETION_LINER_PERFORATED;

  return {
    name: null,
    prewapSeq: null,
    ...buildWaterLevelFields(hydrology),
    pumpLvl: hydrology.estimatedPumpDepthFt,
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

function computeDisplayDepthFt(
  targetDepthFt: number,
  casingRows: readonly WwellIrRawCasingRow[],
  formationRows: readonly WwellIrRawFormationTop[],
): number {
  const depths = [
    targetDepthFt,
    ...casingRows.map(row => row.depthFtBgl ?? 0),
    ...formationRows.map(row => row.depthFt ?? 0),
  ];
  return Math.max(...depths, MIN_SCALE_DEPTH_FT);
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
): WellboreDiagramData {
  const renderableCasings = casingRows.filter(isRenderableCasingRow);
  const renderableFormationTops = formationRows.filter(isRenderableFormationTop);

  return {
    wellName,
    totalDepth: targetDepthFt,
    displayDepth: computeDisplayDepthFt(targetDepthFt, casingRows, formationRows),
    casings: mapCasings(renderableCasings),
    drlgCasings: buildLinerTopAnchors(renderableCasings),
    geologicTops: mapGeologicTops(renderableFormationTops, surfaceElevationFtAsl),
    hydrogeology: null,
    prewap: null,
    rigActivity: null,
    currentDepth: 0,
    targetDepth: targetDepthFt,
    mudCirculation: [],
    wellDesign: buildWellDesignFromForm(programMain, hydrology),
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
    raw.subsurface.formationTops.some(isRenderableFormationTop)
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
 *  shape's optional-text fields (`remarks`/`description`/`openHoleSizeIn`) with `''` in place
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
    description: row.description ?? '',
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
 *  still reads straight from `ir`. */
export function hasWellboreDiagramDataForIntegratedRequirement(
  ir: IntegratedRequirement,
  liveCasingRows?: readonly WwellIrRawCasingRow[] | null,
  liveFormationRows?: readonly WwellIrRawFormationTop[] | null,
): boolean {
  const casingRows = liveCasingRows ?? toRawCasingRows(ir.casing);
  const formationRows = liveFormationRows ?? toRawFormationRows(ir.formationTops);
  return casingRows.some(isRenderableCasingRow) || formationRows.some(isRenderableFormationTop);
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
 *  edits, which already updated it live. */
export function buildWellboreDiagramDataFromIntegratedRequirement(
  ir: IntegratedRequirement,
  liveCasingRows?: readonly WwellIrRawCasingRow[] | null,
  liveFormationRows?: readonly WwellIrRawFormationTop[] | null,
  liveProgramMain?: WwellIrRawProgramMain | null,
  liveHydrology?: WwellIrRawHydrology | null,
): WellboreDiagramData {
  return assembleWellboreDiagramData(
    ir.requestReference.wellName,
    ir.requestReference.targetDepthFt,
    liveCasingRows ?? toRawCasingRows(ir.casing),
    liveFormationRows ?? toRawFormationRows(ir.formationTops),
    ir.requestReference.surfaceElevationFtAsl,
    liveProgramMain ?? toRawProgramMain(ir),
    liveHydrology ?? toRawHydrology(ir),
  );
}
