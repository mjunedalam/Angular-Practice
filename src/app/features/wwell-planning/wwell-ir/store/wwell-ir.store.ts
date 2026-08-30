import { computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import { CreateIntegratedRequirementPayload, IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { mergeIrDetailBlocksIntoIntegratedRequirement } from '../wwell-ir-form/wwell-ir-detail-response.mapper';
import { WwellIrBulkSavePayload } from '../wwell-ir-form/wwell-ir-payload.model';
import { WwellIrService } from '../wwell-ir.service';
import { WwellIrStoreState, initialWwellIrState } from './wwell-ir.state';

/** Prefers the backend's own `{ message }` (see ApiResponse<T> — every exad_agwa endpoint here
 *  returns that envelope on both success and error) over Angular's generic "Http failure
 *  response for ..." text, so a specific backend validation error (e.g. an Oracle constraint
 *  message) reaches the user instead of a vague fallback. */
function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    const body: unknown = err.error;
    const backendMessage = body && typeof body === 'object' ? (body as { message?: unknown }).message : undefined;
    if (typeof backendMessage === 'string' && backendMessage) return backendMessage;
    return err.message || fallback;
  }
  return err instanceof Error ? err.message : fallback;
}

/** A repeat "Save as Draft" on the same IR reuses its ir_seq (see wwell-ir-payload.mapper.ts), so
 *  the response describes the *same* record, not a new one — replace it in place instead of
 *  prepending a duplicate. Falls back to prepend for a genuinely new IR (irSeq not seen yet). */
function upsertByIrSeq(list: readonly IntegratedRequirement[], created: IntegratedRequirement): IntegratedRequirement[] {
  const existingIndex = created.irSeq != null ? list.findIndex(item => item.irSeq === created.irSeq) : -1;
  if (existingIndex === -1) return [created, ...list];
  // `created` is rebuilt client-side from what was just submitted (see
  // WwellIrService.buildIrFromPayload) — it has no way to know the record's real approval chain
  // (that's a separate, still-mocked endpoint; see loadIrApprovalTimeline), so every resave mints
  // a brand new "just initiated" chain. Harmless for a first-time INSERT (nothing to preserve
  // yet), but a repeat save on an already-in-progress/approved record — including every single
  // inline section edit on the detail page — would otherwise wipe out its real chain state on
  // every save. Keep whichever chain this record already had.
  return list.map((item, index) => (index === existingIndex ? { ...created, chain: item.chain } : item));
}

export const WwellIrStore = signalStore(
  withState<WwellIrStoreState>(initialWwellIrState),

  withComputed(({ irsLoading, linkedRequestWells, linkedRequestWellsLoading, irsError, linkedRequestWellsError, createIrError, updateIrStatusError, irDetailError, irApprovalTimelineError }) => ({
    isLoading: computed(() => irsLoading() || linkedRequestWellsLoading()),
    /** Trimmed {value,label} view of linkedRequestWells for the "Link to Request" picker itself —
     *  see wwell-ir-editor.component.ts's `applyLinkedRequestWell` for where the full record
     *  (looked up from linkedRequestWells by this same value) drives the auto-populate. */
    linkedRequestWellOptions: computed(() => linkedRequestWells().map(well => ({ value: String(well.prewapSeq), label: well.wellName }))),
    activeErrors: computed(() =>
      [irsError(), linkedRequestWellsError(), createIrError(), updateIrStatusError(), irDetailError(), irApprovalTimelineError()].filter(
        (message): message is string => message !== null,
      ),
    ),
    hasError: computed(
      () =>
        irsError() !== null ||
        linkedRequestWellsError() !== null ||
        createIrError() !== null ||
        updateIrStatusError() !== null ||
        irDetailError() !== null ||
        irApprovalTimelineError() !== null,
    ),
  })),

  withMethods((store, svc = inject(WwellIrService)) => {
    const loadIrs = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { irsLoading: true, irsError: null })),
        switchMap(() =>
          svc.getIrs().pipe(
            tapResponse({
              next: irs => patchState(store, { irs, irsLoading: false }),
              error: (err: unknown) => patchState(store, { irsLoading: false, irsError: errorMessage(err, 'Failed to load integrated requirements') }),
            }),
          ),
        ),
      ),
    );

    const loadLinkedRequestWells = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { linkedRequestWellsLoading: true, linkedRequestWellsError: null })),
        switchMap(() =>
          svc.getEligibleWellsForIr().pipe(
            tapResponse({
              next: linkedRequestWells => patchState(store, { linkedRequestWells, linkedRequestWellsLoading: false }),
              error: (err: unknown) =>
                patchState(store, {
                  linkedRequestWellsLoading: false,
                  linkedRequestWellsError: errorMessage(err, 'Failed to load wells eligible for IR initiation'),
                }),
            }),
          ),
        ),
      ),
    );

    // Keyed by ir_seq (the real primary key once an IR is saved) — switchMap cancels a still-in-
    // flight fetch for a previously-selected row if the user picks another one before it resolves,
    // so a slow first response can never land after (and clobber) a faster later selection.
    const loadIrDetail = rxMethod<number>(
      pipe(
        tap(() => patchState(store, { irDetailLoading: true, irDetailError: null })),
        switchMap(irSeq =>
          svc.getIrDetailBlocks(irSeq).pipe(
            tapResponse({
              next: blocks => {
                const existing = store.irs().find(item => item.irSeq === irSeq);
                // Nothing to merge onto if the summary row isn't loaded (shouldn't happen from the
                // normal select-a-row flow) — just clear the loading flag and leave state as-is.
                if (!existing) {
                  patchState(store, { irDetailLoading: false });
                  return;
                }
                const merged = mergeIrDetailBlocksIntoIntegratedRequirement(existing, blocks);
                patchState(store, { irs: upsertByIrSeq(store.irs(), merged), irDetailLoading: false });
              },
              error: (err: unknown) =>
                patchState(store, { irDetailLoading: false, irDetailError: errorMessage(err, 'Failed to load integrated requirement detail') }),
            }),
          ),
        ),
      ),
    );

    // Fires right after a save settles (see createIr below) to replace the client-side optimistic
    // echo (WwellIrService.buildIrFromPayload — built from what was *submitted*, not what the
    // database actually stored: server-computed defaults, triggers, or a concurrent edit would all
    // be invisible until this runs) with the real persisted row. Deliberately does not touch
    // `irDetailLoading` — unlike loadIrDetail above, it must never flip WwellIrComponent's
    // `isSelecting()` (which swaps the whole detail panel for a loading skeleton): the user just
    // watched this exact record save, so re-showing it as a blank loading state a moment later
    // would be jarring, not reassuring. A failure here is silent by design — the save itself
    // already succeeded and is already reflected via the optimistic echo, so a background refresh
    // hiccup shouldn't surface as if the save had failed.
    const refreshIrDetail = rxMethod<number>(
      pipe(
        switchMap(irSeq =>
          svc.getIrDetailBlocks(irSeq).pipe(
            tapResponse({
              next: blocks => {
                const existing = store.irs().find(item => item.irSeq === irSeq);
                if (!existing) return;
                const merged = mergeIrDetailBlocksIntoIntegratedRequirement(existing, blocks);
                patchState(store, { irs: upsertByIrSeq(store.irs(), merged) });
              },
              error: () => undefined,
            }),
          ),
        ),
      ),
    );

    // Separate call from loadIrDetail above — mirrors the future real API shape (approval process
    // gets its own endpoint), mocked client-side in the meantime. Same switchMap-cancels-a-stale-
    // fetch reasoning applies when the selection changes quickly.
    const loadIrApprovalTimeline = rxMethod<number>(
      pipe(
        tap(() => patchState(store, { irApprovalTimelineLoading: true, irApprovalTimelineError: null })),
        switchMap(irSeq =>
          svc.getIrApprovalTimeline(irSeq).pipe(
            tapResponse({
              next: chain => {
                patchState(store, {
                  irs: store.irs().map(item => (item.irSeq === irSeq ? { ...item, chain } : item)),
                  irApprovalTimelineLoading: false,
                });
              },
              error: (err: unknown) =>
                patchState(store, { irApprovalTimelineLoading: false, irApprovalTimelineError: errorMessage(err, 'Failed to load approval timeline') }),
            }),
          ),
        ),
      ),
    );

    return {
      loadIrs(): void {
        loadIrs();
      },

      loadIrDetail(irSeq: number): void {
        loadIrDetail(irSeq);
      },

      loadIrApprovalTimeline(irSeq: number): void {
        loadIrApprovalTimeline(irSeq);
      },

      loadLinkedRequestWells(): void {
        loadLinkedRequestWells();
      },

      createIr(
        payload: CreateIntegratedRequirementPayload,
        irBulkPayload: WwellIrBulkSavePayload,
        attachmentNames: readonly string[] = [],
      ): void {
        patchState(store, { creatingIr: true, createIrError: null });
        svc.createIr(payload, irBulkPayload, attachmentNames).subscribe({
          next: created => {
            patchState(store, {
              irs: upsertByIrSeq(store.irs(), created),
              // Falls back to whatever was already known so an UPDATE response missing irSeq never clears it.
              draftIrSeq: created.irSeq ?? store.draftIrSeq(),
              creatingIr: false,
            });
            // Every save (create or update) immediately shows the optimistic echo above, then
            // quietly swaps in the real persisted row once it lands — see refreshIrDetail's own
            // comment for why this never blocks or reloads the visible UI.
            if (created.irSeq != null) refreshIrDetail(created.irSeq);
          },
          error: (err: unknown) => patchState(store, { creatingIr: false, createIrError: errorMessage(err, 'Failed to create integrated requirement') }),
        });
      },

      submitIrForReview(ir: IntegratedRequirement): void {
        patchState(store, { updatingIrStatus: true, updateIrStatusError: null });
        svc.submitIrForReview(ir).subscribe({
          next: updated => patchState(store, { irs: store.irs().map(item => (item.id === updated.id ? updated : item)), updatingIrStatus: false }),
          error: (err: unknown) =>
            patchState(store, { updatingIrStatus: false, updateIrStatusError: errorMessage(err, 'Failed to submit integrated requirement for review') }),
        });
      },
    };
  }),
);
