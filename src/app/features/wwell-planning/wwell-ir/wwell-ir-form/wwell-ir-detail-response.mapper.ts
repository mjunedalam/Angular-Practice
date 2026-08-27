import { IntegratedRequirement, IntegratedRequirementTestType } from '@models/wwell-planning/integrated-requirement.model';
import {
  IrCasingRow,
  IrHeaderRow,
  IrHydrogeologyRow,
  IrTopsRow,
  WwellIrDetailTableBlock,
  WwellIrTableName,
} from './wwell-ir-payload.model';

/** Case-insensitive on `candidate.table`: the GET /{irSeq} detail endpoint echoes back
 *  UPPERCASE table names (EXAD_GWD_IR_HEADER...) per exad_agwa_queries_pkg.get_ir_data_prc,
 *  while WwellIrTableName (and the bulk-save write path) uses lowercase — a strict `===` here
 *  never matched, so every block silently resolved to empty and wiped casing/formationTops on
 *  every detail fetch. */
function rowsFor<TRow>(blocks: readonly WwellIrDetailTableBlock[], table: WwellIrTableName): readonly TRow[] {
  const block = blocks.find(candidate => candidate.table.toLowerCase() === table);
  return (block?.data as readonly TRow[] | undefined) ?? [];
}

/** Inverse of the `h2s: '${ppm} ppm'` formatting in wwell-ir-payload.mapper.ts. */
function parseH2sPpm(h2s: string | null | undefined): number | null {
  if (!h2s) return null;
  const value = parseFloat(h2s);
  return Number.isFinite(value) ? value : null;
}

/**
 * Enriches an already-known IntegratedRequirement (e.g. from the GET-all summary list) with the
 * real casing/tops/hydrogeology/program data from a GET /{irSeq} detail fetch. Merges onto
 * `existing` rather than building from scratch because most domain-only fields (client, wellName,
 * supportingBusiness, targetAquifer, targetDepthFt, surfaceElevationFtAsl, coordinates, contacts,
 * offsetWells, attachments...) have no backing column on exad_gwd_ir_header — see
 * wwell-ir-summary.mapper.ts for the same limitation on the list side, and
 * docs/ir/EXAD_GWD_IR_HEADER.md for the table's real column set. `linkedRequestId`/`letterNumber`
 * (prewap_seq/ltr_no) and the Development & Testing fields (sampling/logging/mud_rmks/flow_rmks)
 * DO have real columns, so those are read back from `header` below rather than left to the
 * optimistic echo. Field mappings mirror buildWwellIrBulkSavePayload in wwell-ir-payload.mapper.ts
 * exactly (this is that function's inverse) — keep the two in sync if either changes.
 */
export function mergeIrDetailBlocksIntoIntegratedRequirement(
  existing: IntegratedRequirement,
  blocks: readonly WwellIrDetailTableBlock[],
): IntegratedRequirement {
  const header = rowsFor<IrHeaderRow>(blocks, 'exad_gwd_ir_header')[0] as IrHeaderRow | undefined;
  const casingRows = rowsFor<IrCasingRow>(blocks, 'exad_gwd_ir_casing');
  const topsRows = rowsFor<IrTopsRow>(blocks, 'exad_gwd_ir_tops');
  const hydroRow = rowsFor<IrHydrogeologyRow>(blocks, 'exad_gwd_ir_hydrogeology')[0] as IrHydrogeologyRow | undefined;

  return {
    ...existing,
    requestReference: {
      ...existing.requestReference,
      // prewap_seq/ltr_no are the only two Request Reference columns exad_gwd_ir_header actually
      // has (see docs/ir/EXAD_GWD_IR_HEADER.md) — everything else on this section (wellName,
      // client, targetAquifer...) has no backing column and stays whatever `existing` already
      // carries (the optimistic save-time echo), same limitation this function's own doc comment
      // above describes.
      linkedRequestId: header?.prewap_seq != null ? String(header.prewap_seq) : existing.requestReference.linkedRequestId,
      letterNumber: header?.ltr_no ?? existing.requestReference.letterNumber,
    },
    formationTops: topsRows.map(row => ({
      name: row.st_long_cd,
      depthFt: row.plan_tvd_dpth,
      subSeaFtAsl: row.plan_ss_dpth ?? null,
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
      completion: header?.completion ?? header?.cmpl_type ?? existing.programDetails.completion,
      developmentTesting: {
        logging: header?.logging ?? existing.programDetails.developmentTesting.logging,
        mudLogging: header?.mud_rmks ?? existing.programDetails.developmentTesting.mudLogging,
        sampling: header?.sampling ?? existing.programDetails.developmentTesting.sampling,
        flowTest: header?.flow_rmks ?? existing.programDetails.developmentTesting.flowTest,
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
