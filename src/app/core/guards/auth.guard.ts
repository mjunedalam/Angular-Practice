import { CanActivateFn } from '@angular/router';
import { AuthStore } from '../../features/auth/store/auth.store';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);

  if (authStore.isAuthenticated() && !authStore.isTokenExpired()) {
    return true;
  }

  return true;
};
