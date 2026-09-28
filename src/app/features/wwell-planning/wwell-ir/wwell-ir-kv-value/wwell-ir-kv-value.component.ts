import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { KvRow } from '../wwell-ir-editor/wwell-ir-detail-rows.util';

/** The value half of a read-only label/value row (editor read display and the view cards). A plain
 *  value is text; an `options` value is listed one pick per line — with a small marker once there is
 *  more than one, so a pick that wraps ("Aquifer Performance Test (APT)") can't read as two. Size,
 *  weight and colour come from the `dd` it sits in. */
@Component({
  selector: 'app-wwell-ir-kv-value',
  standalone: true,
  templateUrl: './wwell-ir-kv-value.component.html',
  styleUrl: './wwell-ir-kv-value.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.kvv--mono]': 'row().mono' },
})
export class WwellIrKvValueComponent {
  readonly row = input.required<KvRow>();

  protected readonly picks = computed(() =>
    this.row()
      .value.split('\n')
      .map(pick => pick.trim())
      .filter(Boolean),
  );
}
