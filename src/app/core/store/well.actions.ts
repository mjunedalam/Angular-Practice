/**
 * well.actions.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * All intent descriptors for the WellStore.
 * Using plain typed interfaces instead of NgRx createAction keeps this
 * library-agnostic while still giving a single place to find every
 * operation the store can perform.
 *
 * Pattern:
 *   - WellActions  → commands  (what the UI wants to do)
 *   - WellEvents   → outcomes  (what the store emits after async work)
 */

import { IWellData } from 'src/app/shared/models/wwell/wwell-data.model';
import { WellName }  from '../models/well-name.model';

// ─── Commands (triggered by UI / lifecycle) ───────────────────────────────────
export const WellActions = {
  loadWellNames: '[Well] Load Well Names',
  selectWell:    '[Well] Select Well',
  nextPage:      '[Well] Next Page',
  prevPage:      '[Well] Prev Page',
} as const;

// ─── Events (outcomes after async operations) ────────────────────────────────
export const WellEvents = {
  wellNamesLoaded:       '[Well] Well Names Loaded',
  wellNamesLoadFailed:   '[Well] Well Names Load Failed',
  wellDetailsLoaded:     '[Well] Well Details Loaded',
  wellDetailsLoadFailed: '[Well] Well Details Load Failed',
} as const;

// ─── Typed payloads ───────────────────────────────────────────────────────────
export interface SelectWellPayload    { epANum: number }
export interface WellNamesResult      { wellNames: WellName[] }
export interface WellDetailsResult    { wellDetails: IWellData; epANum: number }
export interface WellOperationError   { error: string }