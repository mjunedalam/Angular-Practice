import { WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { buildArrowHeadLeft } from '@shared/utils/wellbore-math.util';
import { animateLabel, applyPop } from './animation.helpers';
import { DepthScale, GSel, ResolvedAnimation } from './wellbore-renderer.types';

export interface RenderTotalDepthLabelOptions {
  readonly rootG: GSel;
  readonly data: WellboreDiagramData;
  readonly centerX: number;
  readonly yPx: number;
  readonly start: number;
  readonly animation: ResolvedAnimation;
}

export interface RenderPumpOptions {
  readonly rootG: GSel;
  readonly data: WellboreDiagramData;
  readonly centerX: number;
  readonly scale: DepthScale;
  readonly start: number;
  readonly animation: ResolvedAnimation;
}

export function renderTotalDepthLabel({
  rootG,
  data,
  centerX,
  yPx,
  start,
  animation,
}: RenderTotalDepthLabelOptions): void {
  const ty = yPx + 35;
  const plannedTargetDepth = data.prewap?.estTargetDepth ?? 0;
  const isCurrentDepthBeyondTarget = plannedTargetDepth > 0 && data.currentDepth > plannedTargetDepth;
  const labelDepth = isCurrentDepthBeyondTarget ? data.currentDepth : data.totalDepth;
  const g = rootG.append('g').attr('class', 'td-label');
  g.append('text')
    .attr('class', isCurrentDepthBeyondTarget ? 'total-depth-main total-depth-main--current' : 'total-depth-main')
    .attr('x', 0).attr('y', 0)
    .attr('text-anchor', 'middle')
    .text(`${isCurrentDepthBeyondTarget ? 'CURRENT DEPTH' : 'TOTAL DEPTH'}: ${labelDepth.toLocaleString()} FT`);
  applyPop(g, centerX, ty, start, animation);
}

export function renderPump({
  rootG,
  data,
  centerX,
  scale,
  start,
  animation,
}: RenderPumpOptions): void {
  const pumpLvl = data.wellDesign?.pumpLvl;
  if (pumpLvl == null) return;

  const cy = scale(pumpLvl);
  const cx = centerX;
  const iconW = 100;
  const iconH = 100;
  const iconX = cx - iconW / 2;
  const lTip = iconX + iconW * 0.30;
  const lEnd = lTip - 130;
  const labelX = lEnd - 6;
  const pumpG = rootG.append('g').attr('class', 'pump-group');
  const iconWrap = pumpG.append('g') as GSel;
  const icon = iconWrap.append('svg')
    .attr('x', -iconW / 2)
    .attr('y', -iconH * 0.52)
    .attr('width', iconW)
    .attr('height', iconH)
    .attr('viewBox', '0 0 100 100')
    .attr('overflow', 'visible');

  const iconG = icon.append('g')
    .attr('stroke', '#1e293b')
    .attr('stroke-width', '3')
    .attr('stroke-linecap', 'round')
    .attr('stroke-linejoin', 'round');

  iconG.append('line').attr('x1', 35).attr('y1', 52).attr('x2', 65).attr('y2', 52);
  iconG.append('polygon').attr('points', '30,52 36,48 36,56').attr('fill', '#1e293b').attr('stroke', 'none');
  iconG.append('polygon').attr('points', '70,52 64,48 64,56').attr('fill', '#1e293b').attr('stroke', 'none');
  iconG.append('line').attr('x1', 50).attr('y1', 40).attr('x2', 50).attr('y2', 52);
  iconG.append('polygon').attr('points', '50,34 45,40 55,40').attr('fill', '#1e293b').attr('stroke', 'none');

  applyPop(iconWrap, cx, cy, start, animation);

  const leaderG = pumpG.append('g').attr('class', 'pump-leader-group') as GSel;
  leaderG.append('line')
    .attr('class', 'pump-leader')
    .attr('x1', lTip).attr('x2', lEnd)
    .attr('y1', cy).attr('y2', cy);
  leaderG.append('path')
    .attr('class', 'pump-leader-arrow')
    .attr('d', buildArrowHeadLeft(lEnd, cy, 6));
  leaderG.append('text')
    .attr('class', 'pump-label')
    .attr('x', labelX).attr('y', cy + 4)
    .attr('text-anchor', 'end')
    .text(`PS @ ${pumpLvl}`);

  animateLabel(leaderG, start + animation.popDur, animation);
}
