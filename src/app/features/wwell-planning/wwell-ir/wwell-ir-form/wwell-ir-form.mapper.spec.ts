import { mapIrFormValueToSubmission } from './wwell-ir-form.mapper';
import { WwellIrFormRawValue } from './wwell-ir-form.types';

function buildRaw(overrides: Partial<WwellIrFormRawValue> = {}): WwellIrFormRawValue {
  return {
    reference: {
      main: {
        linkedRequestId: 'REQ-00198',
        client: 'BI-12',
        supportingBusiness: 'Agriculture',
        wellName: 'HAIL-500',
        targetAquifer: 'Saq',
        targetDepthFt: 510,
        surfaceElevationFtAsl: 980,
        coordinates: '27.5114°N, 41.7208°E',
      },
    },
    subsurface: {
      formationTops: [{ name: 'Saq', depthFt: 200 }],
      casing: [{ type: 'Conductor', sizeIn: '20"', depthFtBgl: 30, remarks: 'Cemented' }],
    },
    programDetails: {
      main: { completion: 'Screened', acidization: '', transmission: '' },
      developmentTesting: { logging: 'Caliper', mudLogging: '', sampling: '', flowTest: '' },
    },
    contacts: {
      geologist: { geologistPrimary: 'Eng. A. Al-Mutairi', geologistSecondary: '' },
      offsetWells: [{ wellName: 'HAIL-100' }],
      remarks: { offsetWellsRemarks: '' },
    },
    hydrogeology: {
      estimated: { aquifer: 'Saq', estimatedTdsPpm: 1200, h2sPpm: 5, estimatedPumpDepthFt: 150 },
      testProgram: { testType: 'pump-test', estimatedRateGpm: 350, estimatedWaterLevelFt: 95 },
    },
    attachments: { files: { locationMap: [], initiationRequest: [new File(['x'], 'init.pdf')] } },
    ...overrides,
  };
}

describe('mapIrFormValueToSubmission', () => {
  it('maps the nested raw form value to the domain payload shape', () => {
    const { payload } = mapIrFormValueToSubmission(buildRaw(), 'in-progress');

    expect(payload.status).toBe('in-progress');
    expect(payload.requestReference.wellName).toBe('HAIL-500');
    expect(payload.requestReference.linkedRequestId).toBe('REQ-00198');
    expect(payload.casing).toEqual([{ type: 'Conductor', sizeIn: '20"', depthFtBgl: 30, remarks: 'Cemented' }]);
    expect(payload.testProgram.testType).toBe('pump-test');
  });

  it('collects every file-typed field into one flat files array', () => {
    const { files } = mapIrFormValueToSubmission(buildRaw(), 'in-progress');

    expect(files).toHaveLength(1);
    expect(files[0].name).toBe('init.pdf');
  });

  it('normalizes blank optional strings to null', () => {
    const { payload } = mapIrFormValueToSubmission(buildRaw(), 'draft');

    expect(payload.contacts.geologistSecondary).toBeNull();
    expect(payload.offsetWellsRemarks).toBeNull();
    expect(payload.requestReference.linkedRequestId).toBe('REQ-00198');
  });

  it('preserves the requested status, including draft', () => {
    const { payload } = mapIrFormValueToSubmission(buildRaw(), 'draft');
    expect(payload.status).toBe('draft');
  });
});
