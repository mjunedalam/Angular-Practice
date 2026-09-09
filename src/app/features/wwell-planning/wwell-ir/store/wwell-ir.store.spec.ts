import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CreateIntegratedRequirementPayload } from '@models/wwell-planning/integrated-requirement.model';
import { WWELL_SAVE_DELAY_MS } from '@models/wwell-planning/wwell-planning-loading.constants';
import { buildIntegratedRequirementFromPayload } from '../wwell-ir-form/wwell-ir-draft.util';
import { WwellIrBulkSavePayload } from '../wwell-ir-form/wwell-ir-payload.model';
import { WwellIrService } from '../wwell-ir.service';
import { WwellIrStore } from './wwell-ir.store';

const serviceMock = {
  createIr: jest.fn(),
  getIrDetailBlocks: jest.fn(),
};

function buildPayload(): CreateIntegratedRequirementPayload {
  return {
    status: 'in-progress',
    requestReference: {
      linkedRequestId: null,
      client: 'BI-12',
      supportingBusiness: 'Agriculture',
      wellName: 'HAIL-500',
      targetAquifer: 'Saq',
      targetDepthFt: 510,
      surfaceElevationFtAsl: 980,
      coordinates: '27.5114°N, 41.7208°E',
    },
    formationTops: [],
    topsRemarks: null,
    casing: [],
    programDetails: {
      completion: 'Screened',
      openHoleSizeIn: null,
      acidization: '',
      transmission: '',
      developmentTesting: { logging: '', mudLogging: '', sampling: '', flowTest: '', remarks: '' },
    },
    contacts: { geologistPrimary: 'Eng. A. Al-Mutairi', geologistSecondary: null },
    offsetWells: [],
    offsetWellsRemarks: null,
    hydrogeology: { aquifer: 'Saq', estimatedTdsPpm: 1200, h2sPpm: 5, estimatedPumpDepthFt: 150 },
    testProgram: { testType: 'pump-test', estimatedRateGpm: 350, estimatedWaterLevelFt: 95 },
  };
}

function buildIrBulkPayload(): WwellIrBulkSavePayload {
  return [
    {
      table: 'exad_gwd_ir_header',
      data: [
        {
          action: 'INSERT',
          ir_seq: null,
          prewap_seq: null,
          ltr_no: null,
          screen: '',
          sampling: null,
          logging: null,
          tops_remarks: null,
          publish_dt: null,
          publish_flg: 'N',
          curr_flg: 'Y',
          publish_by: null,
          cont_geologist: 101,
          sub_cont_geologist: null,
          water_remarks: null,
          gen_remarks: null,
          completion: 'Screened',
          cmpl_type: null,
          acidization: null,
          trns_type: null,
          dt_rmks: null,
          mud_rmks: null,
          test_type: 'pump-test',
          flow_rmks: null,
        },
      ],
    },
    { table: 'exad_gwd_ir_casing', data: null },
    { table: 'exad_gwd_ir_hydrogeology', data: null },
    { table: 'exad_gwd_ir_tops', data: null },
    { table: 'exad_gwd_ir_water', data: null },
    { table: 'exad_gwd_well_design', data: null },
  ];
}

describe('WwellIrStore - createIr', () => {
  let store: InstanceType<typeof WwellIrStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // createIr no longer trusts a client-side echo (see its own doc comment in WwellIrStore) — an
    // empty detail response here means "nothing extra to merge," so `irs()` ends up exactly what
    // buildIntegratedRequirementFromPayload alone would build, matching most of these assertions.
    serviceMock.getIrDetailBlocks.mockReturnValue(of([]));
    TestBed.configureTestingModule({
      providers: [WwellIrStore, { provide: WwellIrService, useValue: serviceMock }],
    });
    store = TestBed.inject(WwellIrStore);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('inserts the confirmed record — waits out the real follow-up GET', () => {
    serviceMock.createIr.mockReturnValue(of(9001));

    store.createIr(buildPayload(), buildIrBulkPayload());
    // createIr's request is wrapped in delay(WWELL_SAVE_DELAY_MS) — see WwellIrStore — so its own
    // "creatingIr" flag stays true for at least that long even against this instant mock response.
    jest.advanceTimersByTime(WWELL_SAVE_DELAY_MS);

    expect(serviceMock.createIr).toHaveBeenCalledWith(buildIrBulkPayload());
    expect(serviceMock.getIrDetailBlocks).toHaveBeenCalledWith(9001);
    expect(store.irs()).toEqual([
      buildIntegratedRequirementFromPayload(buildPayload(), { id: 'IR-9001', code: 'IR-9001', irSeq: 9001 }),
    ]);
    expect(store.creatingIr()).toBe(false);
    expect(store.createIrError()).toBeNull();
  });

  /** Attachments are real files fetched per ir_seq (loadIrAttachments), never part of a save — so a
   *  freshly created record starts with none until that separate fetch resolves. */
  it('starts a newly created record with no attachments', () => {
    serviceMock.createIr.mockReturnValue(of(9001));

    store.createIr(buildPayload(), buildIrBulkPayload());
    jest.advanceTimersByTime(WWELL_SAVE_DELAY_MS);

    expect(store.irs()[0].attachments).toEqual([]);
  });

  it('sets createIrError on failure and clears the creating flag', () => {
    serviceMock.createIr.mockReturnValue(throwError(() => new Error('Network down')));

    store.createIr(buildPayload(), buildIrBulkPayload());

    // delay() only defers next/complete notifications, not errors — see WwellIrStore's own note
    // on createIr — so the error path settles synchronously, with no timer to advance.
    expect(store.creatingIr()).toBe(false);
    expect(store.createIrError()).toBe('Network down');
    expect(serviceMock.getIrDetailBlocks).not.toHaveBeenCalled();
  });

  it('surfaces a distinct error and leaves irs untouched when the save succeeds but the follow-up GET fails', () => {
    serviceMock.createIr.mockReturnValue(of(9001));
    serviceMock.getIrDetailBlocks.mockReturnValue(throwError(() => new Error('timeout')));

    store.createIr(buildPayload(), buildIrBulkPayload());
    jest.advanceTimersByTime(WWELL_SAVE_DELAY_MS);

    expect(store.irs()).toEqual([]);
    expect(store.creatingIr()).toBe(false);
    // The backend did confirm this ir_seq, so it's still remembered — a resave must UPDATE, not
    // re-INSERT under a new row, even though `irs` couldn't be refreshed this time.
    expect(store.draftIrSeq()).toBe(9001);
    expect(store.createIrError()).toContain('refresh');
  });

  it('remembers the returned ir_seq — WwellIrComponent.createNewIr() reads this to select the just-created draft', () => {
    serviceMock.createIr.mockReturnValue(of(9001));

    store.createIr(buildPayload(), buildIrBulkPayload());
    jest.advanceTimersByTime(WWELL_SAVE_DELAY_MS);

    expect(store.draftIrSeq()).toBe(9001);
  });
});
