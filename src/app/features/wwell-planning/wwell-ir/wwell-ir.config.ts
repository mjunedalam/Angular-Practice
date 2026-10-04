import { IntegratedRequirement, IntegratedRequirementStatus } from '@models/wwell-planning/integrated-requirement.model';
import { WWELL_STATUS_COLORS, WwellStatusMeta, wwellStatusMeta } from '../shared/wwell-status.config';

/** SAP text that means the workflow was actively killed rather than merely progressing — matched
 *  case-insensitively, the same way wwell-ir-approval.mapper.ts's stepStatus() reads a single
 *  step's own `response`. SAP's exact wording for these isn't part of our contract (the /display
 *  response only documents `wf_status_text` as free text), so this matches on the words themselves
 *  rather than a fixed value list. */
const SAP_TERMINATED_STATUS_TEXT = /reject|cancel|recall/i;
const SAP_APPROVED_STATUS_TEXT = /approve/i;
const SAP_RECALLED_STATUS_TEXT = /recall/i;

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

/** The status badge's actual colour+label — same fallback rule as the label alone used to follow
 *  (`ir.sapWfStatusText ?? statusMeta[ir.status].label`), but the colour now follows the SAP text
 *  too instead of always trailing `ir.status`. `IntegratedRequirementStatus` has no slot for SAP's
 *  own terminal states (Rejected/Cancelled/Recalled all just leave `ir.status` at whatever it was
 *  pre-submission — see WwellIrStore.loadIrApprovalTimeline), so without this a rejected/cancelled/
 *  recalled record kept showing its old "In Review"/"Submit for Review" colour with only the label
 *  text changing underneath it. Recognised SAP text is shown red (terminated) or green (approved);
 *  anything else keeps riding on `ir.status`'s own colour, only the label swaps, same as before. */
export function irBadgeMeta(ir: IntegratedRequirement): WwellStatusMeta {
  const text = ir.sapWfStatusText;
  const fallback = WWELL_IR_STATUS_META[ir.status];
  if (!text) return fallback;
  if (SAP_TERMINATED_STATUS_TEXT.test(text)) return wwellStatusMeta(text, WWELL_STATUS_COLORS.red);
  if (SAP_APPROVED_STATUS_TEXT.test(text)) return wwellStatusMeta(text, WWELL_STATUS_COLORS.green);
  return { ...fallback, label: text };
}

/** True once SAP's own text says the workflow is done moving — rejected, cancelled, recalled, or
 *  approved — same two patterns irBadgeMeta colours red/green. Gates the editor's "Recall" button
 *  (WwellIrEditorComponent.canRecallIr): a workflow already at a terminal SAP state has nothing left
 *  to recall, same as a real SAP recall would refuse it. */
export function isSapWorkflowTerminal(sapWfStatusText: string | null): boolean {
  return sapWfStatusText !== null && (SAP_TERMINATED_STATUS_TEXT.test(sapWfStatusText) || SAP_APPROVED_STATUS_TEXT.test(sapWfStatusText));
}

/** True only for the recalled subset of `isSapWorkflowTerminal` — unlike Approved/Rejected/Cancelled,
 *  a recall was the user's own action, so the record isn't done: `WwellIrEditorComponent` brings
 *  "Submit for Review" back for it (`canSubmitForReview`), letting them resubmit fresh under a new
 *  SAP workflow id. Deliberately its own predicate rather than reusing `isSapWorkflowTerminal` — the
 *  other three terminal outcomes stay terminal, with no way back from the editor. */
export function isSapWorkflowRecalled(sapWfStatusText: string | null): boolean {
  return sapWfStatusText !== null && SAP_RECALLED_STATUS_TEXT.test(sapWfStatusText);
}

/** Classifies the live SAP status text into the IR letter PDF's three stamp states — the exact
 *  same two patterns `irBadgeMeta` uses to colour the badge red/green, reused here so this is the
 *  one place that decision gets made. Sent directly to agwa-planning (see
 *  `WwellIrService.downloadLetterPdf`'s `stampStatus` param / `LetterPdfRequest.stampStatus`) so
 *  the backend just stamps whatever it's told rather than keeping its own copy of this
 *  classification. `null` when the IR was never submitted (no SAP text at all) — the backend
 *  skips the stamp image entirely in that case instead of defaulting to "Pending". */
export function resolveLetterStampStatus(ir: IntegratedRequirement): 'APPROVED' | 'REJECTED' | 'PENDING' | null {
  const text = ir.sapWfStatusText;
  if (!text) return null;
  if (SAP_TERMINATED_STATUS_TEXT.test(text)) return 'REJECTED';
  if (SAP_APPROVED_STATUS_TEXT.test(text)) return 'APPROVED';
  return 'PENDING';
}

/** Every field the IR form schema marks `required` (wwell-ir-form.schema.ts), outside the
 *  repeatable rows — Casing/Formation Tops/Offset Wells only validate a row once one exists, so
 *  there's no top-level requirement that those sections hold any rows at all. Gates "Submit for
 *  Review": checked against the already-saved `ir` itself, not a live, possibly-still-open form,
 *  because submitting sends exactly this record (WwellIrEditorComponent.submitForReview calls
 *  `store.submitIrForReview(this.ir())`) — an in-progress edit elsewhere doesn't change whether
 *  the saved record is actually ready. */
export function wwellIrHasRequiredSubmitFields(ir: IntegratedRequirement): boolean {
  return (
    !!ir.requestReference.linkedRequestId &&
    !!ir.requestReference.letterNumber?.trim() &&
    !!ir.requestReference.wellName.trim() &&
    !!ir.programDetails.completion.trim() &&
    !!ir.contacts.geologistPrimary.trim() &&
    !!ir.hydrogeology.aquifer.trim() &&
    !!ir.testProgram.testType &&
    ir.attachments.some(attachment => attachment.slot === 'initiation-request')
  );
}
