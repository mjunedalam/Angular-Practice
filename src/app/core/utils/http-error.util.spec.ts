import { HttpErrorResponse } from '@angular/common/http';
import { extractHttpErrorMessage } from './http-error.util';

describe('extractHttpErrorMessage', () => {
  it('returns message from a JSON object error body', () => {
    const error = new HttpErrorResponse({ error: { message: 'Invalid credentials' } });
    expect(extractHttpErrorMessage(error)).toBe('Invalid credentials');
  });

  it('falls back to the error body\'s `error` field when `message` is absent', () => {
    const error = new HttpErrorResponse({ error: { error: 'Account locked' } });
    expect(extractHttpErrorMessage(error)).toBe('Account locked');
  });

  it('parses a JSON-string error body (responseType: "text" requests)', () => {
    const error = new HttpErrorResponse({ error: '{"message":"Session expired"}' });
    expect(extractHttpErrorMessage(error)).toBe('Session expired');
  });

  it('uses a plain-string error body as-is', () => {
    const error = new HttpErrorResponse({ error: 'Bad gateway' });
    expect(extractHttpErrorMessage(error)).toBe('Bad gateway');
  });

  it('falls back to the transport-level message when the body is empty', () => {
    const error = new HttpErrorResponse({ error: '', statusText: 'Unknown Error' });
    expect(extractHttpErrorMessage(error)).toContain('Http failure response');
  });

  it('uses the provided fallback when nothing else is available', () => {
    const error = new HttpErrorResponse({});
    Object.defineProperty(error, 'message', { value: '' });
    expect(extractHttpErrorMessage(error, 'Login Failed')).toBe('Login Failed');
  });
});
