import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { ApprovalChainStep, IrApproval, LandAffairsApproval, WldaApproval } from '@models/wwell-planning/wwell-planning.model';
import { WwellPlanningService } from '../wwell-planning.service';
import { WwellPlanningStore } from '../store/wwell-planning.store';
import { WWELL_APPROVAL_STATUS_META } from './wwell-approvals.config';
import { WwellApprovalMiniChainComponent } from './wwell-approval-timeline/wwell-approval-mini-chain.component';
import { WwellApprovalTimelineComponent } from './wwell-approval-timeline/wwell-approval-timeline.component';
import { WwellWldaRequestFormComponent } from './wwell-wlda-request-form/wwell-wlda-request-form.component';
import { WwellLandAffairsRequestFormComponent } from './wwell-land-affairs-request-form/wwell-land-affairs-request-form.component';
import { WwellIrApprovalRequestFormComponent } from './wwell-ir-approval-request-form/wwell-ir-approval-request-form.component';

interface SearchableApproval {
  readonly reqNo: string;
  readonly client: string;
  readonly wellName: string;
}

const SNACKBAR_DURATION_MS = 3000;
const DOWNLOAD_URL_REVOKE_DELAY_MS = 5000;

@Component({
  selector: 'app-wwell-approvals',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatIconModule, WwellApprovalMiniChainComponent, WwellApprovalTimelineComponent],
  templateUrl: './wwell-approvals.component.html',
  styleUrl: './wwell-approvals.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellApprovalsComponent implements OnInit {
  protected readonly store = inject(WwellPlanningStore);
  private readonly svc = inject(WwellPlanningService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  protected readonly isLoading = this.store.approvalsLoading;
  protected readonly hasError = this.store.hasError;
  protected readonly errorMessage = this.store.error;

  protected readonly statusMeta = WWELL_APPROVAL_STATUS_META;

  protected readonly searchTerm = signal('');
  private readonly expandedIds = signal<ReadonlySet<string>>(new Set());
  private readonly downloadingIds = signal<ReadonlySet<string>>(new Set());

  protected readonly wldaRows = computed(() => this.filterRows(this.store.wldaApprovals()));
  protected readonly landAffairsRows = computed(() => this.filterRows(this.store.landAffairsApprovals()));
  protected readonly irRows = computed(() => this.filterRows(this.store.irApprovals()));

  protected readonly totalCount = computed(
    () =>
      this.store.wldaApprovals().length +
      this.store.landAffairsApprovals().length +
      this.store.irApprovals().length,
  );

  ngOnInit(): void {
    this.store.loadApprovals();
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }

  protected isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }

  protected toggleRow(id: string): void {
    const next = new Set(this.expandedIds());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.expandedIds.set(next);
  }

  protected openWldaRequestDialog(): void {
    this.dialog
      .open(WwellWldaRequestFormComponent, { panelClass: 'wwell-wlda-request-form-panel', maxWidth: '95vw', autoFocus: false })
      .afterClosed()
      .subscribe(result => {
        if (!result) return;
        if (result.mode === 'draft') {
          this.snackBar.open('WLDA request saved as draft.', 'Dismiss', { duration: SNACKBAR_DURATION_MS });
          return;
        }
        this.store.submitWldaApproval(result.payload, result.files);
        this.snackBar.open('WLDA approval request submitted.', 'Dismiss', { duration: SNACKBAR_DURATION_MS });
      });
  }

  protected openLandAffairsRequestDialog(): void {
    this.dialog
      .open(WwellLandAffairsRequestFormComponent, {
        panelClass: 'wwell-land-affairs-request-form-panel',
        maxWidth: '95vw',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe(result => {
        if (!result) return;
        if (result.mode === 'draft') {
          this.snackBar.open('Land Affairs request saved as draft.', 'Dismiss', { duration: SNACKBAR_DURATION_MS });
          return;
        }
        this.store.submitLandAffairsApproval(result.payload, result.files);
        this.snackBar.open('Land Affairs approval request submitted.', 'Dismiss', { duration: SNACKBAR_DURATION_MS });
      });
  }

  protected openIrApprovalRequestDialog(): void {
    this.dialog
      .open(WwellIrApprovalRequestFormComponent, {
        panelClass: 'wwell-ir-approval-request-form-panel',
        maxWidth: '95vw',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe(result => {
        if (!result) return;
        if (result.mode === 'draft') {
          this.snackBar.open('IR request saved as draft.', 'Dismiss', { duration: SNACKBAR_DURATION_MS });
          return;
        }
        this.store.submitIrApproval(result.payload, result.files);
        this.snackBar.open('IR approval request submitted.', 'Dismiss', { duration: SNACKBAR_DURATION_MS });
      });
  }

  protected isChainComplete(chain: readonly ApprovalChainStep[]): boolean {
    return chain.length > 0 && chain.every(step => step.status === 'approved');
  }

  protected isDownloading(id: string): boolean {
    return this.downloadingIds().has(id);
  }

  protected downloadWldaPdf(row: WldaApproval): void {
    this.downloadPdf(row.id, `${row.reqNo}-WLDA.pdf`, this.svc.getWldaApprovalPdf(row));
  }

  protected downloadLandAffairsPdf(row: LandAffairsApproval): void {
    this.downloadPdf(row.id, `${row.reqNo}-Land-Affairs.pdf`, this.svc.getLandAffairsApprovalPdf(row));
  }

  protected downloadIrPdf(row: IrApproval): void {
    this.downloadPdf(row.id, `${row.reqNo}-IR.pdf`, this.svc.getIrApprovalPdf(row));
  }

  private downloadPdf(id: string, fileName: string, request$: Observable<Blob>): void {
    if (this.isDownloading(id)) return;

    this.setDownloading(id, true);
    request$.subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        setTimeout(() => URL.revokeObjectURL(url), DOWNLOAD_URL_REVOKE_DELAY_MS);
        this.setDownloading(id, false);
      },
      error: () => {
        this.setDownloading(id, false);
        this.snackBar.open('Failed to download the approval PDF.', 'Dismiss', { duration: SNACKBAR_DURATION_MS });
      },
    });
  }

  private setDownloading(id: string, isDownloading: boolean): void {
    const next = new Set(this.downloadingIds());
    if (isDownloading) {
      next.add(id);
    } else {
      next.delete(id);
    }
    this.downloadingIds.set(next);
  }

  private filterRows<T extends SearchableApproval>(rows: readonly T[]): T[] {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return [...rows];

    return rows.filter(
      row =>
        row.reqNo.toLowerCase().includes(term) ||
        row.client.toLowerCase().includes(term) ||
        row.wellName.toLowerCase().includes(term),
    );
  }
}
