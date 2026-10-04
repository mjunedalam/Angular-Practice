import {
  IntegratedRequirement,
  IntegratedRequirementTestType,
  IntegratedRequirementWellDesignFlags,
} from '@models/wwell-planning/integrated-requirement.model';
import { isLegacyIrHtmlText, stripLegacyIrHtml } from './wwell-ir-legacy-html.util';
import { parseOpenHoleSizeFromRemarks } from './wwell-ir-wellbore-diagram.mapper';
import { formatUtmCoordinates } from '../wwell-ir-coordinates.util';
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

function normalizeRowKeys<TRow>(row: Record<string, unknown>): TRow {
  const normalized: Record<string, unknown> = {};
  for (const key of Object.keys(row)) {
    normalized[key.toLowerCase()] = row[key];
  }
  return normalized as TRow;
}

function rowsFor<TRow>(blocks: readonly WwellIrDetailTableBlock[], table: WwellIrTableName): readonly TRow[] {
  const block = blocks.find(candidate => candidate.table.toLowerCase() === table);
  return (block?.data ?? []).map(row => normalizeRowKeys<TRow>(row));
}

function resolveGeologistName(
  empNum: number | null | undefined,
  geologistNameByEmpNum: Readonly<Record<number, string>>,
  fallback: string | null,
): string | null {
  if (empNum == null) return fallback;
  return geologistNameByEmpNum[empNum] ?? fallback;
}

function parseH2sPpm(h2s: string | null | undefined): number | null {
  if (!h2s) return null;
  const value = parseFloat(h2s);
  return Number.isFinite(value) ? value : null;
}

function normalizeFlag(value: unknown): 'Y' | 'N' {
  return value === 'Y' ? 'Y' : 'N';
}

function normalizeRemarks(value: unknown): string | null {
  return typeof value === 'string' && value ? value : null;
}

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

function resolveLegacyText(raw: string | null | undefined, fallback: string): string {
  return raw != null ? stripLegacyIrHtml(raw) : fallback;
}

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
  const completionText = resolveLegacyText(header?.completion ?? header?.cmpl_type, existing.programDetails.completion);
  const wellDesignRowBelongsToThisIr = !!wellDesignRow && !!completionText;
  const hasLegacyMarkup = [
    header?.completion ?? header?.cmpl_type,
    header?.acidization,
    header?.dt_rmks,
    header?.logging,
    header?.mud_rmks,
    header?.sampling,
    header?.flow_rmks,
    header?.dev_pump_test,
  ].some(isLegacyIrHtmlText);

  return {
    ...existing,
    hasLegacyMarkup,
    wellDesignSeq: wellDesignRowBelongsToThisIr ? wellDesignRow.wd_seq : existing.wellDesignSeq,
    sapWfId: header?.sap_wf_id ?? existing.sapWfId,
    requestReference: {
      ...existing.requestReference,
      linkedRequestId: header?.prewap_seq != null ? String(header.prewap_seq) : existing.requestReference.linkedRequestId,
      letterNumber: header?.ltr_no ?? existing.requestReference.letterNumber,
      wellName: linkedWell ? `${linkedWell.w_prim_hid ?? ''}_${linkedWell.w_num ?? ''}` : existing.requestReference.wellName,
      surfaceElevationFtAsl: linkedWell?.sv_surf_elevf ?? existing.requestReference.surfaceElevationFtAsl,
      // `surfacen`/`surfacee` are UTM northing/easting meters, not decimal-degree lat/long — shown
      // as the raw survey values (Northing/Easting/Zone), not converted — see
      // wwell-ir-coordinates.util.ts's doc comment.
      coordinates:
        linkedWell?.surfacen != null && linkedWell?.surfacee != null
          ? (formatUtmCoordinates(linkedWell.surfacen, linkedWell.surfacee, linkedWell.sv_utm_zn) ??
            existing.requestReference.coordinates)
          : existing.requestReference.coordinates,
      targetDepthFt: linkedWell?.target_dpth ?? existing.requestReference.targetDepthFt,
      targetAquifer: linkedWell?.target_form ?? existing.requestReference.targetAquifer,
      supportingBusiness: linkedWell?.expl_wb_name ?? existing.requestReference.supportingBusiness,
    },
    formationTops: topsRows.map(row => ({
      name: row.st_long_cd,
      depthFt: row.plan_tvd_dpth,
      subSeaFtAsl: row.plan_ss_dpth ?? null,
    })),
    topsRemarks: header?.tops_remarks ?? existing.topsRemarks,
    contacts: {
      geologistPrimary:
        resolveGeologistName(header?.cont_geologist, geologistNameByEmpNum, existing.contacts.geologistPrimary) ??
        existing.contacts.geologistPrimary,
      geologistSecondary: resolveGeologistName(header?.sub_cont_geologist, geologistNameByEmpNum, existing.contacts.geologistSecondary),
    },
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
    casing: casingRows.map(row => ({
      type: row.csg_type,
      sizeIn: row.csg_size,
      depthFtBgl: row.csg_depth,
      tolFtBgl: null,
      remarks: row.csg_remarks ?? null,
    })),
    programDetails: {
      ...existing.programDetails,
      completion: completionText,
      // oh_remarks is the only backend column open hole size ever reached (see
      // deriveCompletionElementFlags/parseOpenHoleSizeFromRemarks in wwell-ir-wellbore-diagram.mapper.ts)
      // — without parsing it back out here, the Open Hole Size input silently reverted to blank
      // after every save+reload even though the value was sitting right there in oh_remarks.
      openHoleSizeIn: wellDesignRowBelongsToThisIr
        ? parseOpenHoleSizeFromRemarks(wellDesignRow.oh_remarks)
        : existing.programDetails.openHoleSizeIn,
      acidization: resolveLegacyText(header?.acidization, existing.programDetails.acidization),
      transmission: resolveLegacyText(header?.dt_rmks, existing.programDetails.transmission),
      developmentTesting: {
        logging: resolveLegacyText(header?.logging, existing.programDetails.developmentTesting.logging),
        mudLogging: resolveLegacyText(header?.mud_rmks, existing.programDetails.developmentTesting.mudLogging),
        sampling: resolveLegacyText(header?.sampling, existing.programDetails.developmentTesting.sampling),
        flowTest: resolveLegacyText(header?.flow_rmks, existing.programDetails.developmentTesting.flowTest),
        remarks: resolveLegacyText(header?.dev_pump_test, existing.programDetails.developmentTesting.remarks),
      },
      wellDesignFlags: wellDesignRowBelongsToThisIr ? mapWellDesignFlags(wellDesignRow) : existing.programDetails.wellDesignFlags,
    },
    hydrogeology: hydroRow
      ? {
          aquifer: hydroRow.st_long_cd,
          estimatedTdsPpm: hydroRow.est_water_quality,
          h2sPpm: parseH2sPpm(hydroRow.h2s),
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
