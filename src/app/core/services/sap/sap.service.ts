import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SapTriggerRequest, SapTriggerResponse } from '@models/sap/sap-trigger.model';
import { SapRecallResponse, SapWorkflowStatusResponse } from '@models/sap/sap-workflow-status.model';
import { SKIP_AUTH } from '@interceptors/auth.interceptor';
import { SKIP_AUTO_LOGOUT, SUPPRESS_GLOBAL_ERROR } from '@interceptors/error.interceptor';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';

@Injectable({ providedIn: 'root' })
export class SapService {
  private readonly http = inject(HttpClient);
  private readonly extConfigService = inject(ExternalConfigService);

  private get baseUrl(): string {
    return this.extConfigService.settings.sapServiceUrl;
  }

  /**
   * SAP AAE is a third party on a different origin, so none of this app's own request conventions
   * apply to it — all three opt-outs below are load-bearing, each for a failure confirmed live:
   *
   * - SKIP_AUTH: authInterceptor otherwise attaches this app's own AGWA JWT to every outgoing
   *   request, which sent our internal bearer token to an external host on every submit.
   * - SKIP_AUTO_LOGOUT: errorInterceptor treats any 401 as "this app's session expired" and calls
   *   authStore.logout(). SAP rejecting a request it was never going to accept is not our session
   *   expiring — without this, one SAP 401 signs the user out of AGWA mid-submit (and, because
   *   that branch returns EMPTY rather than rethrowing, WwellIrStore's own error handler never
   *   runs, so the workflow id is never recorded and the Submit spinner never clears).
   * - SUPPRESS_GLOBAL_ERROR: WwellIrStore surfaces its own sapTriggerError/timeline toast; without
   *   this the user gets two toasts for the same failure.
   */
  private get sapContext(): HttpContext {
    return new HttpContext().set(SKIP_AUTH, true).set(SKIP_AUTO_LOGOUT, true).set(SUPPRESS_GLOBAL_ERROR, true);
  }

  trigger(request: SapTriggerRequest): Observable<SapTriggerResponse> {
    const params = new HttpParams().set('native_response', 'false');
    return this.http.post<SapTriggerResponse>(`${this.baseUrl}/trigger`, request, { params, context: this.sapContext });
  }

  /** Backs the IR "Approval Workflow" sidebar — `wfObjId` is the raw sap_wf_id minted and stamped
   *  onto the header by the trigger flow (see wwell-ir-sap.config.ts), not the display-only
   *  composite string. */
  getWorkflowStatus(processId: string, wfObjId: number): Observable<SapWorkflowStatusResponse> {
    const params = new HttpParams().set('process_id', processId).set('wf_obj_id', String(wfObjId)).set('native_response', 'false');
    return this.http.get<SapWorkflowStatusResponse>(`${this.baseUrl}/display`, { params, context: this.sapContext });
  }

  /** Backs the IR "Recall" action, available once a record has a `sapWfId` (i.e. was already
   *  submitted) — `wfObjId` is the same raw id `getWorkflowStatus` looks up, `recalledBy` the
   *  acting user's network id (see WwellIrStore.recallIr / AuthStore.networkId). Returns a bare
   *  acknowledgement (`{ message: "Request <n> recalled successfully" }`), **not** the
   *  `SapWorkflowStatusResponse` shape `getWorkflowStatus` does — confirmed live in production,
   *  correcting an earlier assumption that the shapes matched. Callers that need the workflow's
   *  post-recall status/chain must ask `getWorkflowStatus` for it separately. */
  recall(processId: string, wfObjId: number, recalledBy: string): Observable<SapRecallResponse> {
    const params = new HttpParams()
      .set('process_id', processId)
      .set('wf_obj_id', String(wfObjId))
      .set('recalled_by', recalledBy)
      .set('native_response', 'false');
    return this.http.delete<SapRecallResponse>(`${this.baseUrl}/recall`, { params, context: this.sapContext });
  }
}
