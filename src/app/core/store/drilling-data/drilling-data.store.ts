import { computed, inject } from '@angular/core';
import {
    patchState,
    signalStore,
    withComputed,
    withMethods,
    withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';

import { IWellData } from '@models/well-design/well-data.model';
import { WellLogsIndicators } from '@models/well-design/well-logs-indicators.model';
import { WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { MorningReport } from '@models/morning-report/morning-report.model';
import { WaterWellTestResult } from 'src/app/shared/models/wwell/wwell-test-result.model';
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
import { WellName } from '@models/well-design/well-name.model';
import { DrillingDataService } from '@services/drilling-data.service';
import {
    DEFAULT_NOTIFICATION_DURATION_MS,
    NotificationService,
} from '@shared/components/notification/notification.service';
import { formatDateForInput, getTodayAtMidnight, parseDateFromInput } from 'src/app/shared/utils/date.util';
import {
    selectOperationSummaryViewModel,
    selectCasingInfoViewModel,
    selectDatabaseInfoViewModel,
    selectDiagramData,
    selectFormationInfoViewModel,
    selectHasNextPage,
    selectHasPrevPage,
    selectMiscWellData,
    selectMorningReports,
    selectOffsetWells,
    selectPagedWellNames,
    selectPickedFormations,
    selectSelectedWell,
    selectTotalDepth,
    selectTotalPages,
    selectWaterWellTestResultsFromData,
    selectWellHeaderViewModel,
    selectWellLogsIndicators,
    selectWellNamesFromData,
    selectWellTestResults,
    selectWwellTestViewModel,
    uniqueByEpANum,
} from '@store/drilling-data/drilling-data.selectors';
import {
    DrillingDataState,
    initialDrillingDataState,
    normalizeEpANum,
    removeRigStatusOverride,
    removeWellData,
    resolvePageForSelection,
    resolveSelectionAfterDataLoad,
    updateRigStatusOverrides,
    upsertWellData,
} from '@store/drilling-data/drilling-data.state';
import { DrillingDataActions, DrillingDataEvents } from '@store/drilling-data/drilling-data.actions';

const initialState: DrillingDataState = {
    ...initialDrillingDataState,
    selectedDate: getTodayAtMidnight(),
    notificationDurationMs: DEFAULT_NOTIFICATION_DURATION_MS,
};

export const DrillingDataStore = signalStore(
    withState<DrillingDataState>(initialState),

    withComputed(({ allWellsData, selectedEpANum, selectedDate, loading, error, hasLoadedOnce, wellNamesPage, rigStatusOverrides }) => {
        const wellNames = computed((): WellName[] => selectWellNamesFromData(allWellsData()));
        const uniqueWellNames = computed((): WellName[] => uniqueByEpANum(wellNames()));
        const hasData = computed(() => allWellsData().length > 0);
        const selectedWell = computed((): IWellData | null => selectSelectedWell(allWellsData(), selectedEpANum()));

        return {
            wellNames,
            uniqueWellNames,
            pagedWellNames: computed((): WellName[] => selectPagedWellNames(uniqueWellNames(), wellNamesPage())),
            hasPrevPage: computed(() => selectHasPrevPage(wellNamesPage())),
            hasNextPage: computed(() => selectHasNextPage(uniqueWellNames(), wellNamesPage())),
            totalPages: computed(() => selectTotalPages(uniqueWellNames())),
            isLoaded: computed(() => selectedEpANum() !== null && allWellsData().length > 0),
            morningReport: computed((): MorningReport[] => selectMorningReports(allWellsData(), rigStatusOverrides())),
            waterWelltestResult: computed((): WaterWellTestResult[] => selectWaterWellTestResultsFromData(allWellsData())),
            statusCode: computed(() => {
                if (loading()) return 0;
                return hasData() ? 200 : 404;
            }),
            hasError: computed(() => error() !== null),
            errorMessage: computed(() => error() ?? ''),
            isLoading: computed(() => loading()),
            hasData,
            selectedWell,
            isDetailsLoading: computed(() => loading() && hasLoadedOnce()),
            isInitialLoading: computed(() => loading() && !hasLoadedOnce()),
            miscWellData: computed((): MiscWellData | null => selectMiscWellData(selectedWell())),
            diagramData: computed((): WellboreDiagramData | null => selectDiagramData(selectedWell())),
            pickedFormations: computed((): PickedFormationTops[] => selectPickedFormations(selectedWell())),
            offsetWells: computed((): OffsetWaterWells[] => selectOffsetWells(selectedWell())),
            wellTestResults: computed((): WellTestResult[] => selectWellTestResults(selectedWell())),
            wellsLogsIndicators: computed((): WellLogsIndicators | null => selectWellLogsIndicators(selectedWell())),
            wellHeaderData: computed((): WellHeaderViewModel | null =>
                selectWellHeaderViewModel(selectedWell(), selectedEpANum()),
            ),
            databaseInfo: computed((): DatabaseInfoViewModel | null =>
                selectDatabaseInfoViewModel(selectedWell(), selectedDate()),
            ),
            operationSummary: computed((): OperationSummaryViewModel | null =>
                selectOperationSummaryViewModel(selectedWell()),
            ),
            formationInfo: computed((): FormationInfoViewModel | null =>
                selectFormationInfoViewModel(selectedWell()),
            ),
            casingInfo: computed((): CasingInfoViewModel | null =>
                selectCasingInfoViewModel(selectedWell()),
            ),
            wwellTest: computed((): WwellTestViewModel | null =>
                selectWwellTestViewModel(selectedWell()),
            ),
            totalDepth: computed((): number => selectTotalDepth(selectedWell())),
        };
    }),

    withMethods((
        store,
        drillingDataService = inject(DrillingDataService),
        notify = inject(NotificationService),
    ) => {
        function selectPage(pageIndex: number): void {
            const maxPage = Math.max(0, store.totalPages() - 1);
            const nextPage = Math.max(0, Math.min(pageIndex, maxPage));
            const firstWell = selectPagedWellNames(store.uniqueWellNames(), nextPage)[0];

            patchState(store, {
                wellNamesPage: nextPage,
                ...(firstWell
                    ? {
                        selectedEpANum: firstWell.epANum,
                        animationTrigger:
                            firstWell.epANum !== store.selectedEpANum()
                                ? store.animationTrigger() + 1
                                : store.animationTrigger(),
                    }
                    : {}),
            });
        }

        const loadMorningReportRequest = rxMethod<{ date: string; autoSelectFirst: boolean }>(
            pipe(
                tap(({ date }) => patchState(store, {
                    loading: true,
                    error: null,
                    selectedDate: parseDateFromInput(date),
                })),
                switchMap(({ date, autoSelectFirst }) =>
                    drillingDataService.getDrillingData(date).pipe(
                        tapResponse({
                            next: (allWellsData) => {
                                const currentSelectedEpANum = store.selectedEpANum();
                                const selection = resolveSelectionAfterDataLoad(allWellsData, currentSelectedEpANum, {
                                    autoSelectFirst,
                                });

                                patchState(store, {
                                    allWellsData,
                                    loading: false,
                                    hasLoadedOnce: true,
                                    rigStatusOverrides: {},
                                    ...selection,
                                    animationTrigger:
                                        selection.selectedEpANum !== null && selection.selectedEpANum !== currentSelectedEpANum
                                            ? store.animationTrigger() + 1
                                            : store.animationTrigger(),
                                });

                                if (allWellsData.length === 0) {
                                    notify.info('Data is not available for the given date', {
                                        durationMs: store.notificationDurationMs(),
                                    });
                                    return;
                                }
                            },
                            error: (err: Error) => {
                                patchState(store, {
                                    error: err.message ?? 'Failed to load drilling data',
                                    loading: false,
                                });
                            },
                        }),
                    ),
                ),
            ),
        );

        const loadWaterWellTestResults = rxMethod<void>(
            pipe(tap(() => { /* no-op: data already loaded via loadMorningReportData */ })),
        );

        return {
            loadMorningReportData(
                date: string,
                options?: { autoSelectFirst?: boolean },
            ): void {
                loadMorningReportRequest({
                    date,
                    autoSelectFirst: options?.autoSelectFirst ?? true,
                });
            },
            loadWaterWellTestResults,

            loadWellNames(): void {
                loadMorningReportRequest({
                    date: formatDateForInput(store.selectedDate()),
                    autoSelectFirst: true,
                });
            },

            selectWell(params: { epANum: number; date?: string }): void {
                const normalizedEpANum = normalizeEpANum(params.epANum);
                const nextPage = resolvePageForSelection(
                    store.allWellsData(),
                    normalizedEpANum,
                    store.wellNamesPage(),
                );

                patchState(store, {
                    selectedEpANum: normalizedEpANum,
                    wellNamesPage: nextPage,
                    animationTrigger:
                        normalizedEpANum !== null
                            ? store.animationTrigger() + 1
                            : store.animationTrigger(),
                    ...(params.date ? { selectedDate: parseDateFromInput(params.date) } : {}),
                });
            },

            setDate(date: string, options?: { autoSelectFirst?: boolean }): void {
                loadMorningReportRequest({
                    date,
                    autoSelectFirst: options?.autoSelectFirst ?? true,
                });
            },

            updateRigStatus(epANum: number | string, rigStatus: string): void {
                patchState(store, {
                    rigStatusOverrides: updateRigStatusOverrides(store.rigStatusOverrides(), epANum, rigStatus),
                });
            },

            setUiError(message: string | null): void {
                patchState(store, { error: message });
            },

            setNotificationDuration(durationMs: number): void {
                const normalizedDuration = Math.max(1000, Math.floor(durationMs));
                patchState(store, { notificationDurationMs: normalizedDuration });
                notify.setDefaultDuration(normalizedDuration);
            },

            nextPage(): void {
                selectPage(store.wellNamesPage() + 1);
            },

            prevPage(): void {
                selectPage(store.wellNamesPage() - 1);
            },

            upsertWell(wellData: IWellData): void {
                const nextData = upsertWellData(store.allWellsData(), wellData);
                const currentSelectedEpANum = store.selectedEpANum() ?? normalizeEpANum(wellData.DRLG_OP_STATUS?.[0]?.epANum);
                const selection = resolveSelectionAfterDataLoad(nextData, currentSelectedEpANum, {
                    autoSelectFirst: true,
                });

                patchState(store, {
                    allWellsData: nextData,
                    ...selection,
                });
            },

            removeWell(epANum: number): void {
                const normalizedEpANum = normalizeEpANum(epANum);
                const nextData = removeWellData(store.allWellsData(), normalizedEpANum);
                const currentSelectedEpANum =
                    normalizedEpANum !== null && store.selectedEpANum() === normalizedEpANum
                        ? null
                        : store.selectedEpANum();
                const selection = resolveSelectionAfterDataLoad(nextData, currentSelectedEpANum, {
                    autoSelectFirst: true,
                });

                patchState(store, {
                    allWellsData: nextData,
                    rigStatusOverrides: removeRigStatusOverride(store.rigStatusOverrides(), normalizedEpANum),
                    ...selection,
                    animationTrigger:
                        selection.selectedEpANum !== null && selection.selectedEpANum !== store.selectedEpANum()
                            ? store.animationTrigger() + 1
                            : store.animationTrigger(),
                });
            },
        };
    }),
);

export { DrillingDataActions, DrillingDataEvents };
