import { IWellData } from '@models/well-design/well-data.model';

export const DrillingDataActions = {
    loadDrillingData: '[Drilling Data] Load Data',
    selectWell: '[Drilling Data] Select Well',
    setDate: '[Drilling Data] Set Date',
    updateRigStatus: '[Drilling Data] Update Rig Status',
    upsertWell: '[Drilling Data] Upsert Well',
    removeWell: '[Drilling Data] Remove Well',
    nextPage: '[Drilling Data] Next Page',
    prevPage: '[Drilling Data] Prev Page',
} as const;

export const DrillingDataEvents = {
    drillingDataLoaded: '[Drilling Data] Data Loaded',
    drillingDataLoadFailed: '[Drilling Data] Data Load Failed',
    wellUpserted: '[Drilling Data] Well Upserted',
    wellRemoved: '[Drilling Data] Well Removed',
} as const;

export interface LoadDrillingDataPayload {
    date: string;
    autoSelectFirst?: boolean;
}

export interface SelectDrillingWellPayload {
    epANum: number;
    date?: string;
}

export interface UpdateRigStatusPayload {
    epANum: number | string;
    rigStatus: string;
}

export interface UpsertWellPayload {
    wellData: IWellData;
}

export interface RemoveWellPayload {
    epANum: number;
}

export interface DrillingDataResult {
    allWellsData: IWellData[];
}

export interface DrillingDataErrorPayload {
    error: string;
}
