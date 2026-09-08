import { HttpErrorResponse } from '@angular/common/http';

// Requests using `responseType: 'text'` (e.g. the login token endpoint) get their
// error body decoded as a raw string instead of parsed JSON, so a plain
// `error.error?.message` misses those cases — this handles object, JSON-string,
// and plain-string bodies before falling back to the transport-level message.
export function extractHttpErrorMessage(error: HttpErrorResponse, fallback = 'An unexpected error occurred.'): string {
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
