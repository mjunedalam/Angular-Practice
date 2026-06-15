import { HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { throwError } from 'rxjs';
import { errorInterceptor } from '@interceptors/error.interceptor';
import { AuthStore } from '../../features/auth/store/auth.store';
import { NotificationService } from '@shared/components/notification/notification.service';

describe('errorInterceptor', () => {
  const authStoreMock = {
    logout: jest.fn(),
  };
  const notificationServiceMock = {
    error: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthStore, useValue: authStoreMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    });
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
          expect(notificationServiceMock.error).toHaveBeenCalledTimes(1);
          done();
        },
      });
    });
  });
});
