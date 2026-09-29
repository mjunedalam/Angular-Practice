import { WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { buildArrowHeadRight } from '@shared/utils/wellbore-math.util';
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
  const isCurrentDepthBeyondTarget = data.targetDepth > 0 && data.currentDepth > data.targetDepth;
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
  // Pump leader/label on the RIGHT side of the icon.
  const rTip = iconX + iconW * 0.70;
  const rEnd = rTip + 130;
  const labelX = rEnd + 6;
  const pumpG = rootG.append('g').attr('class', 'pump-group');
  const iconWrap = pumpG.append('g') as GSel;
  const icon = iconWrap.append('svg')
    .attr('x', -iconW / 2)
    .attr('y', -iconH * 0.52)
    .attr('width', iconW)
    .attr('height', iconH)
    .attr('viewBox', '0 0 100 100')
    .attr('overflow', 'visible');

  // Same pump pictogram as `WwellIrWellboreGlyphComponent` (kind="pump", viewBox 0 0 16 14):
  // motor cap/body, volute, inlet/outlet stubs, with cut-out "shine" highlights on top.
  const iconG = icon.append('g')
    .attr('transform', 'translate(30, 28.5) scale(2.5)')
    .attr('fill', 'var(--accent)');

  iconG.append('rect').attr('x', 6.6).attr('y', 0.9).attr('width', 2.8).attr('height', 3.2);
  iconG.append('rect').attr('x', 5.9).attr('y', 0).attr('width', 4.2).attr('height', 1.1).attr('rx', 0.3);
  iconG.append('circle').attr('cx', 8).attr('cy', 8.6).attr('r', 4.6);
  iconG.append('rect').attr('x', 12).attr('y', 7.4).attr('width', 2).attr('height', 2.4);
  iconG.append('rect').attr('x', 13.6).attr('y', 6.9).attr('width', 1.4).attr('height', 3.4).attr('rx', 0.3);
  iconG.append('rect').attr('x', 3.6).attr('y', 7.7).attr('width', 1.6).attr('height', 1.8);
  iconG.append('rect').attr('x', 0.4).attr('y', 5.6).attr('width', 3.8).attr('height', 6).attr('rx', 1.1);

  const shineG = iconG.append('g')
    .attr('fill', 'none')
    .attr('stroke', '#fff')
    .attr('stroke-width', 0.8)
    .attr('stroke-linecap', 'round')
    .attr('opacity', 0.75);
  shineG.append('circle').attr('cx', 8).attr('cy', 8.6).attr('r', 2.3);
  shineG.append('path').attr('d', 'M1.6 7.2v3M2.9 7.2v3');

  applyPop(iconWrap, cx, cy, start, animation);

  const leaderG = pumpG.append('g').attr('class', 'pump-leader-group') as GSel;
  leaderG.append('line')
    .attr('class', 'pump-leader')
    .attr('x1', rTip).attr('x2', rEnd)
    .attr('y1', cy).attr('y2', cy);
  leaderG.append('path')
    .attr('class', 'pump-leader-arrow')
    .attr('d', buildArrowHeadRight(rEnd, cy, 6));
  leaderG.append('text')
    .attr('class', 'pump-label')
    .attr('x', labelX).attr('y', cy + 4)
    .attr('text-anchor', 'start')
    .text(`PS @ ${pumpLvl}`);

  animateLabel(leaderG, start + animation.popDur, animation);
}
