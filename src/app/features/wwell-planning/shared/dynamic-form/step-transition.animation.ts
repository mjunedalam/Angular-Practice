import gsap from 'gsap';

export type WwellStepDirection = 'forward' | 'backward';

const STEP_ENTER_DURATION_S = 0.32;
const STEP_SLIDE_PX = 24;

/** Fade + slide reveal for a stepper's active step content. Paused — caller decides when to play. */
export function buildStepTransitionTimeline(host: HTMLElement, direction: WwellStepDirection): gsap.core.Timeline {
  const offset = direction === 'forward' ? STEP_SLIDE_PX : -STEP_SLIDE_PX;

  return gsap
    .timeline({ paused: true })
    .fromTo(host, { opacity: 0, x: offset }, { opacity: 1, x: 0, duration: STEP_ENTER_DURATION_S, ease: 'power2.out' });
}
