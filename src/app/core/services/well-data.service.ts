import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, timeout } from 'rxjs';
import { IWellData } from '@models/well-design/well-data.model';
import { ApiResponse } from 'src/app/shared/models/wwell/api-response.model';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { NotificationService } from '@shared/components/notification/notification.service';

const CONNECTION_TIMEOUT_MS = 5000;

@Injectable({ providedIn: 'root' })
export class WellDataService {
  private readonly http = inject(HttpClient);
  private readonly extConfigService = inject(ExternalConfigService);
  private readonly notify = inject(NotificationService);

  private get apiUrl(): string {
    const s = this.extConfigService.settings;
    return s.dailyOperationServiceUrl ?? '';
  }

  private notifyFallback(): void {
    this.notify.error('Connected to local data - service unavailable.');
  }

  private withFallback<T>(
    apiCall: Observable<T>,
    localFallback: Observable<T>,
  ): Observable<T> {
    if (!this.apiUrl) {
      this.notifyFallback();
      return localFallback;
    }
    return apiCall.pipe(
      timeout(CONNECTION_TIMEOUT_MS),
      catchError(() => {
        this.notifyFallback();
        return localFallback;
      }),
    );
  }

  getWellDetails(epANum: number, date: string): Observable<IWellData> {
    const assetDate = date.replace(/-/g, '');
    const localFallback = this.http
      .get<ApiResponse<IWellData>>(`/assets/data/well-details-${epANum}-${assetDate}.json`)
      .pipe(
        map((res) => res.data[0]),
        catchError(() =>
          this.http
            .get<ApiResponse<IWellData>>(`/assets/data/well-details-${epANum}-20260401.json`)
            .pipe(
              map((res) => res.data[0]),
              catchError(() =>
                this.http
                  .get<ApiResponse<IWellData>>('/assets/data/well-details-20260401.json')
                  .pipe(map((res) => res.data[0]))
              )
            )
        )
      );

    return this.withFallback(
      this.http
        .get<ApiResponse<IWellData>>(`${this.apiUrl}/drilling-eye?date=${date}&epANum=${epANum}`)
        .pipe(map((res) => res.data[0])),
      localFallback,
    );
  }
}
