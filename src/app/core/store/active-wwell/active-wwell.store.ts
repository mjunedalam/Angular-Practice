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
import { map, pipe, switchMap, tap } from 'rxjs';

import { MorningReport } from 'src/app/core/models/morning-report/morning-report.model';
import { IWellData } from 'src/app/core/models/well-design/well-data.model';
import { WellLogsIndicators } from 'src/app/core/models/well-design/well-logs-indicators.model';
import { WellName } from 'src/app/core/models/well-design/well-name.model';
import { WellboreDiagramData } from 'src/app/core/models/well-design/wellbore-diagram.model';
import { MorningReportService } from 'src/app/core/services/morning-report.service';
import { WellDataService } from 'src/app/core/services/well-data.service';
import { formatDateForInput } from 'src/app/shared/utils/date.util';

import { WellActions, WellEvents } from '@store/active-wwell/active-wwell.actions';
import {
    PAGE_SIZE,
    uniqueByEpANum,
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
    selectWellTestResults,
    selectWellHeaderViewModel,
    selectDatabaseInfoViewModel,
    selectOperationSummaryViewModel,
    selectFormationInfoViewModel,
    selectCasingInfoViewModel,
    selectWwellTestViewModel,
} from '@store/active-wwell/active-wwell.selectors';
import {
    MiscWellData,
    OffsetWaterWells,
    PickedFormationTops,
    WellHeaderViewModel,
    DatabaseInfoViewModel,
    OperationSummaryViewModel,
    FormationInfoViewModel,
    CasingInfoViewModel,
    WwellTestViewModel,
    WellTestResult,
} from '@models/active-wwell/active-wwell-view.model';


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
    if (!missing.length && !empty.length) console.log(`[${WellEvents.wellDetailsLoaded}] epANum=${epANum} ✓`);
}

interface WellState {
    readonly wellNames: WellName[];
    readonly selectedEpANum: number | null;
    readonly selectedDate: Date;
    readonly wellDetails: IWellData | null;
    readonly loading: boolean;
    readonly error: string | null;
    readonly animationTrigger: number;
    readonly wellNamesPage: number;
    readonly hasLoadedOnce: boolean;
}

const initialState: WellState = {
    wellNames: [],
    selectedEpANum: null,
    selectedDate: new Date(),
    wellDetails: null,
    loading: false,
    error: null,
    animationTrigger: 0,
    wellNamesPage: 0,
    hasLoadedOnce: false,
};

export const WellStore = signalStore(
    withState<WellState>(initialState),

    withComputed(({ wellDetails, wellNames, wellNamesPage, loading, selectedEpANum, selectedDate, hasLoadedOnce }) => {
        const unique = computed(() => uniqueByEpANum(wellNames()));
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
            wellTestResults: computed((): WellTestResult[] => selectWellTestResults(wellDetails())),
            isInitialLoading: computed(() => wellNames().length === 0 && loading()),
            isDetailsLoading: computed(() => wellNames().length > 0 && loading() && hasLoadedOnce()),
            wellHeaderData: computed((): WellHeaderViewModel | null => selectWellHeaderViewModel(wellDetails(), selectedEpANum())),
            databaseInfo: computed((): DatabaseInfoViewModel | null => selectDatabaseInfoViewModel(wellDetails(), selectedDate())),
            operationSummary: computed((): OperationSummaryViewModel | null => selectOperationSummaryViewModel(wellDetails())),
            formationInfo: computed((): FormationInfoViewModel | null => selectFormationInfoViewModel(wellDetails())),
            casingInfo: computed((): CasingInfoViewModel | null => selectCasingInfoViewModel(wellDetails())),
            wwellTest: computed((): WwellTestViewModel | null => selectWwellTestViewModel(wellDetails())),
        };
    }),

    withMethods((
        store,
        wellDataService = inject(WellDataService),
        morningReportService = inject(MorningReportService),
    ) => {
        function firstOnPage(pageIdx: number): WellName | undefined {
            return store.uniqueWellNames()[pageIdx * PAGE_SIZE];
        }

        const selectWell = rxMethod<{ epANum: number; date: string }>(
            pipe(
                tap(({ epANum, date }) => {
                    patchState(store, {
                        selectedEpANum: epANum,
                        selectedDate: new Date(date + 'T00:00:00'),
                        loading: true,
                        error: null,
                    });
                }),
                switchMap(({ epANum, date }) =>
                    wellDataService.getWellDetails(epANum, date).pipe(
                        tapResponse({
                            next: (wellDetails) => {
                                logMissingKeys(wellDetails, epANum);
                                patchState(store, {
                                    wellDetails,
                                    loading: false,
                                    hasLoadedOnce: true,
                                    animationTrigger: store.animationTrigger() + 1,
                                });
                            },
                            error: (err: Error) => {
                                patchState(store, {
                                    error: err.message ?? 'Failed to load well details',
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
                switchMap(() => {
                    const date = formatDateForInput(store.selectedDate());
                    return morningReportService.getMorningReport(date).pipe(
                        map((reports: MorningReport[]) => reports.map(r => ({ wellName: r.wGnrName, epANum: Number(r.epANum) }))),
                        tapResponse({
                            next: (wellNames) => {
                                patchState(store, { wellNames, loading: false });
                                if (wellNames.length > 0 && !store.selectedEpANum()) {
                                    selectWell({ epANum: wellNames[0].epANum, date: formatDateForInput(store.selectedDate()) });
                                }
                            },
                            error: (err: Error) => {
                                patchState(store, {
                                    error: err.message ?? 'Failed to load well names',
                                    loading: false,
                                });
                            },
                        }),
                    );
                }),
            ),
        );

        return {
            selectWell,
            loadWellNames,
            setSelectedDate(date: Date): void {
                const nextDate = formatDateForInput(date);
                const currentDate = formatDateForInput(store.selectedDate());

                if (nextDate === currentDate) {
                    return;
                }

                patchState(store, { selectedDate: date, error: null });
                const epANum = store.selectedEpANum();
                if (epANum != null) {
                    selectWell({ epANum, date: nextDate });
                }
            },
            getFormattedDate(): string {
                return formatDateForInput(store.selectedDate());
            },
            nextPage(): void {
                const idx = store.wellNamesPage() + 1;
                patchState(store, { wellNamesPage: idx });
                const first = firstOnPage(idx);
                if (first) selectWell({ epANum: first.epANum, date: formatDateForInput(store.selectedDate()) });
            },
            prevPage(): void {
                const idx = Math.max(0, store.wellNamesPage() - 1);
                patchState(store, { wellNamesPage: idx });
                const first = firstOnPage(idx);
                if (first) selectWell({ epANum: first.epANum, date: formatDateForInput(store.selectedDate()) });
            },
        };
    }),

    withHooks({
        onInit() { /* bootstrap via component */ },
        onDestroy() { /* cleanup if needed */ },
    }),
);

export { WellActions, WellEvents };
