import { computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { catchError, forkJoin, map, Observable, of, pipe, switchMap, tap } from 'rxjs';

import { IWellData } from '@models/well-design/well-data.model';
import { MorningReport, WellFetchFailure } from '@models/morning-report/morning-report.model';
import { WwellEntry } from '@models/daily-operation/wwell-entry.model';
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

/** Well detail failure notifications stay up longer than routine toasts so users have time to read which wells failed. */
const FAILED_WELLS_NOTIFICATION_DURATION_MS = 15_000;

interface WellDetailOutcome {
    readonly epANum: number;
    readonly wellName: string;
    readonly data: IWellData | null;
    readonly failureReason: string | null;
}

function describeWellDetailError(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
        return `status ${err.status || 'unknown'}${err.statusText ? ` (${err.statusText})` : ''}`;
    }
    if (err instanceof Error) return err.message;
    return 'Unknown error';
}

function fetchWellDetail(
    svc: DailyOperationService,
    date: string,
    well: WwellEntry,
): Observable<WellDetailOutcome> {
    return svc.getWellDetail(date, well.epANum).pipe(
        map((data): WellDetailOutcome =>
            data
                ? { epANum: well.epANum, wellName: well.wGnrName, data, failureReason: null }
                : { epANum: well.epANum, wellName: well.wGnrName, data: null, failureReason: 'No data returned' },
        ),
        catchError((err: unknown) =>
            of<WellDetailOutcome>({
                epANum: well.epANum,
                wellName: well.wGnrName,
                data: null,
                failureReason: describeWellDetailError(err),
            }),
        ),
    );
}

interface WellBatchResult {
    readonly wellList: WwellEntry[];
    readonly outcomes: readonly WellDetailOutcome[];
}

function fetchWellBatch(svc: DailyOperationService, date: string, wellList: WwellEntry[]): Observable<WellBatchResult> {
    if (!wellList.length) return of({ wellList, outcomes: [] });
    return forkJoin(wellList.map(w => fetchWellDetail(svc, date, w))).pipe(
        map((outcomes): WellBatchResult => ({ wellList, outcomes })),
    );
}

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
                    failedWells: [],
                    // Keep allWellsData/wellList intact so the old cards stay visible (dimmed)
                    // while the new date loads — clearing them here caused a visible blink.
                    selectedDate: parseDateFromInput(date),
                })),
                switchMap(date =>
                    svc.getWellList(date).pipe(
                        tap(wellList => {
                            if (wellList.length) patchState(store, { wellList, listLoading: false, detailLoading: true });
                        }),
                        // Each well is fetched and caught independently so one bad/erroring well can
                        // never abort the rest — mirrors Promise.allSettled semantics. Composing this
                        // as part of the same switchMap chain (rather than a nested manual .subscribe())
                        // ensures a fast date change properly cancels any still-pending detail requests.
                        switchMap(wellList => fetchWellBatch(svc, date, wellList)),
                        tapResponse({
                            next: ({ wellList, outcomes }) => {
                                if (!wellList.length) {
                                    patchState(store, { wellList: [], allWellsData: [], failedWells: [], listLoading: false });
                                    notify.info('Data is not available for the given date');
                                    return;
                                }

                                const allWellsData = outcomes.flatMap(o => o.data ? [o.data] : []);
                                const failedWells: WellFetchFailure[] = outcomes
                                    .filter(o => o.data === null)
                                    .map(o => ({
                                        epANum: o.epANum,
                                        wellName: o.wellName,
                                        reason: o.failureReason ?? 'Unknown error',
                                    }));

                                patchState(store, { allWellsData, detailLoading: false, failedWells });

                                if (failedWells.length > 0) {
                                    console.error('[MorningReportStore] Failed to load well detail for:', failedWells);
                                    const idList = failedWells
                                        .map(f => `#${f.epANum}${f.wellName ? ` (${f.wellName})` : ''}`)
                                        .join(', ');
                                    notify.error(
                                        `Failed to load data for Well(s): ${idList}`,
                                        { durationMs: FAILED_WELLS_NOTIFICATION_DURATION_MS },
                                    );
                                }
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
