import { easeCubicInOut } from 'd3-ease';
import 'd3-transition';

import { ANIM, DiagramLayout } from '@models/well-design/wellbore-diagram.model';
import { ICasingIR } from '@shared/models/wwell/casing-ir.model';
import { IDrlgCsg } from '@shared/models/wwell/drlg-csg.model';
import {
  buildArrowHeadLeft,
  buildArrowHeadRight,
  buildCasingPath,
  buildGravelPackUPath,
  buildLinerPath,
  casingGradientId,
  computeCasingHalfWidth,
  openHoleHalfWidth,
} from '@shared/utils/wellbore-math.util';
import { animateLabel } from './animation.helpers';
import { getCasingTier, resolveCompletionTopDepth, resolveShoeDepth } from './wellbore-depth.helpers';
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
  readonly gravelStart: number;
  readonly labelsStart: number;
  readonly openHoleHalfWidthPx: number;
  readonly animation: ResolvedAnimation;
}

export function renderCasingElements(options: RenderCasingElementsOptions): void {
  renderCasings(options);
  renderCasingLabels(options);
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
  const shoeDepth = resolveShoeDepth(casings, drlgCasings);
  const completionTopPx = scale(resolveCompletionTopDepth(casings, drlgCasings));

  casings.forEach((csg, i) => {
    const tier = getCasingTier(csg, casings);
    const hw = computeCasingHalfWidth(tier, baseHalfWidth, halfWidthIncrement);
    const isLiner = csg.csgType === 'Liner';
    const isConductor = csg.csgType.toLowerCase() === 'conductor';
    const actualCsg = isLiner ? null : (drlgCasings.find(d => d.wCsgOdSz === csg.csgSize) ?? null);
    const actualLnr = isLiner ? (drlgCasings.find(d => d.wLnrOdSz === csg.csgSize) ?? null) : null;
    const hasActual = !isLiner && actualCsg !== null && actualCsg.wCsgBotDpth > 0;
    const hasActualLiner = isLiner && actualLnr !== null && (actualLnr.wLnrBotDepth ?? 0) > 0;
    const actualDepth = hasActual ? actualCsg!.wCsgBotDpth
      : hasActualLiner ? actualLnr!.wLnrBotDepth!
        : null;
    const displayDepth = actualDepth ?? csg.csgDepth;
    const bottomPx = scale(displayDepth);
    const linerTopPx = isLiner ? scale(shoeDepth) : 0;
    const topPx = isLiner ? linerTopPx : 0;
    const clipId = `dyn-casing-clip-${i}`;
    const animOrder = casings.length - 1 - i;
    const delay = animOrder * ANIM.CASING_STAGGER;
    const isGP = csg.csgType === 'Gravel Pack';
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
      .attr('y', isLiner ? topPx - 5 : isGP ? completionTopPx : -5)
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

    const plannedFillGrad = isConductor
      ? 'url(#mainGradient)'
      : `url(#${casingGradientId(csg.csgType)})`;
    const fillGrad = hasActual
      ? 'url(#actualCasingGradient)'
      : hasActualLiner
        ? 'url(#actualLinerGradient)'
        : plannedFillGrad;

    rootG.append('path')
      .attr('class', 'casing')
      .attr('d', isLiner
        ? buildLinerPath(centerX, hw, topPx, bottomPx)
        : buildCasingPath(centerX, hw, topPx, bottomPx, shoeCurveOffset))
      .attr('clip-path', `url(#${clipId})`)
      .attr('fill', fillGrad)
      .attr('stroke', '#1e293b')
      .attr('stroke-width', '5')
      .style('opacity', isConductor ? 0.92 : 0.65);

    clipRect.transition()
      .delay(casingsStart + delay)
      .duration(ANIM.CASING_DURATION)
      .ease(easeCubicInOut)
      .attr('height', isLiner
        ? (bottomPx - topPx + 20)
        : (bottomPx + shoeCurveOffset + 20));
  });
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
  const shoeDepth = drlgCasings[0]?.wCsgBotDpth ?? 0;

  drlgCasings.forEach((actual, i) => {
    const hw = computeCasingHalfWidth(i, baseHalfWidth, halfWidthIncrement);
    const animOrder = drlgCasings.length - 1 - i;
    const delay = animOrder * ANIM.CASING_STAGGER;

    if (actual.wCsgBotDpth > 0) {
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
        .attr('fill', 'url(#linerGradient)')
        .attr('stroke', '#1e293b').attr('stroke-width', '5')
        .style('opacity', 0.65);

      clipRect.transition()
        .delay(casingsStart + delay).duration(ANIM.CASING_DURATION).ease(easeCubicInOut)
        .attr('height', bottomPx + shoeCurveOffset + 20);
    }

    if (actual.wLnrBotDepth != null && actual.wLnrBotDepth > 0) {
      const linerTopPx = scale(shoeDepth);
      const linerBottomPx = scale(actual.wLnrBotDepth);
      const linerHW = computeCasingHalfWidth(0, baseHalfWidth, halfWidthIncrement);
      const clipId = `dyn-casing-clip-liner-actual-${i}`;
      const clipRadius = openHoleHalfWidth(linerHW) + 20;
      const clipRect = defsEl.append('clipPath')
        .attr('class', 'dyn-clip').attr('id', clipId).append('rect')
        .attr('x', centerX - clipRadius - 15).attr('y', linerTopPx - 5)
        .attr('width', clipRadius * 2 + 30).attr('height', 0);

      rootG.append('path')
        .attr('class', 'casing')
        .attr('d', buildLinerPath(centerX, linerHW, linerTopPx, linerBottomPx))
        .attr('clip-path', `url(#${clipId})`)
        .attr('fill', 'url(#linerGradient)')
        .attr('stroke', '#1e293b').attr('stroke-width', '5')
        .style('opacity', 0.65);

      clipRect.transition()
        .delay(casingsStart).duration(ANIM.CASING_DURATION).ease(easeCubicInOut)
        .attr('height', linerBottomPx - linerTopPx + 20);
    }
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

  casings.forEach((csg) => {
    const tier = getCasingTier(csg, casings);
    const hw = computeCasingHalfWidth(tier, baseHalfWidth, halfWidthIncrement);
    const isLiner = csg.csgType === 'Liner';
    const actualCsg = isLiner ? null : (drlgCasings.find(d => d.wCsgOdSz === csg.csgSize) ?? null);
    const actualLnr = isLiner ? (drlgCasings.find(d => d.wLnrOdSz === csg.csgSize) ?? null) : null;
    const hasActual = !isLiner && actualCsg !== null && actualCsg.wCsgBotDpth > 0;
    const hasActualLinerBot = isLiner && actualLnr !== null && (actualLnr.wLnrBotDepth ?? 0) > 0;
    const hasActualLiner = isLiner && actualLnr !== null
      && ((actualLnr.wLnrBotDepth ?? 0) > 0 || (actualLnr.wLnrTopDepth ?? 0) > 0);
    const actualDepth = hasActual ? actualCsg!.wCsgBotDpth
      : hasActualLinerBot ? actualLnr!.wLnrBotDepth!
        : null;
    const actualSize = hasActual ? actualCsg!.wCsgOdSz
      : hasActualLiner ? actualLnr!.wLnrOdSz!
        : null;
    const displayDepth = actualDepth ?? csg.csgDepth;
    const displaySize = actualSize ?? csg.csgSize;
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
      const hasAnyActual = hasActual || hasActualLiner;
      if (hasAnyActual) {
        primaryEl
          .attr('fill', '#22c55e')
          .text(`${displaySize}" ${csg.csgType} @ ${displayDepth.toLocaleString()} *`);
        lg.append('text')
          .attr('class', 'casing-label__secondary')
          .attr('x', labelX).attr('y', shoePx + 17)
          .text(`est: ${csg.csgSize}" @ ${csg.csgDepth.toLocaleString()} ft`);
      } else {
        primaryEl.text(`${csg.csgSize}" ${csg.csgType} @ ${csg.csgDepth.toLocaleString()}`);
        if (csg.csgRemarks) {
          lg.append('text')
            .attr('class', 'casing-label__secondary')
            .attr('x', labelX).attr('y', shoePx + 17)
            .text(`(${csg.csgRemarks})`);
        }
      }

      const innerDelay = labelsStart + (animation.lineStyle === 'draw' ? animation.lineDur : 0);
      rootG.append('text')
        .attr('class', 'casing-size-inner')
        .attr('x', centerX).attr('y', shoePx)
        .attr('text-anchor', 'middle')
        .style('opacity', 0)
        .attr('fill', hasActual ? '#0f2d1a' : '')
        .style('font-weight', hasActual ? '800' : 'normal')
        .text(`${displaySize}"`)
        .transition().delay(innerDelay).duration(animation.fadeDur).ease(easeCubicInOut)
        .style('opacity', 1);
    }

    animateLabel(lg, labelsStart, animation);

    if (isLiner && actualLnr !== null && (actualLnr.wLnrTopDepth ?? 0) > 0) {
      const tolPx = scale(actualLnr!.wLnrTopDepth!);
      const tolLEdge = centerX - hw;
      const tolLStart = tolLEdge - 26;
      const tolLabelX = tolLStart - 8;
      const tolLg = rootG.append('g').attr('class', 'casing-label');

      tolLg.append('line')
        .attr('class', 'casing-label__line')
        .attr('x1', tolLEdge).attr('x2', tolLStart)
        .attr('y1', tolPx).attr('y2', tolPx);
      tolLg.append('path')
        .attr('class', 'casing-label__arrow')
        .attr('d', buildArrowHeadLeft(tolLStart, tolPx, 6));
      tolLg.append('text')
        .attr('class', 'casing-label__primary')
        .attr('text-anchor', 'end')
        .attr('x', tolLabelX).attr('y', tolPx + 4)
        .text(`TOL @ ${actualLnr!.wLnrTopDepth!.toLocaleString()}`);

      animateLabel(tolLg, labelsStart, animation);
    }
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
  const shoeDepth = drlgCasings[0]?.wCsgBotDpth ?? 0;

  drlgCasings.forEach((actual, i) => {
    const hw = computeCasingHalfWidth(i, baseHalfWidth, halfWidthIncrement);

    if (actual.wCsgBotDpth > 0) {
      const shoePx = scale(actual.wCsgBotDpth);
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
        .attr('x', centerX).attr('y', shoePx).attr('text-anchor', 'middle')
        .style('opacity', 0).text(`${actual.wCsgOdSz}"`)
        .transition().delay(labelsStart + (animation.lineStyle === 'draw' ? animation.lineDur : 0))
        .duration(animation.fadeDur).ease(easeCubicInOut).style('opacity', 1);

      animateLabel(lg, labelsStart, animation);
    }

    if (actual.wLnrOdSz) {
      const hasLinerBot = actual.wLnrBotDepth != null && actual.wLnrBotDepth > 0;
      const hasLinerTop = (actual.wLnrTopDepth ?? 0) > 0;
      const linerHW = computeCasingHalfWidth(0, baseHalfWidth, halfWidthIncrement);
      const rEdge = centerX + linerHW;
      const lEnd = rEdge + 26;
      const labelX = lEnd + 8;

      if (hasLinerBot) {
        const linerTopPx = scale(shoeDepth);
        const shoePx = scale(actual.wLnrBotDepth!);
        const midY = linerTopPx + (shoePx - linerTopPx) * 0.5;
        const lg = rootG.append('g').attr('class', 'casing-label');

        lg.append('line').attr('class', 'casing-label__line')
          .attr('x1', rEdge).attr('x2', lEnd).attr('y1', midY).attr('y2', midY);
        lg.append('path').attr('class', 'casing-label__arrow')
          .attr('d', buildArrowHeadRight(lEnd, midY, 6));
        lg.append('text').attr('class', 'casing-label__primary')
          .attr('fill', '#22c55e')
          .attr('x', labelX).attr('y', midY + 4)
          .text(`${actual.wLnrOdSz}" Liner @ ${actual.wLnrBotDepth!.toLocaleString()} *`);

        animateLabel(lg, labelsStart, animation);
      }

      if (hasLinerTop) {
        const tolPx = scale(actual.wLnrTopDepth!);
        const tolLEdge = centerX - linerHW;
        const tolLStart = tolLEdge - 26;
        const tolLabelX = tolLStart - 8;
        const tolLg = rootG.append('g').attr('class', 'casing-label');

        tolLg.append('line').attr('class', 'casing-label__line')
          .attr('x1', tolLEdge).attr('x2', tolLStart).attr('y1', tolPx).attr('y2', tolPx);
        tolLg.append('path').attr('class', 'casing-label__arrow')
          .attr('d', buildArrowHeadLeft(tolLStart, tolPx, 6));
        tolLg.append('text').attr('class', 'casing-label__primary')
          .attr('text-anchor', 'end')
          .attr('x', tolLabelX).attr('y', tolPx + 4)
          .text(`TOL @ ${actual.wLnrTopDepth!.toLocaleString()}`);

        animateLabel(tolLg, labelsStart, animation);
      }
    }
  });
}
