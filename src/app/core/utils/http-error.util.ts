import { HttpErrorResponse } from '@angular/common/http';

interface ServiceEndpoint {
  readonly baseUrl: string;
  readonly name: string;
}

let serviceEndpoints: readonly ServiceEndpoint[] = [];

/** Called once the external config is loaded, so a refused connection can say WHICH backend is down. */
export function registerServiceEndpoints(settings: {
  planningServiceUrl?: string | null;
  dailyOperationServiceUrl?: string | null;
  sapServiceUrl?: string | null;
  s3ServiceUrl?: string | null;
}): void {
  const candidates: ServiceEndpoint[] = [
    { baseUrl: settings.planningServiceUrl ?? '', name: 'AGWA Planning service' },
    { baseUrl: settings.dailyOperationServiceUrl ?? '', name: 'Daily Operations service' },
    { baseUrl: settings.sapServiceUrl ?? '', name: 'SAP integration service' },
    { baseUrl: settings.s3ServiceUrl ?? '', name: 'Attachment (S3) service' },
  ];
  // Longest base URL first so a more specific prefix wins over a shorter one.
  serviceEndpoints = candidates
    .filter(endpoint => endpoint.baseUrl.length > 0)
    .sort((a, b) => b.baseUrl.length - a.baseUrl.length);
}

/** Status 0 = the request never reached a server (refused connection, DNS, offline, CORS). */
function unavailableMessage(error: HttpErrorResponse): string {
  const url = error.url ?? '';
  const match = serviceEndpoints.find(endpoint => url.startsWith(endpoint.baseUrl));
  return match
    ? `${match.name} is not available. Please try again later or contact support.`
    : 'Unable to reach the server. Check your connection and try again.';
}

// Requests using `responseType: 'text'` (e.g. the login token endpoint) get their
// error body decoded as a raw string instead of parsed JSON, so a plain
// `error.error?.message` misses those cases — this handles object, JSON-string,
// and plain-string bodies before falling back to the transport-level message.
export function extractHttpErrorMessage(error: HttpErrorResponse, fallback = 'An unexpected error occurred.'): string {
  // A transport failure carries the fetch TypeError / XHR ProgressEvent as its body, never a backend payload.
  const isTransportFailure = error.status === 0 && (error.error instanceof Error || error.error instanceof ProgressEvent);
  if (isTransportFailure) return unavailableMessage(error);

  const body = error.error;

  // `||`, not `??`, throughout: an empty-string field is as absent as a missing one
  // for display purposes, and should still fall through to the next source.
  if (body && typeof body === 'object') {
    return body.message || body.error || error.message || fallback;
  }

  if (typeof body === 'string' && body.trim().length > 0) {
    try {
      const parsed = JSON.parse(body);
      return parsed?.message || parsed?.error || body;
    } catch {
      return body;
    }
  }

  return error.message || fallback;
}
