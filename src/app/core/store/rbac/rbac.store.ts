import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { RbacConfig, RbacState } from '@models/rbac/rbac.model';

const initialState: RbacState = {
  roleDefinitions: [],
  isLoaded: false,
  error: null,
};

export const RbacStore = signalStore(
  { providedIn: 'root' },
  withState<RbacState>(initialState),
  withMethods((store, http = inject(HttpClient)) => ({
    async loadRoles(url: string): Promise<void> {
      try {
        const config = await lastValueFrom(http.get<RbacConfig>(url));
        patchState(store, { roleDefinitions: config.roles, isLoaded: true, error: null });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load role definitions';
        patchState(store, { roleDefinitions: [], isLoaded: true, error: message });
      }
    },

    canAccessRoute(_routeId: string, _userRoles: string[]): boolean {
      return true;
    },

    canUpdateRoute(_routeId: string, _userRoles: string[]): boolean {
      return true;
    },
  })),
);
