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
import { NotificationService } from '@shared/components/notification/notification.service';
import { ApprovalChainStep } from '@models/wwell-planning/wwell-planning.model';
import { IntegratedRequirement } from '@models/wwell-planning/integrated-requirement.model';
import { buildDetailRevealTimeline } from '../shared/dynamic-form/detail-reveal.animation';
import { playIfMotionAllowed } from '../shared/dynamic-form/gsap-motion.util';
import { buildListRowsRevealTimeline } from '../shared/dynamic-form/list-reveal.animation';
import { chainCompletionColor } from '../shared/wwell-approvals/wwell-approvals.config';
import { WWELL_DETAIL_LOADING_MS, WwellDetailLoadingComponent } from '../shared/wwell-detail-loading/wwell-detail-loading.component';
import { createPendingSelection } from '../shared/wwell-pending-selection.util';
import { WwellIrStore } from './store/wwell-ir.store';
import { WwellIrDetailComponent } from './wwell-ir-detail/wwell-ir-detail.component';
import { WWELL_IR_STATUS_META } from './wwell-ir.config';

const SKELETON_ROW_COUNT = 6;

@Component({
  selector: 'app-wwell-ir',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatIconModule,
    WwellIrDetailComponent,
    WwellDetailLoadingComponent,
  ],
  templateUrl: './wwell-ir.component.html',
  styleUrl: './wwell-ir.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrComponent implements OnInit, OnDestroy {
  protected readonly store = inject(WwellIrStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notify = inject(NotificationService);

  protected readonly isLoading = this.store.irsLoading;
  protected readonly loadError = this.store.irsError;
  protected readonly isSubmittingForReview = this.store.updatingIrStatus;
  protected readonly isLoadingDetail = this.store.irDetailLoading;
  protected readonly isLoadingApprovalTimeline = this.store.irApprovalTimelineLoading;

  protected readonly searchTerm = signal('');
  // ir_seq is the real primary key once an IR is saved (see integrated-requirement.model.ts) —
  // selection is keyed on it directly, not the display-only `code`/`id` string, so it can be
  // handed straight to loadIrDetail() below without a lookup.
  protected readonly selectedIrSeq = signal<number | null>(null);

  protected readonly rows = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const all = this.store.irs();
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
    () => this.store.irs().find(ir => ir.irSeq === this.selectedIrSeq()) ?? null,
  );

  // Identity/order of the *visible set* of rows, not the row objects themselves — selecting a row
  // patches that one IR's `chain` in place (loadIrDetail / loadIrApprovalTimeline both replace
  // `irs` with a new array reference), which would otherwise look identical to "the result set changed" to a plain
  // `rows()` reference check below and replay the list-reveal animation across every row on every
  // click. This string only changes on an actual add/remove/reorder/filter.
  protected readonly rowsSignature = computed(() => this.rows().map(ir => ir.irSeq ?? ir.id).join('|'));

  protected readonly statusMeta = WWELL_IR_STATUS_META;

  protected readonly skeletonRows = Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => index);

  private readonly pendingSelection = createPendingSelection<number>(WWELL_DETAIL_LOADING_MS);
  protected readonly pendingId = this.pendingSelection.pendingId;
  // Shows the loading UI for the cosmetic selection transition *and* the real detail fetch it
  // now kicks off — otherwise the shimmer could resolve before the fetch does, briefly exposing
  // stale summary-only fields (blank casing/tops) before the enriched detail lands.
  protected readonly isSelecting = computed(
    () => this.pendingSelection.isSelecting() || this.isLoadingDetail() || this.isLoadingApprovalTimeline(),
  );

  @ViewChild('detailHost') private readonly detailHost?: ElementRef<HTMLElement>;
  @ViewChild('listHost') private readonly listHost?: ElementRef<HTMLElement>;
  private previousSelectedIrSeq: number | null = null;

  constructor() {
    effect(() => {
      const message = this.store.createIrError();
      if (message) this.notify.error(message);
    });

    effect(() => {
      const message = this.store.updateIrStatusError();
      if (message) this.notify.error(message);
    });

    effect(() => {
      const message = this.store.irDetailError();
      if (message) this.notify.error(message);
    });

    effect(() => {
      const message = this.store.irApprovalTimelineError();
      if (message) this.notify.error(message);
    });

    // Default to the first record once the list loads — mirrors the reference app, which
    // always has something selected in the detail pane rather than starting on an empty state.
    effect(() => {
      const all = this.store.irs();
      const firstIrSeq = all[0]?.irSeq;
      if (firstIrSeq != null && this.selectedIrSeq() === null) {
        this.selectedIrSeq.set(firstIrSeq);
      }
    });

    // Selection changed → play the reveal transition and fetch that record's real detail
    // (casing/tops/hydrogeology) by ir_seq, its primary key.
    effect(() => {
      const irSeq = this.selectedIrSeq();
      if (irSeq === null || irSeq === this.previousSelectedIrSeq) return;

      const host = this.detailHost?.nativeElement;
      if (host) playIfMotionAllowed(buildDetailRevealTimeline(host));
      this.previousSelectedIrSeq = irSeq;
      this.store.loadIrDetail(irSeq);
      // Separate call — the approval-process API doesn't exist yet (mocked for now), but the
      // request shape already mirrors the real future one: one fetch per selected IR.
      this.store.loadIrApprovalTimeline(irSeq);
    });

    // Re-plays whenever the visible rows actually change (initial load finishing, or the
    // search term narrowing/widening the result set) — keyed on `rowsSignature()` (identity/order
    // only), not `rows()` itself, so a selected row's detail/timeline arriving in place never
    // replays this across the whole list — see `rowsSignature`'s comment above.
    effect(() => {
      const signature = this.rowsSignature();
      if (this.isLoading() || signature === '') return;

      const host = this.listHost?.nativeElement;
      if (!host) return;

      const items = Array.from(host.querySelectorAll<HTMLElement>('.wwell-ir__row'));
      if (items.length) playIfMotionAllowed(buildListRowsRevealTimeline(items));
    });
  }

  ngOnInit(): void {
    this.store.loadIrs();
  }

  ngOnDestroy(): void {
    this.pendingSelection.clear();
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }

  protected selectIr(irSeq: number): void {
    this.pendingSelection.select(irSeq, this.selectedIrSeq(), resolved => this.selectedIrSeq.set(resolved));
  }

  /** Normalizes the model's `irSeq?: number | null` to a plain `number | null` for the template
   *  (which can't express an `== null` check under the eqeqeq lint rule). */
  protected rowIrSeq(ir: IntegratedRequirement): number | null {
    return ir.irSeq ?? null;
  }

  protected selectIrRow(ir: IntegratedRequirement): void {
    const irSeq = this.rowIrSeq(ir);
    if (irSeq !== null) this.selectIr(irSeq);
  }

  protected editIr(ir: IntegratedRequirement): void {
    const irSeq = this.rowIrSeq(ir);
    if (irSeq === null) return;
    this.router.navigate(['edit', irSeq], { relativeTo: this.route });
  }

  protected openNewIrPage(): void {
    this.router.navigate(['new'], { relativeTo: this.route });
  }

  protected chainBorderColor(chain: readonly ApprovalChainStep[]): string {
    return chainCompletionColor(chain);
  }

  protected submitForReview(ir: IntegratedRequirement): void {
    this.store.submitIrForReview(ir);
  }
}
