import { deriveStatusLabel, normalizeStatusName } from './active-wwell.helpers';

describe('active-wwell.helpers', () => {
  describe('normalizeStatusName', () => {
    it('trims leading/trailing whitespace', () => {
      expect(normalizeStatusName('  Drilling  ')).toBe('Drilling');
    });

    it('collapses multiple spaces into one', () => {
      expect(normalizeStatusName('Rig  Operation')).toBe('Rig Operation');
    });
  });

  describe('deriveStatusLabel', () => {
    it('returns N/A for null details', () => {
      expect(deriveStatusLabel(null)).toBe('N/A');
    });

    it('returns Active when rigStateCode is A', () => {
      const details = {
        RIG_IDENTIFICATION: [{ wRigActStsCd: 'A' }],
      } as never;
      expect(deriveStatusLabel(details)).toBe('Active');
    });

    it('returns Inactive when rigStateCode is I', () => {
      const details = {
        RIG_IDENTIFICATION: [{ wRigActStsCd: 'I' }],
      } as never;
      expect(deriveStatusLabel(details)).toBe('Inactive');
    });

    it('returns Active when drilling depth is positive', () => {
      const details = {
        DRLG_OP_STATUS: [{ wPrsntDpth: 500 }],
      } as never;
      expect(deriveStatusLabel(details)).toBe('Active');
    });
  });
});
