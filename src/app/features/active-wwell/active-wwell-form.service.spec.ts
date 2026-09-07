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

  // Matrix: docs/plan/wwell-test-fields-validation.md
  describe('wellTestForm — Required/Optional matrix (PUMP)', () => {
    const validPump = {
      hydTestTypCd: 'PUMP',
      epANum: 'EP1',
      testStaDt: '2026-01-01',
      rsvrCd: 'AQ1',
      duration: 10,
      rpm: 100,
      temp: 25,
      hydH2sCnc: 5,
      hydProdRt: 50,
      hydPmpDpth: 200,
    };
    const requiredFields = ['rsvrCd', 'duration', 'rpm', 'temp', 'hydH2sCnc', 'hydProdRt', 'hydPmpDpth'];
    const optionalFields = ['wtrSaTdsCnc', 'statWlvl', 'dyncWlvl', 'testerNetworkId', 'siwhp', 'fwhp', 'hydProduct'];

    function setPumpMode(): void {
      service.wellTestForm.patchValue(validPump);
      ['rpm', 'hydPmpDpth', 'siwhp', 'fwhp', 'statWlvl', 'dyncWlvl']
        .forEach(f => service.wellTestForm.get(f)?.updateValueAndValidity());
    }

    beforeEach(() => setPumpMode());

    it('is valid when every required PUMP field is filled and every optional field is empty', () => {
      expect(service.wellTestForm.valid).toBe(true);
    });

    it.each(requiredFields)('is invalid when required PUMP field "%s" is cleared', (field) => {
      service.wellTestForm.get(field)?.setValue(null);
      expect(service.wellTestForm.valid).toBe(false);
      expect(service.wellTestForm.get(field)?.hasError('required')).toBe(true);
    });

    it.each(optionalFields)('stays valid when optional PUMP field "%s" is left empty', (field) => {
      service.wellTestForm.get(field)?.setValue(null);
      expect(service.wellTestForm.valid).toBe(true);
    });

    it('stays valid when N/A-for-PUMP fields (SIWHP, FWHP) are filled anyway', () => {
      service.wellTestForm.patchValue({ siwhp: 100, fwhp: 50 });
      expect(service.wellTestForm.valid).toBe(true);
    });

    it('SWL and DWL are optional (never required) for PUMP', () => {
      service.wellTestForm.patchValue({ statWlvl: null, dyncWlvl: null });
      expect(service.wellTestForm.get('statWlvl')?.hasError('required')).toBe(false);
      expect(service.wellTestForm.get('dyncWlvl')?.hasError('required')).toBe(false);
      expect(service.wellTestForm.valid).toBe(true);
    });
  });

  describe('wellTestForm — Required/Optional matrix (FLOW)', () => {
    const validFlow = {
      hydTestTypCd: 'FLOW',
      epANum: 'EP1',
      testStaDt: '2026-01-01',
      rsvrCd: 'AQ1',
      duration: 10,
      temp: 25,
      hydH2sCnc: 5,
      hydProdRt: 50,
    };
    const requiredFields = ['rsvrCd', 'duration', 'temp', 'hydH2sCnc', 'hydProdRt'];
    const notApplicableFields = ['rpm', 'hydPmpDpth', 'siwhp', 'fwhp', 'statWlvl', 'dyncWlvl'];
    const optionalFields = ['wtrSaTdsCnc', 'testerNetworkId', 'hydProduct', ...notApplicableFields];

    function setFlowMode(): void {
      service.wellTestForm.patchValue(validFlow);
      ['rpm', 'hydPmpDpth', 'siwhp', 'fwhp', 'statWlvl', 'dyncWlvl']
        .forEach(f => service.wellTestForm.get(f)?.updateValueAndValidity());
    }

    beforeEach(() => setFlowMode());

    it('is valid when every required FLOW field is filled and RPM/Pump Depth/SIWHP/FWHP are empty', () => {
      expect(service.wellTestForm.valid).toBe(true);
    });

    it.each(requiredFields)('is invalid when required FLOW field "%s" is cleared', (field) => {
      service.wellTestForm.get(field)?.setValue(null);
      expect(service.wellTestForm.valid).toBe(false);
      expect(service.wellTestForm.get(field)?.hasError('required')).toBe(true);
    });

    it.each(notApplicableFields)('N/A-for-FLOW field "%s" never carries a required error', (field) => {
      service.wellTestForm.get(field)?.setValue(null);
      expect(service.wellTestForm.get(field)?.hasError('required')).toBe(false);
    });

    it.each(optionalFields)('stays valid when optional/N-A FLOW field "%s" is left empty', (field) => {
      service.wellTestForm.get(field)?.setValue(null);
      expect(service.wellTestForm.valid).toBe(true);
    });

    it('stays valid when N/A-for-FLOW fields (RPM, Pump Depth, SWL, DWL) are filled anyway', () => {
      service.wellTestForm.patchValue({ rpm: 100, hydPmpDpth: 200, statWlvl: 10, dyncWlvl: 20 });
      expect(service.wellTestForm.valid).toBe(true);
    });
  });

  describe('wellTestForm — mode switch re-evaluates PUMP/FLOW-only requiredFor validators', () => {
    it('RPM and Pump Depth become required after switching from FLOW to PUMP', () => {
      const form = service.wellTestForm;
      form.patchValue({ hydTestTypCd: 'FLOW', rpm: null, hydPmpDpth: null });
      form.get('rpm')?.updateValueAndValidity();
      form.get('hydPmpDpth')?.updateValueAndValidity();
      expect(form.get('rpm')?.hasError('required')).toBe(false);
      expect(form.get('hydPmpDpth')?.hasError('required')).toBe(false);

      form.patchValue({ hydTestTypCd: 'PUMP' });
      form.get('rpm')?.updateValueAndValidity();
      form.get('hydPmpDpth')?.updateValueAndValidity();
      expect(form.get('rpm')?.hasError('required')).toBe(true);
      expect(form.get('hydPmpDpth')?.hasError('required')).toBe(true);
    });

    it('RPM and Pump Depth stop being required after switching from PUMP to FLOW', () => {
      const form = service.wellTestForm;
      form.patchValue({ hydTestTypCd: 'PUMP', rpm: null, hydPmpDpth: null });
      form.get('rpm')?.updateValueAndValidity();
      form.get('hydPmpDpth')?.updateValueAndValidity();
      expect(form.get('rpm')?.hasError('required')).toBe(true);
      expect(form.get('hydPmpDpth')?.hasError('required')).toBe(true);

      form.patchValue({ hydTestTypCd: 'FLOW' });
      form.get('rpm')?.updateValueAndValidity();
      form.get('hydPmpDpth')?.updateValueAndValidity();
      expect(form.get('rpm')?.hasError('required')).toBe(false);
      expect(form.get('hydPmpDpth')?.hasError('required')).toBe(false);
    });
  });

  describe('testerNetworkId (Conducted By) — optional but format-checked when provided', () => {
    it('has no error when empty', () => {
      service.wellTestForm.get('testerNetworkId')?.setValue(null);
      expect(service.wellTestForm.get('testerNetworkId')?.errors).toBeNull();
    });

    it('rejects an invalid format', () => {
      service.wellTestForm.get('testerNetworkId')?.setValue('abc@123');
      expect(service.wellTestForm.get('testerNetworkId')?.hasError('invalidNetworkIds')).toBe(true);
    });

    it('accepts a comma-separated list of network IDs', () => {
      service.wellTestForm.get('testerNetworkId')?.setValue('abc123,def456');
      expect(service.wellTestForm.get('testerNetworkId')?.errors).toBeNull();
    });
  });
});
