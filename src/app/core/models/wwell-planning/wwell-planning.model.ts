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
  readonly wellName: string;
  readonly supportingBusiness: string;
  readonly initialCoordinates: string;
  /** Only collected for Tier 2 clients — see WWELL_CLIENT_TIER_2. */
  readonly finalCoordinates: string | null;
  /** Only collected for Tier 1 clients — see WWELL_CLIENT_TIER_1. */
  readonly targetAquifer: string | null;
  /** Only collected for Tier 1 clients — see WWELL_CLIENT_TIER_1. */
  readonly proposedDepth: string | null;
  readonly priority: WwellPlanningPriority | null;
  readonly assignedTo: string | null;
  readonly notes: string | null;
  readonly attachments: readonly string[];
}

export interface CreateWwellPlanningRequestPayload
  extends Pick<
    WwellPlanningRequest,
    | 'client'
    | 'wellName'
    | 'supportingBusiness'
    | 'initialCoordinates'
    | 'finalCoordinates'
    | 'targetAquifer'
    | 'proposedDepth'
    | 'priority'
    | 'assignedTo'
    | 'notes'
  > {
  readonly status: Extract<WwellPlanningRequestStatus, 'draft' | 'submitted'>;
}

export type ApprovalWorkflowStatus = 'in-progress' | 'submitted' | 'in-review' | 'approved' | 'rejected';
export type ApprovalStepStatus = 'approved' | 'in-progress' | 'pending' | 'rejected';

export interface ApprovalChainStep {
  readonly role: string;
  readonly name: string;
  readonly status: ApprovalStepStatus;
  readonly date: string | null;
}

export interface ApprovalRequestBase {
  readonly id: string;
  readonly reqNo: string;
  readonly client: string;
  readonly wellName: string;
  readonly submittedBy: string;
  readonly date: string;
  readonly status: ApprovalWorkflowStatus;
  readonly chain: readonly ApprovalChainStep[];
}

interface ApprovalWithSupportingDoc extends ApprovalRequestBase {
  readonly supporting: string;
}

export type WldaApproval = ApprovalWithSupportingDoc;

export interface LandAffairsApproval extends ApprovalRequestBase {
  readonly x: string;
  readonly y: string;
  readonly utm: string;
}

export interface CreateWldaApprovalPayload {
  readonly client: string;
  readonly wellName: string;
  readonly supporting: string;
  readonly initialCoordinates: string;
  readonly finalCoordinates: string | null;
  /** Only collected for Tier 1 clients — see WWELL_CLIENT_TIER_1. */
  readonly proposedDepth: string | null;
  /** Only collected for Tier 1 clients — see WWELL_CLIENT_TIER_1. */
  readonly targetAquifer: string | null;
  readonly businessUse: string;
  readonly drillingMethod: string | null;
  readonly assignedTo: string | null;
  readonly notes: string | null;
}

export interface CreateLandAffairsApprovalPayload {
  readonly client: string;
  readonly wellName: string;
  readonly coordinateX: string;
  readonly coordinateY: string;
  readonly utmZone: string;
  readonly landType: string;
  readonly surveyor: string | null;
  readonly parcelNumber: string | null;
  readonly notes: string | null;
}

// Integrated Requirement types live in ./integrated-requirement.model.ts.
