import { IntegratedRequirement, IntegratedRequirementTestType } from '@models/wwell-planning/integrated-requirement.model';
import { todayIsoDate } from '../../shared/wwell-approvals/wwell-approval-request.util';
import { mockApprovalChainForIrSeq } from './wwell-ir-chain.mock';
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
    // Neither date column is guaranteed to be populated on exad_gwd_ir_header (see the real
    // payload that motivated this: every row came back with both createdDt and updatedDt null) —
    // fall back to today rather than crashing the whole list map on a null .slice() call.
    updatedDate: (row.updatedDt ?? row.createdDt ?? todayIsoDate()).slice(0, 10),
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
      completion: row.cmplType ?? '',
      openHoleSizeIn: null,
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
    // No approval-process API yet either — preview the same mocked timeline the detail-selection
    // fetch below will return, so the list row's mini-chain matches what opening it shows.
    chain: mockApprovalChainForIrSeq(row.irSeq),
  };
}

export function mapIrHeaderSummariesToIntegratedRequirements(
  rows: readonly IrHeaderSummary[],
): IntegratedRequirement[] {
  return rows.map(mapIrHeaderSummaryToIntegratedRequirement);
}
