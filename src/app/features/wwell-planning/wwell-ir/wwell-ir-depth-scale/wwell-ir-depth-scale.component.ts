import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  effect,
  input,
  viewChild,
} from '@angular/core';
import { select } from 'd3-selection';
import { easeBackOut, easeCubicOut } from 'd3-ease';
import 'd3-transition';

import { ANIM, DIAGRAM_LAYOUT, DiagramLayout } from '@models/well-design/wellbore-diagram.model';
import { buildDepthTicks, createDepthScale, pickTickInterval } from '@shared/utils/wellbore-math.util';

/**
 * Wizard-local replica of `presentation/depth-scale/depth-scale.component.ts`'s D3 rendering
 * logic (ported, not imported — see wwell-ir-wellbore-diagram.mapper.ts's file header for the
 * "don't touch presentation/, write a wwell-ir-local utility instead" rule this follows).
 *
 * The only thing dropped from the original is its `inject(PresentationStore)` — dead in the
 * source component (never read in its effect or template) but route-scoped only, so using the
 * real component as-is here would throw a `NullInjectorError` under the wwell-ir route tree.
 * Everything else (markup, styling, tick/axis animation) is kept byte-for-byte identical.
 */
@Component({
  selector: 'app-wwell-ir-depth-scale',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './wwell-ir-depth-scale.component.html',
  styleUrl: './wwell-ir-depth-scale.component.scss',
})
export class WwellIrDepthScaleComponent {
  readonly totalDepth = input.required<number>();
  readonly animTrigger = input.required<number>();
  readonly diagramLayout = input<DiagramLayout>(DIAGRAM_LAYOUT);

  private readonly svgRef = viewChild<ElementRef<SVGSVGElement>>('scaleSvg');

  private get layout(): DiagramLayout { return this.diagramLayout(); }

  constructor() {
    effect(() => {
      const svgEl = this.svgRef();
      const depth = this.totalDepth();
      this.animTrigger(); // track trigger so we redraw on every diagram rebuild
      this.diagramLayout(); // track layout changes

      if (svgEl?.nativeElement) {
        this.drawScale(depth, svgEl.nativeElement);
      }
    });
  }

  private drawScale(totalDepth: number, element: SVGSVGElement): void {
    const { depthScaleWidth, svgHeight, marginTop, drawingHeight, depthAxisX } = this.layout;
    const tickHalfLength = 10;
    const tickLabelGap = 6;
    const tickLeftX = depthAxisX - tickHalfLength;
    const tickRightX = depthAxisX + tickHalfLength;
    const tickLabelX = tickLeftX - tickLabelGap;

    const svg = select(element);
    // Interrupt any in-progress/scheduled transitions before tearing down the DOM — this
    // effect re-fires on every live edit that moves `totalDepth` (e.g. switching Completion
    // while Program Details is open re-derives `wellboreDiagramData().displayDepth` on every
    // keystroke/selection change), which used to call `.remove()` on nodes that still had a
    // pending/active D3 transition scheduled on them (see d3-transition's per-node
    // `__transition` slot). That stale scheduled tick/tween callback still fires later against
    // the now-detached node — wasted work at best, and confirmed (via a scratch harness that
    // rapidly re-triggered this effect) to throw when it fires mid-rebuild. Mirrors the
    // `interrupt()`-before-rebuild guard `well-bore-view.component.ts`'s `redraw()` already
    // uses for the exact same "live data keeps changing faster than the animation" reason.
    svg.selectAll('*').interrupt();
    svg.selectAll('*').remove();

    svg
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${depthScaleWidth} ${svgHeight}`)
      .attr('preserveAspectRatio', 'none');

    const g = svg.append('g').attr('transform', `translate(0,${marginTop})`);
    const scale = createDepthScale(totalDepth, drawingHeight);
    const interval = pickTickInterval(totalDepth);
    const ticks = buildDepthTicks(totalDepth, interval);

    const titleX = depthScaleWidth / 2;
    g.append('text')
      .attr('class', 'axis-title')
      .attr('x', titleX)
      .attr('y', -42)
      .attr('text-anchor', 'middle')
      .style('opacity', 0)
      .call((t) => {
        t.append('tspan').attr('x', titleX).attr('dy', 0).text('Depth');
        t.append('tspan').attr('x', titleX).attr('dy', 20).text('(ft bgl)');
      })
      .transition()
      .delay(80)
      .duration(360)
      .ease(easeCubicOut)
      .attr('y', -36)
      .style('opacity', 1);

    const scaleTipY = scale(totalDepth); // === drawingHeight
    const lineLen = scaleTipY;

    g.append('line')
      .attr('class', 'axis-line')
      .attr('x1', depthAxisX).attr('x2', depthAxisX)
      .attr('y1', 0).attr('y2', scaleTipY)
      .attr('stroke-dasharray', lineLen)
      .attr('stroke-dashoffset', lineLen)
      .transition()
      .duration(ANIM.SCALE_DURATION)
      .ease(easeCubicOut)
      .attr('stroke-dashoffset', 0);

    ticks.forEach((depth: number) => {
      const yPx = scale(depth);
      const delay = (depth / totalDepth) * ANIM.SCALE_DURATION + ANIM.TICK_BASE_DELAY;

      const tick = g.append('g')
        .attr('class', 'tick')
        .attr('transform', `translate(0,${yPx - 4})`)
        .style('opacity', 0.01);

      tick.append('line')
        .attr('class', 'tick-line')
        .attr('x1', depthAxisX).attr('x2', depthAxisX)
        .attr('y1', 0).attr('y2', 0)
        .transition()
        .delay(delay)
        .duration(280)
        .ease(easeBackOut.overshoot(1.4))
        .attr('x1', tickLeftX).attr('x2', tickRightX);

      tick.append('text')
        .attr('class', 'tick-label')
        .attr('x', tickLabelX + 8)
        .attr('y', 0)
        .attr('dominant-baseline', 'middle')
        .style('opacity', 0)
        .text(depth === 0 ? '0' : depth.toLocaleString())
        .transition()
        .delay(delay + 110)
        .duration(260)
        .ease(easeCubicOut)
        .attr('x', tickLabelX)
        .style('opacity', 1);

      tick.transition()
        .delay(delay)
        .duration(240)
        .ease(easeCubicOut)
        .attr('transform', `translate(0,${yPx})`)
        .style('opacity', 1);
    });
  }
}
