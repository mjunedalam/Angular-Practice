import { HttpContextToken, HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, EMPTY, throwError } from 'rxjs';
import { NotificationService } from '@shared/components/notification/notification.service';
import { AuthStore } from '../../features/auth/store/auth.store';

// Set to true on requests that handle their own error notifications.
// The interceptor will still re-throw but skip the global toast.
export const SUPPRESS_GLOBAL_ERROR = new HttpContextToken<boolean>(() => false);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify    = inject(NotificationService);
  const authStore = inject(AuthStore);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authStore.logout();
        return EMPTY;
      }

      if (req.context.get(SUPPRESS_GLOBAL_ERROR)) {
        return throwError(() => error);
      }

      const message = error.error?.message ?? error.message ?? 'An unexpected error occurred.';
      notify.error(message);
      return throwError(() => error);
    }),
  );
};