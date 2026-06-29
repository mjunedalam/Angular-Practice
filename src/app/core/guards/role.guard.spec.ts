import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { of } from 'rxjs';
import { roleGuard } from './role.guard';
import { RbacStore } from '@store/rbac/rbac.store';

const rbacStoreMock = {
  isLoaded: jest.fn(() => true),
  hasPermission: jest.fn(),
};

const routerMock = {
  createUrlTree: jest.fn(),
};

function createRoute(routeId?: string): ActivatedRouteSnapshot {
  return { data: routeId ? { routeId } : {} } as unknown as ActivatedRouteSnapshot;
}

function createState(): RouterStateSnapshot {
  return {} as RouterStateSnapshot;
}

describe('roleGuard', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      providers: [
        { provide: RbacStore, useValue: rbacStoreMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();
  });

  it('allows navigation when rbac is loaded and permission granted', (done) => {
    rbacStoreMock.hasPermission.mockReturnValue(true);

    const result$ = TestBed.runInInjectionContext(() =>
      roleGuard(createRoute('some-route'), createState()),
    ) as ReturnType<typeof of>;

    (result$ as ReturnType<typeof of>).subscribe((val) => {
      expect(val).toBe(true);
      done();
    });
  });

  it('redirects to /main/home when permission denied', (done) => {
    rbacStoreMock.hasPermission.mockReturnValue(false);
    routerMock.createUrlTree.mockReturnValue({ url: '/main/home' });

    const result$ = TestBed.runInInjectionContext(() =>
      roleGuard(createRoute('restricted-route'), createState()),
    ) as ReturnType<typeof of>;

    (result$ as ReturnType<typeof of>).subscribe((val) => {
      expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/main/home']);
      expect(val).toEqual({ url: '/main/home' });
      done();
    });
  });
});
