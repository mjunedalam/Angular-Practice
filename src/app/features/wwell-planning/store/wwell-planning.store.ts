import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { ApprovalDecision, CreateWwellPlanningRequestPayload } from '@models/wwell-planning/wwell-planning.model';
import { WwellPlanningService } from '../wwell-planning.service';
import { WwellPlanningStoreState, initialWwellPlanningState } from './wwell-planning.state';

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export const WwellPlanningStore = signalStore(
  withState<WwellPlanningStoreState>(initialWwellPlanningState),

  withComputed(({ approvals, requestsLoading, approvalsLoading, integratedRequirementsLoading, error }) => ({
    isLoading: computed(() => requestsLoading() || approvalsLoading() || integratedRequirementsLoading()),
    hasError: computed(() => error() !== null),
    pendingApprovalsCount: computed(() => approvals().filter(a => a.decision === 'pending').length),
  })),

  withMethods((store, svc = inject(WwellPlanningService)) => {
    const loadRequests = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { requestsLoading: true, error: null })),
        switchMap(() =>
          svc.getRequests().pipe(
            tapResponse({
              next: requests => patchState(store, { requests, requestsLoading: false }),
              error: (err: unknown) =>
                patchState(store, { requestsLoading: false, error: errorMessage(err, 'Failed to load requests') }),
            }),
          ),
        ),
      ),
    );

    const loadApprovals = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { approvalsLoading: true, error: null })),
        switchMap(() =>
          svc.getApprovals().pipe(
            tapResponse({
              next: approvals => patchState(store, { approvals, approvalsLoading: false }),
              error: (err: unknown) =>
                patchState(store, { approvalsLoading: false, error: errorMessage(err, 'Failed to load approvals') }),
            }),
          ),
        ),
      ),
    );

    const loadIntegratedRequirements = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { integratedRequirementsLoading: true, error: null })),
        switchMap(() =>
          svc.getIntegratedRequirements().pipe(
            tapResponse({
              next: integratedRequirements => patchState(store, { integratedRequirements, integratedRequirementsLoading: false }),
              error: (err: unknown) =>
                patchState(store, {
                  integratedRequirementsLoading: false,
                  error: errorMessage(err, 'Failed to load integrated requirements'),
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

      decideApproval(approvalId: string, decision: ApprovalDecision, comments: string | null = null): void {
        svc.decideApproval(approvalId, decision, comments).subscribe({
          next: updated =>
            patchState(store, {
              approvals: store.approvals().map(a => (a.id === updated.id ? updated : a)),
            }),
          error: (err: unknown) => patchState(store, { error: errorMessage(err, 'Failed to update approval') }),
        });
      },

      createRequest(payload: CreateWwellPlanningRequestPayload, files: readonly File[] = []): void {
        patchState(store, { creatingRequest: true, error: null });
        svc.createRequest(payload, files).subscribe({
          next: created =>
            patchState(store, {
              requests: [created, ...store.requests()],
              creatingRequest: false,
            }),
          error: (err: unknown) =>
            patchState(store, { creatingRequest: false, error: errorMessage(err, 'Failed to create request') }),
        });
      },

      setUiError(message: string | null): void {
        patchState(store, { error: message });
      },
    };
  }),
);
