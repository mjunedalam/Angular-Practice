import { ApprovalChainStep, ApprovalStepStatus, ApprovalWorkflowStatus } from '@models/wwell-planning/wwell-planning.model';
import { WWELL_STATUS_COLORS, WwellStatusMeta, wwellStatusMeta } from '../wwell-status.config';

export const WWELL_APPROVAL_STATUS_META: Record<ApprovalWorkflowStatus, WwellStatusMeta> = {
  'in-progress': wwellStatusMeta('In Progress', WWELL_STATUS_COLORS.blue),
  submitted: wwellStatusMeta('Submitted', WWELL_STATUS_COLORS.indigo),
  'in-review': wwellStatusMeta('In Review', WWELL_STATUS_COLORS.purple),
  approved: wwellStatusMeta('Approved', WWELL_STATUS_COLORS.green),
  rejected: wwellStatusMeta('Rejected', WWELL_STATUS_COLORS.red),
};

export const WWELL_APPROVAL_STEP_STATUS_META: Record<ApprovalStepStatus, WwellStatusMeta> = {
  approved: wwellStatusMeta('Approved', WWELL_STATUS_COLORS.green),
  'in-progress': wwellStatusMeta('In Progress', WWELL_STATUS_COLORS.blue),
  pending: wwellStatusMeta('Pending', WWELL_STATUS_COLORS.slateMuted),
  rejected: wwellStatusMeta('Rejected', WWELL_STATUS_COLORS.red),
};

export const WWELL_WLDA_CHAIN_ROLES: readonly string[] = [
  'Hydrogeologist',
  'Field Supervisor',
  'Dept. Manager',
  'SAP / Upper Mgmt',
];

export const WWELL_LAND_AFFAIRS_CHAIN_ROLES: readonly string[] = ['Land Surveyor', 'Land Affairs Officer', 'Manager'];

export const WWELL_IR_CHAIN_ROLES: readonly string[] = ['Hydrogeologist', 'Lead Hydrogeologist', 'Manager'];

export type ChainCompletionStatus = 'complete' | 'partial' | 'none';

/** 'complete' once every step is approved, 'none' while zero steps are approved yet
 * (whether pending or in-progress), 'partial' anywhere in between. Rejected steps don't
 * count as approved, so a rejection anywhere keeps the chain out of 'complete'. */
export function getChainCompletionStatus(chain: readonly ApprovalChainStep[]): ChainCompletionStatus {
  if (chain.length === 0) return 'none';

  const approvedCount = chain.filter(step => step.status === 'approved').length;
  if (approvedCount === chain.length) return 'complete';
  if (approvedCount === 0) return 'none';
  return 'partial';
}

/** Border accent per completion state — reused for both the master-list row's left border
 * and every detail-panel card border, so a record's approval progress reads at a glance
 * without opening the timeline itself. */
export const WWELL_CHAIN_COMPLETION_COLOR: Record<ChainCompletionStatus, string> = {
  complete: WWELL_STATUS_COLORS.green.dot,
  partial: WWELL_STATUS_COLORS.amber.dot,
  none: WWELL_STATUS_COLORS.slateMuted.dot,
};

export function chainCompletionColor(chain: readonly ApprovalChainStep[]): string {
  return WWELL_CHAIN_COMPLETION_COLOR[getChainCompletionStatus(chain)];
}

/** 4 letters + dash + a 2-4 digit "hundreds" suffix, e.g. KHAJ-300, RXYD-100. */
export const WWELL_APPROVAL_WELL_NAME_PATTERN = /^[A-Za-z]{4}-\d{2,4}$/;

/** Free-form "24.1751°N, 47.2951°E" style pair; hemisphere letters are optional. */
export const WWELL_APPROVAL_COORDINATES_PATTERN =
  /^\s*-?\d{1,3}(\.\d+)?\s*°?\s*[NnSs]?\s*,\s*-?\d{1,3}(\.\d+)?\s*°?\s*[EeWw]?\s*$/;
