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

export type ApprovalWorkflowStatus = 'in-progress' | 'submitted' | 'in-review' | 'approved' | 'rejected';
export type ApprovalStepStatus = 'approved' | 'in-progress' | 'pending' | 'rejected';

export interface ApprovalChainStep {
  readonly role: string;
  readonly name: string;
  readonly status: ApprovalStepStatus;
  readonly date: string | null;
}

interface ApprovalRequestBase {
  readonly id: string;
  readonly reqNo: string;
  readonly client: string;
  readonly wellName: string;
  readonly submittedBy: string;
  readonly date: string;
  readonly status: ApprovalWorkflowStatus;
  readonly chain: readonly ApprovalChainStep[];
}

export interface WldaApproval extends ApprovalRequestBase {
  readonly supporting: string;
}

export interface LandAffairsApproval extends ApprovalRequestBase {
  readonly x: string;
  readonly y: string;
  readonly utm: string;
}

export interface IrApproval extends ApprovalRequestBase {
  readonly supporting: string;
}

export interface CreateWldaApprovalPayload {
  readonly client: string;
  readonly wellName: string;
  readonly supporting: string;
  readonly initialCoordinates: string;
  readonly finalCoordinates: string | null;
  readonly proposedDepth: string;
  readonly targetAquifer: string;
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

export interface CreateIrApprovalPayload {
  readonly client: string;
  readonly wellName: string;
  readonly supporting: string;
  readonly finalCoordinates: string;
  readonly casingPoints: string;
  readonly topsPicked: string;
  readonly completionType: string;
  readonly drillingMethod: string;
  readonly bitSize: string;
  readonly fluidType: string;
  readonly estimatedYield: string;
  readonly waterQualityTds: string;
  readonly stages: string;
  readonly cementingType: string;
}

export type IntegratedRequirementStatus = 'in-progress' | 'submit-for-review' | 'in-review' | 'approved';

export interface IntegratedRequirementWellDesign {
  readonly casingPoints: string;
  readonly topPicked: string;
  readonly completion: string;
}

export interface IntegratedRequirementDrillingProgram {
  readonly method: string;
  readonly bitSize: string;
  readonly fluidType: string;
  readonly stages: number;
  readonly cementing: string;
}

export interface IntegratedRequirementWaterProduction {
  readonly estYieldGpm: number;
  readonly waterQualityTds: number;
}

export interface IntegratedRequirement {
  readonly id: string;
  readonly code: string;
  readonly wellName: string;
  readonly requestId: string;
  readonly client: string;
  readonly updatedDate: string;
  readonly status: IntegratedRequirementStatus;
  readonly wellDesign: IntegratedRequirementWellDesign;
  readonly drillingProgram: IntegratedRequirementDrillingProgram;
  readonly waterProduction: IntegratedRequirementWaterProduction;
}

export interface CreateIntegratedRequirementPayload {
  readonly wellName: string;
  readonly requestId: string;
  readonly client: string;
  readonly wellDesign: IntegratedRequirementWellDesign;
  readonly drillingProgram: IntegratedRequirementDrillingProgram;
  readonly waterProduction: IntegratedRequirementWaterProduction;
  readonly status: Extract<IntegratedRequirementStatus, 'in-progress'>;
}
