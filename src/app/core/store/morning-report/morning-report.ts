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
import { pipe, switchMap, tap, timer } from 'rxjs';

import { MorningReport } from 'src/app/core/models/morning-report/morning-report.model';
import { MorningReportService } from 'src/app/core/services/morning-report.service';
import { ApiResponse } from 'src/app/shared/models/wwell/api-response.model';
import { WaterWellTestResult } from 'src/app/shared/models/wwell/wwell-test-result.model';

interface MorningReportState {
  readonly morningReport: MorningReport[];
  readonly waterWellTestResults: ApiResponse<WaterWellTestResult>;
  readonly loading: boolean;
  readonly waterWellTestResultsLoading: boolean;
  readonly uiError: string | null;
}

const initialWaterWellTestResults: ApiResponse<WaterWellTestResult> = {
  statusCode: 0,
  error: false,
  message: '',
  data: [],
};

const initialState: MorningReportState = {
  morningReport: [],
  waterWellTestResults: initialWaterWellTestResults,
  loading: true,
  waterWellTestResultsLoading: false,
  uiError: null,
};

const SKELETON_PREVIEW_DELAY_MS = 1200;

export const MorningReportStore = signalStore(
  { providedIn: 'root' },
  withState<MorningReportState>(initialState),
  withComputed(({ morningReport, waterWellTestResults, uiError }) => ({
    hasError: computed(() => waterWellTestResults().error),
    errorMessage: computed(() => waterWellTestResults().message),
    waterWelltestResult: computed(() => waterWellTestResults().data),
    statusCode: computed(() => waterWellTestResults().statusCode),
    reportCount: computed(() => morningReport().length),
    uiErrorMessage: computed(() => uiError()),
  })),
  withMethods((store, morningReportService = inject(MorningReportService)) => {
    const loadMorningReportData = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { loading: true, uiError: null })),
        switchMap(() =>
          timer(SKELETON_PREVIEW_DELAY_MS).pipe(
            switchMap(() =>
              morningReportService.getMorningReport().pipe(
                tapResponse({
                  next: (reports) => {
                    patchState(store, {
                      morningReport: reports,
                      loading: false,
                    });
                  },
                  error: (error: Error) => {
                    patchState(store, {
                      loading: false,
                      uiError: error.message || 'Failed to load Morning Report',
                    });
                  },
                }),
              ),
            ),
          ),
        ),
      ),
    );

    const loadWaterWellTestResults = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { waterWellTestResultsLoading: true })),
        switchMap(() =>
          timer(SKELETON_PREVIEW_DELAY_MS).pipe(
            switchMap(() =>
              morningReportService.getWaterWellTestResultData().pipe(
                tapResponse({
                  next: (waterWellTestResults) => {
                    patchState(store, {
                      waterWellTestResults,
                      waterWellTestResultsLoading: false,
                    });
                  },
                  error: (error: { status?: number; message?: string }) => {
                    patchState(store, {
                      waterWellTestResults: {
                        statusCode: error.status ?? 0,
                        error: true,
                        message: error.message ?? 'Failed to load water well test results',
                        data: [],
                      },
                      waterWellTestResultsLoading: false,
                    });
                  },
                }),
              ),
            ),
          ),
        ),
      ),
    );

    return {
      loadMorningReportData,
      loadWaterWellTestResults,
      updateRigStatus(index: number, rigStatus: string): void {
        patchState(store, {
          morningReport: store.morningReport().map((report, reportIndex) =>
            reportIndex === index ? { ...report, rigStatus } : report,
          ),
        });
      },
      setUiError(message: string | null): void {
        patchState(store, { uiError: message });
      },
    };
  }),
);
