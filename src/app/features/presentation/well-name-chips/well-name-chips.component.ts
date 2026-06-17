import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, ViewChild, computed, effect, inject, input, output, Signal, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PresentationStore } from '../store/presentation.store';
import { NotificationService } from '@shared/components/notification/notification.service';
import { blockFutureDigits, clampDateDigits, formatDateForInput, getTodayAtMidnight, parseDateFromInput, validateDateInput } from 'src/app/shared/utils/date.util';

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
  private readonly notify = inject(NotificationService);
  protected readonly maxDateString = formatDateForInput(getTodayAtMidnight());
  protected readonly loaderVisible = signal(false);

  readonly isFullscreen = input(false);
  readonly toggleFullscreen = output<void>();
  readonly toggleWellsOverview = output<void>();

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

    const rawDigits = rawVal.replace(/\D/g, '').slice(0, 8);
    const endsWithHyphen = rawVal.trimEnd().endsWith('-');

    const paddedDigits = (endsWithHyphen && rawDigits.length === 5)
      ? rawDigits.slice(0, 4) + '0' + rawDigits[4]
      : rawDigits;

    const { digits, isFuture } = blockFutureDigits(clampDateDigits(paddedDigits));

    if (isFuture) {
      this.notify.error('Future dates are not allowed');
    }

    let formatted = digits;
    if (digits.length >= 5) formatted = digits.slice(0, 4) + '-' + digits.slice(4);
    if (digits.length >= 7) formatted = digits.slice(0, 4) + '-' + digits.slice(4, 6) + '-' + digits.slice(6);

    const trailingHyphen = endsWithHyphen && !isFuture && (digits.length === 4 || digits.length === 6);
    if (trailingHyphen) formatted += '-';

    const oldDashes = (rawVal.slice(0, selStart).match(/-/g) ?? []).length;
    const newDashes = (formatted.slice(0, selStart).match(/-/g) ?? []).length;
    const newCursor = trailingHyphen
      ? formatted.length
      : Math.min(selStart + (newDashes - oldDashes), formatted.length);

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
    let digits = clampDateDigits(value.trim().replace(/\D/g, '').slice(0, 8));

    if (digits.length < 6) return;

    if (digits.length === 6) digits += '01';
    else if (digits.length === 7) digits = digits.slice(0, 6) + '0' + digits[6];

    const normalized = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;

    const error = validateDateInput(normalized);
    if (error === 'invalid') { this.notify.error('Invalid date — use YYYY-MM-DD format'); return; }
    if (error === 'future')  { this.notify.error('Future dates are not allowed'); return; }

    const newStr = formatDateForInput(parseDateFromInput(normalized));
    if (newStr !== this.selectedDateString()) {
      this.store.setDate(newStr);
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
