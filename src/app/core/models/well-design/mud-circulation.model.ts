export interface IMudCirculation {
    wPrsntDpth: number;   // depth of measurement (string from API, parse to number)
    wMudCircPc: string;  // mud circulation percentage at that depth
    wDpthChgDis: number; // footage from previous measurement
}