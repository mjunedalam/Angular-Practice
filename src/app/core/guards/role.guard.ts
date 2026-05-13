import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthStore } from '../../features/auth/store/auth.store';
import { RbacStore } from '@store/rbac/rbac.store';
import { AccessDeniedComponent, type AccessDeniedData } from '@shared/components/access-denied/access-denied.component';

export const roleGuard: CanActivateFn = (route) => {
  const authStore = inject(AuthStore);
  const rbacStore = inject(RbacStore);
  const dialog    = inject(MatDialog);

  const routeId = route.data['routeId'] as string | undefined;
  if (!routeId) return true;

  // Role config failed to load (network error, 404, etc.)
  if (rbacStore.isLoaded() && rbacStore.roleDefinitions().length === 0) {
    dialog.open<AccessDeniedComponent, AccessDeniedData>(AccessDeniedComponent, {
      data: { routeId, userRoles: [], reason: 'rbac-unavailable', rbacError: rbacStore.error() ?? undefined },
      width: '420px',
    });
    return false;
  }

  const userRoles: string[] = authStore.user()?.groups ?? [];

  // Authenticated but token carries no group claims → stale token in localStorage.
  // The dialog will offer a logout button so the user can re-login and get a fresh token.
  if (userRoles.length === 0) {
    dialog.open<AccessDeniedComponent, AccessDeniedData>(AccessDeniedComponent, {
      data: { routeId, userRoles, reason: 'stale-session' },
      width: '420px',
    });
    return false;
  }

  if (rbacStore.canAccessRoute(routeId, userRoles)) {
    return true;
  }

  dialog.open<AccessDeniedComponent, AccessDeniedData>(AccessDeniedComponent, {
    data: { routeId, userRoles, reason: 'no-permission' },
    width: '420px',
  });

  return false;
};
