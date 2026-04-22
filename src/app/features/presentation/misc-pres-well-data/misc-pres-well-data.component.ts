/**
 * MiscPresWellDataComponent — SMART
 * Reads store.miscWellData() directly.
 * No @Input needed.
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { WellStore } from '@store/active-wwell/active-wwell.store';

@Component({
  selector: 'app-misc-pres-well-data',
  standalone: true,
  imports: [DecimalPipe, MatIconModule],
  templateUrl: './misc-pres-well-data.component.html',
  styleUrl:    './misc-pres-well-data.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiscPresWellDataComponent {
  protected readonly store = inject(WellStore);
  // In template: store.miscWellData()?.wellName etc.
}