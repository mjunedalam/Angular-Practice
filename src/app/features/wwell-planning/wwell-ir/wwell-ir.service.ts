import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import { WwellIrLetterWorkflow } from './wwell-ir.config';
import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { ApiResponse } from 'src/app/shared/models/wwell/api-response.model';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { DailyOperationService } from '@services/daily-operation.service';
import { Aquifer } from '@models/daily-operation/aquifer.model';
import { SUPPRESS_GLOBAL_ERROR } from '@interceptors/error.interceptor';
import {
  GwdOpsMember,
  GwdOpsMemberRaw,
  IrEligibleWell,
  IrHeaderSummary,
  WwellIrBulkSavePayload,
  WwellIrDetailTableBlock,
  WwellIrSaveResult,
  mapGwdOpsMemberRaw,
  StratInfo,
  IrOffsetWellSource,
} from './wwell-ir-form/wwell-ir-payload.model';
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
  private readonly dailyOperationService = inject(DailyOperationService);

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
   * GWD ops-member/assignee lookup (exad_agwa_queries_pkg.get_gwd_ops_member_prc) — feeds the IR
   * editor's Geologist Contact "Primary"/"Secondary" pickers with real display names instead of the
   * old hardcoded WWELL_GEOLOGIST_OPTIONS list.
   */
  getGwdOpsMembers(): Observable<GwdOpsMember[]> {
    return this.http.get<ApiResponse<GwdOpsMemberRaw>>(`${this.apiUrl}/gwd-ops-members`).pipe(map(res => res.data.map(mapGwdOpsMemberRaw)));
  }

  /** Stratigraphic unit list (exad_agwa_queries_pkg.strat_list) — feeds the Formation Tops "Formation"
   *  dropdown with st_long_cd values. */
  getStratInfo(): Observable<StratInfo[]> {
    return this.http.get<ApiResponse<StratInfo>>(`${this.apiUrl}/strat-info`).pipe(map(res => res.data));
  }

  /** Offset water wells (exad_agwa_queries_pkg.get_ir_offset_water_wells_prc) — feeds the Area Water Wells
   *  "Select Offset Water Well" picker. */
  getOffsetWellSources(): Observable<IrOffsetWellSource[]> {
    return this.http.get<ApiResponse<IrOffsetWellSource>>(`${this.apiUrl}/offset-water-wells`).pipe(map(res => res.data));
  }

  /** Aquifer/formation reference list (daily-operations GET /aquifers, same call the Active Water
   *  Well page uses) — feeds every Formation/Aquifer dropdown in the IR form. */
  getAquifers(): Observable<Aquifer[]> {
    return this.dailyOperationService.getAquifers();
  }

  /**
   * Dropdown values stored in EXAD_DHUB_LKUP_DATA, grouped by menu name (LKUP_NAME, e.g.
   * `completion_menu`) — feeds the Program Details dropdowns instead of hardcoded lists. Read-only:
   * whatever a user picks or types is saved on the IR itself, never back to this table.
   */
  getDropdownMenus(): Observable<Record<string, string[]>> {
    return this.http.get<ApiResponse<{ menuName: string; optionValue: string }>>(`${this.apiUrl}/dropdown-menus`).pipe(
      map(res =>
        res.data.reduce<Record<string, string[]>>((byMenu, row) => {
          (byMenu[row.menuName] ??= []).push(row.optionValue);
          return byMenu;
        }, {}),
      ),
    );
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
   * Downloads the formal "Integrated Requirements" letter as a PDF — rendered server-side
   * (Qute + openhtmltopdf, agwa-planning's IrLetterService) from the same detail data
   * getIrDetailBlocks() above already reads, so the PDF always reflects the last-saved record
   * rather than whatever the Letter tab's own client-side view currently has in memory.
   */
  /** POST (not GET) because the wellbore diagram is rendered client-side (the same D3/SVG
   *  components the Letter tab already shows) and its PNG snapshot rides along as the request
   *  body — the backend has no drawing logic of its own for it anymore. `wellboreImageBase64` is
   *  omitted when the IR has no casing/tops data or the client-side capture failed; the letter
   *  still renders, just without that section. `stampStatus` is the already-resolved
   *  Approved/Rejected/Pending stamp state (see `resolveLetterStampStatus`, wwell-ir.config.ts) —
   *  sent as a plain value so agwa-planning just stamps whatever it's told instead of keeping its
   *  own copy of the SAP-text classification logic. `null` when the IR was never submitted.
   *  `workflow` is the live SAP workflow (id, status text, approval chain) printed as the letter's
   *  "SAP Approval Workflow" section — see `resolveLetterWorkflow`. `omitApprovalList` drops the
   *  "Integrated Requirements Approval List" table; only the Submit-for-Review copy sent to SAP sets
   *  it, downloads keep the table. */
  downloadLetterPdf(
    irSeq: number,
    wellboreImageBase64?: string,
    stampStatus?: string | null,
    workflow?: WwellIrLetterWorkflow,
    omitApprovalList = false,
  ): Observable<Blob> {
    return this.http.post(
      `${this.apiUrl}/integrated-requirements/${irSeq}/letter-pdf`,
      {
        wellboreImageBase64: wellboreImageBase64 ?? null,
        stampStatus: stampStatus ?? null,
        workflowId: workflow?.workflowId ?? null,
        workflowStatusText: workflow?.workflowStatusText ?? null,
        workflowSteps: workflow?.workflowSteps ?? null,
        omitApprovalList,
      },
      { responseType: 'blob' },
    );
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

  /**
   * Next unique SAP workflow sequence (EXAD_AGWA_QUERIES_PKG.get_wf_next_id_fnc,
   * docs/ir/get_wf_next_id_fnc.sql) — a raw DB sequence value the caller sends to SAP as-is for
   * `workflow_id` and stores as-is via updateIrSapWorkflow below. Live in agwa-planning
   * (SapWorkflowResource) — no offline fallback: a failure here must stop
   * WwellIrStore.submitIrForReview before it mints a fabricated id, not silently hand back one
   * that was never really reserved.
   */
  getNextSapWorkflowSeq(): Observable<number> {
    return this.http.get<ApiResponse<number>>(`${this.apiUrl}/sap-workflow/next-id`).pipe(map(res => res.data[0]));
  }

  /**
   * Persists the SAP workflow id/status onto the IR header
   * (EXAD_AGWA_IUD_PKG.update_ir_sap_wf_prc, docs/ir/update_ir_sap_wf_prc.sql) once the SAP AAE
   * trigger call has been attempted — called on both outcomes (see WwellIrStore.submitIrForReview)
   * so the header always reflects whether the push to SAP actually succeeded. Live in
   * agwa-planning (IntegratedRequirementResource.updateSapWorkflow) — no offline fallback: a
   * failure here is a real, visible error (WwellIrStore's sapTriggerError), not a silently
   * swallowed one, since it would otherwise mask the header never actually getting stamped.
   */
  updateIrSapWorkflow(irSeq: number, wfId: number, wfStatus: string): Observable<void> {
    return this.http
      .patch<ApiResponse<never>>(`${this.apiUrl}/integrated-requirements/${irSeq}/sap-workflow`, { wfId, wfStatus })
      .pipe(map(() => undefined));
  }
}
