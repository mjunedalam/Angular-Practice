import 'd3-transition';

import { ANIM, WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { DepthScale, GSel } from './wellbore-renderer.types';

export interface RenderNotDrilledZoneOptions {
  readonly rootG: GSel;
  readonly data: WellboreDiagramData;
  readonly centerX: number;
  readonly scale: DepthScale;
  readonly start: number;
  readonly openHoleHalfWidth: number;
}

export function renderNotDrilledZone({
  rootG,
  data,
  centerX,
  scale,
  start,
  openHoleHalfWidth,
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

  const ndg = rootG.append('g')
    .attr('class', 'not-drilled-zone')
    .style('opacity', 0);

  const ttipG = rootG.append('g')
    .attr('class', 'not-drilled-tooltip')
    .style('opacity', 0)
    .style('pointer-events', 'none');

  const ttipX = centerX + openHoleHalfWidth + 14;
  const ttipY = topPx + height * 0.4;
  ttipG.append('rect')
    .attr('x', ttipX).attr('y', ttipY - 36)
    .attr('width', 260).attr('height', 66)
    .attr('rx', 8)
    .attr('fill', '#1e293b')
    .attr('fill-opacity', 0.82)
    .attr('stroke', 'rgba(239,68,68,0.55)')
    .attr('stroke-width', 1.5);
  ttipG.append('text')
    .attr('x', ttipX + 14).attr('y', ttipY - 10)
    .attr('font-size', '14').attr('font-family', 'DM Sans, sans-serif')
    .attr('font-weight', '700').attr('fill', 'rgba(239,100,68,1)')
    .attr('letter-spacing', '0.04em')
    .text('NOT DRILLED');
  ttipG.append('text')
    .attr('x', ttipX + 14).attr('y', ttipY + 14)
    .attr('font-size', '13').attr('font-family', 'DM Sans, sans-serif')
    .attr('font-weight', '500').attr('fill', '#cbd5e1')
    .text(`Remaining: ${undrilledFt.toLocaleString()} ft`);

  ndg.append('rect')
    .attr('x', lx)
    .attr('y', topPx)
    .attr('width', width)
    .attr('height', height)
    .attr('fill', 'rgba(239, 68, 68, 0.12)')
    .attr('stroke', 'rgba(239, 68, 68, 0.3)')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '8,4')
    .style('cursor', 'help')
    .on('mouseenter', () => ttipG.transition().duration(100).style('opacity', 1))
    .on('mouseleave', () => ttipG.transition().duration(100).style('opacity', 0));

  ndg.transition()
    .delay(start)
    .duration(ANIM.OVERLAY_FADE)
    .style('opacity', 1);
}
