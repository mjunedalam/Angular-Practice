import { IntegratedRequirementStatus } from '@models/wwell-planning/wwell-planning.model';

interface WwellIrStatusMeta {
  readonly label: string;
  readonly bg: string;
  readonly color: string;
  readonly dot: string;
}

export const WWELL_IR_STATUS_META: Record<IntegratedRequirementStatus, WwellIrStatusMeta> = {
  'in-progress': { label: 'In Progress', bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
  'submit-for-review': { label: 'Submit for Review', bg: '#3b82f6', color: '#ffffff', dot: '#ffffff' },
  'in-review': { label: 'In Review', bg: '#f3e8ff', color: '#7e22ce', dot: '#a855f7' },
  approved: { label: 'Approved', bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
};
