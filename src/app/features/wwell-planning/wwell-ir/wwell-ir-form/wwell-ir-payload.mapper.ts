import { WwellIrFormRawValue, WwellIrRawCasingRow, WwellIrRawFormationTop } from './wwell-ir-form.types';
import {
  IrCasingRow,
  IrHeaderRow,
  IrHydrogeologyRow,
  IrRowAction,
  IrTopsRow,
  WwellIrBulkSavePayload,
} from './wwell-ir-payload.model';

/** Carries the previously-assigned ir_seq (if any) so a repeat save UPDATEs instead of re-INSERTing. */
export interface WwellIrSaveContext {
  readonly irSeq: number | null;
}

const NEW_IR_CONTEXT: WwellIrSaveContext = { irSeq: null };

function resolveRowAction(irSeq: number | null): IrRowAction {
  return irSeq === null ? 'INSERT' : 'UPDATE';
}

const isBlankCasingRow = (row: WwellIrRawCasingRow): boolean =>
  !row.type && !row.sizeIn && !row.remarks && row.depthFtBgl == null;

const isBlankFormationTop = (row: WwellIrRawFormationTop): boolean =>
  !row.name && !row.description && row.depthFt == null && row.subSeaFtAsl == null;

/** Bridges the wizard's raw form value to the exad_gwd_ir_* bulk-save wire format — see wwell-ir-payload.model.ts. */
export function buildWwellIrBulkSavePayload(
  raw: WwellIrFormRawValue,
  context: WwellIrSaveContext = NEW_IR_CONTEXT,
): WwellIrBulkSavePayload {
  const { irSeq } = context;
  const action = resolveRowAction(irSeq);

  const header: IrHeaderRow = {
    action,
    ir_seq: irSeq,
    // Fields with no source in this form yet — left explicit so the next person adding them
    // knows exactly what's still missing, instead of guessing at a silently-wrong mapping.
    orgwab_seq: null,
    itc_no: null,
    screen: '',
    tops_remarks: null,
    publish_dt: null,
    publish_flg: 'N', // flips once the approval workflow publishes this record, not at authoring time
    curr_flg: 'Y',
    publish_by: null,
    cont_geologist: null, // form stores geologist name, not the numeric employee id this column expects
    sub_cont_geologist: null,
    water_remarks: null,
    geo_remarks: null,
    cmpl_type: raw.programDetails.main.completion || null,
    trbs_type: null,
    ot_rmks: null,
    mud_rmks: null,
    test_type: raw.hydrogeology.main.testType || null,
    flow_rmks: null,
  };

  const casing: IrCasingRow[] = raw.subsurface.casing
    .filter(row => !isBlankCasingRow(row))
    .map(row => ({
      action,
      ir_seq: irSeq,
      csg_size: row.sizeIn,
      csg_type: row.type,
      csg_depth: row.depthFtBgl ?? 0,
      csg_remarks: row.remarks || null,
    }));

  const tops: IrTopsRow[] = raw.subsurface.formationTops
    .filter(row => !isBlankFormationTop(row))
    .map(row => ({
      action,
      ir_seq: irSeq,
      st_long_cd: row.name,
      plan_tvd_dpth: row.depthFt ?? 0,
      plan_ss_dpth: row.subSeaFtAsl,
    }));

  // Skip entirely on a draft saved before the (required-on-submit) aquifer field is filled in.
  const hydrogeology: IrHydrogeologyRow[] = raw.hydrogeology.main.aquifer
    ? [
        {
          action,
          ir_seq: irSeq,
          st_long_cd: raw.hydrogeology.main.aquifer,
          est_sta_water_lvl: raw.hydrogeology.main.estimatedWaterLevelFt,
          est_water_quality: raw.hydrogeology.main.estimatedTdsPpm,
          est_productivity: raw.hydrogeology.main.estimatedRateGpm,
          flowing: null, // no confirmed wire encoding for this flag yet
          h2s: raw.hydrogeology.main.h2sPpm != null ? `${raw.hydrogeology.main.h2sPpm} ppm` : null,
        },
      ]
    : [];

  return [
    { table: 'exad_gwd_ir_header', data: [header] },
    { table: 'exad_gwd_ir_casing', data: casing.length ? casing : null },
    { table: 'exad_gwd_ir_hydrogeology', data: hydrogeology.length ? hydrogeology : null },
    { table: 'exad_gwd_ir_tops', data: tops.length ? tops : null },
    { table: 'exad_gwd_ir_water', data: null }, // not captured by this form yet
  ];
}
