/**
 * WellNameChipsComponent — SMART
 * Injects WellStore — reads pagedWellNames, selectedEpANum, pagination signals.
 * Calls store.selectWell(), store.nextPage(), store.prevPage() directly.
 * Includes date picker for loading well data from specific dates.
 * Zero @Input / @Output needed.
 */
import { ChangeDetectionStrategy, Component, computed, effect, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { NgClass } from '@angular/common';
import { WellStore } from 'src/app/core/store/well.store';
import { ThemeStore } from 'src/app/core/store/theme/theme.store';
import { formatDateForInput, parseDateFromInput } from 'src/utils/date.util';

@Component({
  selector: 'app-well-name-chips',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './well-name-chips.component.html',
  styleUrl:    './well-name-chips.component.scss',
})
export class WellNameChipsComponent implements AfterViewInit {
  protected readonly store = inject(WellStore);
  protected readonly themeStore = inject(ThemeStore);

  @ViewChild('dateInput') dateInput?: ElementRef<HTMLInputElement>;

  protected readonly pageLabel = computed(() =>
    `${this.store.wellNamesPage() + 1} / ${this.store.totalPages()}`
  );

  protected readonly formattedDate = computed(() =>
    formatDateForInput(this.store.selectedDate())
  );

  ngAfterViewInit(): void {
    const input = this.dateInput?.nativeElement;
    if (!input) return;

    // Set color-scheme based on current theme
    effect(() => {
      input.style.colorScheme = this.themeStore.mode();
    });

    // Open date picker when clicking anywhere on the input
    input.addEventListener('click', (e: Event) => {
      e.preventDefault();
      e.stopPropagation();

      // Use showPicker() if available (modern browsers), fallback to focus+click
      if ('showPicker' in input && typeof input.showPicker === 'function') {
        input.showPicker();
      } else {
        input.focus();
        input.click();
      }
    });
  }

  /**
   * Called when a well name chip is clicked.
   * Loads well data for the selected well and current date.
   */
  protected onWellChipClick(epANum: number): void {
    this.store.selectWell({
      epANum,
      date: this.store.selectedDate(),
    });
  }

  /**
   * Called when the date picker value changes.
   * Updates the selected date and reloads well data if a well is selected.
   */
  protected onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.value) {
      const newDate = parseDateFromInput(input.value);
      this.store.setSelectedDate(newDate);
    }
  }
}