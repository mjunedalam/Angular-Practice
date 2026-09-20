import { IntegratedRequirement, IntegratedRequirementStatus } from '@models/wwell-planning/integrated-requirement.model';
import { WWELL_STATUS_COLORS, WwellStatusMeta, wwellStatusMeta } from '../shared/wwell-status.config';

/** Every status renders the same view+inline-edit surface (`WwellIrEditorComponent`) now — this
 *  list instead gates the one status-transition action that still needs a distinct status ("Submit
 *  for Review" only makes sense while the record hasn't already been submitted). */
export const WWELL_IR_SUBMITTABLE_STATUSES: readonly IntegratedRequirementStatus[] = ['draft', 'in-progress'];

export const WWELL_IR_STATUS_META: Record<IntegratedRequirementStatus, WwellStatusMeta> = {
  draft: wwellStatusMeta('Draft', WWELL_STATUS_COLORS.slate),
  'in-progress': wwellStatusMeta('In Progress', WWELL_STATUS_COLORS.blue),
  'submit-for-review': { label: 'Submit for Review', bg: 'var(--wp-accent-fill)', color: 'var(--wp-on-accent)', dot: 'var(--wp-on-accent)' },
  'in-review': wwellStatusMeta('In Review', WWELL_STATUS_COLORS.purple),
  approved: wwellStatusMeta('Approved', WWELL_STATUS_COLORS.green),
};

/** True once a record's status badge has something real to show: `status === 'approved'` (a real
 *  fact off publish_flg) or a fetched `sapWfStatusText` (SAP's own current text, or the local
 *  "in progress" placeholder submitIrForReview writes — see WwellIrStore.loadIrApprovalTimeline /
 *  WWELL_IR_SAP_WF_STATUS_IN_PROGRESS). Everything else is the list endpoint's blind "in-progress"
 *  default (no sap_wf_id column to tell a genuine draft from an already-submitted record apart —
 *  see wwell-ir-summary.mapper.ts) and must not be shown as though it were real. Shared by the
 *  list badge, the detail header badge (editor + view), and nowhere else — so all three agree. */
export function hasKnownIrStatus(ir: IntegratedRequirement): boolean {
  return ir.status === 'approved' || ir.sapWfStatusText !== null;
}
