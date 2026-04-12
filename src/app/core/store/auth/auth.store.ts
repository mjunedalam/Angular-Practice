import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { JwtService } from 'src/app/core/services/jwt/jwt.service';
import { LoaderService } from 'src/app/shared/components/global-loader/loader.service';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { AuthState, initialState, LoginRequest, selectDisplayUsername, selectIsTokenExpired } from './auth.selectors';

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>(initialState),
  withComputed(({ token, user }) => ({
    isTokenExpired: computed(() => selectIsTokenExpired(token(), inject(JwtService))),
    displayUsername: computed(() => selectDisplayUsername(user())),
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
    async login(credentials: LoginRequest) {
      loading.startLogin('Contacting identity service...');
      patchState(store, { isLoading: true });

      http.get(`${extAppConfigService.settings.tokenUrl}`, { responseType: 'text', withCredentials: true })
        .subscribe({
          next: (token) => {
            loading.setProgress(72);
            loading.setLoginMessage('Session verified. Opening the application...');
            const decoded = jwt.decode(token);
            patchState(store, {
              token,
              isAuthenticated: true,
              user: decoded,
              isLoading: false,
            });
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

    // Token Refresh
    autoLogin() {
      const token = localStorage.getItem('agwa_token');

      if (token && !jwt.isExpired(token)) {
        patchState(store, {
          token,
          isAuthenticated: true,
          user: jwt.decode(token),
        });
        return;
      }

      localStorage.removeItem('agwa_token');
      patchState(store, initialState);
    },
  })),
);
