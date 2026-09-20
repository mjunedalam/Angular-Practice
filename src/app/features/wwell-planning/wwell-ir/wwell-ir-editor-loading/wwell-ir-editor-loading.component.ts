import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { WwellIrEditorViewMode } from '../wwell-ir-editor/wwell-ir-editor.component';

/** How many field slots each shimmer card shows — 0 renders a table card instead of a field grid. */
const CARD_FIELD_COUNTS: readonly number[] = [5, 4, 0, 0, 0];

/** Pure-decoration shimmer shaped like `app-wwell-ir-editor` itself (header, rail, section cards,
 *  tables) — shown in place of the editor while a selected IR's detail is still loading, so the
 *  swap from shimmer to real content reads as a fill-in rather than a layout jump. Kept as its own
 *  component (rather than reusing the generic `app-wwell-detail-loading`) because that one is
 *  shared by several other master-detail pages (Requests, WLDA/Land Affairs Approvals) whose
 *  detail panel has no rail or tables — matching *this* page's skeleton to the editor's actual
 *  structure would misalign every other consumer. See wwell-ir.component.html's `detailMode()`
 *  branch for which shimmer shows when.
 *
 *  `viewMode` follows the editor's own Sections/Timeline toggle (WwellIrComponent.editorViewMode,
 *  which outlives the editor), so the shimmer is shaped like the layout that's about to render:
 *  the left rail + stacked cards for Sections, or the dot-and-line stepper with its Wellbore
 *  Preview panel for Timeline. */
@Component({
  selector: 'app-wwell-ir-editor-loading',
  standalone: true,
  imports: [],
  templateUrl: './wwell-ir-editor-loading.component.html',
  styleUrl: './wwell-ir-editor-loading.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrEditorLoadingComponent {
  readonly viewMode = input<WwellIrEditorViewMode>('timeline');

  protected readonly cards = CARD_FIELD_COUNTS.map(count => Array.from({ length: count }, (_, index) => index));
}
