import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { IrAttachmentSlot, IrPendingAttachment } from '@models/wwell-planning/ir-attachment.model';
import { Aquifer } from '@models/daily-operation/aquifer.model';
import { GwdOpsMember, IrEligibleWell, StratInfo } from '../wwell-ir-form/wwell-ir-payload.model';

export interface WwellIrStoreState {
  readonly irs: IntegratedRequirement[];
  /** Wells still eligible to have an IR initiated — feeds the "New IR" wizard's "Link to Request"
   *  picker (see the store's `linkedRequestWellOptions` computed for its trimmed option view) and
   *  the auto-populate lookup once one is selected. */
  readonly linkedRequestWells: IrEligibleWell[];
  /** GWD ops members — feeds the IR editor's Geologist Contact "Primary"/"Secondary" pickers (see
   *  the store's `geologistOptions` computed for the trimmed FULL_NAME option view). */
  readonly gwdOpsMembers: GwdOpsMember[];
  /** Stratigraphic units backing the Formation Tops "Formation" dropdown (see `formationOptions`). */
  readonly stratInfos: StratInfo[];
  /** Aquifer/formation reference list backing every Formation/Aquifer dropdown (see `aquiferOptions`). */
  readonly aquifers: Aquifer[];
  /** EXAD_DHUB_LKUP_DATA dropdown values keyed by LKUP_NAME (`completion_menu`, ...). Empty until
   *  loaded — the form schema falls back to its built-in lists meanwhile, or if the load fails. */
  readonly dropdownMenus: Readonly<Record<string, readonly string[]>>;
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
  /** Ids (see `IrPendingAttachment.id`) of every pending file currently mid-upload — a slot can
   *  hold several staged files at once, each with its own independent Upload button, so tracking
   *  this per slot (as a single flag) would freeze every other file in that slot while just one of
   *  them was sending. */
  readonly uploadingPendingIds: ReadonlySet<string>;
  /** Real bytes-sent percentage (0-100) for each id in `uploadingPendingIds`, or `null` for one
   *  that's busy but has no measurable progress yet (queued behind an auto-save, or no progress
   *  event has landed yet) — that `null` is what tells the editor to show an indeterminate bar
   *  instead of one sitting misleadingly at 0%. */
  readonly uploadProgressByPendingId: Readonly<Record<string, number | null>>;
  /** Object keys of every already-stored attachment currently mid-delete — same one-row-at-a-time
   *  independence as `uploadingPendingIds`, for the delete side instead. */
  readonly deletingAttachmentKeys: ReadonlySet<string>;
  /**
   * Files picked on a New IR, which has no ir_seq yet — and ir_seq is what an upload is filed
   * under, so they can't be sent when chosen. A slot holds a list, not a single file: attaching
   * never replaces what's already staged, only adds to it. Held in memory here, rendered in their
   * slot like any other attachment, and uploaded by `uploadPendingAttachments` the moment the first
   * save assigns a real ir_seq. Cleared when the draft is abandoned, so they can't leak onto the
   * next record.
   */
  readonly pendingAttachments: Readonly<Partial<Record<IrAttachmentSlot, readonly IrPendingAttachment[]>>>;
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
  stratInfos: [],
  aquifers: [],
  dropdownMenus: {},
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
  uploadingPendingIds: new Set(),
  uploadProgressByPendingId: {},
  deletingAttachmentKeys: new Set(),
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
