import { inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { computed } from '@angular/core';
import { pipe, switchMap, tap } from 'rxjs';
import { WellDoc, WellDocsState } from 'src/app/core/models/well-design/well-docs.model';
import { WellDocsService } from 'src/app/core/services/well-docs.service';

const DUMMY_DOCS: WellDoc[] = [
  {
    id: 'doc-001',
    title: 'Daily Drilling Report – Apr 15',
    docType: 'PDF',
    category: 'Drilling',
    uploadedBy: 'J. Al-Harbi',
    uploadedAt: '2026-04-15T08:30:00Z',
    fileSize: 1_245_184,
    url: '',
    tags: ['daily', 'drilling'],
    wellName: 'WWELL-01',
    date: '2026-04-15',
    description: 'Official daily drilling operations report including bit run and mud parameters.',
    pageCount: 12,
  },
  {
    id: 'doc-002',
    title: 'Casing Design Schematic',
    docType: 'IMAGE',
    category: 'Engineering',
    uploadedBy: 'M. Qureshi',
    uploadedAt: '2026-04-14T14:10:00Z',
    fileSize: 874_320,
    url: '',
    tags: ['casing', 'design'],
    wellName: 'WWELL-01',
    date: '2026-04-15',
    description: 'Annotated casing program schematic for 13-3/8" and 9-5/8" strings.',
  },
  {
    id: 'doc-003',
    title: 'Mud Logging Summary Sheet',
    docType: 'EXCEL',
    category: 'Geology',
    uploadedBy: 'S. Nasser',
    uploadedAt: '2026-04-15T06:00:00Z',
    fileSize: 320_512,
    url: '',
    tags: ['mud', 'geology'],
    wellName: 'WWELL-01',
    date: '2026-04-15',
    description: 'Mud logging data including gas readings, ROP, and formation tops.',
    pageCount: 3,
  },
];

const initialState: WellDocsState = {
  docs: DUMMY_DOCS,
  selectedDoc: null,
  loading: false,
  error: null,
  viewerOpen: false,
};

export const WellDocsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ docs }) => ({
    docsByCategory: computed(() => {
      const map = new Map<string, WellDoc[]>();
      for (const doc of docs()) {
        const list = map.get(doc.category) ?? [];
        map.set(doc.category, [...list, doc]);
      }
      return map;
    }),
    categories: computed(() => [...new Set(docs().map(d => d.category))]),
    totalCount: computed(() => docs().length),
  })),
  withMethods((store, svc = inject(WellDocsService)) => ({
    loadDocs: rxMethod<{ wellName: string; date: string }>(
      pipe(
        tap(() => patchState(store, { loading: true, error: null })),
        switchMap(({ wellName, date }) =>
          svc.getDocsByWellAndDate(wellName, date).pipe(
            tapResponse({
              next: (docs) => patchState(store, { docs, loading: false }),
              error: (err: unknown) => {
                const msg = err instanceof Error ? err.message : 'Failed to load documents';
                patchState(store, { loading: false, error: msg });
              },
            })
          )
        )
      )
    ),
    openViewer(doc: WellDoc): void {
      patchState(store, { selectedDoc: doc, viewerOpen: true });
    },
    closeViewer(): void {
      patchState(store, { selectedDoc: null, viewerOpen: false });
    },
    clearDocs(): void {
      patchState(store, initialState);
    },
  }))
);
