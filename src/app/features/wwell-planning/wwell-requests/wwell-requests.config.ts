import { WwellPlanningPriority, WwellPlanningRequestStatus } from '@models/wwell-planning/wwell-planning.model';
import { WWELL_STATUS_COLORS, WwellStatusMeta, wwellStatusMeta } from '../shared/wwell-status.config';

export const WWELL_REQUEST_STATUS_META: Record<WwellPlanningRequestStatus, WwellStatusMeta> = {
  draft: wwellStatusMeta('Draft', WWELL_STATUS_COLORS.slate),
  submitted: { label: 'Submitted', bg: 'var(--wp-st-slate-bg)', color: 'var(--wp-muted)', dot: 'var(--wp-muted)' },
  'in-review': wwellStatusMeta('In Review', WWELL_STATUS_COLORS.purple),
  'in-progress': wwellStatusMeta('In Progress', WWELL_STATUS_COLORS.blue),
  approved: wwellStatusMeta('Approved', WWELL_STATUS_COLORS.green),
  rejected: wwellStatusMeta('Rejected', WWELL_STATUS_COLORS.red),
};

export const WWELL_REQUEST_PRIORITY_META: Record<WwellPlanningPriority, WwellStatusMeta> = {
  low: wwellStatusMeta('Low', WWELL_STATUS_COLORS.slateMuted),
  medium: wwellStatusMeta('Medium', WWELL_STATUS_COLORS.blue),
  high: wwellStatusMeta('High', WWELL_STATUS_COLORS.indigo),
  urgent: wwellStatusMeta('Urgent', WWELL_STATUS_COLORS.red),
};
