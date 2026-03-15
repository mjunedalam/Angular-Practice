/**
 * OffsetWwellsComponent — SMART
 * Reads store.offsetWells() directly.
 * No @Input needed.
 */
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { WellStore } from 'src/app/core/store/well.store';

@Component({
  selector: 'app-offset-wwells',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './offset-wwells.component.html',
  styleUrl: './offset-wwells.component.scss',
})
export class OffsetWwellsComponent {
  protected readonly store = inject(WellStore);
  // Local UI state — accordion index is not global, belongs here
  protected readonly selectedIndex = signal<number>(0);

  selectTab(index: number): void {
    this.selectedIndex.set(this.selectedIndex() === index ? -1 : index);
  }
}