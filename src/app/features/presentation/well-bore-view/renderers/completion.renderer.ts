import { easeCubicInOut } from 'd3-ease';
import 'd3-transition';

import { ANIM, DiagramLayout, WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import {
  buildArrowHeadLeft,
  buildArrowHeadRight,
  buildGravelPackUPath,
  buildOpenHolePath,
  buildScreenHanger,
  computeCasingHalfWidth,
} from '@shared/utils/wellbore-math.util';
import { animateLabel } from './animation.helpers';
import {
  getCasingTier,
  resolveCompletionTopDepth,
  resolveCompletionTopPx,
  resolveOhHalfWidth,
  resolveShoeDepth,
} from './wellbore-depth.helpers';
import { DefsSel, DepthScale, GSel, ResolvedAnimation } from './wellbore-renderer.types';

export interface RenderCompletionElementsOptions {
  readonly rootG: GSel;
  readonly defsEl: DefsSel;
  readonly layout: DiagramLayout;
  readonly data: WellboreDiagramData;
  readonly centerX: number;
  readonly scale: DepthScale;
  readonly ohStart: number;
  readonly ohLabelStart: number;
  readonly hangerStart: number;
  readonly animation: ResolvedAnimation;
}

export function renderCompletionElements(options: RenderCompletionElementsOptions): void {
  renderOpenHoleAndScreen(options);
  renderGravelPackDesign(options);
  renderPrePerforatedLiner(options);
}

function renderOpenHoleAndScreen({
  rootG,
  defsEl,
  layout,
  data,
  centerX,
  scale,
  ohStart,
  ohLabelStart,
  animation,
}: RenderCompletionElementsOptions): void {
  if (!data.casings.length) return;

  const { wellDesign } = data;
  const shouldDrawOH = wellDesign?.ohFlg === 'Y';
  const shouldDrawLS = wellDesign?.lsFlg === 'Y';
  if (!shouldDrawOH && !shouldDrawLS) return;

  const { baseHalfWidth, halfWidthIncrement, linerScreenInset, gpScreenGap } = layout;
  const innerHW = computeCasingHalfWidth(0, baseHalfWidth, halfWidthIncrement);
  const ohHW = resolveOhHalfWidth(data, layout);
  const screenHW = Math.min(innerHW, ohHW) - linerScreenInset;
  const liner = data.casings.find(c => c.csgType === 'Liner');
  const gpCasing = data.casings.find(c => c.csgType === 'Gravel Pack');
  const shoePx = resolveCompletionTopPx(data.casings, data.drlgCasings, scale);
  const tdPx = scale(data.totalDepth);
  const hasGP = wellDesign?.gpFlg === 'Y' || !!gpCasing;
  const gpBottomPx = gpCasing ? Math.min(scale(gpCasing.csgDepth), tdPx) : tdPx;
  const screenBottomPx = wellDesign
    ? (shouldDrawLS && hasGP ? gpBottomPx - gpScreenGap : tdPx)
    : (liner ? scale(liner.csgDepth) : tdPx - 15);

  const clipHW = shouldDrawOH ? ohHW : screenHW;
  const clipId = 'dyn-oh-clip';
  const clipRect = defsEl.append('clipPath').attr('class', 'dyn-clip').attr('id', clipId).append('rect')
    .attr('x', centerX - clipHW - 15).attr('y', shoePx - 5).attr('width', clipHW * 2 + 30).attr('height', 0);

  if (shouldDrawOH) {
    rootG.append('path').attr('class', 'open-hole')
      .attr('d', buildOpenHolePath(centerX, ohHW, shoePx, tdPx))
      .attr('clip-path', `url(#${clipId})`);
  }

  if (shouldDrawLS) {
    rootG.append('path').attr('class', 'liner-screen')
      .attr('d', buildOpenHolePath(centerX, screenHW, shoePx, screenBottomPx))
      .attr('clip-path', `url(#${clipId})`);
  }

  clipRect.transition().delay(ohStart).duration(ANIM.OH_DURATION).ease(easeCubicInOut).attr('height', tdPx - shoePx + 5);

  if (shouldDrawOH) {
    const ohLabel = wellDesign?.ohRemarks ?? '8 1/2" Open Hole';
    const ohLY = shoePx + (tdPx - shoePx) * 0.2;
    const ohLG = rootG.append('g').attr('class', 'open-hole-label');
    const ohLineX1 = centerX - ohHW;
    const ohLineX2 = centerX - ohHW - 33;

    ohLG.append('line')
      .attr('class', 'oh-label-line')
      .attr('x1', ohLineX1).attr('x2', ohLineX2).attr('y1', ohLY).attr('y2', ohLY);
    ohLG.append('path')
      .attr('class', 'oh-label-arrow')
      .attr('d', buildArrowHeadLeft(ohLineX2, ohLY, 6));
    ohLG.append('text')
      .attr('class', 'open-hole-text')
      .attr('x', ohLineX2 - 6).attr('y', ohLY + 4).attr('text-anchor', 'end').text(ohLabel);

    animateLabel(ohLG, ohLabelStart, animation);
  }

  if (shouldDrawLS) {
    const shoeDepth = resolveCompletionTopDepth(data.casings, data.drlgCasings);
    const fallbackFt = liner ? liner.csgDepth - shoeDepth : data.totalDepth - shoeDepth;
    const screenLabel = wellDesign?.lsRemarks ?? (liner?.csgRemarks ?? `+/- ${fallbackFt.toLocaleString()} ft of Screen`);
    const scrDelay = ohLabelStart + ANIM.OVERLAY_FADE + ANIM.SEQ_GAP;
    const scrLG = rootG.append('g').attr('class', 'screen-label');
    const scrX1 = centerX + screenHW;
    const scrX2 = centerX + screenHW + 33;

    scrLG.append('line')
      .attr('class', 'screen-label-line')
      .attr('x1', scrX1).attr('x2', scrX2).attr('y1', screenBottomPx).attr('y2', screenBottomPx);
    scrLG.append('path')
      .attr('d', buildArrowHeadRight(scrX2, screenBottomPx, 6));
    scrLG.append('text')
      .attr('class', 'screen-label-text')
      .attr('x', scrX2 + 6).attr('y', screenBottomPx + 4).text(screenLabel);

    animateLabel(scrLG, scrDelay, animation);
  }
}

function renderGravelPackDesign({
  rootG,
  defsEl,
  layout,
  data,
  centerX,
  scale,
  ohStart,
  ohLabelStart,
  animation,
}: RenderCompletionElementsOptions): void {
  if (data.wellDesign?.gpFlg !== 'Y' || !data.casings.length) return;

  const { baseHalfWidth, halfWidthIncrement, linerScreenInset, gpScreenGap, gpFillRatio } = layout;
  const innerHW = computeCasingHalfWidth(0, baseHalfWidth, halfWidthIncrement);
  const ohHW = resolveOhHalfWidth(data, layout);
  const lsHW = Math.min(innerHW, ohHW) - linerScreenInset;
  const gpMaxOuter = ohHW - gpScreenGap;
  const annulusWidth = Math.max(0, (gpMaxOuter - lsHW) * gpFillRatio);
  const gpOuterEdge = lsHW + annulusWidth;
  const annulusCenter = lsHW + annulusWidth / 2;
  const startDepthPx = resolveCompletionTopPx(data.casings, data.drlgCasings, scale);
  const tdPx = scale(data.totalDepth);

  const clipId = 'dyn-gp-design-clip';
  const clipRect = defsEl.append('clipPath').attr('class', 'dyn-clip').attr('id', clipId).append('rect')
    .attr('x', centerX - gpOuterEdge).attr('y', startDepthPx)
    .attr('width', gpOuterEdge * 2).attr('height', 0);

  rootG.append('path')
    .attr('class', 'gravelHole')
    .attr('d', buildGravelPackUPath(centerX, annulusCenter, startDepthPx, tdPx))
    .attr('stroke', 'url(#gravelpattern)')
    .attr('stroke-width', String(annulusWidth))
    .style('fill', 'none')
    .attr('clip-path', `url(#${clipId})`);

  clipRect.transition()
    .delay(ohStart)
    .duration(ANIM.GRAVEL_DURATION)
    .ease(easeCubicInOut)
    .attr('height', tdPx - startDepthPx);

  if (!data.wellDesign.gpRemarks) return;

  const labelY = startDepthPx + (tdPx - startDepthPx) * 0.5;
  const rEdge = centerX + gpOuterEdge;
  const lEnd = rEdge + 26;
  const lg = rootG.append('g').attr('class', 'gp-design-label');

  lg.append('line')
    .attr('class', 'screen-label-line')
    .attr('x1', rEdge).attr('x2', lEnd).attr('y1', labelY).attr('y2', labelY);
  lg.append('path').attr('d', buildArrowHeadRight(lEnd, labelY, 6));
  lg.append('text')
    .attr('class', 'screen-label-text')
    .attr('x', lEnd + 6).attr('y', labelY + 4).text(data.wellDesign.gpRemarks);

  animateLabel(lg, ohLabelStart, animation);
}

function renderPrePerforatedLiner({
  rootG,
  defsEl,
  layout,
  data,
  centerX,
  scale,
  ohStart,
  ohLabelStart,
  animation,
}: RenderCompletionElementsOptions): void {
  const wellDesign = data.wellDesign;
  if (!wellDesign || wellDesign.perforatedFlg?.trim().toUpperCase() !== 'Y') return;

  const { openHoleHwMargin } = layout;
  const ohHW = resolveOhHalfWidth(data, layout);
  const perforationGap = Math.max(12, Math.min(20, openHoleHwMargin * 0.65));
  const prePerfHW = Math.max(10, ohHW - perforationGap);
  const topPx = resolveCompletionTopPx(data.casings, data.drlgCasings, scale);
  const tdPx = scale(data.totalDepth);
  const perfTopPx = Math.min(topPx + perforationGap, tdPx);
  const perfBottomPx = Math.max(perfTopPx, tdPx - perforationGap);

  const clipId = 'dyn-perf-clip';
  const clipRect = defsEl.append('clipPath').attr('class', 'dyn-clip').attr('id', clipId).append('rect')
    .attr('x', centerX - prePerfHW - 6).attr('y', perfTopPx - 5)
    .attr('width', (prePerfHW + 6) * 2).attr('height', 0);

  const perfGroup = rootG.append('g')
    .attr('class', 'perf-wall-group')
    .attr('clip-path', `url(#${clipId})`);
  const perfLeftX = centerX - prePerfHW;
  const perfRightX = centerX + prePerfHW;

  perfGroup.append('path')
    .attr('class', 'perf-wall')
    .attr('d', `M${perfLeftX},${perfTopPx} L${perfLeftX},${perfBottomPx}`);
  perfGroup.append('path')
    .attr('class', 'perf-wall')
    .attr('d', `M${perfLeftX},${perfBottomPx} L${perfRightX},${perfBottomPx}`);
  perfGroup.append('path')
    .attr('class', 'perf-wall')
    .attr('d', `M${perfRightX},${perfTopPx} L${perfRightX},${perfBottomPx}`);

  clipRect.transition()
    .delay(ohStart)
    .duration(ANIM.OH_DURATION)
    .ease(easeCubicInOut)
    .attr('height', perfBottomPx - perfTopPx + 10);

  if (!wellDesign.perforatedRemarks) return;

  const labelY = perfTopPx + (perfBottomPx - perfTopPx) * 0.7;
  const lEdge = centerX - prePerfHW;
  const lEnd = lEdge - 26;
  const perfDelay = ohLabelStart + ANIM.OVERLAY_FADE + ANIM.SEQ_GAP;
  const lg = rootG.append('g').attr('class', 'perf-label');

  lg.append('line')
    .attr('class', 'oh-label-line')
    .attr('x1', lEdge).attr('x2', lEnd).attr('y1', labelY).attr('y2', labelY);
  lg.append('path')
    .attr('class', 'oh-label-arrow')
    .attr('d', buildArrowHeadLeft(lEnd, labelY, 6));
  lg.append('text')
    .attr('class', 'open-hole-text')
    .attr('x', lEnd - 4).attr('y', labelY + 4).attr('text-anchor', 'end').text(wellDesign.perforatedRemarks);

  animateLabel(lg, perfDelay, animation);
}

export function renderScreenHanger({
  rootG,
  layout,
  data,
  centerX,
  scale,
  hangerStart,
}: RenderCompletionElementsOptions): void {
  if (!data.casings.length) return;
  const hasLiner = data.casings.some(c => c.csgType === 'Liner');
  const hasLinerScreen = data.wellDesign?.lsFlg === 'Y';
  if (!hasLiner && !hasLinerScreen) return;

  const { baseHalfWidth, halfWidthIncrement, linerScreenInset } = layout;
  const innerHW = computeCasingHalfWidth(0, baseHalfWidth, halfWidthIncrement);
  const ohHW = resolveOhHalfWidth(data, layout);
  const screenHW = Math.min(innerHW, ohHW) - linerScreenInset;
  const hangerG = rootG.append('g').attr('class', 'screen-hangers').style('opacity', 0);

  const addHanger = (yPx: number, hw: number): void => {
    const { left, right } = buildScreenHanger(centerX, yPx, hw);
    hangerG.append('path').attr('class', 'screen-hanger').attr('stroke', '#000000').attr('stroke-width', '1.5').attr('fill', '#000000').attr('d', left);
    hangerG.append('path').attr('class', 'screen-hanger').attr('stroke', '#000000').attr('stroke-width', '1.5').attr('fill', '#000000').attr('d', right);
  };

  if (hasLiner) {
    const liner = data.casings.find(c => c.csgType === 'Liner');
    if (liner) {
      const linerHW = computeCasingHalfWidth(getCasingTier(liner, data.casings), baseHalfWidth, halfWidthIncrement);
      addHanger(scale(resolveShoeDepth(data.casings, data.drlgCasings)), linerHW);
    }
  }

  if (hasLinerScreen) {
    addHanger(scale(resolveCompletionTopDepth(data.casings, data.drlgCasings)), screenHW);
  }

  hangerG.transition().delay(hangerStart).duration(ANIM.HANGER_DURATION).ease(easeCubicInOut).style('opacity', 1);
}
