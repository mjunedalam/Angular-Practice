import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { ApprovalChainStep } from '@models/wwell-planning/wwell-planning.model';

export type WwellApprovalMiniChainSize = 'default' | 'compact';

@Component({
  selector: 'app-wwell-approval-mini-chain',
  standalone: true,
  imports: [],
  templateUrl: './wwell-approval-mini-chain.component.html',
  styleUrl: './wwell-approval-mini-chain.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.mini-chain--compact]': "size() === 'compact'",
    '[class.mini-chain--stretch]': 'stretch()',
  },
})
export class WwellApprovalMiniChainComponent {
  readonly steps = input.required<readonly ApprovalChainStep[]>();
  /** 'compact' shrinks dots/lines further for tight spaces like a list-row footer. */
  readonly size = input<WwellApprovalMiniChainSize>('default');
  /** Stretches the connector lines to fill the full width of the host instead of sizing to content. */
  readonly stretch = input(false, { transform: booleanAttribute });
}
