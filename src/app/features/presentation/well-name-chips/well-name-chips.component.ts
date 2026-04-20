/**
 * WellNameChipsComponent — SMART
 * Injects WellStore — reads pagedWellNames, selectedEpANum, pagination signals.
 * Calls store.selectWell(), store.nextPage(), store.prevPage() directly.
 * Includes date picker for loading well data from specific dates.
 * Zero @Input / @Output needed.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, Signal, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { WellStore } from '@store/active-wwell/active-wwell.store';
import { formatDateForInput, getTodayAtMidnight, parseDateFromInput } from 'src/app/shared/utils/date.util';

@Component({
  selector: 'app-well-name-chips',
  standalone: true,
  imports: [NgClass, FormsModule, MatProgressBarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './well-name-chips.component.html',
  styleUrl:    './well-name-chips.component.scss',
})
export class WellNameChipsComponent {
  protected readonly store = inject(WellStore);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly maxDateString = formatDateForInput(getTodayAtMidnight());
  protected readonly loaderVisible = signal(false);

  private loaderTimer: ReturnType<typeof setTimeout> | null = null;
  private loaderShownAt = 0;

  protected readonly pageLabel = computed(() =>
    `${this.store.wellNamesPage() + 1} / ${this.store.totalPages()}`
  );

  protected readonly selectedDate: Signal<Date> = computed(() => {
    const d = this.store.selectedDate();
    return d instanceof Date ? d : new Date(d);
  });

  protected readonly selectedDateString = computed(() =>
    formatDateForInput(this.selectedDate())
  );

  constructor() {
    effect(() => {
      const isLoading = this.store.isDetailsLoading();

      if (isLoading) {
        this.clearLoaderTimer();
        this.loaderShownAt = Date.now();
        this.loaderVisible.set(true);
        return;
      }

      if (!this.loaderVisible()) {
        return;
      }

      const elapsed = Date.now() - this.loaderShownAt;
      const remaining = Math.max(0, 360 - elapsed);

      this.clearLoaderTimer();
      this.loaderTimer = setTimeout(() => {
        this.loaderVisible.set(false);
        this.loaderTimer = null;
      }, remaining);
    });

    this.destroyRef.onDestroy(() => this.clearLoaderTimer());
  }

  /**
   * Called when a well name chip is clicked.
   * Loads well data for the selected well and current date.
   */
  protected onWellChipClick(epANum: number): void {
    this.store.selectWell({
      epANum,
      date: this.selectedDateString(),
    });
  }

  protected onDateInputChange(value: string): void {
    const date = parseDateFromInput(value);
    const today = getTodayAtMidnight();
    if (!Number.isNaN(date.getTime()) && date <= today) {
      this.store.setSelectedDate(date);
    }
  }

  private clearLoaderTimer(): void {
    if (this.loaderTimer !== null) {
      clearTimeout(this.loaderTimer);
      this.loaderTimer = null;
    }
  }
}
