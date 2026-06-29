import { calcFlowProductivityIndex, calcPumpProductivityIndex } from './well-test-math.util';

describe('well-test-math.util', () => {
  describe('calcPumpProductivityIndex', () => {
    it('returns GPM/ft for valid inputs', () => {
      expect(calcPumpProductivityIndex(100, 150, 50)).toBeCloseTo(1.0);
    });

    it('returns null when drawdown is zero', () => {
      expect(calcPumpProductivityIndex(100, 50, 50)).toBeNull();
    });

    it('returns null when any input is null', () => {
      expect(calcPumpProductivityIndex(null, 150, 50)).toBeNull();
      expect(calcPumpProductivityIndex(100, null, 50)).toBeNull();
      expect(calcPumpProductivityIndex(100, 150, null)).toBeNull();
    });
  });

  describe('calcFlowProductivityIndex', () => {
    it('returns GPM/ft for valid inputs', () => {
      const result = calcFlowProductivityIndex(100, 200, 100);
      expect(result).not.toBeNull();
      expect(result!).toBeGreaterThan(0);
    });

    it('returns null when pressure difference is zero', () => {
      expect(calcFlowProductivityIndex(100, 100, 100)).toBeNull();
    });

    it('returns null when any input is null', () => {
      expect(calcFlowProductivityIndex(null, 200, 100)).toBeNull();
    });
  });
});
