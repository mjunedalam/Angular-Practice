/**
 * WellNameChipsComponent — SMART
 * Injects WellStore — reads pagedWellNames, selectedEpANum, pagination signals.
 * Calls store.selectWell(), store.nextPage(), store.prevPage() directly.
 * Includes date picker for loading well data from specific dates.
 * Zero @Input / @Output needed.
 */
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewChild, computed, effect, inject, Signal, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PresentationStore } from '../store/presentation.store';
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
  @ViewChild('nativeDateInput') private nativeDateInput?: ElementRef<HTMLInputElement>;

  protected readonly store = inject(PresentationStore);
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
    this.commitDate(value);
  }

  protected onDateAutoFormat(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selStart = input.selectionStart ?? 0;
    const rawVal = input.value;

    const digits = rawVal.replace(/\D/g, '').slice(0, 8);

    let formatted = digits;
    if (digits.length >= 5) formatted = digits.slice(0, 4) + '-' + digits.slice(4);
    if (digits.length >= 7) formatted = digits.slice(0, 4) + '-' + digits.slice(4, 6) + '-' + digits.slice(6);

    const oldDashes = (rawVal.slice(0, selStart).match(/-/g) ?? []).length;
    const newDashes = (formatted.slice(0, selStart).match(/-/g) ?? []).length;
    const newCursor = Math.min(selStart + (newDashes - oldDashes), formatted.length);

    input.value = formatted;
    input.setSelectionRange(newCursor, newCursor);

    if (digits.length === 8) {
      this.commitDate(formatted);
    }
  }

  protected onDateTextCommit(value: string): void {
    this.commitDate(value);
  }

  protected openNativePicker(): void {
    this.nativeDateInput?.nativeElement.showPicker?.();
  }

  private commitDate(value: string): void {
    const date = parseDateFromInput(value);
    const today = getTodayAtMidnight();
    if (!Number.isNaN(date.getTime()) && date <= today) {
      const newStr = formatDateForInput(date);
      if (newStr !== this.selectedDateString()) {
        this.store.setDate(newStr);
      }
    }
  }

  protected onNextPageClick(event: Event): void {
    event.preventDefault();
    this.store.nextPage();
  }

  protected onPrevPageClick(event: Event): void {
    event.preventDefault();
    this.store.prevPage();
  }

  private clearLoaderTimer(): void {
    if (this.loaderTimer !== null) {
      clearTimeout(this.loaderTimer);
      this.loaderTimer = null;
    }
  }
}
