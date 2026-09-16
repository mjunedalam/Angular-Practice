import { ApprovalChainStep, ApprovalStepStatus } from '@models/wwell-planning/wwell-planning.model';
import { SapApprovalStep, SapWorkflowStatusResponse } from '@models/sap/sap-workflow-status.model';

/** SAP never sends a real date as `null` — an unreached/unresponded level uses this literal
 *  instead, per the /display contract (see sap-service's README, Angular-Practice's docs/wb-map.md
 *  sibling docs, and the live sample response this mapper is built from). */
const SAP_UNSET_DATE = '0000-00-00';

function isRealDate(value: string | null | undefined): value is string {
  return !!value && value !== SAP_UNSET_DATE;
}

/**
 * A level with a real `response` has been explicitly decided — anything containing "reject"
 * (case-insensitive) counts as a rejection, everything else (SAP's real values aren't documented
 * to us beyond "APPROVED") as an approval. A level SAP has reached (`received_date` real) but not
 * yet decided is the one currently awaiting action — but only the *last* such level in chain
 * order: earlier ones with no response recorded are levels the workflow has already moved past
 * (e.g. the Initiator's own receipt, which is a log entry, not a pending decision), so they read
 * as cleared rather than stuck.
 */
function stepStatus(step: SapApprovalStep, index: number, lastReachedIndex: number): ApprovalStepStatus {
  const response = step.response?.trim();
  if (response) {
    return /reject/i.test(response) ? 'rejected' : 'approved';
  }
  if (!isRealDate(step.received_date)) return 'pending';
  return index === lastReachedIndex ? 'in-progress' : 'approved';
}

function stepDate(step: SapApprovalStep): string | null {
  if (isRealDate(step.response_date)) return step.response_date;
  if (isRealDate(step.received_date)) return step.received_date;
  return null;
}

/** Maps a SAP `GET /display` response onto the shared `ApprovalChainStep[]` shape the IR
 *  "Approval Workflow" sidebar (and the shared `app-wwell-approval-timeline` renderer it uses)
 *  already knows how to draw — see wwell-ir.component.html. */
export function mapSapWorkflowStatusToApprovalChain(status: SapWorkflowStatusResponse): readonly ApprovalChainStep[] {
  const chain = status.approval_chain;
  const lastReachedIndex = chain.reduce((last, step, index) => (isRealDate(step.received_date) ? index : last), -1);

  return chain.map((step, index) => ({
    role: step.approver_title,
    name: step.approver_name,
    status: stepStatus(step, index, lastReachedIndex),
    date: stepDate(step),
  }));
}
