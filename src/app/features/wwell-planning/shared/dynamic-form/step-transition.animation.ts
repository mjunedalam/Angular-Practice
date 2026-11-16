import { MotionTimeline, createMotionTimeline } from './motion.util';

export type WwellStepDirection = 'forward' | 'backward';

const STEP_ENTER_DURATION_S = 0.32;
const STEP_SLIDE_PX = 24;

/** Fade + slide reveal for a stepper's active step content. Caller decides when to play via `playIfMotionAllowed`. */
export function buildStepTransitionTimeline(host: HTMLElement, direction: WwellStepDirection): MotionTimeline {
  const offset = direction === 'forward' ? STEP_SLIDE_PX : -STEP_SLIDE_PX;

  return createMotionTimeline([
    {
      targets: [host],
      from: { opacity: 0, x: offset },
      to: { opacity: 1, x: 0 },
      duration: STEP_ENTER_DURATION_S,
      ease: 'power2.out',
    },
  ]);
}
