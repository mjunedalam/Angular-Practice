import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, EMPTY, throwError } from 'rxjs';
import { NotificationService } from '@shared/components/notification/notification.service';
import { AuthStore } from '../../features/auth/store/auth.store';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify    = inject(NotificationService);
  const authStore = inject(AuthStore);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authStore.logout();
        return EMPTY;
      }

      const message = error.error?.message ?? error.message ?? 'An unexpected error occurred.';
      notify.error(message);
      return throwError(() => error);
    }),
  );
};