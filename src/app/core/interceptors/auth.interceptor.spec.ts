import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthStore } from '../store/auth/auth.store';

describe('authInterceptor', () => {
  const authStoreMock = {
    token: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStore, useValue: authStoreMock },
      ],
    });
  });

  it('should pass the request through unchanged when no token exists', () => {
    authStoreMock.token.mockReturnValue(null);
    const request = new HttpRequest('GET', '/api/test');
    const next: jest.MockedFunction<HttpHandlerFn> = jest.fn((req) =>
      of(new HttpResponse({ status: 200, body: req.url })),
    );

    TestBed.runInInjectionContext(() => {
      authInterceptor(request, next).subscribe();
    });

    expect(next).toHaveBeenCalledWith(request);
  });

  it('should attach the authorization header when a token exists', () => {
    authStoreMock.token.mockReturnValue('mock-token');
    const request = new HttpRequest('GET', '/api/test');
    const next: jest.MockedFunction<HttpHandlerFn> = jest.fn((req) => {
      expect(req.headers.get('Authorization')).toBe('Bearer mock-token');
      return of(new HttpResponse({ status: 200, body: req.url }));
    });

    TestBed.runInInjectionContext(() => {
      authInterceptor(request, next).subscribe();
    });

    expect(next).toHaveBeenCalledTimes(1);
  });
});
