import { IntegratedRequirement, IntegratedRequirementTestType } from '@models/wwell-planning/integrated-requirement.model';
import { IrHeaderSummary } from './wwell-ir-payload.model';

/**
 * Backend list rows are backed only by exad_gwd_ir_header — the domain fields the UI displays
 * (client, wellName, contacts, casing...) have no column there yet, so they're left blank rather
 * than guessed. Extend once the header table carries those fields (see IrHeaderSummary).
 */
export function mapIrHeaderSummaryToIntegratedRequirement(row: IrHeaderSummary): IntegratedRequirement {
  const code = `IR-${row.irSeq}`;

  return {
    id: code,
    code,
    irSeq: row.irSeq,
    // ep_lt_data_mod_dt (last modified) / ep_cr_data_dt (created) are the real date columns on
    // exad_gwd_ir_header — the previous createdDt/updatedDt field names never existed on the API
    // response, so this always fell through to today's date. Both are legacy "EP" feed columns
    // that insert_ir_data_prc/update_ir_data_prc never stamp on save (confirmed: no SYSDATE anywhere
    // in that package), so they stay null for every record created/edited through this app — a
    // fallback to today would misreport "updated today" for records nobody touched. null is honest.
    updatedDate: (row.epLtDataModDt ?? row.epCrDataDt)?.slice(0, 10) ?? null,
    // publish_flg is the only status-shaped signal this table carries — collapses the domain
    // model's finer-grained statuses (draft/in-progress/submit-for-review/in-review) into one.
    status: row.publishFlg === 'Y' ? 'approved' : 'in-progress',
    requestReference: {
      // prewap_seq/ltr_no are real exad_gwd_ir_header columns (unlike wellName/coordinates/etc.
      // below) — read straight off the list row so a record's "Link to Request" is known
      // immediately from the list. Water Well Name/Coordinates/Surface Elevation stay blank until
      // detail is fetched (see mergeIrDetailBlocksIntoIntegratedRequirement's exad_rcd_prewap
      // block) — the list endpoint has no join for them.
      linkedRequestId: row.prewapSeq != null ? String(row.prewapSeq) : null,
      letterNumber: row.ltrNo ?? null,
      client: '',
      supportingBusiness: '',
      wellName: '',
      targetAquifer: '',
      targetDepthFt: 0,
      surfaceElevationFtAsl: null,
      coordinates: '',
    },
    formationTops: [],
    topsRemarks: null,
    casing: [],
    programDetails: {
      completionType: '',
      completion: row.cmplType ?? '',
      openHoleSizeIn: null,
      linerSizeIn: null,
      acidization: '',
      transmission: '',
      developmentTesting: { logging: '', mudLogging: '', sampling: '', flowTest: '', remarks: '' },
    },
    contacts: { geologistPrimary: '', geologistSecondary: null },
    offsetWells: [],
    offsetWellsRemarks: null,
    hydrogeology: { aquifer: '', estimatedTdsPpm: null, h2sPpm: null, estimatedPumpDepthFt: null },
    testProgram: {
      testType: (row.testType as IntegratedRequirementTestType | null) ?? 'flow-test',
      estimatedRateGpm: null,
      estimatedWaterLevelFt: null,
    },
    attachments: [],
    // The list endpoint has no sap_wf_id column to look a real chain up with (only the detail
    // fetch's exad_gwd_ir_header block does — see mergeIrDetailBlocksIntoIntegratedRequirement) —
    // stays empty until a selection's detail fetch resolves one, rather than preview a chain this
    // row can't actually back yet.
    chain: [],
    sapWfId: null,
    sapWfStatusText: null,
  };
}

export function mapIrHeaderSummariesToIntegratedRequirements(
  rows: readonly IrHeaderSummary[],
): IntegratedRequirement[] {
  return rows.map(mapIrHeaderSummaryToIntegratedRequirement);
}
