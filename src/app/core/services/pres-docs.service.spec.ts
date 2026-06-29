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
