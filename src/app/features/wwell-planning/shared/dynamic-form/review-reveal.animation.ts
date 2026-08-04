import gsap from 'gsap';

const REVEAL_STAGGER_S = 0.06;
const REVEAL_DURATION_S = 0.32;

/** Paused — caller decides when to play via `playIfMotionAllowed`. Plays once, on first arrival at the review step. */
export function buildReviewRevealTimeline(cards: readonly HTMLElement[]): gsap.core.Timeline {
  return gsap.timeline({ paused: true }).fromTo(
    cards,
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: REVEAL_DURATION_S, ease: 'power2.out', stagger: REVEAL_STAGGER_S },
  );
}
