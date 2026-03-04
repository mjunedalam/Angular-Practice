import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { DecimalPipe, NgClass } from '@angular/common';
import { OffsetWaterWells } from 'src/app/core/store/well.store';

@Component({
  selector: 'app-offset-wwells',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './offset-wwells.component.html',
  styleUrl: './offset-wwells.component.scss'
})
export class OffsetWwellsComponent {
  // Receives the offset wells array directly from the parent component
  readonly wells = input.required<OffsetWaterWells[]>();

  // Tracks the currently expanded accordion card index (defaults to 0 open)
  readonly selectedIndex = signal<number>(0);

  selectTab(index: number): void {
    // Allows toggling to close the open card, or opening a new one
    this.selectedIndex.set(this.selectedIndex() === index ? -1 : index);
  }
}
