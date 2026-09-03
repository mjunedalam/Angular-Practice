import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, delay, map, of, throwError } from 'rxjs';
import { ApprovalChainStep } from '@models/wwell-planning/wwell-planning.model';
import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { ApiResponse } from 'src/app/shared/models/wwell/api-response.model';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { SUPPRESS_GLOBAL_ERROR } from '@interceptors/error.interceptor';
import { todayIsoDate } from '../shared/wwell-approvals/wwell-approval-request.util';
import { mockApprovalChainForIrSeq } from './wwell-ir-form/wwell-ir-chain.mock';
import { IrEligibleWell, IrHeaderSummary, WwellIrBulkSavePayload, WwellIrDetailTableBlock, WwellIrSaveResult } from './wwell-ir-form/wwell-ir-payload.model';
import { mapIrHeaderSummariesToIntegratedRequirements } from './wwell-ir-form/wwell-ir-summary.mapper';

/**
 * Works around a confirmed backend defect: an exad_gwd_ir_header INSERT/UPDATE can genuinely
 * succeed while the HTTP response still comes back as a 500, with the real success payload
 * embedded inside the error envelope's own `message` field instead of a proper 2xx — e.g.
 * `{"statusCode":500,"error":true,"message":"{\"status\":\"SUCCESS\",\"ir_seq\":9024}","data":[]}`.
 * Matches only that exact signature (a JSON-parseable message shaped like
 * `{status:"SUCCESS", ir_seq:number}`) and returns the REAL ir_seq the backend actually
 * assigned — never a client-minted placeholder — so the record's identity stays correct and
 * stable across resaves. Any other failure (a genuine validation error, network failure, a
 * differently-shaped message) falls through unmatched and is re-thrown as a real error.
 * Remove once the backend returns a proper 2xx for a save that actually succeeded.
 */
function extractIrSeqFromMisreportedSuccess(err: unknown): number | null {
  if (!(err instanceof HttpErrorResponse)) return null;
  const body: unknown = err.error;
  const message = body && typeof body === 'object' ? (body as { message?: unknown }).message : undefined;
  if (typeof message !== 'string') return null;

  try {
    const parsed: unknown = JSON.parse(message);
    const status = parsed && typeof parsed === 'object' ? (parsed as { status?: unknown }).status : undefined;
    const irSeq = parsed && typeof parsed === 'object' ? (parsed as { ir_seq?: unknown }).ir_seq : undefined;
    return status === 'SUCCESS' && typeof irSeq === 'number' ? irSeq : null;
  } catch {
    return null;
  }
}

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

  /**
   * Returns only the real, backend-confirmed `ir_seq` — never a client-fabricated
   * `IntegratedRequirement` (that was this method's old `buildIrFromPayload`-based "optimistic
   * echo," removed because it kept showing whatever the user had just typed for fields with no
   * backing column at all — client, targetAquifer, targetDepthFt... (see
   * mergeIrDetailBlocksIntoIntegratedRequirement's doc comment for the full list) — with nothing to
   * ever correct it except a full page reload. WwellIrStore.createIr now follows this up with a
   * real GET (getIrDetailBlocks) and merges that onto the record's last known-real state instead.
   */
  createIr(irBulkPayload: WwellIrBulkSavePayload): Observable<number | null> {
    // The backend only accepts the raw exad_gwd_ir_* bulk-save array as the request body (see
    // wwell-ir-payload.model.ts / IntegratedRequirementResource.java's @Consumes(APPLICATION_JSON))
    // — it has no multipart handling and no columns for the richer domain fields below (client,
    // wellName, contacts, attachments...), so those stay client-side only until exad_agwa_iud_pkg's
    // header table grows to carry them. Sending them today just 415s (wrong Content-Type/body shape).
    //
    // No offline-fallback here (unlike getIrs()/getEligibleWellsForIr() above) — a failed save
    // must surface as a real, visible error (WwellIrStore.createIrError), not a fabricated
    // success. A genuine POST failure with no recoverable ir_seq (see extractIrSeqFromMisreportedSuccess
    // below for the one confirmed-defect exception) always re-throws rather than minting a random
    // ir_seq — a client-minted identity on real failure would let a resave silently re-INSERT under
    // a new fake id instead of UPDATE-ing the original row, orphaning the real backend record and
    // duplicating it in the list.
    //
    // SUPPRESS_GLOBAL_ERROR: WwellIrStore.createIr's own error handler (→ createIrError →
    // WwellIrComponent's notify.error) already shows a toast for a genuine failure — without this,
    // errorInterceptor's app-wide catchError would show a second, identical one for the same error.
    // The header row's own `ir_seq` is the identity this save was submitted under — `null` for a
    // brand-new IR (the backend mints one), otherwise the already-known ir_seq of the record being
    // updated. exad_agwa_iud_pkg.update_ir_data_prc (docs/ir/update_ir_data_prc.sql) only echoes
    // back a fresh ir_seq on that INSERT branch; an UPDATE's `p_return_value` is just the literal
    // `SUCCESS`, no ir_seq, because the caller already has it — see WwellIrSaveResult. Falling back
    // to `knownIrSeq` (not a random mint) below is what keeps a resaved record's identity stable.
    const knownIrSeq = irBulkPayload[0].data?.[0]?.ir_seq ?? null;

    return this.http
      .post<ApiResponse<WwellIrSaveResult>>(`${this.apiUrl}/integrated-requirements`, irBulkPayload, {
        context: new HttpContext().set(SUPPRESS_GLOBAL_ERROR, true),
      })
      .pipe(
        map(res => res.data[0]?.irSeq ?? knownIrSeq),
        catchError((err: unknown) => {
          const realIrSeq = extractIrSeqFromMisreportedSuccess(err);
          return realIrSeq !== null ? of(realIrSeq) : throwError(() => err);
        }),
      );
  }

  /**
   * Deletes the whole IR (header row) by ir_seq. exad_agwa_iud_pkg.save_header's DELETE arm
   * removes just that one row; casing/tops/hydrogeology/water cascade automatically via their
   * `ir_seq ... ON DELETE CASCADE` FK (01-schema.sql), so nothing else needs to be sent — no
   * per-block bulk-save payload here, unlike createIr() above.
   */
  deleteIr(irSeq: number): Observable<void> {
    return this.http
      .delete<ApiResponse<never>>(`${this.apiUrl}/integrated-requirements/${irSeq}`, {
        context: new HttpContext().set(SUPPRESS_GLOBAL_ERROR, true),
      })
      .pipe(map(() => undefined));
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
}
