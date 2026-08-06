import { Signal, computed, signal } from '@angular/core';

export interface PendingSelection {
  readonly pendingId: Signal<string | null>;
  readonly isSelecting: Signal<boolean>;
  /** No-ops if `id` already matches `currentId` — clicking the already-selected row shouldn't
   * replay the loading transition. */
  select(id: string, currentId: string | null, onResolved: (id: string) => void): void;
  /** Cancels any in-flight timer — call from `ngOnDestroy` so a resolved selection can't land
   * on a signal after the component (and its view) is gone. */
  clear(): void;
}

/** Brief shimmer-loading transition between selecting a row and showing its detail — the data
 * itself is already in memory, so this is a deliberate, short UX beat rather than a real wait. */
export function createPendingSelection(delayMs: number): PendingSelection {
  const pendingId = signal<string | null>(null);
  const isSelecting = computed(() => pendingId() !== null);
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  return {
    pendingId,
    isSelecting,
    select(id, currentId, onResolved) {
      if (id === currentId) return;
      if (timeoutId) clearTimeout(timeoutId);
      pendingId.set(id);
      timeoutId = setTimeout(() => {
        onResolved(id);
        pendingId.set(null);
      }, delayMs);
    },
    clear() {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = undefined;
    },
  };
}
