import { ApprovalChainStep } from './wwell-planning.model';

export type IntegratedRequirementStatus = 'draft' | 'in-progress' | 'submit-for-review' | 'in-review' | 'approved';
export type IntegratedRequirementTestType = 'flow-test' | 'pump-test';

export interface IntegratedRequirementRequestReference {
  readonly linkedRequestId: string | null;
  /** Correspondence/letter reference tied to this request — optional since older records predate the field. */
  readonly letterNumber?: string | null;
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
  /** Optional since older records predate these fields. */
  readonly subSeaFtAsl?: number | null;
  readonly description?: string | null;
}

export interface IntegratedRequirementCasingRow {
  readonly type: string;
  readonly sizeIn: string;
  readonly depthFtBgl: number;
  /** Top-of-liner depth — only meaningful when `type === 'Liner'`. */
  readonly tolFtBgl: number | null;
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
  /** Bit size below the last casing shoe (e.g. `8 1/2"`) — only meaningful when completion is 'Open Hole'. */
  readonly openHoleSizeIn: string | null;
  readonly acidization: string;
  readonly transmission: string;
  readonly developmentTesting: IntegratedRequirementDevelopmentTesting;
}

export interface IntegratedRequirementContacts {
  readonly geologistPrimary: string;
  readonly geologistSecondary: string | null;
}

export interface IntegratedRequirementOffsetWell {
  /** exad_gwd_ir_water.ep_a_num — the offset well's numeric id, and (with ir_seq) the natural key
   *  the save proc matches rows on. That table has no well-name column: production identifies the
   *  well numerically and resolves its display name elsewhere. See docs/ir/p2-ir.md. */
  readonly epANum: number;
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
  /** Backend-assigned exad_gwd_ir_header.ir_seq — absent until the first successful save. */
  readonly irSeq?: number | null;
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
