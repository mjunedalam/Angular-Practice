export interface WellMaster {
  readonly well: string;
  readonly offshore: string;
  readonly utmNorth: number;
  readonly utmEast: number;
  readonly lon: number;
  readonly lat: number;
}

export interface RigActivity {
  readonly wellName: string;
  readonly wellName2: string;
  readonly wRigCd: string;
  readonly wDrlgTypeDesc: string;
  readonly wWellTypeDesc: string;
  readonly spuddate: string;
  readonly drlgPlanWellDesc: string;
  readonly wDrlgTrgtDay: number;
  readonly waterWell: string;
  readonly wDrlgEndDt: string;
}

export interface RigIdentification {
  readonly rigname: string;
  readonly rigShrtName: string;
  readonly rigHp: number;
  readonly rigMaxDpthCap: number;
}

export interface DrillingOpStatus {
  readonly epANum: number;
  readonly wPrsntDpth: number;
  readonly wPrevDpth: number;
  readonly wOpRmk: string;
  readonly nxt24HrPlanRmk: string;
  readonly wDrlgEngName: string;
  readonly wFmanName: string;
}

export interface GeologicTop {
  readonly stLongCd: string;
  readonly planTvdDepth: number;
  readonly planSsDepth: number;
}

export interface CasingInfo {
  readonly csgSize: string;
  readonly csgType: string;
  readonly csgDepth: number;
  readonly csgRemarks: string;
}

export interface Hydrogeology {
  readonly flowType: string;
  readonly estTargetAquifier: string;
  readonly estStaticWaterLevel: number;
  readonly estWaterQuality: number;
  readonly estProductivity: number;
  readonly estH2s: number;
}

export interface OffsetWaterWell {
  readonly offsetWaterWell: string;
  readonly distance: number;
  readonly direction: string;
  readonly aquifer: string;
  readonly td: number;
  readonly flowRate: number;
}

export interface PreWap {
  readonly surfaceElevation: number;
  readonly estTargetDepth: number;
  readonly targetFormation: string;
  readonly supportedBusiness: string;
}

export interface WaterWellTestOutcome {
  readonly wellName: string;
  readonly testType: string;
  readonly aquifer: string;
  readonly rpm: number;
  readonly flowRate: number;
}

export interface IrHeader {
  readonly dtRemarks: string;
  readonly mudRemarks: string;
  readonly loggingRemarks: string;
}

export interface WellDetails {
  readonly RIG_ACTIVITY: RigActivity[];
  readonly WELL_MASTER: WellMaster[];
  readonly RIG_IDENTIFICATION: RigIdentification[];
  readonly DRLG_OP_STATUS: DrillingOpStatus[];
  readonly EXAD_GWD_IR_TOPS: GeologicTop[];
  readonly EXAD_GWD_IR_CASING: CasingInfo[];
  readonly EXAD_GWD_IR_HYDROGEOLOGY: Hydrogeology[];
  readonly EXAD_GWD_IR_WATER: OffsetWaterWell[];
  readonly EXAD_RCD_PREWAP: PreWap[];
  readonly WATER_WELL_TEST_OUTCOME: WaterWellTestOutcome[];
  readonly EXAD_GWD_IR_HEADER: IrHeader[];
}

export interface WellDetailsResponse {
  readonly statusCode: number;
  readonly error: boolean;
  readonly message: string;
  readonly data: WellDetails[];
}
