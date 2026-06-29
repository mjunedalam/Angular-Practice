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
