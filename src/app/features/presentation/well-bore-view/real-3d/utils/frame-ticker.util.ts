/** Per-frame callback: `deltaTime` is the milliseconds since the previous frame. */
export type FrameCallback = (time: number, deltaTime: number) => void;

/** A gap longer than this (tab was hidden, thread stalled) is treated as one normal frame, so the camera doesn't jump. */
const LAG_THRESHOLD_MS = 500;
const LAG_ADJUSTED_MS = 33;

const callbacks = new Set<FrameCallback>();
let frameHandle: number | null = null;
let lastTime = 0;

function tick(now: number): void {
  const gap = now - lastTime;
  const deltaTime = gap > LAG_THRESHOLD_MS ? LAG_ADJUSTED_MS : gap;
  lastTime = now;

  // Copied so a callback can remove itself (or another) mid-frame without skipping its neighbour.
  [...callbacks].forEach(callback => {
    if (callbacks.has(callback)) callback(now, deltaTime);
  });

  frameHandle = callbacks.size > 0 ? requestAnimationFrame(tick) : null;
}

/** One shared `requestAnimationFrame` loop; callbacks run in the order they were added. */
export const frameTicker = {
  add(callback: FrameCallback): void {
    callbacks.add(callback);
    if (frameHandle !== null) return;
    lastTime = performance.now();
    frameHandle = requestAnimationFrame(tick);
  },

  remove(callback: FrameCallback): void {
    callbacks.delete(callback);
    if (callbacks.size === 0 && frameHandle !== null) {
      cancelAnimationFrame(frameHandle);
      frameHandle = null;
    }
  },
};
