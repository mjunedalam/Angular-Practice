import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import {
  CreateIntegratedRequirementPayload,
  CreateLandAffairsApprovalPayload,
  CreateWldaApprovalPayload,
  CreateWwellPlanningRequestPayload,
  IntegratedRequirement,
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
      updateIntegratedRequirementStatusError,
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
          updateIntegratedRequirementStatusError(),
        ].filter((message): message is string => message !== null),
      ),
      hasError: computed(
        () =>
          requestsError() !== null ||
          approvalsError() !== null ||
          integratedRequirementsError() !== null ||
          createRequestError() !== null ||
          createIntegratedRequirementError() !== null ||
          createApprovalError() !== null ||
          updateIntegratedRequirementStatusError() !== null,
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

    const loadWldaApprovals = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { approvalsLoading: true, approvalsError: null })),
        switchMap(() =>
          svc.getWldaApprovals().pipe(
            tapResponse({
              next: wldaApprovals => patchState(store, { wldaApprovals, approvalsLoading: false }),
              error: (err: unknown) =>
                patchState(store, {
                  approvalsLoading: false,
                  approvalsError: errorMessage(err, 'Failed to load WLDA approvals'),
                }),
            }),
          ),
        ),
      ),
    );

    const loadLandAffairsApprovals = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { approvalsLoading: true, approvalsError: null })),
        switchMap(() =>
          svc.getLandAffairsApprovals().pipe(
            tapResponse({
              next: landAffairsApprovals => patchState(store, { landAffairsApprovals, approvalsLoading: false }),
              error: (err: unknown) =>
                patchState(store, {
                  approvalsLoading: false,
                  approvalsError: errorMessage(err, 'Failed to load Land Affairs approvals'),
                }),
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

      loadWldaApprovals(): void {
        loadWldaApprovals();
      },

      loadLandAffairsApprovals(): void {
        loadLandAffairsApprovals();
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

      createIntegratedRequirement(payload: CreateIntegratedRequirementPayload, files: readonly File[] = []): void {
        patchState(store, { creatingIntegratedRequirement: true, createIntegratedRequirementError: null });
        svc.createIntegratedRequirement(payload, files).subscribe({
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

      submitIntegratedRequirementForReview(ir: IntegratedRequirement): void {
        patchState(store, { updatingIntegratedRequirementStatus: true, updateIntegratedRequirementStatusError: null });
        svc.submitIntegratedRequirementForReview(ir).subscribe({
          next: updated =>
            patchState(store, {
              integratedRequirements: store.integratedRequirements().map(item => (item.id === updated.id ? updated : item)),
              updatingIntegratedRequirementStatus: false,
            }),
          error: (err: unknown) =>
            patchState(store, {
              updatingIntegratedRequirementStatus: false,
              updateIntegratedRequirementStatusError: errorMessage(err, 'Failed to submit integrated requirement for review'),
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
    };
  }),
);
