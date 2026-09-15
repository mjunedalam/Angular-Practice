import { computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { catchError, concatMap, delay, from, map, of, pipe, switchMap, tap } from 'rxjs';
import { CreateIntegratedRequirementPayload, IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { IrAttachment, IrAttachmentSlot } from '@models/wwell-planning/ir-attachment.model';
import { WWELL_DELETE_DELAY_MS, WWELL_SAVE_DELAY_MS } from '@models/wwell-planning/wwell-planning-loading.constants';
import { SapService } from '@services/sap/sap.service';
import { AuthStore } from 'src/app/features/auth/store/auth.store';
import { mergeIrDetailBlocksIntoIntegratedRequirement } from '../wwell-ir-form/wwell-ir-detail-response.mapper';
import { buildIntegratedRequirementFromPayload } from '../wwell-ir-form/wwell-ir-draft.util';
import { WwellIrBulkSavePayload } from '../wwell-ir-form/wwell-ir-payload.model';
import { WwellIrService } from '../wwell-ir.service';
import { WWELL_IR_SAP_PROCESS_ID, WWELL_IR_SAP_SCENARIO_ID, WWELL_IR_SAP_WF_STATUS_SUBMITTED, buildSapWorkflowId } from '../wwell-ir-sap.config';
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

/** Like errorMessage above, but prefers the SAP trigger endpoint's own `{ detail: [{ msg }] }`
 *  422 validation shape (SapValidationError) over the generic `{ message }` envelope every other
 *  exad_agwa endpoint here uses — so a real "field X is required" from SAP reaches the user
 *  instead of a vague fallback. */
function sapErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    const body: unknown = err.error;
    const detail = body && typeof body === 'object' ? (body as { detail?: unknown }).detail : undefined;
    if (Array.isArray(detail)) {
      const messages = detail
        .map(item => (item && typeof item === 'object' ? (item as { msg?: unknown }).msg : undefined))
        .filter((msg): msg is string => typeof msg === 'string' && msg.length > 0);
      if (messages.length > 0) return messages.join('; ');
    }
  }
  return errorMessage(err, fallback);
}

/** A repeat "Save as Draft" on the same IR reuses its ir_seq (see wwell-ir-payload.mapper.ts), so
 *  the response describes the *same* record, not a new one — replace it in place instead of
 *  prepending a duplicate. Falls back to prepend for a genuinely new IR (irSeq not seen yet). */
function markSubmittedForReview(list: readonly IntegratedRequirement[], id: string): IntegratedRequirement[] {
  return list.map(item => (item.id === id ? { ...item, status: 'submit-for-review' as const } : item));
}

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
      sapTriggerError,
      irDetailError,
      irApprovalTimelineError,
      deleteIrError,
      attachmentError,
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
          sapTriggerError(),
          irDetailError(),
          irApprovalTimelineError(),
          deleteIrError(),
          attachmentError(),
        ].filter((message): message is string => message !== null),
      ),
      hasError: computed(
        () =>
          irsError() !== null ||
          linkedRequestWellsError() !== null ||
          gwdOpsMembersError() !== null ||
          createIrError() !== null ||
          sapTriggerError() !== null ||
          irDetailError() !== null ||
          irApprovalTimelineError() !== null ||
          deleteIrError() !== null ||
          attachmentError() !== null,
      ),
    }),
  ),

  withMethods((store, svc = inject(WwellIrService), sap = inject(SapService), authStore = inject(AuthStore)) => {
    // Step 3, reached only after SAP has accepted the workflow: stamp the id and status onto the
    // IR header (update_ir_sap_wf_prc — `seq` lands in sap_wf_id, `status` in sap_wf_status).
    //
    // Deliberately not called on a failed trigger: sap_wf_id/sap_wf_status describe a workflow
    // that exists in SAP, so recording one for a push SAP never accepted would leave the header
    // pointing at an id no SAP workflow was ever created under.
    function persistSapWorkflow(ir: IntegratedRequirement, irSeq: number, seq: number): void {
      const finish = (persistError: string | null) =>
        patchState(store, {
          updatingIrStatus: false,
          sapTriggerError: persistError,
          // Only a clean run — SAP accepted the workflow AND the header recorded it — moves the
          // record to submitted. This is a local reflection of the sap_wf_status just written, not
          // a separate persisted status: exad_gwd_ir_header has no status column, and the list read
          // still derives status from publish_flg alone (wwell-ir-summary.mapper.ts), so this
          // reverts on refresh until that read path surfaces sap_wf_status.
          irs: persistError === null ? markSubmittedForReview(store.irs(), ir.id) : store.irs(),
        });

      svc.updateIrSapWorkflow(irSeq, seq, WWELL_IR_SAP_WF_STATUS_SUBMITTED).subscribe({
        next: () => finish(null),
        error: (err: unknown) => finish(errorMessage(err, 'SAP workflow triggered, but failed to record it on the integrated requirement')),
      });
    }

    // Steps 1-2: mint a workflow id (get_wf_next_id_fnc), then push the workflow to SAP under it.
    // workflow_id must be minted fresh per submission and formatted as
    // `{NETWORK_ID}_{SCENARIO_ID}_{seq}` — see buildSapWorkflowId.
    function triggerSapWorkflow(ir: IntegratedRequirement, irSeq: number): void {
      const networkId = authStore.networkId() ?? '';
      svc.getNextSapWorkflowSeq().subscribe({
        next: seq => {
          sap
            .trigger({
              workflow_title: `Integrated Requirement ${ir.code} - ${ir.requestReference.wellName}`,
              initiator_network_id: networkId,
              requester_network_id: networkId,
              process_id: WWELL_IR_SAP_PROCESS_ID,
              scenario_id: WWELL_IR_SAP_SCENARIO_ID,
              workflow_id: buildSapWorkflowId(networkId, seq),
              body: [],
            })
            .subscribe({
              next: () => persistSapWorkflow(ir, irSeq, seq),
              // SAP refused the workflow, so there is nothing to stamp — surface the failure and
              // leave the header exactly as it was.
              error: (err: unknown) =>
                patchState(store, {
                  updatingIrStatus: false,
                  sapTriggerError: sapErrorMessage(err, 'Failed to trigger the SAP review workflow'),
                }),
            });
        },
        // Nothing to trigger or persist without a real id — never call SAP with a fabricated one.
        error: (err: unknown) =>
          patchState(store, { updatingIrStatus: false, sapTriggerError: errorMessage(err, 'Failed to generate a SAP workflow id') }),
      });
    }

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

    // Attachments are files on the backend's filesystem, not exad_gwd_ir_* columns, so they load
    // through their own endpoint and get merged onto the record the same way the chain above does.
    const loadIrAttachments = rxMethod<number>(
      pipe(
        tap(() => patchState(store, { attachmentsLoading: true, attachmentError: null })),
        switchMap(irSeq =>
          svc.getIrAttachments(irSeq).pipe(
            tapResponse({
              next: attachments => {
                patchState(store, {
                  irs: store.irs().map(item => (item.irSeq === irSeq ? { ...item, attachments } : item)),
                  attachmentsLoading: false,
                });
              },
              error: (err: unknown) =>
                patchState(store, { attachmentsLoading: false, attachmentError: errorMessage(err, 'Failed to load attachments') }),
            }),
          ),
        ),
      ),
    );

    /** Replaces just this slot's entry on the record, leaving the other slot untouched. */
    const withAttachment = (irSeq: number, slot: IrAttachmentSlot, attachment: IrAttachment | null) =>
      store.irs().map(item => {
        if (item.irSeq !== irSeq) return item;
        const others = item.attachments.filter(existing => existing.slot !== slot);
        return { ...item, attachments: attachment ? [...others, attachment] : others };
      });

    return {
      loadIrs(): void {
        loadIrs();
      },

      loadIrDetail(irSeq: number): void {
        loadIrDetail(irSeq);
      },

      loadIrAttachments(irSeq: number): void {
        loadIrAttachments(irSeq);
      },

      /**
       * Stages a picked file. Attaching never uploads on its own — the user sends it with the
       * slot's own upload action (`uploadStagedAttachment`), or, for a New IR that has no ir_seq to
       * upload against yet, the first save flushes it via `uploadPendingAttachments`.
       */
      setPendingAttachment(slot: IrAttachmentSlot, file: File): void {
        patchState(store, { pendingAttachments: { ...store.pendingAttachments(), [slot]: file }, attachmentError: null });
      },

      /**
       * Sends the file staged for one slot. Clears the staging only after the server confirms, so a
       * failed upload leaves the file in the slot to retry rather than silently dropping the user's
       * pick — the one thing that would actually lose their work.
       */
      uploadStagedAttachment(irSeq: number, slot: IrAttachmentSlot): void {
        const file = store.pendingAttachments()[slot];
        if (!file) return;

        patchState(store, { busyAttachmentSlot: slot, attachmentUploadPercent: 0, attachmentError: null });
        svc.uploadIrAttachment(irSeq, slot, file).subscribe({
          next: ({ percent, attachment }) => {
            if (!attachment) {
              patchState(store, { attachmentUploadPercent: percent });
              return;
            }
            const remaining = Object.fromEntries(
              Object.entries(store.pendingAttachments()).filter(([key]) => key !== slot),
            ) as Partial<Record<IrAttachmentSlot, File>>;
            patchState(store, {
              irs: withAttachment(irSeq, slot, attachment),
              pendingAttachments: remaining,
              busyAttachmentSlot: null,
              attachmentUploadPercent: null,
            });
          },
          error: (err: unknown) =>
            patchState(store, {
              busyAttachmentSlot: null,
              attachmentUploadPercent: null,
              attachmentError: errorMessage(err, 'Failed to upload the attachment'),
            }),
        });
      },

      removePendingAttachment(slot: IrAttachmentSlot): void {
        const remaining = Object.fromEntries(
          Object.entries(store.pendingAttachments()).filter(([key]) => key !== slot),
        ) as Partial<Record<IrAttachmentSlot, File>>;
        patchState(store, { pendingAttachments: remaining });
      },

      /** Drops every held file — the draft was abandoned, or a different record was selected. */
      clearPendingAttachments(): void {
        patchState(store, { pendingAttachments: {} });
      },

      /**
       * Uploads everything held for a draft that has just been assigned `irSeq`, one slot at a
       * time. Sequential rather than parallel because `busyAttachmentSlot`/`attachmentUploadPercent`
       * describe a single in-flight upload — two at once would fight over both.
       *
       * State is cleared up front so a second save can't re-upload the same files, and a failure on
       * one slot doesn't abort the other: each reports its own error and the chain continues.
       */
      uploadPendingAttachments(irSeq: number): void {
        const pending = Object.entries(store.pendingAttachments()) as [IrAttachmentSlot, File][];
        if (!pending.length) return;
        patchState(store, { pendingAttachments: {} });

        from(pending)
          .pipe(
            concatMap(([slot, file]) => {
              patchState(store, { busyAttachmentSlot: slot, attachmentUploadPercent: 0, attachmentError: null });
              return svc.uploadIrAttachment(irSeq, slot, file).pipe(
                tap(({ percent, attachment }) => {
                  if (!attachment) {
                    patchState(store, { attachmentUploadPercent: percent });
                    return;
                  }
                  patchState(store, {
                    irs: withAttachment(irSeq, slot, attachment),
                    busyAttachmentSlot: null,
                    attachmentUploadPercent: null,
                  });
                }),
                catchError((err: unknown) => {
                  patchState(store, {
                    busyAttachmentSlot: null,
                    attachmentUploadPercent: null,
                    attachmentError: errorMessage(err, `Failed to upload the ${slot} attachment`),
                  });
                  return of(null);
                }),
              );
            }),
          )
          .subscribe();
      },

      /** Percent stays null throughout: a delete has no measurable progress to report. */
      deleteIrAttachment(irSeq: number, slot: IrAttachmentSlot): void {
        patchState(store, { busyAttachmentSlot: slot, attachmentError: null, attachmentUploadPercent: null });
        svc.deleteIrAttachment(irSeq, slot).subscribe({
          next: () => patchState(store, { irs: withAttachment(irSeq, slot, null), busyAttachmentSlot: null }),
          error: (err: unknown) =>
            patchState(store, { busyAttachmentSlot: null, attachmentError: errorMessage(err, 'Failed to remove the attachment') }),
        });
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
      createIr(payload: CreateIntegratedRequirementPayload, irBulkPayload: WwellIrBulkSavePayload): void {
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
                existing ?? buildIntegratedRequirementFromPayload(payload, { id: `IR-${irSeq}`, code: `IR-${irSeq}`, irSeq });
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

      /**
       * "Submit for Review" is the SAP workflow submission, in three steps against two backends:
       * mint a workflow id (agwa-planning's get_wf_next_id_fnc) → push the workflow to SAP AAE
       * under that id (SapService) → record the outcome on the IR header (update_ir_sap_wf_prc).
       *
       * There is no separate IR status-transition call: exad_gwd_ir_header has no status column of
       * its own, so the SAP workflow columns this writes ARE the record of having submitted.
       * `updatingIrStatus` stays true across all three so the editor's Submit button spins for the
       * whole action rather than flickering between steps.
       */
      submitIrForReview(ir: IntegratedRequirement): void {
        // A draft that was never saved has no ir_seq to file the workflow under, so there would be
        // nothing to record the outcome against — refuse before calling SAP rather than after.
        if (ir.irSeq == null) {
          patchState(store, { sapTriggerError: 'Save the integrated requirement before submitting it for review.' });
          return;
        }
        patchState(store, { updatingIrStatus: true, sapTriggerError: null });
        triggerSapWorkflow(ir, ir.irSeq);
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
