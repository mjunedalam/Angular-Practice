import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { approvalRingPercent, chainCompletionColor, countApprovedSteps } from '../wwell-approvals.config';
import { WwellApprovalTimelineComponent } from '../wwell-approval-timeline/wwell-approval-timeline.component';

/**
 * The "Approval Workflow" card: a progress ring ("N of M approved") over the existing vertical
 * approval timeline. Shared by two call sites that used to each render their own copy of this
 * markup — the main IR page's persistent sidebar (View mode) and the editor's own compact
 * header pill's popover (Edit mode, see WwellIrEditorComponent) — so the two can never drift out
 * of visual sync. Deliberately typed to the whole `IntegratedRequirement`, not just its `chain`/
 * `sapWfId`, since both call sites already have the full record on hand and a narrower input
 * would just mean spreading the same two fields out at each call site instead of here.
 */
@Component({
  selector: 'app-wwell-approval-workflow-card',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, WwellApprovalTimelineComponent],
  templateUrl: './wwell-approval-workflow-card.component.html',
  styleUrl: './wwell-approval-workflow-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellApprovalWorkflowCardComponent {
  readonly ir = input.required<IntegratedRequirement>();
  readonly loading = input(false);

  /** The caller owns the actual refresh call (it already has the store injected) — this component
   *  only renders the button and reports the click. */
  readonly refresh = output<void>();

  protected readonly approvedCount = computed(() => countApprovedSteps(this.ir().chain));
  protected readonly ringPercent = computed(() => approvalRingPercent(this.ir().chain));
  protected readonly chainColor = computed(() => chainCompletionColor(this.ir().chain));

  protected onRefresh(): void {
    this.refresh.emit();
  }
}
