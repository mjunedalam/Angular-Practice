import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, timeout } from 'rxjs';
import { MessageService } from 'primeng/api';
import { MorningReport } from '../models/morning-report/morning-report.model';
import { ApiResponse } from 'src/app/shared/models/wwell/api-response.model';
import { WaterWellTestResult } from 'src/app/shared/models/wwell/wwell-test-result.model';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';

const CONNECTION_TIMEOUT_MS = 5000;

@Injectable({ providedIn: 'root' })
export class MorningReportService {

  private readonly extConfigService = inject(ExternalConfigService);
  private readonly http = inject(HttpClient);
  private readonly messageService = inject(MessageService);

  private get apiUrl(): string {
    const s = this.extConfigService.settings;
    return s.dailyOperationServiceUrl ?? s.dailyOperatioServicenUrl ?? '';
  }

  private notifyFallback(): void {
    this.messageService.add({
      severity: 'warn',
      summary: 'Offline Mode',
      detail: 'Connected to local data — service unavailable.',
      life: 8000,
    });
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

  private transformReports(reports: MorningReport[]): MorningReport[] {
    return reports.map(report => ({
      ...report,
      plLtrlEndDpth: report.plLtrlEndDpth ? Number(report.plLtrlEndDpth) : null,
      wDpthChgDis: report.wDpthChgDis ? Number(report.wDpthChgDis) : null,
      wPrsntDpth: report.wPrsntDpth ? Number(report.wPrsntDpth) : null,
    }));
  }

  getMorningReport(): Observable<MorningReport[]> {
    return this.withFallback(
      this.http.get<MorningReport[]>(`${this.apiUrl}/morning-report`).pipe(
        map(reports => this.transformReports(reports)),
      ),
      this.http.get<MorningReport[]>('assets/data/mr-report.json').pipe(
        map(reports => this.transformReports(reports)),
      ),
    );
  }

  getWaterWellTestResultData(): Observable<ApiResponse<WaterWellTestResult>> {
    return this.withFallback(
      this.http.get<ApiResponse<WaterWellTestResult>>(
        `${this.apiUrl}/morning-report/waterWellTestResults`,
      ),
      this.http.get<ApiResponse<WaterWellTestResult>>('assets/data/wwell-test-results.json'),
    );
  }

  /*
   This method is for testing and validation of map content and will be eliminated after integration testing is done.
   Reason behind to create a temporary method:-  Test data received from the upstream does not have relavent co-orindates for KSA.
   So, we have to manipulate the data to have the co-ordinates confined only to KSA.
  */
  getMorningReportForKSA(): Observable<MorningReport[]> {
    return this.withFallback(
      this.http.get<MorningReport[]>(`${this.apiUrl}/morning-report`).pipe(
        map(reports => this.transformReports(reports)),
      ),
      this.http.get<MorningReport[]>('assets/data/mr-report-sample2.json').pipe(
        map(reports => this.transformReports(reports)),
      ),
    );
  }
}
