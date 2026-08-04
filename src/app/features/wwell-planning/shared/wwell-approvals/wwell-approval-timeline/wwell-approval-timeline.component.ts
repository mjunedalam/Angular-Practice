import { ChangeDetectionStrategy, Component, ElementRef, effect, inject, input } from '@angular/core';
import { ApprovalChainStep } from '@models/wwell-planning/wwell-planning.model';
import { playIfMotionAllowed } from '../../dynamic-form/gsap-motion.util';
import { WWELL_APPROVAL_STEP_STATUS_META } from '../wwell-approvals.config';
import { buildApprovalStepsRevealTimeline } from './wwell-approval-steps-reveal.animation';

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
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly reqNo = input<string | null>(null);
  readonly steps = input.required<readonly ApprovalChainStep[]>();
  /** 'horizontal' (default) preserves the existing WLDA/Land-Affairs approval-table look. */
  readonly orientation = input<WwellApprovalTimelineOrientation>('horizontal');

  protected readonly stepMeta = WWELL_APPROVAL_STEP_STATUS_META;

  constructor() {
    // Replays on first render and on every subsequent `steps()` change (e.g. switching the
    // selected IR in the detail sidebar, or expanding a fresh row in the approval table).
    effect(() => {
      this.steps();

      const items = Array.from(this.elementRef.nativeElement.querySelectorAll<HTMLElement>('.approval-timeline__item'));
      if (items.length) playIfMotionAllowed(buildApprovalStepsRevealTimeline(items));
    });
  }
}
