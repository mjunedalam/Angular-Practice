import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';

import { WellDoc, WellDocsState } from '@models/well-design/well-docs.model';
import { PresDocsService } from '@services/pres-docs.service';
import { DUMMY_DOCS, initialWellDocsState } from './well-docs.state';
import { selectCategories, selectDocsByCategory, selectTotalDocCount } from './well-docs.selectors';
import { WellDocsActions, WellDocsEvents, LoadDocsPayload } from './well-docs.actions';

export const WellDocsStore = signalStore(
  { providedIn: 'root' },

  withState<WellDocsState>(initialWellDocsState),

  withComputed(({ docs }) => ({
    docsByCategory: computed(() => selectDocsByCategory(docs())),
    categories:     computed(() => selectCategories(docs())),
    totalCount:     computed(() => selectTotalDocCount(docs())),
  })),

  withMethods((store, svc = inject(PresDocsService)) => ({
    loadDocs: rxMethod<LoadDocsPayload>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ epANum, date }) =>
          svc.getDocs(epANum, date).pipe(
            tapResponse({
              next: (docs: WellDoc[]) =>
                patchState(store, {
                  docs: docs.length > 0 ? docs : DUMMY_DOCS,
                  loading: false,
                }),
              error: (err: unknown) => {
                const msg = err instanceof Error ? err.message : 'Failed to load documents';
                patchState(store, { docs: DUMMY_DOCS, loading: false, error: msg });
              },
            }),
          ),
        ),
      ),
    ),

    openViewer(doc: WellDoc): void {
      patchState(store, { selectedDoc: doc, viewerOpen: true });
    },

    closeViewer(): void {
      patchState(store, { selectedDoc: null, viewerOpen: false });
    },

    clearDocs(): void {
      patchState(store, initialWellDocsState);
    },
  })),
);

export { WellDocsActions, WellDocsEvents };
