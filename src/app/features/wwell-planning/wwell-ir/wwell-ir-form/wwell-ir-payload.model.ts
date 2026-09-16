/** Wire format for the IR bulk-save call — mirrors docs/wwell-planning/ir/ir.json 1:1 (table-per-block, row-per-action). */

/** New row → INSERT. Changed persisted row → UPDATE. Removed persisted row → DELETE. Persisted
 *  row the user didn't touch this save → '' (no-op) — sent instead of a redundant UPDATE so the
 *  backend's per-row action switch (EXAD_AGWA_IUD_PKG.save_casing/save_tops/save_hydrogeology)
 *  simply doesn't match any branch and skips the DML, rather than re-writing a row with the exact
 *  values it already has on every save. */
export type IrRowAction = 'INSERT' | 'UPDATE' | 'DELETE' | '';

export type WwellIrTableName =
  | 'exad_gwd_ir_header'
  | 'exad_gwd_ir_casing'
  | 'exad_gwd_ir_hydrogeology'
  | 'exad_gwd_ir_tops'
  | 'exad_gwd_ir_water'
  | 'exad_gwd_well_design'
  | 'exad_rcd_prewap';

interface IrActionRow {
  readonly action: IrRowAction;
}

interface IrRow extends IrActionRow {
  /** null until the backend assigns one on first save; echo it back on every later save. */
  readonly ir_seq: number | null;
}

export interface IrHeaderRow extends IrRow {
  readonly prewap_seq: number | null;
  readonly ltr_no: string | null;
  readonly screen: string;
  readonly sampling: string | null;
  readonly logging: string | null;
  readonly tops_remarks: string | null;
  readonly publish_dt: string | null;
  readonly publish_flg: 'Y' | 'N';
  readonly curr_flg: 'Y' | 'N';
  readonly publish_by: string | null;
  /** exad_gwd_ir_header.cont_geologist/sub_cont_geologist are NUMBER(8) — resolved from the form's
   *  selected FULL_NAME to the real EMPNUM via a live map built from GET /gwd-ops-members (see
   *  WwellIrStore's `geologistEmpNumByName` and wwell-ir-payload.mapper.ts's resolveGeologistId). */
  readonly cont_geologist: number | null;
  readonly sub_cont_geologist: number | null;
  readonly water_remarks: string | null;
  readonly gen_remarks: string | null;
  /** Free-text completion selection (exad_gwd_ir_header.completion, VARCHAR2(4000)) — NOT
   *  cmpl_type, which is VARCHAR2(10) and too short to hold values like "Screened + Gravel Pack". */
  readonly completion: string | null;
  readonly cmpl_type: string | null;
  readonly acidization: string | null;
  /** Always sent null — Transmission is stored on `dt_rmks` (NVARCHAR2(2000)) instead, same as
   *  `cmpl_type` above. */
  readonly trns_type: string | null;
  /** Transmission (VARCHAR2(10) `trns_type` is too short for these labels). */
  readonly dt_rmks: string | null;
  readonly mud_rmks: string | null;
  readonly test_type: string | null;
  readonly flow_rmks: string | null;
  /** General Development/Testing remarks — the form's 'remarks' field under developmentTesting. */
  readonly dev_pump_test: string | null;
  /** Read-only: minted per Submit for Review (get_wf_next_id_fnc) and stamped by
   *  update_ir_sap_wf_prc once SAP accepts the workflow — never sent on save, only ever read back
   *  from a detail fetch. Optional since older records predate the SAP workflow columns. */
  readonly sap_wf_id?: number | null;
  readonly sap_wf_status?: string | null;
}

export interface IrCasingRow extends IrRow {
  readonly csg_size: string;
  readonly csg_type: string;
  readonly csg_depth: number;
  readonly csg_remarks: string | null;
}

export interface IrTopsRow extends IrRow {
  readonly st_long_cd: string;
  readonly plan_tvd_dpth: number;
  readonly plan_ss_dpth: number | null;
}

export interface IrHydrogeologyRow extends IrRow {
  readonly st_long_cd: string;
  readonly est_sta_water_lvl: number | null;
  readonly est_water_quality: number | null;
  readonly est_productivity: number | null;
  readonly flowing: string | null;
  readonly siwhp: number | null;
  readonly h2s: string | null;
}

/** The "Area Water Wells" (offset wells) section — exad_gwd_ir_water, see docs/ir/p2-ir.md.
 *  Keyed by (ir_seq, ep_a_num); that table has no well-name column, so `epANum` is the only
 *  identifier persisted for a row. `temp` has no form field yet and is always sent null. */
export interface IrWaterRow extends IrRow {
  readonly ep_a_num: number;
  readonly distanct: number | null;
  readonly direction: string | null;
  readonly aquifer: string;
  readonly td: number | null;
  readonly rate: number | null;
  readonly rpm: number | null;
  readonly swl: number | null;
  readonly final_pwl: number | null;
  readonly drawdown: number | null;
  readonly spec_capacity: number | null;
  readonly temp: number | null;
  readonly field_tds: number | null;
  readonly test_duration: number | null;
  readonly h2s: number | null;
}

/** The IR's linked well, read live off exad_rcd_prewap by the header's own prewap_seq —
 *  see get_ir_data_prc's own comment (agwa-planning backend) for why get_ir_wells_prc (the
 *  "eligible for a new IR" list) can never supply this once the IR exists: eligibility means "no
 *  IR references this prewap_seq yet", which stops being true the instant this IR is saved.
 *  Read-only — no `action`/`ir_seq` (unlike IrRow), since exad_rcd_prewap is never written
 *  through the IR bulk-save contract.
 *
 *  Unlike IrEligibleWell (fed by get_ir_wells_prc, which aliases these to friendly camelCase
 *  names), get_ir_data_prc emits this block as a raw `SELECT p.* FROM exad_rcd_prewap` — no
 *  aliasing at all — so the field names here are the table's actual Oracle columns, confirmed
 *  against a real response payload: PREWAP_SEQ, W_PRIM_HID, W_NUM, SURFACEN, SURFACEE,
 *  SV_SURF_ELEVF, SV_UTM_ZN, WELL_TYPE, WELL_CLASS, TARGET_DPTH (normalizeRowKeys lowercases the
 *  casing but does not rename anything). There is no well-name column at all — get_ir_wells_prc.sql
 *  builds one the same way this row's reader must: `w_prim_hid || '_' || w_num`. `EXPL_WB_NAME`
 *  also exists on this table but is an unrelated exploration-well identifier, not this water well's
 *  name — do not read it for wellName. */
export interface IrLinkedWellRow {
  readonly prewap_seq: number;
  readonly w_prim_hid: string | null;
  readonly w_num: string | null;
  readonly surfacen: number | null;
  readonly surfacee: number | null;
  /** Feet ASL — get_ir_wells_prc.sql aliases this same column as `surfaceelevation`. */
  readonly sv_surf_elevf: number | null;
  /** NUMBER, not a "38N"-style zone string — confirmed against a live USER_TAB_COLUMNS dump. */
  readonly sv_utm_zn: number | null;
  readonly well_type: string | null;
  readonly well_class: string | null;
  /** Planned total depth (ft) — the well's own value, not this IR's. This is the ONLY real source
   *  Target Depth has anywhere: exad_gwd_ir_header carries no target-depth column of its own (see
   *  IntegratedRequirementRequestReference.targetDepthFt's doc comment), which is why that field is
   *  read-only in the UI and only ever populated from whichever well an IR is linked to. */
  readonly target_dpth: number | null;
}

/** exad_gwd_well_design — keyed by its own wd_seq, NOT ir_seq (see 01-schema.sql, agwa-planning
 *  backend: that table links to a well only via prewap_seq). pump_lvl (Estimated Pump Depth) and
 *  the eight completion-element columns (oh_flg/oh_remarks, gp_flg/gp_remarks,
 *  perforated_flg/perforated_remarks, ls_flg/ls_remarks — see
 *  IntegratedRequirementWellDesignFlags/deriveCompletionElementFlags) are mapped through the IR
 *  bulk-save contract; update_ir_data_prc's own exad_gwd_well_design MERGE accepts all of these
 *  (docs/ir/update_ir_data_prc.sql). Every other column on that ~25-column table (design_rpt,
 *  status, design_phase, w_prim_hid, w_num, sta_water_lvl, tds, completion_type, notes,
 *  publish_dt/flg/by, curr_flg...) belongs to a separate Well Design workflow this app doesn't
 *  touch, so those are simply never sent — see buildWellDesignRow's own doc comment for the
 *  data-loss risk that leaves on the table's OTHER columns whenever this app's own UPDATE lands on
 *  a wd_seq that workflow already populated. */
export interface IrWellDesignRow extends IrActionRow {
  readonly wd_seq: number | null;
  readonly prewap_seq: number | null;
  readonly pump_lvl: number | null;
  readonly oh_flg: 'Y' | 'N' | null;
  readonly oh_remarks: string | null;
  readonly gp_flg: 'Y' | 'N' | null;
  readonly gp_remarks: string | null;
  readonly perforated_flg: 'Y' | 'N' | null;
  readonly perforated_remarks: string | null;
  readonly ls_flg: 'Y' | 'N' | null;
  readonly ls_remarks: string | null;
}

export interface WwellIrTableBlock<TRow extends IrActionRow = IrRow> {
  readonly table: WwellIrTableName;
  readonly data: readonly TRow[] | null;
}

/** Fixed 6-table shape the backend expects per save — add a slot here when a new table joins the contract. */
export type WwellIrBulkSavePayload = readonly [
  WwellIrTableBlock<IrHeaderRow>,
  WwellIrTableBlock<IrCasingRow>,
  WwellIrTableBlock<IrHydrogeologyRow>,
  WwellIrTableBlock<IrTopsRow>,
  WwellIrTableBlock<IrRow>,
  WwellIrTableBlock<IrWellDesignRow>,
];

/** POST/PATCH response row — mirrors the backend's SaveIntegratedRequirementResult record. */
export interface WwellIrSaveResult {
  readonly irSeq: number | null;
}

/**
 * GET (list) response row — mirrors the backend's IrHeaderSummary record. Backed only by
 * exad_gwd_ir_header, so it deliberately omits the richer domain fields (client, wellName,
 * contacts...) that table has no column for yet. `prewapSeq`/`ltrNo` DO have real columns
 * (exad_gwd_ir_header.prewap_seq/ltr_no) — see wwell-ir-summary.mapper.ts, which reads them into
 * `linkedRequestId`/`letterNumber` so a row's "Link to Request" is known from the list itself,
 * not only after its detail is fetched.
 */
export interface IrHeaderSummary {
  readonly irSeq: number;
  readonly prewapSeq: number | null;
  readonly ltrNo: string | null;
  readonly cmplType: string | null;
  readonly testType: string | null;
  readonly publishFlg: 'Y' | 'N';
  readonly createdDt: string | null;
  readonly updatedDt: string | null;
}

/**
 * GET /{irSeq} (detail) response block — same { table, data } wrapper as the bulk-save contract,
 * but exad_agwa_queries_pkg.get_ir_data_prc builds it as
 * header/casing/tops/hydrogeology/water, NOT the WwellIrBulkSavePayload tuple's
 * header/casing/hydrogeology/tops/water order. Always look a block up by `table`, never by index.
 * Rows are typed loosely here (vs. IrCasingRow etc.) since which row shape applies depends on
 * which table you're reading — narrow with the specific row interface at each read site.
 */
export interface WwellIrDetailTableBlock {
  readonly table: WwellIrTableName;
  readonly data: readonly Record<string, unknown>[] | null;
}

/**
 * GET /wells/eligible-for-ir response row — mirrors the backend's IrWellEligibilitySummary record.
 * Backed by exad_rcd_prewap (a separate table/package from the exad_gwd_ir_* bulk-save contract
 * above), for the IR editor's Request Reference "Link to Request" picker — selecting one
 * auto-populates whichever Request Reference fields this record actually has data for (Water Well
 * Name, Surface Elevation, Coordinates, Target Depth); see wwell-ir-editor.component.ts's
 * `applyLinkedRequestWell`. BI Number/Supporting Business/Target Aquifer still have no source here
 * (exad_rcd_prewap doesn't carry them) and stay manually entered. Target Depth used to be in that
 * same "no source" group — it now comes from exad_rcd_prewap.target_dpth (`targetdepth` here),
 * which is why that field is read-only in the UI: exad_gwd_ir_header has no target-depth column of
 * its own to save a manually-typed value into.
 */
export interface IrEligibleWell {
  readonly prewapSeq: number;
  readonly wellName: string;
  readonly surfaceNorth: number | null;
  readonly surfaceEast: number | null;
  readonly surfaceElevation: number | null;
  readonly primaryHoleId: string | null;
  readonly wellNumber: string | null;
  readonly utmZone: string | null;
  readonly wellType: string | null;
  readonly wellClassification: string | null;
  readonly targetDepth: number | null;
}

/**
 * GET /gwd-ops-members raw response row — backed by exad_agwa_queries_pkg.get_gwd_ops_member_prc,
 * itself a thin wrapper around a production-only utility package (EXAD_UTIL_QUERIES_PKG.
 * emp_in_hierarchy). The Java side maps that cursor generically (GwdOpsMemberMapper.java), so these
 * keys are whatever the real production proc returns rather than a fixed DTO — only the two fields
 * the IR editor's Geologist Contact picker actually needs are declared here.
 */
export interface GwdOpsMemberRaw {
  readonly FULL_NAME: string;
  readonly EMPNUM: number;
}

/** Domain shape for the Geologist Contact "Primary"/"Secondary" picker — see mapGwdOpsMemberRaw. */
export interface GwdOpsMember {
  readonly fullName: string;
  readonly empNum: number;
}

export function mapGwdOpsMemberRaw(raw: GwdOpsMemberRaw): GwdOpsMember {
  return { fullName: raw.FULL_NAME, empNum: raw.EMPNUM };
}
