import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IntegratedRequirement } from '@models/wwell-planning/wwell-planning.model';
import { WwellApprovalTimelineComponent } from '../../shared/wwell-approvals/wwell-approval-timeline/wwell-approval-timeline.component';
import { WwellIrDesignPreviewComponent } from '../wwell-ir-design-preview/wwell-ir-design-preview.component';
import { WWELL_IR_STATUS_META } from '../wwell-ir.config';

const SUBMITTABLE_STATUSES: readonly IntegratedRequirement['status'][] = ['draft', 'in-progress'];

@Component({
  selector: 'app-wwell-ir-detail',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, WwellIrDesignPreviewComponent, WwellApprovalTimelineComponent],
  templateUrl: './wwell-ir-detail.component.html',
  styleUrl: './wwell-ir-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrDetailComponent {
  readonly ir = input.required<IntegratedRequirement>();
  readonly submitting = input(false);

  readonly submitForReview = output<IntegratedRequirement>();

  protected readonly statusMeta = WWELL_IR_STATUS_META;
  protected readonly canSubmitForReview = computed(() => SUBMITTABLE_STATUSES.includes(this.ir().status));

  protected subSeaFt(depthFt: number): number | null {
    const elevation = this.ir().requestReference.surfaceElevationFtAsl;
    return elevation === null ? null : elevation - depthFt;
  }
}
