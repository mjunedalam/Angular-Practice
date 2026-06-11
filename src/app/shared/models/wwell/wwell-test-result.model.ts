export type WellTestType = 'FLOW' | 'PUMP';

export interface WaterWellTestResult {
  readonly testType: WellTestType;
  readonly wellName: string;
  readonly rPM: string;
  readonly siwhp: string;
  readonly pumpDepth: string;
  readonly swl: string;
  readonly dwl: string;
  readonly h2sPPM: string;
  readonly temperature: string;
  readonly trgtRsvrCd: string;
  readonly duration: string;
  readonly testRate: string;
  readonly wellProductivity: string;
  readonly tds: string;
  readonly conductedBy: string;
}

export interface WaterWellTestEmailRow {
  readonly leftLabel: string;
  readonly leftValue: string;
  readonly rightLabel?: string;
  readonly rightValue?: string;
}

export interface WaterWellTestEmailResult extends WaterWellTestResult {
  readonly rows: readonly WaterWellTestEmailRow[];
}
