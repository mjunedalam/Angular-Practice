import { IntegratedRequirementStatus } from '@models/wwell-planning/wwell-planning.model';
import { WWELL_STATUS_COLORS, WwellStatusMeta, wwellStatusMeta } from '../shared/wwell-status.config';

export const WWELL_IR_STATUS_META: Record<IntegratedRequirementStatus, WwellStatusMeta> = {
  draft: wwellStatusMeta('Draft', WWELL_STATUS_COLORS.slate),
  'in-progress': wwellStatusMeta('In Progress', WWELL_STATUS_COLORS.blue),
  'submit-for-review': { label: 'Submit for Review', bg: '#3b82f6', color: '#ffffff', dot: '#ffffff' },
  'in-review': wwellStatusMeta('In Review', WWELL_STATUS_COLORS.purple),
  approved: wwellStatusMeta('Approved', WWELL_STATUS_COLORS.green),
};
