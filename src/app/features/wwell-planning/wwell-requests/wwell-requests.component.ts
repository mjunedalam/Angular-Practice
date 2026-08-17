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
import { WwellPlanningRequest } from '@models/wwell-planning/wwell-planning.model';
import { buildDetailRevealTimeline } from '../shared/dynamic-form/detail-reveal.animation';
import { playIfMotionAllowed } from '../shared/dynamic-form/gsap-motion.util';
import { buildListRowsRevealTimeline } from '../shared/dynamic-form/list-reveal.animation';
import { WWELL_DETAIL_LOADING_MS, WwellDetailLoadingComponent } from '../shared/wwell-detail-loading/wwell-detail-loading.component';
import { createPendingSelection } from '../shared/wwell-pending-selection.util';
import { WwellPlanningStore } from '../store/wwell-planning.store';
import { WWELL_REQUEST_PRIORITY_META, WWELL_REQUEST_STATUS_META } from './wwell-requests.config';
import { WwellRequestFormComponent, WwellRequestFormResult } from './wwell-request-form/wwell-request-form.component';

const SNACKBAR_DURATION_MS = 3000;
const SKELETON_ROW_COUNT = 6;

@Component({
  selector: 'app-wwell-requests',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatIconModule, WwellDetailLoadingComponent],
  templateUrl: './wwell-requests.component.html',
  styleUrl: './wwell-requests.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellRequestsComponent implements OnInit, OnDestroy {
  protected readonly store = inject(WwellPlanningStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly isLoading = this.store.requestsLoading;
  protected readonly isCreating = this.store.creatingRequest;
  protected readonly loadError = this.store.requestsError;

  protected readonly statusMeta = WWELL_REQUEST_STATUS_META;
  protected readonly priorityMeta = WWELL_REQUEST_PRIORITY_META;

  protected readonly searchTerm = signal('');
  protected readonly selectedId = signal<string | null>(null);

  protected readonly skeletonRows = Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => index);

  protected readonly rows = computed(() => this.filterRows(this.store.requests()));

  // Looks up the *unfiltered* store list (not `rows()`) so narrowing the search never drops
  // the current selection just because it fell outside the filtered results — mirrors wwell-ir.
  protected readonly selectedRow = computed<WwellPlanningRequest | null>(
    () => this.store.requests().find(row => row.id === this.selectedId()) ?? null,
  );

  protected readonly totalCount = computed(() => this.store.requests().length);

  private readonly pendingSelection = createPendingSelection<string>(WWELL_DETAIL_LOADING_MS);
  protected readonly pendingId = this.pendingSelection.pendingId;
  protected readonly isSelecting = this.pendingSelection.isSelecting;

  @ViewChild('detailHost') private readonly detailHost?: ElementRef<HTMLElement>;
  @ViewChild('listHost') private readonly listHost?: ElementRef<HTMLElement>;
  private previousSelectedId: string | null = null;

  constructor() {
    effect(() => {
      const message = this.store.createRequestError();
      if (message) {
        this.snackBar.open(message, 'Dismiss', { duration: SNACKBAR_DURATION_MS });
      }
    });

    // Default to the first record once the list loads — mirrors the reference app, which
    // always has something selected in the detail pane rather than starting on an empty state.
    effect(() => {
      const all = this.store.requests();
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

      const items = Array.from(host.querySelectorAll<HTMLElement>('.wreq__row'));
      if (items.length) playIfMotionAllowed(buildListRowsRevealTimeline(items));
    });
  }

  ngOnInit(): void {
    this.store.loadRequests();
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

  protected coordinatesLabel(row: WwellPlanningRequest): string {
    return row.finalCoordinates ? `${row.initialCoordinates} → ${row.finalCoordinates}` : row.initialCoordinates;
  }

  protected openNewRequestDialog(): void {
    this.dialog
      .open<WwellRequestFormComponent, unknown, WwellRequestFormResult | undefined>(WwellRequestFormComponent, {
        data: { mode: 'create' },
        panelClass: 'wwell-request-form-panel',
        maxWidth: '95vw',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe(result => {
        if (!result) return;
        this.store.createRequest(result.payload, result.files);
      });
  }

  protected openViewDialog(request: WwellPlanningRequest): void {
    this.dialog.open(WwellRequestFormComponent, {
      data: { mode: 'view', request },
      panelClass: 'wwell-request-form-panel',
      maxWidth: '95vw',
      autoFocus: false,
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms',
    });
  }

  private filterRows(rows: readonly WwellPlanningRequest[]): WwellPlanningRequest[] {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return [...rows];

    return rows.filter(
      row =>
        row.id.toLowerCase().includes(term) ||
        row.client.toLowerCase().includes(term) ||
        row.wellName.toLowerCase().includes(term) ||
        row.title.toLowerCase().includes(term),
    );
  }
}
