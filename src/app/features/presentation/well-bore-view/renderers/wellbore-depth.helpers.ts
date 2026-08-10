import { DiagramLayout, WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { ICasingIR } from '@shared/models/wwell/casing-ir.model';
import { IDrlgCsg } from '@shared/models/wwell/drlg-csg.model';
import { IWellDesign } from '@shared/models/wwell/well-design.model';
import { computeCasingHalfWidth, parseInchSize, remarksReferenceSize } from '@shared/utils/wellbore-math.util';
import { isLastLinerScreen, resolveAnchorLiner, resolveLinerDepths, resolveLiners } from './liner.renderer';
import { DepthScale } from './wellbore-renderer.types';

const OVERRUN_COMPLETION_LENGTH_FT = 1200;

export function resolveShoeDepth(casings: ICasingIR[], drlgCasings: IDrlgCsg[]): number {
  const irNonLiner = casings.filter(c => c.csgType !== 'Liner' && c.csgType !== 'Gravel Pack');
  const deepest = irNonLiner[0];
  if (!deepest) return drlgCasings[0]?.wCsgBotDpth ?? 0;

  const actual = drlgCasings.find(d => d.wCsgOdSz === deepest.csgSize) ?? null;
  return (actual !== null && actual.wCsgBotDpth > 0 ? actual.wCsgBotDpth : null) ?? deepest.csgDepth;
}

/**
 * Depth Open Hole / Gravel Pack / Pre-Perf start from:
 *   - 2+ liners: below the anchor (second-deepest) liner's bottom — the deepest liner is
 *     the screen and sits inside that zone on its own.
 *   - 1 liner, not flagged as the screen: below its bottom (same rule).
 *   - 1 liner flagged as the screen: there's no separate pipe liner above it — it's run
 *     into the open hole for its own full length, overlapping up into the casing shoe for
 *     its hanger seal. So completion elements must start at the CASING SHOE (not the
 *     liner's own top, which sits inside that overlap/seal zone, and not its bottom, which
 *     would leave it un-surrounded) so Open Hole/Gravel Pack visually contain the screen.
 *   - No liners: the casing shoe.
 */
export function resolveCompletionTopDepth(
  casings: ICasingIR[],
  drlgCasings: IDrlgCsg[],
  wellDesign?: IWellDesign | null,
): number {
  const liners = resolveLinerDepths(casings, drlgCasings);
  if (liners.length === 0) return resolveShoeDepth(casings, drlgCasings);

  if (liners.length === 1) {
    const only = liners[0];
    return isLastLinerScreen(only.odSz, wellDesign)
      ? resolveShoeDepth(casings, drlgCasings)
      : only.botDepth;
  }

  return liners[liners.length - 2].botDepth;
}

export function resolveCompletionTopPx(
  casings: ICasingIR[],
  drlgCasings: IDrlgCsg[],
  scale: DepthScale,
  wellDesign?: IWellDesign | null,
): number {
  return scale(resolveCompletionTopDepth(casings, drlgCasings, wellDesign));
}

export function resolveCompletionBottomDepth(data: WellboreDiagramData): number {
  const completionTopDepth = resolveCompletionTopDepth(data.casings, data.drlgCasings, data.wellDesign);
  const isCurrentDepthBeyondTarget = data.targetDepth > 0 && data.currentDepth > data.targetDepth;

  const naturalBottom = isCurrentDepthBeyondTarget
    ? Math.max(completionTopDepth, Math.min(data.totalDepth, completionTopDepth + OVERRUN_COMPLETION_LENGTH_FT))
    : data.totalDepth;

  return Math.min(naturalBottom, data.displayDepth);
}

export function resolveCompletionBottomPx(data: WellboreDiagramData, scale: DepthScale): number {
  return scale(resolveCompletionBottomDepth(data));
}

function isFlagYes(flg: string | null | undefined): boolean {
  return (flg ?? '').trim().toUpperCase() === 'Y';
}

function hasText(value: string | null | undefined): boolean {
  return !!value?.trim();
}

export function shouldRenderOpenHole(wellDesign: IWellDesign | null | undefined): boolean {
  if (!isFlagYes(wellDesign?.ohFlg)) return false;
  return parseInchSize(wellDesign?.ohRemarks) !== null;
}

export function shouldRenderGravelPack(wellDesign: IWellDesign | null | undefined): boolean {
  if (!isFlagYes(wellDesign?.gpFlg)) return false;
  return hasText(wellDesign?.gpRemarks);
}

export function shouldRenderLinerScreen(wellDesign: IWellDesign | null | undefined): boolean {
  if (!isFlagYes(wellDesign?.lsFlg)) return false;
  return hasText(wellDesign?.lsRemarks);
}

const PRE_PERF_LINER_SIZE_IN = 7;

export interface PrePerforatedLinerDepth {
  readonly odSz: string;
  readonly topDepth: number;
  readonly botDepth: number;
}

/**
 * Resolves the pre-perforated liner overlay depth range.
 *
 * All three conditions must pass:
 *   1. EXAD_GWD_WELL_DESIGN.perforatedFlg is 'Y' (case-insensitive).
 *   2. EXAD_GWD_WELL_DESIGN.perforatedRemarks references a 7" size somewhere in its free text.
 *   3. The anchor liner (see resolveAnchorLiner) has a 7" OD.
 *
 * The returned depths come from that anchor liner's own top/bottom so the overlay is
 * drawn only across its interval — and, with 2+ liners, from the same liner Open Hole
 * and Gravel Pack are drawn below, not the deepest (screen) liner.
 */
export function resolvePrePerforatedLinerDepth(
  wellDesign: IWellDesign | null | undefined,
  drlgCasings: IDrlgCsg[],
  casings: ICasingIR[] = [],
): PrePerforatedLinerDepth | null {
  if (!isFlagYes(wellDesign?.perforatedFlg)) return null;
  if (!remarksReferenceSize(wellDesign?.perforatedRemarks, PRE_PERF_LINER_SIZE_IN)) return null;

  const anchor = resolveAnchorLiner(casings, drlgCasings);
  if (!anchor || parseInchSize(anchor.odSz) !== PRE_PERF_LINER_SIZE_IN) return null;

  return { odSz: anchor.odSz, topDepth: anchor.topDepth, botDepth: anchor.botDepth };
}

export function shouldRenderPrePerforatedLiner(
  wellDesign: IWellDesign | null | undefined,
  drlgCasings: IDrlgCsg[] = [],
  casings: ICasingIR[] = [],
): boolean {
  return resolvePrePerforatedLinerDepth(wellDesign, drlgCasings, casings) !== null;
}

export function resolveOhHalfWidth(data: WellboreDiagramData, layout: DiagramLayout): number {
  const { baseHalfWidth, halfWidthIncrement, openHoleHwMargin } = layout;
  const innerHW = computeCasingHalfWidth(0, baseHalfWidth, halfWidthIncrement);

  if (!isFlagYes(data.wellDesign?.ohFlg)) return innerHW + openHoleHwMargin;

  const ohDiameter = parseInchSize(data.wellDesign?.ohRemarks);
  if (ohDiameter === null) return innerHW + openHoleHwMargin;

  // innerHW is the on-screen half-width of the deepest structural casing (tier 0) — the
  // casing the anchor liner hangs from — so its real OD is the outer bound OH must stay inside.
  const structuralCasings = data.casings.filter(
    c => c.csgType !== 'Liner' && c.csgType !== 'Gravel Pack',
  );
  const outerOD = parseInchSize(structuralCasings[0]?.csgSize ?? null);

  // When liners exist, OH must render strictly outside the anchor liner it surrounds and
  // inside the casing it hangs from (e.g. a 12 1/4" OH must sit outside a 7" liner and
  // inside a 13 3/8" casing). Per-liner on-screen widths (anchorLiner.halfWidth, innerHW)
  // are a cosmetic decrement scheme with no fixed relationship to real inches, so scaling
  // one of them by a raw diameter ratio can overshoot the casing or undershoot the liner.
  // Instead, interpolate between the two known on-screen widths using the real diameter
  // ratio as the blend factor — this guarantees OH always lands between them.
  const liners = resolveLiners(data.casings, data.drlgCasings, layout, data.wellDesign);
  const anchorLiner = liners.length > 1 ? liners[liners.length - 2] : (liners[0] ?? null);

  if (anchorLiner !== null) {
    const linerOD = parseInchSize(anchorLiner.odSz);
    if (linerOD !== null && linerOD > 0) {
      if (outerOD !== null && outerOD > linerOD) {
        const blend = Math.min(1, Math.max(0, (ohDiameter - linerOD) / (outerOD - linerOD)));
        return anchorLiner.halfWidth + blend * (innerHW - anchorLiner.halfWidth);
      }
      // No known casing OD to blend against: fall back to a direct ratio, clamped so OH
      // never renders outside the innermost casing's on-screen width.
      return Math.min(anchorLiner.halfWidth * (ohDiameter / linerOD), innerHW);
    }
  }

  // No liners: scale relative to innermost structural casing
  if (outerOD !== null && outerOD > 0 && ohDiameter < outerOD) {
    return innerHW * (ohDiameter / outerOD);
  }

  return innerHW + openHoleHwMargin;
}

export function getCasingTier(csg: ICasingIR, casings: ICasingIR[]): number {
  const structuralCasings = casings.filter(item => item.csgType !== 'Gravel Pack');
  const idx = structuralCasings.indexOf(csg);
  return idx === -1 ? 0 : idx;
}
