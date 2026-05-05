export type WellTestType = 'FLOW' | 'PUMP';

export interface WaterWellTestResult {
  readonly testType: WellTestType;
  readonly wellName: string;
  readonly rPM: string;
  readonly siwhp: string;
  readonly h2sPPM: string;
  readonly temperature: string;
  readonly trgtRsvrCd: string;
  readonly testRate: string;
  readonly wellProductivity: string;
  readonly tds: string;
}
