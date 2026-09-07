/**
 * MiscPresWellDataComponent — SMART
 * Reads store.miscWellData() directly.
 * No @Input needed.
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TextExpandModalComponent } from '@shared/components/text-expand-modal/text-expand-modal.component';
import { PresentationStore } from '../store/presentation.store';

// Canonical short BI number keyed by known/aliased backend codes.
const BI_CANONICAL_NUM: Record<string, string> = {
  '33':   '33',
  '58':   '58',
  '34':   '34',
  '1514': '34',  // same formation as 34
  '60':   '60',
};

/**
 * Normalizes a biNum value (e.g. 'BI1514', '1514', 'BI3300', '3300') to its
 * canonical short display number (e.g. '34', '33'). Strips a leading "BI" label
 * and matches padded/aliased backend codes (e.g. '3300' → '33'); falls back to
 * the stripped input when the code isn't recognized.
 */
function resolveBiDisplayNum(biNum: string): string {
  const stripped = biNum.replace(/^bi[\s-]*/i, '').trim();
  if (BI_CANONICAL_NUM[stripped]) return BI_CANONICAL_NUM[stripped];
  const matched = Object.keys(BI_CANONICAL_NUM).find(k => stripped.startsWith(k));
  return matched ? BI_CANONICAL_NUM[matched] : stripped;
}

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
  private readonly dialog = inject(MatDialog);

  protected openExpand(title: string, text: string): void {
    this.dialog.open(TextExpandModalComponent, {
      data: { title, text, readonly: true },
      width: '65vw',
      maxWidth: '95vw',
      minHeight: '50vh',
      panelClass: 'resizable-dialog',
    });
  }

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

  /** Normalizes 'BI1514'/'1514' → '34', 'BI3300'/'3300' → '33', etc. for display. */
  protected biDisplayNum(biNum: string): string {
    return resolveBiDisplayNum(biNum);
  }
}
