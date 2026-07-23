export interface MorningReport {
    readonly epANum: string;
    readonly wGnrName: string;
    readonly wRigCd: string;
    readonly racEstDdLatCord: string;
    readonly racEstDdLonCord: string;
    readonly biNum: string;
    readonly trgtRsvrCd: string;
    readonly stLongCd: string;
    readonly wStDmrkDpth: string;
    readonly wPrsntDpth: number | null;
    readonly wDpthChgDis: number | null;
    readonly wOpRmk: string;
    readonly foremanRmk: string;
    readonly plLtrlEndDpth: number | null;
    readonly supportings: string;
    readonly wEvntTime: string;
    readonly rigStatus: string;
}

/** A single well that failed to load during batch detail fetching. */
export interface WellFetchFailure {
    readonly epANum: number;
    readonly wellName: string;
    readonly reason: string;
}
