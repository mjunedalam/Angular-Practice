import { MotionTimeline, createMotionTimeline } from '../motion.util';

const ROW_ENTER_DURATION_S = 0.28;
const ROW_EXIT_DURATION_S = 0.22;

/** Caller decides when to play via `playIfMotionAllowed`. */
export function buildRowEnterTimeline(row: HTMLElement): MotionTimeline {
  return createMotionTimeline([
    {
      targets: [row],
      from: { opacity: 0, height: 0 },
      to: { opacity: 1, height: 'auto' },
      duration: ROW_ENTER_DURATION_S,
      ease: 'power2.out',
    },
  ]);
}

/** Runs `onComplete` (the actual `FormArray.removeAt`) only once the exit animation finishes. */
export function buildRowExitTimeline(row: HTMLElement, onComplete: () => void): MotionTimeline {
  return createMotionTimeline(
    [{ targets: [row], to: { opacity: 0, height: 0 }, duration: ROW_EXIT_DURATION_S, ease: 'power2.in' }],
    onComplete,
  );
}
