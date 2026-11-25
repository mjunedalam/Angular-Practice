import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { prefersReducedMotion } from '../../dynamic-form/motion.util';
import { WwellStatusMeta } from '../../wwell-status.config';
import { WwellApprovalWorkflowCardComponent } from '../wwell-approval-workflow-card/wwell-approval-workflow-card.component';
import { approvalRingPercent, chainCompletionColor, countApprovedSteps } from '../wwell-approvals.config';

const POPOVER_EXIT_MS = 140;

/**
 * The compact header control shared by the IR editor and the WLDA editor: one pill merging the record's status
 * (dot + label) with its approval progress (ring + "n/m"), a refresh button beside it, and the full
 * Approval Workflow card in a CDK overlay popover. The caller owns the data and the actual refresh call.
 */
@Component({
  selector: 'app-wwell-approval-pill',
  standalone: true,
  imports: [OverlayModule, MatButtonModule, MatIconModule, MatTooltipModule, WwellApprovalWorkflowCardComponent],
  templateUrl: './wwell-approval-pill.component.html',
  styleUrl: './wwell-approval-pill.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellApprovalPillComponent {
  readonly approval = input.required<Pick<IntegratedRequirement, 'chain' | 'sapWfId'>>();
  /** Null = no status known yet: the pill shows only the ring, muted. */
  readonly status = input<WwellStatusMeta | null>(null);
  readonly loading = input(false);
  readonly refresh = output<void>();

  protected readonly chain = computed(() => this.approval().chain);
  protected readonly sapWfId = computed(() => this.approval().sapWfId);
  protected readonly approvedCount = computed(() => countApprovedSteps(this.chain()));
  protected readonly ringPercent = computed(() => approvalRingPercent(this.chain()));
  protected readonly chainColor = computed(() => chainCompletionColor(this.chain()));

  protected readonly popoverOpen = signal(false);
  /** True for the length of the exit animation: the overlay stays mounted so the card can fade/scale out. */
  protected readonly popoverClosing = signal(false);
  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly positions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -8 },
  ];

  protected toggle(): void {
    if (this.popoverOpen() && !this.popoverClosing()) {
      this.close();
      return;
    }
    this.cancelClose();
    this.popoverOpen.set(true);
  }

  protected close(): void {
    if (!this.popoverOpen() || this.popoverClosing()) return;
    if (prefersReducedMotion()) {
      this.popoverOpen.set(false);
      return;
    }
    this.popoverClosing.set(true);
    this.closeTimer = setTimeout(() => this.cancelClose(true), POPOVER_EXIT_MS);
  }

  private cancelClose(finish = false): void {
    if (this.closeTimer !== null) clearTimeout(this.closeTimer);
    this.closeTimer = null;
    this.popoverClosing.set(false);
    if (finish) this.popoverOpen.set(false);
  }
}
