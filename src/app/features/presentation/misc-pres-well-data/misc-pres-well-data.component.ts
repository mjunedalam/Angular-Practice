/**
 * MiscPresWellDataComponent — SMART
 * Reads store.miscWellData() directly.
 * No @Input needed.
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { DrillingDataStore } from '@store/drilling-data/drilling-data.store';

@Component({
  selector: 'app-misc-pres-well-data',
  standalone: true,
  imports: [DecimalPipe, MatIconModule],
  templateUrl: './misc-pres-well-data.component.html',
  styleUrl:    './misc-pres-well-data.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiscPresWellDataComponent {
  protected readonly store = inject(DrillingDataStore);

  protected formatSpudDate(val: string): string {
    if (!val || val === 'N/A') return val || 'N/A';
    const d = new Date(val);
    return isNaN(d.getTime()) ? val : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  protected rigMoveTone(value: number | null): 'positive' | 'negative' | 'neutral' {
    if (value == null) {
      return 'neutral';
    }

    return value < 0 ? 'positive' : 'negative';
  }
}
