import { easeBackOut, easeBounceOut, easeCubicInOut, easeCubicOut, easeLinear } from 'd3-ease';
import 'd3-transition';

import { WellboreAnimConfig } from '@models/well-design/wellbore-diagram.model';
import { GSel, ResolvedAnimation } from './wellbore-renderer.types';

export function resolveAnimation(config: WellboreAnimConfig): ResolvedAnimation {
  const mult = config.speed === 'slow' ? 1.8 : config.speed === 'fast' ? 0.4 : 1.0;
  const popEase = config.popStyle === 'bounce' ? easeBounceOut
    : config.popStyle === 'elastic' ? easeBackOut
      : easeCubicInOut;

  return {
    lineDur: Math.round(500 * mult),
    fadeDur: Math.round(300 * mult),
    popDur: Math.round(600 * mult),
    lineStyle: config.lineStyle,
    popStyle: config.popStyle,
    popEase,
  };
}

export function animateLabel(group: GSel, delay: number, animation: ResolvedAnimation): void {
  const lineEl = group.select<SVGLineElement>('line');
  if (animation.lineStyle === 'draw') {
    const x1 = parseFloat(lineEl.attr('x1'));
    const x2 = parseFloat(lineEl.attr('x2'));
    lineEl
      .attr('stroke-dasharray', Math.abs(x2 - x1))
      .attr('stroke-dashoffset', Math.abs(x2 - x1))
      .transition().delay(delay).duration(animation.lineDur).ease(easeLinear)
      .attr('stroke-dashoffset', 0);
    group.selectAll<SVGElement, unknown>('path')
      .style('opacity', 0)
      .attr('transform', 'translate(4,0)')
      .transition().delay(delay + animation.lineDur).duration(animation.fadeDur).ease(easeBackOut)
      .attr('transform', 'translate(0,0)')
      .style('opacity', 1);
    group.selectAll<SVGElement, unknown>('text')
      .style('opacity', 0)
      .attr('transform', 'translate(8,0)')
      .transition().delay(delay + animation.lineDur + 80).duration(animation.fadeDur).ease(easeCubicOut)
      .attr('transform', 'translate(0,0)')
      .style('opacity', 1);
  } else {
    group.style('opacity', 0)
      .attr('transform', 'translate(6,0)')
      .transition().delay(delay).duration(animation.lineDur + animation.fadeDur).ease(easeCubicInOut)
      .attr('transform', 'translate(0,0)')
      .style('opacity', 1);
  }
}

export function applyPop(wrap: GSel, cx: number, cy: number, delay: number, animation: ResolvedAnimation): void {
  if (animation.popStyle === 'fade') {
    wrap.attr('transform', `translate(${cx},${cy}) scale(1)`)
      .style('opacity', 0)
      .transition().delay(delay).duration(animation.popDur).ease(easeCubicInOut)
      .style('opacity', 1);
    return;
  }

  wrap.attr('transform', `translate(${cx},${cy}) scale(0)`)
    .transition().delay(delay).duration(animation.popDur).ease(animation.popEase)
    .attr('transform', `translate(${cx},${cy}) scale(1)`);
}

/** Squeezes a right-hand leader label to the room left of the diagram's right edge, so its last characters are never clipped
 *  by the SVG (e.g. `30" Conductor @ 100` losing its final digit). A label that already fits is left untouched. */
export function fitLabelToRoom(
  text: { attr(name: string, value: string | number): unknown; node(): unknown },
  labelX: number,
  viewWidth: number,
): void {
  const room = viewWidth - labelX - RIGHT_EDGE_PADDING;
  const measured = (text.node() as SVGTextElement | null)?.getComputedTextLength?.() ?? 0;
  if (room > 0 && measured > room) {
    text.attr('textLength', room);
    text.attr('lengthAdjust', 'spacingAndGlyphs');
  }
}

const RIGHT_EDGE_PADDING = 6;
