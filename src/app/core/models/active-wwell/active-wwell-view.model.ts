export interface MiscWellData {
  readonly wellName: string;
  readonly targetDesc: string;
  readonly targetedAquifer: string;
  readonly currentStatus: string;
  readonly daysSinceSpud: number;
  readonly targetDays: number;
  readonly biNum: string;
  readonly supportings: string;
  readonly feetDrilledToday: number;
  readonly previousWell: string;
  readonly currentDepth: number;
  readonly nextWell: string;
  readonly footage: number;
  readonly operationSummary: string;
  readonly next24HrOperation: string;
  readonly rop: number | null;
  readonly actualRm: number | null;
  readonly kpiRm: number | null;
  readonly rigMoveDays: number | null;
  readonly spudDate: string;
  readonly rigName: string;
  readonly drlgSmryRmk?: string | null;
  readonly holeSize: string | null;
}

export interface PickedFormationTops {
  readonly formation: string;
  readonly depth: number;
  readonly remarks: string;
}

export interface OffsetWaterWells {
  readonly wellName: string;
  readonly aquifer: string;
  readonly tds: number;
  readonly rpm: number;
  readonly h2s: number;
  readonly distance: number;
  readonly direction: string;
  readonly productivity: number;
  readonly rate: number;
}

export interface WellTestResult {
  readonly wellName: string;
  readonly testType: string;
  readonly aquifer: string;
  readonly rpm: number;
  readonly siwhp: number;
  readonly flowRate: number;
  readonly temperature: number;
  readonly tds: number;
  readonly productivity: number;
  readonly h2s: number;
}

export interface WellHeaderViewModel {
  readonly field: string;
  readonly fieldAr: string | null;
  readonly wellName: string;
  readonly lat: number | string;
  readonly lon: number | string;
  readonly targetedAquifer: string;
  readonly depth: number | string;
  readonly epNum: number | string;
  readonly biNum: string;
}

export interface DatabaseInfoViewModel {
  readonly date: string;
  readonly daysSinceSpud: number | string;
  readonly spudDate: string;
  readonly fiveAmDepth: number | string;
  readonly lastCasingSize: string;
  readonly rig: string;
  readonly targetDate: string;
  readonly releaseDate: string;
  readonly preFiveAmDepth: number | string;
  readonly lastCasingDepth: number | string;
  readonly spudDays: number | string;
  readonly samDepth: number | string;
  readonly rigMoveKpi: number | string;
  readonly wellTdDate: string;
  readonly footage: number | string;
  readonly secondarySamDepth: number | string;
}

export interface OperationSummaryViewModel {
  readonly operation: string;
  readonly nextOperation: string;
  readonly drillingRemarks: string;
}

export interface FormationInfoViewModel {
  readonly formation: string;
  readonly prognosed: number | string;
  readonly actualDepth: number | string;
  readonly difference: number | string;
  readonly remarks: string | null;
  readonly isDrlgOnly: boolean;
}

export interface CasingInfoViewModel {
  readonly csgType: string;
  readonly csgSize: string | number;
  readonly csgDepth: number | string;
  readonly csgBotDpth: number | string;
}

export interface WwellTestViewModel {
  readonly flowType: string;
  readonly testType?: string | null;
  readonly aquiferActual?: string | null;
  readonly aquiferEstimate: string;
  readonly h2sActual?: number | string | null;
  readonly h2sEstimate: number | string;
  readonly temp?: number | string | null;
  readonly tds?: number | string | null;
  readonly rpm?: number | string | null;
  readonly duration?: number | string | null;
  readonly conductedBy?: string | null;
  readonly rate?: number | string | null;
  readonly siwhp?: number | string | null;
  readonly depth: number | string;
  readonly productivityActual?: number | string | null;
  readonly productivityEstimate: number | string;
  readonly swl?: number | string | null;
  readonly dwl?: number | string | null;
  readonly hydPmpDpth?: number | null;
}



export interface UploadFileItem {
  readonly file: File;
  readonly id: string;
  readonly uploaded?: boolean;
}