import { DiagramLayout } from '@models/well-design/wellbore-diagram.model';
import { GSel } from './wellbore-renderer.types';

export interface RenderStaticChromeOptions {
  readonly rootG: GSel;
  readonly layout: DiagramLayout;
  readonly geoLineX: number;
  readonly centerX: number;
}

export function renderStaticChrome({
  rootG,
  layout,
  geoLineX,
  centerX,
}: RenderStaticChromeOptions): void {
  rootG.append('line')
    .attr('class', 'ground-line')
    .attr('x1', geoLineX + 200).attr('x2', centerX + 300)
    .attr('y1', -3).attr('y2', -3);

  rootG.append('text')
    .attr('class', 'ground-label')
    .attr('x', centerX).attr('y', -12)
    .attr('text-anchor', 'middle')
    .text('Ground Level');

  rootG.append('line')
    .attr('class', 'geo-axis')
    .attr('x1', geoLineX).attr('x2', geoLineX)
    .attr('y1', 0).attr('y2', layout.drawingHeight);

  rootG.append('text')
    .attr('class', 'column-label')
    .attr('x', geoLineX).attr('y', -30)
    .attr('text-anchor', 'middle')
    .style('font-size', '13px')
    .call((text) => {
      text.append('tspan').attr('x', geoLineX).attr('dy', 0).text('Geologic');
      text.append('tspan').attr('x', geoLineX).attr('dy', 12).text('Horizons (ft bgl)');
    });
}
