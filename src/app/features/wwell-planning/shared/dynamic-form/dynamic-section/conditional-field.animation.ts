import gsap from 'gsap';

const FIELD_ENTER_DURATION_S = 0.26;
const FIELD_EXIT_DURATION_S = 0.2;

/** Instantly pins a conditional field to its resting shown/hidden state — no tween (used on first render). */
export function setConditionalFieldVisibility(host: HTMLElement, visible: boolean): void {
  gsap.set(host, { opacity: visible ? 1 : 0, height: visible ? 'auto' : 0 });
}

/** Paused — caller decides when to play via `playIfMotionAllowed`. */
export function buildConditionalFieldEnterTimeline(host: HTMLElement): gsap.core.Timeline {
  return gsap
    .timeline({ paused: true })
    .fromTo(
      host,
      { opacity: 0, height: 0 },
      { opacity: 1, height: 'auto', duration: FIELD_ENTER_DURATION_S, ease: 'power2.out' },
    );
}

/** Runs `onComplete` (disabling + resetting the control) only once the exit animation finishes. */
export function buildConditionalFieldExitTimeline(host: HTMLElement, onComplete: () => void): gsap.core.Timeline {
  return gsap
    .timeline({ paused: true, onComplete })
    .to(host, { opacity: 0, height: 0, duration: FIELD_EXIT_DURATION_S, ease: 'power2.in' });
}
