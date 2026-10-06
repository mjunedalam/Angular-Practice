import { HttpClient, HttpContext, HttpEventType, HttpParams, HttpRequest, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, filter, map } from 'rxjs';
import { S3DeleteResponse, S3FetchResponse, S3SearchResponse, S3StoreResponse, S3StoreUploadEvent } from '@models/s3/s3-object-store.model';
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
   * app's session expiring (SKIP_AUTO_LOGOUT), and callers surface their own inline error handling
   * for it, so the global interceptor must not also toast it (SUPPRESS_GLOBAL_ERROR).
   */
  private get s3Context(): ReturnType<HttpContext['set']> {
    return new HttpContext().set(SKIP_AUTH, true).set(SKIP_AUTO_LOGOUT, true).set(SUPPRESS_GLOBAL_ERROR, true);
  }

  /**
   * Stores a file — this app's only attachment storage now (see ir-attachment.model.ts's class
   * doc comment; agwa-planning has none of its own). Reports real byte-level upload progress via
   * `HttpRequest` + `reportProgress`, same as the old agwa-planning upload endpoint used to, so the
   * editor's progress bar keeps tracking actual bytes transferred rather than animating a guess.
   *
   * Emits `{ percent, response: null }` while the body is still being sent, then one final
   * `{ percent: 100, response }` carrying the stored object's key. Multipart, so no explicit
   * Content-Type header — the browser sets it itself to include the boundary.
   */
  store(file: File, prefix: string, networkId: string, filename: string): Observable<S3StoreUploadEvent> {
    const body = new FormData();
    body.append('file', file);
    body.append('prefix', prefix);
    body.append('network_id', networkId);
    body.append('filename', filename);
    body.append('content_type', file.type);
    body.append('custom_metadata', '');
    const request = new HttpRequest<FormData>('POST', `${this.baseUrl}/store`, body, {
      reportProgress: true,
      context: this.s3Context,
    });

    return this.http.request<S3StoreResponse>(request).pipe(
      filter(event => event.type === HttpEventType.UploadProgress || event.type === HttpEventType.Response),
      map(event => {
        if (event.type === HttpEventType.UploadProgress) {
          const percent = event.total ? Math.round((100 * event.loaded) / event.total) : 0;
          return { percent, response: null };
        }
        const response = event as HttpResponse<S3StoreResponse>;
        return { percent: 100, response: response.body ?? null };
      }),
    );
  }

  /** Removes a previously-stored object. See WwellIrStore.deleteIrAttachment, which never lets a
   *  failure here (object already gone, an unsafe key, the store rejecting the request, etc. — see
   *  the proxy's documented 400/403/404/422 responses) show anything beyond its own inline error,
   *  since by the time this runs the attachment is already considered deleted from the IR's point
   *  of view. */
  delete(objectKey: string, networkId: string): Observable<S3DeleteResponse> {
    return this.http.post<S3DeleteResponse>(
      `${this.baseUrl}/delete`,
      { object_key: objectKey, network_id: networkId },
      { context: this.s3Context },
    );
  }

  /** Every object whose key contains `query` as a substring (the real proxy's only matching mode —
   *  no exact prefix anchor), newest-first. Callers list "everything under this IR" with a prefix
   *  ending in `/` (see WwellIrStore.loadIrAttachments) so, say, IR 900's query can never match IR
   *  9006's objects. */
  search(query: string): Observable<S3SearchResponse> {
    return this.http.get<S3SearchResponse>(`${this.baseUrl}/search`, {
      params: new HttpParams().set('q', query),
      context: this.s3Context,
    });
  }

  /** Pulls one stored object back as a `File` so it can be handed to the attachment viewer the same
   *  way a locally-picked file is — the viewer builds its own object URL from a File rather than a
   *  remote URL. The proxy's `POST /fetch` answers with a JSON envelope whose `content` is the bytes
   *  base64-encoded, so it's decoded here. `fileName` comes from the caller (the attachment's own
   *  display name); the type prefers the envelope's own `content_type`. */
  download(objectKey: string, fileName: string): Observable<File> {
    return this.fetch(objectKey).pipe(
      map(response => new File([decodeBase64(response.content)], fileName, { type: response.content_type })),
    );
  }

  /** The raw `POST /fetch` envelope — `content` is already base64, so callers that need base64
   *  (e.g. the SAP trigger's `attachment_files`) can use it as-is instead of decoding and re-encoding. */
  fetch(objectKey: string): Observable<S3FetchResponse> {
    return this.http.post<S3FetchResponse>(`${this.baseUrl}/fetch`, { object_key: objectKey }, { context: this.s3Context });
  }
}

function decodeBase64(content: string): Uint8Array<ArrayBuffer> {
  return Uint8Array.from(atob(content), char => char.charCodeAt(0));
}
