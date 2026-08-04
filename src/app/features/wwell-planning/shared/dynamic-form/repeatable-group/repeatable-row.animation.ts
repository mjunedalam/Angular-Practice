import gsap from 'gsap';

const ROW_ENTER_DURATION_S = 0.28;
const ROW_EXIT_DURATION_S = 0.22;

/** Paused — caller decides when to play via `playIfMotionAllowed`. */
export function buildRowEnterTimeline(row: HTMLElement): gsap.core.Timeline {
  return gsap
    .timeline({ paused: true })
    .fromTo(row, { opacity: 0, height: 0 }, { opacity: 1, height: 'auto', duration: ROW_ENTER_DURATION_S, ease: 'power2.out' });
}

/** Runs `onComplete` (the actual `FormArray.removeAt`) only once the exit animation finishes. */
export function buildRowExitTimeline(row: HTMLElement, onComplete: () => void): gsap.core.Timeline {
  return gsap
    .timeline({ paused: true, onComplete })
    .to(row, { opacity: 0, height: 0, duration: ROW_EXIT_DURATION_S, ease: 'power2.in' });
}
