    export interface GwdDailyRemarks {
        egdrId?: number | null;
        epANum: number | null;
        wActDt: string | null;
        area: string | null;
        status: string | null;
        wOpRmk: string | null;
        nxt24HrPlanRmk: string | null;
        wDrlgSmryRmk: string | null;
        remarks?: string | null;
        appUser?: string | null;
    }

    export interface GwdWellTests {
        egwtId?: number | null;
        epANum: number | null;
        rsvrCd: string | null;
        hydTestTypCd: string;
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
        fwhp: number | null;
        remarks?: string | null;
        appUser?: string | null;
    }