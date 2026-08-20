import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import {
  ApprovalChainStep,
  CreateLandAffairsApprovalPayload,
  CreateWldaApprovalPayload,
  CreateWwellPlanningRequestPayload,
  LandAffairsApproval,
  WldaApproval,
  WwellPlanningRequest,
} from '@models/wwell-planning/wwell-planning.model';
import { ApiResponse } from 'src/app/shared/models/wwell/api-response.model';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { WWELL_REQUESTS_MOCK } from './wwell-requests/wwell-requests.mock';
import { WWELL_LAND_AFFAIRS_APPROVALS_MOCK, WWELL_WLDA_APPROVALS_MOCK } from './shared/wwell-approvals/wwell-approvals.mock';
import { WWELL_LAND_AFFAIRS_CHAIN_ROLES, WWELL_WLDA_CHAIN_ROLES } from './shared/wwell-approvals/wwell-approvals.config';
import { buildApprovalPdfBlob } from './shared/wwell-approvals/wwell-approval-pdf.util';
import { buildInitialApprovalChain, generateApprovalReqNo, todayIsoDate } from './shared/wwell-approvals/wwell-approval-request.util';

interface ApprovalPdfSource {
  readonly reqNo: string;
  readonly client: string;
  readonly wellName: string;
  readonly submittedBy: string;
  readonly date: string;
  readonly chain: readonly ApprovalChainStep[];
}

@Injectable({ providedIn: 'root' })
export class WwellPlanningService {
  private readonly http = inject(HttpClient);
  private readonly extConfigService = inject(ExternalConfigService);

  private get apiUrl(): string {
    const serverUrl = this.extConfigService.settings.planningServiceUrl ?? '';
    return `${serverUrl}/planning/api/v1`;
  }

  getRequests(): Observable<WwellPlanningRequest[]> {
    return this.http.get<ApiResponse<WwellPlanningRequest>>(`${this.apiUrl}/requests`).pipe(
      map(res => res.data),
      // TODO: remove fallback once the requests endpoint is live.
      catchError(() => of([...WWELL_REQUESTS_MOCK])),
    );
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

  getWldaApprovals(): Observable<WldaApproval[]> {
    return this.http.get<ApiResponse<WldaApproval>>(`${this.apiUrl}/approvals/wlda`).pipe(
      map(res => res.data),
      // TODO: remove fallback once the WLDA approvals endpoint is live.
      catchError(() => of([...WWELL_WLDA_APPROVALS_MOCK])),
    );
  }

  getLandAffairsApprovals(): Observable<LandAffairsApproval[]> {
    return this.http.get<ApiResponse<LandAffairsApproval>>(`${this.apiUrl}/approvals/land-affairs`).pipe(
      map(res => res.data),
      // TODO: remove fallback once the Land Affairs approvals endpoint is live.
      catchError(() => of([...WWELL_LAND_AFFAIRS_APPROVALS_MOCK])),
    );
  }

  createWldaApproval(payload: CreateWldaApprovalPayload, files: readonly File[] = []): Observable<WldaApproval> {
    return this.http
      .post<ApiResponse<WldaApproval>>(`${this.apiUrl}/approvals/wlda`, this.toFormData(payload, files))
      .pipe(
        map(res => res.data[0]),
        // TODO: remove fallback once the WLDA approval-creation endpoint is live.
        catchError(() => of(this.buildFallbackWldaApproval(payload))),
      );
  }

  createLandAffairsApproval(
    payload: CreateLandAffairsApprovalPayload,
    files: readonly File[] = [],
  ): Observable<LandAffairsApproval> {
    return this.http
      .post<ApiResponse<LandAffairsApproval>>(`${this.apiUrl}/approvals/land-affairs`, this.toFormData(payload, files))
      .pipe(
        map(res => res.data[0]),
        // TODO: remove fallback once the Land Affairs approval-creation endpoint is live.
        catchError(() => of(this.buildFallbackLandAffairsApproval(payload))),
      );
  }

  private toFormData(payload: object, files: readonly File[]): FormData {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        // Nested objects/arrays (e.g. IR's requestReference/programDetails/casing[]) would
        // otherwise serialize to the literal string "[object Object]" via String(value).
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    });
    files.forEach(file => formData.append('attachments', file, file.name));
    return formData;
  }

  private buildFallbackWldaApproval(payload: CreateWldaApprovalPayload): WldaApproval {
    const reqNo = generateApprovalReqNo();
    return {
      id: `WLDA-${reqNo.slice(4)}`,
      reqNo,
      client: payload.client,
      wellName: payload.wellName,
      supporting: payload.supporting,
      submittedBy: 'You',
      date: todayIsoDate(),
      status: 'submitted',
      chain: buildInitialApprovalChain(WWELL_WLDA_CHAIN_ROLES, 'You'),
    };
  }

  private buildFallbackLandAffairsApproval(payload: CreateLandAffairsApprovalPayload): LandAffairsApproval {
    const reqNo = generateApprovalReqNo();
    return {
      id: `LA-${reqNo.slice(4)}`,
      reqNo,
      client: payload.client,
      wellName: payload.wellName,
      x: payload.coordinateX,
      y: payload.coordinateY,
      utm: payload.utmZone,
      submittedBy: 'You',
      date: todayIsoDate(),
      status: 'submitted',
      chain: buildInitialApprovalChain(WWELL_LAND_AFFAIRS_CHAIN_ROLES, 'You'),
    };
  }

  getWldaApprovalPdf(row: WldaApproval): Observable<Blob> {
    return this.fetchApprovalPdf('wlda', row.id, 'WLDA Approval', row);
  }

  getLandAffairsApprovalPdf(row: LandAffairsApproval): Observable<Blob> {
    return this.fetchApprovalPdf('land-affairs', row.id, 'Land Affairs Approval', row);
  }

  private fetchApprovalPdf(kind: string, id: string, label: string, row: ApprovalPdfSource): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/approvals/${kind}/${id}/pdf`, { responseType: 'blob' }).pipe(
      // TODO: remove fallback once the approval-PDF endpoint is live.
      catchError(() =>
        of(
          buildApprovalPdfBlob(`${label} — ${row.reqNo}`, [
            `Client: ${row.client}    Well: ${row.wellName}`,
            `Submitted By: ${row.submittedBy}    Date: ${row.date}`,
            '',
            'Approval Chain:',
            ...row.chain.map(step => `  ${step.role}: ${step.name}${step.date ? ' — ' + step.date : ''} (${step.status})`),
          ]),
        ),
      ),
    );
  }

}
