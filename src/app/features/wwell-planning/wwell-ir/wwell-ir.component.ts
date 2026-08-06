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
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApprovalChainStep, IntegratedRequirement } from '@models/wwell-planning/wwell-planning.model';
import { buildDetailRevealTimeline } from '../shared/dynamic-form/detail-reveal.animation';
import { playIfMotionAllowed } from '../shared/dynamic-form/gsap-motion.util';
import { buildListRowsRevealTimeline } from '../shared/dynamic-form/list-reveal.animation';
import { chainCompletionColor } from '../shared/wwell-approvals/wwell-approvals.config';
import { WwellApprovalMiniChainComponent } from '../shared/wwell-approvals/wwell-approval-timeline/wwell-approval-mini-chain.component';
import { WWELL_DETAIL_LOADING_MS, WwellDetailLoadingComponent } from '../shared/wwell-detail-loading/wwell-detail-loading.component';
import { createPendingSelection } from '../shared/wwell-pending-selection.util';
import { WwellPlanningStore } from '../store/wwell-planning.store';
import { WwellIrDetailComponent } from './wwell-ir-detail/wwell-ir-detail.component';
import { WWELL_IR_STATUS_META } from './wwell-ir.config';

const SNACKBAR_DURATION_MS = 3000;
const SKELETON_ROW_COUNT = 6;

@Component({
  selector: 'app-wwell-ir',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    WwellIrDetailComponent,
    WwellApprovalMiniChainComponent,
    WwellDetailLoadingComponent,
  ],
  templateUrl: './wwell-ir.component.html',
  styleUrl: './wwell-ir.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrComponent implements OnInit, OnDestroy {
  protected readonly store = inject(WwellPlanningStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly isLoading = this.store.integratedRequirementsLoading;
  protected readonly loadError = this.store.integratedRequirementsError;
  protected readonly isSubmittingForReview = this.store.updatingIntegratedRequirementStatus;

  protected readonly searchTerm = signal('');
  protected readonly selectedId = signal<string | null>(null);

  protected readonly rows = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const all = this.store.integratedRequirements();
    if (!term) return all;

    return all.filter(
      ir =>
        ir.code.toLowerCase().includes(term) ||
        ir.requestReference.wellName.toLowerCase().includes(term) ||
        (ir.requestReference.linkedRequestId ?? '').toLowerCase().includes(term) ||
        ir.requestReference.client.toLowerCase().includes(term),
    );
  });

  // Deliberately looks up the *unfiltered* store list (not `rows()`) so narrowing the search
  // never drops the current selection just because it fell outside the filtered results.
  protected readonly selectedIr = computed<IntegratedRequirement | null>(
    () => this.store.integratedRequirements().find(ir => ir.id === this.selectedId()) ?? null,
  );

  protected readonly statusMeta = WWELL_IR_STATUS_META;

  protected readonly skeletonRows = Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => index);

  private readonly pendingSelection = createPendingSelection(WWELL_DETAIL_LOADING_MS);
  protected readonly pendingId = this.pendingSelection.pendingId;
  protected readonly isSelecting = this.pendingSelection.isSelecting;

  @ViewChild('detailHost') private readonly detailHost?: ElementRef<HTMLElement>;
  @ViewChild('listHost') private readonly listHost?: ElementRef<HTMLElement>;
  private previousSelectedId: string | null = null;

  constructor() {
    effect(() => {
      const message = this.store.createIntegratedRequirementError();
      if (message) {
        this.snackBar.open(message, 'Dismiss', { duration: SNACKBAR_DURATION_MS });
      }
    });

    effect(() => {
      const message = this.store.updateIntegratedRequirementStatusError();
      if (message) {
        this.snackBar.open(message, 'Dismiss', { duration: SNACKBAR_DURATION_MS });
      }
    });

    // Default to the first record once the list loads — mirrors the reference app, which
    // always has something selected in the detail pane rather than starting on an empty state.
    effect(() => {
      const all = this.store.integratedRequirements();
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

      const items = Array.from(host.querySelectorAll<HTMLElement>('.wwell-ir__row'));
      if (items.length) playIfMotionAllowed(buildListRowsRevealTimeline(items));
    });
  }

  ngOnInit(): void {
    this.store.loadIntegratedRequirements();
  }

  ngOnDestroy(): void {
    this.pendingSelection.clear();
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }

  protected selectIr(id: string): void {
    this.pendingSelection.select(id, this.selectedId(), resolvedId => this.selectedId.set(resolvedId));
  }

  protected openNewIrPage(): void {
    this.router.navigate(['new'], { relativeTo: this.route });
  }

  protected chainBorderColor(chain: readonly ApprovalChainStep[]): string {
    return chainCompletionColor(chain);
  }

  protected submitForReview(ir: IntegratedRequirement): void {
    this.store.submitIntegratedRequirementForReview(ir);
  }
}
