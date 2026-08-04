import gsap from 'gsap';

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Plays the timeline, or jumps straight to its end state when the user prefers reduced motion. */
export function playIfMotionAllowed(timeline: gsap.core.Timeline): gsap.core.Timeline {
  if (prefersReducedMotion()) {
    timeline.progress(1);
    return timeline;
  }
  timeline.play();
  return timeline;
}
