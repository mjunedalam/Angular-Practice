export interface IWaterIR {
    offsetWaterWell: string;
    distance: number;
    direction: string;
    aquifer: string;
    td: number;
    flowRate: number;
    rpm: number;
    staticWaterLevel: number | null;
    specificCapacity: number | null;
    drawDown: number | null;
    fieldTds: number;
    h2s: number;
    testDuration: number;
}