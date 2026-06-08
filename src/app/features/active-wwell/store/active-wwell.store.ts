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
    allCasingData,
    selectAllFormationTops,
    selectArea,
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
    selectStatus,
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
            allFormationTops: computed((): FormationInfoViewModel[] =>
                selectAllFormationTops(wellData()),
            ),
            casingInfo: computed((): CasingInfoViewModel | null =>
                selectCasingInfoViewModel(wellData()),
            ),
            allCasingData: computed((): CasingInfoViewModel[] | null =>
                allCasingData(wellData()),
            ),
            wwellTest: computed((): WwellTestViewModel | null =>
                selectWwellTestViewModel(wellData()),
            ),
            totalDepth: computed((): number => selectTotalDepth(wellData())),
            status: computed((): string => selectStatus(wellData())),
            area: computed((): string => selectArea(wellData()))
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
                                    // status: wellData.EXAD_GWD_DAILY_REMARKS?.[0].status,
                                    // area: wellData.EXAD_GWD_DAILY_REMARKS?.[0].area,
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
                    selectedDate: parseDateFromInput(date),
                    // Keep wellData and selectedEpANum alive so components stay stable during load
                })),
                switchMap(({ date, epANumOverride }) =>
                    svc.getWellList(date).pipe(
                        tapResponse({
                            next: (wellList) => {
                                const names = selectWellNamesFromList(wellList);

                                if (!wellList.length) {
                                    patchState(store, { wellList: [], listLoading: false, selectedEpANum: null, wellData: null });
                                    notify.info('Data is not available for the given date');
                                    return;
                                }

                                // Honour the requested epANum when it exists in the new list.
                                // Without this, the async arrival of the list always overwrote
                                // selectedEpANum with firstEntry, discarding the URL's well param.
                                const firstEntry = names[0];
                                const targetEpANum = (epANumOverride !== null && names.some(w => w.epANum === epANumOverride))
                                    ? epANumOverride
                                    : firstEntry?.epANum ?? null;
                                if (targetEpANum === null) {
                                    patchState(store, {
                                        wellList: [],
                                        listLoading: false,
                                        selectedEpANum: null,
                                        wellData: null,
                                        error: 'No valid wells were returned for the selected date',
                                    });
                                    return;
                                }
                                const page = selectPageIndexForEpANum(names, targetEpANum, 0);

                                patchState(store, {
                                    wellList,
                                    listLoading: false,
                                    selectedEpANum: targetEpANum,
                                    wellNamesPage: page,
                                });
                                console.log("Load List function in Store. I am calling loadDetail next")
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
            initialize(date?: string, epANumOverride?: number): void {
                console.log("Hi. I am initialize function")
                loadListAndAutoSelect({
                    date: date ?? formatDateForInput(store.selectedDate()),
                    epANumOverride: epANumOverride ?? null,
                });


            },
            loadWellNames(date?: string, epANumOverride?: number): void {
                console.log("Hi. I am loadWellNames function")
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
                console.log("Select Well function in Store. I am calling loadDetail next")
                loadDetail({ date, epANum });
            },

            setDate(date: string, options?: { autoSelectFirst?: boolean }): void {
                console.log("[Store] setDate function")
                // Preserve the active well across date changes so the same well stays
                // selected if it exists in the new date's list; falls back to first if not.
                const epANumOverride = options?.autoSelectFirst ? null : store.selectedEpANum();
                loadListAndAutoSelect({ date, epANumOverride });
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
                    console.log("Next Page function in Store. I am calling loadDetail next")
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
                    console.log("Previous Page function in Store. I am calling loadDetail next")
                    loadDetail({ date: formatDateForInput(store.selectedDate()), epANum: firstOnPage.epANum });
                }
            },

            setUiError(message: string | null): void {
                patchState(store, { error: message });
            },

            loadWaterWellTestResults(): void {
                return EMPTY as unknown as void;
            },

            setStatus(status: string): void {
                patchState(store, { status })
            },

            refreshWellDetail(): void {
                const epANum = store.selectedEpANum();
                const date = formatDateForInput(store.selectedDate());
                if (epANum == null) return;
                loadDetail({ date, epANum });
            },

        };
    }),
);
export type ActiveWwellStoreType = InstanceType<typeof ActiveWwellStore>;