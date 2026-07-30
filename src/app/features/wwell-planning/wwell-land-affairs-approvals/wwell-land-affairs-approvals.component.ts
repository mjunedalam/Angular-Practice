import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { LandAffairsApproval } from '@models/wwell-planning/wwell-planning.model';
import { WwellPlanningService } from '../wwell-planning.service';
import { WwellPlanningStore } from '../store/wwell-planning.store';
import { WWELL_APPROVAL_STATUS_META } from '../shared/wwell-approvals/wwell-approvals.config';
import {
  WwellApprovalTableColumn,
  WwellApprovalTableComponent,
} from '../shared/wwell-approvals/wwell-approval-table/wwell-approval-table.component';
import {
  WwellLandAffairsRequestFormComponent,
  WwellLandAffairsRequestFormResult,
} from './wwell-land-affairs-request-form/wwell-land-affairs-request-form.component';

interface SearchableApproval {
  readonly reqNo: string;
  readonly client: string;
  readonly wellName: string;
}

const SNACKBAR_DURATION_MS = 3000;
const DOWNLOAD_URL_REVOKE_DELAY_MS = 5000;

@Component({
  selector: 'app-wwell-land-affairs-approvals',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatIconModule, WwellApprovalTableComponent],
  templateUrl: './wwell-land-affairs-approvals.component.html',
  styleUrl: './wwell-land-affairs-approvals.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellLandAffairsApprovalsComponent implements OnInit {
  protected readonly store = inject(WwellPlanningStore);
  private readonly svc = inject(WwellPlanningService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  protected readonly isLoading = this.store.approvalsLoading;
  protected readonly loadError = this.store.approvalsError;

  protected readonly statusMeta = WWELL_APPROVAL_STATUS_META;

  protected readonly searchTerm = signal('');
  protected readonly expandedIds = signal<ReadonlySet<string>>(new Set());
  protected readonly downloadingIds = signal<ReadonlySet<string>>(new Set());

  protected readonly landAffairsRows = computed(() => this.filterRows(this.store.landAffairsApprovals()));

  protected readonly landAffairsColumns: readonly WwellApprovalTableColumn<LandAffairsApproval>[] = [
    { header: 'X', value: row => row.x },
    { header: 'Y', value: row => row.y },
    { header: 'UTM', value: row => row.utm },
  ];

  protected readonly totalCount = computed(() => this.store.landAffairsApprovals().length);

  constructor() {
    effect(() => {
      const message = this.store.createApprovalError();
      if (message) {
        this.snackBar.open(message, 'Dismiss', { duration: SNACKBAR_DURATION_MS });
      }
    });
  }

  ngOnInit(): void {
    this.store.loadLandAffairsApprovals();
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
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

  protected openLandAffairsRequestDialog(): void {
    this.dialog
      .open<WwellLandAffairsRequestFormComponent, unknown, WwellLandAffairsRequestFormResult>(
        WwellLandAffairsRequestFormComponent,
        { panelClass: 'wwell-land-affairs-request-form-panel', maxWidth: '95vw', autoFocus: false },
      )
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

  protected isDownloading(id: string): boolean {
    return this.downloadingIds().has(id);
  }

  protected downloadLandAffairsPdf(row: LandAffairsApproval): void {
    this.downloadPdf(row.id, `${row.reqNo}-Land-Affairs.pdf`, this.svc.getLandAffairsApprovalPdf(row));
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
