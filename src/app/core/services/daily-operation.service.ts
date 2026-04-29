import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, timeout } from 'rxjs';
import { IWellData } from '@models/well-design/well-data.model';
import { WwellEntry } from '@models/daily-operation/wwell-entry.model';
import { ApiResponse } from 'src/app/shared/models/wwell/api-response.model';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { NotificationService } from '@shared/components/notification/notification.service';

const CONNECTION_TIMEOUT_MS = 5000;

interface WwellListFallbackEntry {
    readonly epANum: number;
    readonly wellName: string;
}

@Injectable({ providedIn: 'root' })
export class DailyOperationService {
    private readonly http = inject(HttpClient);
    private readonly extConfigService = inject(ExternalConfigService);
    private readonly notify = inject(NotificationService);

    private get apiUrl(): string {
        try {
            return this.extConfigService.settings.dailyOperationServiceUrl ?? '';
        } catch {
            return '';
        }
    }

    private notifyFallback(): void {
        this.notify.error('Connected to local data - service unavailable.');
    }

    getWellList(date: string): Observable<WwellEntry[]> {
        const fallback$: Observable<WwellEntry[]> = this.http
            .get<ApiResponse<WwellListFallbackEntry>>('/assets/data/wwell-name-and-epANum.json')
            .pipe(map(res => res.data.map(e => ({ name: e.wellName, epANum: e.epANum }))));

        if (!this.apiUrl) {
            this.notifyFallback();
            return fallback$;
        }

        return this.http
            .get<WwellEntry[]>(`${this.apiUrl}/daily-operation/api/v1/wwells?date=${date}`)
            .pipe(
                timeout(CONNECTION_TIMEOUT_MS),
                catchError(() => {
                    this.notifyFallback();
                    return fallback$;
                }),
            );
    }

    getWellDetail(date: string, epANum: number): Observable<IWellData> {
        const fallback$: Observable<IWellData> = this.http
            .get<ApiResponse<IWellData>>('/assets/data/drlg-mr.json')
            .pipe(map(res => res.data[0]));

        if (!this.apiUrl) {
            this.notifyFallback();
            return fallback$;
        }

        return this.http
            .get<ApiResponse<IWellData>>(
                `${this.apiUrl}/daily-operation/api/v1/wwells?date=${date}&epANum=${epANum}`,
            )
            .pipe(
                timeout(CONNECTION_TIMEOUT_MS),
                map(res => res.data[0]),
                catchError(() => {
                    this.notifyFallback();
                    return fallback$;
                }),
            );
    }
}
