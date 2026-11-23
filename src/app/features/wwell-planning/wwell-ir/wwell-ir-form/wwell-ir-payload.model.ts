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
  readonly cont_geologist: number | null;
  readonly sub_cont_geologist: number | null;
  readonly water_remarks: string | null;
  readonly gen_remarks: string | null;
  readonly completion: string | null;
  readonly cmpl_type: string | null;
  readonly acidization: string | null;
  readonly trns_type: string | null;
  readonly dt_rmks: string | null;
  readonly mud_rmks: string | null;
  readonly test_type: string | null;
  readonly flow_rmks: string | null;
  readonly dev_pump_test: string | null;
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

export interface IrWaterRow extends IrRow {
  readonly ep_a_num: number;
  /** Read-only: returned by get_ir_data_prc, never sent on save. */
  readonly w_gnr_name?: string | null;
  /** The offset well's name — saved with the row (VARCHAR2(20)) and returned by get_ir_data_prc. */
  readonly wb_name?: string | null;
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

export interface IrLinkedWellRow {
  readonly prewap_seq: number;
  readonly w_prim_hid: string | null;
  readonly w_prim_hid_name?: string | null;
  readonly w_num: string | null;
  readonly surfacen: number | null;
  readonly surfacee: number | null;
  readonly sv_surf_elevf: number | null;
  readonly sv_utm_zn: number | null;
  readonly well_type: string | null;
  readonly well_class: string | null;
  readonly target_dpth: number | null;
  readonly target_form: string | null;
  readonly expl_wb_name: string | null;
}

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

export type WwellIrBulkSavePayload = readonly [
  WwellIrTableBlock<IrHeaderRow>,
  WwellIrTableBlock<IrCasingRow>,
  WwellIrTableBlock<IrHydrogeologyRow>,
  WwellIrTableBlock<IrTopsRow>,
  WwellIrTableBlock<IrRow>,
  WwellIrTableBlock<IrWellDesignRow>,
];

export interface WwellIrSaveResult {
  readonly irSeq: number | null;
}

export interface IrHeaderSummary {
  readonly irSeq: number;
  readonly prewapSeq: number | null;
  readonly ltrNo: string | null;
  readonly cmplType: string | null;
  readonly testType: string | null;
  readonly publishFlg: 'Y' | 'N';
  // Real exad_gwd_ir_header columns (see docs/ir/EXAD_GWD_IR_HEADER.md) — this table has no
  // created_dt/updated_dt column at all, so those never existed on the API response.
  readonly epCrDataDt: string | null;
  readonly epLtDataModDt: string | null;
  // Joined in from the linked exad_rcd_prewap well by get_ir_header_prc — the well name is `${primaryHoleId}_${wellNumber}`.
  readonly primaryHoleId?: string | null;
  readonly wellNumber?: string | null;
  readonly supportingBusiness?: string | null;
}

export interface WwellIrDetailTableBlock {
  readonly table: WwellIrTableName;
  readonly data: readonly Record<string, unknown>[] | null;
}

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
  readonly targetAquifer: string | null;
  readonly supportings: string | null;
}

/** One stratigraphic unit from GET /strat-info (EXAD_AGWA_QUERIES_PKG.strat_list). `description` is
 *  st_long_cd — the name the Formation dropdowns show and save. */
export interface StratInfo {
  readonly code: number;
  readonly description: string;
  readonly stratDesc: string | null;
}

/** One selectable offset water well from GET /offset-water-wells (EXAD_AGWA_QUERIES_PKG.get_ir_offset_water_wells_prc):
 *  the latest Area Water Well record per well name. Carries every column EXCEPT distance and location, which depend on
 *  where the new well sits, so the author enters them. The well name identifies it. */
export interface IrOffsetWellSource {
  readonly wellName: string;
  readonly aquifer: string | null;
  readonly totalDepthFt: number | null;
  readonly testDurationMin: number | null;
  readonly rateGpm: number | null;
  readonly rpm: number | null;
  readonly swlFt: number | null;
  readonly pwlFt: number | null;
  readonly drawdownFt: number | null;
  readonly specificCapacity: number | null;
  readonly tdsPpm: number | null;
  readonly h2sPpm: number | null;
}

export interface GwdOpsMemberRaw {
  readonly FULL_NAME: string;
  readonly EMPNUM: number;
}

export interface GwdOpsMember {
  readonly fullName: string;
  readonly empNum: number;
}

export function mapGwdOpsMemberRaw(raw: GwdOpsMemberRaw): GwdOpsMember {
  return { fullName: raw.FULL_NAME, empNum: raw.EMPNUM };
}
