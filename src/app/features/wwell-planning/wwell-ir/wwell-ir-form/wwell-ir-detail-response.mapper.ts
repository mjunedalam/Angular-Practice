import {
  IntegratedRequirement,
  IntegratedRequirementTestType,
  IntegratedRequirementWellDesignFlags,
} from '@models/wwell-planning/integrated-requirement.model';
import { stripLegacyIrHtml } from './wwell-ir-legacy-html.util';
import {
  IrCasingRow,
  IrHeaderRow,
  IrHydrogeologyRow,
  IrLinkedWellRow,
  IrTopsRow,
  IrWaterRow,
  IrWellDesignRow,
  WwellIrDetailTableBlock,
  WwellIrTableName,
} from './wwell-ir-payload.model';

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

/** Inverse of resolveGeologistId in wwell-ir-payload.mapper.ts: cont_geologist/sub_cont_geologist
 *  come back as a raw EMPNUM, not the name the picker showed - resolve it through the same
 *  FULL_NAME/EMPNUM reference data (WwellIrStore.geologistNameByEmpNum) used to build the picker's
 *  own options. Falls back to `fallback` (the caller's `existing` value) when the header has no
 *  value for this column yet, or the EMPNUM isn't found in the current ops-members list (e.g. a
 *  fetch that hasn't completed, or a since-removed employee) - same as every other lookup below,
 *  an unresolved value should keep whatever was last known rather than go blank. */
function resolveGeologistName(
  empNum: number | null | undefined,
  geologistNameByEmpNum: Readonly<Record<number, string>>,
  fallback: string | null,
): string | null {
  if (empNum == null) return fallback;
  return geologistNameByEmpNum[empNum] ?? fallback;
}

/** Inverse of the `h2s: '${ppm} ppm'` formatting in wwell-ir-payload.mapper.ts. */
function parseH2sPpm(h2s: string | null | undefined): number | null {
  if (!h2s) return null;
  const value = parseFloat(h2s);
  return Number.isFinite(value) ? value : null;
}

/** exad_gwd_well_design's flag columns come back as `'Y'|'N'|null` in practice, but the raw block
 *  is read as loosely-typed `Record<string, unknown>` (see rowsFor above) — narrow defensively to
 *  the two real values rather than trust the cast, falling back to 'N' for anything else (an
 *  absent/garbled column reads the same as "not set", matching how deriveCompletionElementFlags
 *  itself never produces a third value). */
function normalizeFlag(value: unknown): 'Y' | 'N' {
  return value === 'Y' ? 'Y' : 'N';
}

function normalizeRemarks(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null;
}

/** Reads the eight completion-element columns off a fetched exad_gwd_well_design row — see
 *  IntegratedRequirementWellDesignFlags' own doc comment. `null` when no row came back at all
 *  (no exad_gwd_well_design record yet for this well), not `undefined` — `undefined` is reserved
 *  for "never fetched" (a still-local draft), which this function is never called for. */
function mapWellDesignFlags(row: IrWellDesignRow | undefined): IntegratedRequirementWellDesignFlags | null {
  if (!row) return null;
  return {
    ohFlg: normalizeFlag(row.oh_flg),
    ohRemarks: normalizeRemarks(row.oh_remarks),
    gpFlg: normalizeFlag(row.gp_flg),
    gpRemarks: normalizeRemarks(row.gp_remarks),
    perforatedFlg: normalizeFlag(row.perforated_flg),
    perforatedRemarks: normalizeRemarks(row.perforated_remarks),
    lsFlg: normalizeFlag(row.ls_flg),
    lsRemarks: normalizeRemarks(row.ls_remarks),
  };
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
 * (sampling/logging/mud_rmks/flow_rmks/dev_pump_test) DO have real columns, so those are read back
 * from `header` below rather than left as `existing` had them. Field mappings mirror buildWwellIrBulkSavePayload
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
  geologistNameByEmpNum: Readonly<Record<number, string>> = {},
): IntegratedRequirement {
  const header = rowsFor<IrHeaderRow>(blocks, 'exad_gwd_ir_header')[0] as IrHeaderRow | undefined;
  const casingRows = rowsFor<IrCasingRow>(blocks, 'exad_gwd_ir_casing');
  const topsRows = rowsFor<IrTopsRow>(blocks, 'exad_gwd_ir_tops');
  const hydroRow = rowsFor<IrHydrogeologyRow>(blocks, 'exad_gwd_ir_hydrogeology')[0] as IrHydrogeologyRow | undefined;
  const waterRows = rowsFor<IrWaterRow>(blocks, 'exad_gwd_ir_water');
  const linkedWell = rowsFor<IrLinkedWellRow>(blocks, 'exad_rcd_prewap')[0] as IrLinkedWellRow | undefined;
  const wellDesignRow = rowsFor<IrWellDesignRow>(blocks, 'exad_gwd_well_design')[0] as IrWellDesignRow | undefined;
  // The one exad_gwd_ir_header column genuinely scoped to *this* ir_seq that also confirms a real
  // Completion pick was ever saved on this record — see the long comment on `wellDesignFlags`
  // below for why this, not merely `wellDesignRow` existing, has to gate trusting that row at all.
  const completionText = resolveLegacyText(header?.completion ?? header?.cmpl_type, existing.programDetails.completion);
  // A well already linked to a *different* IR (or to the separate standalone Well Design workflow)
  // can already have its own exad_gwd_well_design row before this ir_seq ever saves anything —
  // `completionText` blank means this ir_seq itself never wrote one, so that row is someone else's.
  // Adopting its wd_seq here would make this record's *next* save UPDATE (silently overwrite) that
  // unrelated row instead of INSERTing its own — the exact risk buildWellDesignRow's own DATA-LOSS
  // CAVEAT (wwell-ir-payload.mapper.ts) already documents.
  const wellDesignRowBelongsToThisIr = !!wellDesignRow && !!completionText;

  return {
    ...existing,
    // exad_gwd_well_design is keyed by wd_seq, not ir_seq — carried forward only so a later save's
    // Estimated Pump Depth UPDATE matches this same row instead of INSERTing a duplicate.
    wellDesignSeq: wellDesignRowBelongsToThisIr ? wellDesignRow.wd_seq : existing.wellDesignSeq,
    // Drives the real SAP display GET (WwellIrStore.loadIrApprovalTimeline) — `undefined` (field
    // absent on an older record) reads the same as "no workflow yet", same as `null`.
    sapWfId: header?.sap_wf_id ?? existing.sapWfId,
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
      // `existing` already had (blank, for a never-linked IR). exad_rcd_prewap has no well-name
      // column — built the same way get_ir_wells_prc.sql does it (w_prim_hid || '_' || w_num), so
      // this reads the same as the "eligible wells" picker's own label.
      wellName: linkedWell ? `${linkedWell.w_prim_hid ?? ''}_${linkedWell.w_num ?? ''}` : existing.requestReference.wellName,
      surfaceElevationFtAsl: linkedWell?.sv_surf_elevf ?? existing.requestReference.surfaceElevationFtAsl,
      coordinates:
        linkedWell?.surfacen != null && linkedWell?.surfacee != null
          ? `${linkedWell.surfacen}°N, ${linkedWell.surfacee}°E`
          : existing.requestReference.coordinates,
      // Same "live off exad_rcd_prewap" rule as wellName/surfaceElevationFtAsl above — Target
      // Depth is read-only in the UI (wwell-ir-form.schema.ts) precisely because this is its only
      // real source: exad_gwd_ir_header has no target-depth column to fetch one back from
      // otherwise. An IR with no linked request falls through to `existing` (blank).
      targetDepthFt: linkedWell?.target_dpth ?? existing.requestReference.targetDepthFt,
      // Same rule for Target Aquifer (read-only in the UI too): the linked well's target_form is its
      // only real source once the IR is saved, since the eligible-wells list can't resolve it anymore.
      targetAquifer: linkedWell?.target_form ?? existing.requestReference.targetAquifer,
    },
    formationTops: topsRows.map(row => ({
      name: row.st_long_cd,
      depthFt: row.plan_tvd_dpth,
      subSeaFtAsl: row.plan_ss_dpth ?? null,
    })),
    // Written by buildWwellIrBulkSavePayload but never read back here before — same class of gap
    // fixed for Transmission/Acidization above.
    topsRemarks: header?.tops_remarks ?? existing.topsRemarks,
    // Same class of gap as Transmission/Acidization/Logging/Sampling below: cont_geologist/
    // sub_cont_geologist are written on every save (wwell-ir-payload.mapper.ts) but were never read
    // back here, so the Geologist Contact section rendered blank on every reselect/reload even
    // though the correct EMPNUM was in the DB the whole time. See resolveGeologistName above.
    contacts: {
      geologistPrimary:
        resolveGeologistName(header?.cont_geologist, geologistNameByEmpNum, existing.contacts.geologistPrimary) ??
        existing.contacts.geologistPrimary,
      geologistSecondary: resolveGeologistName(header?.sub_cont_geologist, geologistNameByEmpNum, existing.contacts.geologistSecondary),
    },
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
      completion: completionText,
      // Both are written by buildWwellIrBulkSavePayload but were never read back here, so
      // Transmission/Acidization rendered blank after any reload even though the values were in
      // the DB the whole time — the same class of gap that hid Logging/Sampling before. Transmission
      // reads off `dt_rmks`, not `trns_type` — see wwell-ir-payload.model.ts's IrHeaderRow doc comments.
      acidization: resolveLegacyText(header?.acidization, existing.programDetails.acidization),
      transmission: resolveLegacyText(header?.dt_rmks, existing.programDetails.transmission),
      developmentTesting: {
        logging: resolveLegacyText(header?.logging, existing.programDetails.developmentTesting.logging),
        mudLogging: resolveLegacyText(header?.mud_rmks, existing.programDetails.developmentTesting.mudLogging),
        sampling: resolveLegacyText(header?.sampling, existing.programDetails.developmentTesting.sampling),
        flowTest: resolveLegacyText(header?.flow_rmks, existing.programDetails.developmentTesting.flowTest),
        remarks: resolveLegacyText(header?.dev_pump_test, existing.programDetails.developmentTesting.remarks),
      },
      // Round-tripped confirmation that the save actually reached exad_gwd_well_design's own
      // oh_flg/gp_flg/ls_flg/perforated_flg columns — see mapWellDesignFlags above and
      // IntegratedRequirementWellDesignFlags' own doc comment. The UI itself still only ever
      // reads/edits `completion`; this is purely the mirror of what's really in the DB. Same
      // existing-fallback pattern as every other field here: no wellDesignRow in this particular
      // response (e.g. this detail fetch's exad_gwd_well_design block came back empty) keeps
      // whatever `existing` already had, rather than overwriting a real known value with null.
      //
      // GATED on `wellDesignRowBelongsToThisIr` (see its own comment above), not merely on
      // `wellDesignRow` existing: trusting it unconditionally made a brand-new IR (nothing filled
      // in but "Link to Request") draw Open Hole/etc. it never selected, straight from a different
      // IR's (or the standalone Well Design workflow's) pre-existing row on the same well.
      wellDesignFlags: wellDesignRowBelongsToThisIr ? mapWellDesignFlags(wellDesignRow) : existing.programDetails.wellDesignFlags,
    },
    hydrogeology: hydroRow
      ? {
          aquifer: hydroRow.st_long_cd,
          estimatedTdsPpm: hydroRow.est_water_quality,
          h2sPpm: parseH2sPpm(hydroRow.h2s),
          // exad_gwd_well_design.pump_lvl, not exad_gwd_ir_hydrogeology — see wellDesignSeq above.
          estimatedPumpDepthFt: wellDesignRow?.pump_lvl ?? existing.hydrogeology.estimatedPumpDepthFt,
        }
      : existing.hydrogeology,
    testProgram: {
      ...existing.testProgram,
      testType: (header?.test_type as IntegratedRequirementTestType | null | undefined) ?? existing.testProgram.testType,
      estimatedRateGpm: hydroRow?.est_productivity ?? existing.testProgram.estimatedRateGpm,
      estimatedWaterLevelFt: hydroRow?.est_sta_water_lvl ?? existing.testProgram.estimatedWaterLevelFt,
      siwhpPsi: hydroRow?.siwhp ?? existing.testProgram.siwhpPsi,
    },
  };
}
