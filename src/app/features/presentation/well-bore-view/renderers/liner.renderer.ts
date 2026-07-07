import { easeCubicInOut } from 'd3-ease';
import 'd3-transition';

import { ANIM, DiagramLayout } from '@models/well-design/wellbore-diagram.model';
import { ICasingIR } from '@shared/models/wwell/casing-ir.model';
import { IDrlgCsg } from '@shared/models/wwell/drlg-csg.model';
import {
  buildArrowHeadRight,
  buildCasingPath,
  buildScreenHanger,
  openHoleHalfWidth,
} from '@shared/utils/wellbore-math.util';
import { animateLabel } from './animation.helpers';
import { DefsSel, DepthScale, GSel, ResolvedAnimation } from './wellbore-renderer.types';

export interface LinerEntry {
  readonly odSz: string;
  readonly topDepth: number;
  readonly botDepth: number;
  readonly halfWidth: number;
  readonly isScreen: boolean;
  readonly hasActual: boolean;
}

export interface RenderLinersOptions {
  readonly rootG: GSel;
  readonly defsEl: DefsSel;
  readonly layout: DiagramLayout;
  readonly liners: LinerEntry[];
  readonly centerX: number;
  readonly scale: DepthScale;
  readonly linersStart: number;
  readonly labelsStart: number;
  readonly animation: ResolvedAnimation;
  readonly lastCasingBotDepth: number;
}

export function resolveLiners(
  casings: ICasingIR[],
  drlgCasings: IDrlgCsg[],
  layout: DiagramLayout,
): LinerEntry[] {
  return casings.length > 0
    ? linersFromIR(casings, drlgCasings, layout)
    : linersFromDrlg(drlgCasings, layout);
}

const LINER_HW_DECREMENT = 14;
const LINER_WALL_COLOR = '#000000';
const SCREEN_BLANK_RATIO = 0.27;

function assignHalfWidths(baseHalfWidth: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) =>
    Math.max(22, baseHalfWidth - (i + 1) * LINER_HW_DECREMENT)
  );
}

/**
 * Extracts liner entries from drlgCasings when no ICasingIR data is available.
 * Deduplicates by wLnrOdSz, sorts shallowest-first (widest hw).
 * The deepest liner is marked isScreen=true only when multiple liners exist.
 */
export function linersFromDrlg(drlgCasings: IDrlgCsg[], layout: DiagramLayout): LinerEntry[] {
  const dedupMap = new Map<string, { odSz: string; topDepth: number; botDepth: number }>();
  for (const d of drlgCasings) {
    if (!d.wLnrOdSz || (d.wLnrBotDepth ?? 0) <= 0) continue;
    const existing = dedupMap.get(d.wLnrOdSz);
    if (!existing || d.wLnrBotDepth! > existing.botDepth) {
      dedupMap.set(d.wLnrOdSz, {
        odSz: d.wLnrOdSz,
        topDepth: d.wLnrTopDepth ?? d.wCsgBotDpth,
        botDepth: d.wLnrBotDepth!,
      });
    }
  }

  const sorted = [...dedupMap.values()].sort((a, b) => a.botDepth - b.botDepth);
  const widths = assignHalfWidths(layout.baseHalfWidth, sorted.length);

  return sorted.map((liner, i) => ({
    ...liner,
    halfWidth: widths[i],
    isScreen: sorted.length > 1 && i === sorted.length - 1,
    hasActual: true,
  }));
}

/**
 * Extracts liner entries from ICasingIR + drlgCasings for actual depth override.
 * Includes extra drlgCasings liners not represented in ICasingIR.
 * The deepest liner is marked isScreen=true only when multiple liners exist.
 */
export function linersFromIR(
  casings: ICasingIR[],
  drlgCasings: IDrlgCsg[],
  layout: DiagramLayout,
): LinerEntry[] {
  const irLiners = casings.filter(c => c.csgType === 'Liner');
  if (irLiners.length === 0) return [];

  const matchedOdSizes = new Set<string>();

  const irEntries = irLiners.map(csg => {
    const actual = drlgCasings.find(d => d.wLnrOdSz === csg.csgSize) ?? null;
    const hasActualBot = (actual?.wLnrBotDepth ?? 0) > 0;
    const hasActualTop = (actual?.wLnrTopDepth ?? 0) > 0;
    if (actual?.wLnrOdSz) matchedOdSizes.add(actual.wLnrOdSz);
    return {
      odSz: actual?.wLnrOdSz ?? csg.csgSize,
      topDepth: hasActualTop ? actual!.wLnrTopDepth! : (actual?.wCsgBotDpth ?? 0),
      botDepth: hasActualBot ? actual!.wLnrBotDepth! : csg.csgDepth,
      hasActual: hasActualBot,
    };
  });

  const extraEntries = drlgCasings
    .filter(d => d.wLnrOdSz != null && (d.wLnrBotDepth ?? 0) > 0 && !matchedOdSizes.has(d.wLnrOdSz!))
    .map(d => ({
      odSz: d.wLnrOdSz!,
      topDepth: d.wLnrTopDepth ?? d.wCsgBotDpth,
      botDepth: d.wLnrBotDepth!,
      hasActual: true,
    }));

  const allLiners = [...irEntries, ...extraEntries].sort((a, b) => a.botDepth - b.botDepth);
  const widths = assignHalfWidths(layout.baseHalfWidth, allLiners.length);

  return allLiners.map((liner, i) => ({
    ...liner,
    halfWidth: widths[i],
    isScreen: allLiners.length > 1 && i === allLiners.length - 1,
  }));
}

export function renderLiners(options: RenderLinersOptions): void {
  if (options.liners.length === 0) return;
  renderLinerShapes(options);
  renderLinerLabels(options);
}

function renderLinerShapes({
  rootG,
  defsEl,
  layout,
  liners,
  centerX,
  scale,
  linersStart,
  lastCasingBotDepth,
}: RenderLinersOptions): void {
  const { shoeCurveOffset } = layout;

  liners.forEach((liner, i) => {
    const topPx = scale(liner.topDepth);
    const botPx = scale(liner.botDepth);
    const clipId = `dyn-liner-clip-${i}`;
    const clipRadius = openHoleHalfWidth(liner.halfWidth) + 20;
    const delay = (liners.length - 1 - i) * ANIM.CASING_STAGGER;
    const thisLinerStart = linersStart + delay;
    const casingPath = buildCasingPath(centerX, liner.halfWidth, topPx, botPx, shoeCurveOffset);

    const fill = liner.hasActual ? 'url(#actualCasingGradient)' : 'url(#linerGradient)';
    const stroke = LINER_WALL_COLOR;
    const opacity = liner.hasActual ? 0.78 : 0.55;

    const hangerHW = liner.halfWidth;
    const hangerY = (i === 0 ? scale(lastCasingBotDepth) : scale(liners[i - 1].botDepth)) + 4;
    const { left: lh, right: rh } = buildScreenHanger(centerX, hangerY, hangerHW, 14, 26);
    rootG.append('path')
      .attr('class', 'liner-hanger')
      .attr('d', `${lh} ${rh}`)
      .attr('fill', '#000000')
      .attr('fill-opacity', '1')
      .attr('stroke', 'none')
      .style('opacity', 0)
      .transition()
      .delay(thisLinerStart)
      .duration(Math.round(ANIM.CASING_DURATION / 3))
      .ease(easeCubicInOut)
      .style('opacity', 1);

    const clipRect = defsEl.append('clipPath')
      .attr('class', 'dyn-clip')
      .attr('id', clipId)
      .append('rect')
      .attr('x', centerX - clipRadius - 15)
      .attr('y', topPx - 5)
      .attr('width', clipRadius * 2 + 30)
      .attr('height', 0);

    clipRect.transition()
      .delay(thisLinerStart)
      .duration(ANIM.CASING_DURATION)
      .ease(easeCubicInOut)
      .attr('height', botPx - topPx + shoeCurveOffset + 20);

    rootG.append('path')
      .attr('class', liner.isScreen ? 'liner liner--screen' : 'liner')
      .attr('d', casingPath)
      .attr('clip-path', `url(#${clipId})`)
      .attr('fill', fill)
      .attr('stroke', stroke)
      .attr('stroke-width', '5')
      .style('opacity', opacity);

    if (liner.isScreen) {
      const screenStartPx = topPx + (botPx - topPx) * SCREEN_BLANK_RATIO;
      rootG.append('rect')
        .attr('class', 'liner liner--screen-grid')
        .attr('x', centerX - liner.halfWidth + 3)
        .attr('y', screenStartPx)
        .attr('width', liner.halfWidth * 2 - 6)
        .attr('height', botPx - screenStartPx)
        .attr('clip-path', `url(#${clipId})`)
        .attr('fill', 'url(#gridPattern)')
        .attr('fill-opacity', 0.92)
        .attr('stroke', 'none');
    }
  });
}

function renderLinerLabels({
  rootG,
  liners,
  centerX,
  scale,
  labelsStart,
  animation,
}: RenderLinersOptions): void {
  const innerDelay = labelsStart + (animation.lineStyle === 'draw' ? animation.lineDur : 0);

  liners.forEach((liner) => {
    const topPx = scale(liner.topDepth);
    const botPx = scale(liner.botDepth);
    const midY = topPx + (botPx - topPx) * 0.5;
    const rEdge = centerX + liner.halfWidth;
    const lEnd = rEdge + 26;
    const labelX = lEnd + 8;
    const screenTag = liner.isScreen ? ' (Screen)' : '';
    const actualStar = liner.hasActual ? ' *' : '';

    const lg = rootG.append('g').attr('class', 'casing-label');
    lg.append('line').attr('class', 'casing-label__line')
      .attr('x1', rEdge).attr('x2', lEnd).attr('y1', midY).attr('y2', midY);
    lg.append('path').attr('class', 'casing-label__arrow')
      .attr('d', buildArrowHeadRight(lEnd, midY, 6));
    lg.append('text').attr('class', 'casing-label__primary')
      .attr('fill', liner.hasActual ? '#22c55e' : '')
      .attr('x', labelX).attr('y', midY + 4)
      .text(`${liner.odSz}" Liner @ ${liner.botDepth.toLocaleString()}${screenTag}${actualStar}`);

    animateLabel(lg, labelsStart, animation);

    rootG.append('text').attr('class', 'casing-size-inner')
      .attr('x', centerX).attr('y', midY)
      .attr('text-anchor', 'middle')
      .style('opacity', 0)
      .attr('fill', liner.hasActual ? '#0f2d1a' : '')
      .style('font-weight', liner.hasActual ? '800' : 'normal')
      .text(`${liner.odSz}"`)
      .transition().delay(innerDelay).duration(animation.fadeDur).ease(easeCubicInOut)
      .style('opacity', 1);

    if (liner.topDepth > 0) {
      const rEdge = centerX + liner.halfWidth;
      const tolEnd = rEdge + 56;
      const tolLg = rootG.append('g').attr('class', 'casing-label');
      tolLg.append('line').attr('class', 'casing-label__line')
        .attr('x1', rEdge).attr('x2', tolEnd).attr('y1', topPx).attr('y2', topPx);
      tolLg.append('path').attr('class', 'casing-label__arrow')
        .attr('d', buildArrowHeadRight(tolEnd, topPx, 6));
      tolLg.append('text').attr('class', 'casing-label__primary')
        .attr('text-anchor', 'start')
        .attr('x', tolEnd + 8).attr('y', topPx + 4)
        .text(`TOL @ ${liner.topDepth.toLocaleString()}`);
      animateLabel(tolLg, labelsStart, animation);
    }
  });
}
