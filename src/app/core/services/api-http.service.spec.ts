import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiHttpService } from './api-http.service';

describe('ApiHttpService', () => {
  let service: ApiHttpService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApiHttpService],
    });
    service = TestBed.inject(ApiHttpService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('get() sends a GET request', (done) => {
    service.get<{ id: number }>('/test').subscribe((res) => {
      expect(res).toEqual({ id: 1 });
      done();
    });
    const req = httpMock.expectOne('/test');
    expect(req.request.method).toBe('GET');
    req.flush({ id: 1 });
  });

  it('post() sends a POST request', (done) => {
    service.post<{ ok: boolean }>('/test', { name: 'x' }).subscribe((res) => {
      expect(res.ok).toBe(true);
      done();
    });
    const req = httpMock.expectOne('/test');
    expect(req.request.method).toBe('POST');
    req.flush({ ok: true });
  });
});
