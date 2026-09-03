import { CreateIntegratedRequirementPayload, IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { WWELL_IR_CHAIN_ROLES } from '../../shared/wwell-approvals/wwell-approvals.config';
import { buildInitialApprovalChain, todayIsoDate } from '../../shared/wwell-approvals/wwell-approval-request.util';

/** Identity fields the two callers below resolve differently — a real save mints them from the
 *  ir_seq the backend just assigned, a local-only draft has no ir_seq yet (see
 *  wwell-ir.component.ts's createNewIr()). */
export interface IntegratedRequirementIdentity {
  readonly id: string;
  readonly code: string;
  readonly irSeq: number | null;
}

/** Builds the domain object from a submitted payload plus its identity — shared by
 *  WwellIrStore.createIr (the merge base for a brand-new record, before real GET data overrides
 *  whatever it can — see mergeIrDetailBlocksIntoIntegratedRequirement) and createNewIr()'s
 *  local-only draft (never sent to the backend), so both stay in sync as the payload shape evolves. */
export function buildIntegratedRequirementFromPayload(
  payload: CreateIntegratedRequirementPayload,
  identity: IntegratedRequirementIdentity,
  attachmentNames: readonly string[],
): IntegratedRequirement {
  return {
    ...identity,
    updatedDate: todayIsoDate(),
    status: payload.status,
    requestReference: payload.requestReference,
    formationTops: payload.formationTops,
    casing: payload.casing,
    programDetails: payload.programDetails,
    contacts: payload.contacts,
    offsetWells: payload.offsetWells,
    offsetWellsRemarks: payload.offsetWellsRemarks,
    hydrogeology: payload.hydrogeology,
    testProgram: payload.testProgram,
    attachmentNames,
    chain: buildInitialApprovalChain(WWELL_IR_CHAIN_ROLES, 'You'),
  };
}
