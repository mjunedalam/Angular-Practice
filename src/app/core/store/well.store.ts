/**
 * well.store.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * NgRx Signal Store — single source of truth for all well data.
 *
 * Architecture:
 *   well.actions.ts   → intent descriptors (what can happen)
 *   well.selectors.ts → pure derivation functions (testable, reusable)
 *   well.store.ts     → state shape + computed wiring + async methods
 *
 * Smart/Dumb separation:
 *   Smart components  → inject WellStore, call methods, read signals
 *   Dumb components   → @Input / no store dependency (DepthScale, WellBoreView)
 */

import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod }     from '@ngrx/signals/rxjs-interop';
import { tapResponse }  from '@ngrx/operators';
import { delay, map, pipe, switchMap, tap } from 'rxjs';

import { IWellData }             from 'src/app/shared/models/wwell/wwell-data.model';
import { WellboreDiagramData }   from '../models/wellbore-diagram.model';
import { WellLogsIndicators }    from 'src/app/shared/models/wwell/well-logs-indicators.model';
import { MorningReport, WellName } from '../models/well-name.model';
import { WellDataService }       from '../services/well-data.service';
import { MoriningReportService } from '../services/morning-report-service';
import { LoaderService }         from 'src/app/shared/components/global-loader/loader.service';

import { WellActions, WellEvents } from './well.actions';
import {
  PAGE_SIZE,
  uniqueByWellName,
  selectTotalPages,
  selectPagedWellNames,
  selectHasPrevPage,
  selectHasNextPage,
  selectTotalDepth,
  selectDiagramData,
  selectMiscWellData,
  selectPickedFormations,
  selectOffsetWells,
  selectWellLogsIndicators,
} from './well.selectors';

// ─── Minimum loader visibility (ms) ──────────────────────────────────────────
const MIN_LOADER_DELAY = 800;

// ─── Expected API keys for dev-time diagnostics ───────────────────────────────
const EXPECTED_KEYS: (keyof IWellData)[] = [
  'WELL_MASTER', 'RIG_ACTIVITY', 'DRLG_OP_STATUS', 'DRLG_FD_TDAY',
  'DRLG_FM_TOPS', 'NEW_TARGET_DAYS', 'NEXT_2_WELL_ACTIVITY', 'EXAD_RCD_PREWAP',
  'EXAD_GWD_IR_CASING', 'EXAD_GWD_IR_TOPS', 'EXAD_GWD_IR_HYDROGEOLOGY',
  'EXAD_GWD_IR_WATER', 'EXAD_GWD_IR_HEADER', 'WATER_WELL_TEST_OUTCOME',
];

function logMissingKeys(data: IWellData, epANum: number): void {
  const missing = EXPECTED_KEYS.filter(k => data[k] == null);
  const empty   = EXPECTED_KEYS.filter(k => Array.isArray(data[k]) && (data[k] as unknown[]).length === 0);
  if (missing.length) console.warn(`[${WellEvents.wellDetailsLoaded}] epANum=${epANum} missing:`, missing);
  if (empty.length)   console.info(`[${WellEvents.wellDetailsLoaded}] epANum=${epANum} empty:`, empty);
  if (!missing.length && !empty.length) console.log(`[${WellEvents.wellDetailsLoaded}] epANum=${epANum} ✓ all keys present`);
}

// ─── Public view-model interfaces ─────────────────────────────────────────────
export interface MiscWellData {
  readonly wellName:         string;
  readonly targetDesc:       string;
  readonly targetedAquifer:  string;
  readonly currentStatus:    string;
  readonly daysSinceSpud:    number;
  readonly targetDays:       number;
  readonly biNum:            string;
  readonly supportingWell:   string;
  readonly feetDrilledToday: number;
  readonly previousWell:     string;
  readonly currentDepth:     number;
  readonly nextWell:         string;
}

export interface PickedFormationTops {
  readonly formation: string;
  readonly depth:     number;
  readonly remarks:   string;
}

export interface OffsetWaterWells {
  readonly wellName:     string;
  readonly aquifer:      string;
  readonly tds:          number;
  readonly rpm:          number;
  readonly h2s:          number;
  readonly distance:     number;
  readonly productivity: number;
  readonly rate:         number;
}

// ─── State shape ──────────────────────────────────────────────────────────────
interface WellState {
  readonly wellNames:       WellName[];
  readonly selectedEpANum:  number | null;
  readonly wellDetails:     IWellData | null;
  readonly loading:         boolean;
  readonly error:           string | null;
  readonly animationTrigger: number;
  readonly wellNamesPage:   number;
}

const initialState: WellState = {
  wellNames:        [],
  selectedEpANum:   null,
  wellDetails:      null,
  loading:          false,
  error:            null,
  animationTrigger: 0,
  wellNamesPage:    0,
};

// ─── Store ────────────────────────────────────────────────────────────────────
export const WellStore = signalStore(
  { providedIn: 'root' },
  withState<WellState>(initialState),

  // ── Computed signals — all logic lives in well.selectors.ts ────────────────
  withComputed(({ wellDetails, wellNames, wellNamesPage }) => {
    // Base derived signal reused by all pagination selectors — computed once
    const unique = computed(() => uniqueByWellName(wellNames()));

    return {
      // Pagination
      uniqueWellNames: unique,
      totalPages:      computed(() => selectTotalPages(unique())),
      pagedWellNames:  computed(() => selectPagedWellNames(unique(), wellNamesPage())),
      hasPrevPage:     computed(() => selectHasPrevPage(wellNamesPage())),
      hasNextPage:     computed(() => selectHasNextPage(unique(), wellNamesPage())),

      // Status
      isLoaded: computed(() => wellDetails() !== null),

      // Well detail view-models — delegate entirely to selectors
      totalDepth:          computed(() => selectTotalDepth(wellDetails())),
      diagramData:         computed((): WellboreDiagramData | null => selectDiagramData(wellDetails())),
      miscWellData:        computed((): MiscWellData | null => selectMiscWellData(wellDetails())),
      pickedFormations:    computed((): PickedFormationTops[] => selectPickedFormations(wellDetails())),
      offsetWells:         computed((): OffsetWaterWells[] => selectOffsetWells(wellDetails())),
      wellsLogsIndicators: computed((): WellLogsIndicators | null => selectWellLogsIndicators(wellDetails())),
    };
  }),

  // ── Methods — async operations + pagination commands ───────────────────────
  withMethods((
    store,
    wellDataService      = inject(WellDataService),
    morningReportService = inject(MoriningReportService),
    loaderService        = inject(LoaderService),
  ) => {
    // ── Private: get first well on a given page ───────────────────────────
    function firstOnPage(pageIdx: number): WellName | undefined {
      return store.uniqueWellNames()[pageIdx * PAGE_SIZE];
    }

    // ── selectWell — load full well details for a given EPA number ────────
    const selectWell = rxMethod<number>(
      pipe(
        tap((epANum) => {
          loaderService.show();
          patchState(store, { selectedEpANum: epANum, loading: true, error: null });
        }),
        switchMap(epANum =>
          wellDataService.getWellDetails(epANum).pipe(
            delay(MIN_LOADER_DELAY),
            tapResponse({
              next: (wellDetails) => {
                logMissingKeys(wellDetails, store.selectedEpANum()!);
                patchState(store, {
                  wellDetails,
                  loading: false,
                  animationTrigger: store.animationTrigger() + 1,
                });
                loaderService.hide();
              },
              error: (err: Error) => {
                patchState(store, { error: err.message ?? 'Failed to load well details', loading: false });
                loaderService.hide();
              },
            }),
          ),
        ),
      ),
    );

    // ── loadWellNames — bootstrap: load name list then auto-select first ──
    const loadWellNames = rxMethod<void>(
      pipe(
        tap(() => {
          loaderService.show();
          patchState(store, { loading: true, error: null });
        }),
        switchMap(() =>
          morningReportService.getMorningReport().pipe(
            delay(MIN_LOADER_DELAY),
            map((reports: MorningReport[]) =>
              reports.map(r => ({ wellName: r.wGnrName, epANum: Number(r.epANum) }))
            ),
            tapResponse({
              next: (wellNames) => {
                patchState(store, { wellNames, loading: false });
                loaderService.hide();
                if (wellNames.length > 0 && !store.selectedEpANum()) {
                  selectWell(wellNames[0].epANum);
                }
              },
              error: (err: Error) => {
                patchState(store, { error: err.message ?? 'Failed to load well names', loading: false });
                loaderService.hide();
              },
            }),
          ),
        ),
      ),
    );

    return {
      selectWell,
      loadWellNames,

      nextPage(): void {
        const idx = store.wellNamesPage() + 1;
        patchState(store, { wellNamesPage: idx });
        const first = firstOnPage(idx);
        if (first) selectWell(first.epANum);
      },

      prevPage(): void {
        const idx = Math.max(0, store.wellNamesPage() - 1);
        patchState(store, { wellNamesPage: idx });
        const first = firstOnPage(idx);
        if (first) selectWell(first.epANum);
      },
    };
  }),

  // ── Hooks — side effects tied to store lifecycle ───────────────────────────
  withHooks({
    onInit(store) {
      // Uncomment if you want auto-bootstrap from the store itself:
      // store.loadWellNames();
    },
    onDestroy() {
      // Cleanup if needed
    },
  }),
);

// ─── Re-export for use in components / effects ────────────────────────────────
export { WellActions, WellEvents };