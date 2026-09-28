import { TestBed } from '@angular/core/testing';
import { of, Observable, Subject, throwError } from 'rxjs';
import { mapIrHeaderSummaryToIntegratedRequirement } from '../wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-summary.mapper';
import { WwellIrService } from '../wwell-planning/wwell-ir/wwell-ir.service';
import { WwellIrDetailTableBlock } from '../wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-payload.model';
import { WellProfileStore } from './well-profile.store';
import { buildProfile } from './well-profile.data';

const ir = mapIrHeaderSummaryToIntegratedRequirement({ irSeq: 1, prewapSeq: null, ltrNo: null, cmplType: null, testType: 'pump-test', publishFlg: 'N', createdDt: null, updatedDt: null });

describe('live well profile', () => {
  it('uses actual target depth, fractional diameters and explicit liner top and marks fallback liner attachment separately from actual TOL', () => {
    const p = buildProfile({ ...ir, requestReference: { ...ir.requestReference, targetDepthFt: 5200 }, casing: [
      { type: 'Production', sizeIn: '13 3/8', depthFtBgl: 3000, tolFtBgl: null, remarks: null },
      { type: 'Liner', sizeIn: '9 5/8', depthFtBgl: 5000, tolFtBgl: 2800, remarks: null },
      { type: 'Liner', sizeIn: '7', depthFtBgl: 5200, tolFtBgl: null, remarks: null },
    ] });
    expect(p.totalDepth).toBe(5200);
    expect(p.strings.map(s => s.top)).toEqual([0, 2800, 5000]);
    expect(p.warnings.length).toBe(1);
    expect(p.strings[2].topInferred).toBe(true);
    expect(p.pump).toBeNull();
    expect(p.water).toBeNull();
  });
  it('surfaces list failures and can retry without introducing sample records', () => {
    const service = { getIrs: jest.fn((): Observable<typeof ir[]> => throwError(() => new Error('offline'))) };
    TestBed.configureTestingModule({ providers: [WellProfileStore, { provide: WwellIrService, useValue: service }] });
    const s = TestBed.inject(WellProfileStore);
    s.loadIrs();
    expect(s.listLoading()).toBe(false);
    expect(s.listError()).toBeTruthy();
    expect(s.irs()).toEqual([]);
    service.getIrs.mockImplementation(() => of([ir]));
    s.loadIrs();
    expect(s.listError()).toBe('');
    expect(s.irs()[0].irSeq).toBe(1);
    expect(s.record()).toBeNull();
  });
  it('cancels old selections and clears stale data on detail failure', () => {
    const first = new Subject<readonly WwellIrDetailTableBlock[]>();
    const second = new Subject<readonly WwellIrDetailTableBlock[]>();
    const service = { getIrs: jest.fn(() => of([ir, { ...ir, irSeq: 2, id: 'IR-2', code: 'IR-2' }])), getIrDetailBlocks: jest.fn((id: number): Observable<readonly WwellIrDetailTableBlock[]> => id === 1 ? first : second) };
    TestBed.configureTestingModule({ providers: [WellProfileStore, { provide: WwellIrService, useValue: service }] });
    const s = TestBed.inject(WellProfileStore);
    s.loadIrs(); s.loadIr(1); s.loadIr(2);
    second.next([]); first.next([]);
    expect(s.record()?.irSeq).toBe(2);
    service.getIrDetailBlocks.mockImplementation(() => throwError(() => new Error('offline')));
    s.loadIr(1);
    expect(s.record()).toBeNull();
    expect(s.detailError()).toBeTruthy();
    expect(s.strings()).toEqual([]);
  });
});
