import gsap from 'gsap';

const STEPS_REVEAL_STAGGER_S = 0.07;
const STEPS_REVEAL_DURATION_S = 0.3;
const STEPS_REVEAL_SLIDE_PX = 12;
const NODE_REVEAL_DURATION_S = 0.32;
const NODE_SCALE_FROM = 0.5;

/**
 * Paused — caller decides when to play via `playIfMotionAllowed`. Steps fade/slide in on
 * the same stagger as before; each step's node circle additionally pops in from a smaller
 * scale on a slight overlap (`-=` offset) so the rail reads as "lighting up" step by step
 * rather than the whole card just fading in at once.
 */
export function buildApprovalStepsRevealTimeline(items: readonly HTMLElement[]): gsap.core.Timeline {
  const timeline = gsap.timeline({ paused: true }).fromTo(
    items,
    { opacity: 0, y: STEPS_REVEAL_SLIDE_PX },
    { opacity: 1, y: 0, duration: STEPS_REVEAL_DURATION_S, ease: 'power3.out', stagger: STEPS_REVEAL_STAGGER_S },
  );

  const nodes = items
    .map(item => item.querySelector<HTMLElement>('.approval-timeline__node'))
    .filter((node): node is HTMLElement => node !== null);

  if (nodes.length) {
    timeline.fromTo(
      nodes,
      { scale: NODE_SCALE_FROM },
      { scale: 1, duration: NODE_REVEAL_DURATION_S, ease: 'back.out(2.2)', stagger: STEPS_REVEAL_STAGGER_S },
      `-=${STEPS_REVEAL_DURATION_S}`,
    );
  }

  return timeline;
}
