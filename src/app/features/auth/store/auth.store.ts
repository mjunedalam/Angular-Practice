import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

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
    extAppConfigService = inject(ExternalConfigService),
  ) => ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async login(credentials?: LoginRequest) {
      loading.startLogin('Contacting identity service...');
      patchState(store, { isLoading: true });

      http.get(`${extAppConfigService.settings.tokenUrl}`, { responseType: 'text', withCredentials: true })
        .subscribe({
          next: (token) => {
            loading.setProgress(72);
            loading.setLoginMessage('Session verified. Opening the application...');
            const decoded = jwt.decode(token);

            // Promote the previous session start → "last login" displayed next time
            const prevStart = localStorage.getItem('agwa_session_start');
            if (prevStart) localStorage.setItem('agwa_prev_login', prevStart);
            localStorage.setItem('agwa_session_start', String(Math.floor(Date.now() / 1000)));

            const prevLogin = localStorage.getItem('agwa_prev_login');
            const user = prevLogin ? { ...decoded, last_login: Number(prevLogin) } : decoded;

            patchState(store, { token, isAuthenticated: true, user, isLoading: false });
            console.log('fetching token === ' + decoded.upn);
            localStorage.setItem('agwa_token', token);
            loading.setProgress(96);
            void router.navigate(['main']).finally(() => loading.completeLogin());
          },
          error: () => {
            patchState(store, {
              error: 'Login Failed',
              isLoading: false,
            });
            loading.fail();
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
