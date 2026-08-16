import { buildWwellIrBulkSavePayload } from './wwell-ir-payload.mapper';
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
      formationTops: [{ name: 'ARUM', depthFt: 1855, subSeaFtAsl: 1015, description: '' }],
      casing: [{ type: 'Conductor', sizeIn: '24"', depthFtBgl: 100, tolFtBgl: null, remarks: 'Cemented' }],
    },
    programDetails: {
      main: { completion: 'Screened', openHoleSizeIn: '', acidization: '', transmission: '' },
      developmentTesting: { logging: '', mudLogging: '', sampling: '', flowTest: '' },
    },
    contacts: {
      geologist: { geologistPrimary: 'Eng. A. Al-Mutairi', geologistSecondary: '' },
      offsetWells: [],
      remarks: { offsetWellsRemarks: '' },
    },
    hydrogeology: {
      main: {
        testType: 'pump-test',
        aquifer: 'WASIA',
        siwhpPsi: null,
        estimatedTdsPpm: 3000,
        estimatedRateGpm: 500,
        h2sPpm: null,
        estimatedWaterLevelFt: 72,
        estimatedPumpDepthFt: null,
      },
    },
    attachments: { files: { locationMap: [], initiationRequest: [] } },
    ...overrides,
  };
}

describe('buildWwellIrBulkSavePayload', () => {
  it('tags every row INSERT and leaves ir_seq null for a brand-new IR', () => {
    const [header, casing, hydrogeology, tops] = buildWwellIrBulkSavePayload(buildRaw());

    expect(header.data?.[0].action).toBe('INSERT');
    expect(header.data?.[0].ir_seq).toBeNull();
    expect(casing.data?.[0].action).toBe('INSERT');
    expect(hydrogeology.data?.[0].action).toBe('INSERT');
    expect(tops.data?.[0].action).toBe('INSERT');
  });

  it('tags every row UPDATE and threads the known ir_seq once one exists', () => {
    const [header, casing] = buildWwellIrBulkSavePayload(buildRaw(), { irSeq: 8992 });

    expect(header.data?.[0].action).toBe('UPDATE');
    expect(header.data?.[0].ir_seq).toBe(8992);
    expect(casing.data?.[0].ir_seq).toBe(8992);
  });

  it('maps casing and formation-top rows to their exad_gwd_ir_* column names', () => {
    const [, casing, , tops] = buildWwellIrBulkSavePayload(buildRaw());

    expect(casing.data?.[0]).toMatchObject({ csg_size: '24"', csg_type: 'Conductor', csg_depth: 100, csg_remarks: 'Cemented' });
    expect(tops.data?.[0]).toMatchObject({ st_long_cd: 'ARUM', plan_tvd_dpth: 1855, plan_ss_dpth: 1015 });
  });

  it('omits the hydrogeology row when the required aquifer field is still blank (mid-draft)', () => {
    const [, , hydrogeology] = buildWwellIrBulkSavePayload(
      buildRaw({ hydrogeology: { main: { ...buildRaw().hydrogeology.main, aquifer: '' } } }),
    );

    expect(hydrogeology.data).toBeNull();
  });

  it('drops fully-blank repeatable rows so an empty draft does not send junk INSERTs', () => {
    const blankRaw = buildRaw({
      subsurface: {
        formationTops: [{ name: '', depthFt: null, subSeaFtAsl: null, description: '' }],
        casing: [{ type: '', sizeIn: '', depthFtBgl: null, tolFtBgl: null, remarks: '' }],
      },
    });

    const [, casing, , tops] = buildWwellIrBulkSavePayload(blankRaw);

    expect(casing.data).toBeNull();
    expect(tops.data).toBeNull();
  });

  it('always emits the water table block with null data — not yet captured by this form', () => {
    const [, , , , water] = buildWwellIrBulkSavePayload(buildRaw());

    expect(water.table).toBe('exad_gwd_ir_water');
    expect(water.data).toBeNull();
  });
});
