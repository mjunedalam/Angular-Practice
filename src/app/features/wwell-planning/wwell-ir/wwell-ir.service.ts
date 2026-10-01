import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpErrorResponse, HttpEventType, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable, catchError, filter, map, of, throwError } from 'rxjs';
import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { IrAttachment, IrAttachmentSlot, IrAttachmentUploadEvent } from '@models/wwell-planning/ir-attachment.model';
import { ApiResponse } from 'src/app/shared/models/wwell/api-response.model';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
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
   *  still renders, just without that section. */
  downloadLetterPdf(irSeq: number, wellboreImageBase64?: string): Observable<Blob> {
    return this.http.post(
      `${this.apiUrl}/integrated-requirements/${irSeq}/letter-pdf`,
      { wellboreImageBase64: wellboreImageBase64 ?? null },
      { responseType: 'blob' },
    );
  }

  /**
   * The IR's two named attachment slots. A separate call from the detail fetch — these are real
   * files on the backend's filesystem, not exad_gwd_ir_* columns — so an IR with nothing uploaded
   * simply comes back with an empty list rather than an error.
   */
  getIrAttachments(irSeq: number): Observable<readonly IrAttachment[]> {
    return this.http
      .get<ApiResponse<IrAttachment>>(`${this.apiUrl}/integrated-requirements/${irSeq}/attachments`)
      .pipe(map(res => res.data ?? []));
  }

  /**
   * Adds a new file to one slot, reporting real byte-level progress as it goes. Never replaces an
   * existing file in that slot — a slot can hold any number of attachments now, each addressed by
   * its own file name (see `getIrAttachmentFile`/`deleteIrAttachment`).
   *
   * Emits `{ percent, attachment: null }` while the body is still being sent, then one final
   * `{ percent: 100, attachment }` carrying the stored record. Uses `HttpRequest` +
   * `reportProgress` rather than a plain `post()` so the editor's progress bar tracks actual bytes
   * transferred instead of animating a guess — on a slow link or a 20 MB scan that difference is
   * the whole point of showing a bar at all.
   *
   * Multipart, so no explicit Content-Type header — the browser must set it itself to include the
   * multipart boundary.
   *
   * SUPPRESS_GLOBAL_ERROR: the editor surfaces a per-slot inline message (see WwellIrStore's
   * attachmentError), so the global interceptor toast would double up on the same failure.
   */
  uploadIrAttachment(irSeq: number, slot: IrAttachmentSlot, file: File): Observable<IrAttachmentUploadEvent> {
    const body = new FormData();
    body.append('file', file);
    const request = new HttpRequest<FormData>(
      'POST',
      `${this.apiUrl}/integrated-requirements/${irSeq}/attachments/${slot}`,
      body,
      {
        reportProgress: true,
        context: new HttpContext().set(SUPPRESS_GLOBAL_ERROR, true),
      },
    );

    return this.http.request<ApiResponse<IrAttachment>>(request).pipe(
      // Only these two event types say anything the UI can use — the rest (Sent, ResponseHeader,
      // DownloadProgress) would otherwise map to a bogus 0 and visibly reset the bar mid-upload.
      filter(event => event.type === HttpEventType.UploadProgress || event.type === HttpEventType.Response),
      map(event => {
        if (event.type === HttpEventType.UploadProgress) {
          // `total` is absent on some servers/proxies; report 0 rather than dividing by undefined,
          // which the editor renders as an indeterminate bar instead of a wrong number.
          const percent = event.total ? Math.round((100 * event.loaded) / event.total) : 0;
          return { percent, attachment: null };
        }
        const response = event as HttpResponse<ApiResponse<IrAttachment>>;
        return { percent: 100, attachment: response.body?.data?.[0] ?? null };
      }),
    );
  }

  /** Deletes one specific attachment by slot + file name. 404s when it was already gone — the
   *  caller treats that as "already gone" too. */
  deleteIrAttachment(irSeq: number, slot: IrAttachmentSlot, fileName: string): Observable<void> {
    return this.http
      .delete<ApiResponse<unknown>>(
        `${this.apiUrl}/integrated-requirements/${irSeq}/attachments/${slot}/${encodeURIComponent(fileName)}`,
        { context: new HttpContext().set(SUPPRESS_GLOBAL_ERROR, true) },
      )
      .pipe(map(() => undefined));
  }

  /** Reports the key Angular's direct S3 mirror call minted (see S3Service.store, called from
   *  WwellIrStore.mirrorToS3) back onto the stored attachment — purely so "indexed in S3" survives
   *  a reload. The attachment itself already succeeded before this ever runs, so this call is
   *  irrelevant to that outcome; the caller treats it as best-effort.
   *
   *  SUPPRESS_GLOBAL_ERROR: same reasoning as deleteIrAttachment/getIrAttachmentFile above — the
   *  caller swallows this failure silently rather than showing anything to the user. */
  recordAttachmentS3Key(irSeq: number, slot: IrAttachmentSlot, fileName: string, s3ObjectKey: string): Observable<void> {
    return this.http
      .patch<ApiResponse<never>>(
        `${this.apiUrl}/integrated-requirements/${irSeq}/attachments/${slot}/${encodeURIComponent(fileName)}/s3-key`,
        { s3ObjectKey },
        { context: new HttpContext().set(SUPPRESS_GLOBAL_ERROR, true) },
      )
      .pipe(map(() => undefined));
  }

  /**
   * Pulls one stored attachment back as a `File` so it can be handed to FilePreviewDialogComponent,
   * which previews from a File (it builds its own object URL) rather than from a remote URL.
   * Fetching through HttpClient also means the JWT interceptor authenticates it — a plain
   * `<a href>` to the same endpoint would not carry the token.
   */
  getIrAttachmentFile(irSeq: number, slot: IrAttachmentSlot, fileName: string): Observable<File> {
    return this.http
      .get(`${this.apiUrl}/integrated-requirements/${irSeq}/attachments/${slot}/${encodeURIComponent(fileName)}`, {
        responseType: 'blob',
        context: new HttpContext().set(SUPPRESS_GLOBAL_ERROR, true),
      })
      .pipe(map(blob => new File([blob], fileName, { type: blob.type })));
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
