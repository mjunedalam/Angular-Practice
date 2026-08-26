import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, delay, map, of } from 'rxjs';
import { ApprovalChainStep } from '@models/wwell-planning/wwell-planning.model';
import { CreateIntegratedRequirementPayload, IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { ApiResponse } from 'src/app/shared/models/wwell/api-response.model';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { WWELL_IR_CHAIN_ROLES } from '../shared/wwell-approvals/wwell-approvals.config';
import { buildInitialApprovalChain, todayIsoDate } from '../shared/wwell-approvals/wwell-approval-request.util';
import { mockApprovalChainForIrSeq } from './wwell-ir-form/wwell-ir-chain.mock';
import { IrEligibleWell, IrHeaderSummary, WwellIrBulkSavePayload, WwellIrDetailTableBlock, WwellIrSaveResult } from './wwell-ir-form/wwell-ir-payload.model';
import { mapIrHeaderSummariesToIntegratedRequirements } from './wwell-ir-form/wwell-ir-summary.mapper';

@Injectable({ providedIn: 'root' })
export class WwellIrService {
  private readonly http = inject(HttpClient);
  private readonly extConfigService = inject(ExternalConfigService);

  private get apiUrl(): string {
    const serverUrl = this.extConfigService.settings.planningServiceUrl ?? '';
    return `${serverUrl}/planning/api/v1`;
  }

  getIrs(): Observable<IntegratedRequirement[]> {
    return this.http
      .get<ApiResponse<IrHeaderSummary>>(`${this.apiUrl}/integrated-requirements`)
      .pipe(map(res => mapIrHeaderSummariesToIntegratedRequirements(res.data)));
  }

  /**
   * Wells still eligible to have an IR initiated (backed by exad_rcd_prewap via
   * exad_agwa_queries_pkg.get_ir_wells_prc) — feeds the "New IR" wizard's Request Reference
   * "Link to Request" picker. Returns the full record (not just {value,label}) so selecting one
   * can also auto-populate Water Well Name/Surface Elevation/Coordinates — see WwellIrStore's
   * `linkedRequestWellOptions` computed for the trimmed picker-option view derived from this.
   */
  getEligibleWellsForIr(): Observable<IrEligibleWell[]> {
    return this.http.get<ApiResponse<IrEligibleWell>>(`${this.apiUrl}/wells/eligible-for-ir`).pipe(map(res => res.data));
  }

  /**
   * ir_seq is the real primary key once an IR is saved — selecting a row in the list passes it
   * here to fetch the full { table, data } detail (casing/tops/hydrogeology) for that one record.
   * No offline-mock fallback here (unlike the other reads above): faking detail for a specific,
   * already-known-real record would misrepresent it rather than degrade gracefully, so a failure
   * surfaces as a real error instead — see WwellIrStore.loadIrDetail.
   */
  getIrDetailBlocks(irSeq: number): Observable<readonly WwellIrDetailTableBlock[]> {
    return this.http
      .get<ApiResponse<WwellIrDetailTableBlock>>(`${this.apiUrl}/integrated-requirements/${irSeq}`)
      .pipe(map(res => res.data));
  }

  /**
   * The approval-process API is a separate call from the detail fetch above and doesn't exist yet
   * — selecting a row fires both, this one just has nothing real to hit. Mocked client-side (with
   * an artificial delay so it reads as its own network round-trip) until a real
   * `GET .../integrated-requirements/{irSeq}/approval-timeline` endpoint replaces it.
   */
  getIrApprovalTimeline(irSeq: number): Observable<readonly ApprovalChainStep[]> {
    return of(mockApprovalChainForIrSeq(irSeq)).pipe(delay(300));
  }

  createIr(
    payload: CreateIntegratedRequirementPayload,
    irBulkPayload: WwellIrBulkSavePayload,
    attachmentNames: readonly string[] = [],
  ): Observable<IntegratedRequirement> {
    // The backend only accepts the raw exad_gwd_ir_* bulk-save array as the request body (see
    // wwell-ir-payload.model.ts / IntegratedRequirementResource.java's @Consumes(APPLICATION_JSON))
    // — it has no multipart handling and no columns for the richer domain fields below (client,
    // wellName, contacts, attachments...), so those stay client-side only until exad_agwa_iud_pkg's
    // header table grows to carry them. Sending them today just 415s (wrong Content-Type/body shape).
    return this.http
      .post<ApiResponse<WwellIrSaveResult>>(`${this.apiUrl}/integrated-requirements`, irBulkPayload)
      .pipe(
        map(res => this.buildIrFromPayload(payload, res.data[0]?.irSeq ?? null, attachmentNames)),
        // TODO: remove fallback once every environment has a reachable integrated-requirements endpoint.
        catchError(() => of(this.buildIrFromPayload(payload, null, attachmentNames))),
      );
  }

  submitIrForReview(ir: IntegratedRequirement): Observable<IntegratedRequirement> {
    return this.http
      .post<ApiResponse<IntegratedRequirement>>(`${this.apiUrl}/integrated-requirements/${ir.id}/submit-for-review`, {})
      .pipe(
        map(res => res.data[0]),
        // TODO: remove fallback once the submit-for-review endpoint is live.
        catchError(() => of({ ...ir, status: 'submit-for-review' as const, updatedDate: todayIsoDate() })),
      );
  }

  /** Builds the domain object locally from what was submitted — the backend only ever echoes
   *  back an ir_seq (see WwellIrSaveResult), never the full IntegratedRequirement. `irSeq: null`
   *  (offline fallback) mints a placeholder one, same as a first-time INSERT would eventually get. */
  private buildIrFromPayload(
    payload: CreateIntegratedRequirementPayload,
    irSeq: number | null,
    attachmentNames: readonly string[],
  ): IntegratedRequirement {
    const resolvedIrSeq = irSeq ?? Math.floor(Math.random() * 9000 + 1000);
    // ir_seq-derived, matching mapIrHeaderSummaryToIntegratedRequirement's format — this same
    // record must display the same code whether it was just created or reloaded from the list.
    const code = `IR-${resolvedIrSeq}`;
    return {
      id: code,
      code,
      irSeq: resolvedIrSeq,
      updatedDate: todayIsoDate(),
      status: payload.status,
      requestReference: payload.requestReference,
      formationTops: payload.formationTops,
      casing: payload.casing,
      programDetails: payload.programDetails,
      contacts: payload.contacts,
      offsetWells: payload.offsetWells,
      offsetWellsRemarks: payload.offsetWellsRemarks,
      hydrogeology: payload.hydrogeology,
      testProgram: payload.testProgram,
      attachmentNames,
      chain: buildInitialApprovalChain(WWELL_IR_CHAIN_ROLES, 'You'),
    };
  }
}
