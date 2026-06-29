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
};

export const RbacStore = signalStore(
  { providedIn: 'root' },
  withState<RbacState>(initialState),
  withMethods((store, http = inject(HttpClient)) => ({
    async loadPermissions(url: string): Promise<void> {
      try {
        const context = new HttpContext().set(SKIP_AUTO_LOGOUT, true);
        const response = await lastValueFrom(http.get<PermissionsApiResponse>(url, { context }));
        if (response.error) {
          patchState(store, { userPermissions: {}, isLoaded: true, error: response.message, lastLoadedAt: Date.now() });
        } else {
          patchState(store, { userPermissions: response.data, isLoaded: true, error: null, lastLoadedAt: Date.now() });
        }
      } catch (err) {
        const isAuthError = err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403);
        const message = err instanceof Error ? err.message : 'Failed to load permissions';
        patchState(store, { userPermissions: {}, isLoaded: true, error: message, lastLoadedAt: Date.now() });
        if (isAuthError) throw err;
      }
    },

    hasPermission(routeId: string, action: Action): boolean {
      return (store.userPermissions()[routeId] ?? []).includes(action);
    },

    isStale(): boolean {
      const last = store.lastLoadedAt();
      return !last || (Date.now() - last) > PERMISSIONS_STALE_TTL_MS;
    },

    reset(): void {
      patchState(store, initialState);
    },
  })),
);
