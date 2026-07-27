import { IntegratedRequirement, WwellPlanningApproval, WwellPlanningRequest } from '@models/wwell-planning/wwell-planning.model';

export interface WwellPlanningStoreState {
  readonly requests: WwellPlanningRequest[];
  readonly approvals: WwellPlanningApproval[];
  readonly integratedRequirements: IntegratedRequirement[];
  readonly requestsLoading: boolean;
  readonly approvalsLoading: boolean;
  readonly integratedRequirementsLoading: boolean;
  readonly creatingRequest: boolean;
  readonly error: string | null;
}

export const initialWwellPlanningState: WwellPlanningStoreState = {
  requests: [],
  approvals: [],
  integratedRequirements: [],
  requestsLoading: false,
  approvalsLoading: false,
  integratedRequirementsLoading: false,
  creatingRequest: false,
  error: null,
};
