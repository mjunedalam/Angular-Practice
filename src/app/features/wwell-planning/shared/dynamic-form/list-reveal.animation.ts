import gsap from 'gsap';

const LIST_REVEAL_STAGGER_S = 0.035;
const LIST_REVEAL_DURATION_S = 0.24;
const LIST_REVEAL_SLIDE_PX = 8;

/** Paused — caller decides when to play via `playIfMotionAllowed`. */
export function buildListRowsRevealTimeline(rows: readonly HTMLElement[]): gsap.core.Timeline {
  return gsap.timeline({ paused: true }).fromTo(
    rows,
    { opacity: 0, y: LIST_REVEAL_SLIDE_PX },
    { opacity: 1, y: 0, duration: LIST_REVEAL_DURATION_S, ease: 'power2.out', stagger: LIST_REVEAL_STAGGER_S },
  );
}
