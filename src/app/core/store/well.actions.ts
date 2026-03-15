import { IWellData } from '../../../models/well-design/wwell-data.model';
import { WellName } from '../../../models/well-design/well-name.model';

// ─── Commands (triggered by UI / lifecycle) ───────────────────────────────────
export const WellActions = {
    loadWellNames: '[Well] Load Well Names',
    selectWell: '[Well] Select Well',
    nextPage: '[Well] Next Page',
    prevPage: '[Well] Prev Page',
} as const;

// ─── Events (outcomes after async operations) ────────────────────────────────
export const WellEvents = {
    wellNamesLoaded: '[Well] Well Names Loaded',
    wellNamesLoadFailed: '[Well] Well Names Load Failed',
    wellDetailsLoaded: '[Well] Well Details Loaded',
    wellDetailsLoadFailed: '[Well] Well Details Load Failed',
} as const;

// ─── Typed payloads ───────────────────────────────────────────────────────────
export interface SelectWellPayload { epANum: number }
export interface WellNamesResult { wellNames: WellName[] }
export interface WellDetailsResult { wellDetails: IWellData; epANum: number }
export interface WellOperationError { error: string }