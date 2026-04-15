/**
 * WellNameChipsComponent — SMART
 * Injects WellStore — reads pagedWellNames, selectedEpANum, pagination signals.
 * Calls store.selectWell(), store.nextPage(), store.prevPage() directly.
 * Includes date picker for loading well data from specific dates.
 * Zero @Input / @Output needed.
 */
import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { WellStore } from 'src/app/core/store/well.store';
import { formatDateForInput, parseDateFromInput } from 'src/app/utils/date.util';

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
    if (!Number.isNaN(date.getTime())) {
      this.store.setSelectedDate(date);
    }
  }
}
