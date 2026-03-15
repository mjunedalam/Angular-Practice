
export interface IWaterWellTestOutcome {
    wellName: string;
    testType?: string | null;
    aquifer?: string | null;
    rpm?: number | null;
    flowRate?: number | null;
    temperature?: number | null;
    tds?: number | null;
    producitivty?: number | null;
    h2s?: number | null;
}
