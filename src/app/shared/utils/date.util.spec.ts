import {
  addDays,
  formatDateDisplay,
  formatDateForInput,
  isToday,
  parseDateFromInput,
} from './date.util';

describe('date.util', () => {
  describe('formatDateForInput', () => {
    it('formats date as YYYY-MM-DD', () => {
      expect(formatDateForInput(new Date(2024, 0, 5))).toBe('2024-01-05');
    });

    it('returns empty string for falsy input', () => {
      expect(formatDateForInput(null as unknown as Date)).toBe('');
    });
  });

  describe('parseDateFromInput', () => {
    it('parses YYYY-MM-DD string to date at midnight', () => {
      const d = parseDateFromInput('2024-03-15');
      expect(d.getFullYear()).toBe(2024);
      expect(d.getMonth()).toBe(2);
      expect(d.getDate()).toBe(15);
    });

    it('returns current date for empty string', () => {
      const before = Date.now();
      const d = parseDateFromInput('');
      expect(d.getTime()).toBeGreaterThanOrEqual(before - 100);
    });
  });

  describe('formatDateDisplay', () => {
    it('formats date to human-readable string', () => {
      const result = formatDateDisplay(new Date(2024, 0, 15));
      expect(result).toContain('2024');
      expect(result).toContain('15');
    });

    it('returns empty string for falsy input', () => {
      expect(formatDateDisplay(null as unknown as Date)).toBe('');
    });
  });

  describe('isToday', () => {
    it('returns true for today', () => {
      expect(isToday(new Date())).toBe(true);
    });

    it('returns false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe('addDays', () => {
    it('adds positive days', () => {
      const base = new Date(2024, 0, 1);
      const result = addDays(base, 5);
      expect(result.getDate()).toBe(6);
    });

    it('subtracts days when negative', () => {
      const base = new Date(2024, 0, 10);
      const result = addDays(base, -3);
      expect(result.getDate()).toBe(7);
    });
  });
});
