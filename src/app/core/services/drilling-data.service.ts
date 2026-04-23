import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, timeout } from 'rxjs';
import { IWellData } from '@models/well-design/well-data.model';
import { ApiResponse } from 'src/app/shared/models/wwell/api-response.model';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { NotificationService } from '@shared/components/notification/notification.service';

const CONNECTION_TIMEOUT_MS = 5000;

@Injectable({ providedIn: 'root' })
export class DrillingDataService {
    private readonly http = inject(HttpClient);
    private readonly extConfigService = inject(ExternalConfigService);
    private readonly notify = inject(NotificationService);

    private get apiUrl(): string {
        try {
            return this.extConfigService.settings.drillingEyeServiceUrl ?? '';
        } catch {
            return '';
        }
    }

    private get localFallback(): Observable<IWellData[]> {
        return this.http.get<ApiResponse<IWellData>>('/assets/data/data.json').pipe(map(res => res.data));
    }

    getDrillingData(date: string): Observable<IWellData[]> {
        if (!this.apiUrl) {
            this.notify.error('Connected to local data - service unavailable.');
            return this.localFallback;
        }

        return this.http
            .get<ApiResponse<IWellData>>(`${this.apiUrl}/drilling-eye?date=${date}`)
            .pipe(
                timeout(CONNECTION_TIMEOUT_MS),
                map(res => res.data),
                catchError(() => {
                    this.notify.error('Connected to local data - service unavailable.');
                    return this.localFallback;
                }),
            );
    }
}
