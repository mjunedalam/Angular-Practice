import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  ApprovalChainStep,
  ApprovalRequestBase,
  ApprovalWorkflowStatus,
} from '@models/wwell-planning/wwell-planning.model';
import { WwellStatusMeta } from '../../shared/wwell-status.config';
import { WwellApprovalMiniChainComponent } from '../wwell-approval-timeline/wwell-approval-mini-chain.component';
import { WwellApprovalTimelineComponent } from '../wwell-approval-timeline/wwell-approval-timeline.component';

export interface WwellApprovalTableColumn<T> {
  readonly header: string;
  readonly value: (row: T) => string;
}

const FIXED_COLUMN_COUNT = 8;

@Component({
  selector: 'app-wwell-approval-table',
  standalone: true,
  imports: [MatIconModule, WwellApprovalMiniChainComponent, WwellApprovalTimelineComponent],
  templateUrl: './wwell-approval-table.component.html',
  styleUrl: './wwell-approval-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellApprovalTableComponent<T extends ApprovalRequestBase> {
  readonly rows = input.required<readonly T[]>();
  readonly columns = input<readonly WwellApprovalTableColumn<T>[]>([]);
  readonly statusMeta = input.required<Record<ApprovalWorkflowStatus, WwellStatusMeta>>();
  readonly expandedIds = input.required<ReadonlySet<string>>();
  readonly downloadingIds = input.required<ReadonlySet<string>>();
  readonly approvalKindLabel = input.required<string>();

  readonly rowToggle = output<string>();
  readonly pdfDownload = output<T>();

  protected readonly colspan = computed(() => FIXED_COLUMN_COUNT + this.columns().length);

  protected isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }

  protected isDownloading(id: string): boolean {
    return this.downloadingIds().has(id);
  }

  protected isChainComplete(chain: readonly ApprovalChainStep[]): boolean {
    return chain.length > 0 && chain.every(step => step.status === 'approved');
  }

  protected pdfButtonLabel(row: T): string {
    return this.isDownloading(row.id) ? 'Preparing…' : `${this.approvalKindLabel()}.pdf`;
  }

  protected pdfAriaLabel(row: T): string {
    return `Download ${this.approvalKindLabel()} approval PDF for ${row.reqNo}`;
  }

  protected toggleAriaLabel(row: T): string {
    return `${this.isExpanded(row.id) ? 'Hide' : 'View'} approval chain for ${row.reqNo}`;
  }
}
