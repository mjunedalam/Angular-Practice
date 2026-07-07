/**
 * Wellbore String Element Renderers
 *
 * SVG drawing primitives for each of the 7 well string element types:
 *   1. Conductor       – outermost casing, cemented to surface
 *   2. Casing          – nested structural strings below the conductor
 *   3. Liner           – hangs from a casing shoe (does not reach surface)
 *   4. Liner Screen    – liner whose lower section has slotted/screen completion
 *   5. Open Hole       – exposed formation below the deepest shoe
 *   6. Gravel Pack     – sand fill in the annulus between screen and open hole wall
 *   7. Pre-Perforated  – factory-slotted liner run as open-hole completion
 *
 * Callers are responsible for resolving all geometry (halfWidths, pixel depths)
 * from the data models before calling these primitives.
 */

import { easeCubicInOut } from 'd3-ease';
import 'd3-transition';
import { Selection } from 'd3-selection';

import { ANIM } from '@models/well-design/wellbore-diagram.model';
import {
  buildCasingPath,
  buildGravelPackUPath,
  buildOpenHolePath,
  buildPrePerfLiner,
  buildScreenHanger,
  openHoleHalfWidth,
} from '@shared/utils/wellbore-math.util';
import { DefsSel, DepthScale, GSel } from './wellbore-renderer.types';

// Top 27% of a liner is blank pipe (seal bore); lower 73% carries the screen slots.
const SCREEN_BLANK_RATIO = 0.27;

// ── Shared clip helper ─────────────────────────────────────────────────────

function appendRevealClip(
  defsEl: DefsSel,
  clipId: string,
  x: number,
  y: number,
  width: number,
): Selection<SVGRectElement, unknown, null, undefined> {
  return defsEl
    .append('clipPath')
    .attr('class', 'dyn-clip')
    .attr('id', clipId)
    .append('rect')
    .attr('x', x)
    .attr('y', y)
    .attr('width', width)
    .attr('height', 0);
}

// ── 1. Conductor ──────────────────────────────────────────────────────────
//
// The outermost and widest casing string, set from surface to a shallow depth
// (typically 100–200 ft) to protect against shallow water zones and provide
// structural support for the wellhead. Visually it is the largest tube on the diagram.
//
// Fill:    actualCasingGradient when drilled, mainGradient when planned-only.
// Opacity: 0.78 (actual) | 0.75 (planned) — lighter than inner casings so they read
//          through it.

export interface DrawConductorOptions {
  readonly rootG: GSel;
  readonly defsEl: DefsSel;
  readonly centerX: number;
  readonly halfWidth: number;
  readonly shoePx: number;
  readonly shoeCurveOffset: number;
  readonly clipId: string;
  readonly animStart: number;
  readonly hasActual: boolean;
}

export function drawConductor({
  rootG, defsEl, centerX, halfWidth, shoePx, shoeCurveOffset, clipId, animStart, hasActual,
}: DrawConductorOptions): void {
  const clipRadius = openHoleHalfWidth(halfWidth) + 20;
  const clipRect = appendRevealClip(defsEl, clipId, centerX - clipRadius - 15, -5, clipRadius * 2 + 30);

  rootG.append('path')
    .attr('class', 'casing casing--conductor')
    .attr('d', buildCasingPath(centerX, halfWidth, 0, shoePx, shoeCurveOffset))
    .attr('clip-path', `url(#${clipId})`)
    .attr('fill', hasActual ? 'url(#actualCasingGradient)' : 'url(#mainGradient)')
    .attr('stroke', '#000000')
    .attr('stroke-width', '5')
    .style('opacity', hasActual ? 0.78 : 0.75);

  clipRect.transition()
    .delay(animStart)
    .duration(ANIM.CASING_DURATION)
    .ease(easeCubicInOut)
    .attr('height', shoePx + shoeCurveOffset + 20);
}

// ── 2. Casing ─────────────────────────────────────────────────────────────
//
// Standard structural casing string, nested inside the conductor (and any outer
// casings). Each concentric string is narrower by `halfWidthIncrement` px.
//
// Planned casings are drawn at reduced opacity (0.40) so the nesting hierarchy is
// clear. Once a casing has an actual (drilled) record it becomes fully opaque (0.78)
// and uses the actualCasingGradient to signal it has been set.

export interface DrawCasingOptions {
  readonly rootG: GSel;
  readonly defsEl: DefsSel;
  readonly centerX: number;
  readonly halfWidth: number;
  readonly shoePx: number;
  readonly shoeCurveOffset: number;
  readonly clipId: string;
  readonly animStart: number;
  readonly hasActual: boolean;
}

export function drawCasing({
  rootG, defsEl, centerX, halfWidth, shoePx, shoeCurveOffset, clipId, animStart, hasActual,
}: DrawCasingOptions): void {
  const clipRadius = openHoleHalfWidth(halfWidth) + 20;
  const clipRect = appendRevealClip(defsEl, clipId, centerX - clipRadius - 15, -5, clipRadius * 2 + 30);

  rootG.append('path')
    .attr('class', 'casing')
    .attr('d', buildCasingPath(centerX, halfWidth, 0, shoePx, shoeCurveOffset))
    .attr('clip-path', `url(#${clipId})`)
    .attr('fill', hasActual ? 'url(#actualCasingGradient)' : 'url(#mainGradient)')
    .attr('stroke', '#000000')
    .attr('stroke-width', '5')
    .style('opacity', hasActual ? 0.78 : 0.40);

  clipRect.transition()
    .delay(animStart)
    .duration(ANIM.CASING_DURATION)
    .ease(easeCubicInOut)
    .attr('height', shoePx + shoeCurveOffset + 20);
}

// ── 3. Liner ──────────────────────────────────────────────────────────────
//
// A casing string that does not extend back to surface; it "hangs" from the shoe
// of the innermost casing above it via a liner hanger assembly.
//
// halfWidth is the parent casing halfWidth minus LINER_HW_DECREMENT (14 px) so
// the liner sits visually inside the casing string it hangs from.
//
// A pair of hanger bracket triangles (buildScreenHanger) is drawn at hangerYPx
// (parent shoe depth + 4 px) and fades in before the liner body animates down.

export interface DrawLinerOptions {
  readonly rootG: GSel;
  readonly defsEl: DefsSel;
  readonly centerX: number;
  readonly halfWidth: number;
  readonly topPx: number;
  readonly botPx: number;
  readonly shoeCurveOffset: number;
  readonly hangerYPx: number;
  readonly clipId: string;
  readonly animStart: number;
  readonly hasActual: boolean;
}

export function drawLiner(opts: DrawLinerOptions): void {
  drawLinerBody(opts, 'liner', false);
}

// ── 4. Liner Screen ───────────────────────────────────────────────────────
//
// A liner where the lower 73% of its length carries a slotted/pre-cut screen
// section (completion interval). The upper 27% (SCREEN_BLANK_RATIO) is solid
// blank pipe — the seal-bore section that packs off above the reservoir.
//
// The screen section is overlaid with a translucent `gridPattern` rect to
// distinguish it visually from plain liner pipe.

export interface DrawLinerScreenOptions {
  readonly rootG: GSel;
  readonly defsEl: DefsSel;
  readonly centerX: number;
  readonly halfWidth: number;
  readonly topPx: number;
  readonly botPx: number;
  readonly shoeCurveOffset: number;
  readonly hangerYPx: number;
  readonly clipId: string;
  readonly animStart: number;
  readonly hasActual: boolean;
}

export function drawLinerScreen(opts: DrawLinerScreenOptions): void {
  const clipRect = drawLinerBody(opts, 'liner liner--screen', true);

  // Grid overlay — applied only to the slotted (lower) portion of the liner.
  const screenStartPx = opts.topPx + (opts.botPx - opts.topPx) * SCREEN_BLANK_RATIO;
  opts.rootG.append('rect')
    .attr('class', 'liner liner--screen-grid')
    .attr('x', opts.centerX - opts.halfWidth + 3)
    .attr('y', screenStartPx)
    .attr('width', opts.halfWidth * 2 - 6)
    .attr('height', opts.botPx - screenStartPx)
    .attr('clip-path', `url(#${opts.clipId})`)
    .attr('fill', 'url(#gridPattern)')
    .attr('fill-opacity', 0.92)
    .attr('stroke', 'none');

  // Reveal the grid with the same clip as the liner body.
  clipRect.transition()
    .delay(opts.animStart)
    .duration(ANIM.CASING_DURATION)
    .ease(easeCubicInOut)
    .attr('height', opts.botPx - opts.topPx + opts.shoeCurveOffset + 20);
}

// ── 5. Open Hole ──────────────────────────────────────────────────────────
//
// The unsupported, exposed borehole below the last casing/liner shoe.
// Its width is proportional to the drill bit size (ohRemarks) relative to the
// innermost casing OD so the physical size difference is visually preserved.
//
// Rendered as a simple rectangular path with the CSS class `open-hole`, which
// receives a cross-hatch or earth-fill pattern from the stylesheet.

export interface DrawOpenHoleOptions {
  readonly rootG: GSel;
  readonly defsEl: DefsSel;
  readonly centerX: number;
  readonly halfWidth: number;
  readonly topPx: number;
  readonly bottomPx: number;
  readonly clipId: string;
  readonly animStart: number;
}

export function drawOpenHole({
  rootG, defsEl, centerX, halfWidth, topPx, bottomPx, clipId, animStart,
}: DrawOpenHoleOptions): void {
  const clipRect = appendRevealClip(
    defsEl, clipId,
    centerX - halfWidth - 15, topPx - 5,
    halfWidth * 2 + 30,
  );

  rootG.append('path')
    .attr('class', 'open-hole')
    .attr('d', buildOpenHolePath(centerX, halfWidth, topPx, bottomPx))
    .attr('clip-path', `url(#${clipId})`);

  clipRect.transition()
    .delay(animStart)
    .duration(ANIM.OH_DURATION)
    .ease(easeCubicInOut)
    .attr('height', bottomPx - topPx + 5);
}

// ── 6. Gravel Pack ────────────────────────────────────────────────────────
//
// Gravel (or frac sand) pumped into the annulus between the liner screen and
// the open hole wall to prevent formation sand from invading the wellbore.
//
// Rendered as a thick "stroke" using `gravelpattern` along a U-path that traces
// the annular space from the completion top down to the gravel bottom depth.
//
// Geometry (all in px, resolved by caller):
//   lsHW          = liner screen half-width  (inner edge of gravel column)
//   gpMaxOuter    = ohHW − gpScreenGap       (outer edge, inset from OH wall)
//   annulusWidth  = (gpMaxOuter − lsHW) × gpFillRatio
//   annulusCenter = lsHW + annulusWidth / 2  (stroke centerline for U-path)
//   gpOuterEdge   = lsHW + annulusWidth      (used to size the clip rect)

export interface DrawGravelPackOptions {
  readonly rootG: GSel;
  readonly defsEl: DefsSel;
  readonly centerX: number;
  readonly annulusCenter: number;
  readonly annulusWidth: number;
  readonly gpOuterEdge: number;
  readonly topPx: number;
  readonly bottomPx: number;
  readonly clipId: string;
  readonly animStart: number;
}

export function drawGravelPack({
  rootG, defsEl, centerX, annulusCenter, annulusWidth, gpOuterEdge, topPx, bottomPx, clipId, animStart,
}: DrawGravelPackOptions): void {
  const clipRect = appendRevealClip(
    defsEl, clipId,
    centerX - gpOuterEdge, topPx,
    gpOuterEdge * 2,
  );

  rootG.append('path')
    .attr('class', 'gravelHole')
    .attr('d', buildGravelPackUPath(centerX, annulusCenter, topPx, bottomPx))
    .attr('stroke', 'url(#gravelpattern)')
    .attr('stroke-width', String(annulusWidth))
    .style('fill', 'none')
    .attr('clip-path', `url(#${clipId})`);

  clipRect.transition()
    .delay(animStart)
    .duration(ANIM.GRAVEL_DURATION)
    .ease(easeCubicInOut)
    .attr('height', bottomPx - topPx);
}

// ── 7. Pre-Perforated Liner ───────────────────────────────────────────────
//
// A liner that was factory-perforated (drilled or shot) before being run into
// the open hole as the primary reservoir completion.
//
// Engineering symbol: dashed vertical walls + short outward tick marks at regular
// intervals (representing the perforation shots), closed by a horizontal shoe line.
// `buildPrePerfLiner` returns the three SVG path strings: walls, ticks, shoe.
//
// Geometry:
//   halfWidth      = ohHW − perforationGap
//   perforationGap = clamp(openHoleHwMargin × 0.65, 12, 20)   [inset from OH wall]

export interface DrawPrePerforatedOptions {
  readonly rootG: GSel;
  readonly defsEl: DefsSel;
  readonly centerX: number;
  readonly halfWidth: number;
  readonly topPx: number;
  readonly bottomPx: number;
  readonly clipId: string;
  readonly animStart: number;
}

export function drawPrePerforatedLiner({
  rootG, defsEl, centerX, halfWidth, topPx, bottomPx, clipId, animStart,
}: DrawPrePerforatedOptions): void {
  const clipRect = appendRevealClip(
    defsEl, clipId,
    centerX - halfWidth - 6, topPx - 5,
    (halfWidth + 6) * 2,
  );

  const { walls, ticks, shoe } = buildPrePerfLiner(centerX, halfWidth, topPx, bottomPx);
  const g = rootG.append('g')
    .attr('class', 'perf-wall-group')
    .attr('clip-path', `url(#${clipId})`);

  g.append('path').attr('class', 'perf-wall').attr('d', walls);
  g.append('path').attr('class', 'perf-wall perf-wall--ticks').attr('d', ticks);
  g.append('path').attr('class', 'perf-wall').attr('d', shoe);

  clipRect.transition()
    .delay(animStart)
    .duration(ANIM.OH_DURATION)
    .ease(easeCubicInOut)
    .attr('height', bottomPx - topPx + 10);
}

// ── Internal: shared liner body ───────────────────────────────────────────
//
// Both drawLiner and drawLinerScreen share the same hanger + clip + casing path logic.
// Returns the clipRect selection so the caller can optionally chain an extra transition
// (e.g., for the screen grid overlay in drawLinerScreen).

type LinerBodyOpts = DrawLinerOptions | DrawLinerScreenOptions;

function drawLinerBody(
  { rootG, defsEl, centerX, halfWidth, topPx, botPx, shoeCurveOffset, hangerYPx, clipId, animStart, hasActual }: LinerBodyOpts,
  cssClass: string,
  deferClipTransition: boolean,
): Selection<SVGRectElement, unknown, null, undefined> {
  const { left: lh, right: rh } = buildScreenHanger(centerX, hangerYPx, halfWidth, 14, 26);
  rootG.append('path')
    .attr('class', 'liner-hanger')
    .attr('d', `${lh} ${rh}`)
    .attr('fill', '#000000')
    .attr('fill-opacity', '1')
    .attr('stroke', 'none')
    .style('opacity', 0)
    .transition()
    .delay(animStart)
    .duration(Math.round(ANIM.CASING_DURATION / 3))
    .ease(easeCubicInOut)
    .style('opacity', 1);

  const clipRadius = openHoleHalfWidth(halfWidth) + 20;
  const clipRect = appendRevealClip(
    defsEl, clipId,
    centerX - clipRadius - 15, topPx - 5,
    clipRadius * 2 + 30,
  );

  rootG.append('path')
    .attr('class', cssClass)
    .attr('d', buildCasingPath(centerX, halfWidth, topPx, botPx, shoeCurveOffset))
    .attr('clip-path', `url(#${clipId})`)
    .attr('fill', hasActual ? 'url(#actualCasingGradient)' : 'url(#linerGradient)')
    .attr('stroke', '#000000')
    .attr('stroke-width', '5')
    .style('opacity', hasActual ? 0.78 : 0.55);

  if (!deferClipTransition) {
    clipRect.transition()
      .delay(animStart)
      .duration(ANIM.CASING_DURATION)
      .ease(easeCubicInOut)
      .attr('height', botPx - topPx + shoeCurveOffset + 20);
  }

  return clipRect;
}

// ── Re-export DepthScale so callers can type their scale without importing
// from the types file separately ──────────────────────────────────────────
export type { DepthScale };
