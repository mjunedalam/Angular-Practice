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
