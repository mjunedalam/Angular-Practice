import { DiagramLayout, WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { ICasingIR } from '@shared/models/wwell/casing-ir.model';
import { IDrlgCsg } from '@shared/models/wwell/drlg-csg.model';
import { computeCasingHalfWidth, parseInchSize } from '@shared/utils/wellbore-math.util';
import { DepthScale } from './wellbore-renderer.types';

export function resolveShoeDepth(casings: ICasingIR[], drlgCasings: IDrlgCsg[]): number {
  const irNonLiner = casings.filter(c => c.csgType !== 'Liner' && c.csgType !== 'Gravel Pack');
  const deepest = irNonLiner[0];
  if (!deepest) return drlgCasings[0]?.wCsgBotDpth ?? 0;

  const actual = drlgCasings.find(d => d.wCsgOdSz === deepest.csgSize) ?? null;
  return (actual !== null && actual.wCsgBotDpth > 0 ? actual.wCsgBotDpth : null) ?? deepest.csgDepth;
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

export function resolveOhHalfWidth(data: WellboreDiagramData, layout: DiagramLayout): number {
  const { baseHalfWidth, halfWidthIncrement, openHoleHwMargin } = layout;
  const innerHW = computeCasingHalfWidth(0, baseHalfWidth, halfWidthIncrement);

  if (data.wellDesign?.ohFlg !== 'Y') return innerHW + openHoleHwMargin;

  const structuralCasings = data.casings.filter(
    c => c.csgType !== 'Liner' && c.csgType !== 'Gravel Pack',
  );
  const innermostOD = parseInchSize(structuralCasings[0]?.csgSize ?? null);
  const ohDiameter = parseInchSize(data.wellDesign.ohRemarks);

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
