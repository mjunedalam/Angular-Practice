import { Injectable, signal } from '@angular/core';
import { ACTIVE_WWELL_FALLBACK, normalizeStatusName } from './active-wwell.helpers';

@Injectable()
export class ActiveWwellUiStore {
  readonly statusOptions = signal<string[]>([
    'Active',
    'Inactive',
    'On Hold',
    'Completed',
    'test2',
    'test3',
    'test4',
    'test8'
  ]);

  readonly selectedArea = signal('RAK');
  private readonly statusesByWell = signal<Record<number, string>>({});

  statusForWell(epANum: number | null): string | null {
    if (epANum == null) {
      return null;
    }

    return this.statusesByWell()[epANum] ?? null;
  }

  ensureStatusForWell(epANum: number | null, fallbackStatus: string): void {
    const normalized = normalizeStatusName(fallbackStatus);

    if (
      epANum == null ||
      !normalized ||
      normalized === ACTIVE_WWELL_FALLBACK ||
      this.statusForWell(epANum)
    ) {
      return;
    }

    this.setStatusForWell(epANum, normalized);
  }

  addStatusOption(status: string): string | null {
    const normalized = normalizeStatusName(status);

    if (!normalized || normalized === ACTIVE_WWELL_FALLBACK) {
      return null;
    }

    this.statusOptions.update((options) => {
      const exists = options.some(
        (option) => option.toLowerCase() === normalized.toLowerCase(),
      );

      return exists ? options : [...options, normalized];
    });

    return normalized;
  }

  setStatusForWell(epANum: number | null, status: string): void {
    const normalized = this.addStatusOption(status);

    if (epANum == null || !normalized) {
      return;
    }

    this.statusesByWell.update((current) => ({
      ...current,
      [epANum]: normalized,
    }));
  }

  setSelectedArea(area: string): void {
    this.selectedArea.set(area);
  }
}
