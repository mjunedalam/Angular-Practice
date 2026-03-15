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
    if (!missing.length && !empty.length) console.log(`[${WellEvents.wellDetailsLoaded}] epANum=${epANum} ✓`);
}

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
    readonly footage:          number;
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

interface WellState {
    readonly wellNames:        WellName[];
    readonly selectedEpANum:   number | null;
    readonly wellDetails:      IWellData | null;
    readonly loading:          boolean;
    readonly error:            string | null;
    readonly animationTrigger: number;
    readonly wellNamesPage:    number;
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

export const WellStore = signalStore(
    { providedIn: 'root' },
    withState<WellState>(initialState),

    withComputed(({ wellDetails, wellNames, wellNamesPage }) => {
        const unique = computed(() => uniqueByWellName(wellNames()));
        return {
            uniqueWellNames:     unique,
            totalPages:          computed(() => selectTotalPages(unique())),
            pagedWellNames:      computed(() => selectPagedWellNames(unique(), wellNamesPage())),
            hasPrevPage:         computed(() => selectHasPrevPage(wellNamesPage())),
            hasNextPage:         computed(() => selectHasNextPage(unique(), wellNamesPage())),
            isLoaded:            computed(() => wellDetails() !== null),
            totalDepth:          computed(() => selectTotalDepth(wellDetails())),
            diagramData:         computed((): WellboreDiagramData | null => selectDiagramData(wellDetails())),
            miscWellData:        computed((): MiscWellData | null => selectMiscWellData(wellDetails())),
            pickedFormations:    computed((): PickedFormationTops[] => selectPickedFormations(wellDetails())),
            offsetWells:         computed((): OffsetWaterWells[] => selectOffsetWells(wellDetails())),
            wellsLogsIndicators: computed((): WellLogsIndicators | null => selectWellLogsIndicators(wellDetails())),
        };
    }),

    withMethods((
        store,
        wellDataService      = inject(WwellDataService),
        morningReportService = inject(MoriningReportService),
    ) => {
        function firstOnPage(pageIdx: number): WellName | undefined {
            return store.uniqueWellNames()[pageIdx * PAGE_SIZE];
        }

        const selectWell = rxMethod<number>(
            pipe(
                tap((epANum) => {
                    patchState(store, {
                        selectedEpANum: epANum,
                        loading:        true,
                        error:          null,
                        wellDetails:    null, // ← reset so pickedFormations() = [] and isLoaded() = false
                    });
                }),
                switchMap(epANum =>
                    wellDataService.getWellDetails(epANum).pipe(
                        tapResponse({
                            next: (wellDetails) => {
                                logMissingKeys(wellDetails, store.selectedEpANum()!);
                                patchState(store, {
                                    wellDetails,
                                    loading:          false,
                                    animationTrigger: store.animationTrigger() + 1,
                                });
                            },
                            error: (err: Error) => {
                                patchState(store, {
                                    error:   err.message ?? 'Failed to load well details',
                                    loading: false,
                                });
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
                                patchState(store, {
                                    error:   err.message ?? 'Failed to load well names',
                                    loading: false,
                                });
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
        onInit()    { /* bootstrap via component */ },
        onDestroy() { /* cleanup if needed */       },
    }),
);

export { WellActions, WellEvents };


import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  Injector,
  OnInit,
} from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ColDef,
  GridApi,
  GridOptions,
  GridReadyEvent,
  themeQuartz,
} from 'ag-grid-community';
import { PickedFormationTops, WellStore } from '../../core/stores/wwell-data/well.store';

@Component({
  selector: 'app-picked-formation-tops',
  standalone: true,
  imports: [AgGridAngular],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './picked-formation-tops.component.html',
  styleUrl: './picked-formation-tops.component.scss',
})
export class PickedFormationTopsComponent implements OnInit {
  private readonly store    = inject(WellStore);
  private readonly injector = inject(Injector);
  private gridApi: GridApi<PickedFormationTops> | null = null;

  ngOnInit(): void {
    // Set up reactive effect here — ngOnInit runs in injection context,
    // gridApi will be ready via onGridReady before the store emits real data
    // because well loading is async (HTTP call happens after view init).
    effect(() => {
      const rows = this.store.pickedFormations();
      // isLoaded() guards against the [] emitted when wellDetails is reset
      // to null at the start of a new well fetch (see well.store.ts tap())
      if (this.gridApi && this.store.isLoaded()) {
        this.gridApi.setGridOption('rowData', rows);
      }
    }, { injector: this.injector });
  }

  onGridReady(event: GridReadyEvent<PickedFormationTops>): void {
    this.gridApi = event.api;
    // Populate immediately if data already in store (e.g. component created
    // after well was already loaded)
    if (this.store.isLoaded()) {
      this.gridApi.setGridOption('rowData', this.store.pickedFormations());
    }
  }

  readonly theme = themeQuartz.withParams({
    accentColor:           '#1a8fc1',
    backgroundColor:       '#e8f6fb',
    foregroundColor:       '#0d3a6e',
    headerBackgroundColor: '#1565c0',
    headerTextColor:       '#ffffff',
    headerFontSize:        12,
    headerFontWeight:      700,
    rowHoverColor:         'rgba(0,150,200,0.12)',
    oddRowBackgroundColor: '#d0eef8',
    borderColor:           '#a8d4e8',
    borderRadius:          0,
    fontSize:              12,
    rowHeight:             32,
    headerHeight:          36,
    spacing:               4,
    fontFamily:            'inherit',
    cellHorizontalPaddingScale: 1.2,
  });

  readonly columnDefs: ColDef<PickedFormationTops>[] = [
    {
      field: 'formation', headerName: 'Formation', flex: 1, minWidth: 90,
      headerClass: 'header--center', cellClass: 'cell--center cell--formation',
    },
    {
      field: 'depth', headerName: 'Depth', flex: 1, minWidth: 80,
      headerClass: 'header--center', cellClass: 'cell--center cell--depth',
      valueFormatter: ({ value }) => value != null ? value.toLocaleString() : '—',
    },
    {
      field: 'remarks', headerName: 'Remarks', flex: 2, minWidth: 120,
      headerClass: 'header--center', cellClass: 'cell--center cell--remarks',
      tooltipField: 'remarks',
    },
  ];

  readonly gridOptions: GridOptions<PickedFormationTops> = {
    animateRows: true,
    suppressMovableColumns: true,
    suppressCellFocus: true,
    overlayNoRowsTemplate: '<span class="no-rows">No formations picked yet.</span>',
    defaultColDef: { sortable: true, resizable: false, suppressHeaderMenuButton: true },
  };
}
