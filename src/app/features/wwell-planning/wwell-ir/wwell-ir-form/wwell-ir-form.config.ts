import { ApprovalChainStep } from '@models/wwell-planning/wwell-planning.model';
import { WWELL_IR_CHAIN_ROLES } from '../../shared/wwell-approvals/wwell-approvals.config';

/** Pending-state chain preview shown in the IR page header before the form is submitted. */
export const WWELL_IR_CHAIN_PREVIEW: readonly ApprovalChainStep[] = WWELL_IR_CHAIN_ROLES.map(role => ({
  role,
  name: 'Pending Assignment',
  status: 'pending',
  date: null,
}));
