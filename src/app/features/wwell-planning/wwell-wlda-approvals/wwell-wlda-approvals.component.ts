import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { ApprovalChainStep, WldaApproval } from '@models/wwell-planning/wwell-planning.model';
import { buildDetailRevealTimeline } from '../shared/dynamic-form/detail-reveal.animation';
import { playIfMotionAllowed } from '../shared/dynamic-form/motion.util';
import { buildListRowsRevealTimeline } from '../shared/dynamic-form/list-reveal.animation';
import { WwellPlanningService } from '../wwell-planning.service';
import { WwellPlanningStore } from '../store/wwell-planning.store';
import { WWELL_APPROVAL_STATUS_META, chainCompletionColor } from '../shared/wwell-approvals/wwell-approvals.config';
import { WwellApprovalMiniChainComponent } from '../shared/wwell-approvals/wwell-approval-timeline/wwell-approval-mini-chain.component';
import { WwellApprovalTimelineComponent } from '../shared/wwell-approvals/wwell-approval-timeline/wwell-approval-timeline.component';
import { WWELL_LOAD_DELAY_MS } from '@models/wwell-planning/wwell-planning-loading.constants';
import { WwellDetailLoadingComponent } from '../shared/wwell-detail-loading/wwell-detail-loading.component';
import { createPendingSelection } from '../shared/wwell-pending-selection.util';
import { WwellWldaRequestFormComponent, WwellWldaRequestFormResult } from './wwell-wlda-request-form/wwell-wlda-request-form.component';

const SNACKBAR_DURATION_MS = 3000;
const DOWNLOAD_URL_REVOKE_DELAY_MS = 5000;
const SKELETON_ROW_COUNT = 6;

@Component({
  selector: 'app-wwell-wlda-approvals',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    WwellApprovalMiniChainComponent,
    WwellApprovalTimelineComponent,
    WwellDetailLoadingComponent,
  ],
  templateUrl: './wwell-wlda-approvals.component.html',
  styleUrl: './wwell-wlda-approvals.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellWldaApprovalsComponent implements OnInit, OnDestroy {
  protected readonly store = inject(WwellPlanningStore);
  private readonly svc = inject(WwellPlanningService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  protected readonly isLoading = this.store.approvalsLoading;
  protected readonly loadError = this.store.approvalsError;

  protected readonly statusMeta = WWELL_APPROVAL_STATUS_META;

  protected readonly searchTerm = signal('');
  protected readonly selectedId = signal<string | null>(null);
  protected readonly downloadingIds = signal<ReadonlySet<string>>(new Set());

  protected readonly skeletonRows = Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => index);

  protected readonly rows = computed(() => this.filterRows(this.store.wldaApprovals()));

  // Looks up the *unfiltered* store list (not `rows()`) so narrowing the search never drops
  // the current selection just because it fell outside the filtered results — mirrors wwell-ir.
  protected readonly selectedRow = computed<WldaApproval | null>(
    () => this.store.wldaApprovals().find(row => row.id === this.selectedId()) ?? null,
  );

  protected readonly totalCount = computed(() => this.store.wldaApprovals().length);

  protected readonly canDownloadPdf = computed(() => {
    const row = this.selectedRow();
    return row !== null && this.isChainComplete(row.chain);
  });

  private readonly pendingSelection = createPendingSelection<string>(WWELL_LOAD_DELAY_MS);
  protected readonly pendingId = this.pendingSelection.pendingId;
  protected readonly isSelecting = this.pendingSelection.isSelecting;

  @ViewChild('detailHost') private readonly detailHost?: ElementRef<HTMLElement>;
  @ViewChild('listHost') private readonly listHost?: ElementRef<HTMLElement>;
  private previousSelectedId: string | null = null;

  constructor() {
    effect(() => {
      const message = this.store.createApprovalError();
      if (message) {
        this.snackBar.open(message, 'Dismiss', { duration: SNACKBAR_DURATION_MS });
      }
    });

    // Default to the first record once the list loads — mirrors the reference app, which
    // always has something selected in the detail pane rather than starting on an empty state.
    effect(() => {
      const all = this.store.wldaApprovals();
      if (all.length > 0 && this.selectedId() === null) {
        this.selectedId.set(all[0].id);
      }
    });

    effect(() => {
      const id = this.selectedId();
      if (id === null || id === this.previousSelectedId) return;

      const host = this.detailHost?.nativeElement;
      if (host) playIfMotionAllowed(buildDetailRevealTimeline(host));
      this.previousSelectedId = id;
    });

    // Re-plays whenever the visible rows actually change (initial load finishing, or the
    // search term narrowing/widening the result set) — not on every keystroke that leaves
    // the result set untouched, since `rows()` only changes reference when it does.
    effect(() => {
      const currentRows = this.rows();
      if (this.isLoading() || currentRows.length === 0) return;

      const host = this.listHost?.nativeElement;
      if (!host) return;

      const items = Array.from(host.querySelectorAll<HTMLElement>('.wlda__row'));
      if (items.length) playIfMotionAllowed(buildListRowsRevealTimeline(items));
    });
  }

  ngOnInit(): void {
    this.store.loadWldaApprovals();
  }

  ngOnDestroy(): void {
    this.pendingSelection.clear();
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }

  protected selectRow(id: string): void {
    this.pendingSelection.select(id, this.selectedId(), resolvedId => this.selectedId.set(resolvedId));
  }

  protected openWldaRequestDialog(): void {
    this.dialog
      .open<WwellWldaRequestFormComponent, unknown, WwellWldaRequestFormResult>(WwellWldaRequestFormComponent, {
        panelClass: 'wwell-wlda-request-form-panel',
        maxWidth: '95vw',
        autoFocus: false,
      })
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

  protected isDownloading(id: string): boolean {
    return this.downloadingIds().has(id);
  }

  protected isChainComplete(chain: readonly ApprovalChainStep[]): boolean {
    return chain.length > 0 && chain.every(step => step.status === 'approved');
  }

  protected chainBorderColor(chain: readonly ApprovalChainStep[]): string {
    return chainCompletionColor(chain);
  }

  protected downloadWldaPdf(row: WldaApproval): void {
    this.downloadPdf(row.id, `${row.reqNo}-WLDA.pdf`, this.svc.getWldaApprovalPdf(row));
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

  private filterRows(rows: readonly WldaApproval[]): WldaApproval[] {
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
