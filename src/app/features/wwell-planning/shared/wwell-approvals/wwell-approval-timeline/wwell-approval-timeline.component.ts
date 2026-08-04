import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ApprovalChainStep } from '@models/wwell-planning/wwell-planning.model';
import { WWELL_APPROVAL_STEP_STATUS_META } from '../wwell-approvals.config';

export type WwellApprovalTimelineOrientation = 'horizontal' | 'vertical';

@Component({
  selector: 'app-wwell-approval-timeline',
  standalone: true,
  imports: [],
  templateUrl: './wwell-approval-timeline.component.html',
  styleUrl: './wwell-approval-timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.approval-timeline--vertical]': "orientation() === 'vertical'",
  },
})
export class WwellApprovalTimelineComponent {
  readonly reqNo = input<string | null>(null);
  readonly steps = input.required<readonly ApprovalChainStep[]>();
  /** 'horizontal' (default) preserves the existing WLDA/Land-Affairs approval-table look. */
  readonly orientation = input<WwellApprovalTimelineOrientation>('horizontal');

  protected readonly stepMeta = WWELL_APPROVAL_STEP_STATUS_META;
}
