import { easeCubicInOut, easeLinear } from 'd3-ease';
import 'd3-transition';

import { DiagramLayout, WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { computeCasingHalfWidth } from '@shared/utils/wellbore-math.util';
import { getCasingTier } from './wellbore-depth.helpers';
import { DefsSel, DepthScale, GSel, ResolvedAnimation } from './wellbore-renderer.types';

export interface RenderWaterLevelOptions {
  readonly rootG: GSel;
  readonly defsEl: DefsSel;
  readonly layout: DiagramLayout;
  readonly data: WellboreDiagramData;
  readonly centerX: number;
  readonly scale: DepthScale;
  readonly waterStart: number;
  readonly animation: ResolvedAnimation;
}

export function renderWaterLevel({
  rootG,
  defsEl,
  layout,
  data,
  centerX,
  scale,
  waterStart,
  animation,
}: RenderWaterLevelOptions): void {
  const wd = data.wellDesign;
  if (!wd) return;

  const isFlowing = /flow/i.test(wd.swLvlTxt ?? '');
  const waterDepth = isFlowing ? 0 : (wd.staWaterLvl ?? 0);
  if (!isFlowing && !wd.staWaterLvl) return;

  const { baseHalfWidth, halfWidthIncrement } = layout;
  const wPx = scale(waterDepth);
  const widestCsg = data.casings[data.casings.length - 1];
  const tier = widestCsg ? getCasingTier(widestCsg, data.casings) : 0;
  const innerHW = computeCasingHalfWidth(tier, baseHalfWidth, halfWidthIncrement);
  const lR = centerX + innerHW + 10;
  const lL = centerX - innerHW - 10;
  const lineWidth = lR - lL;
  const rawTxt = wd.swLvlTxt ?? '';
  const label = isFlowing
    ? (/^flowing/i.test(rawTxt) ? rawTxt : `Flowing - ${rawTxt}`)
    : (/^static\s*wl/i.test(rawTxt) ? rawTxt : `Static WL: ${waterDepth.toLocaleString()}`);
  const wg = rootG.append('g').attr('class', 'water-level');

  const clipId = `water-line-clip-${Date.now()}`;
  defsEl.append('clipPath')
    .attr('class', 'dyn-clip')
    .attr('id', clipId)
    .append('rect')
    .attr('x', centerX).attr('y', wPx - 5)
    .attr('width', 0).attr('height', 10)
    .transition().delay(waterStart).duration(animation.lineDur).ease(easeCubicInOut)
    .attr('x', lL).attr('width', lineWidth);

  wg.append('line')
    .attr('class', 'water-line')
    .attr('x1', lL).attr('x2', lR).attr('y1', wPx).attr('y2', wPx)
    .attr('clip-path', `url(#${clipId})`);

  const rippleRxMax = innerHW * 0.55;
  [0, 1, 2].forEach(i => {
    const rDelay = waterStart + i * Math.round(animation.lineDur * 0.35);
    wg.append('ellipse')
      .attr('class', 'water-ripple')
      .attr('cx', centerX).attr('cy', wPx)
      .attr('rx', 5).attr('ry', 2)
      .attr('fill', 'none')
      .attr('stroke', '#3CC3FF')
      .attr('stroke-width', 1.5)
      .style('opacity', 0.85)
      .transition().delay(rDelay).duration(Math.round(animation.lineDur * 1.6)).ease(easeLinear)
      .attr('rx', rippleRxMax).attr('ry', 9)
      .style('opacity', 0);
  });

  const afterLine = waterStart + animation.lineDur;

  wg.append('path')
    .attr('class', 'water-arrow')
    .attr('d', `M${lL} ${wPx - 5} L${lL - 10} ${wPx} L${lL} ${wPx + 5} Z`)
    .style('opacity', 0)
    .transition().delay(afterLine).duration(animation.fadeDur).ease(easeCubicInOut)
    .style('opacity', 1);

  const labelY = Math.max(wPx + 4, 16);
  wg.append('text')
    .attr('class', 'water-label')
    .attr('x', lL - 22).attr('y', labelY)
    .attr('text-anchor', 'end').text(label)
    .style('opacity', 0)
    .transition().delay(afterLine).duration(animation.fadeDur).ease(easeCubicInOut)
    .style('opacity', 1);
}
