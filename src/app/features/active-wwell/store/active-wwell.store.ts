import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { EMPTY, pipe, switchMap, tap } from 'rxjs';

import { IWellData } from '@models/well-design/well-data.model';
import { WellLogsIndicators } from '@models/well-design/well-logs-indicators.model';
import { WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import {
    CasingInfoViewModel,
    DatabaseInfoViewModel,
    FormationInfoViewModel,
    MiscWellData,
    OffsetWaterWells,
    OperationSummaryViewModel,
    PickedFormationTops,
    WellHeaderViewModel,
    WellTestResult,
    WwellTestViewModel,
} from '@models/active-wwell/active-wwell-view.model';
import { WellName } from '@models/well-design/well-name.model';
import { DailyOperationService } from '@services/daily-operation.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { formatDateForInput, parseDateFromInput } from 'src/app/shared/utils/date.util';
import {
    selectCasingInfoViewModel,
    selectDatabaseInfoViewModel,
    selectDiagramData,
    selectFormationInfoViewModel,
    selectHasNextPage,
    selectHasPrevPage,
    selectMiscWellData,
    selectOffsetWells,
    selectOperationSummaryViewModel,
    selectPageIndexForEpANum,
    selectPagedWellNames,
    selectPickedFormations,
    selectTotalDepth,
    selectTotalPages,
    selectWellHeaderViewModel,
    selectWellLogsIndicators,
    selectWellNamesFromList,
    selectWellTestResults,
    selectWwellTestViewModel,
} from 'src/app/core/store/shared/well-data.selectors';
import { normalizeEpANum } from 'src/app/core/store/shared/well-data.state';
import { ActiveWwellState, initialActiveWwellState } from './active-wwell.state';

export const ActiveWwellStore = signalStore(
    withState<ActiveWwellState>(initialActiveWwellState),

    withComputed(({ wellList, wellData, selectedEpANum, selectedDate, listLoading, detailLoading, wellNamesPage, error }) => {
        const wellNames = computed((): WellName[] => selectWellNamesFromList(wellList()));

        return {
            wellNames,
            uniqueWellNames: wellNames,
            pagedWellNames: computed((): WellName[] => selectPagedWellNames(wellNames(), wellNamesPage())),
            hasPrevPage: computed(() => selectHasPrevPage(wellNamesPage())),
            hasNextPage: computed(() => selectHasNextPage(wellNames(), wellNamesPage())),
            totalPages: computed(() => selectTotalPages(wellNames())),
            isDetailsLoading: computed(() => detailLoading() && wellList().length > 0),
            isInitialLoading: computed(() => listLoading() && wellList().length === 0),
            isLoading: computed(() => listLoading() || detailLoading()),
            hasError: computed(() => error() !== null),
            errorMessage: computed(() => error() ?? ''),
            selectedWell: computed((): IWellData | null => wellData()),
            miscWellData: computed((): MiscWellData | null => selectMiscWellData(wellData())),
            diagramData: computed((): WellboreDiagramData | null => selectDiagramData(wellData())),
            pickedFormations: computed((): PickedFormationTops[] => selectPickedFormations(wellData())),
            offsetWells: computed((): OffsetWaterWells[] => selectOffsetWells(wellData())),
            wellTestResults: computed((): WellTestResult[] => selectWellTestResults(wellData())),
            wellsLogsIndicators: computed((): WellLogsIndicators | null => selectWellLogsIndicators(wellData())),
            wellHeaderData: computed((): WellHeaderViewModel | null =>
                selectWellHeaderViewModel(wellData(), selectedEpANum()),
            ),
            databaseInfo: computed((): DatabaseInfoViewModel | null =>
                selectDatabaseInfoViewModel(wellData(), selectedDate()),
            ),
            operationSummary: computed((): OperationSummaryViewModel | null =>
                selectOperationSummaryViewModel(wellData()),
            ),
            formationInfo: computed((): FormationInfoViewModel | null =>
                selectFormationInfoViewModel(wellData()),
            ),
            casingInfo: computed((): CasingInfoViewModel | null =>
                selectCasingInfoViewModel(wellData()),
            ),
            wwellTest: computed((): WwellTestViewModel | null =>
                selectWwellTestViewModel(wellData()),
            ),
            totalDepth: computed((): number => selectTotalDepth(wellData())),
        };
    }),

    withMethods((
        store,
        svc = inject(DailyOperationService),
        notify = inject(NotificationService),
    ) => {
        const loadDetail = rxMethod<{ date: string; epANum: number }>(
            pipe(
                tap(() => patchState(store, { detailLoading: true, error: null })),
                switchMap(({ date, epANum }) =>
                    svc.getWellDetail(date, epANum).pipe(
                        tapResponse({
                            next: (wellData: IWellData) => {
                                patchState(store, {
                                    wellData,
                                    detailLoading: false,
                                    animationTrigger: store.animationTrigger() + 1,
                                });
                            },
                            error: (err: Error) => {
                                patchState(store, {
                                    detailLoading: false,
                                    error: err.message ?? 'Failed to load well detail',
                                });
                            },
                        }),
                    ),
                ),
            ),
        );

        const loadListAndAutoSelect = rxMethod<{ date: string; epANumOverride: number | null }>(
            pipe(
                tap(({ date }) => patchState(store, {
                    listLoading: true,
                    error: null,
                    wellData: null,
                    selectedDate: parseDateFromInput(date),
                })),
                switchMap(({ date, epANumOverride }) =>
                    svc.getWellList(date).pipe(
                        tapResponse({
                            next: (wellList) => {
                                if (!wellList.length) {
                                    patchState(store, { wellList: [], listLoading: false, selectedEpANum: null });
                                    notify.info('Data is not available for the given date');
                                    return;
                                }

                                const firstEntry = wellList[0];
                                // Honour the requested epANum when it exists in the new list.
                                // Without this, the async arrival of the list always overwrote
                                // selectedEpANum with firstEntry, discarding the URL's well param.
                                const targetEpANum = (epANumOverride !== null && wellList.some(w => w.epANum === epANumOverride))
                                    ? epANumOverride
                                    : firstEntry.epANum;
                                const names = selectWellNamesFromList(wellList);
                                const page = selectPageIndexForEpANum(names, targetEpANum, 0);

                                patchState(store, {
                                    wellList,
                                    listLoading: false,
                                    selectedEpANum: targetEpANum,
                                    wellNamesPage: page,
                                });
                                loadDetail({ date, epANum: targetEpANum });
                            },
                            error: (err: Error) => {
                                patchState(store, {
                                    listLoading: false,
                                    error: err.message ?? 'Failed to load well list',
                                });
                            },
                        }),
                    ),
                ),
            ),
        );

        return {
            loadWellNames(date?: string, epANumOverride?: number): void {
                loadListAndAutoSelect({
                    date: date ?? formatDateForInput(store.selectedDate()),
                    epANumOverride: epANumOverride ?? null,
                });
            },

            selectWell(params: { epANum: number; date?: string }): void {
                const epANum = normalizeEpANum(params.epANum);
                if (epANum === null) return;

                const date = params.date ?? formatDateForInput(store.selectedDate());
                const names = selectWellNamesFromList(store.wellList());
                const page = selectPageIndexForEpANum(names, epANum, store.wellNamesPage());

                patchState(store, { selectedEpANum: epANum, wellNamesPage: page });
                loadDetail({ date, epANum });
            },

            setDate(date: string): void {
                // Preserve the active well across date changes; falls back to first if not found.
                loadListAndAutoSelect({ date, epANumOverride: store.selectedEpANum() });
            },

            nextPage(): void {
                const maxPage = Math.max(0, store.totalPages() - 1);
                const next = Math.min(store.wellNamesPage() + 1, maxPage);
                const firstOnPage = selectPagedWellNames(store.wellNames(), next)[0];
                patchState(store, {
                    wellNamesPage: next,
                    ...(firstOnPage ? { selectedEpANum: firstOnPage.epANum } : {}),
                });
                if (firstOnPage) {
                    loadDetail({ date: formatDateForInput(store.selectedDate()), epANum: firstOnPage.epANum });
                }
            },

            prevPage(): void {
                const prev = Math.max(0, store.wellNamesPage() - 1);
                const firstOnPage = selectPagedWellNames(store.wellNames(), prev)[0];
                patchState(store, {
                    wellNamesPage: prev,
                    ...(firstOnPage ? { selectedEpANum: firstOnPage.epANum } : {}),
                });
                if (firstOnPage) {
                    loadDetail({ date: formatDateForInput(store.selectedDate()), epANum: firstOnPage.epANum });
                }
            },

            setUiError(message: string | null): void {
                patchState(store, { error: message });
            },

            loadWaterWellTestResults(): void {
                return EMPTY as unknown as void;
            },
        };
    }),
);

export type ActiveWwellStoreType = InstanceType<typeof ActiveWwellStore>;
