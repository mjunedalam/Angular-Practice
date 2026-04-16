import { selectUserEmail } from './auth.selectors';

describe('auth.selectors', () => {
  describe('selectUserEmail', () => {
    it('appends gmail.com when the token upn is only a username', () => {
      expect(selectUserEmail({ upn: 'junedalam' })).toBe('junedalam@gmail.com');
    });

    it('uses the upn directly when it is already an email address', () => {
      expect(selectUserEmail({ upn: 'junedalam@gmail.com' })).toBe('junedalam@gmail.com');
    });

    it('returns null when upn is missing', () => {
      expect(selectUserEmail({})).toBeNull();
      expect(selectUserEmail(null)).toBeNull();
    });
  });
});
