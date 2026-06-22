import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { forkJoin, pipe, switchMap, tap } from 'rxjs';

import { MorningReport } from '@models/morning-report/morning-report.model';
import { WaterWellTestResult } from 'src/app/shared/models/wwell/wwell-test-result.model';
import { WwellTestViewModel } from '@models/active-wwell/active-wwell-view.model';
import { DailyOperationService } from '@services/daily-operation.service';
import {
    DEFAULT_NOTIFICATION_DURATION_MS,
    NotificationService,
} from '@shared/components/notification/notification.service';
import { parseDateFromInput } from 'src/app/shared/utils/date.util';
import {
    selectMorningReports,
    selectWaterWellTestResultsFromData,
    selectWwellTestViewModels,
} from 'src/app/core/store/shared/well-data.selectors';
import { MorningReportStoreState, initialMorningReportState } from './morning-report.state';

export const MorningReportStore = signalStore(
    withState<MorningReportStoreState>(initialMorningReportState),

    withComputed(({ allWellsData, listLoading, detailLoading, error }) => ({
        morningReport: computed((): MorningReport[] =>
            selectMorningReports(allWellsData()),
        ),
        waterWellTestResult: computed((): WaterWellTestResult[] =>
            selectWaterWellTestResultsFromData(allWellsData()),
        ),
        wwellTestViewModels: computed((): readonly (WwellTestViewModel & { readonly wellName: string })[] =>
            selectWwellTestViewModels(allWellsData()),
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
                    // Reset detailLoading so the spinner doesn't stick if a date change interrupts
                    // an in-flight detail fetch (switchMap cancels the request but leaves the flag true).
                    detailLoading: false,
                    error: null,
                    // Keep allWellsData/wellList intact so the old cards stay visible (dimmed)
                    // while the new date loads — clearing them here caused a visible blink.
                    selectedDate: parseDateFromInput(date),
                })),
                switchMap(date =>
                    svc.getWellList(date).pipe(
                        tapResponse({
                            next: (wellList) => {
                                if (!wellList.length) {
                                    patchState(store, { wellList: [], allWellsData: [], listLoading: false });
                                    notify.info('Data is not available for the given date');
                                    return;
                                }

                                patchState(store, { wellList, listLoading: false, detailLoading: true });

                                const detail$ = forkJoin(wellList.map(w => svc.getWellDetail(date, w.epANum)));

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
