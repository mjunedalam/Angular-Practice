import { HttpErrorResponse } from '@angular/common/http';
import { extractHttpErrorMessage, registerServiceEndpoints } from './http-error.util';

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

describe('extractHttpErrorMessage when a service is unreachable', () => {
  beforeAll(() => {
    registerServiceEndpoints({
      planningServiceUrl: 'http://localhost:7070',
      dailyOperationServiceUrl: 'http://localhost:8080',
      sapServiceUrl: 'http://localhost:9090',
      s3ServiceUrl: 'http://localhost:9091',
    });
  });

  it.each([
    ['http://localhost:7070/api/irs', 'AGWA Planning service'],
    ['http://localhost:8080/daily-operations/api/v1/aquifers', 'Daily Operations service'],
    ['http://localhost:9090/sap/x', 'SAP integration service'],
    ['http://localhost:9091/files', 'Attachment (S3) service'],
  ])('names the service for %s', (url, name) => {
    const error = new HttpErrorResponse({ status: 0, url, error: new TypeError('Failed to fetch') });
    expect(extractHttpErrorMessage(error)).toContain(`${name} is not available`);
  });

  it('uses a generic message when the URL matches no known service', () => {
    const error = new HttpErrorResponse({ status: 0, url: 'https://elsewhere.example/x', error: new TypeError('Failed to fetch') });
    expect(extractHttpErrorMessage(error)).toBe('Unable to reach the server. Check your connection and try again.');
  });
});
