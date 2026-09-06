import { computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { catchError, delay, map, of, pipe, switchMap, tap } from 'rxjs';
import { CreateIntegratedRequirementPayload, IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import {
  WWELL_DELETE_DELAY_MS,
  WWELL_SAVE_DELAY_MS,
  WWELL_UPDATE_DELAY_MS,
} from '@models/wwell-planning/wwell-planning-loading.constants';
import { mergeIrDetailBlocksIntoIntegratedRequirement } from '../wwell-ir-form/wwell-ir-detail-response.mapper';
import { buildIntegratedRequirementFromPayload } from '../wwell-ir-form/wwell-ir-draft.util';
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
  // A brand-new record's `created` (see createIr's own buildIntegratedRequirementFromPayload
  // fallback) has no way to know the record's real approval chain (that's a separate, still-mocked
  // endpoint; see loadIrApprovalTimeline), so it always starts a fresh "just initiated" chain.
  // Harmless for a first-time INSERT (nothing to preserve yet), but would otherwise wipe out an
  // already-in-progress/approved record's real chain on every subsequent save. Keep whichever
  // chain this record already had.
  return list.map((item, index) => (index === existingIndex ? { ...created, chain: item.chain } : item));
}

export const WwellIrStore = signalStore(
  withState<WwellIrStoreState>(initialWwellIrState),

  withComputed(
    ({
      irsLoading,
      linkedRequestWells,
      linkedRequestWellsLoading,
      gwdOpsMembers,
      irsError,
      linkedRequestWellsError,
      gwdOpsMembersError,
      createIrError,
      updateIrStatusError,
      irDetailError,
      irApprovalTimelineError,
      deleteIrError,
    }) => ({
      isLoading: computed(() => irsLoading() || linkedRequestWellsLoading()),
      /** Trimmed {value,label} view of linkedRequestWells for the "Link to Request" picker itself —
       *  see wwell-ir-editor.component.ts's `applyLinkedRequestWell` for where the full record
       *  (looked up from linkedRequestWells by this same value) drives the auto-populate. */
      linkedRequestWellOptions: computed(() => linkedRequestWells().map(well => ({ value: String(well.prewapSeq), label: well.wellName }))),
      /** FULL_NAME option list for the Geologist Contact "Primary"/"Secondary" pickers — value and
       *  label are the same string; the real EMPNUM to persist is resolved separately via
       *  `geologistEmpNumByName` below at save time. */
      geologistOptions: computed(() => gwdOpsMembers().map(member => member.fullName)),
      /** FULL_NAME → EMPNUM, threaded into buildWwellIrBulkSavePayload's WwellIrSaveContext so
       *  cont_geologist/sub_cont_geologist persist the real employee number, not a display name. */
      geologistEmpNumByName: computed<Readonly<Record<string, number>>>(() =>
        Object.fromEntries(gwdOpsMembers().map(member => [member.fullName, member.empNum])),
      ),
      /** Inverse of geologistEmpNumByName - EMPNUM → FULL_NAME, so a detail/list fetch that comes
       *  back with exad_gwd_ir_header.cont_geologist/sub_cont_geologist (a raw EMPNUM) can be
       *  redisplayed as the name the Geologist Contact picker showed when it was saved. Without
       *  this, mergeIrDetailBlocksIntoIntegratedRequirement has no way to turn that EMPNUM back
       *  into a name and the field renders blank even though the correct value is in the DB. */
      geologistNameByEmpNum: computed<Readonly<Record<number, string>>>(() =>
        Object.fromEntries(gwdOpsMembers().map(member => [member.empNum, member.fullName])),
      ),
      activeErrors: computed(() =>
        [
          irsError(),
          linkedRequestWellsError(),
          gwdOpsMembersError(),
          createIrError(),
          updateIrStatusError(),
          irDetailError(),
          irApprovalTimelineError(),
          deleteIrError(),
        ].filter((message): message is string => message !== null),
      ),
      hasError: computed(
        () =>
          irsError() !== null ||
          linkedRequestWellsError() !== null ||
          gwdOpsMembersError() !== null ||
          createIrError() !== null ||
          updateIrStatusError() !== null ||
          irDetailError() !== null ||
          irApprovalTimelineError() !== null ||
          deleteIrError() !== null,
      ),
    }),
  ),

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
        tap(() => {
          console.log('[IR:link] loadLinkedRequestWells — fetching GET /wells/eligible-for-ir');
          patchState(store, { linkedRequestWellsLoading: true, linkedRequestWellsError: null });
        }),
        switchMap(() =>
          svc.getEligibleWellsForIr().pipe(
            tapResponse({
              next: linkedRequestWells => {
                console.log('[IR:link] loadLinkedRequestWells — response received', { count: linkedRequestWells.length, linkedRequestWells });
                patchState(store, { linkedRequestWells, linkedRequestWellsLoading: false });
              },
              error: (err: unknown) => {
                console.log('[IR:link] loadLinkedRequestWells — request failed', err);
                patchState(store, {
                  linkedRequestWellsLoading: false,
                  linkedRequestWellsError: errorMessage(err, 'Failed to load wells eligible for IR initiation'),
                });
              },
            }),
          ),
        ),
      ),
    );

    // Stable reference data (not tied to a specific IR selection, unlike loadLinkedRequestWells) —
    // loaded once at list-page init, see WwellIrComponent.ngOnInit.
    const loadGwdOpsMembers = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { gwdOpsMembersLoading: true, gwdOpsMembersError: null })),
        switchMap(() =>
          svc.getGwdOpsMembers().pipe(
            tapResponse({
              next: gwdOpsMembers => patchState(store, { gwdOpsMembers, gwdOpsMembersLoading: false }),
              error: (err: unknown) =>
                patchState(store, { gwdOpsMembersLoading: false, gwdOpsMembersError: errorMessage(err, 'Failed to load GWD ops members') }),
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
                const merged = mergeIrDetailBlocksIntoIntegratedRequirement(existing, blocks, store.geologistNameByEmpNum());
                patchState(store, { irs: upsertByIrSeq(store.irs(), merged), irDetailLoading: false });
              },
              error: (err: unknown) =>
                patchState(store, { irDetailLoading: false, irDetailError: errorMessage(err, 'Failed to load integrated requirement detail') }),
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

      loadGwdOpsMembers(): void {
        loadGwdOpsMembers();
      },

      /**
       * No optimistic echo: the backend only ever confirms an `ir_seq` (see WwellIrSaveResult),
       * so this waits out a real follow-up GET (getIrDetailBlocks) and merges *that* onto the
       * record's last known-real state before `irs` ever changes — never onto whatever was just
       * typed. A field with no backing column at all (client, targetAquifer, targetDepthFt... see
       * mergeIrDetailBlocksIntoIntegratedRequirement's own doc comment) simply won't reflect the
       * edit once this settles, since there is nowhere real to read it back from — better an
       * honest revert than a value that only looks saved until the next reload.
       *
       * `creatingIr` stays true for both round-trips (POST, then GET), so the spinner is what
       * covers the extra latency — nothing renders in between.
       */
      createIr(
        payload: CreateIntegratedRequirementPayload,
        irBulkPayload: WwellIrBulkSavePayload,
        attachmentNames: readonly string[] = [],
      ): void {
        patchState(store, { creatingIr: true, createIrError: null });
        svc
          .createIr(irBulkPayload)
          .pipe(
            delay(WWELL_SAVE_DELAY_MS),
            switchMap(irSeq => {
              if (irSeq === null) return of({ irSeq, blocks: null });
              return svc.getIrDetailBlocks(irSeq).pipe(
                map(blocks => ({ irSeq, blocks })),
                // The save itself already succeeded here — a hiccup on this second, read-only
                // call must not read as "the save failed" (see the `blocks === null` branch below).
                catchError(() => of({ irSeq, blocks: null })),
              );
            }),
          )
          .subscribe({
            next: ({ irSeq, blocks }) => {
              if (irSeq === null) {
                // No identity to file this under at all — shouldn't happen for a genuine backend
                // success, so there's nothing to merge or select; just stop spinning.
                patchState(store, { creatingIr: false });
                return;
              }
              if (blocks === null) {
                // Confirmed saved (a real ir_seq came back) but the follow-up detail fetch failed
                // — record the real identity so a resave correctly UPDATEs instead of re-INSERTing,
                // but leave `irs` untouched rather than show anything unconfirmed.
                patchState(store, {
                  draftIrSeq: irSeq,
                  creatingIr: false,
                  createIrError: 'Saved, but the latest data failed to reload — refresh to see it.',
                });
                return;
              }
              const existing = store.irs().find(item => item.irSeq === irSeq);
              const base =
                existing ?? buildIntegratedRequirementFromPayload(payload, { id: `IR-${irSeq}`, code: `IR-${irSeq}`, irSeq }, attachmentNames);
              const merged = mergeIrDetailBlocksIntoIntegratedRequirement(base, blocks, store.geologistNameByEmpNum());
              patchState(store, {
                irs: upsertByIrSeq(store.irs(), merged),
                draftIrSeq: irSeq,
                creatingIr: false,
              });
            },
            error: (err: unknown) => patchState(store, { creatingIr: false, createIrError: errorMessage(err, 'Failed to create integrated requirement') }),
          });
      },

      submitIrForReview(ir: IntegratedRequirement): void {
        patchState(store, { updatingIrStatus: true, updateIrStatusError: null });
        svc
          .submitIrForReview(ir)
          .pipe(delay(WWELL_UPDATE_DELAY_MS))
          .subscribe({
            next: updated => patchState(store, { irs: store.irs().map(item => (item.id === updated.id ? updated : item)), updatingIrStatus: false }),
            error: (err: unknown) =>
              patchState(store, { updatingIrStatus: false, updateIrStatusError: errorMessage(err, 'Failed to submit integrated requirement for review') }),
          });
      },

      /** Deletes the whole IR (header row, cascading to casing/tops/hydrogeology/water — see
       *  WwellIrService.deleteIr) and drops it from `irs` on success. `irSeq` must already be a
       *  persisted record's — there's nothing to delete server-side for a local-only draft. */
      deleteIr(irSeq: number): void {
        patchState(store, { deletingIr: true, deleteIrError: null });
        svc
          .deleteIr(irSeq)
          .pipe(delay(WWELL_DELETE_DELAY_MS))
          .subscribe({
            next: () => patchState(store, { irs: store.irs().filter(item => item.irSeq !== irSeq), deletingIr: false }),
            error: (err: unknown) => patchState(store, { deletingIr: false, deleteIrError: errorMessage(err, 'Failed to delete integrated requirement') }),
          });
      },
    };
  }),
);
