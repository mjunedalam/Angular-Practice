import {
  buildCasingPath,
  buildDepthTicks,
  computeCasingHalfWidth,
  createDepthScale,
  pickTickInterval,
  sortCasingsByDepthDesc,
} from './wellbore-math.util';

describe('wellbore-math.util', () => {
  describe('createDepthScale', () => {
    it('maps 0 to 0 and totalDepth to drawingHeight', () => {
      const scale = createDepthScale(1000, 500);
      expect(scale(0)).toBe(0);
      expect(scale(1000)).toBe(500);
    });
  });

  describe('pickTickInterval', () => {
    it('returns 100 for depth <= 2000', () => {
      expect(pickTickInterval(1500)).toBe(100);
    });

    it('returns 200 for depth between 2001 and 3000', () => {
      expect(pickTickInterval(2500)).toBe(200);
    });

    it('returns 500 for depth > 3000', () => {
      expect(pickTickInterval(5000)).toBe(500);
    });
  });

  describe('buildDepthTicks', () => {
    it('builds ticks from 0 to totalDepth inclusive', () => {
      const ticks = buildDepthTicks(1000, 500);
      expect(ticks).toEqual([0, 500, 1000]);
    });
  });

  describe('sortCasingsByDepthDesc', () => {
    it('sorts casings by depth descending', () => {
      const casings = [
        { csgDepth: 100 },
        { csgDepth: 500 },
        { csgDepth: 200 },
      ] as never[];
      const sorted = sortCasingsByDepthDesc(casings);
      expect(sorted[0].csgDepth).toBe(500);
      expect(sorted[2].csgDepth).toBe(100);
    });
  });

  describe('computeCasingHalfWidth', () => {
    it('computes base + index * increment', () => {
      expect(computeCasingHalfWidth(2, 10, 5)).toBe(20);
    });
  });

  describe('buildCasingPath', () => {
    it('returns a non-empty SVG path string', () => {
      const path = buildCasingPath(50, 10, 0, 100, 10);
      expect(typeof path).toBe('string');
      expect(path.startsWith('M')).toBe(true);
    });
  });
});
