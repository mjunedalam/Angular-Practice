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
