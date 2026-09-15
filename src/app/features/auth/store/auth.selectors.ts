import { JwtService } from 'src/app/core/services/jwt/jwt.service';

export interface AuthUser {
  readonly upn?: string;
  readonly name?: string;
  readonly preferred_username?: string;
  readonly unique_name?: string;
  readonly exp?: number;
  readonly last_login?: number | string;
  readonly groups?: string[];
  readonly [key: string]: unknown;
}

export interface AuthState {
  readonly token: string | null;
  readonly isAuthenticated: boolean;
  readonly user: AuthUser | null;
  readonly isLoading: boolean;
  readonly error: string | null;
  readonly sessionExpired: boolean;
}

export const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
  sessionExpired: false,
};

export function selectIsTokenExpired(token: string | null, jwt: JwtService): boolean {
  return token ? jwt.isExpired(token) : true;
}

export function selectDisplayUsername(user: AuthUser | null): string {
  if (!user) return 'User';

  const username =
    user.name ||
    user.preferred_username ||
    user.upn ||
    user.unique_name;

  return typeof username === 'string' && username.trim().length > 0
    ? username.trim()
    : 'User';
}

export function selectLastLogin(user: AuthUser | null): Date | null {
  const ts = user?.last_login;
  if (!ts) return null;
  // JWT timestamps are Unix seconds; multiply to get ms for the Date constructor
  return new Date(Number(ts) * 1000);
}

/** The bare network ID (e.g. "junedalam"), stripped of the "@aramco.com" domain `upn` sometimes
 *  carries — see selectUserEmail's own doc comment on that inconsistency. Falls back to
 *  preferred_username/unique_name for tokens that don't carry a upn claim at all. */
export function selectNetworkId(user: AuthUser | null): string | null {
  const identifier = user?.upn ?? user?.preferred_username ?? user?.unique_name;

  if (typeof identifier !== 'string') return null;

  const trimmed = identifier.trim();
  if (!trimmed) return null;

  return trimmed.includes('@') ? trimmed.split('@')[0] : trimmed;
}

export function selectUserEmail(user: AuthUser | null): string | null {
  const upn = user?.upn;

  if (typeof upn !== 'string') {
    return null;
  }

  const normalizedUpn = upn.trim();

  if (!normalizedUpn) {
    return null;
  }

  return normalizedUpn.includes('@')
    ? normalizedUpn
    : `${normalizedUpn}@aramco.com`;
}
