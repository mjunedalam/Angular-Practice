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
}

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
        segs.push({ topPx: scale(topDepth), botPx: scale(botDepth), pct: points[i].pct, topDepth, botDepth });
      }
    }

    segs.forEach((seg, idx) => {
      const col = circulationColour(seg.pct);
      const botPct = (seg.botPx / effectivePx) * 100;
      const nextCol = idx + 1 < segs.length ? circulationColour(segs[idx + 1].pct) : col;
      grad.append('stop').attr('offset', `${botPct.toFixed(4)}%`).attr('stop-color', col);
      if (nextCol !== col) grad.append('stop').attr('offset', `${botPct.toFixed(4)}%`).attr('stop-color', nextCol);
    });

    shaftG.append('rect').attr('x', arrowCx - shaftHW).attr('y', 0).attr('width', shaftHW * 2).attr('height', cappedEffectivePx).attr('fill', `url(#${gradId})`);
    shaftG.append('rect').attr('x', arrowCx - shaftHW).attr('y', 0).attr('width', shaftHW).attr('height', cappedEffectivePx).attr('fill', 'rgba(255,255,255,0.10)').attr('pointer-events', 'none');

    segs.forEach(seg => {
      const fill = circulationColour(seg.pct);
      const segH = Math.max(1, seg.botPx - seg.topPx);
      const midY = seg.topPx + segH / 2;
      const ttipX = arrowCx + shaftHW + 10;
      const ttipG = arrowG.append('g').attr('class', 'circ-tooltip').style('opacity', 0).style('pointer-events', 'none');
      ttipG.append('rect').attr('x', ttipX).attr('y', midY - 29).attr('width', 220).attr('height', 58).attr('rx', 8).attr('fill', '#0f172a').attr('stroke', fill).attr('stroke-width', 2).attr('opacity', 0.97);
      ttipG.append('circle').attr('cx', ttipX + 16).attr('cy', midY - 7).attr('r', 6).attr('fill', fill);
      ttipG.append('text').attr('x', ttipX + 28).attr('y', midY - 3).attr('font-size', '14').attr('font-family', 'DM Sans, sans-serif').attr('font-weight', '700').attr('fill', '#e2e8f0').text(`${seg.topDepth.toLocaleString()} - ${seg.botDepth.toLocaleString()} ft`);
      ttipG.append('text').attr('x', ttipX + 16).attr('y', midY + 18).attr('font-size', '16').attr('font-family', 'DM Sans, sans-serif').attr('font-weight', '800').attr('fill', fill).text(`Circulation: ${seg.pct}%`);
      shaftG.append('rect')
        .attr('x', arrowCx - shaftHW)
        .attr('y', seg.topPx)
        .attr('width', shaftHW * 2)
        .attr('height', segH)
        .attr('fill', 'transparent')
        .attr('class', 'mud-circ-seg')
        .on('mouseenter', () => ttipG.transition().duration(100).style('opacity', 1))
        .on('mouseleave', () => ttipG.transition().duration(100).style('opacity', 0));
    });
  } else {
    shaftG.append('rect').attr('x', arrowCx - shaftHW).attr('y', 0).attr('width', shaftHW * 2).attr('height', Math.min(currPx, shaftMaxPx)).attr('fill', 'var(--accent)');
  }

  const headG = shaftG.append('g').attr('class', 'depth-arrow-head-g');
  headG.append('path').attr('class', 'depth-arrow-head').attr('d', `M${arrowCx - headHW},${currPx - headH} L${arrowCx},${currPx} L${arrowCx + headHW},${currPx - headH} Z`);
}

function circulationColour(pct: number): string {
  const clamped = Math.max(0, Math.min(100, pct));
  if (clamped === 0) return '#e53e3e';
  if (clamped === 100) return '#16a34a';
  const t = (clamped - 1) / 98;
  const hue = 30 + t * 25;
  return `hsl(${hue.toFixed(1)}, 90%, 50%)`;
}
