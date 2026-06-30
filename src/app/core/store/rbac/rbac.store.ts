import { inject } from '@angular/core';
import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { RbacState } from '@models/rbac/rbac.model';
import { Action } from '@models/rbac/role.constants';
import { SKIP_AUTO_LOGOUT } from '@interceptors/error.interceptor';

const PERMISSIONS_STALE_TTL_MS = 60_000;

interface PermissionsApiResponse {
  statusCode: number;
  error: boolean;
  message: string;
  data: Record<string, Action[]>;
}

const initialState: RbacState = {
  userPermissions: {},
  isLoaded: false,
  error: null,
  lastLoadedAt: null,
  loadedForToken: null,
};

export const RbacStore = signalStore(
  { providedIn: 'root' },
  withState<RbacState>(initialState),
  withMethods((store, http = inject(HttpClient)) => {
    const isStale = (): boolean => {
      const last = store.lastLoadedAt();
      return !last || (Date.now() - last) > PERMISSIONS_STALE_TTL_MS;
    };

    return {
      async loadPermissions(url: string, token: string | null = null): Promise<void> {
        try {
          const context = new HttpContext().set(SKIP_AUTO_LOGOUT, true);
          const response = await lastValueFrom(http.get<PermissionsApiResponse>(url, { context }));
          if (response.error) {
            patchState(store, { userPermissions: {}, isLoaded: true, error: response.message, lastLoadedAt: Date.now(), loadedForToken: token });
          } else {
            patchState(store, { userPermissions: response.data, isLoaded: true, error: null, lastLoadedAt: Date.now(), loadedForToken: token });
          }
        } catch (err) {
          const isAuthError = err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403);
          const message = err instanceof Error ? err.message : 'Failed to load permissions';
          patchState(store, { userPermissions: {}, isLoaded: true, error: message, lastLoadedAt: Date.now(), loadedForToken: token });
          if (isAuthError) throw err;
        }
      },

      hasPermission(routeId: string, action: Action): boolean {
        return (store.userPermissions()[routeId] ?? []).includes(action);
      },

      isStale,

      // True when the cached permissions were never loaded, are past TTL, OR
      // belong to a different token than the one passed in. The token check
      // closes the gap where the auth token is swapped (role change, devtools
      // tampering) mid-session: without it, a guard could keep trusting
      // permissions fetched under the OLD token for up to PERMISSIONS_STALE_TTL_MS.
      needsRefresh(currentToken: string | null): boolean {
        return isStale() || store.loadedForToken() !== currentToken;
      },

      reset(): void {
        patchState(store, initialState);
      },
    };
  }),
);
