import { IrAttachment } from './ir-attachment.model';
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
  /** Optional since older records predate this field. */
  readonly subSeaFtAsl?: number | null;
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
  /** General Development/Testing remarks (exad_gwd_ir_header.dev_pump_test) — a catch-all note for
   *  the whole Development/Testing group, distinct from logging/mudLogging/sampling/flowTest's own
   *  per-topic remarks. */
  readonly remarks: string;
}

/**
 * exad_gwd_well_design's own completion-element columns (OH_FLG/OH_REMARKS, GP_FLG/GP_REMARKS,
 * PERFORATED_FLG/PERFORATED_REMARKS, LS_FLG/LS_REMARKS) — derived one-way from `completion`/
 * `openHoleSizeIn` (see deriveCompletionElementFlags in wwell-ir-wellbore-diagram.mapper.ts) and
 * persisted through update_ir_data_prc's exad_gwd_well_design MERGE on every save, so the real
 * backend table — not just this app's own `completion` text — carries the flags. `completion`
 * stays the one field the UI actually edits/displays; this is the round-tripped mirror of what
 * the save wrote, read back from a GET's own exad_gwd_well_design block.
 */
export interface IntegratedRequirementWellDesignFlags {
  readonly ohFlg: 'Y' | 'N';
  readonly ohRemarks: string | null;
  readonly gpFlg: 'Y' | 'N';
  readonly gpRemarks: string | null;
  readonly perforatedFlg: 'Y' | 'N';
  readonly perforatedRemarks: string | null;
  readonly lsFlg: 'Y' | 'N';
  readonly lsRemarks: string | null;
}

export interface IntegratedRequirementProgramDetails {
  /** The Completion dropdown pick (Open Hole, Screen, …) — empty for a legacy record that only has
   *  Completion Remarks. Not a header column of its own: it round-trips through `wellDesignFlags`
   *  (see resolveCompletionTypeFromFlags in wwell-ir-wellbore-diagram.mapper.ts). */
  readonly completionType: string;
  /** "Completion Remarks" (exad_gwd_ir_header.completion) — free text, no longer drives the diagram
   *  when a `completionType` is picked. */
  readonly completion: string;
  /** Bit size below the last casing shoe (e.g. `8 1/2"`) — only meaningful when completionType is 'Open Hole'. */
  readonly openHoleSizeIn: string | null;
  /** Liner size (e.g. `7"`) — only meaningful when completionType is a Liner pick. */
  readonly linerSizeIn: string | null;
  /** Liner shoe depth (ft) — only meaningful for a Liner pick; blank means the target depth. */
  readonly linerDepthFt: number | null;
  readonly acidization: string;
  /** exad_gwd_ir_header.dt_rmks — not trns_type (VARCHAR2(10), too short for these labels). */
  readonly transmission: string;
  readonly developmentTesting: IntegratedRequirementDevelopmentTesting;
  /** `undefined` until a detail fetch resolves one (a freshly-built local draft has none yet),
   *  `null` when that fetch found no exad_gwd_well_design row at all — see
   *  IntegratedRequirementWellDesignFlags' own doc comment. */
  readonly wellDesignFlags?: IntegratedRequirementWellDesignFlags | null;
}

export interface IntegratedRequirementContacts {
  readonly geologistPrimary: string;
  readonly geologistSecondary: string | null;
}

export interface IntegratedRequirementOffsetWell {
  /** exad_gwd_ir_water.ep_a_num — the offset well's numeric id, and (with ir_seq) the natural key
   *  the save proc matches rows on. See docs/ir/p2-ir.md. */
  readonly epANum: number;
  /** exad_gwd_ir_water.w_gnr_name — the offset well's display name ("Area Water Well" name). */
  readonly wellName?: string | null;
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
  /** Backend-assigned exad_gwd_well_design.wd_seq for this well's design record — that table is
   *  keyed by wd_seq/prewap_seq, not ir_seq (see docs/ir/p2-ir.md), so it can't be derived from
   *  irSeq. Known only once a detail fetch has resolved one; threaded through purely so a later
   *  save of Estimated Pump Depth UPDATEs that same row instead of INSERTing a duplicate. */
  readonly wellDesignSeq?: number | null;
  /** Null when neither real last-modified column is populated — exad_gwd_ir_header's own
   *  insert/update procs never stamp a date on save (see wwell-ir-summary.mapper.ts), so this is
   *  genuinely unknown for most records rather than a value to default away. */
  readonly updatedDate: string | null;
  readonly status: IntegratedRequirementStatus;
  readonly requestReference: IntegratedRequirementRequestReference;
  readonly formationTops: readonly IntegratedRequirementFormationTop[];
  /** Single free-text note applying to all Formation Tops rows together (exad_gwd_ir_header.tops_remarks
   *  — a single column, not one per row). Mirrors `offsetWellsRemarks` below. */
  readonly topsRemarks: string | null;
  readonly casing: readonly IntegratedRequirementCasingRow[];
  readonly programDetails: IntegratedRequirementProgramDetails;
  readonly contacts: IntegratedRequirementContacts;
  readonly offsetWells: readonly IntegratedRequirementOffsetWell[];
  readonly offsetWellsRemarks: string | null;
  readonly hydrogeology: IntegratedRequirementHydrogeology;
  readonly testProgram: IntegratedRequirementTestProgram;
  /** Real stored files (Location Map / Initiation Request), loaded per ir_seq by its own endpoint
   *  — like `chain` below, not part of the detail blocks. Empty until loadIrAttachments resolves;
   *  a slot the user hasn't filled is simply absent from the list. */
  readonly attachments: readonly IrAttachment[];
  readonly chain: readonly ApprovalChainStep[];
  /** exad_gwd_ir_header.sap_wf_id — the raw workflow id minted by Submit for Review (see
   *  wwell-ir-sap.config.ts) and the `wf_obj_id` the SAP display GET is looked up by. `null` until
   *  a detail fetch resolves one (a never-submitted IR has no SAP workflow to look up). */
  readonly sapWfId: number | null;
  /** SAP `/display` header.wf_status_text (see SapWorkflowHeader) for this record's sapWfId —
   *  the actual current workflow status text, refreshed alongside `chain` by
   *  WwellIrStore.loadIrApprovalTimeline. `null` until that first resolves (never-submitted IR,
   *  or a submit whose follow-up display fetch hasn't landed yet), in which case the list falls
   *  back to the local status label instead of showing nothing. */
  readonly sapWfStatusText: string | null;
  /** True while the stored header remarks (completion, acidization, …) still carry legacy HTML. The
   *  fields above already hold the cleaned text, so a Save has to write it back even when the user
   *  edited nothing — otherwise the markup stays in the database. Recomputed by every detail fetch,
   *  so it clears itself once a save has stored the plain text. */
  readonly hasLegacyMarkup?: boolean;
}

export interface CreateIntegratedRequirementPayload
  extends Pick<
    IntegratedRequirement,
    | 'requestReference'
    | 'formationTops'
    | 'topsRemarks'
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
