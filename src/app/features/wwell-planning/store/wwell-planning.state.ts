import {
  IntegratedRequirement,
  LandAffairsApproval,
  WldaApproval,
  WwellPlanningRequest,
} from '@models/wwell-planning/wwell-planning.model';
import { WwellFieldOption } from '../shared/dynamic-form/wwell-dynamic-form.types';

export interface WwellPlanningStoreState {
  readonly requests: WwellPlanningRequest[];
  readonly wldaApprovals: WldaApproval[];
  readonly landAffairsApprovals: LandAffairsApproval[];
  readonly integratedRequirements: IntegratedRequirement[];
  /** Wells still eligible to have an IR initiated — feeds the "New IR" wizard's "Link to Request" picker. */
  readonly linkedRequestWells: WwellFieldOption[];
  /** ir_seq of the IR currently being authored on the "new" page — reused so repeat draft saves UPDATE, not re-INSERT. */
  readonly draftIrSeq: number | null;
  readonly requestsLoading: boolean;
  readonly approvalsLoading: boolean;
  readonly integratedRequirementsLoading: boolean;
  readonly linkedRequestWellsLoading: boolean;
  readonly creatingRequest: boolean;
  readonly creatingIntegratedRequirement: boolean;
  readonly creatingApproval: boolean;
  readonly updatingIntegratedRequirementStatus: boolean;
  /** Fetching one IR's full detail by ir_seq (casing/tops/hydrogeology) after a list selection. */
  readonly integratedRequirementDetailLoading: boolean;
  /** Fetching one IR's approval chain/timeline by ir_seq — a separate call from the detail fetch
   *  above (mocked client-side; the backend has no approval-process endpoint yet). */
  readonly integratedRequirementApprovalTimelineLoading: boolean;
  /**
   * One error slot per async operation instead of a single shared `error` field — each
   * operation must only ever read/write its own slot, so an unrelated failure (or a
   * successful, unrelated operation starting) can never silently clear or overwrite a
   * still-relevant error from a different operation.
   */
  readonly requestsError: string | null;
  readonly approvalsError: string | null;
  readonly integratedRequirementsError: string | null;
  readonly linkedRequestWellsError: string | null;
  readonly createRequestError: string | null;
  readonly createIntegratedRequirementError: string | null;
  readonly createApprovalError: string | null;
  readonly updateIntegratedRequirementStatusError: string | null;
  readonly integratedRequirementDetailError: string | null;
  readonly integratedRequirementApprovalTimelineError: string | null;
}

export const initialWwellPlanningState: WwellPlanningStoreState = {
  requests: [],
  wldaApprovals: [],
  landAffairsApprovals: [],
  integratedRequirements: [],
  linkedRequestWells: [],
  draftIrSeq: null,
  requestsLoading: false,
  approvalsLoading: false,
  integratedRequirementsLoading: false,
  linkedRequestWellsLoading: false,
  creatingRequest: false,
  creatingIntegratedRequirement: false,
  creatingApproval: false,
  updatingIntegratedRequirementStatus: false,
  integratedRequirementDetailLoading: false,
  integratedRequirementApprovalTimelineLoading: false,
  requestsError: null,
  approvalsError: null,
  integratedRequirementsError: null,
  linkedRequestWellsError: null,
  createRequestError: null,
  createIntegratedRequirementError: null,
  createApprovalError: null,
  updateIntegratedRequirementStatusError: null,
  integratedRequirementDetailError: null,
  integratedRequirementApprovalTimelineError: null,
};
