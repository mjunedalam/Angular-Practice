import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';

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
    selectWaterWellTestResultsFromData,
    selectWellHeaderViewModel,
    selectWellLogsIndicators,
    selectWellNamesFromList,
    selectWellTestResults,
    selectWwellTestViewModel,
} from 'src/app/core/store/shared/well-data.selectors';
import { normalizeEpANum } from 'src/app/core/store/shared/well-data.state';
import { initialPresentationState, PresentationState } from './presentation.state';

export const PresentationStore = signalStore(
    withState<PresentationState>(initialPresentationState),

    withComputed(({ wellList, wellData, selectedEpANum, selectedDate, listLoading, detailLoading, error, wellNamesPage }) => {
        const wellNames = computed((): WellName[] => selectWellNamesFromList(wellList()));

        return {
            wellNames,
            pagedWellNames: computed((): WellName[] => selectPagedWellNames(wellNames(), wellNamesPage())),
            hasPrevPage: computed(() => selectHasPrevPage(wellNamesPage())),
            hasNextPage: computed(() => selectHasNextPage(wellNames(), wellNamesPage())),
            totalPages: computed(() => selectTotalPages(wellNames())),
            isDetailsLoading: computed(() => detailLoading() && wellList().length > 0),
            isInitialLoading: computed(() => listLoading() && wellList().length === 0),
            isLoaded: computed(() => selectedEpANum() !== null && wellData() !== null),
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
            waterWelltestResult: computed(() => selectWaterWellTestResultsFromData(wellData() ? [wellData()!] : [])),
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

        const loadListAndAutoSelect = rxMethod<string>(
            pipe(
                tap(date => patchState(store, {
                    listLoading: true,
                    error: null,
                    wellData: null,
                    selectedDate: parseDateFromInput(date),
                })),
                switchMap(date =>
                    svc.getWellList(date).pipe(
                        tapResponse({
                            next: (wellList) => {
                                if (!wellList.length) {
                                    patchState(store, { wellList: [], listLoading: false, selectedEpANum: null });
                                    notify.info('Data is not available for the given date');
                                    return;
                                }

                                const firstEntry = wellList[0];
                                patchState(store, {
                                    wellList,
                                    listLoading: false,
                                    selectedEpANum: firstEntry.epANum,
                                    wellNamesPage: 0,
                                });
                                loadDetail({ date, epANum: firstEntry.epANum });
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
            initialize(date?: string): void {
                loadListAndAutoSelect(date ?? formatDateForInput(store.selectedDate()));
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

            setDate(date: string, options?: { autoSelectFirst?: boolean }): void {
                void options;
                loadListAndAutoSelect(date);
            },

            nextPage(): void {
                const names = selectWellNamesFromList(store.wellList());
                const maxPage = Math.max(0, selectTotalPages(names) - 1);
                const next = Math.min(store.wellNamesPage() + 1, maxPage);
                const firstOnPage = selectPagedWellNames(names, next)[0];
                patchState(store, {
                    wellNamesPage: next,
                    ...(firstOnPage ? { selectedEpANum: firstOnPage.epANum } : {}),
                });
                if (firstOnPage) {
                    loadDetail({ date: formatDateForInput(store.selectedDate()), epANum: firstOnPage.epANum });
                }
            },

            prevPage(): void {
                const names = selectWellNamesFromList(store.wellList());
                const prev = Math.max(0, store.wellNamesPage() - 1);
                const firstOnPage = selectPagedWellNames(names, prev)[0];
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

            loadWaterWellTestResults(): void { /* data comes from wellData */ },
        };
    }),
);
