import {
  IntegratedRequirement,
  IrApproval,
  LandAffairsApproval,
  WldaApproval,
  WwellPlanningRequest,
} from '@models/wwell-planning/wwell-planning.model';

export interface WwellPlanningStoreState {
  readonly requests: WwellPlanningRequest[];
  readonly wldaApprovals: WldaApproval[];
  readonly landAffairsApprovals: LandAffairsApproval[];
  readonly irApprovals: IrApproval[];
  readonly integratedRequirements: IntegratedRequirement[];
  readonly requestsLoading: boolean;
  readonly approvalsLoading: boolean;
  readonly integratedRequirementsLoading: boolean;
  readonly creatingRequest: boolean;
  readonly creatingIntegratedRequirement: boolean;
  readonly creatingApproval: boolean;
  /**
   * One error slot per async operation instead of a single shared `error` field — each
   * operation must only ever read/write its own slot, so an unrelated failure (or a
   * successful, unrelated operation starting) can never silently clear or overwrite a
   * still-relevant error from a different operation.
   */
  readonly requestsError: string | null;
  readonly approvalsError: string | null;
  readonly integratedRequirementsError: string | null;
  readonly createRequestError: string | null;
  readonly createIntegratedRequirementError: string | null;
  readonly createApprovalError: string | null;
}

export const initialWwellPlanningState: WwellPlanningStoreState = {
  requests: [],
  wldaApprovals: [],
  landAffairsApprovals: [],
  irApprovals: [],
  integratedRequirements: [],
  requestsLoading: false,
  approvalsLoading: false,
  integratedRequirementsLoading: false,
  creatingRequest: false,
  creatingIntegratedRequirement: false,
  creatingApproval: false,
  requestsError: null,
  approvalsError: null,
  integratedRequirementsError: null,
  createRequestError: null,
  createIntegratedRequirementError: null,
  createApprovalError: null,
};
