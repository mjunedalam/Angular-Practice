import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { roleGuard } from './role.guard';
import { RbacStore } from '@store/rbac/rbac.store';
import { AuthStore } from 'src/app/features/auth/store/auth.store';
import { ExternalConfigService } from '@shared/services/external-config.service';
import { NotificationService } from '@shared/components/notification/notification.service';

const rbacStoreMock = {
  isLoaded: jest.fn(() => true),
  hasPermission: jest.fn(),
  needsRefresh: jest.fn(() => false),
  loadPermissions: jest.fn(() => Promise.resolve()),
};

const authStoreMock = {
  token: jest.fn(() => 'mock-token'),
  logout: jest.fn(),
};

const externalConfigMock = {
  settings: { dailyOperationServiceUrl: 'http://localhost:8080' },
};

const notificationServiceMock = {
  error: jest.fn(),
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
        { provide: AuthStore, useValue: authStoreMock },
        { provide: ExternalConfigService, useValue: externalConfigMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    }).compileComponents();
  });

  it('allows navigation when rbac is loaded and permission granted', async () => {
    rbacStoreMock.hasPermission.mockReturnValue(true);

    const result = await TestBed.runInInjectionContext(() =>
      roleGuard(createRoute('some-route'), createState()),
    );

    expect(result).toBe(true);
  });

  it('redirects to /main/home when permission denied', async () => {
    rbacStoreMock.hasPermission.mockReturnValue(false);
    routerMock.createUrlTree.mockReturnValue({ url: '/main/home' });

    const result = await TestBed.runInInjectionContext(() =>
      roleGuard(createRoute('restricted-route'), createState()),
    );

    expect(routerMock.createUrlTree).toHaveBeenCalledWith(['/main/home']);
    expect(result).toEqual({ url: '/main/home' });
    expect(notificationServiceMock.error).toHaveBeenCalled();
  });
});
