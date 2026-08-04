import gsap from 'gsap';

const STEPS_REVEAL_STAGGER_S = 0.05;
const STEPS_REVEAL_DURATION_S = 0.26;
const STEPS_REVEAL_SLIDE_PX = 10;

/** Paused — caller decides when to play via `playIfMotionAllowed`. */
export function buildApprovalStepsRevealTimeline(items: readonly HTMLElement[]): gsap.core.Timeline {
  return gsap.timeline({ paused: true }).fromTo(
    items,
    { opacity: 0, y: STEPS_REVEAL_SLIDE_PX },
    { opacity: 1, y: 0, duration: STEPS_REVEAL_DURATION_S, ease: 'power2.out', stagger: STEPS_REVEAL_STAGGER_S },
  );
}
