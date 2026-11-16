import { createMotionTimeline, playIfMotionAllowed, setMotionState } from './motion.util';

describe('motion.util', () => {
  afterEach(() => jest.restoreAllMocks());

  it('jumps to the end state and runs onComplete once when completed', () => {
    const el = document.createElement('div');
    const onComplete = jest.fn();
    const timeline = createMotionTimeline(
      [{ targets: [el], from: { opacity: 0, y: 10 }, to: { opacity: 1, y: 0 }, duration: 0.3, ease: 'power2.out' }],
      onComplete,
    );

    timeline.complete();
    timeline.complete();

    expect(el.style.opacity).toBe('1');
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('falls back to the end state when the Web Animations API is unavailable (jsdom)', () => {
    const el = document.createElement('div');
    const onComplete = jest.fn();
    playIfMotionAllowed(
      createMotionTimeline([{ targets: [el], to: { opacity: 0, height: 0 }, duration: 0.2, ease: 'power2.in' }], onComplete),
    );

    expect(el.style.opacity).toBe('0');
    expect(el.style.height).toBe('0px');
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('pins opacity and height instantly', () => {
    const el = document.createElement('div');
    setMotionState(el, { opacity: 1, height: 'auto' });
    expect(el.style.height).toBe('auto');
  });
});
