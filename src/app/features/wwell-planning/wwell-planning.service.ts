import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import {
  ApprovalDecision,
  CreateWwellPlanningRequestPayload,
  IntegratedRequirement,
  WwellPlanningApproval,
  WwellPlanningRequest,
} from '@models/wwell-planning/wwell-planning.model';
import { ApiResponse } from 'src/app/shared/models/wwell/api-response.model';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';

@Injectable({ providedIn: 'root' })
export class WwellPlanningService {
  private readonly http = inject(HttpClient);
  private readonly extConfigService = inject(ExternalConfigService);

  private get apiUrl(): string {
    const serverUrl = this.extConfigService.settings.planningServiceUrl ?? '';
    return `${serverUrl}/planning/api/v1`;
  }

  getRequests(): Observable<WwellPlanningRequest[]> {
    return this.http
      .get<ApiResponse<WwellPlanningRequest>>(`${this.apiUrl}/requests`)
      .pipe(map(res => res.data));
  }

  createRequest(
    payload: CreateWwellPlanningRequestPayload,
    files: readonly File[] = [],
  ): Observable<WwellPlanningRequest> {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    files.forEach(file => formData.append('attachments', file, file.name));

    return this.http
      .post<ApiResponse<WwellPlanningRequest>>(`${this.apiUrl}/requests`, formData)
      .pipe(map(res => res.data[0]));
  }

  getApprovals(): Observable<WwellPlanningApproval[]> {
    return this.http
      .get<ApiResponse<WwellPlanningApproval>>(`${this.apiUrl}/approvals`)
      .pipe(map(res => res.data));
  }

  getIntegratedRequirements(): Observable<IntegratedRequirement[]> {
    return this.http
      .get<ApiResponse<IntegratedRequirement>>(`${this.apiUrl}/integrated-requirements`)
      .pipe(map(res => res.data));
  }

  decideApproval(approvalId: string, decision: ApprovalDecision, comments: string | null): Observable<WwellPlanningApproval> {
    return this.http
      .patch<ApiResponse<WwellPlanningApproval>>(`${this.apiUrl}/approvals/${approvalId}`, { decision, comments })
      .pipe(map(res => res.data[0]));
  }
}
