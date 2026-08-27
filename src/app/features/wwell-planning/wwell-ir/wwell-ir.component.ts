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
import { FormBuilder, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '@shared/components/notification/notification.service';
import { ApprovalChainStep } from '@models/wwell-planning/wwell-planning.model';
import { IntegratedRequirement, IntegratedRequirementStatus } from '@models/wwell-planning/integrated-requirement.model';
import { buildDetailRevealTimeline } from '../shared/dynamic-form/detail-reveal.animation';
import { playIfMotionAllowed } from '../shared/dynamic-form/gsap-motion.util';
import { buildListRowsRevealTimeline } from '../shared/dynamic-form/list-reveal.animation';
import { chainCompletionColor } from '../shared/wwell-approvals/wwell-approvals.config';
import { WWELL_DETAIL_LOADING_MS, WwellDetailLoadingComponent } from '../shared/wwell-detail-loading/wwell-detail-loading.component';
import { createPendingSelection } from '../shared/wwell-pending-selection.util';
import { WwellIrStore } from './store/wwell-ir.store';
import { WwellIrEditorComponent } from './wwell-ir-editor/wwell-ir-editor.component';
import { buildWwellDynamicForm } from '../shared/dynamic-form/wwell-dynamic-form.builder';
import { mapIrFormValueToSubmission } from './wwell-ir-form/wwell-ir-form.mapper';
import { buildWwellIrBulkSavePayload } from './wwell-ir-form/wwell-ir-payload.mapper';
import { WWELL_IR_FORM_SCHEMA } from './wwell-ir-form/wwell-ir-form.schema';
import { WwellIrFormRawValue } from './wwell-ir-form/wwell-ir-form.types';
import { WWELL_IR_STATUS_META } from './wwell-ir.config';

const SKELETON_ROW_COUNT = 6;

/** Coarse lifecycle split for the master list's top toggle — "Active" is every status before the
 *  record leaves the author's hands, "Inactive" is the one terminal status. Kept separate from the
 *  finer-grained `statusFilter` chips below (which only make sense to show *within* Active, since
 *  Inactive only ever has one possible status). */
type WwellIrLifecycleFilter = 'active' | 'inactive';

const WWELL_IR_ACTIVE_STATUSES: readonly IntegratedRequirementStatus[] = [
  'draft',
  'in-progress',
  'submit-for-review',
  'in-review',
];

@Component({
  selector: 'app-wwell-ir',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatIconModule, WwellIrEditorComponent, WwellDetailLoadingComponent],
  templateUrl: './wwell-ir.component.html',
  styleUrl: './wwell-ir.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrComponent implements OnInit, OnDestroy {
  protected readonly store = inject(WwellIrStore);
  private readonly fb = inject(FormBuilder);
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

  protected readonly lifecycleFilter = signal<WwellIrLifecycleFilter>('active');
  protected readonly statusFilter = signal<IntegratedRequirementStatus | 'all'>('all');
  // Sub-filter chips shown only in the Active bucket — Inactive is exactly one status
  // (approved), so there's nothing left to narrow further once that's selected.
  protected readonly statusChips: readonly (IntegratedRequirementStatus | 'all')[] = ['all', ...WWELL_IR_ACTIVE_STATUSES];

  // Scoped by the lifecycle toggle only (not the status chip or search term) so chip counts stay
  // stable while the user narrows further — each chip shows how many rows *it* would reveal, not
  // how many remain after some other filter already trimmed the set.
  private readonly lifecycleScopedIrs = computed(() => {
    const all = this.store.irs();
    return this.lifecycleFilter() === 'inactive'
      ? all.filter(ir => ir.status === 'approved')
      : all.filter(ir => WWELL_IR_ACTIVE_STATUSES.includes(ir.status));
  });

  protected readonly rows = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const status = this.statusFilter();
    const scoped = this.lifecycleScopedIrs().filter(ir => status === 'all' || ir.status === status);
    if (!term) return scoped;

    return scoped.filter(
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

  // Scopes the "select the just-created draft" effect below to createNewIr()'s own call —
  // WwellIrEditorComponent also drives store.creatingIr() (for its own Save/Submit actions on the
  // *already*-selected record), and without this flag a save completing there could clobber a
  // selection the user already moved on to.
  private wasCreatingNewIr = false;
  private isCreatingNewIr = false;

  constructor() {
    effect(() => {
      const message = this.store.createIrError();
      if (message) this.notify.error(message);
    });

    effect(() => {
      const creating = this.store.creatingIr();
      if (this.wasCreatingNewIr && !creating && this.isCreatingNewIr) {
        this.isCreatingNewIr = false;
        if (!this.store.createIrError()) {
          const newIrSeq = this.store.draftIrSeq();
          if (newIrSeq !== null) this.selectedIrSeq.set(newIrSeq);
        }
      }
      this.wasCreatingNewIr = creating;
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

    // Default to the first *visible* record once the list loads — mirrors the reference app,
    // which always has something selected in the detail pane rather than starting on an empty
    // state. Reads `rows()` (lifecycle/status/search-scoped), not the raw store list, so the
    // default selection is never a row the Active/Inactive toggle is currently hiding.
    effect(() => {
      const firstIrSeq = this.rows()[0]?.irSeq;
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

  /** Switching lifecycle bucket resets the status chip back to "All" — a chip selected in the old
   *  bucket (e.g. "In Review") would otherwise carry over into Inactive, where it can never match
   *  anything, silently showing an empty list. */
  protected setLifecycleFilter(filter: WwellIrLifecycleFilter): void {
    this.lifecycleFilter.set(filter);
    this.statusFilter.set('all');
  }

  protected toggleLifecycleFilter(): void {
    this.setLifecycleFilter(this.lifecycleFilter() === 'active' ? 'inactive' : 'active');
  }

  protected setStatusFilter(status: IntegratedRequirementStatus | 'all'): void {
    this.statusFilter.set(status);
  }

  protected statusChipLabel(status: IntegratedRequirementStatus | 'all'): string {
    return status === 'all' ? 'All' : this.statusMeta[status].label;
  }

  protected statusChipCount(status: IntegratedRequirementStatus | 'all'): number {
    const scoped = this.lifecycleScopedIrs();
    return status === 'all' ? scoped.length : scoped.filter(ir => ir.status === status).length;
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

  /** Creates a blank draft in place and selects it — no route change. WwellIrEditorComponent
   *  (rendered once the new record's status makes it selected+editable, see isEditableStatus)
   *  then owns everything about actually filling it in. */
  protected createNewIr(): void {
    const raw = buildWwellDynamicForm(WWELL_IR_FORM_SCHEMA, this.fb).getRawValue() as WwellIrFormRawValue;
    const { payload } = mapIrFormValueToSubmission(raw, 'draft');
    const irBulkPayload = buildWwellIrBulkSavePayload(raw, { irSeq: null, existing: null });
    this.isCreatingNewIr = true;
    this.store.createIr(payload, irBulkPayload, []);
  }

  protected chainBorderColor(chain: readonly ApprovalChainStep[]): string {
    return chainCompletionColor(chain);
  }
}
