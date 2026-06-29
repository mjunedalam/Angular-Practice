import { TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActiveWwellFormService } from './active-wwell-form.service';

describe('ActiveWwellFormService', () => {
  let service: ActiveWwellFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, HttpClientTestingModule],
      providers: [ActiveWwellFormService],
    });
    service = TestBed.inject(ActiveWwellFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('drillingRemarksForm has required fields', () => {
    const form = service.drillingRemarksForm;
    expect(form.get('epANum')).toBeTruthy();
    expect(form.get('wActDt')).toBeTruthy();
    expect(form.get('area')).toBeTruthy();
    expect(form.get('status')).toBeTruthy();
  });

  it('drillingRemarksForm is invalid when empty', () => {
    expect(service.drillingRemarksForm.valid).toBe(false);
  });

  it('wellTestForm has required fields', () => {
    const form = service.wellTestForm;
    expect(form.get('epANum')).toBeTruthy();
    expect(form.get('rsvrCd')).toBeTruthy();
    expect(form.get('hydTestTypCd')).toBeTruthy();
  });

  it('wellTestForm hydTestTypCd defaults to STP1', () => {
    expect(service.wellTestForm.get('hydTestTypCd')?.value).toBe('STP1');
  });
});
