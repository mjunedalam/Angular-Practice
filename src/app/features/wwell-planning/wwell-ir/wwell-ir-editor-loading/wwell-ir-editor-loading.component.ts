import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Pure-decoration shimmer shaped like `app-wwell-ir-editor` itself (header, rail, section cards,
 *  tables) — shown in place of the editor while a selected IR's detail is still loading, so the
 *  swap from shimmer to real content reads as a fill-in rather than a layout jump. Kept as its own
 *  component (rather than reusing the generic `app-wwell-detail-loading`) because that one is
 *  shared by several other master-detail pages (Requests, WLDA/Land Affairs Approvals) whose
 *  detail panel has no rail or tables — matching *this* page's skeleton to the editor's actual
 *  structure would misalign every other consumer. See wwell-ir.component.html's `detailMode()`
 *  branch for which shimmer shows when. */
@Component({
  selector: 'app-wwell-ir-editor-loading',
  standalone: true,
  imports: [],
  templateUrl: './wwell-ir-editor-loading.component.html',
  styleUrl: './wwell-ir-editor-loading.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrEditorLoadingComponent {}
