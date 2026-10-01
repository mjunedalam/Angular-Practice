import { HttpClient, HttpContext } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { S3StoreResponse } from '@models/s3/s3-object-store.model';
import { SKIP_AUTH } from '@interceptors/auth.interceptor';
import { SKIP_AUTO_LOGOUT, SUPPRESS_GLOBAL_ERROR } from '@interceptors/error.interceptor';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';

@Injectable({ providedIn: 'root' })
export class S3Service {
  private readonly http = inject(HttpClient);
  private readonly extConfigService = inject(ExternalConfigService);

  private get baseUrl(): string {
    return this.extConfigService.settings.s3ServiceUrl;
  }

  /**
   * The S3 object-store proxy is a third party on a different origin, exactly like SAP AAE — see
   * SapService.sapContext's doc comment for why all three opt-outs are load-bearing rather than
   * convenience: this app's own JWT must never go to it (SKIP_AUTH), a refusal from it is not this
   * app's session expiring (SKIP_AUTO_LOGOUT), and the caller (WwellIrStore.mirrorToS3) treats this
   * whole call as best-effort with its own silent handling, so the global interceptor must not also
   * toast it (SUPPRESS_GLOBAL_ERROR).
   */
  private get s3Context(): HttpContext {
    return new HttpContext().set(SKIP_AUTH, true).set(SKIP_AUTO_LOGOUT, true).set(SUPPRESS_GLOBAL_ERROR, true);
  }

  /** Mirrors a file already safely stored on agwa-planning into the S3 object-store proxy. Purely
   *  informational for the caller — see WwellIrStore.mirrorToS3, which never lets a failure here
   *  affect the upload the user actually asked for. */
  store(file: File, prefix: string, networkId: string, filename: string): Observable<S3StoreResponse> {
    const body = new FormData();
    body.append('file', file);
    body.append('prefix', prefix);
    body.append('network_id', networkId);
    body.append('filename', filename);
    body.append('content_type', file.type);
    body.append('custom_metadata', '');
    return this.http.post<S3StoreResponse>(`${this.baseUrl}/store`, body, { context: this.s3Context });
  }
}
