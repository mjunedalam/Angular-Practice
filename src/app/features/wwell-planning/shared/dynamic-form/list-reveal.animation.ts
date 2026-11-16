import { MotionTimeline, createMotionTimeline } from './motion.util';

const LIST_REVEAL_STAGGER_S = 0.045;
const LIST_REVEAL_DURATION_S = 0.3;
const LIST_REVEAL_SLIDE_PX = 10;

/** Caller decides when to play via `playIfMotionAllowed`. */
export function buildListRowsRevealTimeline(rows: readonly HTMLElement[]): MotionTimeline {
  return createMotionTimeline([
    {
      targets: rows,
      from: { opacity: 0, y: LIST_REVEAL_SLIDE_PX },
      to: { opacity: 1, y: 0 },
      duration: LIST_REVEAL_DURATION_S,
      ease: 'power3.out',
      stagger: LIST_REVEAL_STAGGER_S,
    },
  ]);
}
