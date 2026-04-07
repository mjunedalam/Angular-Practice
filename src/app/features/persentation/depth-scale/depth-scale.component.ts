import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  effect,
  input,
  viewChild,
} from '@angular/core';
import { select } from 'd3-selection';
import { easeLinear } from 'd3-ease';
import 'd3-transition';

import { WellStore } from '../../../core/store/well.store';
import { ANIM, ANIM_MODE, DIAGRAM_LAYOUT } from '../../../models/well-design/wellbore-diagram.model';
import { buildDepthTicks, createDepthScale, formatDepth } from '../../../utils/wellbore-math.util';

@Component({
  selector: 'app-depth-scale',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './depth-scale.component.html',
  styleUrl: './depth-scale.component.scss',
})
export class DepthScaleComponent implements OnInit {
  protected readonly store = inject(WellStore);
  readonly totalDepth = input.required<number>();
  readonly animTrigger = input.required<number>();

  private readonly svgRef = viewChild<ElementRef<SVGSVGElement>>('scaleSvg');

  private readonly layout = DIAGRAM_LAYOUT;

  constructor() {
    effect(() => {
      const svgEl = this.svgRef();
      const depth = this.totalDepth();
      const loading = this.store.loading();

      // Draw if we have the SVG element and we aren't loading
      if (svgEl?.nativeElement && !loading) {
        this.drawScale(depth, svgEl.nativeElement);
      }
    });
  }

  ngOnInit(): void {}

  private drawScale(totalDepth: number, element: SVGSVGElement): void {
    const { depthScaleWidth, svgHeight, marginTop, drawingHeight, depthAxisX } = this.layout;

    const svg = select(element);
    svg.selectAll('*').remove();

    svg
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${depthScaleWidth} ${svgHeight}`)
      .attr('preserveAspectRatio', 'none');

    const g = svg.append('g').attr('transform', `translate(0,${marginTop})`);
    const scale = createDepthScale(totalDepth, drawingHeight);
    const ticks = buildDepthTicks(totalDepth, 500);

    g.append('text')
      .attr('class', 'axis-title')
      .attr('x', depthAxisX)
      .attr('y', -32)
      .attr('text-anchor', 'middle')
      .call((t) => {
        t.append('tspan').attr('x', depthAxisX).attr('dy', 0).text('Depth');
        t.append('tspan').attr('x', depthAxisX).attr('dy', 12).text('(ft bgl)');
      });

    const lineLen = drawingHeight;
    g.append('line')
      .attr('class', 'axis-line')
      .attr('x1', depthAxisX).attr('x2', depthAxisX)
      .attr('y1', 0).attr('y2', drawingHeight)
      .attr('stroke-dasharray', lineLen)
      .attr('stroke-dashoffset', lineLen)
      .transition()
      .duration(ANIM.SCALE_DURATION)
      .ease(easeLinear)
      .attr('stroke-dashoffset', 0);

    ticks.forEach((depth: number) => {
      const yPx = scale(depth);
      const delay = (depth / totalDepth) * ANIM.SCALE_DURATION + ANIM.TICK_BASE_DELAY;

      const tick = g.append('g')
        .attr('class', 'tick')
        .attr('transform', `translate(0,${yPx})`)
        .style('opacity', 0);

      tick.append('line')
        .attr('class', 'tick-line')
        .attr('x1', depthAxisX - 6).attr('x2', depthAxisX);

      tick.append('text')
        .attr('class', 'tick-label')
        .attr('x', depthAxisX - 9)
        .attr('dy', '0.32em')
        .text(depth === 0 ? '0' : depth.toLocaleString());

      tick.append('line')
        .attr('class', 'tick-grid')
        .attr('x1', depthAxisX).attr('x2', depthAxisX + 8);

      tick.transition()
        .delay(delay)
        .duration(200)
        .style('opacity', 1);
    });

    g.append('text')
      .attr('class', 'total-depth-label')
      .attr('x', depthAxisX)
      .attr('y', drawingHeight + 26)
      .attr('text-anchor', 'middle')
      .style('opacity', 0)
      .text(formatDepth(totalDepth))
      .transition()
      .delay(ANIM.SCALE_DURATION + 200)
      .duration(300)
      .style('opacity', 1);
  }
}
