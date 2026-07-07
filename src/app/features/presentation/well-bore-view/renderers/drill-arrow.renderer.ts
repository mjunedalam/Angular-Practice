import { easeCubicInOut } from 'd3-ease';
import 'd3-transition';

import { DiagramLayout, WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { DefsSel, DepthScale, GSel } from './wellbore-renderer.types';

interface CirculationSegment {
  readonly topPx: number;
  readonly botPx: number;
  readonly pct: number;
  readonly topDepth: number;
  readonly botDepth: number;
  readonly hasData: boolean;
}

const NO_CIRC_DATA_COLOUR = '#000000';

export interface RenderDrillArrowOptions {
  readonly rootG: GSel;
  readonly defsEl: DefsSel;
  readonly layout: DiagramLayout;
  readonly data: WellboreDiagramData;
  readonly scale: DepthScale;
  readonly drillStart: number;
  readonly casingsDoneAt: number;
}

export function renderDrillArrow({
  rootG,
  defsEl,
  layout,
  data,
  scale,
  drillStart,
  casingsDoneAt,
}: RenderDrillArrowOptions): void {
  const arrowCx = layout.depthArrowX;
  const shaftHW = 4;
  const headH = 14;
  const headHW = 9;
  const duration = casingsDoneAt - drillStart;
  const currentDepth = Math.max(0, Math.min(data.currentDepth, data.totalDepth));
  const currPx = scale(currentDepth);
  const points = data.mudCirculation;
  const arrowG = rootG.append('g').attr('class', 'depth-arrow-group');
  const clipId = `arrow-clip-${Date.now()}`;

  defsEl.append('clipPath').attr('class', 'dyn-clip').attr('id', clipId).append('rect')
    .attr('x', arrowCx - headHW - 4).attr('y', -4).attr('width', (headHW + 4) * 2).attr('height', 0)
    .transition().delay(drillStart).duration(duration).ease(easeCubicInOut).attr('height', currPx + 4);

  const shaftG = arrowG.append('g').attr('clip-path', `url(#${clipId})`);
  const effectiveDepth = currentDepth;
  const effectivePx = scale(effectiveDepth);
  const shaftMaxPx = Math.max(0, currPx - headH);
  const cappedEffectivePx = Math.min(effectivePx, shaftMaxPx);

  if (points.length && effectivePx > 0) {
    const gradId = `circ-grad-${Date.now()}`;
    const grad = defsEl.append('linearGradient')
      .attr('class', 'dyn-clip')
      .attr('id', gradId)
      .attr('gradientUnits', 'userSpaceOnUse')
      .attr('x1', arrowCx).attr('y1', 0)
      .attr('x2', arrowCx).attr('y2', cappedEffectivePx);
    const segs: CirculationSegment[] = [];

    for (let i = 0; i < points.length; i++) {
      const topDepth = i === 0 ? 0 : points[i - 1].depth;
      const botDepth = Math.min(points[i].depth, effectiveDepth);
      if (topDepth < botDepth) {
        segs.push({ topPx: scale(topDepth), botPx: scale(botDepth), pct: points[i].pct, topDepth, botDepth, hasData: true });
      }
    }

    const lastBotDepth = segs.length ? segs[segs.length - 1].botDepth : 0;
    if (lastBotDepth < effectiveDepth) {
      segs.push({
        topPx: scale(lastBotDepth),
        botPx: scale(effectiveDepth),
        pct: 0,
        topDepth: lastBotDepth,
        botDepth: effectiveDepth,
        hasData: false,
      });
    }

    segs.forEach((seg, idx) => {
      const col = segmentColour(seg);
      const botPct = (seg.botPx / effectivePx) * 100;
      const nextCol = idx + 1 < segs.length ? segmentColour(segs[idx + 1]) : col;
      grad.append('stop').attr('offset', `${botPct.toFixed(4)}%`).attr('stop-color', col);
      if (nextCol !== col) grad.append('stop').attr('offset', `${botPct.toFixed(4)}%`).attr('stop-color', nextCol);
    });

    shaftG.append('rect').attr('x', arrowCx - shaftHW).attr('y', 0).attr('width', shaftHW * 2).attr('height', cappedEffectivePx).attr('fill', `url(#${gradId})`);
    shaftG.append('rect').attr('x', arrowCx - shaftHW).attr('y', 0).attr('width', shaftHW).attr('height', cappedEffectivePx).attr('fill', 'rgba(255,255,255,0.10)').attr('pointer-events', 'none');

    segs.forEach(seg => {
      const fill = segmentColour(seg);
      const segH = Math.max(1, seg.botPx - seg.topPx);

      if (!seg.hasData) {
        shaftG.append('rect')
          .attr('x', arrowCx - shaftHW)
          .attr('y', seg.topPx)
          .attr('width', shaftHW * 2)
          .attr('height', segH)
          .attr('fill', 'transparent')
          .attr('class', 'mud-circ-seg');
        return;
      }

      const midY = seg.topPx + segH / 2;
      const font = 'DM Sans, sans-serif';
      const ttipW = 240;
      const ROW_H = 28;
      const ttipH = 60 + 2 * ROW_H + 16;
      const rawTtipX = arrowCx + shaftHW + 14;
      const ttipX = Math.min(rawTtipX, layout.wellboreViewWidth - ttipW - 8);
      const ttipY = Math.max(4, Math.min(midY - ttipH / 2, layout.drawingHeight - ttipH - 4));
      const connY = Math.min(Math.max(midY, ttipY + 18), ttipY + ttipH - 18);
      const anchorX = arrowCx + shaftHW;
      const connMidX = ttipX - 8;
      const pctLabel = `${seg.pct}%`;
      const badgeW = pctLabel.length * 8.5 + 16;
      const mutedFill = circulationMuted(seg.pct);

      const ttipG = arrowG.append('g').attr('class', 'circ-tooltip').style('opacity', 0).style('pointer-events', 'none');

      // Connector elbow + anchor dot
      ttipG.append('path')
        .attr('d', `M${anchorX},${midY} H${connMidX} Q${ttipX},${midY} ${ttipX},${connY} H${ttipX}`)
        .attr('fill', 'none').attr('stroke', fill)
        .attr('stroke-width', 1.4).attr('stroke-dasharray', '4,3')
        .attr('stroke-linecap', 'round').attr('opacity', 0.65);
      ttipG.append('circle')
        .attr('cx', anchorX).attr('cy', midY)
        .attr('r', 3.2).attr('fill', '#fff')
        .attr('stroke', fill).attr('stroke-width', 1.6);

      // Card
      ttipG.append('rect')
        .attr('x', ttipX).attr('y', ttipY)
        .attr('width', ttipW).attr('height', ttipH)
        .attr('rx', 8).attr('fill', '#ffffff')
        .attr('stroke', '#e2e8f0').attr('stroke-width', 1.2)
        .attr('filter', 'drop-shadow(0 8px 16px rgba(15,23,42,0.18))');

      // Accent rail (left / connector side)
      ttipG.append('rect')
        .attr('x', ttipX).attr('y', ttipY)
        .attr('width', 5).attr('height', ttipH)
        .attr('rx', 2).attr('fill', fill);

      // Badge
      ttipG.append('rect')
        .attr('x', ttipX + 12).attr('y', ttipY + 11)
        .attr('width', badgeW).attr('height', 22)
        .attr('rx', 11).attr('fill', mutedFill);
      ttipG.append('text')
        .attr('x', ttipX + 12 + badgeW / 2).attr('y', ttipY + 27)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14').attr('font-family', font)
        .attr('font-weight', '900').attr('letter-spacing', '0.5')
        .attr('fill', fill).text(pctLabel);

      // Title
      ttipG.append('text')
        .attr('x', ttipX + ttipW - 12).attr('y', ttipY + 27)
        .attr('text-anchor', 'end')
        .attr('font-size', '17').attr('font-family', font)
        .attr('font-weight', '800').attr('fill', '#0f172a').text('Mud Circulation');

      // Divider
      ttipG.append('line')
        .attr('x1', ttipX + 12).attr('x2', ttipX + ttipW - 12)
        .attr('y1', ttipY + 44).attr('y2', ttipY + 44)
        .attr('stroke', '#e2e8f0').attr('stroke-width', 1);

      // Row: Interval
      ttipG.append('text')
        .attr('x', ttipX + 14).attr('y', ttipY + 64)
        .attr('font-size', '15').attr('font-family', font)
        .attr('font-weight', '700').attr('fill', '#64748b').text('Interval');
      ttipG.append('text')
        .attr('x', ttipX + ttipW - 14).attr('y', ttipY + 64)
        .attr('text-anchor', 'end')
        .attr('font-size', '17').attr('font-family', font)
        .attr('font-weight', '800').attr('fill', '#0f172a')
        .text(`${seg.topDepth.toLocaleString()} – ${seg.botDepth.toLocaleString()} ft`);

      // Row: Circulation % (accent coloured)
      ttipG.append('text')
        .attr('x', ttipX + 14).attr('y', ttipY + 92)
        .attr('font-size', '15').attr('font-family', font)
        .attr('font-weight', '700').attr('fill', '#64748b').text('Circulation');
      ttipG.append('text')
        .attr('x', ttipX + ttipW - 14).attr('y', ttipY + 92)
        .attr('text-anchor', 'end')
        .attr('font-size', '17').attr('font-family', font)
        .attr('font-weight', '800').attr('fill', fill).text(`${seg.pct}%`);

      shaftG.append('rect')
        .attr('x', arrowCx - shaftHW)
        .attr('y', seg.topPx)
        .attr('width', shaftHW * 2)
        .attr('height', segH)
        .attr('fill', 'transparent')
        .attr('class', 'mud-circ-seg')
        .on('mouseenter', () => ttipG.interrupt().transition().duration(150).style('opacity', 1))
        .on('mouseleave', () => ttipG.interrupt().transition().duration(120).style('opacity', 0));
    });
  } else {
    shaftG.append('rect').attr('x', arrowCx - shaftHW).attr('y', 0).attr('width', shaftHW * 2).attr('height', Math.min(currPx, shaftMaxPx)).attr('fill', 'var(--accent)');
  }

  const headG = shaftG.append('g').attr('class', 'depth-arrow-head-g');
  headG.append('path').attr('class', 'depth-arrow-head').attr('d', `M${arrowCx - headHW},${currPx - headH} L${arrowCx},${currPx} L${arrowCx + headHW},${currPx - headH} Z`);
}

function segmentColour(seg: CirculationSegment): string {
  return seg.hasData ? circulationColour(seg.pct) : NO_CIRC_DATA_COLOUR;
}

function circulationColour(pct: number): string {
  const clamped = Math.max(0, Math.min(100, pct));
  if (clamped === 0) return '#e53e3e';
  if (clamped === 100) return '#16a34a';
  const t = (clamped - 1) / 98;
  const hue = 30 + t * 25;
  return `hsl(${hue.toFixed(1)}, 90%, 50%)`;
}

function circulationMuted(pct: number): string {
  const clamped = Math.max(0, Math.min(100, pct));
  if (clamped === 0) return 'rgba(229,62,62,0.14)';
  if (clamped === 100) return 'rgba(22,163,74,0.14)';
  return 'rgba(234,179,8,0.14)';
}
