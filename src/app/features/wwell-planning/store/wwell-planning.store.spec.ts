import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CreateIntegratedRequirementPayload, IntegratedRequirement } from '@models/wwell-planning/wwell-planning.model';
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

function buildCreated(): IntegratedRequirement {
  return {
    id: 'IR-26-999',
    code: 'IR-26-999',
    updatedDate: '2026-08-04',
    attachmentNames: [],
    chain: [],
    ...buildPayload(),
  };
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

    store.createIntegratedRequirement(buildPayload(), files);

    expect(serviceMock.createIntegratedRequirement).toHaveBeenCalledWith(buildPayload(), files);
    expect(store.integratedRequirements()).toEqual([created]);
    expect(store.creatingIntegratedRequirement()).toBe(false);
    expect(store.createIntegratedRequirementError()).toBeNull();
  });

  it('defaults files to an empty array when omitted', () => {
    serviceMock.createIntegratedRequirement.mockReturnValue(of(buildCreated()));

    store.createIntegratedRequirement(buildPayload());

    expect(serviceMock.createIntegratedRequirement).toHaveBeenCalledWith(buildPayload(), []);
  });

  it('sets createIntegratedRequirementError on failure and clears the creating flag', () => {
    serviceMock.createIntegratedRequirement.mockReturnValue(throwError(() => new Error('Network down')));

    store.createIntegratedRequirement(buildPayload());

    expect(store.creatingIntegratedRequirement()).toBe(false);
    expect(store.createIntegratedRequirementError()).toBe('Network down');
  });
});
