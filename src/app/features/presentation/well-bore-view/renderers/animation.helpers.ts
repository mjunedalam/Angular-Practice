import { easeBackOut, easeBounceOut, easeCubicInOut, easeLinear } from 'd3-ease';
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
    group.selectAll<SVGElement, unknown>('path, text')
      .style('opacity', 0)
      .transition().delay(delay + animation.lineDur).duration(animation.fadeDur).ease(easeCubicInOut)
      .style('opacity', 1);
  } else {
    group.style('opacity', 0)
      .transition().delay(delay).duration(animation.lineDur + animation.fadeDur).ease(easeCubicInOut)
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
