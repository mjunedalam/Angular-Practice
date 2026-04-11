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
import { DatePickerModule } from 'primeng/datepicker';
import { ProgressBarModule } from 'primeng/progressbar';
import { WellStore } from 'src/app/core/store/well.store';

@Component({
  selector: 'app-well-name-chips',
  standalone: true,
  imports: [NgClass, FormsModule, DatePickerModule, ProgressBarModule],
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
   * Called when the PrimeNG datepicker emits a selected date.
   * Updates the selected date and reloads well data if a well is selected.
   */
  protected onDateSelect(date: Date): void {
    this.store.setSelectedDate(date);
  }
}
