import {
  IntegratedRequirement,
  IntegratedRequirementCasingRow,
  IntegratedRequirementFormationTop,
  IntegratedRequirementHydrogeology,
  IntegratedRequirementTestProgram,
} from '@models/wwell-planning/integrated-requirement.model';
import { WwellIrFormRawValue, WwellIrRawCasingRow, WwellIrRawFormationTop, WwellIrRawHydrology } from './wwell-ir-form.types';
import {
  IrCasingRow,
  IrHeaderRow,
  IrHydrogeologyRow,
  IrRowAction,
  IrTopsRow,
  WwellIrBulkSavePayload,
} from './wwell-ir-payload.model';
import {
  WWELL_GEOLOGIST_ID_BY_NAME,
  WWELL_TRANSMISSION_CODE_BY_LABEL,
} from '../../shared/wwell-planning-reference-data.config';

/**
 * Carries the previously-assigned ir_seq (if any) so a repeat save UPDATEs instead of
 * re-INSERTing, plus (when known) the record as it was last loaded/saved — used to diff each
 * repeatable row's OWN action instead of inheriting one blanket action for the whole payload.
 * `existing` is intentionally distinguished from "omitted": omitting it (or passing `null`) falls
 * back to the old whole-payload action (every row shares `resolveRowAction(irSeq)`) — the only
 * safe choice when the caller has no snapshot to diff against, since guessing would otherwise
 * risk re-labeling an already-persisted row as a fresh INSERT (duplicate) or a still-current row
 * as DELETE (data loss).
 */
export interface WwellIrSaveContext {
  readonly irSeq: number | null;
  readonly existing?: Pick<IntegratedRequirement, 'casing' | 'formationTops' | 'hydrogeology' | 'testProgram'> | null;
}

const NEW_IR_CONTEXT: WwellIrSaveContext = { irSeq: null, existing: null };

function resolveRowAction(irSeq: number | null): IrRowAction {
  return irSeq === null ? 'INSERT' : 'UPDATE';
}

const isBlankCasingRow = (row: WwellIrRawCasingRow): boolean =>
  !row.type && !row.sizeIn && !row.remarks && row.depthFtBgl == null;

const isBlankFormationTop = (row: WwellIrRawFormationTop): boolean =>
  !row.name && !row.description && row.depthFt == null && row.subSeaFtAsl == null;

/** Natural keys the backend's UPDATE/DELETE branches match repeatable rows by (see
 *  EXAD_AGWA_IUD_PKG.save_casing/save_tops in 05-agwa-iud-package.sql) — a row whose key isn't
 *  already present in `existing` is genuinely new and must be sent as INSERT, not UPDATE, or the
 *  backend's `WHERE <key match>` finds nothing and silently drops it. */
const casingKey = (row: { readonly type: string; readonly sizeIn: string }): string => `${row.type} ${row.sizeIn}`;
const topKey = (row: { readonly name: string }): string => row.name;

/** Only the columns save_casing's/save_tops' UPDATE branch actually writes (type/size are the
 *  match key itself, not a writable column) — comparing anything else could flag a row "changed"
 *  when nothing the backend would touch actually differs. */
const casingRowUnchanged = (existingRow: IntegratedRequirementCasingRow, row: WwellIrRawCasingRow): boolean =>
  existingRow.depthFtBgl === (row.depthFtBgl ?? 0) && (existingRow.remarks ?? null) === (row.remarks || null);

const topRowUnchanged = (existingRow: IntegratedRequirementFormationTop, row: WwellIrRawFormationTop): boolean =>
  existingRow.depthFt === (row.depthFt ?? 0) && (existingRow.subSeaFtAsl ?? null) === (row.subSeaFtAsl ?? null);

function buildCasingRows(
  raw: readonly WwellIrRawCasingRow[],
  irSeq: number | null,
  existing: readonly IntegratedRequirementCasingRow[] | null | undefined,
): IrCasingRow[] {
  const currentRows = raw.filter(row => !isBlankCasingRow(row));

  if (existing == null) {
    const action = resolveRowAction(irSeq);
    return currentRows.map(row => ({
      action,
      ir_seq: irSeq,
      csg_size: row.sizeIn,
      csg_type: row.type,
      csg_depth: row.depthFtBgl ?? 0,
      csg_remarks: row.remarks || null,
    }));
  }

  const existingByKey = new Map(existing.map(row => [casingKey(row), row]));
  const keptKeys = new Set<string>();

  // A row this save didn't actually change is sent as '' (no-op), not a redundant UPDATE — see
  // IrRowAction's doc comment: the backend's per-row action switch then skips the DML entirely
  // instead of re-writing a row with the exact values it already has on every single save.
  const upserts: IrCasingRow[] = currentRows.map(row => {
    const key = casingKey(row);
    const existingRow = existingByKey.get(key);
    if (existingRow) keptKeys.add(key);
    const action: IrRowAction = existingRow ? (casingRowUnchanged(existingRow, row) ? '' : 'UPDATE') : 'INSERT';
    return {
      action,
      ir_seq: existingRow ? irSeq : null,
      csg_size: row.sizeIn,
      csg_type: row.type,
      csg_depth: row.depthFtBgl ?? 0,
      csg_remarks: row.remarks || null,
    };
  });

  const deletes: IrCasingRow[] = existing
    .filter(row => !keptKeys.has(casingKey(row)))
    .map(row => ({
      action: 'DELETE',
      ir_seq: irSeq,
      csg_size: row.sizeIn,
      csg_type: row.type,
      csg_depth: row.depthFtBgl,
      csg_remarks: row.remarks,
    }));

  return [...upserts, ...deletes];
}

function buildTopsRows(
  raw: readonly WwellIrRawFormationTop[],
  irSeq: number | null,
  existing: readonly IntegratedRequirementFormationTop[] | null | undefined,
): IrTopsRow[] {
  const currentRows = raw.filter(row => !isBlankFormationTop(row));

  if (existing == null) {
    const action = resolveRowAction(irSeq);
    return currentRows.map(row => ({
      action,
      ir_seq: irSeq,
      st_long_cd: row.name,
      plan_tvd_dpth: row.depthFt ?? 0,
      plan_ss_dpth: row.subSeaFtAsl,
    }));
  }

  const existingByKey = new Map(existing.map(row => [topKey(row), row]));
  const keptKeys = new Set<string>();

  const upserts: IrTopsRow[] = currentRows.map(row => {
    const key = topKey(row);
    const existingRow = existingByKey.get(key);
    if (existingRow) keptKeys.add(key);
    const action: IrRowAction = existingRow ? (topRowUnchanged(existingRow, row) ? '' : 'UPDATE') : 'INSERT';
    return {
      action,
      ir_seq: existingRow ? irSeq : null,
      st_long_cd: row.name,
      plan_tvd_dpth: row.depthFt ?? 0,
      plan_ss_dpth: row.subSeaFtAsl,
    };
  });

  const deletes: IrTopsRow[] = existing
    .filter(row => !keptKeys.has(topKey(row)))
    .map(row => ({
      action: 'DELETE',
      ir_seq: irSeq,
      st_long_cd: row.name,
      plan_tvd_dpth: row.depthFt,
      plan_ss_dpth: row.subSeaFtAsl ?? null,
    }));

  return [...upserts, ...deletes];
}

/** True when nothing save_hydrogeology's UPDATE branch would actually write has changed —
 *  est_sta_water_lvl/est_productivity come from the form's (and domain model's) testProgram
 *  section, not hydrogeology, so both are needed to tell "unchanged" from "changed". */
const hydrogeologyRowUnchanged = (
  existingHydro: IntegratedRequirementHydrogeology,
  existingTestProgram: IntegratedRequirementTestProgram,
  raw: WwellIrRawHydrology,
): boolean =>
  existingTestProgram.estimatedWaterLevelFt === raw.estimatedWaterLevelFt &&
  existingHydro.estimatedTdsPpm === raw.estimatedTdsPpm &&
  existingTestProgram.estimatedRateGpm === raw.estimatedRateGpm &&
  existingHydro.h2sPpm === raw.h2sPpm;

/** Only ever 0 or 1 row (the form has a single hydrogeology section, not a repeatable list), keyed
 *  by aquifer (st_long_cd) the same way the backend matches it — so switching to a different
 *  aquifer must DELETE the old row, not silently orphan it under a key nothing will ever match again. */
function buildHydrogeologyRows(
  raw: WwellIrRawHydrology,
  irSeq: number | null,
  existing: Pick<IntegratedRequirement, 'hydrogeology' | 'testProgram'> | null | undefined,
): IrHydrogeologyRow[] {
  const currentAquifer = raw.aquifer || null;

  if (existing == null) {
    if (!currentAquifer) return [];
    const action = resolveRowAction(irSeq);
    return [
      {
        action,
        ir_seq: irSeq,
        st_long_cd: currentAquifer,
        est_sta_water_lvl: raw.estimatedWaterLevelFt,
        est_water_quality: raw.estimatedTdsPpm,
        est_productivity: raw.estimatedRateGpm,
        flowing: null,
        h2s: raw.h2sPpm != null ? `${raw.h2sPpm} ppm` : null,
      },
    ];
  }

  const existingAquifer = existing.hydrogeology.aquifer || null;
  const rows: IrHydrogeologyRow[] = [];

  if (existingAquifer && existingAquifer !== currentAquifer) {
    rows.push({
      action: 'DELETE',
      ir_seq: irSeq,
      st_long_cd: existingAquifer,
      est_sta_water_lvl: null,
      est_water_quality: null,
      est_productivity: null,
      flowing: null,
      h2s: null,
    });
  }

  if (currentAquifer) {
    const isExisting = existingAquifer === currentAquifer;
    const action: IrRowAction = isExisting
      ? hydrogeologyRowUnchanged(existing.hydrogeology, existing.testProgram, raw)
        ? ''
        : 'UPDATE'
      : 'INSERT';
    rows.push({
      action,
      ir_seq: isExisting ? irSeq : null,
      st_long_cd: currentAquifer,
      est_sta_water_lvl: raw.estimatedWaterLevelFt,
      est_water_quality: raw.estimatedTdsPpm,
      est_productivity: raw.estimatedRateGpm,
      flowing: null,
      h2s: raw.h2sPpm != null ? `${raw.h2sPpm} ppm` : null,
    });
  }

  return rows;
}

/** exad_gwd_ir_header.tops_remarks is a single column, but Formation Tops is a repeatable row
 *  list each with its own "Remarks" text — join whatever's there instead of keeping only one row's
 *  text and silently dropping the rest. */
function buildTopsRemarks(rows: readonly WwellIrRawFormationTop[]): string | null {
  const remarks = rows.map(row => row.description?.trim()).filter((text): text is string => !!text);
  return remarks.length ? remarks.join('; ') : null;
}

/** TEMPORARY: resolves a geologist's display name to the numeric id
 *  exad_gwd_ir_header.cont_geologist/sub_cont_geologist actually expects — see
 *  WWELL_GEOLOGIST_ID_BY_NAME's doc comment for why this is a stopgap. */
function resolveGeologistId(name: string): number | null {
  return name ? (WWELL_GEOLOGIST_ID_BY_NAME[name] ?? null) : null;
}

/** exad_gwd_ir_header.trns_typf is VARCHAR2(10) — too short for the full Transmission label, so a
 *  known option maps to its short code; anything else (free-typed 'combo' text) is truncated to
 *  fit rather than silently dropped by Oracle's lax JSON_TABLE conversion. */
function resolveTransmissionCode(value: string): string | null {
  if (!value) return null;
  return WWELL_TRANSMISSION_CODE_BY_LABEL[value] ?? value.slice(0, 10);
}

/** Bridges the wizard's raw form value to the exad_gwd_ir_* bulk-save wire format — see wwell-ir-payload.model.ts. */
export function buildWwellIrBulkSavePayload(
  raw: WwellIrFormRawValue,
  context: WwellIrSaveContext = NEW_IR_CONTEXT,
): WwellIrBulkSavePayload {
  const { irSeq, existing } = context;
  const headerAction = resolveRowAction(irSeq);

  const header: IrHeaderRow = {
    action: headerAction,
    ir_seq: irSeq,
    prewap_seq: raw.reference.main.linkedRequestId ? Number(raw.reference.main.linkedRequestId) : null,
    ltr_no: raw.reference.main.letterNumber || null,
    screen: '',
    sampling: raw.programDetails.developmentTesting.sampling || null,
    logging: raw.programDetails.developmentTesting.logging || null,
    tops_remarks: buildTopsRemarks(raw.subsurface.formationTops),
    publish_dt: null,
    publish_flg: 'N', // flips once the approval workflow publishes this record, not at authoring time
    curr_flg: 'Y',
    publish_by: null,
    cont_geologist: resolveGeologistId(raw.contacts.geologist.geologistPrimary),
    sub_cont_geologist: resolveGeologistId(raw.contacts.geologist.geologistSecondary),
    water_remarks: null,
    geo_remarks: null,
    completion: raw.programDetails.main.completion || null,
    cmpl_type: null,
    acidization: raw.programDetails.main.acidization || null,
    trns_type: resolveTransmissionCode(raw.programDetails.main.transmission),
    ot_rmks: null,
    mud_rmks: raw.programDetails.developmentTesting.mudLogging || null,
    test_type: raw.hydrogeology.main.testType || null,
    flow_rmks: raw.programDetails.developmentTesting.flowTest || null,
  };

  const casing = buildCasingRows(raw.subsurface.casing, irSeq, existing?.casing);
  const tops = buildTopsRows(raw.subsurface.formationTops, irSeq, existing?.formationTops);
  const hydrogeology = buildHydrogeologyRows(raw.hydrogeology.main, irSeq, existing);

  return [
    { table: 'exad_gwd_ir_header', data: [header] },
    { table: 'exad_gwd_ir_casing', data: casing.length ? casing : null },
    { table: 'exad_gwd_ir_hydrogeology', data: hydrogeology.length ? hydrogeology : null },
    { table: 'exad_gwd_ir_tops', data: tops.length ? tops : null },
    { table: 'exad_gwd_ir_water', data: null }, // not captured by this form yet
  ];
}
