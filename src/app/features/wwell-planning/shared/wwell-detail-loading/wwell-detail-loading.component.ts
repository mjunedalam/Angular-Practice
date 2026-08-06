import { ChangeDetectionStrategy, Component } from '@angular/core';

/** How long the shimmer plays before the real detail content swaps in — see `selectRow()`
 * in each list page. Short enough to read as a transition, not a wait. */
export const WWELL_DETAIL_LOADING_MS = 260;

@Component({
  selector: 'app-wwell-detail-loading',
  standalone: true,
  imports: [],
  templateUrl: './wwell-detail-loading.component.html',
  styleUrl: './wwell-detail-loading.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellDetailLoadingComponent {}
