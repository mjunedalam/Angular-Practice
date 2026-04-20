import { selectUserEmail } from './auth.selectors';

describe('auth.selectors', () => {
  describe('selectUserEmail', () => {
    it('appends aramco.com when the token upn is only a username', () => {
      expect(selectUserEmail({ upn: 'junedalam' })).toBe('junedalam@aramco.com');
    });

    it('uses the upn directly when it is already an email address', () => {
      expect(selectUserEmail({ upn: 'junedalam@aramco.com' })).toBe('junedalam@aramco.com');
    });

    it('returns null when upn is missing', () => {
      expect(selectUserEmail({})).toBeNull();
      expect(selectUserEmail(null)).toBeNull();
    });
  });
});
