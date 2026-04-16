import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../../features/auth/store/auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authStore = inject(AuthStore);
  
  // skip if no token exists
  if (!authStore.token()) {
    return next(req);
  }

  // Clone request and add auth header
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${authStore.token()}`
    }
  })

  return next(authReq);
};