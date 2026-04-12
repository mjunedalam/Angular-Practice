import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthStore } from '../store/auth/auth.store';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const authStoreMock = {
  isAuthenticated: jest.fn(),
  isTokenExpired: jest.fn(),
};

const routerMock = {
  navigate: jest.fn(),
};

function createRouteSnapshot(): ActivatedRouteSnapshot {
  // Only the properties accessed by the guard need to exist.
  return {} as ActivatedRouteSnapshot;
}
function createStateSnapshot(): RouterStateSnapshot {
  return {} as RouterStateSnapshot;
}


describe('authGuard (functional guard)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],          // only needed if AuthStore uses HttpClient
      providers: [
        { provide: AuthStore, useValue: authStoreMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should allow navigation when authenticated and token not expired', () => {
    authStoreMock.isAuthenticated.mockReturnValue(true);
    authStoreMock.isTokenExpired.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() =>
      authGuard(createRouteSnapshot(), createStateSnapshot())
    );

    expect(result).toBeTruthy();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to /login when not authenticated', () => {
    authStoreMock.isAuthenticated.mockReturnValue(false);
    authStoreMock.isTokenExpired.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => {
      authGuard(createRouteSnapshot(), createStateSnapshot())
    });

    expect(result).toBeFalsy();
    expect(routerMock.navigate).toHaveBeenCalledTimes(1);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  })

  it('should redirect to /login when token is expired', () => {
    authStoreMock.isAuthenticated.mockReturnValue(true);
    authStoreMock.isTokenExpired.mockReturnValue(true);

    TestBed.runInInjectionContext(() => {
      authStoreMock.isAuthenticated.mockReturnValue(true);
      authStoreMock.isTokenExpired.mockReturnValue(true);

      const result = TestBed.runInInjectionContext(() => {
        authGuard(createRouteSnapshot(), createStateSnapshot())
      });

      expect(result).toBeFalsy();
      expect(routerMock.navigate).toHaveBeenCalledTimes(1);
      expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    });
  })

});