import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { AuthMetricsService } from 'src/app/core/services/auth-metrics.service';
import { JwtService } from 'src/app/core/services/jwt/jwt.service';
import { LoaderService } from 'src/app/shared/components/global-loader/loader.service';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { AuthState, initialState, LoginRequest, selectDisplayUsername, selectIsTokenExpired, selectLastLogin, selectUserEmail } from './auth.selectors';

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>(initialState),
  withComputed(({ token, user }) => ({
    isTokenExpired: computed(() => selectIsTokenExpired(token(), inject(JwtService))),
    displayUsername: computed(() => selectDisplayUsername(user())),
    userEmail: computed(() => selectUserEmail(user())),
    lastLogin: computed(() => selectLastLogin(user())),
  })),
  withMethods((
    store,
    http = inject(HttpClient),
    router = inject(Router),
    jwt = inject(JwtService),
    loading = inject(LoaderService),
    authMetricsService = inject(AuthMetricsService),
    extAppConfigService = inject(ExternalConfigService),
  ) => ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async login(credentials?: LoginRequest) {
      const authFlow = credentials ? 'CREDENTIALS' : 'SSO';
      loading.startLogin('Contacting identity service...');
      patchState(store, { isLoading: true, error: null });

      const recordLoginFailure = (failureReason: string, username?: string) => {
        authMetricsService.recordLoginAttempt({
          outcome: 'FAILURE',
          username,
          authFlow,
          failureReason,
        }).subscribe({
          error: (metricError) => console.warn('Login failure metric failed', metricError),
        });
      };

      const failLogin = (failureReason: string, username?: string) => {
        localStorage.removeItem('agwa_token');
        patchState(store, {
          ...initialState,
          error: 'Login Failed',
        });
        recordLoginFailure(failureReason, username ?? credentials?.username);
        loading.fail();
      };

      http.get(`${extAppConfigService.settings.tokenUrl}`, { responseType: 'text', withCredentials: true })
        .subscribe({
          next: (token) => {
            loading.setProgress(72);
            loading.setLoginMessage('Validating application session...');

            const normalizedToken = token.trim();
            if (!normalizedToken) {
              failLogin('TOKEN_MISSING_FROM_IDENTITY_SERVICE', credentials?.username);
              return;
            }

            let decoded: Record<string, unknown>;
            try {
              decoded = jwt.decode(normalizedToken) as Record<string, unknown>;
            } catch (error) {
              failLogin(describeTokenValidationFailure(error), credentials?.username);
              return;
            }

            const metricUsername = selectMetricUsername(decoded, credentials?.username);
            if (!metricUsername) {
              failLogin('TOKEN_MISSING_REQUIRED_CLAIMS', credentials?.username);
              return;
            }

            const prevLogin = localStorage.getItem('agwa_prev_login');
            const user = prevLogin ? { ...decoded, last_login: Number(prevLogin) } : decoded;

            patchState(store, { token: normalizedToken, isAuthenticated: true, user, isLoading: false });
            console.log('fetching token === ' + metricUsername);
            localStorage.setItem('agwa_token', normalizedToken);

            const finishLogin = () => {
              const prevStart = localStorage.getItem('agwa_session_start');
              if (prevStart) {
                localStorage.setItem('agwa_prev_login', prevStart);
              }
              localStorage.setItem('agwa_session_start', String(Math.floor(Date.now() / 1000)));
              loading.setProgress(96);
              void router.navigate(['main']).finally(() => loading.completeLogin());
            };

            loading.setLoginMessage('Finalizing session...');
            finishLogin();

            authMetricsService.recordLoginAttempt({
              outcome: 'SUCCESS',
              authFlow,
            }).subscribe({
              error: (error) => {
                console.warn('Login success metric failed', error);
              },
            });
          },
          error: (error) => {
            failLogin(describeLoginFailure(error), credentials?.username);
          },
        });
    },

    logout() {
      localStorage.removeItem('agwa_token');
      patchState(store, initialState);
      void router.navigate(['/login']);
    },

    // Token Refresh — called at app bootstrap via APP_INITIALIZER
    autoLogin() {
      const token = localStorage.getItem('agwa_token');

      if (token /* && !jwt.isExpired(token) */) {
        const decoded = jwt.decode(token);
        const prevLogin = localStorage.getItem('agwa_prev_login');
        const user = prevLogin ? { ...decoded, last_login: Number(prevLogin) } : decoded;
        patchState(store, { token, isAuthenticated: true, user, sessionExpired: false });
        return;
      }

      localStorage.removeItem('agwa_token');

      // If a token existed but is now expired, flag it so the guard can
      // redirect to login with a session-expired message.
      patchState(store, { ...initialState, sessionExpired: !!token });
    },
  })),
);

function selectMetricUsername(decoded: Record<string, unknown>, fallbackUsername?: string): string | undefined {
  const candidates = [decoded['upn'], decoded['preferred_username'], decoded['name'], decoded['sub'], fallbackUsername];

  for (const candidate of candidates) {
    if (typeof candidate === 'string' && candidate.trim()) {
      return candidate.trim();
    }
  }

  return undefined;
}

function describeTokenValidationFailure(error: unknown): string {
  if (error instanceof Error && error.message.trim()) {
    return `TOKEN_DECODE_FAILED:${error.message.trim()}`;
  }

  return 'TOKEN_DECODE_FAILED';
}


function describeLoginFailure(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const httpError = error as {
      status?: number;
      statusText?: string;
      message?: string;
      error?: unknown;
    };

    if (typeof httpError.error === 'string' && httpError.error.trim()) {
      return httpError.error.trim();
    }

    if (typeof httpError.message === 'string' && httpError.message.trim()) {
      return httpError.message.trim();
    }

    if (typeof httpError.status === 'number' && httpError.status > 0) {
      const statusText = typeof httpError.statusText === 'string' && httpError.statusText.trim()
        ? ` ${httpError.statusText.trim()}`
        : '';
      return `HTTP_${httpError.status}${statusText}`;
    }
  }

  return 'IDENTITY_SERVICE_REQUEST_FAILED';
}
