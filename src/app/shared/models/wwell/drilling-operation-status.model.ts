export interface IDrillingOperationStatus {
    epANum: number;
    wPrsntDpth: number;
    wCsgBotDpth: number;
    wCsgOdSz: string;
    wDpthChgDis: number;
    wMudCircPc: string;
    wPrevDpth: number;
    wSpudOprDay: number;
    wOpRmk: string;
    wDrlgSmryRmk?: string | null;
    nxt24HrPlanRmk: string;
    spuddays: number;
    footage: number;
    targetDepth: number;
}