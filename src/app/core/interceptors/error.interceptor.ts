import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {



  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        //authStore.logout();
        //router.navigate(['/logout']);
      }
      return throwError(() => error);
    }),
  );

};