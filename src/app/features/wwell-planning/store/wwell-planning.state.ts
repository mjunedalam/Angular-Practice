import { LandAffairsApproval, WldaApproval, WwellPlanningRequest } from '@models/wwell-planning/wwell-planning.model';

export interface WwellPlanningStoreState {
  readonly requests: WwellPlanningRequest[];
  readonly wldaApprovals: WldaApproval[];
  readonly landAffairsApprovals: LandAffairsApproval[];
  readonly requestsLoading: boolean;
  readonly approvalsLoading: boolean;
  readonly creatingRequest: boolean;
  readonly creatingApproval: boolean;
  /**
   * One error slot per async operation instead of a single shared `error` field — each
   * operation must only ever read/write its own slot, so an unrelated failure (or a
   * successful, unrelated operation starting) can never silently clear or overwrite a
   * still-relevant error from a different operation.
   */
  readonly requestsError: string | null;
  readonly approvalsError: string | null;
  readonly createRequestError: string | null;
  readonly createApprovalError: string | null;
}

export const initialWwellPlanningState: WwellPlanningStoreState = {
  requests: [],
  wldaApprovals: [],
  landAffairsApprovals: [],
  requestsLoading: false,
  approvalsLoading: false,
  creatingRequest: false,
  creatingApproval: false,
  requestsError: null,
  approvalsError: null,
  createRequestError: null,
  createApprovalError: null,
};
