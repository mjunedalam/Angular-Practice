import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SapTriggerRequest, SapTriggerResponse } from '@models/sap/sap-trigger.model';
import { SKIP_AUTH } from '@interceptors/auth.interceptor';
import { SKIP_AUTO_LOGOUT, SUPPRESS_GLOBAL_ERROR } from '@interceptors/error.interceptor';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';

@Injectable({ providedIn: 'root' })
export class SapService {
  private readonly http = inject(HttpClient);
  private readonly extConfigService = inject(ExternalConfigService);

  private get apiUrl(): string {
    return `${this.extConfigService.settings.sapServiceUrl}/trigger`;
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
   * - SUPPRESS_GLOBAL_ERROR: WwellIrStore surfaces its own sapTriggerError toast; without this the
   *   user gets two toasts for the same failure.
   */
  trigger(request: SapTriggerRequest): Observable<SapTriggerResponse> {
    const params = new HttpParams().set('native_response', 'false');
    const context = new HttpContext()
      .set(SKIP_AUTH, true)
      .set(SKIP_AUTO_LOGOUT, true)
      .set(SUPPRESS_GLOBAL_ERROR, true);
    return this.http.post<SapTriggerResponse>(this.apiUrl, request, { params, context });
  }
}
