import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { KvRow } from '../../wwell-ir-editor/wwell-ir-detail-rows.util';
import { WwellIrKvValueComponent } from '../../wwell-ir-kv-value/wwell-ir-kv-value.component';

/** Read-only label/value card — one per Details/Well Design section (General Information,
 *  Program Details, Geologist Contact, Estimated Hydrology…). Purely presentational: every
 *  section's actual field selection/formatting already lives in the `KvRow` builders in
 *  wwell-ir-detail-rows.util.ts (shared with WwellIrEditorComponent's own read display), so this
 *  just renders whatever rows it's handed. */
@Component({
  selector: 'app-wwell-ir-view-kv-card',
  standalone: true,
  imports: [WwellIrKvValueComponent],
  templateUrl: './wwell-ir-view-kv-card.component.html',
  styleUrl: './wwell-ir-view-kv-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrViewKvCardComponent {
  readonly title = input.required<string>();
  readonly rows = input.required<readonly KvRow[]>();

  // Two-column, *column-major* fill (first half top-to-bottom on the left, second half on the
  // right) — matches the reference screen's field grouping, not CSS Grid's default row-major
  // auto-placement (which would interleave left/right one field at a time instead). Driven
  // through a CSS custom property (see the stylesheet's `grid-template-rows`) since the row count
  // depends on how many fields this particular card was handed.
  protected readonly rowCount = computed(() => Math.max(1, Math.ceil(this.rows().length / 2)));
}
