import { AuthUser } from '../app/features/auth/store/auth.selectors';

const BASE_CLAIMS: Omit<AuthUser, 'groups'> = {
  sub: 'Authentication Token',
  upn: 'ALAMMX1O',
  exp: 2051222400,
  jti: '00000081 51JQH2R2YGPO',
  aud: 'AGWA',
  last_login: 1778731201,
  iat: 1780434145,
  iss: 'https://ocpa.enp.aramco.com.sa/',
};

export const MOCK_TOKENS = {
  // Single-role scenarios
  ADMIN_ONLY: {
    ...BASE_CLAIMS,
    groups: ['GWD_admin'],
  } satisfies AuthUser,

  MEMBER_ONLY: {
    ...BASE_CLAIMS,
    groups: ['GWD_member'],
  } satisfies AuthUser,

  CLIENT_ONLY: {
    ...BASE_CLAIMS,
    groups: ['GWD_client'],
  } satisfies AuthUser,

  // Multi-role scenarios
  MEMBER_AND_ADMIN: {
    ...BASE_CLAIMS,
    groups: ['GWD_member', 'GWD_admin'],
  } satisfies AuthUser,

  CLIENT_AND_MEMBER: {
    ...BASE_CLAIMS,
    groups: ['GWD_client', 'GWD_member'],
  } satisfies AuthUser,

  ALL_ROLES: {
    ...BASE_CLAIMS,
    groups: ['GWD_client', 'GWD_member', 'GWD_admin'],
  } satisfies AuthUser,

  // Edge cases
  UNKNOWN_ROLE: {
    ...BASE_CLAIMS,
    groups: ['FAKE_role', 'UNKNOWN_group'],
  } satisfies AuthUser,

  MIXED_KNOWN_AND_UNKNOWN: {
    ...BASE_CLAIMS,
    groups: ['GWD_member', 'FAKE_role'],
  } satisfies AuthUser,

  NO_GROUPS: {
    ...BASE_CLAIMS,
    groups: [],
  } satisfies AuthUser,

  NO_GROUPS_FIELD: {
    ...BASE_CLAIMS,
  } satisfies AuthUser,
} as const;
