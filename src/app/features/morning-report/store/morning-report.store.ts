import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { forkJoin, of, pipe, switchMap, tap } from 'rxjs';

import { MorningReport } from '@models/morning-report/morning-report.model';
import { WaterWellTestResult } from 'src/app/shared/models/wwell/wwell-test-result.model';
import { DailyOperationService } from '@services/daily-operation.service';
import {
    DEFAULT_NOTIFICATION_DURATION_MS,
    NotificationService,
} from '@shared/components/notification/notification.service';
import { formatDateForInput, parseDateFromInput } from 'src/app/shared/utils/date.util';
import {
    selectMorningReports,
    selectWaterWellTestResultsFromData,
} from 'src/app/core/store/shared/well-data.selectors';
import { updateRigStatusOverrides } from 'src/app/core/store/shared/well-data.state';
import { MorningReportStoreState, initialMorningReportState } from './morning-report.state';

export const MorningReportStore = signalStore(
    withState<MorningReportStoreState>(initialMorningReportState),

    withComputed(({ allWellsData, rigStatusOverrides, listLoading, detailLoading, error }) => ({
        morningReport: computed((): MorningReport[] =>
            selectMorningReports(allWellsData(), rigStatusOverrides()),
        ),
        waterWellTestResult: computed((): WaterWellTestResult[] =>
            selectWaterWellTestResultsFromData(allWellsData()),
        ),
        isLoading: computed(() => listLoading() || detailLoading()),
        hasError: computed(() => error() !== null),
        errorMessage: computed(() => error() ?? ''),
        statusCode: computed(() =>
            listLoading() || detailLoading() ? 0 : allWellsData().length > 0 ? 200 : 404,
        ),
    })),

    withMethods((
        store,
        svc = inject(DailyOperationService),
        notify = inject(NotificationService),
    ) => {
        const loadReport = rxMethod<string>(
            pipe(
                tap(date => patchState(store, {
                    listLoading: true,
                    error: null,
                    allWellsData: [],
                    selectedDate: parseDateFromInput(date),
                })),
                switchMap(date =>
                    svc.getWellList(date).pipe(
                        tapResponse({
                            next: (wellList) => {
                                if (!wellList.length) {
                                    patchState(store, { wellList: [], listLoading: false });
                                    notify.info('Data is not available for the given date');
                                    return;
                                }

                                patchState(store, { wellList, listLoading: false, detailLoading: true });

                                const detail$ = wellList.length
                                    ? forkJoin(wellList.map(w => svc.getWellDetail(date, w.epANum)))
                                    : of([]);

                                detail$.pipe(
                                    tapResponse({
                                        next: (allWellsData) => {
                                            patchState(store, { allWellsData, detailLoading: false });
                                        },
                                        error: (err: Error) => {
                                            patchState(store, {
                                                detailLoading: false,
                                                error: err.message ?? 'Failed to load well details',
                                            });
                                        },
                                    }),
                                ).subscribe();
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
            loadMorningReportData(date: string): void {
                loadReport(date);
            },

            setDate(date: string): void {
                loadReport(date);
            },

            updateRigStatus(epANum: number | string, rigStatus: string): void {
                patchState(store, {
                    rigStatusOverrides: updateRigStatusOverrides(
                        store.rigStatusOverrides(),
                        epANum,
                        rigStatus,
                    ),
                });
            },

            setUiError(message: string | null): void {
                patchState(store, { error: message });
            },

            setNotificationDuration(durationMs: number): void {
                const normalized = Math.max(1000, Math.floor(durationMs));
                patchState(store, { notificationDurationMs: normalized });
                notify.setDefaultDuration(normalized);
            },

            loadWaterWellTestResults(): void { /* data already loaded via loadMorningReportData */ },

            resetToDefaultDuration(): void {
                patchState(store, { notificationDurationMs: DEFAULT_NOTIFICATION_DURATION_MS });
                notify.setDefaultDuration(DEFAULT_NOTIFICATION_DURATION_MS);
            },
        };
    }),
);
