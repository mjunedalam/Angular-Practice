import { inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { RbacState } from '@models/rbac/rbac.model';
import { Action } from '@models/rbac/role.constants';
import { SKIP_AUTO_LOGOUT } from '@interceptors/error.interceptor';

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
          patchState(store, { userPermissions: {}, isLoaded: true, error: response.message });
        } else {
          patchState(store, { userPermissions: response.data, isLoaded: true, error: null });
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load permissions';
        patchState(store, { userPermissions: {}, isLoaded: true, error: message });
      }
    },

    hasPermission(routeId: string, action: Action): boolean {
      return (store.userPermissions()[routeId] ?? []).includes(action);
    },

    reset(): void {
      patchState(store, initialState);
    },
  })),
);
