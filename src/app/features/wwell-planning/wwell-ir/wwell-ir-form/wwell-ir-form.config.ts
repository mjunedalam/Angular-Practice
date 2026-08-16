import { ApprovalChainStep } from '@models/wwell-planning/wwell-planning.model';
import { WWELL_IR_CHAIN_ROLES } from '../../shared/wwell-approvals/wwell-approvals.config';

/** Pending-state chain preview shown in the IR page header before the form is submitted. */
export const WWELL_IR_CHAIN_PREVIEW: readonly ApprovalChainStep[] = WWELL_IR_CHAIN_ROLES.map(role => ({
  role,
  name: 'Pending Assignment',
  status: 'pending',
  date: null,
}));

/**
 * IR-specific formation/aquifer codes — a local override of the shared
 * `WWELL_AQUIFER_OPTIONS` (wwell-planning-reference-data.config.ts), which is also used by the
 * Request and WLDA forms and must keep its own values. Backs every Formation/Aquifer dropdown
 * in this module: Request Reference's Target Aquifer, Subsurface & Construction's Formation
 * Tops, and Estimated Hydrology's Aquifer.
 */
export const WWELL_IR_FORMATION_OPTIONS: readonly string[] = ['WASI', 'UMER', 'DMM', 'SFNY', 'SHUB', 'RUS', 'ARUM'];
