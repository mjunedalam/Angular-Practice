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
  | 'exad_gwd_ir_water';

interface IrRow {
  readonly action: IrRowAction;
  /** null until the backend assigns one on first save; echo it back on every later save. */
  readonly ir_seq: number | null;
}

export interface IrHeaderRow extends IrRow {
  readonly prewap_seq: number | null;
  readonly ltr_no: string | null;
  readonly screen: string;
  readonly tops_remarks: string | null;
  readonly publish_dt: string | null;
  readonly publish_flg: 'Y' | 'N';
  readonly curr_flg: 'Y' | 'N';
  readonly publish_by: string | null;
  /** exad_gwd_ir_header.cont_geologist/sub_cont_geologist are NUMBER(3) — resolved from the form's
   *  geologist name via the TEMPORARY WWELL_GEOLOGIST_ID_BY_NAME stopgap map (see
   *  wwell-planning-reference-data.config.ts) until a real employee-id lookup exists. */
  readonly cont_geologist: number | null;
  readonly sub_cont_geologist: number | null;
  readonly water_remarks: string | null;
  readonly geo_remarks: string | null;
  /** Free-text completion selection (exad_gwd_ir_header.completion, VARCHAR2(4000)) — NOT
   *  cmpl_type, which is VARCHAR2(10) and too short to hold values like "Screened + Gravel Pack". */
  readonly completion: string | null;
  readonly cmpl_type: string | null;
  readonly acidization: string | null;
  readonly trns_type: string | null;
  readonly ot_rmks: string | null;
  readonly mud_rmks: string | null;
  readonly test_type: string | null;
  readonly flow_rmks: string | null;
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
  readonly h2s: string | null;
}

export interface WwellIrTableBlock<TRow extends IrRow = IrRow> {
  readonly table: WwellIrTableName;
  readonly data: readonly TRow[] | null;
}

/** Fixed 5-table shape the backend expects per save — add a slot here when a new table joins the contract. */
export type WwellIrBulkSavePayload = readonly [
  WwellIrTableBlock<IrHeaderRow>,
  WwellIrTableBlock<IrCasingRow>,
  WwellIrTableBlock<IrHydrogeologyRow>,
  WwellIrTableBlock<IrTopsRow>,
  WwellIrTableBlock<IrRow>,
];

/** POST/PATCH response row — mirrors the backend's SaveIntegratedRequirementResult record. */
export interface WwellIrSaveResult {
  readonly irSeq: number | null;
}

/**
 * GET (list) response row — mirrors the backend's IrHeaderSummary record. Backed only by
 * exad_gwd_ir_header, so it deliberately omits the richer domain fields (client, wellName,
 * contacts...) that table has no column for yet.
 */
export interface IrHeaderSummary {
  readonly irSeq: number;
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
 * above), for the "New IR" wizard's Request Reference "Link to Request" picker — selecting one
 * auto-populates whichever Request Reference fields this record actually has data for (Water Well
 * Name, Surface Elevation, Coordinates); see wwell-ir-new-page.component.ts's
 * `applyLinkedRequestWell`. BI Number/Supporting Business/Target Aquifer/Target Depth have no
 * source here (exad_rcd_prewap doesn't carry them) and stay manually entered.
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
}
