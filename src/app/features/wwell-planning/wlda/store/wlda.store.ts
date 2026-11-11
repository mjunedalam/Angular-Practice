import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { WldaFormValue, WldaRecord } from '@models/wwell-planning/wlda.model';
import { WLDA_EMPTY_FORM } from '../wlda.config';

interface WldaState {
  readonly records: readonly WldaRecord[];
  readonly selectedId: string | null;
}

const initialState: WldaState = { records: [], selectedId: null };

/** Two-digit year + zero-padded running number: `WLDA-26-001`. */
function nextCode(records: readonly WldaRecord[], now: Date): string {
  const yy = String(now.getFullYear()).slice(-2);
  return `WLDA-${yy}-${String(records.length + 1).padStart(3, '0')}`;
}

// Local-only until the WLDA backend exists: records live in memory for the session.
export const WldaStore = signalStore(
  withState<WldaState>(initialState),

  withComputed(({ records, selectedId }) => ({
    selected: computed(() => records().find(r => r.id === selectedId()) ?? null),
  })),

  withMethods(store => ({
    createDraft(createdBy: string): string {
      const now = new Date();
      const record: WldaRecord = {
        ...WLDA_EMPTY_FORM,
        id: crypto.randomUUID(),
        code: nextCode(store.records(), now),
        status: 'draft',
        createdAt: now.toISOString(),
        createdBy,
      };
      patchState(store, { records: [record, ...store.records()], selectedId: record.id });
      return record.id;
    },

    select(id: string | null): void {
      patchState(store, { selectedId: id });
    },

    update(id: string, patch: Partial<WldaFormValue>): void {
      patchState(store, {
        records: store.records().map(r => (r.id === id ? { ...r, ...patch } : r)),
      });
    },

    submit(id: string): void {
      patchState(store, {
        records: store.records().map(r => (r.id === id ? { ...r, status: 'submitted' as const } : r)),
      });
    },

    remove(id: string): void {
      patchState(store, {
        records: store.records().filter(r => r.id !== id),
        selectedId: store.selectedId() === id ? null : store.selectedId(),
      });
    },
  })),
);
