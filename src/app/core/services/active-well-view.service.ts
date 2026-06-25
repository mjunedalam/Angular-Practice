import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { GwdDailyRemarks, GwdWellTests } from '@shared/models/wwell/active-wwell.model';
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
        return this.http.post<void>(`${this.apiUrl}/water-well-tests`, data, { context: this.suppressCtx })
            .pipe(catchError(this.handleError));
    }

    private handleError(error: HttpErrorResponse) {
        return throwError(() => error);
    }
}