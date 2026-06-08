import { Selection } from 'd3-selection';
import { ScaleLinear } from 'd3-scale';
import 'd3-transition';

import { FormationInfoViewModel } from '@models/active-wwell/active-wwell-view.model';
import { ANIM, DiagramLayout } from '@models/well-design/wellbore-diagram.model';
import { ITopsIR } from '@shared/models/wwell/tops-ir.model';

type GSel = Selection<SVGGElement, unknown, null, undefined>;
type DepthScale = ScaleLinear<number, number>;

export interface RenderGeoTopsOptions {
  readonly rootG: GSel;
  readonly layout: DiagramLayout;
  readonly tops: ITopsIR[];
  readonly geoLineX: number;
  readonly scale: DepthScale;
  readonly targetAquifer: string | null;
  readonly formationTops?: FormationInfoViewModel[];
}

export function renderGeoTops({
  rootG,
  layout,
  tops,
  geoLineX,
  scale,
  targetAquifer,
  formationTops = [],
}: RenderGeoTopsOptions): void {
  const actualMap = new Map(
    formationTops
      .filter(f => {
        const n = Number(f.actualDepth);
        return f.actualDepth !== null && f.actualDepth !== undefined &&
          f.actualDepth !== '' && isFinite(n) && n > 0;
      })
      .map(f => [f.formation, Number(f.actualDepth)]),
  );

  const remarksMap = new Map(
    formationTops
      .filter(f => f.remarks?.trim())
      .map(f => [f.formation, f.remarks!.trim()]),
  );

  const sorted = [...tops].sort((a, b) => a.planTvdDepth - b.planTvdDepth);
  const hoverLayer = rootG.append('g').attr('class', 'geo-hover-targets');
  const tooltipLayer = rootG.append('g')
    .attr('class', 'geo-remark-tooltip')
    .style('opacity', 0)
    .style('pointer-events', 'none');

  const hideTooltip = (): void => {
    tooltipLayer.interrupt().transition().duration(120).style('opacity', 0);
  };

  const showTooltip = (
    yPx: number,
    formation: string,
    depth: number,
    remark: string,
    hasActual: boolean,
  ): void => {
    const tooltipW = 260;
    const lineHeight = 15;
    const lines = wrapGeoRemark(remark, 32, 3);
    const tooltipH = 54 + lines.length * lineHeight;
    const tooltipX = geoLineX + 48;
    const tooltipY = Math.max(4, Math.min(yPx - tooltipH / 2, layout.drawingHeight - tooltipH - 4));
    const rowAnchorX = geoLineX + 18;
    const connectorY = Math.max(tooltipY + 22, Math.min(yPx, tooltipY + tooltipH - 18));
    const accent = hasActual ? '#16a34a' : '#2563eb';
    const mutedAccent = hasActual ? 'rgba(22,163,74,0.2)' : 'rgba(37,99,235,0.18)';

    tooltipLayer.selectAll('*').remove();
    tooltipLayer.raise();

    tooltipLayer.append('path')
      .attr('d', `M${rowAnchorX},${yPx} H${tooltipX - 14} Q${tooltipX - 7},${yPx} ${tooltipX - 7},${connectorY} H${tooltipX}`)
      .attr('stroke', accent)
      .attr('stroke-width', 1.6)
      .attr('stroke-linecap', 'round')
      .attr('stroke-linejoin', 'round')
      .attr('opacity', 0.76)
      .attr('fill', 'none');

    tooltipLayer.append('circle')
      .attr('cx', rowAnchorX)
      .attr('cy', yPx)
      .attr('r', 3.2)
      .attr('fill', '#ffffff')
      .attr('stroke', accent)
      .attr('stroke-width', 1.6);

    tooltipLayer.append('rect')
      .attr('x', tooltipX)
      .attr('y', tooltipY)
      .attr('width', tooltipW)
      .attr('height', tooltipH)
      .attr('rx', 10)
      .attr('fill', '#ffffff')
      .attr('stroke', accent)
      .attr('stroke-width', 1.4)
      .attr('filter', 'drop-shadow(0 8px 14px rgba(15,23,42,0.18))');

    tooltipLayer.append('rect')
      .attr('x', tooltipX)
      .attr('y', tooltipY)
      .attr('width', 5)
      .attr('height', tooltipH)
      .attr('rx', 2)
      .attr('fill', accent);

    tooltipLayer.append('rect')
      .attr('x', tooltipX + 14)
      .attr('y', tooltipY + 12)
      .attr('width', hasActual ? 62 : 70)
      .attr('height', 22)
      .attr('rx', 11)
      .attr('fill', mutedAccent);

    tooltipLayer.append('text')
      .attr('x', tooltipX + (hasActual ? 45 : 49))
      .attr('y', tooltipY + 27)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10')
      .attr('font-family', 'DM Sans, sans-serif')
      .attr('font-weight', '900')
      .attr('fill', accent)
      .text(hasActual ? 'ACTUAL' : 'PLANNED');

    tooltipLayer.append('text')
      .attr('x', tooltipX + 90)
      .attr('y', tooltipY + 27)
      .attr('font-size', '15')
      .attr('font-family', 'DM Sans, sans-serif')
      .attr('font-weight', '900')
      .attr('fill', '#0f172a')
      .text(formation);

    tooltipLayer.append('text')
      .attr('x', tooltipX + tooltipW - 16)
      .attr('y', tooltipY + 27)
      .attr('text-anchor', 'end')
      .attr('font-size', '12')
      .attr('font-family', 'DM Sans, sans-serif')
      .attr('font-weight', '800')
      .attr('fill', '#64748b')
      .text(`${depth.toLocaleString()} ft`);

    tooltipLayer.append('line')
      .attr('x1', tooltipX + 14)
      .attr('x2', tooltipX + tooltipW - 14)
      .attr('y1', tooltipY + 43)
      .attr('y2', tooltipY + 43)
      .attr('stroke', '#e2e8f0');

    lines.forEach((line, lineIdx) => {
      tooltipLayer.append('text')
        .attr('x', tooltipX + 16)
        .attr('y', tooltipY + 63 + lineIdx * lineHeight)
        .attr('font-size', '12')
        .attr('font-family', 'DM Sans, sans-serif')
        .attr('font-weight', '600')
        .attr('fill', lineIdx === lines.length - 1 && remark.length > lines.join(' ').length ? '#64748b' : '#334155')
        .text(line);
    });

    tooltipLayer.interrupt().style('opacity', 0).transition().duration(120).style('opacity', 1);
  };

  const addHoverTarget = (
    yPx: number,
    formation: string,
    depth: number,
    remark: string | undefined,
    hasActual: boolean,
  ): void => {
    const tooltipRemark = remark?.trim() || 'No remarks available';

    hoverLayer.append('rect')
      .attr('class', 'geo-hover-row')
      .attr('x', geoLineX - 88)
      .attr('y', yPx - 15)
      .attr('width', 130)
      .attr('height', 30)
      .attr('rx', 5)
      .attr('fill', 'transparent')
      .style('pointer-events', 'all')
      .style('cursor', 'help')
      .on('mouseenter', () => showTooltip(yPx, formation, depth, tooltipRemark, hasActual))
      .on('mouseleave', hideTooltip);
  };

  sorted.forEach((top, idx) => {
    const isTarget = !!targetAquifer && top.stLongCd === targetAquifer;
    const actualDepth = actualMap.get(top.stLongCd);
    const hasActual = actualDepth !== undefined;
    const depth = hasActual ? actualDepth! : top.planTvdDepth;
    const yPx = scale(depth);
    const remark = remarksMap.get(top.stLongCd);

    const g = rootG.append('g')
      .attr('class', isTarget ? 'geo-top geo-top--target' : 'geo-top')
      .attr('transform', `translate(0,${yPx})`)
      .style('opacity', 0);

    if (isTarget) {
      g.append('rect')
        .attr('class', 'geo-target-band')
        .attr('x', geoLineX - 75)
        .attr('width', 150)
        .attr('height', 25)
        .attr('y', -14)
        .attr('rx', 3);
    }

    g.append('line')
      .attr('class', 'geo-tick')
      .attr('x1', geoLineX - 14).attr('x2', geoLineX + 14)
      .attr('y1', 0).attr('y2', 0);

    g.append('text')
      .attr('class', 'geo-depth')
      .attr('x', geoLineX - 17)
      .attr('dy', '0.35em')
      .text(hasActual ? actualDepth!.toLocaleString() : top.planTvdDepth.toLocaleString());

    g.append('text')
      .attr('class', hasActual ? 'geo-code geo-code--actual' : 'geo-code')
      .attr('x', geoLineX + 18)
      .attr('dy', '0.35em')
      .style('pointer-events', 'none')
      .text(top.stLongCd);

    addHoverTarget(yPx, top.stLongCd, depth, remark, hasActual);

    g.transition()
      .delay(ANIM.GEO_DELAY + idx * ANIM.GEO_STAGGER)
      .duration(220)
      .style('opacity', 1);
  });

  const drlgOnlyTops = formationTops.filter(f => f.isDrlgOnly);
  drlgOnlyTops.forEach((top, idx) => {
    const actualDepth = Number(top.actualDepth);
    if (!isFinite(actualDepth) || actualDepth <= 0) return;
    const yPx = scale(actualDepth);

    const g = rootG.append('g')
      .attr('class', 'geo-top geo-top--drlg-only')
      .attr('transform', `translate(0,${yPx})`)
      .style('opacity', 0);

    g.append('line')
      .attr('class', 'geo-tick')
      .attr('x1', geoLineX - 14).attr('x2', geoLineX + 14)
      .attr('y1', 0).attr('y2', 0)
      .attr('stroke', '#22c55e');

    g.append('text')
      .attr('class', 'geo-depth')
      .attr('x', geoLineX - 17)
      .attr('dy', '0.35em')
      .text(actualDepth.toLocaleString());

    g.append('text')
      .attr('class', 'geo-code geo-code--actual')
      .attr('x', geoLineX + 18)
      .attr('dy', '0.35em')
      .attr('fill', '#22c55e')
      .style('pointer-events', 'none')
      .text(top.formation);

    addHoverTarget(yPx, top.formation, actualDepth, top.remarks?.trim(), true);

    g.transition()
      .delay(ANIM.GEO_DELAY + (sorted.length + idx) * ANIM.GEO_STAGGER)
      .duration(220)
      .style('opacity', 1);
  });

  hoverLayer.raise();
  tooltipLayer.raise();
}

function wrapGeoRemark(value: string, maxLineLength: number, maxLines: number): string[] {
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

  return lines.length ? lines : ['No remarks available'];
}
