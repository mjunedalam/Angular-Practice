import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { errorInterceptor } from '@interceptors/error.interceptor';

describe('errorInterceptor', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should rethrow HTTP errors from the next handler', (done) => {
    const request = new HttpRequest('GET', '/api/test');
    const error = new HttpErrorResponse({
      status: 500,
      statusText: 'Server Error',
    });
    const next = jest.fn(() => throwError(() => error));

    TestBed.runInInjectionContext(() => {
      errorInterceptor(request, next).subscribe({
        next: () => done.fail('Expected the interceptor to rethrow the error'),
        error: (receivedError) => {
          expect(receivedError).toBe(error);
          done();
        },
      });
    });
  });
});
