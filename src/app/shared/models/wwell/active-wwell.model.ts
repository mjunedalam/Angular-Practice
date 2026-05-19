export interface GwdDailyRemarks {
    epANum: number | null;
    wActDt: string | null;
    area: string | null;
    status: string | null;
    wOpRmk: string | null;
    nxt24HrPlanRmk: string | null;
    wDrlgSmryRmk: string | null;
}

export interface GwdWellTests {
    epANum: number | null;
    rsvrCd: string | null;
    hydTestTypCd: string;               // default is 'STP1'
    testStaDt: string | null;
    temp: number | null;
    hydH2sCnc: number | null;
    wtrSaTdsCnc: number | null;
    rpm: number | null;
    siwhp: number | null;
    hydPmpDpth: number | null;
    hydProdRt: number | null;
    statWlvl: number | null;
    dyncWlvl: number | null;
    testerNetworkId: string | null;
    hydProduct: number | null;
    duration: number | null;
}