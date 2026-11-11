import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { WldaRecord } from '@models/wwell-planning/wlda.model';
import { WLDA_DIVISION, WLDA_LETTER_TITLE, WLDA_STATUS_META } from '../wlda.config';

/** Live letter preview: every blank field shows an em dash rather than collapsing the layout. */
@Component({
  selector: 'app-wlda-letter',
  standalone: true,
  imports: [DatePipe, MatIconModule],
  templateUrl: './wlda-letter.component.html',
  styleUrl: './wlda-letter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WldaLetterComponent {
  readonly record = input.required<WldaRecord>();

  protected readonly division = WLDA_DIVISION;
  protected readonly title = WLDA_LETTER_TITLE;
  protected readonly statusMeta = computed(() => WLDA_STATUS_META[this.record().status]);
  protected readonly wellLabel = computed(() => this.record().waterWellName.trim() || '—');

  protected orDash(value: string): string {
    return value.trim() || '—';
  }
}
