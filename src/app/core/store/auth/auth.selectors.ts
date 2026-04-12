import { JwtService } from 'src/app/core/services/jwt/jwt.service';

export interface AuthUser {
  readonly upn?: string;
  readonly name?: string;
  readonly preferred_username?: string;
  readonly unique_name?: string;
  readonly exp?: number;
  readonly roles?: string[];
  readonly [key: string]: unknown;
}

export interface LoginRequest {
  readonly username: string;
  readonly password: string;
}

export interface AuthState {
  readonly token: string | null;
  readonly isAuthenticated: boolean;
  readonly user: AuthUser | null;
  readonly isLoading: boolean;
  readonly error: string | null;
}

export const initialState: AuthState = {
  token: null,
  isAuthenticated: false,
  user: null,
  isLoading: false,
  error: null,
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
