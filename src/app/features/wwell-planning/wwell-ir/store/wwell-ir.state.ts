import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { IrAttachmentSlot } from '@models/wwell-planning/ir-attachment.model';
import { GwdOpsMember, IrEligibleWell } from '../wwell-ir-form/wwell-ir-payload.model';

export interface WwellIrStoreState {
  readonly irs: IntegratedRequirement[];
  /** Wells still eligible to have an IR initiated — feeds the "New IR" wizard's "Link to Request"
   *  picker (see the store's `linkedRequestWellOptions` computed for its trimmed option view) and
   *  the auto-populate lookup once one is selected. */
  readonly linkedRequestWells: IrEligibleWell[];
  /** GWD ops members — feeds the IR editor's Geologist Contact "Primary"/"Secondary" pickers (see
   *  the store's `geologistOptions` computed for the trimmed FULL_NAME option view). */
  readonly gwdOpsMembers: GwdOpsMember[];
  /** ir_seq of the IR currently being authored on the "new" page — reused so repeat draft saves UPDATE, not re-INSERT. */
  readonly draftIrSeq: number | null;
  readonly irsLoading: boolean;
  readonly linkedRequestWellsLoading: boolean;
  readonly gwdOpsMembersLoading: boolean;
  readonly creatingIr: boolean;
  readonly updatingIrStatus: boolean;
  /** Recalling an already-submitted IR's SAP workflow — its own flag rather than reusing
   *  `updatingIrStatus`, since "Submit for Review" and "Recall" are mutually exclusive actions on
   *  the same record (see WwellIrEditorComponent.canSubmitForReview / canRecallIr) and each should
   *  only ever spin its own button. */
  readonly recallingIr: boolean;
  /** Deleting a whole IR (header + cascaded casing/tops/hydrogeology/water) by ir_seq. */
  readonly deletingIr: boolean;
  /** Fetching one IR's full detail by ir_seq (casing/tops/hydrogeology) after a list selection. */
  readonly irDetailLoading: boolean;
  /** Fetching one IR's approval chain/timeline by ir_seq — a separate call from the detail fetch
   *  above (mocked client-side; the backend has no approval-process endpoint yet). */
  readonly irApprovalTimelineLoading: boolean;
  /** Fetching one IR's stored attachment slots by ir_seq — again its own call, since attachments
   *  are files on the backend's filesystem rather than exad_gwd_ir_* columns. */
  readonly attachmentsLoading: boolean;
  /** The slot currently mid-upload or mid-delete, so only that one card shows progress and
   *  disables its controls — a single boolean would freeze both slots on either operation. */
  readonly busyAttachmentSlot: IrAttachmentSlot | null;
  /** Real bytes-sent percentage for an in-flight upload (0-100), or null when the busy slot is
   *  doing something with no measurable progress (a delete). That null is what tells the editor to
   *  show a spinner instead of a bar sitting misleadingly at 0%. */
  readonly attachmentUploadPercent: number | null;
  /**
   * Files picked on a New IR, which has no ir_seq yet — and ir_seq is what an upload is filed
   * under, so they can't be sent when chosen. Held in memory here, rendered in their slot like any
   * other attachment, and uploaded by `uploadPendingAttachments` the moment the first save assigns
   * a real ir_seq. Cleared when the draft is abandoned, so they can't leak onto the next record.
   */
  readonly pendingAttachments: Readonly<Partial<Record<IrAttachmentSlot, File>>>;
  /**
   * One error slot per async operation instead of a single shared `error` field — each
   * operation must only ever read/write its own slot, so an unrelated failure (or a
   * successful, unrelated operation starting) can never silently clear or overwrite a
   * still-relevant error from a different operation.
   */
  readonly irsError: string | null;
  readonly linkedRequestWellsError: string | null;
  readonly gwdOpsMembersError: string | null;
  readonly createIrError: string | null;
  /** The one error slot for the whole "Submit for Review" action — minting the workflow id,
   *  triggering SAP, and recording the outcome on the header (see WwellIrStore.submitIrForReview).
   *  That action has no separate IR status-transition call to fail on its own. */
  readonly sapTriggerError: string | null;
  /** The one error slot for the whole "Recall" action — calling SAP's DELETE /recall, then
   *  recording the outcome on the header (see WwellIrStore.recallIr). */
  readonly sapRecallError: string | null;
  readonly irDetailError: string | null;
  readonly irApprovalTimelineError: string | null;
  readonly deleteIrError: string | null;
  readonly attachmentError: string | null;
}

export const initialWwellIrState: WwellIrStoreState = {
  irs: [],
  linkedRequestWells: [],
  gwdOpsMembers: [],
  draftIrSeq: null,
  irsLoading: false,
  linkedRequestWellsLoading: false,
  gwdOpsMembersLoading: false,
  creatingIr: false,
  updatingIrStatus: false,
  recallingIr: false,
  deletingIr: false,
  irDetailLoading: false,
  irApprovalTimelineLoading: false,
  attachmentsLoading: false,
  busyAttachmentSlot: null,
  attachmentUploadPercent: null,
  pendingAttachments: {},
  irsError: null,
  linkedRequestWellsError: null,
  gwdOpsMembersError: null,
  createIrError: null,
  sapTriggerError: null,
  sapRecallError: null,
  irDetailError: null,
  irApprovalTimelineError: null,
  deleteIrError: null,
  attachmentError: null,
};
