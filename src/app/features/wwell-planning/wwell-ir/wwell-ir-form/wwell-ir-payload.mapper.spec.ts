import {
  IntegratedRequirementCasingRow,
  IntegratedRequirementFormationTop,
  IntegratedRequirementHydrogeology,
  IntegratedRequirementOffsetWell,
  IntegratedRequirementProgramDetails,
  IntegratedRequirementTestProgram,
} from '@models/wwell-planning/integrated-requirement.model';
import { buildWwellIrBulkSavePayload, WwellIrSaveContext } from './wwell-ir-payload.mapper';
import { WwellIrFormRawValue } from './wwell-ir-form.types';
import { IrCasingRow, IrTopsRow, IrWaterRow } from './wwell-ir-payload.model';

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
      formationTops: [{ name: 'ARUM', depthFt: 1855, subSeaFtAsl: 1015 }],
      casing: [{ type: 'Conductor', sizeIn: '24"', depthFtBgl: 100, tolFtBgl: null, remarks: 'Cemented' }],
      remarks: { topsRemarks: '' },
    },
    programDetails: {
      main: { completionType: '', completion: 'Screened', openHoleSizeIn: '', linerSizeIn: '', acidization: '', transmission: '' },
      developmentTesting: { logging: '', mudLogging: '', sampling: '', flowTest: '', remarks: '' },
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
    attachments: { locationMap: { file: [] }, initiationRequest: { file: [] }, wlda: { file: [] } },
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

  it('sets hydrogeology.flowing to Y for a flow test and writes siwhp straight through', () => {
    const raw = buildRaw({
      hydrogeology: { main: { ...buildRaw().hydrogeology.main, testType: 'flow-test', siwhpPsi: 42 } },
    });

    const [, , hydrogeology] = buildWwellIrBulkSavePayload(raw);

    expect(hydrogeology.data?.[0]).toMatchObject({ flowing: 'Y', siwhp: 42 });
  });

  it('sets hydrogeology.flowing to N for a pump test', () => {
    const [, , hydrogeology] = buildWwellIrBulkSavePayload(buildRaw());

    expect(hydrogeology.data?.[0]).toMatchObject({ flowing: 'N' });
  });

  it('drops fully-blank repeatable rows so an empty draft does not send junk INSERTs', () => {
    const blankRaw = buildRaw({
      subsurface: {
        formationTops: [{ name: '', depthFt: null, subSeaFtAsl: null }],
        casing: [{ type: '', sizeIn: '', depthFtBgl: null, tolFtBgl: null, remarks: '' }],
        remarks: { topsRemarks: '' },
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

  it('writes the single Formation Tops remarks field straight to header.tops_remarks', () => {
    const raw = buildRaw({ subsurface: { ...buildRaw().subsurface, remarks: { topsRemarks: 'Regional cap rock present' } } });

    const [header] = buildWwellIrBulkSavePayload(raw);

    expect(header.data?.[0].tops_remarks).toBe('Regional cap rock present');
  });

  it('writes the Area Water Wells remarks to header.water_remarks', () => {
    const raw = buildRaw({ contacts: { ...buildRaw().contacts, remarks: { offsetWellsRemarks: 'Nearest UMER wells are SHYB-1014 and SHYB-1024' } } });

    const [header] = buildWwellIrBulkSavePayload(raw);

    expect(header.data?.[0].water_remarks).toBe('Nearest UMER wells are SHYB-1014 and SHYB-1024');
  });

  it('omits the well_design row when nothing to persist yet (no pump depth, no Completion selected)', () => {
    const raw = buildRaw({ programDetails: { ...buildRaw().programDetails, main: { ...buildRaw().programDetails.main, completion: '' } } });
    const [, , , , , wellDesign] = buildWwellIrBulkSavePayload(raw);

    expect(wellDesign.table).toBe('exad_gwd_well_design');
    expect(wellDesign.data).toBeNull();
  });

  it('inserts a well_design row once Estimated Pump Depth is entered against a linked request', () => {
    const raw = buildRaw({
      reference: { main: { ...buildRaw().reference.main, linkedRequestId: '1198' } },
      hydrogeology: { main: { ...buildRaw().hydrogeology.main, estimatedPumpDepthFt: 350 } },
    });

    const [, , , , , wellDesign] = buildWwellIrBulkSavePayload(raw);

    expect(wellDesign.data?.[0]).toMatchObject({ action: 'INSERT', wd_seq: null, prewap_seq: 1198, pump_lvl: 350 });
  });

  /** The actual fix this file exists to cover: exad_gwd_well_design's oh_flg/gp_flg/ls_flg/
   *  perforated_flg (+ remarks) — update_ir_data_prc's own exad_gwd_well_design MERGE accepts
   *  these (docs/ir/update_ir_data_prc.sql) — were never sent at all before, so picking a
   *  Completion never persisted past this app's own `completion` text column. A Completion
   *  selection alone (no Estimated Pump Depth) must now be enough to insert the row. */
  it('inserts a well_design row carrying the derived completion-element flags once Completion is picked, even with no pump depth', () => {
    const raw = buildRaw({
      reference: { main: { ...buildRaw().reference.main, linkedRequestId: '1198' } },
      programDetails: {
        ...buildRaw().programDetails,
        main: { ...buildRaw().programDetails.main, completion: 'Open Hole', openHoleSizeIn: '8 1/2"' },
      },
    });

    const [, , , , , wellDesign] = buildWwellIrBulkSavePayload(raw);

    expect(wellDesign.data?.[0]).toMatchObject({
      action: 'INSERT',
      wd_seq: null,
      prewap_seq: 1198,
      pump_lvl: null,
      oh_flg: 'Y',
      oh_remarks: '8 1/2" Open Hole',
      gp_flg: 'N',
      gp_remarks: null,
      perforated_flg: 'N',
      perforated_remarks: null,
      ls_flg: 'N',
      ls_remarks: null,
    });
  });

  it('inserts a well_design row with ls_flg/gp_flg both Y for "Screened + Gravel Pack"', () => {
    const raw = buildRaw({
      reference: { main: { ...buildRaw().reference.main, linkedRequestId: '1198' } },
      programDetails: {
        ...buildRaw().programDetails,
        main: { ...buildRaw().programDetails.main, completion: 'Screened + Gravel Pack' },
      },
    });

    const [, , , , , wellDesign] = buildWwellIrBulkSavePayload(raw);

    expect(wellDesign.data?.[0]).toMatchObject({
      action: 'INSERT',
      gp_flg: 'Y',
      gp_remarks: 'Gravel Pack',
      ls_flg: 'Y',
      ls_remarks: 'Screen',
      oh_flg: 'N',
      perforated_flg: 'N',
    });
  });
});

/** Every repeatable section's `existing`-diff branch (see buildCasingRows/buildTopsRows/
 *  buildWaterRows in wwell-ir-payload.mapper.ts) needs a full `existing` record, even when a
 *  given test only cares about one section — the other four fall back to inert empty/blank
 *  values so they never contribute rows of their own to the assertions below. */
function buildExistingBase(
  overrides: Partial<{
    casing: readonly IntegratedRequirementCasingRow[];
    formationTops: readonly IntegratedRequirementFormationTop[];
    offsetWells: readonly IntegratedRequirementOffsetWell[];
    hydrogeology: IntegratedRequirementHydrogeology;
    testProgram: IntegratedRequirementTestProgram;
    wellDesignSeq: number | null;
    programDetails: IntegratedRequirementProgramDetails;
  }> = {},
): NonNullable<WwellIrSaveContext['existing']> {
  return {
    casing: [],
    formationTops: [],
    offsetWells: [],
    hydrogeology: { aquifer: '', estimatedTdsPpm: null, h2sPpm: null, estimatedPumpDepthFt: null },
    testProgram: { testType: 'pump-test', estimatedRateGpm: null, estimatedWaterLevelFt: null },
    programDetails: {
      completionType: '',
      completion: '',
      openHoleSizeIn: null,
      linerSizeIn: null,
      acidization: '',
      transmission: '',
      developmentTesting: { logging: '', mudLogging: '', sampling: '', flowTest: '', remarks: '' },
    },
    ...overrides,
  };
}

describe('buildWwellIrBulkSavePayload — existing-record diff (update/insert/delete combinations)', () => {
  it('casing: keeps an unchanged row as a no-op, tags a brand-new row INSERT, and tags a removed row DELETE — all in one save', () => {
    const existing = buildExistingBase({
      casing: [
        { type: 'Conductor', sizeIn: '24"', depthFtBgl: 100, tolFtBgl: null, remarks: 'Cemented' },
        { type: 'Surface', sizeIn: '13 3/8"', depthFtBgl: 500, tolFtBgl: null, remarks: null },
      ],
    });

    const raw = buildRaw({
      subsurface: {
        formationTops: [],
        casing: [
          // Same natural key (type + size) and same writable fields as the existing Conductor
          // row — the user left this one alone this save.
          { type: 'Conductor', sizeIn: '24"', depthFtBgl: 100, tolFtBgl: null, remarks: 'Cemented' },
          // No matching existing row — the user added this one.
          { type: 'Production', sizeIn: '9 5/8"', depthFtBgl: 900, tolFtBgl: null, remarks: 'New run' },
          // The Surface row from `existing` is simply absent — the user removed it in the UI.
        ],
        remarks: { topsRemarks: '' },
      },
    });

    const [, casing] = buildWwellIrBulkSavePayload(raw, { irSeq: 7001, existing });
    const rows = casing.data as IrCasingRow[];

    expect(rows).toHaveLength(3);
    expect(rows.find(row => row.csg_type === 'Conductor')).toMatchObject({ action: '', ir_seq: 7001 });
    expect(rows.find(row => row.csg_type === 'Production')).toMatchObject({ action: 'INSERT', ir_seq: null });
    expect(rows.find(row => row.csg_type === 'Surface')).toMatchObject({ action: 'DELETE', ir_seq: 7001 });
  });

  it('casing: tags a kept row UPDATE once one of its writable fields actually changed', () => {
    const existing = buildExistingBase({
      casing: [{ type: 'Conductor', sizeIn: '24"', depthFtBgl: 100, tolFtBgl: null, remarks: 'Cemented' }],
    });
    const raw = buildRaw({
      subsurface: {
        formationTops: [],
        casing: [{ type: 'Conductor', sizeIn: '24"', depthFtBgl: 120, tolFtBgl: null, remarks: 'Cemented' }],
        remarks: { topsRemarks: '' },
      },
    });

    const [, casing] = buildWwellIrBulkSavePayload(raw, { irSeq: 7001, existing });
    const rows = casing.data as IrCasingRow[];

    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ action: 'UPDATE', ir_seq: 7001, csg_depth: 120 });
  });

  it('formationTops: keeps an unchanged row as a no-op, tags a brand-new row INSERT, and tags a removed row DELETE', () => {
    const existing = buildExistingBase({
      formationTops: [
        { name: 'ARUM', depthFt: 1855, subSeaFtAsl: 1015 },
        { name: 'RUS', depthFt: 2200, subSeaFtAsl: 1360 },
      ],
    });
    const raw = buildRaw({
      subsurface: {
        casing: [],
        formationTops: [
          { name: 'ARUM', depthFt: 1855, subSeaFtAsl: 1015 },
          { name: 'BIYADH', depthFt: 3100, subSeaFtAsl: 2260 },
        ],
        remarks: { topsRemarks: '' },
      },
    });

    const [, , , tops] = buildWwellIrBulkSavePayload(raw, { irSeq: 7002, existing });
    const rows = tops.data as IrTopsRow[];

    expect(rows).toHaveLength(3);
    expect(rows.find(row => row.st_long_cd === 'ARUM')).toMatchObject({ action: '', ir_seq: 7002 });
    expect(rows.find(row => row.st_long_cd === 'BIYADH')).toMatchObject({ action: 'INSERT', ir_seq: null });
    expect(rows.find(row => row.st_long_cd === 'RUS')).toMatchObject({ action: 'DELETE', ir_seq: 7002 });
  });

  it('offsetWells: keeps an unchanged row as a no-op, tags a brand-new row INSERT, and tags a removed row DELETE', () => {
    const existing = buildExistingBase({
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
          drawdownFt: 25,
          specificCapacity: 15.2,
          tdsPpm: 1200,
          h2sPpm: 5,
        },
        {
          epANum: 200,
          distanceKm: 4.1,
          location: 'S 4.1 km',
          aquifer: 'Wasia',
          totalDepthFt: 610,
          testDurationMin: 1440,
          rateGpm: 300,
          rpm: 1100,
          swlFt: 90,
          pwlFt: 130,
          drawdownFt: 40,
          specificCapacity: 7.5,
          tdsPpm: 1500,
          h2sPpm: 3,
        },
      ],
    });
    const raw = buildRaw({
      contacts: {
        geologist: buildRaw().contacts.geologist,
        remarks: buildRaw().contacts.remarks,
        offsetWells: [
          // Row 100 kept, identical to `existing` — the user left this one alone this save.
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
            drawdownFt: 25,
            specificCapacity: 15.2,
            tdsPpm: 1200,
            h2sPpm: 5,
          },
          // No matching existing row — the user added this one.
          {
            epANum: 300,
            distanceKm: 1.2,
            location: 'E 1.2 km',
            aquifer: 'Biyadh',
            totalDepthFt: 480,
            testDurationMin: 720,
            rateGpm: 210,
            rpm: 900,
            swlFt: 60,
            pwlFt: 95,
            drawdownFt: 35,
            specificCapacity: 6,
            tdsPpm: 900,
            h2sPpm: 1,
          },
          // Row 200 from `existing` is simply absent — the user removed it in the UI.
        ],
      },
    });

    const [, , , , water] = buildWwellIrBulkSavePayload(raw, { irSeq: 7003, existing });
    const rows = water.data as IrWaterRow[];

    expect(rows).toHaveLength(3);
    expect(rows.find(row => row.ep_a_num === 100)).toMatchObject({ action: '', ir_seq: 7003 });
    expect(rows.find(row => row.ep_a_num === 300)).toMatchObject({ action: 'INSERT', ir_seq: null });
    expect(rows.find(row => row.ep_a_num === 200)).toMatchObject({ action: 'DELETE', ir_seq: 7003 });
  });

  it('well_design: keeps an existing row a no-op when neither Estimated Pump Depth nor Completion changed', () => {
    // `existing.programDetails` must match `raw`'s own Completion/Open Hole Size (buildRaw()'s
    // defaults: completion 'Screened', openHoleSizeIn '') for the row to read as genuinely
    // unchanged — see buildWellDesignRow's `unchanged` check, which now diffs both pump depth and
    // Completion, not pump depth alone.
    const existing = buildExistingBase({
      wellDesignSeq: 9500,
      hydrogeology: { aquifer: 'WASIA', estimatedTdsPpm: null, h2sPpm: null, estimatedPumpDepthFt: 350 },
      programDetails: {
        completionType: '',
        completion: 'Screened',
        openHoleSizeIn: null,
        linerSizeIn: null,
        acidization: '',
        transmission: '',
        developmentTesting: { logging: '', mudLogging: '', sampling: '', flowTest: '', remarks: '' },
      },
    });
    const raw = buildRaw({ hydrogeology: { main: { ...buildRaw().hydrogeology.main, estimatedPumpDepthFt: 350 } } });

    const [, , , , , wellDesign] = buildWwellIrBulkSavePayload(raw, { irSeq: 7001, existing });

    expect(wellDesign.data?.[0]).toMatchObject({ action: '', wd_seq: 9500 });
  });

  it('well_design: tags an existing row UPDATE once Estimated Pump Depth changes', () => {
    const existing = buildExistingBase({
      wellDesignSeq: 9500,
      hydrogeology: { aquifer: 'WASIA', estimatedTdsPpm: null, h2sPpm: null, estimatedPumpDepthFt: 350 },
      programDetails: {
        completionType: '',
        completion: 'Screened',
        openHoleSizeIn: null,
        linerSizeIn: null,
        acidization: '',
        transmission: '',
        developmentTesting: { logging: '', mudLogging: '', sampling: '', flowTest: '', remarks: '' },
      },
    });
    const raw = buildRaw({ hydrogeology: { main: { ...buildRaw().hydrogeology.main, estimatedPumpDepthFt: 400 } } });

    const [, , , , , wellDesign] = buildWwellIrBulkSavePayload(raw, { irSeq: 7001, existing });

    expect(wellDesign.data?.[0]).toMatchObject({ action: 'UPDATE', wd_seq: 9500, pump_lvl: 400 });
  });

  it('well_design: tags an existing row UPDATE once Completion changes, independent of pump depth', () => {
    const existing = buildExistingBase({
      wellDesignSeq: 9500,
      hydrogeology: { aquifer: 'WASIA', estimatedTdsPpm: null, h2sPpm: null, estimatedPumpDepthFt: 350 },
      programDetails: {
        completionType: '',
        completion: 'Open Hole',
        openHoleSizeIn: null,
        linerSizeIn: null,
        acidization: '',
        transmission: '',
        developmentTesting: { logging: '', mudLogging: '', sampling: '', flowTest: '', remarks: '' },
      },
    });
    // buildRaw()'s default Completion ('Screened') differs from `existing`'s ('Open Hole') —
    // pump depth (350) is otherwise unchanged. The derived flags follow `raw` (what's being
    // saved now), not `existing` (what the row held before).
    const raw = buildRaw({ hydrogeology: { main: { ...buildRaw().hydrogeology.main, estimatedPumpDepthFt: 350 } } });

    const [, , , , , wellDesign] = buildWwellIrBulkSavePayload(raw, { irSeq: 7001, existing });

    expect(wellDesign.data?.[0]).toMatchObject({
      action: 'UPDATE',
      wd_seq: 9500,
      oh_flg: 'N',
      gp_flg: 'N',
      ls_flg: 'Y',
      ls_remarks: 'Screen',
      perforated_flg: 'N',
    });
  });
});
