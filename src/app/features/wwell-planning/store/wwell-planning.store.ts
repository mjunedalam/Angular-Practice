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
import { mergeIrDetailBlocksIntoIntegratedRequirement } from '../wwell-ir/wwell-ir-form/wwell-ir-detail-response.mapper';
import { WwellIrBulkSavePayload } from '../wwell-ir/wwell-ir-form/wwell-ir-payload.model';
import { WwellPlanningService } from '../wwell-planning.service';
import { WwellPlanningStoreState, initialWwellPlanningState } from './wwell-planning.state';

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

/** A repeat "Save as Draft" on the same IR reuses its ir_seq (see wwell-ir-payload.mapper.ts), so
 *  the response describes the *same* record, not a new one — replace it in place instead of
 *  prepending a duplicate. Falls back to prepend for a genuinely new IR (irSeq not seen yet). */
function upsertByIrSeq(list: readonly IntegratedRequirement[], created: IntegratedRequirement): IntegratedRequirement[] {
  const existingIndex = created.irSeq != null ? list.findIndex(item => item.irSeq === created.irSeq) : -1;
  if (existingIndex === -1) return [created, ...list];
  return list.map((item, index) => (index === existingIndex ? created : item));
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
      integratedRequirementDetailError,
      integratedRequirementApprovalTimelineError,
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
          integratedRequirementDetailError(),
          integratedRequirementApprovalTimelineError(),
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
          updateIntegratedRequirementStatusError() !== null ||
          integratedRequirementDetailError() !== null ||
          integratedRequirementApprovalTimelineError() !== null,
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

    // Keyed by ir_seq (the real primary key once an IR is saved) — switchMap cancels a still-in-
    // flight fetch for a previously-selected row if the user picks another one before it resolves,
    // so a slow first response can never land after (and clobber) a faster later selection.
    const loadIntegratedRequirementDetail = rxMethod<number>(
      pipe(
        tap(() => patchState(store, { integratedRequirementDetailLoading: true, integratedRequirementDetailError: null })),
        switchMap(irSeq =>
          svc.getIntegratedRequirementDetailBlocks(irSeq).pipe(
            tapResponse({
              next: blocks => {
                const existing = store.integratedRequirements().find(item => item.irSeq === irSeq);
                // Nothing to merge onto if the summary row isn't loaded (shouldn't happen from the
                // normal select-a-row flow) — just clear the loading flag and leave state as-is.
                if (!existing) {
                  patchState(store, { integratedRequirementDetailLoading: false });
                  return;
                }
                const merged = mergeIrDetailBlocksIntoIntegratedRequirement(existing, blocks);
                patchState(store, {
                  integratedRequirements: upsertByIrSeq(store.integratedRequirements(), merged),
                  integratedRequirementDetailLoading: false,
                });
              },
              error: (err: unknown) =>
                patchState(store, {
                  integratedRequirementDetailLoading: false,
                  integratedRequirementDetailError: errorMessage(err, 'Failed to load integrated requirement detail'),
                }),
            }),
          ),
        ),
      ),
    );

    // Separate call from loadIntegratedRequirementDetail above — mirrors the future real API
    // shape (approval process gets its own endpoint), mocked client-side in the meantime. Same
    // switchMap-cancels-a-stale-fetch reasoning applies when the selection changes quickly.
    const loadIntegratedRequirementApprovalTimeline = rxMethod<number>(
      pipe(
        tap(() =>
          patchState(store, { integratedRequirementApprovalTimelineLoading: true, integratedRequirementApprovalTimelineError: null }),
        ),
        switchMap(irSeq =>
          svc.getIntegratedRequirementApprovalTimeline(irSeq).pipe(
            tapResponse({
              next: chain => {
                patchState(store, {
                  integratedRequirements: store.integratedRequirements().map(item => (item.irSeq === irSeq ? { ...item, chain } : item)),
                  integratedRequirementApprovalTimelineLoading: false,
                });
              },
              error: (err: unknown) =>
                patchState(store, {
                  integratedRequirementApprovalTimelineLoading: false,
                  integratedRequirementApprovalTimelineError: errorMessage(err, 'Failed to load approval timeline'),
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

      loadIntegratedRequirementDetail(irSeq: number): void {
        loadIntegratedRequirementDetail(irSeq);
      },

      loadIntegratedRequirementApprovalTimeline(irSeq: number): void {
        loadIntegratedRequirementApprovalTimeline(irSeq);
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

      createIntegratedRequirement(
        payload: CreateIntegratedRequirementPayload,
        irBulkPayload: WwellIrBulkSavePayload,
        files: readonly File[] = [],
      ): void {
        patchState(store, { creatingIntegratedRequirement: true, createIntegratedRequirementError: null });
        svc.createIntegratedRequirement(payload, irBulkPayload, files).subscribe({
          next: created =>
            patchState(store, {
              integratedRequirements: upsertByIrSeq(store.integratedRequirements(), created),
              // Falls back to whatever was already known so an UPDATE response missing irSeq never clears it.
              draftIrSeq: created.irSeq ?? store.draftIrSeq(),
              creatingIntegratedRequirement: false,
            }),
          error: (err: unknown) =>
            patchState(store, {
              creatingIntegratedRequirement: false,
              createIntegratedRequirementError: errorMessage(err, 'Failed to create integrated requirement'),
            }),
        });
      },

      /** Call when a fresh "new IR" session starts, so it never inherits a previous draft's ir_seq. */
      resetIntegratedRequirementDraft(): void {
        patchState(store, { draftIrSeq: null });
      },

      /** Call when the wizard opens in edit mode for an existing IR — makes every Save/Submit on
       *  that visit issue an UPDATE against this ir_seq instead of an INSERT. */
      startEditingIntegratedRequirement(irSeq: number): void {
        patchState(store, { draftIrSeq: irSeq });
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
