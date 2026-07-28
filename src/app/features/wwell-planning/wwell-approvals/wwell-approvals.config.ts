import { ApprovalStepStatus, ApprovalWorkflowStatus } from '@models/wwell-planning/wwell-planning.model';

interface WwellApprovalStatusMeta {
  readonly label: string;
  readonly bg: string;
  readonly color: string;
  readonly dot: string;
}

export const WWELL_APPROVAL_STATUS_META: Record<ApprovalWorkflowStatus, WwellApprovalStatusMeta> = {
  'in-progress': { label: 'In Progress', bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
  submitted: { label: 'Submitted', bg: '#e0e7ff', color: '#4338ca', dot: '#6366f1' },
  'in-review': { label: 'In Review', bg: '#f3e8ff', color: '#7e22ce', dot: '#a855f7' },
  approved: { label: 'Approved', bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
  rejected: { label: 'Rejected', bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
};

export const WWELL_APPROVAL_STEP_STATUS_META: Record<ApprovalStepStatus, WwellApprovalStatusMeta> = {
  approved: { label: 'Approved', bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
  'in-progress': { label: 'In Progress', bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
  pending: { label: 'Pending', bg: '#f1f5f9', color: '#64748b', dot: '#cbd5e1' },
  rejected: { label: 'Rejected', bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
};

export const WWELL_WLDA_CHAIN_ROLES: readonly string[] = [
  'Hydrogeologist',
  'Field Supervisor',
  'Dept. Manager',
  'SAP / Upper Mgmt',
];

export const WWELL_LAND_AFFAIRS_CHAIN_ROLES: readonly string[] = ['Land Surveyor', 'Land Affairs Officer', 'Manager'];

export const WWELL_IR_CHAIN_ROLES: readonly string[] = ['Hydrogeologist', 'Lead Hydrogeologist', 'Manager'];

/** 4 letters + dash + a 2-4 digit "hundreds" suffix, e.g. KHAJ-300, RXYD-100. */
export const WWELL_APPROVAL_WELL_NAME_PATTERN = /^[A-Za-z]{4}-\d{2,4}$/;

/** Free-form "24.1751°N, 47.2951°E" style pair; hemisphere letters are optional. */
export const WWELL_APPROVAL_COORDINATES_PATTERN =
  /^\s*-?\d{1,3}(\.\d+)?\s*°?\s*[NnSs]?\s*,\s*-?\d{1,3}(\.\d+)?\s*°?\s*[EeWw]?\s*$/;
