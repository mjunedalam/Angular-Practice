/**
 * Tiny Web Animations API wrapper for the form/panel motion in this feature — opacity, translate,
 * scale and height tweens with eases, staggers and an on-complete hook. Replaces what GSAP was used
 * for here; builders return a `MotionTimeline` and callers hand it to `playIfMotionAllowed`.
 */

export type MotionEase = 'power1.out' | 'power1.in' | 'power2.out' | 'power2.in' | 'power3.out' | 'back.out';

// CSS equivalents of the matching GSAP eases (quad / cubic / quart / back).
const EASE_CSS: Readonly<Record<MotionEase, string>> = {
  'power1.out': 'cubic-bezier(0.5, 1, 0.89, 1)',
  'power1.in': 'cubic-bezier(0.11, 0, 0.5, 0)',
  'power2.out': 'cubic-bezier(0.33, 1, 0.68, 1)',
  'power2.in': 'cubic-bezier(0.32, 0, 0.67, 1)',
  'power3.out': 'cubic-bezier(0.25, 1, 0.5, 1)',
  'back.out': 'cubic-bezier(0.34, 1.8, 0.64, 1)',
};

const MS_PER_S = 1000;

export interface MotionProps {
  readonly opacity?: number;
  readonly x?: number;
  readonly y?: number;
  readonly scale?: number;
  /** Pixels, or `'auto'` to animate to/from the element's natural height. */
  readonly height?: number | 'auto';
  readonly transformOrigin?: string;
}

export interface MotionTween {
  readonly targets: readonly HTMLElement[];
  /** Omit for a "to" tween that starts from the element's current state. */
  readonly from?: MotionProps;
  readonly to: MotionProps;
  readonly duration: number;
  readonly ease: MotionEase;
  /** Seconds between each target's start. */
  readonly stagger?: number;
  /** Seconds from the timeline's start. */
  readonly at?: number;
}

export interface MotionTimeline {
  play(): void;
  /** Jumps every target to its end state and runs `onComplete`. */
  complete(): void;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Plays the timeline, or jumps straight to its end state when the user prefers reduced motion. */
export function playIfMotionAllowed(timeline: MotionTimeline): MotionTimeline {
  if (prefersReducedMotion()) {
    timeline.complete();
    return timeline;
  }
  timeline.play();
  return timeline;
}

/** Instantly pins an element's opacity/height (no tween). */
export function setMotionState(host: HTMLElement, props: Pick<MotionProps, 'opacity' | 'height'>): void {
  applyFinalStyles(host, props);
}

export function createMotionTimeline(tweens: readonly MotionTween[], onComplete?: () => void): MotionTimeline {
  let finished = false;
  const running = new Set<Animation>();

  const finish = (): void => {
    if (finished) return;
    finished = true;
    onComplete?.();
  };

  return {
    play(): void {
      const jobs = tweens.flatMap(tween => tween.targets.map((el, index) => ({ tween, el, index })));
      if (jobs.length === 0 || typeof jobs[0].el.animate !== 'function') {
        this.complete();
        return;
      }

      let remaining = jobs.length;
      jobs.forEach(({ tween, el, index }) => {
        const animation = el.animate(buildKeyframes(el, tween), {
          duration: tween.duration * MS_PER_S,
          delay: ((tween.at ?? 0) + index * (tween.stagger ?? 0)) * MS_PER_S,
          easing: EASE_CSS[tween.ease],
          fill: 'both',
        });
        running.add(animation);

        let settled = false;
        const settle = (): void => {
          if (settled) return;
          settled = true;
          running.delete(animation);
          // Commit the end state to inline styles first, then drop the animation's own fill.
          applyFinalStyles(el, tween.to);
          animation.cancel();
          remaining -= 1;
          if (remaining === 0) finish();
        };
        animation.onfinish = settle;
        animation.oncancel = settle;
      });
    },

    complete(): void {
      running.forEach(animation => {
        animation.oncancel = null;
        animation.onfinish = null;
        animation.cancel();
      });
      running.clear();
      tweens.forEach(tween => tween.targets.forEach(el => applyFinalStyles(el, tween.to)));
      finish();
    },
  };
}

function toTransform(props: MotionProps): string | null {
  if (props.x === undefined && props.y === undefined && props.scale === undefined) return null;
  return `translate(${props.x ?? 0}px, ${props.y ?? 0}px) scale(${props.scale ?? 1})`;
}

function measureAutoHeight(el: HTMLElement): number {
  const previous = el.style.height;
  el.style.height = 'auto';
  const height = el.offsetHeight;
  el.style.height = previous;
  return height;
}

function resolveHeight(el: HTMLElement, height: number | 'auto'): string {
  return `${height === 'auto' ? measureAutoHeight(el) : height}px`;
}

function toKeyframe(el: HTMLElement, props: MotionProps): Keyframe {
  const frame: Keyframe = {};
  if (props.opacity !== undefined) frame['opacity'] = props.opacity;
  const transform = toTransform(props);
  if (transform !== null) frame['transform'] = transform;
  if (props.height !== undefined) frame['height'] = resolveHeight(el, props.height);
  return frame;
}

function buildKeyframes(el: HTMLElement, tween: MotionTween): Keyframe[] {
  if (tween.from?.transformOrigin) el.style.transformOrigin = tween.from.transformOrigin;
  const to = toKeyframe(el, tween.to);
  // "to" tween with a height target: start from the current rendered height, since WAAPI can't interpolate from `auto`.
  const from = tween.from
    ? toKeyframe(el, tween.from)
    : tween.to.height !== undefined
      ? { height: `${el.offsetHeight}px` }
      : null;
  return from ? [from, to] : [to];
}

function applyFinalStyles(el: HTMLElement, props: MotionProps): void {
  if (props.opacity !== undefined) el.style.opacity = String(props.opacity);
  const transform = toTransform(props);
  if (transform !== null) el.style.transform = transform;
  if (props.height !== undefined) el.style.height = props.height === 'auto' ? 'auto' : `${props.height}px`;
}
