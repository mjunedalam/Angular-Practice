
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

import { IWellData } from '../../../models/well-design/wwell-data.model';
import { IFormationTops } from '../../../shared/models/wwell/formation-tops.model';
import { IHeaderIR } from '../../../shared/models/wwell/header-ir.model';
import { WellLogsIndicators } from '../../../models/well-design/well-logs-indicators.model';
import { WellboreDiagramData } from '../../../models/well-design/wellbore-diagram.model';
import { WellName } from '../../../models/well-design/well-name.model';
import { sortCasingsByDepthDesc } from '../../../utils/wellbore-math.util';

import {
    MiscWellData,
    OffsetWaterWells,
    PickedFormationTops,
} from './well.store';

export const PAGE_SIZE = 5;
export const FALLBACK_STR = 'N/A';

export function uniqueByWellName(names: WellName[]): WellName[] {
    const seen = new Set<string>();
    return names.filter(w => {
        if (seen.has(w.wellName)) return false;
        seen.add(w.wellName);
        return true;
    });
}

export function selectTotalPages(unique: WellName[]): number {
    return Math.ceil(unique.length / PAGE_SIZE);
}

export function selectPagedWellNames(unique: WellName[], page: number): WellName[] {
    return unique.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
}

export function selectHasPrevPage(page: number): boolean {
    return page > 0;
}

export function selectHasNextPage(unique: WellName[], page: number): boolean {
    return (page + 1) * PAGE_SIZE < unique.length;
}

export function selectTotalDepth(d: IWellData | null): number {
    return d?.EXAD_RCD_PREWAP?.[0]?.estTargetDepth ?? 0;
}

export function selectDiagramData(d: IWellData | null): WellboreDiagramData | null {
    if (!d) return null;
    return {
        wellName: d.WELL_MASTER?.[0]?.well ?? '',
        totalDepth: d.EXAD_RCD_PREWAP?.[0]?.estTargetDepth ?? 0,
        casings: sortCasingsByDepthDesc(d.EXAD_GWD_IR_CASING ?? []),
        geologicTops: [...(d.EXAD_GWD_IR_TOPS ?? [])].sort((a, b) => a.planTvdDepth - b.planTvdDepth),
        hydrogeology: d.EXAD_GWD_IR_HYDROGEOLOGY?.[0] ?? null,
        prewap: d.EXAD_RCD_PREWAP?.[0] ?? null,
        rigActivity: d.RIG_ACTIVITY?.[0] ?? null,
        currentDepth: d.DRLG_OP_STATUS?.[0]?.wPrsntDpth ?? 0

    };
}

export function selectMiscWellData(d: IWellData | null): MiscWellData | null {
    if (!d) return null;
    const rig = d.RIG_ACTIVITY?.[0];
    const status = d.DRLG_OP_STATUS?.[0];
    return {
        wellName: rig?.wellName ?? FALLBACK_STR,
        targetDesc: rig?.drlgPlanWellDesc ?? FALLBACK_STR,
        targetedAquifer: d.EXAD_GWD_IR_HYDROGEOLOGY?.[0]?.estTargetAquifier ?? FALLBACK_STR,
        currentStatus: status?.nxt24HrPlanRmk ?? status?.wOpRmk ?? FALLBACK_STR,
        daysSinceSpud: status?.spuddays ?? 0,
        targetDays: d.NEW_TARGET_DAYS?.[0]?.targetDays ?? rig?.wDrlgTrgtDay ?? 0,
        biNum: rig?.biNum ?? FALLBACK_STR,
        supportingWell: rig?.waterWell ?? FALLBACK_STR,
        feetDrilledToday: d.DRLG_FD_TDAY?.[0]?.footage ?? status?.footage ?? 0,
        previousWell: FALLBACK_STR,
        currentDepth: status?.wPrsntDpth ?? 0,
        nextWell: d.NEXT_2_WELL_ACTIVITY?.[0]?.nextWellActivity ?? FALLBACK_STR,
        footage: status?.wDpthChgDis,

    };
}

export function selectPickedFormations(d: IWellData | null): PickedFormationTops[] {
    return (d?.DRLG_FM_TOPS ?? []).map((fm: IFormationTops) => ({
        formation: fm.stLongCd ?? '',
        depth: fm.wStDmrkDpth ?? 0,
        remarks: fm.wStDmrkRmk ?? '',
    }));
}

export function selectOffsetWells(d: IWellData | null): OffsetWaterWells[] {
    if (!d) return [];
    return (d.EXAD_GWD_IR_WATER ?? []).map(ow => {
        const test = (d.WATER_WELL_TEST_OUTCOME ?? []).find(t => t.wellName === ow.offsetWaterWell);
        return {
            wellName: ow.offsetWaterWell,
            aquifer: ow.aquifer || test?.aquifer || 'WASI',
            tds: test?.tds ?? 0,
            rpm: ow.rpm ?? 0,
            h2s: ow.h2s,
            distance: ow.distance ?? 0,
            productivity: ow?.specificCapacity ?? 0,
            rate: test?.flowRate ?? ow.flowRate ?? 0,
        };
    });
}

export function selectWellLogsIndicators(d: IWellData | null): WellLogsIndicators | null {
    if (!d) return null;
    const h: IHeaderIR | undefined = d.EXAD_GWD_IR_HEADER?.[0];
    return {
        rcc: !!(h?.dtRemarks?.trim()),
        mudLog: !!(h?.mudRemarks?.trim()),
        logging: !!(h?.loggingRemarks?.trim()),
    };
}

import { computed, inject } from '@angular/core';
import {
    patchState,
    signalStore,
    withComputed,
    withHooks,
    withMethods,
    withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { delay, map, pipe, switchMap, tap } from 'rxjs';

import { IWellData } from '../../../models/well-design/wwell-data.model';
import { WellboreDiagramData } from '../../../models/well-design/wellbore-diagram.model';
import { WellLogsIndicators } from '../../../models/well-design/well-logs-indicators.model';
import { MorningReport } from '../../../models/morining-report.model';
import { WellName } from '../../../models/well-design/well-name.model';
import { WwellDataService } from '../../../services/wwell-data.service';
import { MoriningReportService } from '../../../services/morining-report.service';

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
    const empty = EXPECTED_KEYS.filter(k => Array.isArray(data[k]) && (data[k] as unknown[]).length === 0);
    if (missing.length) console.warn(`[${WellEvents.wellDetailsLoaded}] epANum=${epANum} missing:`, missing);
    if (empty.length) console.info(`[${WellEvents.wellDetailsLoaded}] epANum=${epANum} empty:`, empty);
    if (!missing.length && !empty.length) console.log(`[${WellEvents.wellDetailsLoaded}] epANum=${epANum} ✓ all keys present`);
}

export interface MiscWellData {
    readonly wellName: string;
    readonly targetDesc: string;
    readonly targetedAquifer: string;
    readonly currentStatus: string;
    readonly daysSinceSpud: number;
    readonly targetDays: number;
    readonly biNum: string;
    readonly supportingWell: string;
    readonly feetDrilledToday: number;
    readonly previousWell: string;
    readonly currentDepth: number;
    readonly nextWell: string;
    readonly footage: number
}

export interface PickedFormationTops {
    readonly formation: string;
    readonly depth: number;
    readonly remarks: string;
}

export interface OffsetWaterWells {
    readonly wellName: string;
    readonly aquifer: string;
    readonly tds: number;
    readonly rpm: number;
    readonly h2s: number;
    readonly distance: number;
    readonly productivity: number;
    readonly rate: number;
}

interface WellState {
    readonly wellNames: WellName[];
    readonly selectedEpANum: number | null;
    readonly wellDetails: IWellData | null;
    readonly loading: boolean;
    readonly error: string | null;
    readonly animationTrigger: number;
    readonly wellNamesPage: number;
}

const initialState: WellState = {
    wellNames: [],
    selectedEpANum: null,
    wellDetails: null,
    loading: false,
    error: null,
    animationTrigger: 0,
    wellNamesPage: 0,
};

export const WellStore = signalStore(
    { providedIn: 'root' },
    withState<WellState>(initialState),

    withComputed(({ wellDetails, wellNames, wellNamesPage }) => {
        const unique = computed(() => uniqueByWellName(wellNames()));

        return {
            uniqueWellNames: unique,
            totalPages: computed(() => selectTotalPages(unique())),
            pagedWellNames: computed(() => selectPagedWellNames(unique(), wellNamesPage())),
            hasPrevPage: computed(() => selectHasPrevPage(wellNamesPage())),
            hasNextPage: computed(() => selectHasNextPage(unique(), wellNamesPage())),

            isLoaded: computed(() => wellDetails() !== null),

            totalDepth: computed(() => selectTotalDepth(wellDetails())),
            diagramData: computed((): WellboreDiagramData | null => selectDiagramData(wellDetails())),
            miscWellData: computed((): MiscWellData | null => selectMiscWellData(wellDetails())),
            pickedFormations: computed((): PickedFormationTops[] => selectPickedFormations(wellDetails())),
            offsetWells: computed((): OffsetWaterWells[] => selectOffsetWells(wellDetails())),
            wellsLogsIndicators: computed((): WellLogsIndicators | null => selectWellLogsIndicators(wellDetails())),
        };
    }),

    withMethods((
        store,
        wellDataService = inject(WwellDataService),
        morningReportService = inject(MoriningReportService),

    ) => {
        function firstOnPage(pageIdx: number): WellName | undefined {
            return store.uniqueWellNames()[pageIdx * PAGE_SIZE];
        }

        const selectWell = rxMethod<number>(
            pipe(
                tap((epANum) => {

                    patchState(store, { selectedEpANum: epANum, loading: true, error: null });
                }),
                switchMap(epANum =>
                    wellDataService.getWellDetails(epANum).pipe(
                        //delay(MIN_LOADER_DELAY),
                        tapResponse({
                            next: (wellDetails) => {
                                logMissingKeys(wellDetails, store.selectedEpANum()!);
                                patchState(store, {
                                    wellDetails,
                                    loading: false,
                                    animationTrigger: store.animationTrigger() + 1,
                                });

                            },
                            error: (err: Error) => {
                                patchState(store, { error: err.message ?? 'Failed to load well details', loading: false });

                            },
                        }),
                    ),
                ),
            ),
        );
        const loadWellNames = rxMethod<void>(
            pipe(
                tap(() => {

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

                                if (wellNames.length > 0 && !store.selectedEpANum()) {
                                    selectWell(wellNames[0].epANum);
                                }
                            },
                            error: (err: Error) => {
                                patchState(store, { error: err.message ?? 'Failed to load well names', loading: false });

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

    withHooks({
        onInit(store) {

            // store.loadWellNames();
        },
        onDestroy() { /* empty */ },
    }),
);

export { WellActions, WellEvents };

<div class="formation-card">
  <div class="formation-card__header">Picked Formation Tops</div>

  <ag-grid-angular
    class="formation-grid"
    [theme]="theme"
    [columnDefs]="columnDefs"
    [gridOptions]="gridOptions"
    (gridReady)="onGridReady($event)"
  />
</div>
/**
 * PickedFormationTopsComponent — SMART
 * Reads store.pickedFormations() directly via effect() → AG Grid.
 * No @Input needed.
 */
import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridApi, GridOptions, GridReadyEvent, themeQuartz } from 'ag-grid-community';
import { PickedFormationTops, WellStore } from '../../core/stores/wwell-data/well.store';

@Component({
  selector: 'app-picked-formation-tops',
  standalone: true,
  imports: [AgGridAngular],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './picked-formation-tops.component.html',
  styleUrl: './picked-formation-tops.component.scss',
})
export class PickedFormationTopsComponent {
  private readonly store = inject(WellStore);
  private gridApi: GridApi<PickedFormationTops> | null = null;

  constructor() {
    effect(() => {
      const data = this.store.pickedFormations();
      // Only attempt to update if the gridApi is actually ready
      if (this.gridApi) {
        this.gridApi.setGridOption('rowData', data);
      }
    });
  }

  onGridReady(event: GridReadyEvent<PickedFormationTops>): void {
    this.gridApi = event.api;
    this.gridApi.setGridOption('rowData', this.store.pickedFormations());
  }

  readonly theme = themeQuartz.withParams({
    accentColor: '#1a8fc1',
    backgroundColor: '#e8f6fb',
    foregroundColor: '#0d3a6e',
    headerBackgroundColor: '#1565c0',
    headerTextColor: '#ffffff',
    headerFontSize: 12,
    headerFontWeight: 700,
    rowHoverColor: 'rgba(0,150,200,0.12)',
    oddRowBackgroundColor: '#d0eef8',
    borderColor: '#a8d4e8',
    borderRadius: 0,
    fontSize: 12,
    rowHeight: 32,
    headerHeight: 36,
    spacing: 4,
    fontFamily: 'inherit',
    cellHorizontalPaddingScale: 1.2,
  });

  readonly columnDefs: ColDef<PickedFormationTops>[] = [
    { field: 'formation', headerName: 'Formation', flex: 1, minWidth: 90, headerClass: 'header--center', cellClass: 'cell--center cell--formation' },
    {
      field: 'depth', headerName: 'Depth', flex: 1, minWidth: 80, headerClass: 'header--center', cellClass: 'cell--center cell--depth',
      valueFormatter: ({ value }) => value != null ? value.toLocaleString() : '—'
    },
    { field: 'remarks', headerName: 'Remarks', flex: 2, minWidth: 120, headerClass: 'header--center', cellClass: 'cell--center cell--remarks', tooltipField: 'remarks' },
  ];

  readonly gridOptions: GridOptions<PickedFormationTops> = {
    animateRows: true,
    suppressMovableColumns: true,
    suppressCellFocus: true,
    overlayNoRowsTemplate: '<span class="no-rows">No formations picked yet.</span>',
    defaultColDef: { sortable: true, resizable: false, suppressHeaderMenuButton: true },
  };
}
