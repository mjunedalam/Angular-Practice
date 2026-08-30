import gsap from 'gsap';

const COLLAPSE_ENTER_DURATION_S = 0.2;
const COLLAPSE_EXIT_DURATION_S = 0.15;
const COLLAPSE_SLIDE_PX = 6;

/**
 * Compositor-only (`opacity` + `transform`) — deliberately never touches `height`. A section here
 * can hold several mat-form-fields or a multi-row table, and tweening `height` (even to/from GSAP's
 * measured 'auto') forces a synchronous layout recalculation on every single frame, which is what
 * made this read as stuttering/heavy instead of smooth. `transform`/`opacity` are compositor-only —
 * the browser can run them entirely on the GPU with zero layout work (see the project's own
 * performance rules: prefer transform/opacity, avoid animating height/width/margin/padding).
 *
 * The tradeoff: surrounding content still shifts in the same frame the element mounts/unmounts
 * (no smooth height "push") rather than over the animation's duration — invisible in practice
 * since it lines up with the very start of the fade, and far lighter than a stuttering alternative.
 */
export function buildCollapseEnterTimeline(host: HTMLElement, onComplete: () => void): gsap.core.Timeline {
  return gsap
    .timeline({ paused: true, onComplete })
    .fromTo(
      host,
      { opacity: 0, y: -COLLAPSE_SLIDE_PX },
      { opacity: 1, y: 0, duration: COLLAPSE_ENTER_DURATION_S, ease: 'power1.out' },
    );
}

/** `onComplete` resolves `animate.leave`'s own `animationComplete()` — Angular only detaches the
 *  node once that runs, so the exit tween is guaranteed to finish on screen first regardless of
 *  what triggered the removal (a click, a signal flip elsewhere, whatever). */
export function buildCollapseExitTimeline(host: HTMLElement, onComplete: () => void): gsap.core.Timeline {
  return gsap
    .timeline({ paused: true, onComplete })
    .to(host, { opacity: 0, y: -COLLAPSE_SLIDE_PX, duration: COLLAPSE_EXIT_DURATION_S, ease: 'power1.in' });
}
