import { mapIrFormValueToSubmission } from './wwell-ir-form.mapper';
import { WwellIrFormRawValue } from './wwell-ir-form.types';

function buildRaw(overrides: Partial<WwellIrFormRawValue> = {}): WwellIrFormRawValue {
  return {
    reference: {
      main: {
        linkedRequestId: 'REQ-00198',
        letterNumber: 'LTR-2026-0456',
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
      formationTops: [{ name: 'Saq', depthFt: 200, subSeaFtAsl: 780 }],
      casing: [{ type: 'Conductor', sizeIn: '20"', depthFtBgl: 30, tolFtBgl: null, remarks: 'Cemented' }],
      remarks: { topsRemarks: 'Top of Saq' },
    },
    programDetails: {
      main: { completionType: '', completion: 'Screened', openHoleSizeIn: '', linerSizeIn: '', acidization: '', transmission: '' },
      developmentTesting: { logging: 'Caliper', mudLogging: '', sampling: '', flowTest: '', remarks: '' },
    },
    contacts: {
      geologist: { geologistPrimary: 'Eng. A. Al-Mutairi', geologistSecondary: '' },
      offsetWells: [
        {
          epANum: 100,
          distanceKm: 2.5,
          location: 'N 2.5 km',
          aquifer: 'Saq',
          totalDepthFt: 530,
          testDurationMin: 1440,
          rateGpm: 380,
          rpm: 1200,
          swlFt: 85,
          pwlFt: 110,
          drawdownFt: null,
          specificCapacity: null,
          tdsPpm: 1200,
          h2sPpm: 5,
        },
      ],
      remarks: { offsetWellsRemarks: '' },
    },
    hydrogeology: {
      main: {
        testType: 'pump-test',
        aquifer: 'Saq',
        siwhpPsi: null,
        estimatedTdsPpm: 1200,
        estimatedRateGpm: 350,
        h2sPpm: 5,
        estimatedWaterLevelFt: 95,
        estimatedPumpDepthFt: 150,
      },
    },
    attachments: { locationMap: { file: [] }, initiationRequest: { file: [new File(['x'], 'init.pdf')] }, wlda: { file: [] } },
    ...overrides,
  };
}

describe('mapIrFormValueToSubmission', () => {
  it('maps the nested raw form value to the domain payload shape', () => {
    const { payload } = mapIrFormValueToSubmission(buildRaw(), 'in-progress');

    expect(payload.status).toBe('in-progress');
    expect(payload.requestReference.wellName).toBe('HAIL-500');
    expect(payload.requestReference.linkedRequestId).toBe('REQ-00198');
    expect(payload.casing).toEqual([{ type: 'Conductor', sizeIn: '20"', depthFtBgl: 30, tolFtBgl: null, remarks: 'Cemented' }]);
    expect(payload.topsRemarks).toBe('Top of Saq');
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

  it('normalizes a blank Formation Tops remarks field to null', () => {
    const raw = buildRaw({ subsurface: { ...buildRaw().subsurface, remarks: { topsRemarks: '' } } });
    const { payload } = mapIrFormValueToSubmission(raw, 'draft');

    expect(payload.topsRemarks).toBeNull();
  });

  it('preserves the requested status, including draft', () => {
    const { payload } = mapIrFormValueToSubmission(buildRaw(), 'draft');
    expect(payload.status).toBe('draft');
  });
});
