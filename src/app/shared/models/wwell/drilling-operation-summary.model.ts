export interface IDrillingOperationSummary {
    epANum: number;
    wEvntTime: string;
    wHolSz: string;
    wOpRmk: string;
    wActvDrlgFlg?: string;   // optional – not present in every element
    wMajOpCd: string;
    wHoleStaDpth: number;
    wHoleEndDpth: number;
    toTm: string;
}