import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CreateIntegratedRequirementPayload, IntegratedRequirement } from '@models/wwell-planning/wwell-planning.model';
import { WwellIrBulkSavePayload } from '../wwell-ir/wwell-ir-form/wwell-ir-payload.model';
import { WwellPlanningService } from '../wwell-planning.service';
import { WwellPlanningStore } from './wwell-planning.store';

const serviceMock = {
  createIntegratedRequirement: jest.fn(),
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
          orgwab_seq: null,
          itc_no: null,
          screen: '',
          tops_remarks: null,
          publish_dt: null,
          publish_flg: 'N',
          curr_flg: 'Y',
          publish_by: null,
          cont_geologist: null,
          sub_cont_geologist: null,
          water_remarks: null,
          geo_remarks: null,
          cmpl_type: 'Screened',
          trbs_type: null,
          ot_rmks: null,
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

describe('WwellPlanningStore - createIntegratedRequirement', () => {
  let store: InstanceType<typeof WwellPlanningStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [WwellPlanningStore, { provide: WwellPlanningService, useValue: serviceMock }],
    });
    store = TestBed.inject(WwellPlanningStore);
  });

  it('passes files through to the service and prepends the created row on success', () => {
    const created = buildCreated();
    const files = [new File(['x'], 'map.pdf')];
    serviceMock.createIntegratedRequirement.mockReturnValue(of(created));

    store.createIntegratedRequirement(buildPayload(), buildIrBulkPayload(), files);

    expect(serviceMock.createIntegratedRequirement).toHaveBeenCalledWith(buildPayload(), buildIrBulkPayload(), files);
    expect(store.integratedRequirements()).toEqual([created]);
    expect(store.creatingIntegratedRequirement()).toBe(false);
    expect(store.createIntegratedRequirementError()).toBeNull();
  });

  it('defaults files to an empty array when omitted', () => {
    serviceMock.createIntegratedRequirement.mockReturnValue(of(buildCreated()));

    store.createIntegratedRequirement(buildPayload(), buildIrBulkPayload());

    expect(serviceMock.createIntegratedRequirement).toHaveBeenCalledWith(buildPayload(), buildIrBulkPayload(), []);
  });

  it('sets createIntegratedRequirementError on failure and clears the creating flag', () => {
    serviceMock.createIntegratedRequirement.mockReturnValue(throwError(() => new Error('Network down')));

    store.createIntegratedRequirement(buildPayload(), buildIrBulkPayload());

    expect(store.creatingIntegratedRequirement()).toBe(false);
    expect(store.createIntegratedRequirementError()).toBe('Network down');
  });

  it('remembers the returned ir_seq so a later draft save can reuse it', () => {
    serviceMock.createIntegratedRequirement.mockReturnValue(of(buildCreated(9001)));

    store.createIntegratedRequirement(buildPayload(), buildIrBulkPayload());

    expect(store.draftIrSeq()).toBe(9001);
  });

  it('resetIntegratedRequirementDraft clears the remembered ir_seq for a fresh "new IR" session', () => {
    serviceMock.createIntegratedRequirement.mockReturnValue(of(buildCreated(9001)));
    store.createIntegratedRequirement(buildPayload(), buildIrBulkPayload());

    store.resetIntegratedRequirementDraft();

    expect(store.draftIrSeq()).toBeNull();
  });
});
