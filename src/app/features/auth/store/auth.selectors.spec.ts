import { selectNetworkId, selectUserEmail } from './auth.selectors';

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

  describe('selectNetworkId', () => {
    it('returns the upn as-is when it is a bare network id', () => {
      expect(selectNetworkId({ upn: 'junedalam' })).toBe('junedalam');
    });

    it('strips the domain when upn is a full email address', () => {
      expect(selectNetworkId({ upn: 'junedalam@aramco.com' })).toBe('junedalam');
    });

    it('falls back to preferred_username, then unique_name, when upn is absent', () => {
      expect(selectNetworkId({ preferred_username: 'jalam' })).toBe('jalam');
      expect(selectNetworkId({ unique_name: 'jalam2' })).toBe('jalam2');
    });

    it('returns null when no identifying claim is present', () => {
      expect(selectNetworkId({})).toBeNull();
      expect(selectNetworkId(null)).toBeNull();
    });
  });
});
