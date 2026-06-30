import { computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';

import { JwtService } from 'src/app/core/services/jwt/jwt.service';
import { LoaderService } from 'src/app/shared/components/global-loader/loader.service';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { RbacStore } from '@store/rbac/rbac.store';
import { AuthState, initialState, selectDisplayUsername, selectIsTokenExpired, selectLastLogin, selectUserEmail } from './auth.selectors';

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
    rbacStore = inject(RbacStore),
  ) => ({
    async login() {
      loading.startLogin('Contacting identity service...');
      patchState(store, { isLoading: true, error: null });

      http.get(`${extAppConfigService.settings.tokenUrl}`, { responseType: 'text', withCredentials: true })
        .subscribe({
          next: async (token) => {
            const normalizedToken = token.trim();
            const decoded = jwt.decode(normalizedToken) as Record<string, unknown>;
            localStorage.setItem('agwa_token', normalizedToken);
            patchState(store, { token: normalizedToken, isAuthenticated: true, user: decoded, isLoading: false });
            const baseUrl = extAppConfigService.settings.dailyOperationServiceUrl;
            await rbacStore.loadPermissions(`${baseUrl}/daily-operations/api/v1/rbac/permissions`, normalizedToken);
            void router.navigate(['main']).finally(() => loading.completeLogin());
          },
          error: () => {
            localStorage.removeItem('agwa_token');
            patchState(store, { ...initialState, error: 'Login Failed' });
            loading.fail();
          },
        });
    },

    logout() {
      localStorage.removeItem('agwa_token');
      patchState(store, initialState);
      rbacStore.reset();
      void router.navigate(['/login']);
    },

    // Token Refresh — called at app bootstrap via APP_INITIALIZER
    autoLogin() {
      const token = localStorage.getItem('agwa_token');

      if (token && !jwt.isExpired(token)) {
        const decoded = jwt.decode(token);
        patchState(store, { token, isAuthenticated: true, user: decoded, sessionExpired: false });
        return;
      }

      localStorage.removeItem('agwa_token');

      // If a token existed but is now expired, flag it so the guard can
      // redirect to login with a session-expired message.
      patchState(store, { ...initialState, sessionExpired: !!token });
    },
  })),
);

