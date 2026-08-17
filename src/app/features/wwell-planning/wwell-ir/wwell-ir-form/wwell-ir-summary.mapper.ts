import { IntegratedRequirement, IntegratedRequirementTestType } from '@models/wwell-planning/wwell-planning.model';
import { mockApprovalChainForIrSeq } from './wwell-ir-chain.mock';
import { IrHeaderSummary } from './wwell-ir-payload.model';

/**
 * Backend list rows are backed only by exad_gwd_ir_header — the domain fields the UI displays
 * (client, wellName, contacts, casing...) have no column there yet, so they're left blank rather
 * than guessed. Extend once pkg_gwd_ir/the header table carry those fields (see IrHeaderSummary).
 */
export function mapIrHeaderSummaryToIntegratedRequirement(row: IrHeaderSummary): IntegratedRequirement {
  const code = `IR-${row.irSeq}`;

  return {
    id: code,
    code,
    irSeq: row.irSeq,
    updatedDate: (row.updatedDt ?? row.createdDt).slice(0, 10),
    // publish_flg is the only status-shaped signal this table carries — collapses the domain
    // model's finer-grained statuses (draft/in-progress/submit-for-review/in-review) into one.
    status: row.publishFlg === 'Y' ? 'approved' : 'in-progress',
    requestReference: {
      linkedRequestId: null,
      letterNumber: null,
      client: '',
      supportingBusiness: '',
      wellName: '',
      targetAquifer: '',
      targetDepthFt: 0,
      surfaceElevationFtAsl: null,
      coordinates: '',
    },
    formationTops: [],
    casing: [],
    programDetails: {
      completion: row.cmplType ?? '',
      openHoleSizeIn: null,
      acidization: '',
      transmission: '',
      developmentTesting: { logging: '', mudLogging: '', sampling: '', flowTest: '' },
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
    attachmentNames: [],
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
