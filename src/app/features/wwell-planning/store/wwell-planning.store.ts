import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { forkJoin, pipe, switchMap, tap } from 'rxjs';
import {
  CreateIntegratedRequirementPayload,
  CreateIrApprovalPayload,
  CreateLandAffairsApprovalPayload,
  CreateWldaApprovalPayload,
  CreateWwellPlanningRequestPayload,
} from '@models/wwell-planning/wwell-planning.model';
import { WwellPlanningService } from '../wwell-planning.service';
import { WwellPlanningStoreState, initialWwellPlanningState } from './wwell-planning.state';

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export const WwellPlanningStore = signalStore(
  withState<WwellPlanningStoreState>(initialWwellPlanningState),

  withComputed(
    ({
      requestsLoading,
      approvalsLoading,
      integratedRequirementsLoading,
      requestsError,
      approvalsError,
      integratedRequirementsError,
      createRequestError,
      createIntegratedRequirementError,
      createApprovalError,
    }) => ({
      isLoading: computed(() => requestsLoading() || approvalsLoading() || integratedRequirementsLoading()),
      activeErrors: computed(() =>
        [
          requestsError(),
          approvalsError(),
          integratedRequirementsError(),
          createRequestError(),
          createIntegratedRequirementError(),
          createApprovalError(),
        ].filter((message): message is string => message !== null),
      ),
      hasError: computed(
        () =>
          requestsError() !== null ||
          approvalsError() !== null ||
          integratedRequirementsError() !== null ||
          createRequestError() !== null ||
          createIntegratedRequirementError() !== null ||
          createApprovalError() !== null,
      ),
    }),
  ),

  withMethods((store, svc = inject(WwellPlanningService)) => {
    const loadRequests = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { requestsLoading: true, requestsError: null })),
        switchMap(() =>
          svc.getRequests().pipe(
            tapResponse({
              next: requests => patchState(store, { requests, requestsLoading: false }),
              error: (err: unknown) =>
                patchState(store, { requestsLoading: false, requestsError: errorMessage(err, 'Failed to load requests') }),
            }),
          ),
        ),
      ),
    );

    const loadApprovals = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { approvalsLoading: true, approvalsError: null })),
        switchMap(() =>
          forkJoin({
            wldaApprovals: svc.getWldaApprovals(),
            landAffairsApprovals: svc.getLandAffairsApprovals(),
            irApprovals: svc.getIrApprovals(),
          }).pipe(
            tapResponse({
              next: result => patchState(store, { ...result, approvalsLoading: false }),
              error: (err: unknown) =>
                patchState(store, { approvalsLoading: false, approvalsError: errorMessage(err, 'Failed to load approvals') }),
            }),
          ),
        ),
      ),
    );

    const loadIntegratedRequirements = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { integratedRequirementsLoading: true, integratedRequirementsError: null })),
        switchMap(() =>
          svc.getIntegratedRequirements().pipe(
            tapResponse({
              next: integratedRequirements => patchState(store, { integratedRequirements, integratedRequirementsLoading: false }),
              error: (err: unknown) =>
                patchState(store, {
                  integratedRequirementsLoading: false,
                  integratedRequirementsError: errorMessage(err, 'Failed to load integrated requirements'),
                }),
            }),
          ),
        ),
      ),
    );

    return {
      loadRequests(): void {
        loadRequests();
      },

      loadApprovals(): void {
        loadApprovals();
      },

      loadIntegratedRequirements(): void {
        loadIntegratedRequirements();
      },

      createRequest(payload: CreateWwellPlanningRequestPayload, files: readonly File[] = []): void {
        patchState(store, { creatingRequest: true, createRequestError: null });
        svc.createRequest(payload, files).subscribe({
          next: created =>
            patchState(store, {
              requests: [created, ...store.requests()],
              creatingRequest: false,
            }),
          error: (err: unknown) =>
            patchState(store, { creatingRequest: false, createRequestError: errorMessage(err, 'Failed to create request') }),
        });
      },

      createIntegratedRequirement(payload: CreateIntegratedRequirementPayload): void {
        patchState(store, { creatingIntegratedRequirement: true, createIntegratedRequirementError: null });
        svc.createIntegratedRequirement(payload).subscribe({
          next: created =>
            patchState(store, {
              integratedRequirements: [created, ...store.integratedRequirements()],
              creatingIntegratedRequirement: false,
            }),
          error: (err: unknown) =>
            patchState(store, {
              creatingIntegratedRequirement: false,
              createIntegratedRequirementError: errorMessage(err, 'Failed to create integrated requirement'),
            }),
        });
      },

      submitWldaApproval(payload: CreateWldaApprovalPayload, files: readonly File[] = []): void {
        patchState(store, { creatingApproval: true, createApprovalError: null });
        svc.createWldaApproval(payload, files).subscribe({
          next: created =>
            patchState(store, {
              wldaApprovals: [created, ...store.wldaApprovals()],
              creatingApproval: false,
            }),
          error: (err: unknown) =>
            patchState(store, {
              creatingApproval: false,
              createApprovalError: errorMessage(err, 'Failed to submit WLDA approval request'),
            }),
        });
      },

      submitLandAffairsApproval(payload: CreateLandAffairsApprovalPayload, files: readonly File[] = []): void {
        patchState(store, { creatingApproval: true, createApprovalError: null });
        svc.createLandAffairsApproval(payload, files).subscribe({
          next: created =>
            patchState(store, {
              landAffairsApprovals: [created, ...store.landAffairsApprovals()],
              creatingApproval: false,
            }),
          error: (err: unknown) =>
            patchState(store, {
              creatingApproval: false,
              createApprovalError: errorMessage(err, 'Failed to submit Land Affairs approval request'),
            }),
        });
      },

      submitIrApproval(payload: CreateIrApprovalPayload, files: readonly File[] = []): void {
        patchState(store, { creatingApproval: true, createApprovalError: null });
        svc.createIrApproval(payload, files).subscribe({
          next: created =>
            patchState(store, {
              irApprovals: [created, ...store.irApprovals()],
              creatingApproval: false,
            }),
          error: (err: unknown) =>
            patchState(store, {
              creatingApproval: false,
              createApprovalError: errorMessage(err, 'Failed to submit IR approval request'),
            }),
        });
      },
    };
  }),
);
