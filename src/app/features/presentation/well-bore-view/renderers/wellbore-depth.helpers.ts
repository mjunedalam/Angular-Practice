import { DiagramLayout, WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { ICasingIR } from '@shared/models/wwell/casing-ir.model';
import { IDrlgCsg } from '@shared/models/wwell/drlg-csg.model';
import { IWellDesign } from '@shared/models/wwell/well-design.model';
import { computeCasingHalfWidth, parseInchSize } from '@shared/utils/wellbore-math.util';
import { DepthScale } from './wellbore-renderer.types';

const OVERRUN_COMPLETION_LENGTH_FT = 1200;
const MIN_COMPLETION_VISIBLE_FT = 1000;

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
  const plannedTargetDepth = data.prewap?.estTargetDepth ?? 0;
  const isCurrentDepthBeyondTarget = plannedTargetDepth > 0 && data.currentDepth > plannedTargetDepth;

  const naturalBottom = isCurrentDepthBeyondTarget
    ? Math.max(completionTopDepth, Math.min(data.totalDepth, completionTopDepth + OVERRUN_COMPLETION_LENGTH_FT))
    : data.totalDepth;

  // wPrsntDpth and estTargetDepth can be equal/near-equal, or the casing shoe can sit
  // right at totalDepth — either way the completion span collapses to ~0px and the
  // open hole / screen / gravel pack become invisible. Force a minimum visible span,
  // borrowing from the display padding below totalDepth.
  const minVisibleBottom = completionTopDepth + MIN_COMPLETION_VISIBLE_FT;
  return Math.min(Math.max(naturalBottom, minVisibleBottom), data.displayDepth);
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

export function shouldRenderPrePerforatedLiner(wellDesign: IWellDesign | null | undefined): boolean {
  if (!isFlagYes(wellDesign?.perforatedFlg)) return false;
  return hasText(wellDesign?.perforatedRemarks);
}

export function resolveOhHalfWidth(data: WellboreDiagramData, layout: DiagramLayout): number {
  const { baseHalfWidth, halfWidthIncrement, openHoleHwMargin } = layout;
  const innerHW = computeCasingHalfWidth(0, baseHalfWidth, halfWidthIncrement);

  if (!isFlagYes(data.wellDesign?.ohFlg)) return innerHW + openHoleHwMargin;

  const structuralCasings = data.casings.filter(
    c => c.csgType !== 'Liner' && c.csgType !== 'Gravel Pack',
  );
  const innermostOD = parseInchSize(structuralCasings[0]?.csgSize ?? null);
  const ohDiameter = parseInchSize(data.wellDesign?.ohRemarks);

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
