import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CreateIntegratedRequirementPayload, IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
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
    casing: [],
    programDetails: {
      completion: 'Screened',
      openHoleSizeIn: null,
      acidization: '',
      transmission: '',
      developmentTesting: { logging: '', mudLogging: '', sampling: '', flowTest: '' },
    },
    contacts: { geologistPrimary: 'Eng. A. Al-Mutairi', geologistSecondary: null },
    offsetWells: [],
    offsetWellsRemarks: null,
    hydrogeology: { aquifer: 'Saq', estimatedTdsPpm: 1200, h2sPpm: 5, estimatedPumpDepthFt: 150 },
    testProgram: { testType: 'pump-test', estimatedRateGpm: 350, estimatedWaterLevelFt: 95 },
  };
}

function buildCreated(irSeq: number | null = 9001): IntegratedRequirement {
  return {
    id: 'IR-26-999',
    code: 'IR-26-999',
    irSeq,
    updatedDate: '2026-08-04',
    attachmentNames: [],
    chain: [],
    ...buildPayload(),
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
  ];
}

describe('WwellIrStore - createIr', () => {
  let store: InstanceType<typeof WwellIrStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    // createIr's success path always kicks off a silent refreshIrDetail(irSeq) afterwards (see
    // WwellIrStore) — an empty detail response merges back onto `existing` as a no-op (every
    // field falls back to what's already there), so it doesn't disturb these assertions.
    serviceMock.getIrDetailBlocks.mockReturnValue(of([]));
    TestBed.configureTestingModule({
      providers: [WwellIrStore, { provide: WwellIrService, useValue: serviceMock }],
    });
    store = TestBed.inject(WwellIrStore);
  });

  it('passes attachment names through to the service and prepends the created row on success', () => {
    const created = buildCreated();
    const attachmentNames = ['map.pdf'];
    serviceMock.createIr.mockReturnValue(of(created));

    store.createIr(buildPayload(), buildIrBulkPayload(), attachmentNames);

    expect(serviceMock.createIr).toHaveBeenCalledWith(buildPayload(), buildIrBulkPayload(), attachmentNames);
    expect(store.irs()).toEqual([created]);
    expect(store.creatingIr()).toBe(false);
    expect(store.createIrError()).toBeNull();
  });

  it('defaults files to an empty array when omitted', () => {
    serviceMock.createIr.mockReturnValue(of(buildCreated()));

    store.createIr(buildPayload(), buildIrBulkPayload());

    expect(serviceMock.createIr).toHaveBeenCalledWith(buildPayload(), buildIrBulkPayload(), []);
  });

  it('sets createIrError on failure and clears the creating flag', () => {
    serviceMock.createIr.mockReturnValue(throwError(() => new Error('Network down')));

    store.createIr(buildPayload(), buildIrBulkPayload());

    expect(store.creatingIr()).toBe(false);
    expect(store.createIrError()).toBe('Network down');
  });

  it('remembers the returned ir_seq — WwellIrComponent.createNewIr() reads this to select the just-created draft', () => {
    serviceMock.createIr.mockReturnValue(of(buildCreated(9001)));

    store.createIr(buildPayload(), buildIrBulkPayload());

    expect(store.draftIrSeq()).toBe(9001);
  });
});
