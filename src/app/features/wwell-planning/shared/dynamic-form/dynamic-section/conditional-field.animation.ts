import { MotionTimeline, createMotionTimeline, setMotionState } from '../motion.util';

const FIELD_ENTER_DURATION_S = 0.26;
const FIELD_EXIT_DURATION_S = 0.2;

/** Instantly pins a conditional field to its resting shown/hidden state — no tween (used on first render). */
export function setConditionalFieldVisibility(host: HTMLElement, visible: boolean): void {
  setMotionState(host, { opacity: visible ? 1 : 0, height: visible ? 'auto' : 0 });
}

/** Caller decides when to play via `playIfMotionAllowed`. */
export function buildConditionalFieldEnterTimeline(host: HTMLElement): MotionTimeline {
  return createMotionTimeline([
    {
      targets: [host],
      from: { opacity: 0, height: 0 },
      to: { opacity: 1, height: 'auto' },
      duration: FIELD_ENTER_DURATION_S,
      ease: 'power2.out',
    },
  ]);
}

/** Runs `onComplete` (disabling + resetting the control) only once the exit animation finishes. */
export function buildConditionalFieldExitTimeline(host: HTMLElement, onComplete: () => void): MotionTimeline {
  return createMotionTimeline(
    [{ targets: [host], to: { opacity: 0, height: 0 }, duration: FIELD_EXIT_DURATION_S, ease: 'power2.in' }],
    onComplete,
  );
}
