/**
 * MiscPresWellDataComponent — SMART
 * Reads store.miscWellData() directly.
 * No @Input needed.
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { PresentationStore } from '../store/presentation.store';

@Component({
  selector: 'app-misc-pres-well-data',
  standalone: true,
  imports: [DecimalPipe, MatIconModule],
  templateUrl: './misc-pres-well-data.component.html',
  styleUrl:    './misc-pres-well-data.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiscPresWellDataComponent {
  protected readonly store = inject(PresentationStore);

  protected formatSpudDate(val: string): string {
    if (!val || val === 'N/A') return val || 'N/A';
    // strip time suffix like "@0500" before parsing
    const datePart = val.split('@')[0].trim();
    const d = new Date(datePart);
    return isNaN(d.getTime()) ? datePart : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  protected rigMoveTone(value: number | null): 'positive' | 'negative' | 'neutral' {
    if (value == null) {
      return 'neutral';
    }

    return value < 0 ? 'positive' : 'negative';
  }
}
