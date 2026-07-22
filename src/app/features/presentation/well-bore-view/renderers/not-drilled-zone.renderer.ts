import { pointer } from 'd3-selection';
import 'd3-transition';

import { ANIM, DiagramLayout, WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { DepthScale, GSel } from './wellbore-renderer.types';

const ND_TOOLTIP_W = 240;
const ND_TOOLTIP_GAP = 18;
const ND_TOOLTIP_FONT = 'DM Sans, sans-serif';
const ND_ACCENT = '#ef4444';
const ND_ACCENT_MUTED = 'rgba(239,68,68,0.14)';
const ROW_H = 28;

export interface RenderNotDrilledZoneOptions {
  readonly rootG: GSel;
  readonly data: WellboreDiagramData;
  readonly centerX: number;
  readonly scale: DepthScale;
  readonly start: number;
  readonly openHoleHalfWidth: number;
  readonly layout: DiagramLayout;
}

export function renderNotDrilledZone({
  rootG,
  data,
  centerX,
  scale,
  start,
  openHoleHalfWidth,
  layout,
}: RenderNotDrilledZoneOptions): void {
  const estTargetDepth = data.totalDepth;
  const currentDepth = data.currentDepth;
  const undrilledFt = estTargetDepth - currentDepth;

  if (currentDepth <= 0 || undrilledFt <= 1) return;

  const topPx = scale(currentDepth);
  const bottomPx = scale(estTargetDepth);
  const height = bottomPx - topPx;
  const width = openHoleHalfWidth * 2 + 160;
  const lx = centerX - openHoleHalfWidth - 80;
  const rx = lx + width;

  const ndg = rootG.append('g')
    .attr('class', 'not-drilled-zone')
    .style('opacity', 0);

  const zoneRect = ndg.append('rect')
    .attr('x', lx)
    .attr('y', topPx)
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'rgba(239, 68, 68, 0.12)')
    .attr('stroke', 'rgba(239, 68, 68, 0.3)')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '8,4')
    .style('cursor', 'help')
    .style('pointer-events', 'all');

  ndg.transition()
    .delay(start)
    .duration(ANIM.OVERLAY_FADE)
    .style('opacity', 1);

  // ── Hover tooltip — follows the cursor and flips left/right off the zone
  // edge nearest the pointer, matching the casing/liner and mud-circulation
  // tooltip cards elsewhere in this diagram. ──────────────────────────────
  const badge = `${undrilledFt.toLocaleString()} FT`;
  const badgeW = badge.length * 8.5 + 16;
  const rows: { label: string; value: string; hilite?: boolean }[] = [
    { label: 'Current Depth', value: `${currentDepth.toLocaleString()} ft` },
    { label: 'Target Depth', value: `${estTargetDepth.toLocaleString()} ft`, hilite: true },
  ];
  const ttipH = 60 + rows.length * ROW_H + 16;

  const ttipG = rootG.append('g')
    .attr('class', 'not-drilled-tooltip')
    .style('opacity', 0)
    .style('pointer-events', 'none');

  let isVisible = false;
  let lastSide: 'left' | 'right' | null = null;
  const node = rootG.node() as Element;

  const showTooltip = (mouseX: number, mouseY: number): void => {
    const onRight = mouseX > centerX;
    const side: 'left' | 'right' = onRight ? 'right' : 'left';
    const edgeX = onRight ? rx : lx;

    const rawTtipX = onRight ? edgeX + ND_TOOLTIP_GAP : edgeX - ND_TOOLTIP_GAP - ND_TOOLTIP_W;
    const ttipX = Math.max(8, Math.min(rawTtipX, layout.wellboreViewWidth - ND_TOOLTIP_W - 8));
    const ttipY = Math.max(4, Math.min(mouseY - ttipH / 2, layout.drawingHeight - ttipH - 4));
    const connY = Math.min(Math.max(mouseY, ttipY + 18), ttipY + ttipH - 18);
    const connTipX = onRight ? ttipX : ttipX + ND_TOOLTIP_W;
    const connMidX = onRight ? ttipX - 8 : ttipX + ND_TOOLTIP_W + 8;

    ttipG.selectAll('*').remove();
    ttipG.raise();

    // Connector elbow + anchor dot
    ttipG.append('path')
      .attr('d', `M${edgeX},${mouseY} H${connMidX} Q${connTipX},${mouseY} ${connTipX},${connY} H${connTipX}`)
      .attr('fill', 'none').attr('stroke', ND_ACCENT)
      .attr('stroke-width', 1.4).attr('stroke-dasharray', '4,3')
      .attr('stroke-linecap', 'round').attr('opacity', 0.65);
    ttipG.append('circle')
      .attr('cx', edgeX).attr('cy', mouseY)
      .attr('r', 3.2).attr('fill', '#fff')
      .attr('stroke', ND_ACCENT).attr('stroke-width', 1.6);

    // Card
    ttipG.append('rect')
      .attr('x', ttipX).attr('y', ttipY)
      .attr('width', ND_TOOLTIP_W).attr('height', ttipH)
      .attr('rx', 8).attr('fill', '#ffffff')
      .attr('stroke', '#e2e8f0').attr('stroke-width', 1.2)
      .attr('filter', 'drop-shadow(0 8px 16px rgba(15,23,42,0.18))');

    // Accent rail on the connector side
    const railX = onRight ? ttipX : ttipX + ND_TOOLTIP_W - 5;
    ttipG.append('rect')
      .attr('x', railX).attr('y', ttipY)
      .attr('width', 5).attr('height', ttipH)
      .attr('rx', 2).attr('fill', ND_ACCENT);

    // Badge
    ttipG.append('rect')
      .attr('x', ttipX + 12).attr('y', ttipY + 11)
      .attr('width', badgeW).attr('height', 22)
      .attr('rx', 11).attr('fill', ND_ACCENT_MUTED);
    ttipG.append('text')
      .attr('x', ttipX + 12 + badgeW / 2).attr('y', ttipY + 27)
      .attr('text-anchor', 'middle')
      .attr('font-size', '14').attr('font-family', ND_TOOLTIP_FONT)
      .attr('font-weight', '900').attr('letter-spacing', '0.5')
      .attr('fill', ND_ACCENT).text(badge);

    // Title
    ttipG.append('text')
      .attr('x', ttipX + ND_TOOLTIP_W - 12).attr('y', ttipY + 27)
      .attr('text-anchor', 'end')
      .attr('font-size', '17').attr('font-family', ND_TOOLTIP_FONT)
      .attr('font-weight', '800').attr('fill', '#0f172a').text('Not Drilled');

    // Divider
    ttipG.append('line')
      .attr('x1', ttipX + 12).attr('x2', ttipX + ND_TOOLTIP_W - 12)
      .attr('y1', ttipY + 44).attr('y2', ttipY + 44)
      .attr('stroke', '#e2e8f0').attr('stroke-width', 1);

    // Rows
    rows.forEach((row, i) => {
      const rowY = ttipY + 64 + i * ROW_H;
      ttipG.append('text')
        .attr('x', ttipX + 14).attr('y', rowY)
        .attr('font-size', '15').attr('font-family', ND_TOOLTIP_FONT)
        .attr('font-weight', '700').attr('fill', '#64748b').text(row.label);
      ttipG.append('text')
        .attr('x', ttipX + ND_TOOLTIP_W - 14).attr('y', rowY)
        .attr('text-anchor', 'end')
        .attr('font-size', '17').attr('font-family', ND_TOOLTIP_FONT)
        .attr('font-weight', '800')
        .attr('fill', row.hilite ? ND_ACCENT : '#0f172a').text(row.value);
    });

    // Fade in only on first show or when the side flips; instant reposition otherwise
    const sideChanged = side !== lastSide;
    lastSide = side;
    if (!isVisible || sideChanged) {
      ttipG.interrupt().style('opacity', 0).transition().duration(150).style('opacity', 1);
      isVisible = true;
    } else {
      ttipG.style('opacity', 1);
    }
  };

  const hideTooltip = (): void => {
    isVisible = false;
    lastSide = null;
    ttipG.interrupt().transition().duration(120).style('opacity', 0);
  };

  zoneRect
    .on('mousemove', (event: MouseEvent) => {
      const [mx, my] = pointer(event, node);
      showTooltip(mx, my);
    })
    .on('mouseleave', hideTooltip);
}
