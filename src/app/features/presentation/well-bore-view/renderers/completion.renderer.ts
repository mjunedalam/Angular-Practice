import { easeCubicInOut } from 'd3-ease';
import 'd3-transition';

import { ANIM, DiagramLayout, WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import {
  buildArrowHeadLeft,
  buildArrowHeadRight,
  buildGravelPackUPath,
  buildOpenHolePath,
  buildPrePerfLiner,
  buildScreenHanger,
  computeCasingHalfWidth,
} from '@shared/utils/wellbore-math.util';
import { animateLabel } from './animation.helpers';
import {
  resolveCompletionBottomDepth,
  resolveCompletionBottomPx,
  resolveCompletionTopDepth,
  resolveCompletionTopPx,
  resolveOhHalfWidth,
  resolvePrePerforatedLinerDepth,
  shouldRenderGravelPack,
  shouldRenderLinerScreen,
  shouldRenderOpenHole,
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
  const shouldDrawOH = shouldRenderOpenHole(wellDesign);
  // When DRLG_CSG liners are present, liner.renderer owns all liner rendering (shapes,
  // hangers, and the 7" screen via isScreen). The legacy completion-path screen is only
  // drawn when there are no as-drilled liners and the well-design flags opt in.
  const hasDrlgLiners = data.drlgCasings.some(d => d.wLnrOdSz && (d.wLnrBotDepth ?? 0) > 0);
  const shouldDrawLS = !hasDrlgLiners && shouldRenderLinerScreen(wellDesign);
  if (!shouldDrawOH && !shouldDrawLS) return;

  const { baseHalfWidth, halfWidthIncrement, linerScreenInset, gpScreenGap } = layout;
  const innerHW = computeCasingHalfWidth(0, baseHalfWidth, halfWidthIncrement);
  const ohHW = resolveOhHalfWidth(data, layout);
  const screenHW = Math.min(innerHW, ohHW) - linerScreenInset;
  const liner = data.casings.find(c => c.csgType === 'Liner');
  const gpCasing = data.casings.find(c => c.csgType === 'Gravel Pack');
  const shoePx = resolveCompletionTopPx(data.casings, data.drlgCasings, scale);
  const completionBottomDepth = resolveCompletionBottomDepth(data);
  const completionBottomPx = scale(completionBottomDepth);
  const hasGP = shouldRenderGravelPack(wellDesign) || !!gpCasing;
  const gpBottomPx = gpCasing ? Math.min(scale(gpCasing.csgDepth), completionBottomPx) : completionBottomPx;
  const screenBottomPx = wellDesign
    ? (shouldDrawLS && hasGP ? gpBottomPx - gpScreenGap : completionBottomPx)
    : (liner ? scale(liner.csgDepth) : completionBottomPx - 15);
  const clipHW = shouldDrawOH ? ohHW : screenHW;
  const clipId = 'dyn-oh-clip';
  const clipRect = defsEl.append('clipPath').attr('class', 'dyn-clip').attr('id', clipId).append('rect')
    .attr('x', centerX - clipHW - 15).attr('y', shoePx - 5).attr('width', clipHW * 2 + 30).attr('height', 0);

  if (shouldDrawOH) {
    rootG.append('path').attr('class', 'open-hole')
      .attr('d', buildOpenHolePath(centerX, ohHW, shoePx, completionBottomPx))
      .attr('clip-path', `url(#${clipId})`);
  }

  if (shouldDrawLS) {
    rootG.append('path').attr('class', 'liner-screen')
      .attr('d', buildOpenHolePath(centerX, screenHW, shoePx, screenBottomPx))
      .attr('clip-path', `url(#${clipId})`);
  }

  clipRect.transition().delay(ohStart).duration(ANIM.OH_DURATION).ease(easeCubicInOut).attr('height', completionBottomPx - shoePx + 5);

  if (shouldDrawOH) {
    const ohLabel = wellDesign?.ohRemarks ?? '8 1/2" Open Hole';
    const ohLY = shoePx + (completionBottomPx - shoePx) * 0.2;
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
    const fallbackFt = liner ? liner.csgDepth - shoeDepth : completionBottomDepth - shoeDepth;
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
  const wellDesign = data.wellDesign;
  if (!wellDesign || !shouldRenderGravelPack(wellDesign) || !data.casings.length) return;

  const { baseHalfWidth, halfWidthIncrement, linerScreenInset, gpScreenGap, gpFillRatio } = layout;
  const innerHW = computeCasingHalfWidth(0, baseHalfWidth, halfWidthIncrement);
  const ohHW = resolveOhHalfWidth(data, layout);
  const lsHW = Math.min(innerHW, ohHW) - linerScreenInset;
  const gpMaxOuter = ohHW - gpScreenGap;
  const annulusWidth = Math.max(0, (gpMaxOuter - lsHW) * gpFillRatio);
  const gpOuterEdge = lsHW + annulusWidth;
  const annulusCenter = lsHW + annulusWidth / 2;
  const startDepthPx = resolveCompletionTopPx(data.casings, data.drlgCasings, scale);
  const completionBottomPx = resolveCompletionBottomPx(data, scale);

  const clipId = 'dyn-gp-design-clip';
  const clipRect = defsEl.append('clipPath').attr('class', 'dyn-clip').attr('id', clipId).append('rect')
    .attr('x', centerX - gpOuterEdge).attr('y', startDepthPx)
    .attr('width', gpOuterEdge * 2).attr('height', 0);

  rootG.append('path')
    .attr('class', 'gravelHole')
    .attr('d', buildGravelPackUPath(centerX, annulusCenter, startDepthPx, completionBottomPx))
    .attr('stroke', 'url(#gravelpattern)')
    .attr('stroke-width', String(annulusWidth))
    .style('fill', 'none')
    .attr('clip-path', `url(#${clipId})`);

  clipRect.transition()
    .delay(ohStart)
    .duration(ANIM.GRAVEL_DURATION)
    .ease(easeCubicInOut)
    .attr('height', completionBottomPx - startDepthPx);

  const labelY = startDepthPx + (completionBottomPx - startDepthPx) * 0.5;
  const rEdge = centerX + gpOuterEdge;
  const lEnd = rEdge + 26;
  const lg = rootG.append('g').attr('class', 'gp-design-label');

  lg.append('line')
    .attr('class', 'screen-label-line')
    .attr('x1', rEdge).attr('x2', lEnd).attr('y1', labelY).attr('y2', labelY);
  lg.append('path').attr('d', buildArrowHeadRight(lEnd, labelY, 6));
  lg.append('text')
    .attr('class', 'screen-label-text')
    .attr('x', lEnd + 6).attr('y', labelY + 4).text(wellDesign.gpRemarks);

  animateLabel(lg, ohLabelStart, animation);
}

// Matches the `+4` clearance liner.renderer uses between a liner's hanger bracket and its
// own top depth, so the perforated overlay starts flush with — not below — the hanger.
const PRE_PERF_HANGER_CLEARANCE_PX = 4;

function renderPrePerforatedLiner({
  rootG,
  defsEl,
  layout,
  data,
  centerX,
  scale,
  ohStart,
}: RenderCompletionElementsOptions): void {
  const wellDesign = data.wellDesign;
  const prePerfDepth = resolvePrePerforatedLinerDepth(wellDesign, data.drlgCasings);
  if (!wellDesign || !prePerfDepth) return;

  const { openHoleHwMargin } = layout;
  const ohHW = resolveOhHalfWidth(data, layout);
  const perfHwInset = Math.max(12, Math.min(20, openHoleHwMargin * 0.65));
  const prePerfHW = Math.max(10, ohHW - perfHwInset);
  const topPx = scale(prePerfDepth.topDepth);
  // Never draw past the liner's own bottom depth, and still respect the current display cap.
  const botDepth = Math.min(prePerfDepth.botDepth, resolveCompletionBottomDepth(data));
  const completionBottomPx = scale(botDepth);
  // Start just after the liner hanger and run all the way to the liner's bottom — do not
  // shorten either end.
  const perfTopPx = Math.min(topPx + PRE_PERF_HANGER_CLEARANCE_PX, completionBottomPx);
  const perfBottomPx = completionBottomPx;

  const clipId = 'dyn-perf-clip';
  const clipRect = defsEl.append('clipPath').attr('class', 'dyn-clip').attr('id', clipId).append('rect')
    .attr('x', centerX - prePerfHW - 6).attr('y', perfTopPx - 5)
    .attr('width', (prePerfHW + 6) * 2).attr('height', 0);

  const { walls, ticks, shoe } = buildPrePerfLiner(centerX, prePerfHW, perfTopPx, perfBottomPx);
  const perfGroup = rootG.append('g')
    .attr('class', 'perf-wall-group')
    .attr('clip-path', `url(#${clipId})`);

  // Distinct classes so the CSS-defined dash pattern only applies to the vertical walls —
  // sharing it with the short tick marks previously cut each tick off after ~half its length,
  // rendering asymmetrically on the left vs. right side.
  perfGroup.append('path').attr('class', 'perf-wall').attr('d', walls);
  perfGroup.append('path').attr('class', 'perf-tick').attr('d', ticks);
  perfGroup.append('path').attr('class', 'perf-shoe').attr('d', shoe);
  perfGroup.append('title').text(`${prePerfDepth.odSz}" Pre Perf Liner`);

  clipRect.transition()
    .delay(ohStart)
    .duration(ANIM.OH_DURATION)
    .ease(easeCubicInOut)
    .attr('height', perfBottomPx - perfTopPx + 10);
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
  // Liner hangers are drawn per-liner by liner.renderer (for both DRLG and IR sources).
  // This function no longer draws a hanger for the liner itself — that produced a
  // duplicate OUTER hanger set. It only draws the well-design liner-screen hanger
  // (lsFlg='Y') for a screen that has no corresponding liner geometry.
  if (!shouldRenderLinerScreen(data.wellDesign)) return;
  const hasDrlgLiners = data.drlgCasings.some(d => d.wLnrOdSz && (d.wLnrBotDepth ?? 0) > 0);
  if (hasDrlgLiners) return;

  const { baseHalfWidth, halfWidthIncrement, linerScreenInset } = layout;
  const innerHW = computeCasingHalfWidth(0, baseHalfWidth, halfWidthIncrement);
  const ohHW = resolveOhHalfWidth(data, layout);
  const screenHW = Math.min(innerHW, ohHW) - linerScreenInset;
  const hangerG = rootG.append('g').attr('class', 'screen-hangers').style('opacity', 0);

  const screenY = scale(resolveCompletionTopDepth(data.casings, data.drlgCasings));
  const { left, right } = buildScreenHanger(centerX, screenY, screenHW);
  hangerG.append('path').attr('class', 'screen-hanger').attr('stroke', '#000000').attr('stroke-width', '1.5').attr('fill', '#000000').attr('d', left);
  hangerG.append('path').attr('class', 'screen-hanger').attr('stroke', '#000000').attr('stroke-width', '1.5').attr('fill', '#000000').attr('d', right);

  hangerG.transition().delay(hangerStart).duration(ANIM.HANGER_DURATION).ease(easeCubicInOut).style('opacity', 1);
}
