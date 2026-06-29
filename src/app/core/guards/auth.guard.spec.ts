import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { authGuard } from '@guards/auth.guard';
import { AuthStore } from '../../features/auth/store/auth.store';

const authStoreMock = {
  isAuthenticated: jest.fn(),
  isTokenExpired: jest.fn(),
};

const routerMock = {
  createUrlTree: jest.fn(),
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
    expect(routerMock.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to login when not authenticated', () => {
    authStoreMock.isAuthenticated.mockReturnValue(false);
    authStoreMock.isTokenExpired.mockReturnValue(false);
    routerMock.createUrlTree.mockReturnValue({ url: '/login' });

    const result = TestBed.runInInjectionContext(() =>
      authGuard(createRouteSnapshot(), createStateSnapshot())
    );

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toEqual({ url: '/login' });
  });

  it('should redirect to login when token is expired', () => {
    authStoreMock.isAuthenticated.mockReturnValue(true);
    authStoreMock.isTokenExpired.mockReturnValue(true);
    routerMock.createUrlTree.mockReturnValue({ url: '/login' });

    const result = TestBed.runInInjectionContext(() =>
      authGuard(createRouteSnapshot(), createStateSnapshot())
    );

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/login']);
    expect(result).toEqual({ url: '/login' });
  });

});
