import { HttpErrorResponse } from '@angular/common/http';
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withHooks, withMethods, withState } from '@ngrx/signals';
import { Observable, catchError, forkJoin, last, map, of, switchMap } from 'rxjs';
import { WldaAttachment, WldaDraft, WldaLetter, WldaPrewap } from '@models/wwell-planning/wlda.model';
import { S3Service } from '@services/s3/s3.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { AuthStore } from 'src/app/features/auth/store/auth.store';
import { WldaService } from '../wlda.service';
import {
  WLDA_EMPTY_DRAFT,
  draftOfLetter,
  isWldaDraftDirty,
  toWldaCreatePayload,
  toWldaUpdatePayload,
  findPlanForWell,
  validateWldaDraft,
  wldaFieldErrors,
  wldaCode,
  wldaKey,
  wldaS3Prefix,
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

  withMethods((store, wldaService = inject(WldaService), s3 = inject(S3Service), authStore = inject(AuthStore), notify = inject(NotificationService)) => {
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

    /** Re-reads one letter (single-letter GET) and its files, e.g. after a save. */
    /** Re-reads one letter (single-letter GET) and its files, e.g. after a save. `reopenEdit` re-bases the open draft on the fresh row. */
    function refreshLetter(prewapSeq: number, ltrId: number, reopenEdit = false): void {
      const key = wldaKey({ prewapSeq, ltrId });
      wldaService.getLetter(prewapSeq, ltrId).subscribe({
        next: fresh => {
          patchState(store, {
            letters: store.letters().map(item => (wldaKey(item) === key ? fresh : item)),
            ...(reopenEdit && store.selectedKey() === key ? { draft: draftOfLetter(fresh) } : {}),
          });
          loadStored(fresh, key);
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

      startDraft(): void {
        patchState(store, { draft: WLDA_EMPTY_DRAFT, selectedKey: null, storedAttachments: [] });
      },

      /** Switches the opened letter from view to edit. */
      startEdit(): void {
        const letter = store.selectedLetter();
        if (letter) patchState(store, { draft: draftOfLetter(letter) });
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
        patchState(store, { selectedKey: key, storedAttachments: [], draft: null });
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
          .pipe(switchMap(result => uploadFiles(draft.files, result.prewapSeq, result.ltrId).pipe(map(failed => ({ result, failed })))))
          .subscribe({
            next: ({ result, failed }) => {
              // The draft stays up (now keyed to the saved letter) until the fresh row lands, so the page stays in the editor.
              patchState(store, { saving: false, selectedKey: wldaKey(result), storedAttachments: [], draft: { ...draft, prewapSeq: result.prewapSeq, files: [], removedKeys: [] } });
              notify.info(`${wldaCode(result.ltrId)} created.`);
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
              notify.error(errorMessage(err, 'Failed to create the WLDA letter'));
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
