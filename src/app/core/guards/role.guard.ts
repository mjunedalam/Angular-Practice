import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../features/auth/store/auth.store';
import { RbacStore } from '@store/rbac/rbac.store';

export const roleGuard: CanActivateFn = (route) => {
  const authStore = inject(AuthStore);
  const rbacStore = inject(RbacStore);
  const router    = inject(Router);

  const routeId = route.data['routeId'] as string | undefined;
  if (!routeId) return true;

  if (rbacStore.isLoaded() && rbacStore.roleDefinitions().length === 0) {
    return router.parseUrl('/main/home');
  }

  const userRoles: string[] = authStore.user()?.groups ?? [];

  if (userRoles.length === 0) {
    return router.parseUrl('/main/home');
  }

  if (rbacStore.canAccessRoute(routeId, userRoles)) {
    return true;
  }

  return router.parseUrl('/main/home');
};
