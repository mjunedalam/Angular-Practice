jest.mock('@arcgis/core/Graphic', () => ({
  __esModule: true,
  default: class GraphicMock {},
}));

jest.mock('@arcgis/core/core/reactiveUtils', () => ({
  watch: jest.fn(),
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

jest.mock('@arcgis/core/layers/GraphicsLayer', () => ({
  __esModule: true,
  default: class GraphicsLayerMock {
    removeAll(): void { return; }
    addMany(): void { return; }
  },
}));

jest.mock('@arcgis/core/symbols/PictureMarkerSymbol', () => ({
  __esModule: true,
  default: class PictureMarkerSymbolMock {},
}));

jest.mock('@arcgis/core/symbols/SimpleMarkerSymbol', () => ({
  __esModule: true,
  default: class SimpleMarkerSymbolMock {},
}));

jest.mock('@arcgis/core/symbols/TextSymbol', () => ({
  __esModule: true,
  default: class TextSymbolMock {},
}));

jest.mock('src/app/shared/models/config/agwa-map.config', () => ({
  MAP_CONFIG: {
    center: [45, 24.5],
    zoom: 6,
    minZoom: 5,
    maxZoom: 14,
  },
  STYLE: {
    markerIcon: '/assets/images/oil-rig-icon.png',
    markerSize: 33,
  },
}));

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { ActiveWwellMapComponent } from './active-wwell-map.component';
import { DrillingDataStore } from '@store/drilling-data/drilling-data.store';
import { PLATFORM_ID } from '@angular/core';
import { ExternalConfigService } from '@shared/services/external-config.service';
import { LoaderService } from '@shared/components/global-loader/loader.service';

describe('ActiveWwellMapComponent', () => {
  let component: ActiveWwellMapComponent;
  let fixture: ComponentFixture<ActiveWwellMapComponent>;
  const mockDrillingDataStore = {
    selectedEpANum: signal<number | null>(null),
    wellHeaderData: signal(null),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveWwellMapComponent],
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: DrillingDataStore, useValue: mockDrillingDataStore },
        {
          provide: ExternalConfigService,
          useValue: {
            settings: {},
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
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveWwellMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show an empty-state prompt when no well is selected', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Select a well to preview its location.');
  });
});
