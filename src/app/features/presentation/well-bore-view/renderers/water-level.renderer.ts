import { easeCubicInOut, easeLinear } from 'd3-ease';
import { pointer } from 'd3-selection';
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
    tooltipLayer.interrupt()
      .transition().duration(130).ease(easeCubicInOut)
      .style('opacity', 0);
  };

  const showTooltip = (event: MouseEvent): void => {
    const [mx] = pointer(event, rootG.node() as Element);
    const hoverX = Math.min(Math.max(mx, lL), lR);

    const lines = wrapLabel(label, 28, 2);
    const formulaLines: string[] = isFlowing && siwhpPsi !== null
      ? [
          'Depth = −(SIWHP × 2.37)',
          `= −(${siwhpPsi} × 2.37) = ${waterDepth.toFixed(2).replace('-', '−')} ft`,
        ]
      : lines;

    const tooltipW = 265;
    const lineHeight = 18;
    const tooltipH = 56 + formulaLines.length * lineHeight;

    const minTX = 4;
    const maxTX = layout.wellboreViewWidth - tooltipW - 4;
    const tooltipX = Math.min(Math.max(hoverX + 16, minTX), maxTX);

    const viewportTop = -layout.marginTop + 4;
    const viewportBottom = layout.svgHeight - layout.marginTop - 4;
    const preferredY = wPx - tooltipH - 40;
    const tooltipY = preferredY >= viewportTop
      ? preferredY
      : Math.min(wPx + 18, viewportBottom - tooltipH);
    const isAbove = tooltipY < wPx;

    tooltipLayer.selectAll('*').remove();
    tooltipLayer.raise();

    // Dashed connector from tooltip edge to water line anchor
    tooltipLayer.append('line')
      .attr('x1', hoverX).attr('y1', isAbove ? tooltipY + tooltipH + 2 : tooltipY - 2)
      .attr('x2', hoverX).attr('y2', isAbove ? wPx - 5 : wPx + 5)
      .attr('stroke', WATER_ACCENT)
      .attr('stroke-width', 1.4)
      .attr('stroke-dasharray', '4,3')
      .attr('stroke-linecap', 'round')
      .attr('opacity', 0.55);

    // Anchor dot on the water line
    tooltipLayer.append('circle')
      .attr('cx', hoverX).attr('cy', wPx)
      .attr('r', 3.2)
      .attr('fill', '#ffffff')
      .attr('stroke', WATER_ACCENT)
      .attr('stroke-width', 1.6);

    // Card
    tooltipLayer.append('rect')
      .attr('x', tooltipX).attr('y', tooltipY)
      .attr('width', tooltipW).attr('height', tooltipH)
      .attr('rx', 5)
      .attr('fill', '#ffffff')
      .attr('stroke', WATER_ACCENT)
      .attr('stroke-width', 1.4)
      .attr('filter', 'drop-shadow(0 8px 14px rgba(15,23,42,0.18))');

    // Accent rail
    tooltipLayer.append('rect')
      .attr('x', tooltipX).attr('y', tooltipY)
      .attr('width', 5).attr('height', tooltipH)
      .attr('rx', 2)
      .attr('fill', WATER_ACCENT);

    // Badge background
    tooltipLayer.append('rect')
      .attr('x', tooltipX + 14).attr('y', tooltipY + 12)
      .attr('width', isFlowing ? 80 : 64).attr('height', 22)
      .attr('rx', 11)
      .attr('fill', WATER_ACCENT_MUTED);

    // Badge label
    tooltipLayer.append('text')
      .attr('x', tooltipX + (isFlowing ? 54 : 46)).attr('y', tooltipY + 27)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10')
      .attr('font-family', 'DM Sans, sans-serif')
      .attr('font-weight', '900')
      .attr('fill', WATER_ACCENT)
      .text(isFlowing ? 'SIWHP(PSI)' : 'Water Level');

    // Value (positive psi for flowing, depth for static)
    tooltipLayer.append('text')
      .attr('x', tooltipX + tooltipW - 16).attr('y', tooltipY + 27)
      .attr('text-anchor', 'end')
      .attr('font-size', '12')
      .attr('font-family', 'DM Sans, sans-serif')
      .attr('font-weight', '900')
      .attr('fill', '#0f172a')
      .text(isFlowing && siwhpPsi !== null
        ? `${siwhpPsi.toFixed(2)} psi`
        : waterDepth < 0 ? `${Math.abs(waterDepth).toFixed(2)} ft.bgl` : `${waterDepth.toFixed(2)} ft.bgl`);

    // Divider
    tooltipLayer.append('line')
      .attr('x1', tooltipX + 14).attr('x2', tooltipX + tooltipW - 14)
      .attr('y1', tooltipY + 43).attr('y2', tooltipY + 43)
      .attr('stroke', '#e2e8f0');

    // Formula / label lines — template row + calculation row, both on one line each
    formulaLines.forEach((line, idx) => {
      const isCalc = isFlowing && idx === 1;

      tooltipLayer.append('text')
        .attr('x', tooltipX + 16)
        .attr('y', tooltipY + 60 + idx * lineHeight)
        .attr('font-size',   isCalc ? '11' : '10')
        .attr('font-family', isFlowing
          ? "'Courier New', 'Lucida Console', monospace"
          : 'DM Sans, sans-serif')
        .attr('font-weight', '700')
        .attr('font-style',  !isCalc && isFlowing ? 'italic' : 'normal')
        .attr('fill',        isCalc ? WATER_ACCENT : '#0f172a')
        .attr('letter-spacing', isFlowing ? '0.3' : '0')
        .text(line);
    });

    // Slide-in from below (above tooltip) or from above (below tooltip) + fade
    const slideOffset = isAbove ? 6 : -6;
    tooltipLayer
      .interrupt()
      .attr('transform', `translate(0, ${slideOffset})`)
      .style('opacity', 0)
      .transition().duration(200).ease(easeCubicInOut)
      .attr('transform', 'translate(0, 0)')
      .style('opacity', 1);
  };

  wg.append('rect')
    .attr('class', 'water-line-hover')
    .attr('x', lL).attr('y', wPx - 6)
    .attr('width', lineWidth).attr('height', 12)
    .attr('fill', 'transparent')
    .style('cursor', 'pointer')
    .on('mouseenter', (event: MouseEvent) => showTooltip(event))
    .on('mouseleave', hideTooltip);
}
