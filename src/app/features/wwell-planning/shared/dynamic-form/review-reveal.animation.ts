import { MotionTimeline, createMotionTimeline } from './motion.util';

const REVEAL_STAGGER_S = 0.06;
const REVEAL_DURATION_S = 0.32;
const REVEAL_SLIDE_PX = 16;

/** Caller decides when to play via `playIfMotionAllowed`. Plays once, on first arrival at the review step. */
export function buildReviewRevealTimeline(cards: readonly HTMLElement[]): MotionTimeline {
  return createMotionTimeline([
    {
      targets: cards,
      from: { opacity: 0, y: REVEAL_SLIDE_PX },
      to: { opacity: 1, y: 0 },
      duration: REVEAL_DURATION_S,
      ease: 'power2.out',
      stagger: REVEAL_STAGGER_S,
    },
  ]);
}
