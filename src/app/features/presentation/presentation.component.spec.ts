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
