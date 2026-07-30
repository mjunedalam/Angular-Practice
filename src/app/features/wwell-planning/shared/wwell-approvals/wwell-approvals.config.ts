import { ApprovalStepStatus, ApprovalWorkflowStatus } from '@models/wwell-planning/wwell-planning.model';
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

/** 4 letters + dash + a 2-4 digit "hundreds" suffix, e.g. KHAJ-300, RXYD-100. */
export const WWELL_APPROVAL_WELL_NAME_PATTERN = /^[A-Za-z]{4}-\d{2,4}$/;

/** Free-form "24.1751°N, 47.2951°E" style pair; hemisphere letters are optional. */
export const WWELL_APPROVAL_COORDINATES_PATTERN =
  /^\s*-?\d{1,3}(\.\d+)?\s*°?\s*[NnSs]?\s*,\s*-?\d{1,3}(\.\d+)?\s*°?\s*[EeWw]?\s*$/;
