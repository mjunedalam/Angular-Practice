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
