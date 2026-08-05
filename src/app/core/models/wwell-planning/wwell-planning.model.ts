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

export type IntegratedRequirementStatus = 'draft' | 'in-progress' | 'submit-for-review' | 'in-review' | 'approved';
export type IntegratedRequirementTestType = 'flow-test' | 'pump-test';

export interface IntegratedRequirementRequestReference {
  readonly linkedRequestId: string | null;
  readonly client: string;
  readonly supportingBusiness: string;
  readonly wellName: string;
  readonly targetAquifer: string;
  readonly targetDepthFt: number;
  readonly surfaceElevationFtAsl: number | null;
  readonly coordinates: string;
}

export interface IntegratedRequirementFormationTop {
  readonly name: string;
  readonly depthFt: number;
}

export interface IntegratedRequirementCasingRow {
  readonly type: string;
  readonly sizeIn: string;
  readonly depthFtBgl: number;
  readonly remarks: string | null;
}

export interface IntegratedRequirementDevelopmentTesting {
  readonly logging: string;
  readonly mudLogging: string;
  readonly sampling: string;
  readonly flowTest: string;
}

export interface IntegratedRequirementProgramDetails {
  readonly completion: string;
  readonly acidization: string;
  readonly transmission: string;
  readonly developmentTesting: IntegratedRequirementDevelopmentTesting;
}

export interface IntegratedRequirementContacts {
  readonly geologistPrimary: string;
  readonly geologistSecondary: string | null;
}

export interface IntegratedRequirementOffsetWell {
  readonly wellName: string;
  /** Everything below is historical test-result data — usually enriched after creation, not captured at intake. */
  readonly distanceKm?: number | null;
  readonly location?: string | null;
  readonly aquifer?: string | null;
  readonly totalDepthFt?: number | null;
  readonly testDurationMin?: number | null;
  readonly rateGpm?: number | null;
  readonly rpm?: number | null;
  readonly swlFt?: number | null;
  readonly pwlFt?: number | null;
  readonly drawdownFt?: number | null;
  readonly specificCapacity?: number | null;
  readonly tdsPpm?: number | null;
  readonly h2sPpm?: number | null;
}

export interface IntegratedRequirementHydrogeology {
  readonly aquifer: string;
  readonly estimatedTdsPpm: number | null;
  readonly h2sPpm: number | null;
  readonly estimatedPumpDepthFt: number | null;
}

export interface IntegratedRequirementTestProgram {
  readonly testType: IntegratedRequirementTestType;
  readonly estimatedRateGpm: number | null;
  readonly estimatedWaterLevelFt: number | null;
  /** Shut-in wellhead pressure — only meaningful for a flow test. */
  readonly siwhpPsi?: number | null;
}

export interface IntegratedRequirement {
  readonly id: string;
  readonly code: string;
  readonly updatedDate: string;
  readonly status: IntegratedRequirementStatus;
  readonly requestReference: IntegratedRequirementRequestReference;
  readonly formationTops: readonly IntegratedRequirementFormationTop[];
  readonly casing: readonly IntegratedRequirementCasingRow[];
  readonly programDetails: IntegratedRequirementProgramDetails;
  readonly contacts: IntegratedRequirementContacts;
  readonly offsetWells: readonly IntegratedRequirementOffsetWell[];
  readonly offsetWellsRemarks: string | null;
  readonly hydrogeology: IntegratedRequirementHydrogeology;
  readonly testProgram: IntegratedRequirementTestProgram;
  readonly attachmentNames: readonly string[];
  readonly chain: readonly ApprovalChainStep[];
}

export interface CreateIntegratedRequirementPayload
  extends Pick<
    IntegratedRequirement,
    | 'requestReference'
    | 'formationTops'
    | 'casing'
    | 'programDetails'
    | 'contacts'
    | 'offsetWells'
    | 'offsetWellsRemarks'
    | 'hydrogeology'
    | 'testProgram'
  > {
  readonly status: Extract<IntegratedRequirementStatus, 'draft' | 'in-progress'>;
}
