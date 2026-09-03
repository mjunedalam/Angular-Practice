import { IntegratedRequirement, IntegratedRequirementTestType } from '@models/wwell-planning/integrated-requirement.model';
import { WWELL_TRANSMISSION_CODE_BY_LABEL } from '../../shared/wwell-planning-reference-data.config';
import { stripLegacyIrHtml } from './wwell-ir-legacy-html.util';
import {
  IrCasingRow,
  IrHeaderRow,
  IrHydrogeologyRow,
  IrLinkedWellRow,
  IrTopsRow,
  IrWaterRow,
  WwellIrDetailTableBlock,
  WwellIrTableName,
} from './wwell-ir-payload.model';

/** Inverse of wwell-ir-payload.mapper.ts's resolveTransmissionCode: exad_gwd_ir_header.trns_type
 *  is VARCHAR2(10), too short for the full label, so a known label is stored as its short code
 *  ('Pipeline' → 'PL'). Decode it back to the label the form's option list expects, otherwise the
 *  select has no matching option and silently renders blank. Anything unrecognised (free-typed
 *  text that was truncated to fit) is passed through as-is. */
function decodeTransmission(code: string | null | undefined): string | null {
  if (!code) return null;
  const label = Object.keys(WWELL_TRANSMISSION_CODE_BY_LABEL).find(key => WWELL_TRANSMISSION_CODE_BY_LABEL[key] === code);
  return label ?? code;
}

/** Every IrXxxRow interface in wwell-ir-payload.model.ts (IrHeaderRow, IrCasingRow, IrTopsRow,
 *  IrHydrogeologyRow, IrWaterRow) uses lowercase snake_case field names mirroring the Oracle
 *  column names — but Oracle's own default column casing (and whatever exad_agwa_queries_pkg's
 *  get_ir_data_prc happens to emit) isn't guaranteed to be lowercase, so a row can come back with
 *  the same fields in UPPERCASE or MixedCase. Since every field this file reads is lowercase by
 *  contract, lowercasing every key up front makes each row match regardless of how the backend
 *  cased it — the same fix as `rowsFor`'s table-name comparison below, applied to row field names. */
function normalizeRowKeys<TRow>(row: Record<string, unknown>): TRow {
  const normalized: Record<string, unknown> = {};
  for (const key of Object.keys(row)) {
    normalized[key.toLowerCase()] = row[key];
  }
  return normalized as TRow;
}

/** Case-insensitive on `candidate.table`: the GET /{irSeq} detail endpoint echoes back
 *  UPPERCASE table names (EXAD_GWD_IR_HEADER...) per exad_agwa_queries_pkg.get_ir_data_prc,
 *  while WwellIrTableName (and the bulk-save write path) uses lowercase — a strict `===` here
 *  never matched, so every block silently resolved to empty and wiped casing/formationTops on
 *  every detail fetch. */
function rowsFor<TRow>(blocks: readonly WwellIrDetailTableBlock[], table: WwellIrTableName): readonly TRow[] {
  const block = blocks.find(candidate => candidate.table.toLowerCase() === table);
  return (block?.data ?? []).map(row => normalizeRowKeys<TRow>(row));
}

/** Inverse of the `h2s: '${ppm} ppm'` formatting in wwell-ir-payload.mapper.ts. */
function parseH2sPpm(h2s: string | null | undefined): number | null {
  if (!h2s) return null;
  const value = parseFloat(h2s);
  return Number.isFinite(value) ? value : null;
}

/** `stripLegacyIrHtml` version of the `raw ?? fallback` pattern used throughout this merge: falls
 *  back to `fallback` only when the backend genuinely sent nothing (`null`/`undefined`) for this
 *  column, same as a bare `??` would — an explicitly-cleared column (`''`) is a real value and
 *  must still win over `fallback`, not be treated as "missing" just because stripping an empty
 *  string also yields `''`. */
function resolveLegacyText(raw: string | null | undefined, fallback: string): string {
  return raw != null ? stripLegacyIrHtml(raw) : fallback;
}

/**
 * Enriches an already-known IntegratedRequirement (e.g. from the GET-all summary list) with the
 * real casing/tops/hydrogeology/program data from a GET /{irSeq} detail fetch. Merges onto
 * `existing` rather than building from scratch because most domain-only fields (client,
 * supportingBusiness, targetAquifer, targetDepthFt, contacts, offsetWells, attachments...) have no
 * backing column on exad_gwd_ir_header — see wwell-ir-summary.mapper.ts for the same limitation on
 * the list side, and docs/ir/EXAD_GWD_IR_HEADER.md for the table's real column set.
 * `linkedRequestId`/`letterNumber` (prewap_seq/ltr_no) and the Development & Testing fields
 * (sampling/logging/mud_rmks/flow_rmks) DO have real columns, so those are read back from `header`
 * below rather than left as `existing` had them. Field mappings mirror buildWwellIrBulkSavePayload
 * in wwell-ir-payload.mapper.ts exactly (this is that function's inverse) — keep the two in sync
 * if either changes.
 *
 * wellName/surfaceElevationFtAsl/coordinates come from the new `exad_rcd_prewap` block
 * (get_ir_data_prc, agwa-planning backend) — a live join on the header's own prewap_seq — rather
 * than from `wwell-ir-linked-well.util.ts`'s eligible-wells lookup: that lookup can only ever
 * resolve a well that does NOT yet have an IR (get_ir_wells_prc's own eligibility filter), so it
 * structurally can never succeed for an IR that's already been saved with a link. This block is
 * the actual source of truth for those three fields once a record's detail has been fetched once.
 */
export function mergeIrDetailBlocksIntoIntegratedRequirement(
  existing: IntegratedRequirement,
  blocks: readonly WwellIrDetailTableBlock[],
): IntegratedRequirement {
  const header = rowsFor<IrHeaderRow>(blocks, 'exad_gwd_ir_header')[0] as IrHeaderRow | undefined;
  const casingRows = rowsFor<IrCasingRow>(blocks, 'exad_gwd_ir_casing');
  const topsRows = rowsFor<IrTopsRow>(blocks, 'exad_gwd_ir_tops');
  const hydroRow = rowsFor<IrHydrogeologyRow>(blocks, 'exad_gwd_ir_hydrogeology')[0] as IrHydrogeologyRow | undefined;
  const waterRows = rowsFor<IrWaterRow>(blocks, 'exad_gwd_ir_water');
  const linkedWell = rowsFor<IrLinkedWellRow>(blocks, 'exad_rcd_prewap')[0] as IrLinkedWellRow | undefined;

  return {
    ...existing,
    requestReference: {
      ...existing.requestReference,
      // prewap_seq/ltr_no are the only two Request Reference columns exad_gwd_ir_header actually
      // has (see docs/ir/EXAD_GWD_IR_HEADER.md) — everything else on this section that has no
      // backing column there (client, targetAquifer...) stays whatever `existing` already carries.
      // WwellIrStore.createIr passes the record's own pre-save state as `existing`, not whatever
      // was just typed, so an edit to one of these fields correctly reverts rather than appearing
      // to have saved when there is nowhere real to persist it.
      linkedRequestId: header?.prewap_seq != null ? String(header.prewap_seq) : existing.requestReference.linkedRequestId,
      letterNumber: header?.ltr_no ?? existing.requestReference.letterNumber,
      // Live off the new exad_rcd_prewap block (see this function's own doc comment above) — a
      // record with no linked request has no `linkedWell` row and falls through to whatever
      // `existing` already had (blank, for a never-linked IR).
      wellName: linkedWell?.well_name ?? existing.requestReference.wellName,
      surfaceElevationFtAsl: linkedWell?.surface_elevation ?? existing.requestReference.surfaceElevationFtAsl,
      coordinates:
        linkedWell?.surface_north != null && linkedWell?.surface_east != null
          ? `${linkedWell.surface_north}°N, ${linkedWell.surface_east}°E`
          : existing.requestReference.coordinates,
    },
    formationTops: topsRows.map(row => ({
      name: row.st_long_cd,
      depthFt: row.plan_tvd_dpth,
      subSeaFtAsl: row.plan_ss_dpth ?? null,
    })),
    // exad_gwd_ir_water has no well-name column — epANum is the only identifier that round-trips
    // (see IrWaterRow / docs/ir/p2-ir.md). `temp` has no form field, so it is simply not read.
    offsetWells: waterRows.map(row => ({
      epANum: row.ep_a_num,
      distanceKm: row.distanct ?? null,
      location: row.direction ?? null,
      aquifer: row.aquifer ?? null,
      totalDepthFt: row.td ?? null,
      testDurationMin: row.test_duration ?? null,
      rateGpm: row.rate ?? null,
      rpm: row.rpm ?? null,
      swlFt: row.swl ?? null,
      pwlFt: row.final_pwl ?? null,
      drawdownFt: row.drawdown ?? null,
      specificCapacity: row.spec_capacity ?? null,
      tdsPpm: row.field_tds ?? null,
      h2sPpm: row.h2s ?? null,
    })),
    // tolFtBgl has no column yet (buildWwellIrBulkSavePayload never writes it either) — stays null.
    casing: casingRows.map(row => ({
      type: row.csg_type,
      sizeIn: row.csg_size,
      depthFtBgl: row.csg_depth,
      tolFtBgl: null,
      remarks: row.csg_remarks ?? null,
    })),
    programDetails: {
      ...existing.programDetails,
      // Older records saved these six remarks columns as raw `<HTML>...` markup (a legacy rich-
      // text control's "Save As HTML" dump) instead of plain text — stripLegacyIrHtml() is a no-op
      // on anything that isn't that markup, so this is safe whether the record is old or new. See
      // that util's own doc comment for why running it here (the one place these columns become
      // IntegratedRequirement fields) is also what keeps a later re-save plain-text-only.
      completion: resolveLegacyText(header?.completion ?? header?.cmpl_type, existing.programDetails.completion),
      // Both are written by buildWwellIrBulkSavePayload but were never read back here, so
      // Transmission/Acidization rendered blank after any reload even though the values were in
      // the DB the whole time — the same class of gap that hid Logging/Sampling before.
      acidization: resolveLegacyText(header?.acidization, existing.programDetails.acidization),
      transmission: decodeTransmission(header?.trns_type) ?? existing.programDetails.transmission,
      developmentTesting: {
        logging: resolveLegacyText(header?.logging, existing.programDetails.developmentTesting.logging),
        mudLogging: resolveLegacyText(header?.mud_rmks, existing.programDetails.developmentTesting.mudLogging),
        sampling: resolveLegacyText(header?.sampling, existing.programDetails.developmentTesting.sampling),
        flowTest: resolveLegacyText(header?.flow_rmks, existing.programDetails.developmentTesting.flowTest),
        remarks: resolveLegacyText(header?.dt_rmks, existing.programDetails.developmentTesting.remarks),
      },
    },
    hydrogeology: hydroRow
      ? {
          aquifer: hydroRow.st_long_cd,
          estimatedTdsPpm: hydroRow.est_water_quality,
          h2sPpm: parseH2sPpm(hydroRow.h2s),
          // Not persisted anywhere in the wire contract yet — carry forward whatever was known.
          estimatedPumpDepthFt: existing.hydrogeology.estimatedPumpDepthFt,
        }
      : existing.hydrogeology,
    testProgram: {
      ...existing.testProgram,
      testType: (header?.test_type as IntegratedRequirementTestType | null | undefined) ?? existing.testProgram.testType,
      estimatedRateGpm: hydroRow?.est_productivity ?? existing.testProgram.estimatedRateGpm,
      estimatedWaterLevelFt: hydroRow?.est_sta_water_lvl ?? existing.testProgram.estimatedWaterLevelFt,
    },
  };
}
