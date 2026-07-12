import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, switchMap, of, throwError } from 'rxjs';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { GwdDailyRemarks, GwdWellTests } from '@shared/models/wwell/active-wwell.model';
import { ApiResponse } from '@shared/models/wwell/api-response.model';
import { SUPPRESS_GLOBAL_ERROR } from '@interceptors/error.interceptor';

@Injectable({ providedIn: 'root' })
export class ActiveWellViewService {
    private readonly http = inject(HttpClient);
    private readonly extConfigService = inject(ExternalConfigService);

    private get apiUrl(): string {
        const s = this.extConfigService.settings;
        return s.dailyOperationServiceUrl ?? '';
    }

    private get suppressCtx(): HttpContext {
        return new HttpContext().set(SUPPRESS_GLOBAL_ERROR, true);
    }

    createOrUpdateGwdDailyRemark(data: GwdDailyRemarks): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/gwd-daily-remarks`, data, { context: this.suppressCtx })
            .pipe(catchError(this.handleError));
    }

    createOrUpdateGwdWellTest(data: GwdWellTests): Observable<void> {
        if (data.egwtId) {
            return this.http.put<ApiResponse<number>>(`${this.apiUrl}/gwd/api/v1/well-tests/${data.egwtId}`, data, { context: this.suppressCtx })
                .pipe(
                    switchMap(res => res.error ? throwError(() => new Error(res.message)) : of(void 0)),
                    catchError(this.handleError),
                );
        }
        return this.http.post<ApiResponse<number>>(`${this.apiUrl}/gwd/api/v1/well-tests`, data, { context: this.suppressCtx })
            .pipe(
                switchMap(res => res.error ? throwError(() => new Error(res.message)) : of(void 0)),
                catchError(this.handleError),
            );
    }

    deleteGwdWellTest(egwtId: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/gwd/api/v1/well-tests/${egwtId}`, { context: this.suppressCtx })
            .pipe(catchError(this.handleError));
    }

    private handleError(error: HttpErrorResponse) {
        return throwError(() => error);
    }
}