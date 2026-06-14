import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { GwdDailyRemarks,GwdWellTests } from '@shared/models/wwell/active-wwell.model';

@Injectable({ providedIn: 'root' })
export class ActiveWellViewService {
    private readonly http = inject(HttpClient);
    private readonly extConfigService = inject(ExternalConfigService);

    private get apiUrl(): string {
        const s = this.extConfigService.settings;
        return s.dailyOperationServiceUrl ?? s.dailyOperationServiceUrl ?? '';
    }

    createOrUpdateGwdDailyRemark(data: GwdDailyRemarks): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/gwd-daily-remarks`, data)
            .pipe(
                map(response => response),
                catchError(this.handleError)
            );
    }

    createOrUpdateGwdWellTest(data: GwdWellTests): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/water-well-tests`, data)
            .pipe(
                map(response => response),
                catchError(this.handleError)
            );
    }

    private handleError(error: HttpErrorResponse) {
        return throwError(() => error.error || 'An error occurred');
    }
}