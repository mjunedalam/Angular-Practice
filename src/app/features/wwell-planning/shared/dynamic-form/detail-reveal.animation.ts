import { MotionTimeline, createMotionTimeline } from './motion.util';

const DETAIL_REVEAL_DURATION_S = 0.34;
const DETAIL_SLIDE_PX = 14;
const DETAIL_SCALE_FROM = 0.985;

/** Fade + slide-up + subtle scale-in reveal for a master-detail panel when the selected
 * record changes. Caller decides when to play via `playIfMotionAllowed`. */
export function buildDetailRevealTimeline(host: HTMLElement): MotionTimeline {
  return createMotionTimeline([
    {
      targets: [host],
      from: { opacity: 0, y: DETAIL_SLIDE_PX, scale: DETAIL_SCALE_FROM, transformOrigin: 'top center' },
      to: { opacity: 1, y: 0, scale: 1 },
      duration: DETAIL_REVEAL_DURATION_S,
      ease: 'power3.out',
    },
  ]);
}
