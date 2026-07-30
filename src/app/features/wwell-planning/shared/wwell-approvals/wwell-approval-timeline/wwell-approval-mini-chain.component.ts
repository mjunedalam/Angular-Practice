import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ApprovalChainStep } from '@models/wwell-planning/wwell-planning.model';

@Component({
  selector: 'app-wwell-approval-mini-chain',
  standalone: true,
  imports: [],
  templateUrl: './wwell-approval-mini-chain.component.html',
  styleUrl: './wwell-approval-mini-chain.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellApprovalMiniChainComponent {
  readonly steps = input.required<readonly ApprovalChainStep[]>();
}
