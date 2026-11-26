import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { Observable, catchError, concatMap, forkJoin, from, last, map, of, switchMap, take, takeWhile, tap, throwError, timer } from 'rxjs';
import { WldaAttachment, WldaDraft, WldaLetter, WldaPrewap } from '@models/wwell-planning/wlda.model';
import { environment } from '@env/environment';
import { SapAttachmentFile } from '@models/sap/sap-trigger.model';
import { ApprovalChainStep } from '@models/wwell-planning/wwell-planning.model';
import { S3Service } from '@services/s3/s3.service';
import { SapService } from '@services/sap/sap.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { AuthStore } from 'src/app/features/auth/store/auth.store';
import { mapSapWorkflowStatusToApprovalChain } from '../../wwell-ir/wwell-ir-form/wwell-ir-approval.mapper';
import { isSapWorkflowRecalled } from '../../wwell-ir/wwell-ir.config';
import { WwellIrService } from '../../wwell-ir/wwell-ir.service';
import { WldaService } from '../wlda.service';
import { WLDA_SAP_RECALL_POLL_MAX_ATTEMPTS, WLDA_SAP_RECALL_POLL_MS, WLDA_SAP_PROCESS_ID, WLDA_SAP_SCENARIO_ID, WLDA_SAP_WF_STATUS_APPROVED, WLDA_SAP_WF_STATUS_DRAFT, WLDA_SAP_WF_STATUS_IN_PROGRESS, buildWldaSapWorkflowTitle } from '../wlda.config';
import { buildWldaPdf } from '../wlda-pdf.util';
import {
  WLDA_EMPTY_DRAFT,
  draftOfLetter,
  isWldaDraftDirty,
  toWldaCreatePayload,
  toWldaUpdatePayload,
  viewOfLetter,
  findPlanForWell,
  isWldaLocked,
  validateWldaDraft,
  wldaFieldErrors,
  wldaCode,
  wldaKey,
  wldaS3Prefix,
  wldaWellName,
} from '../wlda.util';

/** `empty` = nothing open; `view` = a saved letter, read-only; `create` / `edit` = the draft is live. */
export type WldaMode = 'empty' | 'view' | 'create' | 'edit';

interface WldaState {
  readonly letters: readonly WldaLetter[];
  readonly prewaps: readonly WldaPrewap[];
  /** The letter being authored (create) or changed (edit — then `selectedKey` is also set). */
  readonly draft: WldaDraft | null;
  /** `wldaKey` of the saved letter open on the right, or null. */
  readonly selectedKey: string | null;
  /** Files stored in S3 for the opened letter. */
  readonly storedAttachments: readonly WldaAttachment[];
  readonly loading: boolean;
  readonly saving: boolean;
  readonly deleting: boolean;
  readonly loadError: string | null;
  /** The one-file upload dialog for a saved letter: in flight, byte progress (null = unknown), last failure. */
  readonly uploadingFile: boolean;
  readonly uploadPercent: number | null;
  readonly uploadError: string | null;
  /** The selected letter's SAP approval chain (read live from SAP's GET /display) and whether it is loading. */
  readonly approvalChain: readonly ApprovalChainStep[];
  readonly approvalLoading: boolean;
  readonly recalling: boolean;
}

const initialState: WldaState = {
  letters: [],
  prewaps: [],
  draft: null,
  selectedKey: null,
  storedAttachments: [],
  loading: false,
  saving: false,
  deleting: false,
  loadError: null,
  uploadingFile: false,
  uploadPercent: null,
  uploadError: null,
  approvalChain: [],
  approvalLoading: false,
  recalling: false,
};

/** Prefers the backend's own `{ message }` over Angular's generic "Http failure response" text. */
function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    const body: unknown = err.error;
    const message = body && typeof body === 'object' ? (body as { message?: unknown }).message : undefined;
    return err.status !== 0 && typeof message === 'string' && message ? message : fallback;
  }
  return err instanceof Error ? err.message : fallback;
}

/** Prefers SAP's own 422 `detail[].msg` list over the generic `{ message }` envelope. */
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

/** Raw base64 (no `data:` prefix) of bytes — the shape SAP's `attachment_files[].b64` expects. */
function bytesToBase64(bytes: Uint8Array): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(new Blob([bytes as BlobPart]));
  });
}

/** Copies the plan's details into the draft; `overwrite` (an explicit well link) replaces typed values, otherwise only blanks are filled. */
function fillFromPlan(draft: WldaDraft, plan: WldaPrewap, overwrite = false): WldaDraft {
  const blank = (value: string) => overwrite || value.trim() === '';
  return {
    ...draft,
    prewapSeq: plan.prewapSeq,
    field: overwrite ? (plan.wPrimHid ?? '') : draft.field,
    wellNumber: overwrite ? (plan.wNum ?? '') : draft.wellNumber,
    waterWellName: blank(draft.waterWellName) ? `${plan.wPrimHid ?? ''}-${plan.wNum ?? ''}` : draft.waterWellName,
    reservoir: blank(draft.reservoir) ? (plan.targetForm ?? '') : draft.reservoir,
    wellType: blank(draft.wellType) ? (plan.wellType ?? '') : draft.wellType,
    totalDepth: blank(draft.totalDepth) ? (plan.tdMd == null ? '' : String(plan.tdMd)) : draft.totalDepth,
    svYutmCord: blank(draft.svYutmCord) ? (plan.surfaceNorth == null ? '' : String(plan.surfaceNorth)) : draft.svYutmCord,
    svXutmCord: blank(draft.svXutmCord) ? (plan.surfaceEast == null ? '' : String(plan.surfaceEast)) : draft.svXutmCord,
    svUtmZn: blank(draft.svUtmZn) ? (plan.svUtmZn == null ? '' : String(plan.svUtmZn)) : draft.svUtmZn,
  };
}

export const WldaStore = signalStore(
  withState<WldaState>(initialState),

  withComputed(({ letters, prewaps, draft, selectedKey }) => {
    const selectedLetter = computed(() => letters().find(letter => wldaKey(letter) === selectedKey()) ?? null);
    const draftPlan = computed(() => {
      const current = draft();
      if (!current) return null;
      if (selectedLetter() || current.prewapSeq !== null) return prewaps().find(plan => plan.prewapSeq === current.prewapSeq) ?? null;
      return findPlanForWell(prewaps(), current.field, current.wellNumber);
    });
    return {
      selectedLetter,
      draftPlan,
      draftFieldErrors: computed(() => {
        const current = draft();
        return current ? wldaFieldErrors(current, selectedLetter() ? 'edit' : 'create', draftPlan()) : {};
      }),
      draftErrors: computed(() => {
        const current = draft();
        return current ? validateWldaDraft(current, selectedLetter() ? 'edit' : 'create', draftPlan()) : [];
      }),
      mode: computed<WldaMode>(() => {
        if (draft()) return selectedLetter() ? 'edit' : 'create';
        return selectedLetter() ? 'view' : 'empty';
      }),
      isDirty: computed(() => {
        const current = draft();
        return current ? isWldaDraftDirty(current, selectedLetter()) : false;
      }),
    };
  }),

  withMethods((store, wldaService = inject(WldaService), irService = inject(WwellIrService), sap = inject(SapService), s3 = inject(S3Service), authStore = inject(AuthStore), notify = inject(NotificationService)) => {
    const networkId = () => authStore.networkId() ?? '';

    /** Uploads each file under the letter's prefix; resolves to the names that failed (letter stays saved). */
    function uploadFiles(files: readonly File[], prewapSeq: number, ltrId: number): Observable<string[]> {
      if (files.length === 0) return of([]);
      const prefix = wldaS3Prefix(prewapSeq, ltrId);
      return forkJoin(
        files.map(file =>
          s3.store(file, prefix, networkId(), file.name).pipe(
            last(),
            map((): string | null => null),
            catchError(() => of(file.name)),
          ),
        ),
      ).pipe(map(outcomes => outcomes.filter((name): name is string => name !== null)));
    }

    /** Deletes stored objects by key; resolves to the names that failed. */
    function deleteStored(keys: readonly string[], names: ReadonlyMap<string, string>): Observable<string[]> {
      if (keys.length === 0) return of([]);
      return forkJoin(
        keys.map(key =>
          s3.delete(key, networkId()).pipe(
            map((): string | null => null),
            catchError(() => of(names.get(key) ?? key)),
          ),
        ),
      ).pipe(map(outcomes => outcomes.filter((name): name is string => name !== null)));
    }

    function loadStored(letter: WldaLetter, key: string): void {
      s3.search(`${wldaS3Prefix(letter.prewapSeq, letter.ltrId)}/`).subscribe({
        next: res => {
          if (store.selectedKey() !== key) return;
          patchState(store, {
            storedAttachments: res.objects.map(object => ({ key: object.OBJ_KEY, name: object.ORIGINAL_FILENAME, pendingIndex: null })),
          });
        },
        error: () => {
          if (store.selectedKey() === key) notify.error('Could not load the letter attachments');
        },
      });
    }

    /**
     * "Submit for Approval", same three steps as the IR: mint a workflow id, push the workflow to SAP (the
     * letter PDF plus every stored file as `attachment_files`), then stamp the id and "In Progress" on the
     * letter. A refused trigger leaves the letter exactly as it was (Draft).
     */
    function submitToSap(letter: WldaLetter): Observable<void> {
      const prefix = `${wldaS3Prefix(letter.prewapSeq, letter.ltrId)}/`;
      return irService.getNextSapWorkflowSeq().pipe(
        switchMap(seq => {
          const submitted: WldaLetter = { ...letter, sapWfId: seq, sapWfStatus: WLDA_SAP_WF_STATUS_IN_PROGRESS };
          return s3.search(prefix).pipe(
            switchMap(res => {
              const objects = res.objects;
              const stored = objects.map(object => ({ key: object.OBJ_KEY, name: object.ORIGINAL_FILENAME, pendingIndex: null }));
              const code = wldaCode(letter.ltrId);
              const letter$ = from(buildWldaPdf(viewOfLetter(submitted, stored))).pipe(
                switchMap(bytes => bytesToBase64(bytes)),
                map((b64): SapAttachmentFile => ({ file_name: `${code}-letter.pdf`, b64 })),
              );
              const files$ = objects.map(object =>
                s3.fetch(object.OBJ_KEY).pipe(map((response): SapAttachmentFile => ({ file_name: object.ORIGINAL_FILENAME, b64: response.content }))),
              );
              return forkJoin([letter$, ...files$]);
            }),
            switchMap(attachmentFiles =>
              sap
                .trigger({
                  workflow_title: buildWldaSapWorkflowTitle(wldaCode(letter.ltrId), wldaWellName(letter) || `Plan #${letter.prewapSeq}`, environment.production),
                  initiator_network_id: networkId(),
                  requester_network_id: networkId(),
                  process_id: WLDA_SAP_PROCESS_ID,
                  scenario_id: WLDA_SAP_SCENARIO_ID,
                  workflow_id: String(seq),
                  attachment_files: attachmentFiles,
                  body: [],
                })
                .pipe(catchError((err: unknown) => throwError(() => new Error(sapErrorMessage(err, 'Failed to trigger the SAP approval workflow'))))),
            ),
            switchMap(() =>
              wldaService
                .updateLetter(letter.prewapSeq, letter.ltrId, { ltrRmks: letter.ltrRmks, sapWfId: seq, sapWfStatus: WLDA_SAP_WF_STATUS_IN_PROGRESS, sapWfAprvDt: letter.sapWfAprvDt })
                .pipe(catchError((err: unknown) => throwError(() => new Error(errorMessage(err, 'SAP workflow triggered, but failed to record it on the letter'))))),
            ),
            map((): void => undefined),
          );
        }),
      );
    }

    /** Stamps SAP's live status text onto the listed letter (local only), so the badge follows SAP like the IR's does. */
    function withStatusText(prewapSeq: number, ltrId: number, statusText: string): readonly WldaLetter[] {
      const key = wldaKey({ prewapSeq, ltrId });
      return store.letters().map(item => (wldaKey(item) === key ? { ...item, sapWfStatus: statusText } : item));
    }

    function listedLetter(key: string): WldaLetter | undefined {
      return store.letters().find(item => wldaKey(item) === key);
    }

    /**
     * Saves SAP's live status on the letter, so the list and the database follow SAP. "Approved" is stored as
     * 'APPROVED' (get_wlda_letters_prc's current_flg matches it exactly) together with the last approval date.
     * Fire-and-forget: a failed write only means the next view tries again.
     */
    function syncStatus(letter: WldaLetter, statusText: string, chain: readonly ApprovalChainStep[]): void {
      const isApproved = /^approved$/i.test(statusText.trim());
      const sapWfStatus = isApproved ? WLDA_SAP_WF_STATUS_APPROVED : statusText;
      const approvalDates = chain.flatMap(step => (step.status === 'approved' && step.date ? [step.date] : [])).sort();
      const sapWfAprvDt = isApproved ? (approvalDates.at(-1) ?? letter.sapWfAprvDt) : letter.sapWfAprvDt;
      if (letter.sapWfStatus === sapWfStatus && letter.sapWfAprvDt === sapWfAprvDt) return;
      const key = wldaKey(letter);
      patchState(store, { letters: store.letters().map(item => (wldaKey(item) === key ? { ...item, sapWfStatus, sapWfAprvDt } : item)) });
      wldaService
        .updateLetter(letter.prewapSeq, letter.ltrId, { ltrRmks: letter.ltrRmks, sapWfId: letter.sapWfId, sapWfStatus, sapWfAprvDt })
        .subscribe({ error: () => undefined });
    }

    /** Back to an unsubmitted Draft: workflow id and approval date cleared, status "Draft". Used once SAP confirms a
     *  recall, and when the user reopens a closed workflow for editing. A failed write leaves the letter locked. */
    function resetToDraft(letter: WldaLetter, openForEdit: boolean, failureMessage: string, successMessage: string): void {
      const key = wldaKey(letter);
      const reset = { sapWfId: null, sapWfStatus: WLDA_SAP_WF_STATUS_DRAFT, sapWfAprvDt: null };
      wldaService.updateLetter(letter.prewapSeq, letter.ltrId, { ltrRmks: letter.ltrRmks, ...reset }).subscribe({
        next: () => {
          const fresh: WldaLetter = { ...(listedLetter(key) ?? letter), ...reset };
          const isOpen = store.selectedKey() === key;
          patchState(store, {
            recalling: false,
            letters: store.letters().map(item => (wldaKey(item) === key ? fresh : item)),
            ...(isOpen ? { approvalChain: [], approvalLoading: false } : {}),
            ...(isOpen && openForEdit ? { draft: draftOfLetter(fresh) } : {}),
          });
          notify.info(successMessage);
        },
        error: (err: unknown) => {
          patchState(store, { recalling: false });
          notify.error(errorMessage(err, failureMessage));
        },
      });
    }

    /** Reads the letter's real approval chain and status from SAP; a never-submitted letter has nothing to ask about. */
    function loadApproval(letter: WldaLetter): void {
      const key = wldaKey(letter);
      if (letter.sapWfId == null) {
        patchState(store, { approvalChain: [], approvalLoading: false });
        return;
      }
      patchState(store, { approvalLoading: true });
      sap.getWorkflowStatus(WLDA_SAP_PROCESS_ID, letter.sapWfId).subscribe({
        next: status => {
          if (store.selectedKey() !== key) return;
          // Reset or resubmitted while this read was in flight: saving it would restore the old workflow.
          const current = listedLetter(key);
          if (!current || current.sapWfId !== letter.sapWfId) {
            patchState(store, { approvalLoading: false });
            return;
          }
          const chain = mapSapWorkflowStatusToApprovalChain(status);
          patchState(store, { approvalChain: chain, approvalLoading: false });
          syncStatus(current, status.header.wf_status_text, chain);
        },
        error: (err: unknown) => {
          if (store.selectedKey() !== key) return;
          patchState(store, { approvalLoading: false });
          notify.error(sapErrorMessage(err, 'Failed to load the SAP approval workflow status'));
        },
      });
    }

    /** Reads the saved letter back and submits it; resolves to null on success or the failure text (never errors). */
    function submitSaved(prewapSeq: number, ltrId: number): Observable<string | null> {
      return wldaService.getLetter(prewapSeq, ltrId).pipe(
        switchMap(letter => submitToSap(letter)),
        map((): string | null => null),
        catchError((err: unknown) => of(err instanceof Error ? err.message : 'Unexpected error')),
      );
    }

    /** Re-reads one letter (single-letter GET) and its files, e.g. after a save. `reopenEdit` re-bases the open draft on the fresh row. */
    function refreshLetter(prewapSeq: number, ltrId: number, reopenEdit = false): void {
      const key = wldaKey({ prewapSeq, ltrId });
      wldaService.getLetter(prewapSeq, ltrId).subscribe({
        next: fresh => {
          const isOpen = store.selectedKey() === key;
          patchState(store, {
            letters: store.letters().map(item => (wldaKey(item) === key ? fresh : item)),
            // A letter that turns out to be locked (just submitted, here or elsewhere) drops out of the editor.
            ...(isOpen && isWldaLocked(fresh) ? { draft: null } : isOpen && reopenEdit ? { draft: draftOfLetter(fresh) } : {}),
          });
          loadStored(fresh, key);
          if (store.selectedKey() === key) loadApproval(fresh);
        },
        error: (err: unknown) => notify.error(errorMessage(err, 'Failed to refresh the WLDA letter')),
      });
    }

    return {
      /** Uploads one file straight to the opened letter's S3 folder (edit mode) and lists it on success. */
      uploadLetterFile(file: File): void {
        const letter = store.selectedLetter();
        if (!letter || store.uploadingFile()) return;
        patchState(store, { uploadingFile: true, uploadPercent: null, uploadError: null });
        s3.store(file, wldaS3Prefix(letter.prewapSeq, letter.ltrId), networkId(), file.name).subscribe({
          next: ({ percent, response }) => {
            if (!response) {
              patchState(store, { uploadPercent: percent });
              return;
            }
            patchState(store, {
              uploadingFile: false,
              uploadPercent: null,
              storedAttachments: [...store.storedAttachments(), { key: response.key, name: file.name, pendingIndex: null }],
            });
            notify.info(`${file.name} uploaded.`);
          },
          error: (err: unknown) =>
            patchState(store, { uploadingFile: false, uploadPercent: null, uploadError: errorMessage(err, `Failed to upload ${file.name}`) }),
        });
      },

      /** Clears a previous upload failure before the next file's dialog opens. */
      resetUpload(): void {
        patchState(store, { uploadError: null, uploadPercent: null });
      },

      loadAll(): void {
        patchState(store, { loading: true, loadError: null });
        forkJoin({ prewaps: wldaService.getPrewaps(), letters: wldaService.getLetters() }).subscribe({
          next: ({ prewaps, letters }) => patchState(store, { prewaps, letters, loading: false }),
          error: (err: unknown) => patchState(store, { loading: false, loadError: errorMessage(err, 'Failed to load WLDA letters') }),
        });
      },

      /** Re-reads the wells the "Link to Water Well" dropdown offers. */
      loadPrewaps(): void {
        wldaService.getPrewaps().subscribe({
          next: prewaps => patchState(store, { prewaps }),
          error: (err: unknown) => notify.error(errorMessage(err, 'Failed to refresh the water well list')),
        });
      },

      startDraft(): void {
        patchState(store, { draft: WLDA_EMPTY_DRAFT, selectedKey: null, storedAttachments: [] });
        this.loadPrewaps();
      },

      /** Switches the opened letter from view to edit. */
      startEdit(): void {
        const letter = store.selectedLetter();
        if (letter && !isWldaLocked(letter)) patchState(store, { draft: draftOfLetter(letter) });
      },

      patchDraft(patch: Partial<WldaDraft>): void {
        const current = store.draft();
        if (!current) return;
        let next: WldaDraft = { ...current, ...patch };
        // Typing a different Field / Well Number un-links the chosen well; the typed values decide again.
        if (!store.selectedLetter() && ('field' in patch || 'wellNumber' in patch)) next = { ...next, prewapSeq: null };
        // Creating: once Field + Well Number land on a plan, fill the details it already knows (blank fields only).
        if (!store.selectedLetter() && ('field' in patch || 'wellNumber' in patch)) {
          const before = findPlanForWell(store.prewaps(), current.field, current.wellNumber);
          const plan = findPlanForWell(store.prewaps(), next.field, next.wellNumber);
          if (plan && plan !== before) next = fillFromPlan(next, plan);
        }
        patchState(store, { draft: next });
      },

      /** "Link to Water Well": pick a pre-well plan and populate the form from it (null clears the link). */
      linkWell(prewapSeq: number | null): void {
        const current = store.draft();
        if (!current || store.selectedLetter()) return;
        const plan = store.prewaps().find(item => item.prewapSeq === prewapSeq);
        patchState(store, { draft: plan ? fillFromPlan(current, plan, true) : { ...current, prewapSeq: null } });
      },

      /** Drops the draft: a create goes back to nothing open, an edit back to viewing the saved letter. */
      discardDraft(): void {
        patchState(store, { draft: null });
      },

      /** Opens a saved letter: the listed row at once, then a fresh single-letter GET and its S3 files. */
      select(key: string | null): void {
        patchState(store, { selectedKey: key, storedAttachments: [], draft: null, approvalChain: [], approvalLoading: false });
        const letter = store.letters().find(item => wldaKey(item) === key);
        if (letter && key) refreshLetter(letter.prewapSeq, letter.ltrId);
      },

      /** Saves the letter first (it owns the LTR_ID the S3 prefix needs), then uploads each file. */
      createLetter(): void {
        const draft = store.draft();
        const plan = store.draftPlan();
        if (store.mode() !== 'create' || !draft || !plan || store.saving() || validateWldaDraft(draft, 'create', plan).length > 0) return;
        patchState(store, { saving: true });

        wldaService
          .createLetter(plan.prewapSeq, toWldaCreatePayload(draft))
          .pipe(
            switchMap(result =>
              uploadFiles(draft.files, result.prewapSeq, result.ltrId).pipe(map(failed => ({ result, failed }))),
            ),
          )
          .subscribe({
            next: ({ result, failed }) => {
              // The draft stays up (now keyed to the saved letter) until the fresh row lands, so the page stays in the editor.
              patchState(store, { saving: false, selectedKey: wldaKey(result), storedAttachments: [], draft: { ...draft, prewapSeq: result.prewapSeq, files: [], removedKeys: [] } });
              notify.info(`${wldaCode(result.ltrId)} saved as Draft.`);
              if (failed.length > 0) notify.error(`Letter saved, but these files did not upload: ${failed.join(', ')}`);
              wldaService.getLetters().subscribe({
                next: letters => {
                  patchState(store, { letters });
                  refreshLetter(result.prewapSeq, result.ltrId, true);
                },
                // Saved, but the list could not reload: fall back to viewing so a second Create can't duplicate it.
                error: () => patchState(store, { draft: null }),
              });
            },
            error: (err: unknown) => {
              patchState(store, { saving: false });
              notify.error(errorMessage(err, 'Failed to save the WLDA letter'));
            },
          });
      },

      /** Saves remarks (coordinates are not updatable), removes dropped files from S3, uploads new ones. */
      updateLetter(): void {
        const draft = store.draft();
        const letter = store.selectedLetter();
        if (store.mode() !== 'edit' || !draft || !letter || store.saving() || validateWldaDraft(draft, 'edit').length > 0) return;
        patchState(store, { saving: true });
        const names = new Map(store.storedAttachments().map(file => [file.key ?? '', file.name]));

        wldaService
          .updateLetter(letter.prewapSeq, letter.ltrId, toWldaUpdatePayload(draft, letter))
          .pipe(
            switchMap(() =>
              forkJoin({
                removeFailed: deleteStored(draft.removedKeys, names),
                uploadFailed: uploadFiles(draft.files, letter.prewapSeq, letter.ltrId),
              }),
            ),
          )
          .subscribe({
            next: ({ removeFailed, uploadFailed }) => {
              patchState(store, { saving: false, draft: { ...draft, files: [], removedKeys: [] } });
              notify.info(`${wldaCode(letter.ltrId)} updated.`);
              if (removeFailed.length > 0) notify.error(`Could not remove: ${removeFailed.join(', ')}`);
              if (uploadFailed.length > 0) notify.error(`Letter saved, but these files did not upload: ${uploadFailed.join(', ')}`);
              refreshLetter(letter.prewapSeq, letter.ltrId, true);
            },
            error: (err: unknown) => {
              patchState(store, { saving: false });
              notify.error(errorMessage(err, 'Failed to update the WLDA letter'));
            },
          });
      },

      /** Submits an already-saved Draft (or a rejected/recalled letter) for approval. */
      submitLetter(): void {
        const letter = store.selectedLetter();
        if (!letter || store.saving() || store.isDirty()) return;
        patchState(store, { saving: true });
        submitSaved(letter.prewapSeq, letter.ltrId).subscribe(sapError => {
          patchState(store, { saving: false });
          if (sapError) notify.error(`Submitting ${wldaCode(letter.ltrId)} for approval failed: ${sapError}`);
          else notify.info(`${wldaCode(letter.ltrId)} submitted for approval.`);
          refreshLetter(letter.prewapSeq, letter.ltrId, store.mode() === 'edit');
        });
      },

      /** The approval card's refresh button: re-reads the chain from SAP. */
      refreshApproval(): void {
        const letter = store.selectedLetter();
        if (letter) loadApproval(letter);
      },

      /**
       * Recall: DELETE /recall against the workflow's existing id, then poll GET /display (SAP applies it
       * asynchronously) until it reports Recalled, and only then reset the letter to Draft.
       */
      recallLetter(openForEdit = false): void {
        const letter = store.selectedLetter();
        if (!letter || letter.sapWfId == null || store.recalling()) return;
        const sapWfId = letter.sapWfId;
        const key = wldaKey(letter);
        patchState(store, { recalling: true });
        sap.recall(WLDA_SAP_PROCESS_ID, sapWfId, networkId()).subscribe({
          next: () => {
            let lastText: string | null = null;
            timer(WLDA_SAP_RECALL_POLL_MS, WLDA_SAP_RECALL_POLL_MS)
              .pipe(
                take(WLDA_SAP_RECALL_POLL_MAX_ATTEMPTS),
                concatMap(() => sap.getWorkflowStatus(WLDA_SAP_PROCESS_ID, sapWfId).pipe(catchError(() => of(null)))),
                tap(status => {
                  if (!status) return;
                  lastText = status.header.wf_status_text;
                  patchState(store, {
                    letters: withStatusText(letter.prewapSeq, letter.ltrId, status.header.wf_status_text),
                    ...(store.selectedKey() === key ? { approvalChain: mapSapWorkflowStatusToApprovalChain(status) } : {}),
                  });
                }),
                takeWhile(status => !status || !isSapWorkflowRecalled(status.header.wf_status_text), true),
              )
              .subscribe({
                complete: () => {
                  if (isSapWorkflowRecalled(lastText)) {
                    resetToDraft(letter, openForEdit, 'Workflow recalled, but the letter could not be reset to Draft', `${wldaCode(letter.ltrId)} recalled and returned to Draft.`);
                    return;
                  }
                  patchState(store, { recalling: false });
                  notify.error(
                    lastText === null ? 'Workflow recalled, but failed to refresh its latest status' : 'SAP has not confirmed the recall yet — refresh the approval status shortly',
                  );
                },
              });
          },
          error: (err: unknown) => {
            patchState(store, { recalling: false });
            notify.error(sapErrorMessage(err, 'Failed to recall the SAP approval workflow'));
          },
        });
      },

      /** Reopens a letter whose workflow is already closed (approved, rejected, cancelled or recalled) for editing.
       *  A live workflow must go through recallLetter instead, or it would stay pending in SAP. */
      reopenLetter(): void {
        const letter = store.selectedLetter();
        if (!letter || !isWldaLocked(letter) || store.recalling()) return;
        patchState(store, { recalling: true });
        resetToDraft(letter, true, 'Failed to reopen the letter for editing', `${wldaCode(letter.ltrId)} reopened as Draft.`);
      },

      /** Deletes the letter, then its S3 files best-effort (the row is already gone, so a failure only leaves orphans). */
      deleteLetter(): void {
        const letter = store.selectedLetter();
        if (!letter || store.deleting()) return;
        patchState(store, { deleting: true });
        const keys = store.storedAttachments().flatMap(file => (file.key ? [file.key] : []));

        wldaService
          .deleteLetter(letter.prewapSeq, letter.ltrId)
          .pipe(switchMap(() => deleteStored(keys, new Map())))
          .subscribe({
            next: orphaned => {
              const key = wldaKey(letter);
              patchState(store, {
                deleting: false,
                draft: null,
                selectedKey: null,
                storedAttachments: [],
                letters: store.letters().filter(item => wldaKey(item) !== key),
              });
              notify.info(`${wldaCode(letter.ltrId)} deleted.`);
              if (orphaned.length > 0) notify.error(`Letter deleted, but ${orphaned.length} stored file(s) could not be removed.`);
            },
            error: (err: unknown) => {
              patchState(store, { deleting: false });
              notify.error(errorMessage(err, 'Failed to delete the WLDA letter'));
            },
          });
      },
    };
  }),

  withHooks({ onInit: store => store.loadAll() }),
);
