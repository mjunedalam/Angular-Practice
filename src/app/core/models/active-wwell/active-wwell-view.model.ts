export interface MiscWellData {
  readonly wellName: string;
  readonly targetDesc: string;
  readonly targetedAquifer: string;
  readonly currentStatus: string;
  readonly daysSinceSpud: number;
  readonly targetDays: number;
  readonly biNum: string;
  readonly supportingWell: string;
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
  readonly productivity: number;
  readonly rate: number;
}

export interface WellTestResult {
  readonly wellName: string;
  readonly testType: string;
  readonly aquifer: string;
  readonly rpm: number;
  readonly flowRate: number;
  readonly temperature: number;
  readonly tds: number;
  readonly productivity: number;
  readonly h2s: number;
}

export interface WellHeaderViewModel {
  readonly field: string;
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
}

export interface FormationInfoViewModel {
  readonly formation: string;
  readonly prognosed: number | string;
  readonly actualDepth: number | string;
  readonly difference: number | string;
  readonly remarks: string;
}

export interface CasingInfoViewModel {
  readonly csgType: string;
  readonly csgSize: string | number;
  readonly csgDepth: number | string;
  readonly csgBotDpth: number | string;
}

export interface WwellTestViewModel {
  readonly flowType: string;
  readonly testType: string;
  readonly aquiferActual: string;
  readonly aquiferEstimate: string;
  readonly h2sActual: number | string;
  readonly h2sEstimate: number | string;
  readonly temp: number | string;
  readonly tds: number | string;
  readonly rpm: number | string;
  readonly duration: number | string;
  readonly conductedBy: string;
  readonly rate: number | string;
  readonly siwhp: number | string;
  readonly depth: number | string;
  readonly productivityActual: number | string;
  readonly productivityEstimate: number | string;
  readonly swl: number | string;
  readonly dwl: number | string;
}

export interface UploadFileItem {
  readonly file: File;
  readonly id: string;
}
