/**
 * WellNameChipsComponent — SMART
 * Injects WellStore — reads pagedWellNames, selectedEpANum, pagination signals.
 * Calls store.selectWell(), store.nextPage(), store.prevPage() directly.
 * Zero @Input / @Output needed.
 */
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { WellStore } from 'src/app/core/store/well.store';

@Component({
  selector: 'app-well-name-chips',
  standalone: true,
  imports: [NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './well-name-chips.component.html',
  styleUrl:    './well-name-chips.component.scss',
})
export class WellNameChipsComponent {
  protected readonly store = inject(WellStore);

  protected readonly pageLabel = computed(() =>
    `${this.store.wellNamesPage() + 1} / ${this.store.totalPages()}`
  );
}