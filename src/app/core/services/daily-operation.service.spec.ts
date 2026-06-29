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
