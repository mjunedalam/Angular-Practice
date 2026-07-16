import { WellboreAnimConfig } from '@models/well-design/wellbore-diagram.model';
import { resolveAnimation } from '../../renderers/animation.helpers';

export interface Gsap3DTiming {
  /** Seconds — GSAP works in seconds, the 2D renderers work in milliseconds. */
  readonly lineDur: number;
  readonly fadeDur: number;
  readonly popDur: number;
  readonly popEase: string;
}

/** Reuses the same speed/popStyle resolution the 2D wellbore view relies on (`resolveAnimation`)
 *  so both views stay in sync when a user changes the animation config — only the GSAP ease
 *  *name* differs, since GSAP takes string eases while the SVG renderers take d3-ease functions. */
export function resolveGsap3DTiming(config: WellboreAnimConfig): Gsap3DTiming {
  const resolved = resolveAnimation(config);
  const popEase = config.popStyle === 'bounce'
    ? 'bounce.out'
    : config.popStyle === 'elastic'
      ? 'back.out(1.7)'
      : 'power2.out';

  return {
    lineDur: resolved.lineDur / 1000,
    fadeDur: resolved.fadeDur / 1000,
    popDur: resolved.popDur / 1000,
    popEase,
  };
}
