import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { IrEligibleWell } from '../wwell-ir-form/wwell-ir-payload.model';

export interface WwellIrStoreState {
  readonly irs: IntegratedRequirement[];
  /** Wells still eligible to have an IR initiated — feeds the "New IR" wizard's "Link to Request"
   *  picker (see the store's `linkedRequestWellOptions` computed for its trimmed option view) and
   *  the auto-populate lookup once one is selected. */
  readonly linkedRequestWells: IrEligibleWell[];
  /** ir_seq of the IR currently being authored on the "new" page — reused so repeat draft saves UPDATE, not re-INSERT. */
  readonly draftIrSeq: number | null;
  readonly irsLoading: boolean;
  readonly linkedRequestWellsLoading: boolean;
  readonly creatingIr: boolean;
  readonly updatingIrStatus: boolean;
  /** Deleting a whole IR (header + cascaded casing/tops/hydrogeology/water) by ir_seq. */
  readonly deletingIr: boolean;
  /** Fetching one IR's full detail by ir_seq (casing/tops/hydrogeology) after a list selection. */
  readonly irDetailLoading: boolean;
  /** Fetching one IR's approval chain/timeline by ir_seq — a separate call from the detail fetch
   *  above (mocked client-side; the backend has no approval-process endpoint yet). */
  readonly irApprovalTimelineLoading: boolean;
  /**
   * One error slot per async operation instead of a single shared `error` field — each
   * operation must only ever read/write its own slot, so an unrelated failure (or a
   * successful, unrelated operation starting) can never silently clear or overwrite a
   * still-relevant error from a different operation.
   */
  readonly irsError: string | null;
  readonly linkedRequestWellsError: string | null;
  readonly createIrError: string | null;
  readonly updateIrStatusError: string | null;
  readonly irDetailError: string | null;
  readonly irApprovalTimelineError: string | null;
  readonly deleteIrError: string | null;
}

export const initialWwellIrState: WwellIrStoreState = {
  irs: [],
  linkedRequestWells: [],
  draftIrSeq: null,
  irsLoading: false,
  linkedRequestWellsLoading: false,
  creatingIr: false,
  updatingIrStatus: false,
  deletingIr: false,
  irDetailLoading: false,
  irApprovalTimelineLoading: false,
  irsError: null,
  linkedRequestWellsError: null,
  createIrError: null,
  updateIrStatusError: null,
  irDetailError: null,
  irApprovalTimelineError: null,
  deleteIrError: null,
};
