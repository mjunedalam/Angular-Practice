import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '@shared/components/notification/notification.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        //authStore.logout();
        //router.navigate(['/logout']);
      }
      const message = error.error?.message ?? error.message ?? 'An unexpected error occurred.';
      notify.error(message);
      return throwError(() => error);
    }),
  );
};