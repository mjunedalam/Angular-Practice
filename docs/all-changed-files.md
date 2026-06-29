# All Changed & Untracked Files — Consolidated

Generated: 2026-06-25 | Branch: `feature/rbac` | Total: 61

---

## Index

1. [package.json](#file-1)
2. [src/app/core/guards/auth.guard.spec.ts](#file-2)
3. [src/app/core/services/email/email.service.spec.ts](#file-3)
4. [src/app/features/home/home.component.spec.ts](#file-4)
5. [src/app/layout/layout.component.spec.ts](#file-5)
6. [src/app/layout/sidebar/left-sidenav.component.spec.ts](#file-6)
7. [src/app/app.component.spec.ts](#file-7)
8. [src/app/core/guards/role.guard.spec.ts](#file-8)
9. [src/app/core/services/active-well-view.service.spec.ts](#file-9)
10. [src/app/core/services/api-http.service.spec.ts](#file-10)
11. [src/app/core/services/daily-operation.service.spec.ts](#file-11)
12. [src/app/core/services/esri-map.service.spec.ts](#file-12)
13. [src/app/core/services/pres-docs.service.spec.ts](#file-13)
14. [src/app/core/services/well-docs.service.spec.ts](#file-14)
15. [src/app/core/store/email/email.store.spec.ts](#file-15)
16. [src/app/core/store/well-docs/well-docs.store.spec.ts](#file-16)
17. [src/app/features/active-wwell/active-wwell-form.service.spec.ts](#file-17)
18. [src/app/features/active-wwell/active-wwell-ui.store.spec.ts](#file-18)
19. [src/app/features/active-wwell/active-wwell-view/active-wwell-view.component.spec.ts](#file-19)
20. [src/app/features/active-wwell/active-wwell.helpers.spec.ts](#file-20)
21. [src/app/features/active-wwell/add-status-dialog/add-status-dialog.component.spec.ts](#file-21)
22. [src/app/features/active-wwell/casing-info/casing-info.component.spec.ts](#file-22)
23. [src/app/features/active-wwell/database-info/database-info.component.spec.ts](#file-23)
24. [src/app/features/active-wwell/formation-tops-and-casing/formation-tops-and-casing.component.spec.ts](#file-24)
25. [src/app/features/active-wwell/operation-summary/operation-summary.component.spec.ts](#file-25)
26. [src/app/features/active-wwell/store/active-wwell.store.spec.ts](#file-26)
27. [src/app/features/active-wwell/wwell-header/wwell-header.component.spec.ts](#file-27)
28. [src/app/features/active-wwell/wwell-test/wwell-test.component.spec.ts](#file-28)
29. [src/app/features/auth/store/auth.store.spec.ts](#file-29)
30. [src/app/features/morning-report/morning-report.component.spec.ts](#file-30)
31. [src/app/features/morning-report/store/morning-report.store.spec.ts](#file-31)
32. [src/app/features/presentation/active-wwell-docs-viewer/active-wwell-docs-viewer.component.spec.ts](#file-32)
33. [src/app/features/presentation/active-wwell-map/active-wwell-map.component.spec.ts](#file-33)
34. [src/app/features/presentation/depth-scale/depth-scale.component.spec.ts](#file-34)
35. [src/app/features/presentation/misc-pres-well-data/misc-pres-well-data.component.spec.ts](#file-35)
36. [src/app/features/presentation/offset-wwells/offset-wwells.component.spec.ts](#file-36)
37. [src/app/features/presentation/picked-formation-tops/picked-formation-tops.component.spec.ts](#file-37)
38. [src/app/features/presentation/presentation.component.spec.ts](#file-38)
39. [src/app/features/presentation/store/presentation.store.spec.ts](#file-39)
40. [src/app/features/presentation/well-bore-view/well-bore-view.component.spec.ts](#file-40)
41. [src/app/features/presentation/well-name-chips/well-name-chips.component.spec.ts](#file-41)
42. [src/app/features/presentation/wwell-test-result/wwell-test-result.component.spec.ts](#file-42)
43. [src/app/features/presentation/wwells-logs-indicators/wwells-logs-indicators.component.spec.ts](#file-43)
44. [src/app/features/water-wells-overview/water-wells-overview.component.spec.ts](#file-44)
45. [src/app/features/wwell-map/wwell-map.component.spec.ts](#file-45)
46. [src/app/shared/components/confirm-dialog/confirm-dialog.component.spec.ts](#file-46)
47. [src/app/shared/components/confirm-dialog/confirm-dialog.service.spec.ts](#file-47)
48. [src/app/shared/components/draggable-card/draggable-card.component.spec.ts](#file-48)
49. [src/app/shared/components/file-upload/file-preview-dialog/file-preview-dialog.component.spec.ts](#file-49)
50. [src/app/shared/components/file-upload/file-upload.component.spec.ts](#file-50)
51. [src/app/shared/components/global-loader/global-loader.component.spec.ts](#file-51)
52. [src/app/shared/components/notification/notification.component.spec.ts](#file-52)
53. [src/app/shared/components/notification/notification.service.spec.ts](#file-53)
54. [src/app/shared/components/resize-divider/resize-divider.component.spec.ts](#file-54)
55. [src/app/shared/directives/rbac/has-permission.directive.spec.ts](#file-55)
56. [src/app/shared/services/build-info.service.spec.ts](#file-56)
57. [src/app/shared/utils/date.util.spec.ts](#file-57)
58. [src/app/shared/utils/well-data.validator.spec.ts](#file-58)
59. [src/app/shared/utils/well-test-math.util.spec.ts](#file-59)
60. [src/app/shared/utils/wellbore-math.util.spec.ts](#file-60)
61. [src/app/shared/utils/wwell-placement-utils.spec.ts](#file-61)

---

## File 1

**`package.json`**

```json
{
  "name": "agwa-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "ng": "ng",
    "prestart": "node scripts/sync-local-build-info.js && ng lint",
    "start": "ng serve",
    "prebuild": "ng lint",
    "build": "ng build",
    "build:prod": "ng build --configuration production",
    "test": "jest",
    "test:coverage": "jest --coverage --runInBand",
    "lint": "ng lint"
  },
  "dependencies": {
    "@angular/animations": "19.2.4",
    "@angular/cdk": "19.2.19",
    "@angular/common": "19.2.4",
    "@angular/compiler": "19.2.4",
    "@angular/core": "19.2.4",
    "@angular/forms": "19.2.4",
    "@angular/material": "19.2.19",
    "@angular/platform-browser": "19.2.4",
    "@angular/platform-browser-dynamic": "19.2.4",
    "@angular/router": "19.2.4",
    "@arcgis/core": "^4.33.12",
    "@auth0/angular-jwt": "^5.2.0",
    "@ngrx/operators": "19.0.1",
    "@ngrx/signals": "19.0.1",
    "ag-grid-angular": "^35.1.0",
    "ag-grid-community": "^35.1.0",
    "d3-ease": "3.0.1",
    "d3-scale": "4.0.2",
    "d3-selection": "3.0.0",
    "d3-transition": "3.0.1",
    "material-icons": "^1.13.14",
    "rxjs": "7.8.1",
    "tslib": "2.8.1",
    "zone.js": "0.15.0"
  },
  "devDependencies": {
    "@angular-devkit/build-angular": "19.2.4",
    "@angular/cli": "19.2.4",
    "@angular/compiler-cli": "19.2.4",
    "@types/d3-ease": "3.0.2",
    "@types/d3-scale": "4.0.9",
    "@types/d3-selection": "3.0.11",
    "@types/d3-transition": "3.0.9",
    "@types/jasmine": "5.1.7",
    "@types/jest": "^29.5.14",
    "@types/node": "22.14.0",
    "angular-eslint": "19.0.2",
    "autoprefixer": "^10.5.0",
    "eslint": "^9.16.0",
    "jasmine-core": "5.6.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "jest-preset-angular": "^16.1.2",
    "karma": "6.4.4",
    "postcss": "^8.5.10",
    "ts-jest": "^29.2.5",
    "typescript": "^5.7.3",
    "typescript-eslint": "8.18.0"
  }
}
```

---

## File 2

**`src/app/core/guards/auth.guard.spec.ts`**

```ts
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
```

---

## File 3

**`src/app/core/services/email/email.service.spec.ts`**

```ts
import { TestBed } from '@angular/core/testing';

import { EmailService } from '@services/email/email.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { EMAIL_SUBJECT, EMAIL_TEMPLATE_NAME } from 'src/app/shared/models/config/email.config';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        EmailService,
        {
          provide: ExternalConfigService,
          useValue: {
            settings: {
              emailServiceUrl: 'https://example.test',
            },
          },
        },
      ]
    });
    service = TestBed.inject(EmailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('builds an email request addressed to the current user email', () => {
    const request = service.buildEmailRequest([], 'map-image-data', 'junedalam@aramco.com', undefined, '2024-01-15');

    expect(request).toEqual({
      subject: EMAIL_SUBJECT,
      from: 'junedalam@aramco.com',
      to: ['junedalam@aramco.com'],
      cc: ['junedalam@aramco.com'],
      bcc: ['junedalam@aramco.com'],
      replyTo: '',
      templateName: EMAIL_TEMPLATE_NAME,
      generatePdf: false,
      templateData: {
        morningReport: [],
        mapImageData: 'map-image-data',
        waterWellTestResults: undefined,
        mrReportDate: 'Monday 15 January 2024',
      },
    });
  });
});
```

---

## File 4

**`src/app/features/home/home.component.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { HomeComponent } from './home.component';
import { AuthStore } from '../auth/store/auth.store';
import { RbacStore } from '@store/rbac/rbac.store';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  const routerMock = {
    navigate: jest.fn(),
  };
  const authStoreMock = {
    user: jest.fn(() => ({ groups: ['GWD_admin'] })),
  };
  const rbacStoreMock = {
    hasPermission: jest.fn(() => true),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthStore, useValue: authStoreMock },
        { provide: RbacStore, useValue: rbacStoreMock },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

---

## File 5

**`src/app/layout/layout.component.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { LayoutComponent } from './layout.component';
import { AuthStore } from 'src/app/features/auth/store/auth.store';
import { RbacStore } from '@store/rbac/rbac.store';

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;
  const routerEvents$ = new Subject<unknown>();
  const routerMock = {
    url: '/main/home',
    events: routerEvents$,
    navigate: jest.fn(),
  };
  const authStoreMock = {
    user: jest.fn(() => ({ groups: ['GWD_admin'] })),
    userEmail: jest.fn(() => 'jane.doe@aramco.com'),
    lastLogin: jest.fn(() => null),
    displayUsername: jest.fn(() => 'jane.doe'),
    logout: jest.fn(),
  };
  const rbacStoreMock = {
    roleDefinitions: jest.fn(() => []),
    hasPermission: jest.fn(() => true),
  };
  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [LayoutComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthStore, useValue: authStoreMock },
        { provide: RbacStore, useValue: rbacStoreMock },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

---

## File 6

**`src/app/layout/sidebar/left-sidenav.component.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftSidenavComponent } from './left-sidenav.component';
import { AuthStore } from '../../features/auth/store/auth.store';
import { RbacStore } from '@store/rbac/rbac.store';

describe('LeftSidenavComponent', () => {
  let component: LeftSidenavComponent;
  let fixture: ComponentFixture<LeftSidenavComponent>;
  const authStoreMock = {
    user: jest.fn(() => ({ groups: ['GWD_admin'] })),
  };
  const rbacStoreMock = {
    hasPermission: jest.fn(() => true),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [LeftSidenavComponent],
      providers: [
        { provide: AuthStore, useValue: authStoreMock },
        { provide: RbacStore, useValue: rbacStoreMock },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeftSidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

---

## File 7

**`src/app/app.component.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { LoaderService } from '@shared/components/global-loader/loader.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

const loaderServiceMock = {
  isLoading: jest.fn(() => false),
  isLoginLoading: jest.fn(() => false),
  progress: jest.fn(() => 0),
  message: jest.fn(() => ''),
};

const notificationServiceMock = {
  show: jest.fn(),
  error: jest.fn(),
  notifications: jest.fn(() => []),
  dismiss: jest.fn(),
};

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: LoaderService, useValue: loaderServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
```

---

## File 8

**`src/app/core/guards/role.guard.spec.ts`**

```ts
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
```

---

## File 9

**`src/app/core/services/active-well-view.service.spec.ts`**

```ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActiveWellViewService } from './active-well-view.service';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';

const externalConfigMock = {
  settings: { dailyOperationServiceUrl: 'http://api.test' },
};

describe('ActiveWellViewService', () => {
  let service: ActiveWellViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ActiveWellViewService,
        { provide: ExternalConfigService, useValue: externalConfigMock },
      ],
    });
    service = TestBed.inject(ActiveWellViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

---

## File 10

**`src/app/core/services/api-http.service.spec.ts`**

```ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiHttpService } from './api-http.service';

describe('ApiHttpService', () => {
  let service: ApiHttpService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiHttpService],
    });
    service = TestBed.inject(ApiHttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('get() sends a GET request', (done) => {
    service.get<{ id: number }>('/test').subscribe((res) => {
      expect(res).toEqual({ id: 1 });
      done();
    });
    const req = httpMock.expectOne('/test');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 1 });
  });

  it('post() sends a POST request', (done) => {
    service.post<{ ok: boolean }>('/test', { name: 'x' }).subscribe((res) => {
      expect(res.ok).toBe(true);
      done();
    });
    const req = httpMock.expectOne('/test');
    expect(req.request.method).toBe('POST');
    req.flush({ ok: true });
  });
});
```

---

## File 11

**`src/app/core/services/daily-operation.service.spec.ts`**

```ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DailyOperationService } from './daily-operation.service';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';

const externalConfigMock = {
  settings: { dailyOperationServiceUrl: 'http://api.test' },
};

describe('DailyOperationService', () => {
  let service: DailyOperationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        DailyOperationService,
        { provide: ExternalConfigService, useValue: externalConfigMock },
      ],
    });
    service = TestBed.inject(DailyOperationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getWellList() sends GET to well list endpoint', (done) => {
    service.getWellList('2024-01-01').subscribe((res) => {
      expect(res).toEqual([]);
      done();
    });
    const req = httpMock.expectOne((r) => r.url.includes('/entry'));
    expect(req.request.method).toBe('GET');
    req.flush({ data: [] });
  });
});
```

---

## File 12

**`src/app/core/services/esri-map.service.spec.ts`**

```ts
jest.mock('@arcgis/core/identity/IdentityManager', () => ({
  default: { registerToken: jest.fn(), checkSignInStatus: jest.fn(() => Promise.resolve()) },
}));

import { TestBed } from '@angular/core/testing';
import { EsriMapService } from './esri-map.service';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';

const externalConfigMock = {
  settings: { portalUrl: 'https://portal.test', tokenUrl: 'https://token.test' },
};

describe('EsriMapService', () => {
  let service: EsriMapService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EsriMapService,
        { provide: ExternalConfigService, useValue: externalConfigMock },
      ],
    });
    service = TestBed.inject(EsriMapService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

---

## File 13

**`src/app/core/services/pres-docs.service.spec.ts`**

```ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PresDocsService } from './pres-docs.service';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';

const externalConfigMock = {
  settings: { dailyOperationServiceUrl: 'http://api.test' },
};

describe('PresDocsService', () => {
  let service: PresDocsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PresDocsService,
        { provide: ExternalConfigService, useValue: externalConfigMock },
      ],
    });
    service = TestBed.inject(PresDocsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

---

## File 14

**`src/app/core/services/well-docs.service.spec.ts`**

```ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WellDocsService } from './well-docs.service';

describe('WellDocsService', () => {
  let service: WellDocsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [WellDocsService],
    });
    service = TestBed.inject(WellDocsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

---

## File 15

**`src/app/core/store/email/email.store.spec.ts`**

```ts
import { TestBed } from '@angular/core/testing';
import { EmailStore } from './email.store';
import { EmailService } from '@services/email/email.service';
import { of } from 'rxjs';

const emailServiceMock = {
  sendEmail: jest.fn(() => of(200)),
};

describe('EmailStore', () => {
  let store: InstanceType<typeof EmailStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        EmailStore,
        { provide: EmailService, useValue: emailServiceMock },
      ],
    });
    store = TestBed.inject(EmailStore);
  });

  it('should have idle status initially', () => {
    expect(store.status()).toBe('idle');
    expect(store.error()).toBeNull();
  });

  it('isIdle should be true initially', () => {
    expect(store.isIdle()).toBe(true);
    expect(store.isSending()).toBe(false);
    expect(store.isSent()).toBe(false);
    expect(store.hasFailed()).toBe(false);
  });
});
```

---

## File 16

**`src/app/core/store/well-docs/well-docs.store.spec.ts`**

```ts
import { TestBed } from '@angular/core/testing';
import { WellDocsStore } from './well-docs.store';
import { PresDocsService } from '@services/pres-docs.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const presDocsServiceMock = {
  getDocs: jest.fn(),
  uploadDocs: jest.fn(),
  removeDoc: jest.fn(),
};

const notificationServiceMock = {
  show: jest.fn(),
  error: jest.fn(),
  notifications: jest.fn(() => []),
  dismiss: jest.fn(),
};

describe('WellDocsStore', () => {
  let store: InstanceType<typeof WellDocsStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        WellDocsStore,
        { provide: PresDocsService, useValue: presDocsServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    });
    store = TestBed.inject(WellDocsStore);
  });

  it('should have empty docs initially', () => {
    expect(store.docs()).toBeDefined();
  });

  it('docsByCategory computed should return object', () => {
    expect(typeof store.docsByCategory()).toBe('object');
  });

  it('categories computed should return array', () => {
    expect(Array.isArray(store.categories())).toBe(true);
  });

  it('totalCount computed should return a number', () => {
    expect(typeof store.totalCount()).toBe('number');
  });
});
```

---

## File 17

**`src/app/features/active-wwell/active-wwell-form.service.spec.ts`**

```ts
import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActiveWwellFormService } from './active-wwell-form.service';

describe('ActiveWwellFormService', () => {
  let service: ActiveWwellFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [ActiveWwellFormService],
    });
    service = TestBed.inject(ActiveWwellFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('drillingRemarksForm has required fields', () => {
    const form = service.drillingRemarksForm;
    expect(form.get('epANum')).toBeTruthy();
    expect(form.get('wActDt')).toBeTruthy();
    expect(form.get('area')).toBeTruthy();
    expect(form.get('status')).toBeTruthy();
  });

  it('drillingRemarksForm is invalid when empty', () => {
    expect(service.drillingRemarksForm.valid).toBe(false);
  });

  it('wellTestForm has required fields', () => {
    const form = service.wellTestForm;
    expect(form.get('epANum')).toBeTruthy();
    expect(form.get('rsvrCd')).toBeTruthy();
    expect(form.get('hydTestTypCd')).toBeTruthy();
  });

  it('wellTestForm hydTestTypCd defaults to STP1', () => {
    expect(service.wellTestForm.get('hydTestTypCd')?.value).toBe('STP1');
  });
});
```

---

## File 18

**`src/app/features/active-wwell/active-wwell-ui.store.spec.ts`**

```ts
import { ActiveWwellUiStore } from './active-wwell-ui.store';

describe('ActiveWwellUiStore', () => {
  let store: ActiveWwellUiStore;

  beforeEach(() => {
    store = new ActiveWwellUiStore();
  });

  it('initializes isUpdating to false', () => {
    expect(store.isUpdating()).toBe(false);
  });

  it('setUpdating toggles isUpdating', () => {
    store.setUpdating(true);
    expect(store.isUpdating()).toBe(true);
    store.setUpdating(false);
    expect(store.isUpdating()).toBe(false);
  });

  it('has default statusOptions', () => {
    expect(store.statusOptions().length).toBeGreaterThan(0);
  });

  it('addStatusOption normalizes and adds a new status', () => {
    const initial = store.statusOptions().length;
    store.addStatusOption('CustomStatus');
    expect(store.statusOptions().length).toBe(initial + 1);
    expect(store.statusOptions()).toContain('CustomStatus');
  });

  it('addStatusOption does not add duplicate (case-insensitive)', () => {
    store.addStatusOption('Drilling');
    const afterFirst = store.statusOptions().length;
    store.addStatusOption('drilling');
    expect(store.statusOptions().length).toBe(afterFirst);
  });

  it('setStatusForWell sets status for a well', () => {
    store.setStatusForWell(1001, 'Drilling');
    expect(store.statusForWell(1001)).toBe('Drilling');
  });

  it('statusForWell returns null for unknown well', () => {
    expect(store.statusForWell(9999)).toBeNull();
  });

  it('ensureStatusForWell sets status if not already set', () => {
    store.ensureStatusForWell(2001, 'Testing');
    expect(store.statusForWell(2001)).toBe('Testing');
  });

  it('ensureStatusForWell does not override existing status', () => {
    store.setStatusForWell(2001, 'Drilling');
    store.ensureStatusForWell(2001, 'Testing');
    expect(store.statusForWell(2001)).toBe('Drilling');
  });

  it('selectedArea defaults to RAK', () => {
    expect(store.selectedArea()).toBe('RAK');
  });

  it('setSelectedArea updates the area', () => {
    store.setSelectedArea('Northern Area');
    expect(store.selectedArea()).toBe('Northern Area');
  });
});
```

---

## File 19

**`src/app/features/active-wwell/active-wwell-view/active-wwell-view.component.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActiveWwellViewComponent } from './active-wwell-view.component';
import { ActiveWwellStore } from '../store/active-wwell.store';
import { ActiveWwellFormService } from '../active-wwell-form.service';
import { ActiveWellViewService } from '@core/services/active-well-view.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { RbacStore } from '@store/rbac/rbac.store';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';

const activeWwellStoreMock = {
  selectedWell: jest.fn(() => null),
  selectedEpANum: jest.fn(() => null),
  selectedDate: jest.fn(() => ''),
  uniqueWellNames: jest.fn(() => []),
  wellData: jest.fn(() => null),
  wellHeaderData: jest.fn(() => null),
  databaseInfo: jest.fn(() => null),
  operationSummary: jest.fn(() => null),
  wwellTest: jest.fn(() => null),
  allFormationTops: jest.fn(() => []),
  allCasingData: jest.fn(() => []),
  wellNames: jest.fn(() => []),
  pagedWellNames: jest.fn(() => []),
  isLoading: jest.fn(() => false),
  isDetailsLoading: jest.fn(() => false),
  isInitialLoading: jest.fn(() => false),
  hasError: jest.fn(() => false),
  errorMessage: jest.fn(() => ''),
  totalDepth: jest.fn(() => 0),
  status: jest.fn(() => null),
  area: jest.fn(() => null),
  loadWellList: jest.fn(),
  loadWellDetail: jest.fn(),
  selectWell: jest.fn(),
  setDate: jest.fn(),
  initialize: jest.fn(),
};

const rbacStoreMock = {
  hasPermission: jest.fn(() => false),
  isLoaded: jest.fn(() => true),
};

const activatedRouteMock = {
  paramMap: of({ get: () => null }),
  queryParamMap: of({ get: () => null }),
  snapshot: {
    queryParamMap: { get: () => null, getAll: () => [], has: () => false, keys: [] },
  },
};

const routerMock = { navigate: jest.fn() };
const dialogMock = { open: jest.fn() };

const notificationServiceMock = {
  show: jest.fn(),
  error: jest.fn(),
  notifications: jest.fn(() => []),
  dismiss: jest.fn(),
};

const activeWellViewServiceMock = {
  createOrUpdateGwdDailyRemark: jest.fn(),
  createOrUpdateGwdWellTest: jest.fn(),
};

describe('ActiveWwellViewComponent', () => {
  let component: ActiveWwellViewComponent;
  let fixture: ComponentFixture<ActiveWwellViewComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ActiveWwellViewComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: ActiveWwellStore, useValue: activeWwellStoreMock },
        { provide: RbacStore, useValue: rbacStoreMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: Router, useValue: routerMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: ActiveWellViewService, useValue: activeWellViewServiceMock },
        ActiveWwellFormService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveWwellViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

---

## File 20

**`src/app/features/active-wwell/active-wwell.helpers.spec.ts`**

```ts
import { deriveStatusLabel, normalizeStatusName } from './active-wwell.helpers';

describe('active-wwell.helpers', () => {
  describe('normalizeStatusName', () => {
    it('trims leading/trailing whitespace', () => {
      expect(normalizeStatusName('  Drilling  ')).toBe('Drilling');
    });

    it('collapses multiple spaces into one', () => {
      expect(normalizeStatusName('Rig  Operation')).toBe('Rig Operation');
    });
  });

  describe('deriveStatusLabel', () => {
    it('returns N/A for null details', () => {
      expect(deriveStatusLabel(null)).toBe('N/A');
    });

    it('returns Active when rigStateCode is A', () => {
      const details = {
        RIG_IDENTIFICATION: [{ wRigActStsCd: 'A' }],
      } as never;
      expect(deriveStatusLabel(details)).toBe('Active');
    });

    it('returns Inactive when rigStateCode is I', () => {
      const details = {
        RIG_IDENTIFICATION: [{ wRigActStsCd: 'I' }],
      } as never;
      expect(deriveStatusLabel(details)).toBe('Inactive');
    });

    it('returns Active when drilling depth is positive', () => {
      const details = {
        DRLG_OP_STATUS: [{ wPrsntDpth: 500 }],
      } as never;
      expect(deriveStatusLabel(details)).toBe('Active');
    });
  });
});
```

---

## File 21

**`src/app/features/active-wwell/add-status-dialog/add-status-dialog.component.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AddStatusDialogComponent } from './add-status-dialog.component';

describe('AddStatusDialogComponent', () => {
  let component: AddStatusDialogComponent;
  let fixture: ComponentFixture<AddStatusDialogComponent>;
  const dialogRefMock = { close: jest.fn() };

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [AddStatusDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { name: 'Existing' } },
        { provide: MatDialogRef, useValue: dialogRefMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddStatusDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('pre-fills name from dialog data', () => {
    expect((component as unknown as { name: string }).name).toBe('Existing');
  });

  it('cancel() closes dialog without value', () => {
    (component as unknown as { cancel: () => void }).cancel();
    expect(dialogRefMock.close).toHaveBeenCalledWith();
  });

  it('save() closes with normalized name', () => {
    (component as unknown as { name: string }).name = '  Active Well  ';
    (component as unknown as { save: () => void }).save();
    expect(dialogRefMock.close).toHaveBeenCalledWith('Active Well');
  });

  it('save() does not close when name is empty', () => {
    (component as unknown as { name: string }).name = '   ';
    (component as unknown as { save: () => void }).save();
    expect(dialogRefMock.close).not.toHaveBeenCalled();
  });
});
```

---

## File 22

**`src/app/features/active-wwell/casing-info/casing-info.component.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CasingInfoComponent } from './casing-info.component';
import { ActiveWwellStore } from '../store/active-wwell.store';

function createFixture(casingData: { csgDepth: number; csgType: string }[] | null): ComponentFixture<CasingInfoComponent> {
  const activeWwellStoreMock = {
    allCasingData: jest.fn(() => casingData),
    selectedWell: jest.fn(() => null),
  };
  TestBed.configureTestingModule({
    imports: [CasingInfoComponent],
    providers: [{ provide: ActiveWwellStore, useValue: activeWwellStoreMock }],
  });
  const fixture = TestBed.createComponent(CasingInfoComponent);
  fixture.detectChanges();
  return fixture;
}

describe('CasingInfoComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    const fixture = createFixture([]);
    expect(fixture.componentInstance).toBeTruthy();
    fixture.destroy();
  });

  it('data() returns empty array when store returns null', () => {
    const fixture = createFixture(null);
    expect((fixture.componentInstance as unknown as { data: () => unknown[] }).data()).toEqual([]);
    fixture.destroy();
  });

  it('data() sorts by csgDepth ascending', () => {
    const fixture = createFixture([
      { csgDepth: 300, csgType: 'C' },
      { csgDepth: 100, csgType: 'A' },
      { csgDepth: 200, csgType: 'B' },
    ]);
    const result = (fixture.componentInstance as unknown as { data: () => { csgDepth: number; csgType: string }[] }).data();
    expect(result[0].csgDepth).toBe(100);
    expect(result[2].csgDepth).toBe(300);
    fixture.destroy();
  });
});
```

---

## File 23

**`src/app/features/active-wwell/database-info/database-info.component.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatabaseInfoComponent } from './database-info.component';
import { ActiveWwellStore } from '../store/active-wwell.store';

const activeWwellStoreMock = {
  databaseInfo: jest.fn(() => null),
  selectedWell: jest.fn(() => null),
};

describe('DatabaseInfoComponent', () => {
  let component: DatabaseInfoComponent;
  let fixture: ComponentFixture<DatabaseInfoComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [DatabaseInfoComponent],
      providers: [{ provide: ActiveWwellStore, useValue: activeWwellStoreMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(DatabaseInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('isEditingDepthLabel starts false', () => {
    expect((component as unknown as { isEditingDepthLabel: () => boolean }).isEditingDepthLabel()).toBe(false);
  });

  it('startEditDepthLabel sets editing to true', () => {
    (component as unknown as { startEditDepthLabel: () => void }).startEditDepthLabel();
    expect((component as unknown as { isEditingDepthLabel: () => boolean }).isEditingDepthLabel()).toBe(true);
  });

  it('depthSectionLabel defaults to "Depth & Formation"', () => {
    expect((component as unknown as { depthSectionLabel: () => string }).depthSectionLabel()).toBe('Depth & Formation');
  });
});
```

---

## File 24

**`src/app/features/active-wwell/formation-tops-and-casing/formation-tops-and-casing.component.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormationTopsAndCasingComponent } from './formation-tops-and-casing.component';
import { ActiveWwellStore } from '../store/active-wwell.store';

const activeWwellStoreMock = {
  allFormationTops: jest.fn(() => []),
};

describe('FormationTopsAndCasingComponent', () => {
  let component: FormationTopsAndCasingComponent;
  let fixture: ComponentFixture<FormationTopsAndCasingComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [FormationTopsAndCasingComponent],
      providers: [{ provide: ActiveWwellStore, useValue: activeWwellStoreMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(FormationTopsAndCasingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('columnDefs has 5 columns', () => {
    expect(component.columnDefs.length).toBe(5);
  });
});
```

---

## File 25

**`src/app/features/active-wwell/operation-summary/operation-summary.component.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OperationSummaryComponent } from './operation-summary.component';
import { ActiveWwellStore } from '../store/active-wwell.store';
import { ActiveWwellUiStore } from '../active-wwell-ui.store';
import { RbacStore } from '@store/rbac/rbac.store';
import { ActiveWwellFormService } from '../active-wwell-form.service';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const activeWwellStoreMock = {
  operationSummary: jest.fn(() => null),
};

function createFixture(hasPermission: boolean): ComponentFixture<OperationSummaryComponent> {
  const rbacStoreMock = {
    hasPermission: jest.fn(() => hasPermission),
    isLoaded: jest.fn(() => true),
  };
  TestBed.configureTestingModule({
    imports: [OperationSummaryComponent, ReactiveFormsModule, HttpClientTestingModule],
    providers: [
      { provide: ActiveWwellStore, useValue: activeWwellStoreMock },
      { provide: RbacStore, useValue: rbacStoreMock },
      ActiveWwellUiStore,
      ActiveWwellFormService,
    ],
  });
  const fixture = TestBed.createComponent(OperationSummaryComponent);
  fixture.detectChanges();
  return fixture;
}

describe('OperationSummaryComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    const fixture = createFixture(false);
    expect(fixture.componentInstance).toBeTruthy();
    fixture.destroy();
  });

  it('canUpdate is false when rbac denies permission', () => {
    const fixture = createFixture(false);
    expect((fixture.componentInstance as unknown as { canUpdate: () => boolean }).canUpdate()).toBe(false);
    fixture.destroy();
  });

  it('canUpdate is true when rbac grants permission', () => {
    const fixture = createFixture(true);
    expect((fixture.componentInstance as unknown as { canUpdate: () => boolean }).canUpdate()).toBe(true);
    fixture.destroy();
  });
});
```

---

## File 26

**`src/app/features/active-wwell/store/active-wwell.store.spec.ts`**

```ts
import { TestBed } from '@angular/core/testing';
import { ActiveWwellStore } from './active-wwell.store';
import { DailyOperationService } from '@services/daily-operation.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const dailyOperationServiceMock = {
  getWellList: jest.fn(),
  getWellData: jest.fn(),
  updateOperationSummary: jest.fn(),
  updateWellTest: jest.fn(),
  addStatus: jest.fn(),
};

const notificationServiceMock = {
  show: jest.fn(),
  error: jest.fn(),
  notifications: jest.fn(() => []),
  dismiss: jest.fn(),
};

describe('ActiveWwellStore', () => {
  let store: InstanceType<typeof ActiveWwellStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ActiveWwellStore,
        { provide: DailyOperationService, useValue: dailyOperationServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    });
    store = TestBed.inject(ActiveWwellStore);
  });

  it('should initialise with empty well list', () => {
    expect(store.wellList()).toEqual([]);
  });

  it('listLoading should be false initially', () => {
    expect(store.listLoading()).toBe(false);
  });

  it('error should be null initially', () => {
    expect(store.error()).toBeNull();
  });

  it('isLoading should be false initially', () => {
    expect(store.isLoading()).toBe(false);
  });
});
```

---

## File 27

**`src/app/features/active-wwell/wwell-header/wwell-header.component.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WwellHeaderComponent } from './wwell-header.component';
import { ActiveWwellStore } from '../store/active-wwell.store';
import { ActiveWwellUiStore } from '../active-wwell-ui.store';
import { ActiveWwellFormService } from '../active-wwell-form.service';
import { RbacStore } from '@store/rbac/rbac.store';
import { MatDialog } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const activeWwellStoreMock = {
  wellHeaderData: jest.fn(() => null),
};

const rbacStoreMock = {
  hasPermission: jest.fn(() => false),
  isLoaded: jest.fn(() => true),
};

const dialogMock = { open: jest.fn() };

describe('WwellHeaderComponent', () => {
  let component: WwellHeaderComponent;
  let fixture: ComponentFixture<WwellHeaderComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [WwellHeaderComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: ActiveWwellStore, useValue: activeWwellStoreMock },
        { provide: RbacStore, useValue: rbacStoreMock },
        { provide: MatDialog, useValue: dialogMock },
        ActiveWwellUiStore,
        ActiveWwellFormService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WwellHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('filteredStatusOptions returns all when query is empty', () => {
    const result = (component as unknown as { filteredStatusOptions: () => unknown[] }).filteredStatusOptions();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it('canUpdate is false when rbac denies', () => {
    expect((component as unknown as { canUpdate: () => boolean }).canUpdate()).toBe(false);
  });

  it('openAddStatusDialog opens a dialog', () => {
    (component as unknown as { openAddStatusDialog: () => void }).openAddStatusDialog();
    expect(dialogMock.open).toHaveBeenCalled();
  });
});
```

---

## File 28

**`src/app/features/active-wwell/wwell-test/wwell-test.component.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WwellTestComponent } from './wwell-test.component';
import { ActiveWwellStore } from '../store/active-wwell.store';
import { ActiveWwellUiStore } from '../active-wwell-ui.store';
import { ActiveWwellFormService } from '../active-wwell-form.service';
import { ActiveWellViewService } from '@core/services/active-well-view.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { RbacStore } from '@store/rbac/rbac.store';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const activeWwellStoreMock = {
  wwellTest: jest.fn(() => null),
  selectedWell: jest.fn(() => null),
  selectedEpANum: jest.fn(() => null),
  selectedDate: jest.fn(() => ''),
  isDetailsLoading: jest.fn(() => false),
};

const rbacStoreMock = {
  hasPermission: jest.fn(() => false),
  isLoaded: jest.fn(() => true),
};

const activeWellViewServiceMock = {
  createOrUpdateGwdWellTest: jest.fn(),
};

const notificationServiceMock = {
  show: jest.fn(),
  error: jest.fn(),
  notifications: jest.fn(() => []),
  dismiss: jest.fn(),
};

describe('WwellTestComponent', () => {
  let component: WwellTestComponent;
  let fixture: ComponentFixture<WwellTestComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [WwellTestComponent, ReactiveFormsModule, HttpClientTestingModule],
      providers: [
        { provide: ActiveWwellStore, useValue: activeWwellStoreMock },
        { provide: RbacStore, useValue: rbacStoreMock },
        { provide: ActiveWellViewService, useValue: activeWellViewServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        ActiveWwellUiStore,
        ActiveWwellFormService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WwellTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('isFlowTest starts false', () => {
    expect((component as unknown as { isFlowTest: () => boolean }).isFlowTest()).toBe(false);
  });

  it('tooltipVisible starts false', () => {
    expect((component as unknown as { tooltipVisible: () => boolean }).tooltipVisible()).toBe(false);
  });
});
```

---

## File 29

**`src/app/features/auth/store/auth.store.spec.ts`**

```ts
import { TestBed } from '@angular/core/testing';
import { AuthStore } from './auth.store';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { JwtService } from 'src/app/core/services/jwt/jwt.service';
import { LoaderService } from '@shared/components/global-loader/loader.service';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { RbacStore } from '@store/rbac/rbac.store';

const jwtServiceMock = { decode: jest.fn(() => ({})), isExpired: jest.fn(() => false) };
const loaderServiceMock = { startLogin: jest.fn(), stop: jest.fn(), isLoading: jest.fn(() => false), isLoginLoading: jest.fn(() => false), progress: jest.fn(() => 0), message: jest.fn(() => '') };
const externalConfigMock = { settings: { tokenUrl: '/api/token', portalUrl: '' } };
const rbacStoreMock = { setPermissions: jest.fn(), hasPermission: jest.fn(() => false) };

describe('AuthStore', () => {
  let store: InstanceType<typeof AuthStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        AuthStore,
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: LoaderService, useValue: loaderServiceMock },
        { provide: ExternalConfigService, useValue: externalConfigMock },
        { provide: RbacStore, useValue: rbacStoreMock },
      ],
    });
    store = TestBed.inject(AuthStore);
  });

  it('should not be authenticated initially', () => {
    expect(store.isAuthenticated()).toBe(false);
  });

  it('token should be null initially', () => {
    expect(store.token()).toBeNull();
  });

  it('isLoading should be false initially', () => {
    expect(store.isLoading()).toBe(false);
  });
});
```

---

## File 30

**`src/app/features/morning-report/morning-report.component.spec.ts`**

```ts
jest.mock('@arcgis/core/Graphic', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/core/reactiveUtils', () => ({ watch: jest.fn() }));
jest.mock('@arcgis/core/geometry/Point', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/geometry/Polygon', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/geometry/Polyline', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/layers/GraphicsLayer', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({ graphics: { removeAll: jest.fn(), add: jest.fn() } })) }));
jest.mock('@arcgis/core/symbols/SimpleMarkerSymbol', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/symbols/SimpleFillSymbol', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/symbols/SimpleLineSymbol', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/symbols/TextSymbol', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/WebMap', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/views/MapView', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({ destroy: jest.fn(), when: jest.fn(() => Promise.resolve()), on: jest.fn() })) }));
jest.mock('@arcgis/core/identity/IdentityManager', () => ({ __esModule: true, default: { registerToken: jest.fn() } }));

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MorningReportComponent } from './morning-report.component';
import { MorningReportStore } from './store/morning-report.store';
import { AuthStore } from '../auth/store/auth.store';
import { EmailStore } from '@store/email/email.store';
import { RbacStore } from '@store/rbac/rbac.store';
import { EmailService } from '@services/email/email.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { ConfirmDialogService } from '@shared/components/confirm-dialog/confirm-dialog.service';
import { LoaderService } from '@shared/components/global-loader/loader.service';
import { EsriMapService } from '@services/esri-map.service';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PLATFORM_ID } from '@angular/core';
import { of } from 'rxjs';

const morningReportStoreMock = {
  allWellsData: jest.fn(() => []),
  isLoading: jest.fn(() => false),
  hasError: jest.fn(() => false),
  errorMessage: jest.fn(() => ''),
  loadWellList: jest.fn(),
  loadWellDetail: jest.fn(),
  wellTestViewModels: jest.fn(() => []),
  wwellTestViewModels: jest.fn(() => []),
  setNotificationDuration: jest.fn(),
  loadMorningReportData: jest.fn(),
  morningReport: jest.fn(() => []),
  statusCode: jest.fn(() => null),
  selectedDate: jest.fn(() => new Date()),
  setDate: jest.fn(),
  setUiError: jest.fn(),
  loadWaterWellTestResults: jest.fn(),
};

const authStoreMock = {
  isAuthenticated: jest.fn(() => false),
  token: jest.fn(() => null),
  displayUsername: jest.fn(() => ''),
  userEmail: jest.fn(() => ''),
};

const emailStoreMock = {
  isSending: jest.fn(() => false),
  isSent: jest.fn(() => false),
  hasFailed: jest.fn(() => false),
  isIdle: jest.fn(() => true),
  sendEmail: jest.fn(),
};

const rbacStoreMock = {
  hasPermission: jest.fn(() => false),
  permissions: jest.fn(() => []),
};

const emailServiceMock = { sendEmail: jest.fn(() => of(200)) };
const notificationServiceMock = { show: jest.fn(), error: jest.fn(), notifications: jest.fn(() => []), dismiss: jest.fn() };
const confirmDialogServiceMock = { open: jest.fn(() => of(false)) };
const loaderServiceMock = { isLoading: jest.fn(() => false), isLoginLoading: jest.fn(() => false), progress: jest.fn(() => 0), message: jest.fn(() => ''), start: jest.fn(), stop: jest.fn(), registerBootTask: jest.fn(), resolveBootTask: jest.fn() };
const esriMapServiceMock = { authenticate: jest.fn(() => Promise.resolve()) };
const externalConfigMock = { settings: { portalUrl: 'https://portal.test', webmapId: 'abc123' } };

describe('MorningReportComponent', () => {
  let component: MorningReportComponent;
  let fixture: ComponentFixture<MorningReportComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [MorningReportComponent, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: MorningReportStore, useValue: morningReportStoreMock },
        { provide: AuthStore, useValue: authStoreMock },
        { provide: EmailStore, useValue: emailStoreMock },
        { provide: RbacStore, useValue: rbacStoreMock },
        { provide: EmailService, useValue: emailServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
        { provide: ConfirmDialogService, useValue: confirmDialogServiceMock },
        { provide: LoaderService, useValue: loaderServiceMock },
        { provide: EsriMapService, useValue: esriMapServiceMock },
        { provide: ExternalConfigService, useValue: externalConfigMock },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MorningReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture?.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

---

## File 31

**`src/app/features/morning-report/store/morning-report.store.spec.ts`**

```ts
import { TestBed } from '@angular/core/testing';
import { MorningReportStore } from './morning-report.store';
import { DailyOperationService } from '@services/daily-operation.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const dailyOperationServiceMock = {
  getWellList: jest.fn(),
  getMorningReport: jest.fn(),
};

const notificationServiceMock = {
  show: jest.fn(),
  error: jest.fn(),
  notifications: jest.fn(() => []),
  dismiss: jest.fn(),
};

describe('MorningReportStore', () => {
  let store: InstanceType<typeof MorningReportStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        MorningReportStore,
        { provide: DailyOperationService, useValue: dailyOperationServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    });
    store = TestBed.inject(MorningReportStore);
  });

  it('should initialise with empty allWellsData', () => {
    expect(store.allWellsData()).toEqual([]);
  });

  it('isLoading should be false initially', () => {
    expect(store.isLoading()).toBe(false);
  });

  it('hasError should be false initially', () => {
    expect(store.hasError()).toBe(false);
  });

  it('errorMessage should be empty initially', () => {
    expect(store.errorMessage()).toBe('');
  });
});
```

---

## File 32

**`src/app/features/presentation/active-wwell-docs-viewer/active-wwell-docs-viewer.component.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActiveWwellDocsViewerComponent } from './active-wwell-docs-viewer.component';
import { PresentationStore } from '../store/presentation.store';
import { WellDocsStore } from '@store/well-docs/well-docs.store';
import { PresDocsService } from '@services/pres-docs.service';
import { MatDialog } from '@angular/material/dialog';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

const presentationStoreMock = {
  selectedWell: jest.fn(() => null),
  selectedEpANum: jest.fn(() => null),
  selectedDate: jest.fn(() => ''),
  isLoaded: jest.fn(() => false),
};

const wellDocsStoreMock = {
  isLoading: jest.fn(() => false),
  listLoading: jest.fn(() => false),
  categories: jest.fn(() => []),
  docNames: jest.fn(() => []),
  docsByCategory: jest.fn(() => ({})),
  totalCount: jest.fn(() => 0),
  totalDocCount: jest.fn(() => 0),
  loadDocs: jest.fn(),
  loadDocList: jest.fn(),
  removeSingleFile: jest.fn(),
};

const presDocsServiceMock = {
  fetchDocs: jest.fn(),
  uploadDocs: jest.fn(),
  removeDoc: jest.fn(),
};

const dialogMock = { open: jest.fn() };

describe('ActiveWwellDocsViewerComponent', () => {
  let component: ActiveWwellDocsViewerComponent;
  let fixture: ComponentFixture<ActiveWwellDocsViewerComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ActiveWwellDocsViewerComponent, HttpClientTestingModule, NoopAnimationsModule],
      providers: [
        { provide: PresentationStore, useValue: presentationStoreMock },
        { provide: WellDocsStore, useValue: wellDocsStoreMock },
        { provide: PresDocsService, useValue: presDocsServiceMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveWwellDocsViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

---

## File 33

**`src/app/features/presentation/active-wwell-map/active-wwell-map.component.spec.ts`**

```ts
jest.mock('@arcgis/core/Graphic', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/core/reactiveUtils', () => ({ watch: jest.fn() }));
jest.mock('@arcgis/core/geometry/Point', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/geometry/Polygon', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/geometry/Polyline', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/layers/GraphicsLayer', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({ graphics: { removeAll: jest.fn(), add: jest.fn() } })) }));
jest.mock('@arcgis/core/symbols/SimpleMarkerSymbol', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/symbols/SimpleFillSymbol', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/symbols/SimpleLineSymbol', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/symbols/TextSymbol', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/WebMap', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/views/MapView', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({ destroy: jest.fn(), when: jest.fn(() => Promise.resolve()), on: jest.fn() })) }));
jest.mock('@arcgis/core/identity/IdentityManager', () => ({ __esModule: true, default: { registerToken: jest.fn() } }));

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActiveWwellMapComponent } from './active-wwell-map.component';
import { PresentationStore } from '../store/presentation.store';
import { LoaderService } from '@shared/components/global-loader/loader.service';
import { EsriMapService } from '@services/esri-map.service';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { PLATFORM_ID } from '@angular/core';

const presentationStoreMock = {
  selectedWell: jest.fn(() => null),
  isLoaded: jest.fn(() => false),
  wellHeaderData: jest.fn(() => null),
  selectedEpANum: jest.fn(() => null),
};

const loaderServiceMock = {
  isLoading: jest.fn(() => false),
  isLoginLoading: jest.fn(() => false),
  progress: jest.fn(() => 0),
  message: jest.fn(() => ''),
  start: jest.fn(),
  stop: jest.fn(),
  registerBootTask: jest.fn(),
  resolveBootTask: jest.fn(),
};

const esriMapServiceMock = {
  authenticate: jest.fn(() => Promise.resolve()),
};

const externalConfigMock = {
  settings: { portalUrl: 'https://portal.test', webmapId: 'abc123' },
};

describe('ActiveWwellMapComponent', () => {
  let component: ActiveWwellMapComponent;
  let fixture: ComponentFixture<ActiveWwellMapComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ActiveWwellMapComponent],
      providers: [
        { provide: PresentationStore, useValue: presentationStoreMock },
        { provide: LoaderService, useValue: loaderServiceMock },
        { provide: EsriMapService, useValue: esriMapServiceMock },
        { provide: ExternalConfigService, useValue: externalConfigMock },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveWwellMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture?.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

---

## File 34

**`src/app/features/presentation/depth-scale/depth-scale.component.spec.ts`**

```ts
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DepthScaleComponent } from './depth-scale.component';
import { PresentationStore } from '../store/presentation.store';

const presentationStoreMock = {
  selectedWell: jest.fn(() => null),
  isLoaded: jest.fn(() => false),
};

@Component({
  standalone: true,
  imports: [DepthScaleComponent],
  template: `<app-depth-scale [totalDepth]="1000" [animTrigger]="0" />`,
})
class TestHostComponent {}

describe('DepthScaleComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [{ provide: PresentationStore, useValue: presentationStoreMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    const el = fixture.debugElement.query(By.directive(DepthScaleComponent));
    expect(el).toBeTruthy();
  });
});
```

---

## File 35

**`src/app/features/presentation/misc-pres-well-data/misc-pres-well-data.component.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MiscPresWellDataComponent } from './misc-pres-well-data.component';
import { PresentationStore } from '../store/presentation.store';

const presentationStoreMock = {
  miscWellData: jest.fn(() => null),
  selectedWell: jest.fn(() => null),
  isLoaded: jest.fn(() => false),
};

describe('MiscPresWellDataComponent', () => {
  let component: MiscPresWellDataComponent;
  let fixture: ComponentFixture<MiscPresWellDataComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [MiscPresWellDataComponent],
      providers: [{ provide: PresentationStore, useValue: presentationStoreMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(MiscPresWellDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

---

## File 36

**`src/app/features/presentation/offset-wwells/offset-wwells.component.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OffsetWwellsComponent } from './offset-wwells.component';
import { PresentationStore } from '../store/presentation.store';

const presentationStoreMock = {
  offsetWells: jest.fn(() => []),
  selectedWell: jest.fn(() => null),
  isLoaded: jest.fn(() => false),
};

describe('OffsetWwellsComponent', () => {
  let component: OffsetWwellsComponent;
  let fixture: ComponentFixture<OffsetWwellsComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [OffsetWwellsComponent],
      providers: [{ provide: PresentationStore, useValue: presentationStoreMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(OffsetWwellsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

---

## File 37

**`src/app/features/presentation/picked-formation-tops/picked-formation-tops.component.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PickedFormationTopsComponent } from './picked-formation-tops.component';
import { PresentationStore } from '../store/presentation.store';

const presentationStoreMock = {
  pickedFormations: jest.fn(() => []),
  allFormationTops: jest.fn(() => []),
  selectedWell: jest.fn(() => null),
  isLoaded: jest.fn(() => false),
};

describe('PickedFormationTopsComponent', () => {
  let component: PickedFormationTopsComponent;
  let fixture: ComponentFixture<PickedFormationTopsComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [PickedFormationTopsComponent],
      providers: [{ provide: PresentationStore, useValue: presentationStoreMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(PickedFormationTopsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

---

## File 38

**`src/app/features/presentation/presentation.component.spec.ts`**

```ts
jest.mock('@arcgis/core/Graphic', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/core/reactiveUtils', () => ({ watch: jest.fn() }));
jest.mock('@arcgis/core/geometry/Point', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/geometry/Polygon', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/geometry/Polyline', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/layers/GraphicsLayer', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({ graphics: { removeAll: jest.fn(), add: jest.fn() } })) }));
jest.mock('@arcgis/core/symbols/SimpleMarkerSymbol', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/symbols/SimpleFillSymbol', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/symbols/SimpleLineSymbol', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/symbols/TextSymbol', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/WebMap', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/views/MapView', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({ destroy: jest.fn(), when: jest.fn(() => Promise.resolve()), on: jest.fn() })) }));
jest.mock('@arcgis/core/identity/IdentityManager', () => ({ __esModule: true, default: { registerToken: jest.fn() } }));

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PresentationComponent } from './presentation.component';
import { PresentationStore } from './store/presentation.store';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialog } from '@angular/material/dialog';
import { OverlayContainer } from '@angular/cdk/overlay';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { LoaderService } from '@shared/components/global-loader/loader.service';
import { EsriMapService } from '@services/esri-map.service';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { PLATFORM_ID } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { PresDocsService } from '@services/pres-docs.service';
import { NotificationService } from '@shared/components/notification/notification.service';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const presentationStoreMock = {
  wellList: jest.fn(() => []),
  wellNames: jest.fn(() => []),
  pagedWellNames: jest.fn(() => []),
  selectedWell: jest.fn(() => null),
  isLoaded: jest.fn(() => false),
  isLoading: jest.fn(() => false),
  hasError: jest.fn(() => false),
  errorMessage: jest.fn(() => ''),
  loadWellList: jest.fn(),
  selectWell: jest.fn(),
};

const dialogMock = { open: jest.fn() };
const overlayContainerMock = { getContainerElement: jest.fn(() => document.createElement('div')) };
const loaderServiceMock = { isLoading: jest.fn(() => false), isLoginLoading: jest.fn(() => false), progress: jest.fn(() => 0), message: jest.fn(() => ''), start: jest.fn(), stop: jest.fn(), registerBootTask: jest.fn(), resolveBootTask: jest.fn() };
const esriMapServiceMock = { authenticate: jest.fn(() => Promise.resolve()) };
const externalConfigMock = { settings: { portalUrl: 'https://portal.test', webmapId: 'abc123' } };

describe('PresentationComponent', () => {
  let component: PresentationComponent;
  let fixture: ComponentFixture<PresentationComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [PresentationComponent, RouterTestingModule, NoopAnimationsModule, HttpClientTestingModule],
      providers: [
        { provide: PresentationStore, useValue: presentationStoreMock },
        { provide: MatDialog, useValue: dialogMock },
        { provide: OverlayContainer, useValue: overlayContainerMock },
        { provide: LoaderService, useValue: loaderServiceMock },
        { provide: EsriMapService, useValue: esriMapServiceMock },
        { provide: ExternalConfigService, useValue: externalConfigMock },
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: PresDocsService, useValue: { uploadDocs: jest.fn(), removeDoc: jest.fn(), generateDownloadUrl: jest.fn(), getDocList: jest.fn() } },
        { provide: NotificationService, useValue: { show: jest.fn(), error: jest.fn(), notifications: jest.fn(() => []), dismiss: jest.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PresentationComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => fixture?.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

---

## File 39

**`src/app/features/presentation/store/presentation.store.spec.ts`**

```ts
import { TestBed } from '@angular/core/testing';
import { PresentationStore } from './presentation.store';
import { DailyOperationService } from '@services/daily-operation.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const dailyOperationServiceMock = {
  getWellList: jest.fn(),
  getWellData: jest.fn(),
};

const notificationServiceMock = {
  show: jest.fn(),
  error: jest.fn(),
  notifications: jest.fn(() => []),
  dismiss: jest.fn(),
};

describe('PresentationStore', () => {
  let store: InstanceType<typeof PresentationStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PresentationStore,
        { provide: DailyOperationService, useValue: dailyOperationServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    });
    store = TestBed.inject(PresentationStore);
  });

  it('should initialise with empty well list', () => {
    expect(store.wellList()).toEqual([]);
  });

  it('isLoaded should be false initially', () => {
    expect(store.isLoaded()).toBe(false);
  });

  it('isLoading should be false initially', () => {
    expect(store.isLoading()).toBe(false);
  });

  it('hasError should be false initially', () => {
    expect(store.hasError()).toBe(false);
  });

  it('selectedWell should be null initially', () => {
    expect(store.selectedWell()).toBeNull();
  });
});
```

---

## File 40

**`src/app/features/presentation/well-bore-view/well-bore-view.component.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { WellBoreViewComponent } from './well-bore-view.component';

@Component({
  standalone: true,
  imports: [WellBoreViewComponent],
  template: `<app-well-bore-view [diagramData]="null" [animTrigger]="0" />`,
})
class TestHostComponent {}

describe('WellBoreViewComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create the host', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
```

---

## File 41

**`src/app/features/presentation/well-name-chips/well-name-chips.component.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WellNameChipsComponent } from './well-name-chips.component';
import { PresentationStore } from '../store/presentation.store';
import { NotificationService } from '@shared/components/notification/notification.service';

const presentationStoreMock = {
  wellNames: jest.fn(() => []),
  pagedWellNames: jest.fn(() => []),
  wellNamesPage: jest.fn(() => 0),
  totalPages: jest.fn(() => 1),
  hasPrevPage: jest.fn(() => false),
  hasNextPage: jest.fn(() => false),
  selectedWell: jest.fn(() => null),
  selectedEpANum: jest.fn(() => null),
  selectedDate: jest.fn(() => ''),
  isLoaded: jest.fn(() => false),
  isLoading: jest.fn(() => false),
  isDetailsLoading: jest.fn(() => false),
  loadWellList: jest.fn(),
  selectWell: jest.fn(),
  setDate: jest.fn(),
  nextPage: jest.fn(),
  prevPage: jest.fn(),
};

const notificationServiceMock = {
  show: jest.fn(),
  error: jest.fn(),
  notifications: jest.fn(() => []),
  dismiss: jest.fn(),
};

describe('WellNameChipsComponent', () => {
  let component: WellNameChipsComponent;
  let fixture: ComponentFixture<WellNameChipsComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [WellNameChipsComponent],
      providers: [
        { provide: PresentationStore, useValue: presentationStoreMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WellNameChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

---

## File 42

**`src/app/features/presentation/wwell-test-result/wwell-test-result.component.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WwellTestResultComponent } from './wwell-test-result.component';
import { PresentationStore } from '../store/presentation.store';
import { MatDialog } from '@angular/material/dialog';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const presentationStoreMock = {
  wellTestResults: jest.fn(() => []),
  waterWelltestResult: jest.fn(() => []),
  wwellTest: jest.fn(() => null),
  wellHeaderData: jest.fn(() => null),
  selectedWell: jest.fn(() => null),
  isLoaded: jest.fn(() => false),
};

const dialogMock = { open: jest.fn() };

describe('WwellTestResultComponent', () => {
  let component: WwellTestResultComponent;
  let fixture: ComponentFixture<WwellTestResultComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [WwellTestResultComponent],
      providers: [
        { provide: PresentationStore, useValue: presentationStoreMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WwellTestResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture?.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

---

## File 43

**`src/app/features/presentation/wwells-logs-indicators/wwells-logs-indicators.component.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WwellsLogsIndicatorsComponent } from './wwells-logs-indicators.component';
import { PresentationStore } from '../store/presentation.store';

const presentationStoreMock = {
  wellsLogsIndicators: jest.fn(() => null),
  wellsLogsRemarks: jest.fn(() => null),
  selectedWell: jest.fn(() => null),
  isLoaded: jest.fn(() => false),
};

describe('WwellsLogsIndicatorsComponent', () => {
  let component: WwellsLogsIndicatorsComponent;
  let fixture: ComponentFixture<WwellsLogsIndicatorsComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [WwellsLogsIndicatorsComponent],
      providers: [{ provide: PresentationStore, useValue: presentationStoreMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(WwellsLogsIndicatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

---

## File 44

**`src/app/features/water-wells-overview/water-wells-overview.component.spec.ts`**

```ts
jest.mock('@arcgis/core/Graphic', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/core/reactiveUtils', () => ({ watch: jest.fn() }));
jest.mock('@arcgis/core/geometry/Point', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/geometry/Polygon', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/geometry/Polyline', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/layers/GraphicsLayer', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({ graphics: { removeAll: jest.fn(), add: jest.fn() } })) }));
jest.mock('@arcgis/core/symbols/SimpleMarkerSymbol', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/symbols/SimpleFillSymbol', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/symbols/SimpleLineSymbol', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/symbols/TextSymbol', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/WebMap', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/views/MapView', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({ destroy: jest.fn(), when: jest.fn(() => Promise.resolve()), on: jest.fn() })) }));
jest.mock('@arcgis/core/identity/IdentityManager', () => ({ __esModule: true, default: { registerToken: jest.fn() } }));

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WaterWellsOverviewComponent } from './water-wells-overview.component';
import { MorningReportStore } from '../morning-report/store/morning-report.store';
import { LoaderService } from '@shared/components/global-loader/loader.service';
import { EsriMapService } from '@services/esri-map.service';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { RouterTestingModule } from '@angular/router/testing';
import { PLATFORM_ID } from '@angular/core';

const morningReportStoreMock = {
  allWellsData: jest.fn(() => []),
  isLoading: jest.fn(() => false),
  hasError: jest.fn(() => false),
  loadMorningReportData: jest.fn(),
};

const loaderServiceMock = {
  isLoading: jest.fn(() => false),
  isLoginLoading: jest.fn(() => false),
  progress: jest.fn(() => 0),
  message: jest.fn(() => ''),
  start: jest.fn(),
  stop: jest.fn(),
  registerBootTask: jest.fn(),
  resolveBootTask: jest.fn(),
};

const esriMapServiceMock = {
  authenticate: jest.fn(() => Promise.resolve()),
};

const externalConfigMock = {
  settings: { portalUrl: 'https://portal.test', webmapId: 'abc123' },
};

describe('WaterWellsOverviewComponent', () => {
  let component: WaterWellsOverviewComponent;
  let fixture: ComponentFixture<WaterWellsOverviewComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [WaterWellsOverviewComponent, RouterTestingModule],
      providers: [
        { provide: MorningReportStore, useValue: morningReportStoreMock },
        { provide: LoaderService, useValue: loaderServiceMock },
        { provide: EsriMapService, useValue: esriMapServiceMock },
        { provide: ExternalConfigService, useValue: externalConfigMock },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WaterWellsOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture?.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

---

## File 45

**`src/app/features/wwell-map/wwell-map.component.spec.ts`**

```ts
jest.mock('@arcgis/core/Graphic', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/core/reactiveUtils', () => ({ watch: jest.fn() }));
jest.mock('@arcgis/core/geometry/Point', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/geometry/Polygon', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/geometry/Polyline', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/layers/GraphicsLayer', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({ graphics: { removeAll: jest.fn(), add: jest.fn() } })) }));
jest.mock('@arcgis/core/symbols/SimpleMarkerSymbol', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/symbols/SimpleFillSymbol', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/symbols/SimpleLineSymbol', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/symbols/TextSymbol', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/WebMap', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({})) }));
jest.mock('@arcgis/core/views/MapView', () => ({ __esModule: true, default: jest.fn().mockImplementation(() => ({ destroy: jest.fn(), when: jest.fn(() => Promise.resolve()), on: jest.fn() })) }));
jest.mock('@arcgis/core/identity/IdentityManager', () => ({ __esModule: true, default: { registerToken: jest.fn() } }));

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WwellmapComponent } from './wwell-map.component';
import { MorningReportStore } from '../morning-report/store/morning-report.store';
import { LoaderService } from '@shared/components/global-loader/loader.service';
import { EsriMapService } from '@services/esri-map.service';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { PLATFORM_ID } from '@angular/core';

const morningReportStoreMock = {
  allWellsData: jest.fn(() => []),
  isLoading: jest.fn(() => false),
  hasError: jest.fn(() => false),
  loadMorningReportData: jest.fn(),
};

const loaderServiceMock = {
  isLoading: jest.fn(() => false),
  isLoginLoading: jest.fn(() => false),
  progress: jest.fn(() => 0),
  message: jest.fn(() => ''),
  start: jest.fn(),
  stop: jest.fn(),
  registerBootTask: jest.fn(),
  resolveBootTask: jest.fn(),
};

const esriMapServiceMock = { authenticate: jest.fn(() => Promise.resolve()) };
const externalConfigMock = { settings: { portalUrl: 'https://portal.test', webmapId: 'abc123' } };

describe('WwellmapComponent', () => {
  let component: WwellmapComponent;
  let fixture: ComponentFixture<WwellmapComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [WwellmapComponent],
      providers: [
        { provide: MorningReportStore, useValue: morningReportStoreMock },
        { provide: LoaderService, useValue: loaderServiceMock },
        { provide: EsriMapService, useValue: esriMapServiceMock },
        { provide: ExternalConfigService, useValue: externalConfigMock },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WwellmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture?.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

---

## File 46

**`src/app/shared/components/confirm-dialog/confirm-dialog.component.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let component: ConfirmDialogComponent;
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  const dialogRefMock = { close: jest.fn() };
  const dialogData = {
    title: 'Delete item',
    rows: [{ label: 'Name', value: 'test-well' }],
    severity: 'warning' as const,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: MatDialogRef, useValue: dialogRefMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('isEmail returns true for email addresses', () => {
    expect((component as unknown as { isEmail: (v: string) => boolean }).isEmail('user@example.com')).toBe(true);
  });

  it('isEmail returns false for non-email values', () => {
    expect((component as unknown as { isEmail: (v: string) => boolean }).isEmail('plain-value')).toBe(false);
  });

  it('confirm() closes dialog with true', () => {
    (component as unknown as { confirm: () => void }).confirm();
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });

  it('cancel() closes dialog with false', () => {
    (component as unknown as { cancel: () => void }).cancel();
    expect(dialogRefMock.close).toHaveBeenCalledWith(false);
  });
});
```

---

## File 47

**`src/app/shared/components/confirm-dialog/confirm-dialog.service.spec.ts`**

```ts
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { ConfirmDialogService } from './confirm-dialog.service';

describe('ConfirmDialogService', () => {
  let service: ConfirmDialogService;
  const dialogRefMock = { afterClosed: jest.fn(() => of(true)) };
  const dialogMock = { open: jest.fn(() => dialogRefMock) };

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        ConfirmDialogService,
        { provide: MatDialog, useValue: dialogMock },
      ],
    });
    service = TestBed.inject(ConfirmDialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('open() returns observable that emits true when dialog confirmed', (done) => {
    service.open({ title: 'Test', rows: [] }).subscribe((result) => {
      expect(result).toBe(true);
      done();
    });
  });

  it('open() returns observable that emits false when dialog cancelled', (done) => {
    dialogRefMock.afterClosed.mockReturnValue(of(false as boolean));
    service.open({ title: 'Test', rows: [] }).subscribe((result) => {
      expect(result).toBe(false);
      done();
    });
  });
});
```

---

## File 48

**`src/app/shared/components/draggable-card/draggable-card.component.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DraggableCardComponent } from './draggable-card.component';

describe('DraggableCardComponent', () => {
  let component: DraggableCardComponent;
  let fixture: ComponentFixture<DraggableCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DraggableCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DraggableCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts with dragging and resizing false', () => {
    expect((component as unknown as { dragging: () => boolean }).dragging()).toBe(false);
    expect((component as unknown as { resizing: () => boolean }).resizing()).toBe(false);
  });

  it('startDrag sets dragging to true', () => {
    const event = new MouseEvent('mousedown', { clientX: 0, clientY: 0 });
    jest.spyOn(event, 'preventDefault');
    component.startDrag(event);
    expect((component as unknown as { dragging: () => boolean }).dragging()).toBe(true);
    window.dispatchEvent(new MouseEvent('mouseup'));
  });

  it('startResize sets resizing to true', () => {
    const event = new MouseEvent('mousedown', { clientX: 0, clientY: 0 });
    jest.spyOn(event, 'preventDefault');
    jest.spyOn(event, 'stopPropagation');
    component.startResize(event, 'se');
    expect((component as unknown as { resizing: () => boolean }).resizing()).toBe(true);
    window.dispatchEvent(new MouseEvent('mouseup'));
  });
});
```

---

## File 49

**`src/app/shared/components/file-upload/file-preview-dialog/file-preview-dialog.component.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilePreviewDialogComponent } from './file-preview-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

Object.defineProperty(URL, 'createObjectURL', { value: jest.fn(() => 'blob:test'), writable: true });
Object.defineProperty(URL, 'revokeObjectURL', { value: jest.fn(), writable: true });

const dialogRefMock = { close: jest.fn() };
const testFile = new File(['content'], 'test.pdf', { type: 'application/pdf' });

describe('FilePreviewDialogComponent', () => {
  let component: FilePreviewDialogComponent;
  let fixture: ComponentFixture<FilePreviewDialogComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [FilePreviewDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: testFile },
        { provide: MatDialogRef, useValue: dialogRefMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FilePreviewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    if (fixture) fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('fileName should match the provided file name', () => {
    expect((component as unknown as { fileName: string }).fileName).toBe('test.pdf');
  });

  it('previewType should be pdf for pdf files', () => {
    expect((component as unknown as { previewType: string }).previewType).toBe('pdf');
  });
});
```

---

## File 50

**`src/app/shared/components/file-upload/file-upload.component.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FileUploadComponent } from './file-upload.component';
import { WellDocsStore } from '@store/well-docs/well-docs.store';
import { PresDocsService } from '@services/pres-docs.service';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

const wellDocsStoreMock = {
  isLoading: jest.fn(() => false),
  listLoading: jest.fn(() => false),
  docs: jest.fn(() => []),
  docNames: jest.fn(() => []),
  categories: jest.fn(() => []),
  docsByCategory: jest.fn(() => ({})),
  totalCount: jest.fn(() => 0),
  loadDocs: jest.fn(),
  loadDocList: jest.fn(),
  uploadDocs: jest.fn(),
  removeDoc: jest.fn(),
  removeSingleFile: jest.fn(),
};

const presDocsServiceMock = {
  getDocs: jest.fn(),
  uploadDocs: jest.fn(),
  removeDoc: jest.fn(),
};

const dialogMock = { open: jest.fn() };

describe('FileUploadComponent', () => {
  let component: FileUploadComponent;
  let fixture: ComponentFixture<FileUploadComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [FileUploadComponent, NoopAnimationsModule],
      providers: [
        { provide: WellDocsStore, useValue: wellDocsStoreMock },
        { provide: PresDocsService, useValue: presDocsServiceMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FileUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('files signal should be empty initially', () => {
    expect((component as unknown as { files: () => unknown[] }).files()).toEqual([]);
  });

  it('isDragOver should be false initially', () => {
    expect((component as unknown as { isDragOver: () => boolean }).isDragOver()).toBe(false);
  });
});
```

---

## File 51

**`src/app/shared/components/global-loader/global-loader.component.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalLoaderComponent } from './global-loader.component';
import { LoaderService } from './loader.service';

describe('GlobalLoaderComponent', () => {
  let component: GlobalLoaderComponent;
  let fixture: ComponentFixture<GlobalLoaderComponent>;

  const loaderServiceMock = {
    isLoading: jest.fn(() => false),
    isLoginLoading: jest.fn(() => false),
    progress: jest.fn(() => 0),
    message: jest.fn(() => ''),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalLoaderComponent],
      providers: [{ provide: LoaderService, useValue: loaderServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('barGradient returns a linear-gradient string', () => {
    loaderServiceMock.progress.mockReturnValue(50);
    fixture.detectChanges();
    const gradient = (component as unknown as { barGradient: () => string }).barGradient();
    expect(gradient).toContain('linear-gradient');
  });
});
```

---

## File 52

**`src/app/shared/components/notification/notification.component.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationComponent } from './notification.component';
import { NotificationService } from './notification.service';

describe('NotificationComponent', () => {
  let component: NotificationComponent;
  let fixture: ComponentFixture<NotificationComponent>;

  const notificationServiceMock = {
    notifications: jest.fn(() => []),
    dismiss: jest.fn(),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotificationComponent],
      providers: [
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

---

## File 53

**`src/app/shared/components/notification/notification.service.spec.ts`**

```ts
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    jest.useFakeTimers();
    service = new NotificationService();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts with no notifications', () => {
    expect(service.notifications()).toHaveLength(0);
  });

  it('show() adds a notification', () => {
    service.show('Hello', 'info');
    expect(service.notifications()).toHaveLength(1);
    expect(service.notifications()[0].message).toBe('Hello');
    expect(service.notifications()[0].type).toBe('info');
  });

  it('dismiss() removes notification by id', () => {
    service.show('Test');
    const id = service.notifications()[0].id;
    service.dismiss(id);
    expect(service.notifications()).toHaveLength(0);
  });

  it('auto-dismisses after duration', () => {
    service.show('Auto dismiss', 'info', { durationMs: 2000 });
    expect(service.notifications()).toHaveLength(1);
    jest.advanceTimersByTime(2001);
    expect(service.notifications()).toHaveLength(0);
  });

  it('error() adds error notification', () => {
    service.error('Something broke');
    expect(service.notifications()[0].type).toBe('error');
  });

  it('setDefaultDuration enforces minimum of 1000', () => {
    service.setDefaultDuration(50);
    expect(service.defaultDurationMs()).toBe(1000);
  });
});
```

---

## File 54

**`src/app/shared/components/resize-divider/resize-divider.component.spec.ts`**

```ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResizeDividerComponent } from './resize-divider.component';

describe('ResizeDividerComponent', () => {
  let component: ResizeDividerComponent;
  let fixture: ComponentFixture<ResizeDividerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResizeDividerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResizeDividerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts with dragging false', () => {
    expect((component as unknown as { dragging: () => boolean }).dragging()).toBe(false);
  });

  it('onMouseDown sets dragging to true', () => {
    const event = new MouseEvent('mousedown', { clientX: 100 });
    jest.spyOn(event, 'preventDefault');
    component.onMouseDown(event);
    expect((component as unknown as { dragging: () => boolean }).dragging()).toBe(true);
    window.dispatchEvent(new MouseEvent('mouseup'));
  });
});
```

---

## File 55

**`src/app/shared/directives/rbac/has-permission.directive.spec.ts`**

```ts
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HasPermissionDirective } from './has-permission.directive';
import { RbacStore } from '@store/rbac/rbac.store';

@Component({
  standalone: true,
  imports: [HasPermissionDirective],
  template: `<span *appHasPermission="'active-wwell'">visible</span>`,
})
class TestHostComponent {}

function createFixture(hasPermission: boolean): ComponentFixture<TestHostComponent> {
  const rbacStoreMock = {
    hasPermission: jest.fn(() => hasPermission),
    isLoaded: jest.fn(() => true),
  };

  TestBed.configureTestingModule({
    imports: [TestHostComponent],
    providers: [{ provide: RbacStore, useValue: rbacStoreMock }],
  });

  const fixture = TestBed.createComponent(TestHostComponent);
  fixture.detectChanges();
  return fixture;
}

describe('HasPermissionDirective', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('renders element when permission is granted', () => {
    const fixture = createFixture(true);
    const span = fixture.debugElement.query(By.css('span'));
    expect(span).toBeTruthy();
    expect(span.nativeElement.textContent.trim()).toBe('visible');
    fixture.destroy();
  });

  it('hides element when permission is denied', () => {
    const fixture = createFixture(false);
    const span = fixture.debugElement.query(By.css('span'));
    expect(span).toBeNull();
    fixture.destroy();
  });
});
```

---

## File 56

**`src/app/shared/services/build-info.service.spec.ts`**

```ts
import { TestBed } from '@angular/core/testing';
import { BuildInfoService } from './build-info.service';

describe('BuildInfoService', () => {
  let service: BuildInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [BuildInfoService] });
    service = TestBed.inject(BuildInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('info should have a commitHash', () => {
    expect(typeof service.info.commitHash).toBe('string');
  });

  it('shortHash should be at most 7 characters', () => {
    expect(service.shortHash.length).toBeLessThanOrEqual(7);
  });
});
```

---

## File 57

**`src/app/shared/utils/date.util.spec.ts`**

```ts
import {
  addDays,
  formatDateDisplay,
  formatDateForInput,
  isToday,
  parseDateFromInput,
} from './date.util';

describe('date.util', () => {
  describe('formatDateForInput', () => {
    it('formats date as YYYY-MM-DD', () => {
      expect(formatDateForInput(new Date(2024, 0, 5))).toBe('2024-01-05');
    });

    it('returns empty string for falsy input', () => {
      expect(formatDateForInput(null as unknown as Date)).toBe('');
    });
  });

  describe('parseDateFromInput', () => {
    it('parses YYYY-MM-DD string to date at midnight', () => {
      const d = parseDateFromInput('2024-03-15');
      expect(d.getFullYear()).toBe(2024);
      expect(d.getMonth()).toBe(2);
      expect(d.getDate()).toBe(15);
    });

    it('returns current date for empty string', () => {
      const before = Date.now();
      const d = parseDateFromInput('');
      expect(d.getTime()).toBeGreaterThanOrEqual(before - 100);
    });
  });

  describe('formatDateDisplay', () => {
    it('formats date to human-readable string', () => {
      const result = formatDateDisplay(new Date(2024, 0, 15));
      expect(result).toContain('2024');
      expect(result).toContain('15');
    });

    it('returns empty string for falsy input', () => {
      expect(formatDateDisplay(null as unknown as Date)).toBe('');
    });
  });

  describe('isToday', () => {
    it('returns true for today', () => {
      expect(isToday(new Date())).toBe(true);
    });

    it('returns false for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isToday(yesterday)).toBe(false);
    });
  });

  describe('addDays', () => {
    it('adds positive days', () => {
      const base = new Date(2024, 0, 1);
      const result = addDays(base, 5);
      expect(result.getDate()).toBe(6);
    });

    it('subtracts days when negative', () => {
      const base = new Date(2024, 0, 10);
      const result = addDays(base, -3);
      expect(result.getDate()).toBe(7);
    });
  });
});
```

---

## File 58

**`src/app/shared/utils/well-data.validator.spec.ts`**

```ts
import { wellDataValidator, validateWellData } from './well-data.validator';

describe('wellDataValidator', () => {
  afterEach(() => {
    wellDataValidator.disable();
  });

  it('should be disabled by default', () => {
    expect(wellDataValidator.isEnabled).toBe(false);
  });

  it('enable() should set isEnabled to true', () => {
    wellDataValidator.enable();
    expect(wellDataValidator.isEnabled).toBe(true);
  });

  it('disable() should set isEnabled to false', () => {
    wellDataValidator.enable();
    wellDataValidator.disable();
    expect(wellDataValidator.isEnabled).toBe(false);
  });
});

describe('validateWellData', () => {
  it('should not throw when data is null', () => {
    expect(() => validateWellData(null)).not.toThrow();
  });

  it('should not throw when validator is disabled and data is provided', () => {
    wellDataValidator.disable();
    expect(() => validateWellData({} as never)).not.toThrow();
  });
});
```

---

## File 59

**`src/app/shared/utils/well-test-math.util.spec.ts`**

```ts
import { calcFlowProductivityIndex, calcPumpProductivityIndex } from './well-test-math.util';

describe('well-test-math.util', () => {
  describe('calcPumpProductivityIndex', () => {
    it('returns GPM/ft for valid inputs', () => {
      expect(calcPumpProductivityIndex(100, 150, 50)).toBeCloseTo(1.0);
    });

    it('returns null when drawdown is zero', () => {
      expect(calcPumpProductivityIndex(100, 50, 50)).toBeNull();
    });

    it('returns null when any input is null', () => {
      expect(calcPumpProductivityIndex(null, 150, 50)).toBeNull();
      expect(calcPumpProductivityIndex(100, null, 50)).toBeNull();
      expect(calcPumpProductivityIndex(100, 150, null)).toBeNull();
    });
  });

  describe('calcFlowProductivityIndex', () => {
    it('returns GPM/ft for valid inputs', () => {
      const result = calcFlowProductivityIndex(100, 200, 100);
      expect(result).not.toBeNull();
      expect(result!).toBeGreaterThan(0);
    });

    it('returns null when pressure difference is zero', () => {
      expect(calcFlowProductivityIndex(100, 100, 100)).toBeNull();
    });

    it('returns null when any input is null', () => {
      expect(calcFlowProductivityIndex(null, 200, 100)).toBeNull();
    });
  });
});
```

---

## File 60

**`src/app/shared/utils/wellbore-math.util.spec.ts`**

```ts
import {
  buildCasingPath,
  buildDepthTicks,
  computeCasingHalfWidth,
  createDepthScale,
  pickTickInterval,
  sortCasingsByDepthDesc,
} from './wellbore-math.util';

describe('wellbore-math.util', () => {
  describe('createDepthScale', () => {
    it('maps 0 to 0 and totalDepth to drawingHeight', () => {
      const scale = createDepthScale(1000, 500);
      expect(scale(0)).toBe(0);
      expect(scale(1000)).toBe(500);
    });
  });

  describe('pickTickInterval', () => {
    it('returns 100 for depth <= 2000', () => {
      expect(pickTickInterval(1500)).toBe(100);
    });

    it('returns 200 for depth between 2001 and 3000', () => {
      expect(pickTickInterval(2500)).toBe(200);
    });

    it('returns 500 for depth > 3000', () => {
      expect(pickTickInterval(5000)).toBe(500);
    });
  });

  describe('buildDepthTicks', () => {
    it('builds ticks from 0 to totalDepth inclusive', () => {
      const ticks = buildDepthTicks(1000, 500);
      expect(ticks).toEqual([0, 500, 1000]);
    });
  });

  describe('sortCasingsByDepthDesc', () => {
    it('sorts casings by depth descending', () => {
      const casings = [
        { csgDepth: 100 },
        { csgDepth: 500 },
        { csgDepth: 200 },
      ] as never[];
      const sorted = sortCasingsByDepthDesc(casings);
      expect(sorted[0].csgDepth).toBe(500);
      expect(sorted[2].csgDepth).toBe(100);
    });
  });

  describe('computeCasingHalfWidth', () => {
    it('computes base + index * increment', () => {
      expect(computeCasingHalfWidth(2, 10, 5)).toBe(20);
    });
  });

  describe('buildCasingPath', () => {
    it('returns a non-empty SVG path string', () => {
      const path = buildCasingPath(50, 10, 0, 100, 10);
      expect(typeof path).toBe('string');
      expect(path.startsWith('M')).toBe(true);
    });
  });
});
```

---

## File 61

**`src/app/shared/utils/wwell-placement-utils.spec.ts`**

```ts
jest.mock('@arcgis/core/geometry/Point', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation((props: Record<string, unknown>) => ({ ...props })),
}));
jest.mock('@arcgis/core/geometry/Polygon', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('@arcgis/core/geometry/Polyline', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('@arcgis/core/symbols/SimpleLineSymbol', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('@arcgis/core/Graphic', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('@arcgis/core/layers/GraphicsLayer', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({ graphics: { removeAll: jest.fn(), add: jest.fn() } })),
}));
jest.mock('@arcgis/core/symbols/SimpleFillSymbol', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({})),
}));
jest.mock('@arcgis/core/symbols/TextSymbol', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({})),
}));

import { isValidPlacement, generateSquarePositions, toArcGIS } from './wwell-placement-utils';
import type { BubblePoint } from '../models/config/agwa-map.config';

describe('isValidPlacement', () => {
  it('returns false when bubblePoint is null', () => {
    expect(isValidPlacement(null, [], 0.01)).toBe(false);
  });

  it('returns true when there are no existing wells', () => {
    const point = { longitude: 10, latitude: 20 } as never;
    expect(isValidPlacement(point, [], 0.01)).toBe(true);
  });
});

describe('generateSquarePositions', () => {
  it('returns an array', () => {
    const result = generateSquarePositions(24.0, 46.0, 0.1, 2);
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('toArcGIS', () => {
  it('converts BubblePoint to ArcGIS point shape', () => {
    const bp: BubblePoint = { latitude: 24.5, longitude: 46.5 };
    const result = toArcGIS(bp);
    expect(result).toBeDefined();
  });
});
```

---
