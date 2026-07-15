import { easeCubicInOut } from 'd3-ease';
import 'd3-transition';

import { ANIM, DiagramLayout } from '@models/well-design/wellbore-diagram.model';
import { ICasingIR } from '@shared/models/wwell/casing-ir.model';
import { IDrlgCsg } from '@shared/models/wwell/drlg-csg.model';
import { IWellDesign } from '@shared/models/wwell/well-design.model';
import {
  buildArrowHeadLeft,
  buildArrowHeadRight,
  buildCasingPath,
  buildScreenHanger,
  openHoleHalfWidth,
  parseInchSize,
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
  wellDesign?: IWellDesign | null,
): LinerEntry[] {
  // Source priority: IR data drives the list; DRLG data overrides depths when present.
  return casings.length > 0
    ? linersFromIR(casings, drlgCasings, layout, wellDesign)
    : linersFromDrlg(drlgCasings, layout, wellDesign);
}

const LINER_HW_DECREMENT = 14;
const LINER_WALL_COLOR = '#000000';
const SCREEN_BLANK_RATIO = 0.27;

function assignHalfWidths(baseHalfWidth: number, count: number): number[] {
  return Array.from({ length: count }, (_, i) =>
    Math.max(22, baseHalfWidth - (i + 1) * LINER_HW_DECREMENT)
  );
}

const SCREEN_LINER_SIZE_IN = 7;

/**
 * Detects whether free-text remarks reference a given inch size anywhere in the string.
 *
 * lsRemarks is a free-form field (e.g. `+/- 500 ft of 7" screen`), so a naive
 * parseInchSize() would return the first number token (500) and miss the real size.
 * This scans every whole/fractional size token in the text and matches on value.
 */
function remarksReferenceSize(remarks: string | null | undefined, targetInches: number): boolean {
  if (!remarks) return false;
  const tokenRe = /(\d+(?:\.\d+)?)(?:\s+(\d+)\/(\d+))?/g;
  for (const m of remarks.matchAll(tokenRe)) {
    const whole = parseFloat(m[1]);
    const value = m[2] && m[3] ? whole + parseInt(m[2], 10) / parseInt(m[3], 10) : whole;
    if (value === targetInches) return true;
  }
  return false;
}

/**
 * Determines whether a liner qualifies as a 7" liner screen.
 *
 * All four conditions must pass:
 *   1. At least one data source (DRLG_CSG or EXAD_GWD_IR_CASING) reports a 7" OD.
 *   2. EXAD_GWD_WELL_DESIGN.lsFlg is 'Y' (case-insensitive).
 *   3. EXAD_GWD_WELL_DESIGN.lsRemarks references a 7" size somewhere in its free text.
 *   4. When both sources are available their sizes agree; a mismatch means the
 *      as-drilled and planned records refer to different liners, so do not draw a screen.
 */
function isLinerScreen(
  actualOdSz: string | null | undefined,   // DRLG_CSG.wLnrOdSz
  plannedOdSz: string | null | undefined,  // EXAD_GWD_IR_CASING.csgSize
  wellDesign: IWellDesign | null | undefined,
): boolean {
  const actualSize = parseInchSize(actualOdSz);
  const plannedSize = parseInchSize(plannedOdSz);

  // Condition 1: at least one source must report a 7" liner.
  if (actualSize !== SCREEN_LINER_SIZE_IN && plannedSize !== SCREEN_LINER_SIZE_IN) return false;

  // Condition 2: lsFlg must explicitly opt-in to a liner screen.
  if ((wellDesign?.lsFlg ?? '').trim().toUpperCase() !== 'Y') return false;

  // Condition 3: lsRemarks must confirm the 7" screen size (scanned across free text).
  if (!remarksReferenceSize(wellDesign?.lsRemarks, SCREEN_LINER_SIZE_IN)) return false;

  // Condition 4: when both sizes are known they must agree — divergence means
  // the records do not describe the same physical liner.
  if (actualSize !== null && plannedSize !== null && actualSize !== plannedSize) return false;

  return true;
}

/**
 * Extracts liner entries from drlgCasings when no ICasingIR data is available.
 * Deduplicates by wLnrOdSz, sorts shallowest-first (widest hw).
 * isScreen is determined by the 7" liner screen rule (see isLinerScreen).
 */
export function linersFromDrlg(
  drlgCasings: IDrlgCsg[],
  layout: DiagramLayout,
  wellDesign?: IWellDesign | null,
): LinerEntry[] {
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
    // DRLG-only path: no planned OD to compare, so pass undefined for plannedOdSz.
    isScreen: isLinerScreen(liner.odSz, undefined, wellDesign),
    hasActual: true,
  }));
}

/**
 * Extracts liner entries from ICasingIR + drlgCasings for actual depth override.
 *
 * Source priority per liner:
 *   - DRLG_CSG (actual/as-drilled) overrides depth when a matching wLnrOdSz exists.
 *   - EXAD_GWD_IR_CASING (planned) is the fallback for depth and the primary OD source.
 *
 * Extra DRLG_CSG liners with no corresponding IR entry are appended at the end.
 * isScreen is determined by the 7" liner screen rule (see isLinerScreen).
 */
export function linersFromIR(
  casings: ICasingIR[],
  drlgCasings: IDrlgCsg[],
  layout: DiagramLayout,
  wellDesign?: IWellDesign | null,
): LinerEntry[] {
  const irLiners = casings.filter(c => c.csgType === 'Liner');
  if (irLiners.length === 0) return [];

  // Fallback top depth when no drlgCasing match exists: shoe of the deepest non-liner casing
  const lastCasingShoe = casings
    .filter(c => c.csgType !== 'Liner')
    .reduce((max, c) => Math.max(max, c.csgDepth), 0);

  const matchedOdSizes = new Set<string>();

  const irEntries = irLiners.map(csg => {
    // Source priority: use DRLG_CSG depth when available; fall back to IR depth.
    const actual = drlgCasings.find(d => d.wLnrOdSz === csg.csgSize) ?? null;
    const hasActualBot = (actual?.wLnrBotDepth ?? 0) > 0;
    const hasActualTop = (actual?.wLnrTopDepth ?? 0) > 0;
    if (actual?.wLnrOdSz) matchedOdSizes.add(actual.wLnrOdSz);
    const fallbackTopDepth = actual != null ? actual.wCsgBotDpth : lastCasingShoe;
    return {
      odSz: actual?.wLnrOdSz ?? csg.csgSize,
      topDepth: hasActualTop ? actual!.wLnrTopDepth! : fallbackTopDepth,
      botDepth: hasActualBot ? actual!.wLnrBotDepth! : csg.csgDepth,
      hasActual: hasActualBot,
      // 7" rule: pass actual (DRLG) and planned (IR) OD sizes — both must agree when present.
      isScreen: isLinerScreen(actual?.wLnrOdSz, csg.csgSize, wellDesign),
    };
  });

  const extraEntries = drlgCasings
    .filter(d => d.wLnrOdSz != null && (d.wLnrBotDepth ?? 0) > 0 && !matchedOdSizes.has(d.wLnrOdSz!))
    .map(d => ({
      odSz: d.wLnrOdSz!,
      topDepth: d.wLnrTopDepth ?? d.wCsgBotDpth,
      botDepth: d.wLnrBotDepth!,
      hasActual: true,
      // DRLG-only: no IR size to compare against, so plannedOdSz is undefined.
      isScreen: isLinerScreen(d.wLnrOdSz, undefined, wellDesign),
    }));

  const allLiners = [...irEntries, ...extraEntries].sort((a, b) => a.botDepth - b.botDepth);
  const widths = assignHalfWidths(layout.baseHalfWidth, allLiners.length);

  return allLiners.map((liner, i) => ({
    ...liner,
    halfWidth: widths[i],
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

    // Planned/estimated liners share the casing look (mainGradient @ 0.40) so they
    // read as the same "planned" style as conductor/casing; actual liners keep the actual fill.
    const fill = liner.hasActual ? 'url(#actualLinerGradient)' : 'url(#linerGradient)';
    const capFill = liner.hasActual ? 'url(#linerCapDepthGradient)' : 'url(#plannedLinerCapDepthGradient)';
    const stroke = '#020617';
    const opacity = liner.hasActual ? 0.55 : 0.4;

    const hangerHW = liner.halfWidth;
    const hangerY = (i === 0 ? scale(lastCasingBotDepth) : scale(liners[i - 1].botDepth)) + 4;
    const { left: lh, right: rh } = buildScreenHanger(centerX, hangerY, hangerHW, 14, 26);
    rootG.append('path')
      .attr('class', 'liner-hanger')
      .attr('d', `${lh} ${rh}`)
      .attr('fill', '#000000')
      .attr('stroke', '#000000')
      .attr('stroke-width', '1')
      .attr('stroke-linejoin', 'round')
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
      .attr('stroke-width', '3')
      .style('opacity', opacity)
      .style('filter', 'url(#casingDropShadow)');

    rootG.append('ellipse')
      .attr('class', 'liner-top-ellipse')
      .attr('cx', centerX)
      .attr('cy', topPx)
      .attr('rx', liner.halfWidth)
      .attr('ry', 4)
      .attr('clip-path', `url(#${clipId})`)
      .attr('fill', capFill)
      .attr('stroke', stroke)
      .attr('stroke-width', '2')
      .style('opacity', opacity);

    // Darken the part of the liner that is inside the casing to simulate interior shadowing
    const exitPx = i === 0 ? scale(lastCasingBotDepth) : scale(liners[i - 1].botDepth);
    if (exitPx > topPx) {
      // Very light inner dimming, mostly relying on the glass overlay for shadows now
      rootG.append('rect')
        .attr('class', 'liner-interior-shadow')
        .attr('x', centerX - liner.halfWidth)
        .attr('y', topPx)
        .attr('width', liner.halfWidth * 2)
        .attr('height', exitPx - topPx)
        .attr('fill', '#0f172a')
        .style('opacity', 0.15)
        .attr('clip-path', `url(#${clipId})`);

      // True glass transparency overlay. Creates a soft translucent sheen
      // over the liner to mimic looking through the outer pipe's glass wall.
      rootG.append('rect')
        .attr('class', 'liner-glass-reflection')
        .attr('x', centerX - liner.halfWidth)
        .attr('y', topPx)
        .attr('width', liner.halfWidth * 2)
        .attr('height', exitPx - topPx)
        .attr('fill', 'url(#glassOverlayGradient)')
        .attr('clip-path', `url(#${clipId})`);

      // Shadow cast by the casing shoe onto the liner as it exits the hole
      rootG.append('ellipse')
        .attr('cx', centerX)
        .attr('cy', exitPx)
        .attr('rx', liner.halfWidth + 8)
        .attr('ry', 4)
        .attr('fill', 'none')
        .attr('stroke', '#020617')
        .attr('stroke-width', '5')
        .style('opacity', 0.6)
        .attr('clip-path', `url(#${clipId})`);
    }

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
      // TOL (top-of-liner) label on the LEFT side to avoid colliding with the
      // right-side OD/liner labels.
      const lEdge = centerX - liner.halfWidth;
      const tolEnd = lEdge - 56;
      const tolLg = rootG.append('g').attr('class', 'casing-label');
      tolLg.append('line').attr('class', 'casing-label__line')
        .attr('x1', lEdge).attr('x2', tolEnd).attr('y1', topPx).attr('y2', topPx);
      tolLg.append('path').attr('class', 'casing-label__arrow')
        .attr('d', buildArrowHeadLeft(tolEnd, topPx, 6));
      tolLg.append('text').attr('class', 'casing-label__primary')
        .attr('text-anchor', 'end')
        .attr('x', tolEnd - 8).attr('y', topPx + 4)
        .text(`TOL @ ${liner.topDepth.toLocaleString()}`);
      animateLabel(tolLg, labelsStart, animation);
    }
  });
}
