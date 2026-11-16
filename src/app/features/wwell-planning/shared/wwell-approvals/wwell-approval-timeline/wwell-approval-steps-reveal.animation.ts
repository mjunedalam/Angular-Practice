import { MotionTimeline, MotionTween, createMotionTimeline } from '../../dynamic-form/motion.util';

const STEPS_REVEAL_STAGGER_S = 0.07;
const STEPS_REVEAL_DURATION_S = 0.3;
const STEPS_REVEAL_SLIDE_PX = 12;
const NODE_REVEAL_DURATION_S = 0.32;
const NODE_SCALE_FROM = 0.5;

/**
 * Caller decides when to play via `playIfMotionAllowed`. Steps fade/slide in on
 * the same stagger as before; each step's node circle additionally pops in from a smaller
 * scale on a slight overlap (starting as the last step's reveal begins) so the rail reads as "lighting up" step by step
 * rather than the whole card just fading in at once.
 */
export function buildApprovalStepsRevealTimeline(items: readonly HTMLElement[]): MotionTimeline {
  const tweens: MotionTween[] = [
    {
      targets: items,
      from: { opacity: 0, y: STEPS_REVEAL_SLIDE_PX },
      to: { opacity: 1, y: 0 },
      duration: STEPS_REVEAL_DURATION_S,
      ease: 'power3.out',
      stagger: STEPS_REVEAL_STAGGER_S,
    },
  ];

  const nodes = items
    .map(item => item.querySelector<HTMLElement>('.approval-timeline__node'))
    .filter((node): node is HTMLElement => node !== null);

  if (nodes.length) {
    const stepsRevealEnd = STEPS_REVEAL_DURATION_S + STEPS_REVEAL_STAGGER_S * (items.length - 1);
    tweens.push({
      targets: nodes,
      from: { scale: NODE_SCALE_FROM },
      to: { scale: 1 },
      duration: NODE_REVEAL_DURATION_S,
      ease: 'back.out',
      stagger: STEPS_REVEAL_STAGGER_S,
      at: stepsRevealEnd - STEPS_REVEAL_DURATION_S,
    });
  }

  return createMotionTimeline(tweens);
}
