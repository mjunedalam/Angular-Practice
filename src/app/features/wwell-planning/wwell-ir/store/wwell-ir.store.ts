import { computed, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { EMPTY, catchError, delay, exhaustMap, map, of, pipe, switchMap, tap } from 'rxjs';
import { CreateIntegratedRequirementPayload, IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { IrAttachment, IrAttachmentSlot, IrPendingAttachment } from '@models/wwell-planning/ir-attachment.model';
import { WWELL_DELETE_DELAY_MS, WWELL_SAVE_DELAY_MS } from '@models/wwell-planning/wwell-planning-loading.constants';
import { SapService } from '@services/sap/sap.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { AuthStore } from 'src/app/features/auth/store/auth.store';
import { mapSapWorkflowStatusToApprovalChain } from '../wwell-ir-form/wwell-ir-approval.mapper';
import { mergeIrDetailBlocksIntoIntegratedRequirement } from '../wwell-ir-form/wwell-ir-detail-response.mapper';
import { buildIntegratedRequirementFromPayload } from '../wwell-ir-form/wwell-ir-draft.util';
import { WwellIrBulkSavePayload } from '../wwell-ir-form/wwell-ir-payload.model';
import { WwellIrService } from '../wwell-ir.service';
import { WWELL_IR_SAP_PROCESS_ID, WWELL_IR_SAP_SCENARIO_ID, WWELL_IR_SAP_WF_STATUS_IN_PROGRESS } from '../wwell-ir-sap.config';
import { WwellIrStoreState, initialWwellIrState } from './wwell-ir.state';

/** Prefers the backend's own `{ message }` (see ApiResponse<T> — every exad_agwa endpoint here
 *  returns that envelope on both success and error) over Angular's generic "Http failure
 *  response for ..." text, so a specific backend validation error (e.g. an Oracle constraint
 *  message) reaches the user instead of a vague fallback. */
function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    // status 0 means the request never reached a server at all (refused connection, DNS failure,
    // CORS rejection, offline). There is no ApiResponse envelope to prefer, and `err.error` holds
    // the transport's own TypeError — surfacing its "Failed to fetch" as though it were a backend
    // message tells the user nothing, so the caller's own copy wins here.
    if (err.status === 0) return fallback;
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

/** Stamps the just-persisted SAP workflow onto the record: `sapWfId`/`sapWfStatusText` mirror
 *  exactly what `update_ir_sap_wf_prc` just wrote to sap_wf_id/sap_wf_status
 *  (WWELL_IR_SAP_WF_STATUS_IN_PROGRESS — submitting never asks SAP's own GET /display, so this is
 *  a local placeholder, not SAP's real text). `chain` is deliberately left untouched: nothing was
 *  fetched to refresh it with here — the next time this record is *viewed*
 *  (WwellIrStore.loadIrApprovalTimeline, via loadIrDetail or refreshIrApprovalStatus) is what
 *  reads SAP's real current status and chain back over this placeholder, everywhere it's shown
 *  (list badge, detail header badge, Approval Workflow sidebar) at once. */
function markSubmittedForReview(list: readonly IntegratedRequirement[], id: string, sapWfId: number, sapWfStatusText: string): IntegratedRequirement[] {
  return list.map(item => (item.id === id ? { ...item, status: 'submit-for-review' as const, sapWfId, sapWfStatusText } : item));
}

function upsertByIrSeq(list: readonly IntegratedRequirement[], created: IntegratedRequirement): IntegratedRequirement[] {
  const existingIndex = created.irSeq != null ? list.findIndex(item => item.irSeq === created.irSeq) : -1;
  if (existingIndex === -1) return [created, ...list];
  // A brand-new record's `created` (see createIr's own buildIntegratedRequirementFromPayload
  // fallback) has no way to know the record's real approval chain (that's a separate fetch; see
  // loadIrApprovalTimeline), so it always starts a fresh "just initiated" chain. Harmless for a
  // first-time INSERT (nothing to preserve yet), but would otherwise wipe out an already-in-
  // progress/approved record's real chain on every subsequent save. Keep whichever chain this
  // record already had.
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
      sapRecallError,
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
          sapRecallError(),
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
          sapRecallError() !== null ||
          irDetailError() !== null ||
          irApprovalTimelineError() !== null ||
          deleteIrError() !== null ||
          attachmentError() !== null,
      ),
    }),
  ),

  withMethods((store, svc = inject(WwellIrService), sap = inject(SapService), authStore = inject(AuthStore), notify = inject(NotificationService)) => {
    // Step 3, reached only after SAP has accepted the workflow (step 2): stamps the id and a
    // local "In Progress" placeholder status onto the IR header (update_ir_sap_wf_prc — `seq`
    // lands in sap_wf_id, WWELL_IR_SAP_WF_STATUS_IN_PROGRESS in sap_wf_status). Deliberately does
    // NOT ask SAP's own GET /display for the real status first — see that constant's own doc
    // comment for why a just-created workflow can safely assume "in progress" without asking, and
    // WwellIrStore.loadIrApprovalTimeline for where the real status/chain get read back instead
    // (any time the record is viewed, or refreshIrApprovalStatus is called on demand).
    //
    // Deliberately not called on a failed trigger: sap_wf_id/sap_wf_status describe a workflow
    // that exists in SAP, so recording one for a push SAP never accepted would leave the header
    // pointing at an id no SAP workflow was ever created under.
    function persistSapWorkflow(ir: IntegratedRequirement, irSeq: number, seq: number): void {
      svc.updateIrSapWorkflow(irSeq, seq, WWELL_IR_SAP_WF_STATUS_IN_PROGRESS).subscribe({
        next: () =>
          patchState(store, {
            updatingIrStatus: false,
            sapTriggerError: null,
            irs: markSubmittedForReview(store.irs(), ir.id, seq, WWELL_IR_SAP_WF_STATUS_IN_PROGRESS),
          }),
        error: (err: unknown) =>
          patchState(store, {
            updatingIrStatus: false,
            sapTriggerError: errorMessage(err, 'SAP workflow triggered, but failed to record it on the integrated requirement'),
          }),
      });
    }

    // Steps 1-2: mint a workflow id (get_wf_next_id_fnc), then push the workflow to SAP under it.
    // workflow_id sent to SAP is the raw minted seq, as-is — no network id or scenario suffix.
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
              workflow_id: String(seq),
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

    // Two calls against SAP AAE: DELETE /recall against the workflow's existing id (no new id to
    // mint — recall acts on the workflow submitIrForReview already created), then GET /display for
    // the real, current status/chain. The real recall response is a bare acknowledgement
    // (`{ message: string }`), not a workflow-status payload — confirmed live in production, where
    // treating it as one crashed reading `.header.wf_status_text` off a response with no `header` at
    // all. There's nothing to read a status out of the recall response itself, so ask SAP directly
    // afterward, the same way loadIrApprovalTimeline does.
    //
    // Nothing needs persisting back to the IR header here either: recall doesn't mint a new
    // sapWfId (the header's existing one is still correct), and every place that shows
    // sapWfStatusText already gets it fresh from this same live GET on every selection/reload
    // (loadIrDetail → loadIrApprovalTimeline) — a value guessed from the recall response and PATCHed
    // onto the header would only be a redundant placeholder, immediately overwritten.
    //
    // `recallingIr` deliberately stays true across both calls, not just the first — it's what the
    // editor's footer button reads for its spinner, and flipping it false the moment the recall ack
    // lands would stop the spinner mid-action, right as the follow-up status fetch starts.
    function recallSapWorkflow(irSeq: number, sapWfId: number): void {
      const networkId = authStore.networkId() ?? '';
      sap.recall(WWELL_IR_SAP_PROCESS_ID, sapWfId, networkId).subscribe({
        next: () =>
          sap.getWorkflowStatus(WWELL_IR_SAP_PROCESS_ID, sapWfId).subscribe({
            next: status =>
              patchState(store, {
                recallingIr: false,
                sapRecallError: null,
                irs: store.irs().map(item =>
                  item.irSeq === irSeq
                    ? { ...item, chain: mapSapWorkflowStatusToApprovalChain(status), sapWfStatusText: status.header.wf_status_text }
                    : item,
                ),
              }),
            error: (err: unknown) =>
              patchState(store, {
                recallingIr: false,
                sapRecallError: sapErrorMessage(err, 'Workflow recalled, but failed to refresh its latest status'),
              }),
          }),
        // SAP refused the recall — surface the failure and leave the header exactly as it was, same
        // as a refused trigger.
        error: (err: unknown) =>
          patchState(store, {
            recallingIr: false,
            sapRecallError: sapErrorMessage(err, 'Failed to recall the SAP review workflow'),
          }),
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

    // exhaustMap, not switchMap: this fires once at list init and again on the first selection —
    // milliseconds apart whenever the list is already in the store — and switchMap aborted the first
    // request (a red "(canceled)" row in the network tab) in favor of an identical second one.
    const loadLinkedRequestWells = rxMethod<void>(
      pipe(
        tap(() => {
          console.log('[IR:link] loadLinkedRequestWells — fetching GET /wells/eligible-for-ir');
          patchState(store, { linkedRequestWellsLoading: true, linkedRequestWellsError: null });
        }),
        exhaustMap(() =>
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
                // Only the detail fetch's exad_gwd_ir_header block carries sap_wf_id (the list
                // endpoint doesn't — see wwell-ir-summary.mapper.ts), so this is the first point a
                // real SAP lookup becomes possible for a freshly-selected record.
                loadIrApprovalTimeline({ irSeq, sapWfId: merged.sapWfId });
              },
              error: (err: unknown) =>
                patchState(store, { irDetailLoading: false, irDetailError: errorMessage(err, 'Failed to load integrated requirement detail') }),
            }),
          ),
        ),
      ),
    );

    // Feeds the Approval Workflow sidebar straight from SAP's own GET /display, looked up by the
    // IR's sapWfId (== wf_obj_id, the raw id minted by Submit for Review — see
    // wwell-ir-sap.config.ts). An IR never submitted has no sapWfId and therefore no SAP workflow
    // to look up — that case clears the chain locally instead of calling SAP with nothing to ask
    // about. Same switchMap-cancels-a-stale-fetch reasoning as loadIrDetail applies when the
    // selection changes quickly.
    const loadIrApprovalTimeline = rxMethod<{ irSeq: number; sapWfId: number | null }>(
      pipe(
        tap(() => patchState(store, { irApprovalTimelineLoading: true, irApprovalTimelineError: null })),
        switchMap(({ irSeq, sapWfId }) => {
          // Nothing to look up yet — leave `chain` exactly as it was (the initial local preview;
          // see buildIntegratedRequirementFromPayload) rather than blank it, since chainBorderColor
          // reads it for the detail panel's accent strip in both view and edit mode, not only the
          // view-mode sidebar this gates (wwell-ir.component.html).
          if (sapWfId == null) {
            patchState(store, { irApprovalTimelineLoading: false });
            return EMPTY;
          }
          return sap.getWorkflowStatus(WWELL_IR_SAP_PROCESS_ID, sapWfId).pipe(
            tapResponse({
              next: status => {
                patchState(store, {
                  // header.wf_status_text is the real workflow status SAP is showing right now —
                  // surfaced on the list badge (wwell-ir.component.html) in place of the local
                  // "Submit for Review" stand-in markSubmittedForReview sets optimistically, so a
                  // freshly-submitted record doesn't keep showing that stale label once SAP's own
                  // status is known.
                  irs: store.irs().map(item =>
                    item.irSeq === irSeq
                      ? { ...item, chain: mapSapWorkflowStatusToApprovalChain(status), sapWfStatusText: status.header.wf_status_text }
                      : item,
                  ),
                  irApprovalTimelineLoading: false,
                });
              },
              error: (err: unknown) =>
                patchState(store, {
                  irApprovalTimelineLoading: false,
                  irApprovalTimelineError: sapErrorMessage(err, 'Failed to load the SAP approval workflow status'),
                }),
            }),
          );
        }),
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

    /** Appends a newly-uploaded attachment onto the record, leaving every existing one (in this
     *  slot or any other) untouched — a slot accumulates attachments rather than holding just one. */
    const appendAttachment = (irSeq: number, attachment: IrAttachment) =>
      store.irs().map(item => (item.irSeq === irSeq ? { ...item, attachments: [...item.attachments, attachment] } : item));

    /** Drops one specific stored attachment (matched by slot + file name, its only identity) off
     *  the record, leaving every other attachment in that slot in place. */
    const withoutAttachment = (irSeq: number, slot: IrAttachmentSlot, fileName: string) =>
      store.irs().map(item =>
        item.irSeq === irSeq
          ? { ...item, attachments: item.attachments.filter(existing => !(existing.slot === slot && existing.fileName === fileName)) }
          : item,
      );

    /** Marks one pending file as mid-upload (or clears that marking) — shared by the single-item
     *  and sweep upload paths below so both track busy/progress identically per file id. */
    function setPendingUploadBusy(id: string, percent: number | null): void {
      patchState(store, {
        uploadingPendingIds: new Set(store.uploadingPendingIds()).add(id),
        uploadProgressByPendingId: { ...store.uploadProgressByPendingId(), [id]: percent },
      });
    }

    function clearPendingUploadBusy(id: string): void {
      const uploadingPendingIds = new Set(store.uploadingPendingIds());
      uploadingPendingIds.delete(id);
      const uploadProgressByPendingId = { ...store.uploadProgressByPendingId() };
      delete uploadProgressByPendingId[id];
      patchState(store, { uploadingPendingIds, uploadProgressByPendingId });
    }

    /** Drops one staged file (by id) from its slot's pending list, leaving any others staged there untouched. */
    function withoutPendingAttachment(slot: IrAttachmentSlot, id: string): Partial<Record<IrAttachmentSlot, readonly IrPendingAttachment[]>> {
      const remaining = (store.pendingAttachments()[slot] ?? []).filter(item => item.id !== id);
      return { ...store.pendingAttachments(), [slot]: remaining };
    }

    /**
     * Uploads one staged file. Independent of every other file in flight — each call tracks its own
     * busy/progress by the pending item's id (see `uploadingPendingIds`/`uploadProgressByPendingId`),
     * so clicking several rows' Upload buttons in a row fires that many concurrent requests rather
     * than queuing behind one another. Clears the staging only after the server confirms, so a
     * failed upload leaves the file in its slot to retry rather than silently dropping the user's
     * pick — the one thing that would actually lose their work.
     */
    function uploadOne(irSeq: number, slot: IrAttachmentSlot, item: IrPendingAttachment): void {
      setPendingUploadBusy(item.id, null);
      patchState(store, { attachmentError: null });
      svc.uploadIrAttachment(irSeq, slot, item.file).subscribe({
        next: ({ percent, attachment }) => {
          if (!attachment) {
            setPendingUploadBusy(item.id, percent);
            return;
          }
          clearPendingUploadBusy(item.id);
          patchState(store, {
            irs: appendAttachment(irSeq, attachment),
            pendingAttachments: withoutPendingAttachment(slot, item.id),
          });
          notify.info(`${attachment.label} uploaded.`);
        },
        error: (err: unknown) => {
          clearPendingUploadBusy(item.id);
          patchState(store, { attachmentError: errorMessage(err, `Failed to upload the ${slot} attachment`) });
        },
      });
    }

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
       * Stages a picked file alongside whatever else is already staged for that slot — attaching
       * never replaces, only adds. Attaching never uploads on its own either: the user sends it with
       * the file's own upload action (`uploadPendingAttachment`), or, for a New IR with no ir_seq to
       * upload against yet, the first save flushes everything staged via `uploadPendingAttachments`.
       */
      addPendingAttachment(slot: IrAttachmentSlot, file: File): void {
        const item: IrPendingAttachment = { id: crypto.randomUUID(), file };
        const existing = store.pendingAttachments()[slot] ?? [];
        patchState(store, {
          pendingAttachments: { ...store.pendingAttachments(), [slot]: [...existing, item] },
          attachmentError: null,
        });
      },

      /** Sends one staged file. See `uploadOne` above for why this is safe to call for several
       *  files at once without them fighting over shared progress/busy state. */
      uploadPendingAttachment(irSeq: number, slot: IrAttachmentSlot, id: string): void {
        const item = (store.pendingAttachments()[slot] ?? []).find(candidate => candidate.id === id);
        if (!item) return;
        uploadOne(irSeq, slot, item);
      },

      /** Un-stages one file without sending it — the user changed their mind before uploading. */
      removePendingAttachment(slot: IrAttachmentSlot, id: string): void {
        patchState(store, { pendingAttachments: withoutPendingAttachment(slot, id) });
      },

      /** Drops every held file — the draft was abandoned, or a different record was selected. */
      clearPendingAttachments(): void {
        patchState(store, { pendingAttachments: {} });
      },

      /**
       * Uploads everything held for a draft that has just been assigned `irSeq` — every staged file
       * in every slot, each independently (see `uploadOne`). State is cleared up front so a second
       * save can't re-upload the same files, and a failure on one file doesn't abort the others:
       * each reports its own error and the rest continue.
       */
      uploadPendingAttachments(irSeq: number): void {
        const bySlot = store.pendingAttachments();
        patchState(store, { pendingAttachments: {} });
        (Object.entries(bySlot) as [IrAttachmentSlot, readonly IrPendingAttachment[]][]).forEach(([slot, items]) =>
          items.forEach(item => uploadOne(irSeq, slot, item)),
        );
      },

      /** Deletes one specific stored attachment by slot + file name — the two together are its only
       *  identity now that a slot can hold several. Tracked by that same composite key in
       *  `deletingAttachmentKeys` so only this one row shows busy, not the rest of the slot's list. */
      deleteIrAttachment(irSeq: number, slot: IrAttachmentSlot, fileName: string): void {
        const key = `${slot}:${fileName}`;
        patchState(store, { deletingAttachmentKeys: new Set(store.deletingAttachmentKeys()).add(key), attachmentError: null });
        svc.deleteIrAttachment(irSeq, slot, fileName).subscribe({
          next: () => {
            const deletingAttachmentKeys = new Set(store.deletingAttachmentKeys());
            deletingAttachmentKeys.delete(key);
            patchState(store, { irs: withoutAttachment(irSeq, slot, fileName), deletingAttachmentKeys });
          },
          error: (err: unknown) => {
            const deletingAttachmentKeys = new Set(store.deletingAttachmentKeys());
            deletingAttachmentKeys.delete(key);
            patchState(store, { deletingAttachmentKeys, attachmentError: errorMessage(err, 'Failed to remove the attachment') });
          },
        });
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
              // A brand-new record's local draft never had a real sapWfId — this GET's own
              // exad_gwd_ir_header block is the first point one could exist (a resave of an
              // already-submitted IR).
              loadIrApprovalTimeline({ irSeq, sapWfId: merged.sapWfId });
            },
            error: (err: unknown) => patchState(store, { creatingIr: false, createIrError: errorMessage(err, 'Failed to create integrated requirement') }),
          });
      },

      /**
       * "Submit for Review" is the SAP workflow submission, in three steps against two backends:
       * mint a workflow id (agwa-planning's get_wf_next_id_fnc) → push the workflow to SAP AAE
       * under that id (SapService.trigger) → record the id and a local "in progress" placeholder
       * on the IR header (update_ir_sap_wf_prc). Deliberately does not also call SAP's own GET
       * /display to ask for a real status — see WWELL_IR_SAP_WF_STATUS_IN_PROGRESS's own doc
       * comment — so submitting stays fast and only ever costs one round-trip to SAP itself.
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

      /** "Recall" pulls back an already-submitted workflow — the editor only shows the button once
       *  `sapWfId` is set (see WwellIrEditorComponent.canRecallIr), but this guards it again since
       *  the store method is the one place that actually matters: there is no workflow to recall
       *  without a real `irSeq`/`sapWfId` pair to act on. */
      recallIr(ir: IntegratedRequirement): void {
        if (ir.irSeq == null || ir.sapWfId == null) {
          patchState(store, { sapRecallError: 'This integrated requirement has not been submitted for review.' });
          return;
        }
        patchState(store, { recallingIr: true, sapRecallError: null });
        recallSapWorkflow(ir.irSeq, ir.sapWfId);
      },

      /** On-demand counterpart to the automatic loadIrDetail → loadIrApprovalTimeline refresh: lets
       *  the UI (the Approval Workflow sidebar's refresh button, the detail header's status badge)
       *  pull SAP's real current status/chain for an already-selected record without needing a
       *  reselect. A no-op for a record with no `sapWfId` — there is no SAP workflow to ask about
       *  yet, same guard `loadIrApprovalTimeline` itself already applies. */
      refreshIrApprovalStatus(irSeq: number, sapWfId: number | null): void {
        if (sapWfId == null) return;
        loadIrApprovalTimeline({ irSeq, sapWfId });
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
