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
  resolveCompletionBottomDepth,
  resolveCompletionBottomPx,
  resolveCompletionRule,
  resolveCompletionShoeCurvePx,
  resolveCompletionTopDepth,
  resolveCompletionTopPx,
  resolveOhHalfWidth,
  resolvePerforatedIntervalInfo,
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
  // Only skip when there's no casing data of any kind (planned or as-drilled) to anchor
  // to — a DRLG_CSG-only well (no EXAD_GWD_IR_CASING rows) must still render OH/GP when
  // its flags are 'Y', same as an IR-backed well.
  if (!data.casings.length && !data.drlgCasings.length) return;

  const { wellDesign } = data;
  const shouldDrawOH = shouldRenderOpenHole(wellDesign);
  // When a liner qualifies as the 7" completion target (Rule 2 / Rule 3 standard
  // evaluation), liner.renderer owns all liner rendering (shapes, hangers, and the 7"
  // screen via isScreen). The legacy completion-path screen is only drawn when no liner
  // qualifies (no liner at all, or a fallback well with an ordinary liner / no 7" match)
  // and lsFlg opts in.
  const rule = resolveCompletionRule(data.casings, data.drlgCasings);
  const shouldDrawLS = rule.targetLiner === null && shouldRenderLinerScreen(wellDesign);
  if (!shouldDrawOH && !shouldDrawLS) return;

  const { baseHalfWidth, halfWidthIncrement, linerScreenInset, gpScreenGap } = layout;
  const innerHW = computeCasingHalfWidth(0, baseHalfWidth, halfWidthIncrement);
  const ohHW = resolveOhHalfWidth(data, layout);
  const screenHW = Math.min(innerHW, ohHW) - linerScreenInset;
  const liner = data.casings.find(c => c.csgType === 'Liner');
  const gpCasing = data.casings.find(c => c.csgType === 'Gravel Pack');
  const shoePx = resolveCompletionTopPx(data.casings, data.drlgCasings, scale);
  const completionBottomDepth = resolveCompletionBottomDepth(data);
  // Extend past the resolved depth so the OH border reaches the liner's own rendered
  // shoe curve instead of stopping flat short of it (see resolveCompletionShoeCurvePx).
  const completionBottomPx = scale(completionBottomDepth)
    + resolveCompletionShoeCurvePx(data.casings, data.drlgCasings, layout);
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
  if (!wellDesign || !shouldRenderGravelPack(wellDesign)) return;
  if (!data.casings.length && !data.drlgCasings.length) return;

  const { baseHalfWidth, halfWidthIncrement, linerScreenInset, gpScreenGap, gpFillRatio } = layout;
  const innerHW = computeCasingHalfWidth(0, baseHalfWidth, halfWidthIncrement);
  const ohHW = resolveOhHalfWidth(data, layout);
  const lsHW = Math.min(innerHW, ohHW) - linerScreenInset;
  const gpMaxOuter = ohHW - gpScreenGap;
  const annulusWidth = Math.max(0, (gpMaxOuter - lsHW) * gpFillRatio);
  const gpOuterEdge = lsHW + annulusWidth;
  const annulusCenter = lsHW + annulusWidth / 2;
  const startDepthPx = resolveCompletionTopPx(data.casings, data.drlgCasings, scale);
  // Extend past the resolved depth so the GP border reaches the liner's own rendered
  // shoe curve instead of stopping flat short of it (see resolveCompletionShoeCurvePx).
  const completionBottomPx = resolveCompletionBottomPx(data, scale)
    + resolveCompletionShoeCurvePx(data.casings, data.drlgCasings, layout);

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
    .attr('x', lEnd + 6).attr('y', labelY + 4).text(wellDesign.gpRemarks ?? 'Gravel Pack');

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
  const perfInfo = resolvePerforatedIntervalInfo(wellDesign, data.casings, data.drlgCasings);
  if (!wellDesign || !perfInfo) return;

  const { openHoleHwMargin } = layout;
  const ohHW = resolveOhHalfWidth(data, layout);
  const perfHwInset = Math.max(12, Math.min(20, openHoleHwMargin * 0.65));
  const prePerfHW = Math.max(10, ohHW - perfHwInset);
  // Same shared interval as Open Hole / Gravel Pack (docs/plan/logic.md Rules 1-3),
  // extended to reach the liner's own rendered shoe curve (see resolveCompletionShoeCurvePx).
  const perfTopPx = scale(resolveCompletionTopDepth(data.casings, data.drlgCasings));
  const perfBottomPx = resolveCompletionBottomPx(data, scale)
    + resolveCompletionShoeCurvePx(data.casings, data.drlgCasings, layout);

  const clipId = 'dyn-perf-clip';
  const clipRect = defsEl.append('clipPath').attr('class', 'dyn-clip').attr('id', clipId).append('rect')
    .attr('x', centerX - prePerfHW - 6).attr('y', perfTopPx - 5)
    .attr('width', (prePerfHW + 6) * 2).attr('height', 0);

  const perfGroup = rootG.append('g')
    .attr('class', 'perf-wall-group')
    .attr('clip-path', `url(#${clipId})`);

  // Same outline as open hole (left wall, bottom shoe, right wall in one continuous path) —
  // just a bigger dash gap and a thicker, darker stroke so it reads as its own element.
  perfGroup.append('path')
    .attr('class', 'pre-perf-liner')
    .attr('d', buildOpenHolePath(centerX, prePerfHW, perfTopPx, perfBottomPx));
  // linerOdSz comes straight from DRLG_CSG and may already carry a trailing inch mark
  // (e.g. `7"`) — strip it so the tooltip never doubles up as `7"" Pre Perf Liner`. Null
  // (Rule 1 / Rule 3 fallback — no single liner anchors the interval) falls back to a
  // generic label.
  const perfTitle = perfInfo.linerOdSz
    ? `${perfInfo.linerOdSz.replace(/["']/g, '').trim()}" Pre Perf Liner`
    : (wellDesign.perforatedRemarks ?? 'Perforated Interval');
  perfGroup.append('title').text(perfTitle);

  clipRect.transition()
    .delay(ohStart)
    .duration(ANIM.OH_DURATION)
    .ease(easeCubicInOut)
    .attr('height', perfBottomPx - perfTopPx + 10);

  // Visible on-diagram label — every sibling completion element (Open Hole, Gravel Pack,
  // Liner Screen) gets a leader-line text label; this one previously only carried a native
  // <title> tooltip, which is invisible until hover, so perforatedRemarks effectively never
  // showed up even when populated. Prefer the remarks text itself over perfTitle's generic
  // "Pre Perf Liner"/"Perforated Interval" fallback.
  // const perfLabel = wellDesign.perforatedRemarks ?? perfTitle;
  // const perfLY = perfTopPx + (perfBottomPx - perfTopPx) * 0.7;
  // const perfLG = rootG.append('g').attr('class', 'perf-label');
  // const perfLineX1 = centerX - prePerfHW;
  // const perfLineX2 = perfLineX1 - 33;

  // perfLG.append('line')
  //   .attr('class', 'oh-label-line')
  //   .attr('x1', perfLineX1).attr('x2', perfLineX2).attr('y1', perfLY).attr('y2', perfLY);
  // perfLG.append('path')
  //   .attr('class', 'oh-label-arrow')
  //   .attr('d', buildArrowHeadLeft(perfLineX2, perfLY, 6));
  // perfLG.append('text')
  //   .attr('class', 'open-hole-text')
  //   .attr('x', perfLineX2 - 6).attr('y', perfLY + 4).attr('text-anchor', 'end').text(perfLabel);

  // animateLabel(perfLG, ohLabelStart, animation);
}

export function renderScreenHanger({
  rootG,
  layout,
  data,
  centerX,
  scale,
  hangerStart,
}: RenderCompletionElementsOptions): void {
  if (!data.casings.length && !data.drlgCasings.length) return;
  // Liner hangers are drawn per-liner by liner.renderer (for both DRLG and IR sources).
  // This function no longer draws a hanger for the liner itself — that produced a
  // duplicate OUTER hanger set. It only draws the well-design liner-screen hanger
  // (lsFlg='Y') for a screen that has no corresponding liner geometry.
  if (!shouldRenderLinerScreen(data.wellDesign)) return;
  // Only when no liner qualifies as the 7" completion target: liner.renderer already
  // draws a hanger for that target liner itself (isScreen), so this generic bracket would
  // duplicate it. When no liner qualifies (no liner at all, or a fallback well with an
  // ordinary liner / no 7" match), there's no liner geometry for the implied screen, so
  // this draws its hanger in place of one.
  if (resolveCompletionRule(data.casings, data.drlgCasings).targetLiner !== null) return;

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
