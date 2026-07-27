export type WwellPlanningRequestStatus =
  | 'draft'
  | 'submitted'
  | 'in-review'
  | 'in-progress'
  | 'approved'
  | 'rejected';

export type WwellPlanningPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface WwellPlanningRequest {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly requestedBy: string;
  readonly requestedDate: string;
  readonly status: WwellPlanningRequestStatus;
  readonly client: string;
  readonly supporting: string;
  readonly coordinates: string;
  readonly targetAquifer: string;
  readonly proposedDepth: string;
  readonly businessUse: string;
  readonly priority: WwellPlanningPriority | null;
  readonly assignedTo: string | null;
  readonly notes: string | null;
  readonly attachments: readonly string[];
}

export interface CreateWwellPlanningRequestPayload {
  readonly client: string;
  readonly supporting: string;
  readonly coordinates: string;
  readonly targetAquifer: string;
  readonly proposedDepth: string;
  readonly businessUse: string;
  readonly priority: WwellPlanningPriority | null;
  readonly assignedTo: string | null;
  readonly notes: string | null;
  readonly status: Extract<WwellPlanningRequestStatus, 'draft' | 'submitted'>;
}

export type ApprovalDecision = 'pending' | 'approved' | 'rejected';

export interface WwellPlanningApproval {
  readonly id: string;
  readonly requestId: string;
  readonly requestTitle: string;
  readonly approver: string;
  readonly decision: ApprovalDecision;
  readonly decidedDate: string | null;
  readonly comments: string | null;
}

export type IntegratedRequirementStatus = 'active' | 'superseded' | 'retired';

export interface IntegratedRequirement {
  readonly id: string;
  readonly requestId: string;
  readonly requirementCode: string;
  readonly description: string;
  readonly integratedDate: string;
  readonly status: IntegratedRequirementStatus;
}
