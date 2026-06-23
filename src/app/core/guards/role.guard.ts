import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RbacStore } from '@store/rbac/rbac.store';
import { ACTIONS } from '@models/rbac/role.constants';

export const roleGuard: CanActivateFn = (route) => {
  const rbacStore = inject(RbacStore);
  const router    = inject(Router);

  const routeId = route.data?.['routeId'] as string | undefined;

  if (routeId && rbacStore.hasPermission(routeId, ACTIONS.READ)) {
    return true;
  }

  return router.createUrlTree(['/main/home']);
};
