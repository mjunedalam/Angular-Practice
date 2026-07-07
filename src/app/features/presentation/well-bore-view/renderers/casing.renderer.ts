import { easeCubicInOut } from 'd3-ease';
import 'd3-transition';

import { ANIM, DiagramLayout } from '@models/well-design/wellbore-diagram.model';
import { ICasingIR } from '@shared/models/wwell/casing-ir.model';
import { IDrlgCsg } from '@shared/models/wwell/drlg-csg.model';
import {
  buildArrowHeadRight,
  buildCasingPath,
  buildGravelPackUPath,
  casingGradientId,
  computeCasingHalfWidth,
  openHoleHalfWidth,
} from '@shared/utils/wellbore-math.util';
import { animateLabel } from './animation.helpers';
import { getCasingTier, resolveCompletionTopDepth } from './wellbore-depth.helpers';
import { resolveLiners, renderLiners } from './liner.renderer';
import { DefsSel, DepthScale, GSel, ResolvedAnimation } from './wellbore-renderer.types';

export interface RenderCasingElementsOptions {
  readonly rootG: GSel;
  readonly defsEl: DefsSel;
  readonly layout: DiagramLayout;
  readonly casings: ICasingIR[];
  readonly drlgCasings: IDrlgCsg[];
  readonly centerX: number;
  readonly scale: DepthScale;
  readonly casingsStart: number;
  readonly linersStart: number;
  readonly gravelStart: number;
  readonly labelsStart: number;
  readonly openHoleHalfWidthPx: number;
  readonly animation: ResolvedAnimation;
}

export function renderCasingElements(options: RenderCasingElementsOptions): void {
  const { casings, drlgCasings, layout, rootG, defsEl, centerX, scale, linersStart, labelsStart, animation } = options;
  const liners = resolveLiners(casings, drlgCasings, layout);
  const lastCasingBotDepth = resolveLastCasingBotDepth(casings, drlgCasings);

  renderCasings(options);
  renderLiners({ rootG, defsEl, layout, liners, centerX, scale, linersStart, labelsStart, animation, lastCasingBotDepth });
  renderCasingLabels(options);
}

function resolveLastCasingBotDepth(casings: ICasingIR[], drlgCasings: IDrlgCsg[]): number {
  // Find the deepest non-liner casing shoe — that is the 13 3/8" (or innermost casing) shoe
  if (casings.length === 0) {
    // drlgCasings only: wCsgBotDpth is the parent casing shoe; pick the shallowest
    // non-zero value that represents the innermost casing (smallest wCsgBotDpth among actual casing records)
    const casingOnly = drlgCasings.filter(d => !d.wLnrOdSz && d.wCsgBotDpth > 0);
    if (casingOnly.length > 0) {
      return Math.max(...casingOnly.map(d => d.wCsgBotDpth));
    }
    // fallback: deepest wCsgBotDpth across all records
    return Math.max(...drlgCasings.map(d => d.wCsgBotDpth).filter(v => v > 0), 0);
  }

  const nonLiners = casings.filter(c => c.csgType !== 'Liner');
  if (nonLiners.length === 0) return 0;

  // Pick the non-liner casing with the deepest shoe (largest depth value)
  const deepest = nonLiners.reduce((max, c) => c.csgDepth > max.csgDepth ? c : max, nonLiners[0]);
  const actual = drlgCasings.find(d => d.wCsgOdSz === deepest.csgSize);
  return (actual?.wCsgBotDpth ?? 0) > 0 ? actual!.wCsgBotDpth : deepest.csgDepth;
}

function renderCasings({
  rootG,
  defsEl,
  layout,
  casings,
  drlgCasings,
  centerX,
  scale,
  casingsStart,
  gravelStart,
  openHoleHalfWidthPx,
}: RenderCasingElementsOptions): void {
  if (casings.length === 0) {
    renderCasingsFromActual({ rootG, defsEl, layout, drlgCasings, centerX, scale, casingsStart });
    return;
  }

  const { baseHalfWidth, halfWidthIncrement, shoeCurveOffset } = layout;
  const completionTopPx = scale(resolveCompletionTopDepth(casings, drlgCasings));

  casings.forEach((csg, i) => {
    if (csg.csgType === 'Liner') return;
    const tier = getCasingTier(csg, casings);
    const hw = computeCasingHalfWidth(tier, baseHalfWidth, halfWidthIncrement);
    const isConductor = csg.csgType.toLowerCase() === 'conductor';
    const isGP = csg.csgType === 'Gravel Pack';
    const actualCsg = drlgCasings.find(d => d.wCsgOdSz === csg.csgSize) ?? null;
    const hasActual = actualCsg !== null && actualCsg.wCsgBotDpth > 0;
    const displayDepth = hasActual ? actualCsg!.wCsgBotDpth : csg.csgDepth;
    const bottomPx = scale(displayDepth);
    const clipId = `dyn-casing-clip-${i}`;
    const animOrder = casings.length - 1 - i;
    const delay = animOrder * ANIM.CASING_STAGGER;
    const gpInnerHW = computeCasingHalfWidth(0, layout.baseHalfWidth, layout.halfWidthIncrement);
    const gpLsHW = Math.min(gpInnerHW, openHoleHalfWidthPx) - layout.linerScreenInset;
    const gpMaxOuter = openHoleHalfWidthPx - layout.gpScreenGap;
    const gpAnnulusWidth = Math.max(0, (gpMaxOuter - gpLsHW) * layout.gpFillRatio);
    const gpOuterEdge = gpLsHW + gpAnnulusWidth;
    const gpAnnulusCenter = gpLsHW + gpAnnulusWidth / 2;
    const clipRadius = isGP ? gpOuterEdge : openHoleHalfWidth(hw) + 20;

    const clipRect = defsEl
      .append('clipPath')
      .attr('class', 'dyn-clip')
      .attr('id', clipId)
      .append('rect')
      .attr('x', centerX - clipRadius - (isGP ? 0 : 15))
      .attr('y', isGP ? completionTopPx : -5)
      .attr('width', clipRadius * 2 + (isGP ? 0 : 30))
      .attr('height', 0);

    if (isGP) {
      const gravelBottomPx = scale(csg.csgDepth);
      rootG.append('path')
        .attr('class', 'gravelHole')
        .attr('d', buildGravelPackUPath(centerX, gpAnnulusCenter, completionTopPx, gravelBottomPx))
        .attr('stroke', 'url(#gravelpattern)')
        .attr('stroke-width', String(gpAnnulusWidth))
        .style('fill', 'none')
        .attr('clip-path', `url(#${clipId})`);
      clipRect.transition()
        .delay(gravelStart)
        .duration(ANIM.GRAVEL_DURATION)
        .ease(easeCubicInOut)
        .attr('height', gravelBottomPx - completionTopPx);
      return;
    }

    const casingD = buildCasingPath(centerX, hw, 0, bottomPx, shoeCurveOffset);

    if (hasActual) {
      rootG.append('path')
        .attr('class', 'casing')
        .attr('d', casingD)
        .attr('clip-path', `url(#${clipId})`)
        .attr('fill', 'url(#actualCasingGradient)')
        .attr('stroke', '#000000')
        .attr('stroke-width', '5')
        .style('opacity', 0.78);
    } else {
      const plannedFillGrad = isConductor
        ? 'url(#mainGradient)'
        : `url(#${casingGradientId(csg.csgType)})`;
      rootG.append('path')
        .attr('class', 'casing')
        .attr('d', casingD)
        .attr('clip-path', `url(#${clipId})`)
        .attr('fill', plannedFillGrad)
        .attr('stroke', '#000000')
        .attr('stroke-width', '5')
        .style('opacity', isConductor ? 0.75 : 0.40);
    }

    clipRect.transition()
      .delay(casingsStart + delay)
      .duration(ANIM.CASING_DURATION)
      .ease(easeCubicInOut)
      .attr('height', bottomPx + shoeCurveOffset + 20);
  });
}

function uniqueCasingsByOd(drlgCasings: IDrlgCsg[]): IDrlgCsg[] {
  const map = new Map<string, IDrlgCsg>();
  for (const d of drlgCasings) {
    if (d.wCsgBotDpth <= 0) continue;
    const existing = map.get(d.wCsgOdSz);
    if (!existing || d.wCsgBotDpth > existing.wCsgBotDpth) {
      map.set(d.wCsgOdSz, d);
    }
  }
  return [...map.values()].sort((a, b) => b.wCsgBotDpth - a.wCsgBotDpth);
}

function renderCasingsFromActual({
  rootG,
  defsEl,
  layout,
  drlgCasings,
  centerX,
  scale,
  casingsStart,
}: Pick<RenderCasingElementsOptions, 'rootG' | 'defsEl' | 'layout' | 'drlgCasings' | 'centerX' | 'scale' | 'casingsStart'>): void {
  const { baseHalfWidth, halfWidthIncrement, shoeCurveOffset } = layout;
  const unique = uniqueCasingsByOd(drlgCasings);

  unique.forEach((actual, i) => {
    const hw = computeCasingHalfWidth(i, baseHalfWidth, halfWidthIncrement);
    const animOrder = unique.length - 1 - i;
    const delay = animOrder * ANIM.CASING_STAGGER;
    const bottomPx = scale(actual.wCsgBotDpth);
    const clipId = `dyn-casing-clip-actual-${i}`;
    const clipRadius = openHoleHalfWidth(hw) + 20;
    const clipRect = defsEl.append('clipPath')
      .attr('class', 'dyn-clip').attr('id', clipId).append('rect')
      .attr('x', centerX - clipRadius - 15).attr('y', -5)
      .attr('width', clipRadius * 2 + 30).attr('height', 0);

    rootG.append('path')
      .attr('class', 'casing')
      .attr('d', buildCasingPath(centerX, hw, 0, bottomPx, shoeCurveOffset))
      .attr('clip-path', `url(#${clipId})`)
      .attr('fill', 'url(#actualCasingGradient)')
      .attr('stroke', '#000000')
      .attr('stroke-width', '5')
      .style('opacity', 0.78);

    clipRect.transition()
      .delay(casingsStart + delay).duration(ANIM.CASING_DURATION).ease(easeCubicInOut)
      .attr('height', bottomPx + shoeCurveOffset + 20);
  });
}

function renderCasingLabels({
  rootG,
  layout,
  casings,
  drlgCasings,
  centerX,
  scale,
  labelsStart,
  openHoleHalfWidthPx,
  animation,
}: RenderCasingElementsOptions): void {
  if (casings.length === 0) {
    renderCasingLabelsFromActual({ rootG, layout, drlgCasings, centerX, scale, labelsStart, animation });
    return;
  }

  const { baseHalfWidth, halfWidthIncrement, linerScreenInset, gpScreenGap, gpFillRatio } = layout;
  const gpLabelInnerHW = computeCasingHalfWidth(0, baseHalfWidth, halfWidthIncrement);
  const gpLabelLsHW = Math.min(gpLabelInnerHW, openHoleHalfWidthPx) - linerScreenInset;
  const gpLabelMaxOuter = openHoleHalfWidthPx - gpScreenGap;
  const gpLabelAnnulus = Math.max(0, (gpLabelMaxOuter - gpLabelLsHW) * gpFillRatio);
  const gpLabelOuterEdge = gpLabelLsHW + gpLabelAnnulus;

  const sortedShoeDepths = casings
    .filter(c => c.csgType !== 'Liner' && c.csgType !== 'Gravel Pack')
    .map(c => {
      const act = drlgCasings.find(d => d.wCsgOdSz === c.csgSize) ?? null;
      return (act !== null && act.wCsgBotDpth > 0) ? act.wCsgBotDpth : c.csgDepth;
    })
    .sort((a, b) => a - b);

  casings.forEach((csg) => {
    if (csg.csgType === 'Liner') return;
    const tier = getCasingTier(csg, casings);
    const hw = computeCasingHalfWidth(tier, baseHalfWidth, halfWidthIncrement);
    const actualCsg = drlgCasings.find(d => d.wCsgOdSz === csg.csgSize) ?? null;
    const hasActual = actualCsg !== null && actualCsg.wCsgBotDpth > 0;
    const displayDepth = hasActual ? actualCsg!.wCsgBotDpth : csg.csgDepth;
    const displaySize = hasActual ? actualCsg!.wCsgOdSz : csg.csgSize;
    const shoePx = scale(displayDepth);
    const labelYPx = csg.csgType === 'Gravel Pack' ? scale(csg.csgDepth) : shoePx;
    const rEdge = csg.csgType === 'Gravel Pack'
      ? centerX + gpLabelOuterEdge
      : centerX + hw;
    const lEnd = rEdge + 26;
    const labelX = lEnd + 8;
    const lg = rootG.append('g').attr('class', 'casing-label');

    lg.append('line')
      .attr('class', 'casing-label__line')
      .attr('x1', rEdge).attr('x2', lEnd)
      .attr('y1', labelYPx).attr('y2', labelYPx);
    lg.append('path')
      .attr('class', 'casing-label__arrow')
      .attr('d', buildArrowHeadRight(lEnd, labelYPx, 6));

    if (csg.csgType === 'Gravel Pack') {
      lg.append('text')
        .attr('class', 'casing-label__primary')
        .attr('x', labelX).attr('y', labelYPx + 4)
        .text(csg.csgRemarks || 'Gravel Pack');
    } else {
      const primaryEl = lg.append('text')
        .attr('class', 'casing-label__primary')
        .attr('x', labelX).attr('y', shoePx + 4);
      if (hasActual) {
        primaryEl
          .attr('fill', '#22c55e')
          .text(`${displaySize}" ${csg.csgType} @ ${displayDepth.toLocaleString()} *`);
        lg.append('text')
          .attr('class', 'casing-label__secondary')
          .attr('x', labelX).attr('y', shoePx + 24)
          .text(`est: ${csg.csgSize}" @ ${csg.csgDepth.toLocaleString()} ft`);
      } else {
        primaryEl.text(`${csg.csgSize}" ${csg.csgType} @ ${csg.csgDepth.toLocaleString()}`);
        if (csg.csgRemarks) {
          lg.append('text')
            .attr('class', 'casing-label__secondary')
            .attr('x', labelX).attr('y', shoePx + 24)
            .text(`(${csg.csgRemarks})`);
        }
      }

      const innerDelay = labelsStart + (animation.lineStyle === 'draw' ? animation.lineDur : 0);
      const rank = sortedShoeDepths.indexOf(displayDepth);
      const innerMidY = rank > 0 ? (scale(sortedShoeDepths[rank - 1]) + shoePx) / 2 : shoePx;
      rootG.append('text')
        .attr('class', 'casing-size-inner')
        .attr('x', centerX).attr('y', innerMidY)
        .attr('text-anchor', 'middle')
        .style('opacity', 0)
        .attr('fill', hasActual ? '#0f2d1a' : '')
        .style('font-weight', hasActual ? '800' : 'normal')
        .text(`${displaySize}"`)
        .transition().delay(innerDelay).duration(animation.fadeDur).ease(easeCubicInOut)
        .style('opacity', 1);
    }

    animateLabel(lg, labelsStart, animation);
  });
}

function renderCasingLabelsFromActual({
  rootG,
  layout,
  drlgCasings,
  centerX,
  scale,
  labelsStart,
  animation,
}: Pick<RenderCasingElementsOptions, 'rootG' | 'layout' | 'drlgCasings' | 'centerX' | 'scale' | 'labelsStart' | 'animation'>): void {
  const { baseHalfWidth, halfWidthIncrement } = layout;
  const unique = uniqueCasingsByOd(drlgCasings);

  unique.forEach((actual, i) => {
    const hw = computeCasingHalfWidth(i, baseHalfWidth, halfWidthIncrement);
    const shoePx = scale(actual.wCsgBotDpth);
    const prevActual = unique[i + 1];
    const innerMidY = prevActual ? (scale(prevActual.wCsgBotDpth) + shoePx) / 2 : shoePx;
    const rEdge = centerX + hw;
    const lEnd = rEdge + 26;
    const labelX = lEnd + 8;
    const lg = rootG.append('g').attr('class', 'casing-label');

    lg.append('line').attr('class', 'casing-label__line')
      .attr('x1', rEdge).attr('x2', lEnd).attr('y1', shoePx).attr('y2', shoePx);
    lg.append('path').attr('class', 'casing-label__arrow')
      .attr('d', buildArrowHeadRight(lEnd, shoePx, 6));
    lg.append('text').attr('class', 'casing-label__primary')
      .attr('x', labelX).attr('y', shoePx + 4)
      .text(`${actual.wCsgOdSz}" Casing @ ${actual.wCsgBotDpth.toLocaleString()}`);

    rootG.append('text').attr('class', 'casing-size-inner')
      .attr('x', centerX).attr('y', innerMidY).attr('text-anchor', 'middle')
      .style('opacity', 0).text(`${actual.wCsgOdSz}"`)
      .transition().delay(labelsStart + (animation.lineStyle === 'draw' ? animation.lineDur : 0))
      .duration(animation.fadeDur).ease(easeCubicInOut).style('opacity', 1);

    animateLabel(lg, labelsStart, animation);
  });
}
