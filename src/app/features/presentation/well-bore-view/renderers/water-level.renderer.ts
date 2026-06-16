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

/** SIWHP (psi) → wellhead riser height above ground (ft), per field conversion factor. */
const SIWHP_TO_DEPTH_FACTOR = 2.37;

/** Distance (px, local coords) above ground level used to draw above-ground water positions. */
const ABOVE_GROUND_OFFSET = 24;

const WATER_ACCENT = '#0ea5e9';
const WATER_ACCENT_MUTED = 'rgba(14,165,233,0.16)';

function parseSiwhpPsi(text: string): number | null {
  const match = /SIWHP[:\s]*(-?\d+(?:\.\d+)?)/i.exec(text) ?? /(-?\d+(?:\.\d+)?)\s*psi/i.exec(text);
  return match ? Number(match[1]) : null;
}

function wrapLabel(value: string, maxLineLength: number, maxLines: number): string[] {
  const words = value.trim().split(/\s+/);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;

    if (next.length <= maxLineLength) {
      current = next;
      continue;
    }

    if (current) lines.push(current);
    current = word;

    if (lines.length === maxLines) break;
  }

  if (current && lines.length < maxLines) lines.push(current);

  const rendered = lines.join(' ');
  if (value.length > rendered.length && lines.length > 0) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/\.+$/, '')}...`;
  }

  return lines;
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

  const rawTxt = wd.swLvlTxt ?? '';
  const isFlowing = /flow/i.test(rawTxt);
  const siwhpPsi = isFlowing ? parseSiwhpPsi(rawTxt) : null;
  const waterDepth = isFlowing
    ? (siwhpPsi !== null ? -(siwhpPsi * SIWHP_TO_DEPTH_FACTOR) : 0)
    : (wd.staWaterLvl ?? 0);
  if (!isFlowing && !wd.staWaterLvl) return;

  const { baseHalfWidth, halfWidthIncrement } = layout;
  const isAboveGround = waterDepth < 0;
  // Above-ground positions draw a short distance above ground level rather than at the
  // (often off-screen) computed riser height.
  const wPx = isAboveGround ? -ABOVE_GROUND_OFFSET : scale(waterDepth);
  const widestCsg = data.casings[data.casings.length - 1];
  const tier = widestCsg ? getCasingTier(widestCsg, data.casings) : 0;
  const innerHW = computeCasingHalfWidth(tier, baseHalfWidth, halfWidthIncrement);
  const lR = centerX + innerHW + 10;
  const lL = centerX - innerHW - 10;
  const lineWidth = lR - lL;
  const label = isFlowing
    ? rawTxt
    : (/^static\s*wl/i.test(rawTxt) ? rawTxt : `Water Level: ${waterDepth.toLocaleString()}`);
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
      .attr('stroke', WATER_ACCENT)
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

  const labelY = wPx < 0 ? wPx - 6 : Math.max(wPx + 4, 16);
  wg.append('text')
    .attr('class', 'water-label')
    .attr('x', lL - 22).attr('y', labelY)
    .attr('text-anchor', 'end').text(label)
    .style('opacity', 0)
    .transition().delay(afterLine).duration(animation.fadeDur).ease(easeCubicInOut)
    .style('opacity', 1);

  // ── Hover tooltip (Geo Axis style): white card, accent rail, connector + anchor ──
  const tooltipLayer = rootG.append('g')
    .attr('class', 'water-level-tooltip')
    .style('opacity', 0)
    .style('pointer-events', 'none');

  const hideTooltip = (): void => {
    tooltipLayer.interrupt().transition().duration(120).style('opacity', 0);
  };

  const showTooltip = (): void => {
    const lines = wrapLabel(label, 30, 2);
    const tooltipW = 220;
    const lineHeight = 15;
    const tooltipH = 56 + lines.length * lineHeight;

    const minTooltipX = 4;
    const maxTooltipX = layout.wellboreViewWidth - tooltipW - 4;
    const tooltipX = Math.min(Math.max(lR + 26, minTooltipX), maxTooltipX);

    const viewportTop = -layout.marginTop + 4;
    const viewportBottom = layout.svgHeight - layout.marginTop - 4;
    const tooltipY = Math.max(viewportTop, Math.min(wPx - tooltipH / 2, viewportBottom - tooltipH));
    const connectorY = Math.max(tooltipY + 22, Math.min(wPx, tooltipY + tooltipH - 16));

    tooltipLayer.selectAll('*').remove();
    tooltipLayer.raise();

    tooltipLayer.append('path')
      .attr('d', `M${centerX},${wPx} H${tooltipX - 14} Q${tooltipX - 7},${wPx} ${tooltipX - 7},${connectorY} H${tooltipX}`)
      .attr('stroke', WATER_ACCENT)
      .attr('stroke-width', 1.6)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('opacity', 0.76)
      .attr('fill', 'none');

    tooltipLayer.append('circle')
      .attr('cx', centerX).attr('cy', wPx)
      .attr('r', 3.2)
      .attr('fill', '#ffffff')
      .attr('stroke', WATER_ACCENT)
      .attr('stroke-width', 1.6);

    tooltipLayer.append('rect')
      .attr('x', tooltipX).attr('y', tooltipY)
      .attr('width', tooltipW).attr('height', tooltipH)
      .attr('rx', 10)
      .attr('fill', '#ffffff')
      .attr('stroke', WATER_ACCENT)
      .attr('stroke-width', 1.4)
      .attr('filter', 'drop-shadow(0 8px 14px rgba(15,23,42,0.18))');

    tooltipLayer.append('rect')
      .attr('x', tooltipX).attr('y', tooltipY)
      .attr('width', 5).attr('height', tooltipH)
      .attr('rx', 2)
      .attr('fill', WATER_ACCENT);

    tooltipLayer.append('rect')
      .attr('x', tooltipX + 14).attr('y', tooltipY + 12)
      .attr('width', isFlowing ? 60 : 78).attr('height', 22)
      .attr('rx', 11)
      .attr('fill', WATER_ACCENT_MUTED);

    tooltipLayer.append('text')
      .attr('x', tooltipX + (isFlowing ? 44 : 53)).attr('y', tooltipY + 27)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10')
      .attr('font-family', 'DM Sans, sans-serif')
      .attr('font-weight', '900')
      .attr('fill', WATER_ACCENT)
      .text(isFlowing ? 'FLOWING' : 'Water Level');

    tooltipLayer.append('text')
      .attr('x', tooltipX + tooltipW - 16).attr('y', tooltipY + 27)
      .attr('text-anchor', 'end')
      .attr('font-size', '13')
      .attr('font-family', 'DM Sans, sans-serif')
      .attr('font-weight', '900')
      .attr('fill', '#0f172a')
      .text(waterDepth < 0 ? `${Math.abs(waterDepth).toFixed(2)} ft.agl` : `${waterDepth.toFixed(2)} ft.bgl`);

    tooltipLayer.append('line')
      .attr('x1', tooltipX + 14).attr('x2', tooltipX + tooltipW - 14)
      .attr('y1', tooltipY + 43).attr('y2', tooltipY + 43)
      .attr('stroke', '#e2e8f0');

    lines.forEach((line, idx) => {
      tooltipLayer.append('text')
        .attr('x', tooltipX + 16)
        .attr('y', tooltipY + 63 + idx * lineHeight)
        .attr('font-size', '12')
        .attr('font-family', 'DM Sans, sans-serif')
        .attr('font-weight', '600')
        .attr('fill', '#334155')
        .text(line);
    });

    tooltipLayer.interrupt().style('opacity', 0).transition().duration(120).style('opacity', 1);
  };

  wg.append('rect')
    .attr('class', 'water-line-hover')
    .attr('x', lL).attr('y', wPx - 6)
    .attr('width', lineWidth).attr('height', 12)
    .attr('fill', 'transparent')
    .style('cursor', 'pointer')
    .on('mouseenter', showTooltip)
    .on('mouseleave', hideTooltip);
}
