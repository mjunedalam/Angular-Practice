import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../store/auth/auth.store';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  if (authStore.isAuthenticated() && !authStore.isTokenExpired()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
