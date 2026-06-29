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
