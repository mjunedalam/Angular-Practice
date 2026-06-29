import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { RbacStore } from '@store/rbac/rbac.store';
import { AuthStore } from '../../features/auth/store/auth.store';
import { ExternalConfigService } from '@shared/services/external-config.service';
import { ACTIONS } from '@models/rbac/role.constants';

export const roleGuard: CanActivateFn = async (route) => {
  const rbacStore = inject(RbacStore);
  const authStore = inject(AuthStore);
  const router    = inject(Router);
  const extConfig = inject(ExternalConfigService);

  if (rbacStore.isStale()) {
    const url = `${extConfig.settings.dailyOperationServiceUrl}/daily-operations/api/v1/rbac/permissions`;
    try {
      await rbacStore.loadPermissions(url);
    } catch (err) {
      if (err instanceof HttpErrorResponse && (err.status === 401 || err.status === 403)) {
        authStore.logout();
        return false;
      }
      // Transient network errors: fall through with whatever permissions are cached
    }
  }

  const routeId = route.data?.['routeId'] as string | undefined;
  if (routeId && rbacStore.hasPermission(routeId, ACTIONS.READ)) return true;
  return router.createUrlTree(['/main/home']);
};
