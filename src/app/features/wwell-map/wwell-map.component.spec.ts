jest.mock('@arcgis/core/Graphic', () => ({
  __esModule: true,
  default: class GraphicMock {},
}));

jest.mock('@arcgis/core/core/reactiveUtils', () => ({
  watch: jest.fn(),
  when: jest.fn(),
  whenOnce: jest.fn(),
  pausable: jest.fn(),
  sync: jest.fn(),
  syncAndInitial: jest.fn(),
  initial: jest.fn(),
  on: jest.fn(),
}));

jest.mock('@arcgis/core/geometry/Point', () => ({
  __esModule: true,
  default: class PointMock {
    latitude?: number;
    longitude?: number;

    constructor(options?: { latitude?: number; longitude?: number }) {
      this.latitude = options?.latitude;
      this.longitude = options?.longitude;
    }
  },
}));

jest.mock('@arcgis/core/geometry/Polyline', () => ({
  __esModule: true,
  default: class PolylineMock {},
}));

jest.mock('@arcgis/core/geometry/Polygon', () => ({
  __esModule: true,
  default: class PolygonMock {
    constructor(public readonly options?: unknown) {}
  },
}));

jest.mock('@arcgis/core/layers/GraphicsLayer', () => ({
  __esModule: true,
  default: class GraphicsLayerMock {
    removeAll(): void { return; }
    add(): void { return; }
    addMany(): void { return; }
  },
}));

jest.mock('@arcgis/core/layers/MapImageLayer', () => ({
  __esModule: true,
  default: class MapImageLayerMock {},
}));

jest.mock('@arcgis/core/symbols/SimpleFillSymbol', () => ({
  __esModule: true,
  default: class SimpleFillSymbolMock {},
}));

jest.mock('@arcgis/core/symbols/SimpleLineSymbol', () => ({
  __esModule: true,
  default: class SimpleLineSymbolMock {},
}));

jest.mock('@arcgis/core/symbols/TextSymbol', () => ({
  __esModule: true,
  default: class TextSymbolMock {},
}));

jest.mock('@arcgis/core/config.js', () => ({
  __esModule: true,
  default: {},
}));

jest.mock('@arcgis/core/identity/IdentityManager', () => ({
  __esModule: true,
  default: {
    registerOAuthInfos: jest.fn(),
    checkSignInStatus: jest.fn(),
    getCredential: jest.fn(),
    destroyCredentials: jest.fn(),
  },
}));

jest.mock('@arcgis/core/identity/OAuthInfo', () => ({
  __esModule: true,
  default: class OAuthInfoMock {},
}));

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { of } from 'rxjs';
import { LoaderService } from 'src/app/shared/components/global-loader/loader.service';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { MorningReportService } from 'src/app/core/services/morning-report.service';
import { WwellmapComponent } from './wwell-map.component';

describe('WwellmapComponent', () => {
  let component: WwellmapComponent;
  let fixture: ComponentFixture<WwellmapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WwellmapComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        {
          provide: MorningReportService,
          useValue: {
            getMorningReportForKSA: jest.fn(() => of([])),
          },
        },
        {
          provide: ExternalConfigService,
          useValue: {
            settings: {
              mapServerUrl: '',
            },
          },
        },
        {
          provide: LoaderService,
          useValue: {
            registerBootTask: jest.fn(),
            resolveBootTask: jest.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WwellmapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });
});
