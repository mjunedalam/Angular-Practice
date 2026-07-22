import { DiagramLayout, WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { ICasingIR } from '@shared/models/wwell/casing-ir.model';
import { IDrlgCsg } from '@shared/models/wwell/drlg-csg.model';
import { IWellDesign } from '@shared/models/wwell/well-design.model';
import { computeCasingHalfWidth, parseInchSize, remarksReferenceSize } from '@shared/utils/wellbore-math.util';
import { resolveLiners } from './liner.renderer';
import { DepthScale } from './wellbore-renderer.types';

const OVERRUN_COMPLETION_LENGTH_FT = 1200;

export function resolveShoeDepth(casings: ICasingIR[], drlgCasings: IDrlgCsg[]): number {
  const irNonLiner = casings.filter(c => c.csgType !== 'Liner' && c.csgType !== 'Gravel Pack');
  const deepest = irNonLiner[0];
  if (!deepest) return drlgCasings[0]?.wCsgBotDpth ?? 0;

  const actual = drlgCasings.find(d => d.wCsgOdSz === deepest.csgSize) ?? null;
  return (actual !== null && actual.wCsgBotDpth > 0 ? actual.wCsgBotDpth : null) ?? deepest.csgDepth;
}

export function resolveLinerTopDepth(casings: ICasingIR[], drlgCasings: IDrlgCsg[]): number {
  const liner = casings.find(c => c.csgType === 'Liner');
  if (liner) {
    const actualLnr = drlgCasings.find(d => d.wLnrOdSz === liner.csgSize) ?? null;
    const topDepth = (actualLnr?.wLnrTopDepth ?? 0) > 0 ? (actualLnr?.wLnrTopDepth ?? null) : null;
    if (topDepth !== null) return topDepth;
  }
  return resolveShoeDepth(casings, drlgCasings);
}

export function resolveCompletionTopDepth(casings: ICasingIR[], drlgCasings: IDrlgCsg[]): number {
  const liner = casings.find(c => c.csgType === 'Liner');
  if (liner) {
    const actualLnr = drlgCasings.find(d => d.wLnrOdSz === liner.csgSize) ?? null;
    const actualDepth = (actualLnr?.wLnrBotDepth ?? 0) > 0 ? actualLnr?.wLnrBotDepth ?? null : null;
    return actualDepth ?? liner.csgDepth;
  }

  return resolveShoeDepth(casings, drlgCasings);
}

export function resolveCompletionTopPx(
  casings: ICasingIR[],
  drlgCasings: IDrlgCsg[],
  scale: DepthScale,
): number {
  return scale(resolveCompletionTopDepth(casings, drlgCasings));
}

export function resolveCompletionBottomDepth(data: WellboreDiagramData): number {
  const completionTopDepth = resolveCompletionTopDepth(data.casings, data.drlgCasings);
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
 *   3. DRLG_CSG reports a matching 7" liner (wLnrOdSz) with a valid bottom depth.
 *
 * The returned depths come from that matched DRLG_CSG entry so the overlay is drawn
 * only across the actual liner interval and never exceeds its bottom depth.
 */
export function resolvePrePerforatedLinerDepth(
  wellDesign: IWellDesign | null | undefined,
  drlgCasings: IDrlgCsg[],
): PrePerforatedLinerDepth | null {
  if (!isFlagYes(wellDesign?.perforatedFlg)) return null;
  if (!remarksReferenceSize(wellDesign?.perforatedRemarks, PRE_PERF_LINER_SIZE_IN)) return null;

  const matchedLiner = drlgCasings.find(
    d => parseInchSize(d.wLnrOdSz) === PRE_PERF_LINER_SIZE_IN && (d.wLnrBotDepth ?? 0) > 0,
  );
  if (!matchedLiner) return null;

  return {
    odSz: matchedLiner.wLnrOdSz!,
    topDepth: matchedLiner.wLnrTopDepth ?? matchedLiner.wCsgBotDpth,
    botDepth: matchedLiner.wLnrBotDepth!,
  };
}

export function shouldRenderPrePerforatedLiner(
  wellDesign: IWellDesign | null | undefined,
  drlgCasings: IDrlgCsg[] = [],
): boolean {
  return resolvePrePerforatedLinerDepth(wellDesign, drlgCasings) !== null;
}

export function resolveOhHalfWidth(data: WellboreDiagramData, layout: DiagramLayout): number {
  const { baseHalfWidth, halfWidthIncrement, openHoleHwMargin } = layout;
  const innerHW = computeCasingHalfWidth(0, baseHalfWidth, halfWidthIncrement);

  if (!isFlagYes(data.wellDesign?.ohFlg)) return innerHW + openHoleHwMargin;

  const ohDiameter = parseInchSize(data.wellDesign?.ohRemarks);

  // When liners exist, scale OH relative to the last liner so the
  // physical size difference (e.g. 8.5" OH vs 7" liner) is preserved visually.
  const liners = resolveLiners(data.casings, data.drlgCasings, layout, data.wellDesign);
  const lastLiner = liners.length > 0 ? liners[liners.length - 1] : null;

  if (lastLiner !== null && ohDiameter !== null) {
    const linerOD = parseInchSize(lastLiner.odSz);
    if (linerOD !== null && linerOD > 0) {
      return lastLiner.halfWidth * (ohDiameter / linerOD);
    }
  }

  // No liners: scale relative to innermost structural casing
  const structuralCasings = data.casings.filter(
    c => c.csgType !== 'Liner' && c.csgType !== 'Gravel Pack',
  );
  const innermostOD = parseInchSize(structuralCasings[0]?.csgSize ?? null);

  if (ohDiameter !== null && innermostOD !== null && innermostOD > 0 && ohDiameter < innermostOD) {
    return innerHW * (ohDiameter / innermostOD);
  }

  return innerHW + openHoleHwMargin;
}

export function getCasingTier(csg: ICasingIR, casings: ICasingIR[]): number {
  const structuralCasings = casings.filter(item => item.csgType !== 'Gravel Pack');
  const idx = structuralCasings.indexOf(csg);
  return idx === -1 ? 0 : idx;
}
