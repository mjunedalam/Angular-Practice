import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ApiResponse } from 'src/app/shared/models/wwell/api-response.model';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';

export interface LoginMetricPayload {
  outcome: 'SUCCESS' | 'FAILURE';
  username?: string;
  authFlow: 'SSO' | 'CREDENTIALS';
  failureReason?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthMetricsService {
  private readonly http = inject(HttpClient);
  private readonly extConfigService = inject(ExternalConfigService);

  private get baseUrl(): string {
    const serverUrl = this.extConfigService.settings.dailyOperationServiceUrl ?? '';
    return `${serverUrl}/auth-events/api/v1/login-attempts`;
  }

  recordLoginAttempt(payload: LoginMetricPayload): Observable<void> {
    return this.http
      .post<ApiResponse<string>>(this.baseUrl, payload)
      .pipe(map(() => undefined));
  }
}
