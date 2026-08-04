import gsap from 'gsap';

const DETAIL_REVEAL_DURATION_S = 0.28;
const DETAIL_SLIDE_PX = 12;

/** Fade + slide-up reveal for a master-detail panel when the selected record changes. Paused — caller decides when to play. */
export function buildDetailRevealTimeline(host: HTMLElement): gsap.core.Timeline {
  return gsap
    .timeline({ paused: true })
    .fromTo(
      host,
      { opacity: 0, y: DETAIL_SLIDE_PX },
      { opacity: 1, y: 0, duration: DETAIL_REVEAL_DURATION_S, ease: 'power2.out' },
    );
}
