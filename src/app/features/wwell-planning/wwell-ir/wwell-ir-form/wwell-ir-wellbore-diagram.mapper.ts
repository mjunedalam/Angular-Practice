import { WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { ICasingIR } from '@shared/models/wwell/casing-ir.model';
import { IDrlgCsg } from '@shared/models/wwell/drlg-csg.model';
import { ITopsIR } from '@shared/models/wwell/tops-ir.model';
import { IWellDesign } from '@shared/models/wwell/well-design.model';
import { sortCasingsByDepthDesc } from '@shared/utils/wellbore-math.util';
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
 * `casing.renderer.ts`'s `getCasingTier` derives each casing's on-screen tier (and therefore
 * its telescoping half-width) purely from its position in this array via `indexOf` — it
 * never looks at `csgDepth` itself. That only produces correct (deepest = narrowest =
 * innermost) widths when the array is already sorted deepest-first, which is exactly what
 * `sortCasingsByDepthDesc` (a `@shared/utils` export, not part of `well-bore-view/`) does for
 * the real Presentation screen's own selector before `EXAD_GWD_IR_CASING` ever reaches this
 * same component (see README.md §1.4). Reused verbatim here so casing/liner widths come out
 * correct regardless of what order rows were entered in the wizard's Casing table.
 */
function mapCasings(rows: readonly WwellIrRawCasingRow[]): ICasingIR[] {
  const casings: ICasingIR[] = rows.map(row => ({
    csgSize: row.sizeIn,
    csgType: row.type,
    csgDepth: row.depthFtBgl ?? 0,
    csgRemarks: row.remarks || null,
  }));
  return sortCasingsByDepthDesc(casings);
}

/**
 * `liner.renderer.ts`'s `rawLinersFromIR` can only learn a liner's TOP depth from a matching
 * `drlgCasings` (as-drilled) row — with none supplied, every planned liner falls back to the
 * SAME top (the deepest structural casing's shoe), so two or more stacked liners all render
 * starting at the same point instead of hanging from one another (visible as overlapping
 * "TOL @ ..." labels).
 *
 * This builds synthetic `IDrlgCsg` "anchor" entries carrying ONLY the correct chained
 * `wLnrTopDepth` per liner — never `wLnrBotDepth` or a real `wCsgOdSz` — because
 * `rawLinersFromIR` gates `hasActual` (and therefore the green-vs-silver color choice)
 * strictly on `wLnrBotDepth`, and gates the casing-actual lookup strictly on `wCsgOdSz`.
 * Leaving both unset fixes the top-depth chain while keeping every casing and liner silver.
 *
 * Chain rule (matches the physical assumption already baked into liner.renderer.ts, e.g.
 * `renderLinerShapes`'s `hangerY`): the shallowest liner hangs from the deepest structural
 * casing's shoe; each deeper liner hangs from the liner immediately above it. Casing rows
 * whose type is Conductor, Surface, Intermediate, or Production are all "structural" here —
 * anything that isn't `'Liner'`, exactly matching how casing.renderer.ts itself distinguishes
 * casing from liner (`csgType !== 'Liner'`).
 *
 * A row's own `tolFtBgl` (the wizard's "Top Of Liner (TOL)" field, shown only for Liner rows)
 * overrides this auto-chained value when the user has filled it in — the chain computation
 * above becomes the fallback for rows left blank. Explicit TOLs don't otherwise perturb the
 * chain: the next liner's fallback top is still this row's own `depthFtBgl` (its shoe), not
 * its `tolFtBgl`, since a liner physically hangs from the casing/liner above it regardless of
 * how far down its own top was entered.
 */
function buildLinerTopAnchors(rows: readonly WwellIrRawCasingRow[]): IDrlgCsg[] {
  const structuralDepths = rows.filter(row => row.type !== LINER_TYPE).map(row => row.depthFtBgl ?? 0);
  const lastCasingShoe = structuralDepths.length ? Math.max(...structuralDepths) : 0;

  const linersShallowToDeep = rows
    .filter(row => row.type === LINER_TYPE)
    .slice()
    .sort((a, b) => (a.depthFtBgl ?? 0) - (b.depthFtBgl ?? 0));

  let anchorTop = lastCasingShoe;
  return linersShallowToDeep.map(row => {
    const anchor: IDrlgCsg = {
      wCsgOdSz: LINER_ANCHOR_SENTINEL,
      wCsgBotDpth: 0,
      wLnrOdSz: row.sizeIn,
      wLnrTopDepth: row.tolFtBgl ?? anchorTop,
      wLnrBotDepth: null,
    };
    anchorTop = row.depthFtBgl ?? anchorTop;
    return anchor;
  });
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

export function buildWellboreDiagramData(raw: WwellIrFormRawValue): WellboreDiagramData {
  const targetDepthFt = raw.reference.main.targetDepthFt ?? 0;

  return {
    wellName: raw.reference.main.wellName,
    totalDepth: targetDepthFt,
    displayDepth: computeDisplayDepthFt(raw),
    casings: mapCasings(raw.subsurface.casing),
    drlgCasings: buildLinerTopAnchors(raw.subsurface.casing),
    geologicTops: mapGeologicTops(raw.subsurface.formationTops, raw.reference.main.surfaceElevationFtAsl),
    hydrogeology: null,
    prewap: null,
    rigActivity: null,
    currentDepth: 0,
    targetDepth: targetDepthFt,
    mudCirculation: [],
    wellDesign: buildWellDesignFromForm(raw.programDetails.main),
  };
}
