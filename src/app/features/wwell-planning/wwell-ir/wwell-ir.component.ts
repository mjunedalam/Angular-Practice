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
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { NotificationService } from '@shared/components/notification/notification.service';
import { ApprovalChainStep } from '@models/wwell-planning/wwell-planning.model';
import { IntegratedRequirement, IntegratedRequirementStatus } from '@models/wwell-planning/integrated-requirement.model';
import { buildDetailRevealTimeline } from '../shared/dynamic-form/detail-reveal.animation';
import { playIfMotionAllowed } from '../shared/dynamic-form/gsap-motion.util';
import { buildListRowsRevealTimeline } from '../shared/dynamic-form/list-reveal.animation';
import { chainCompletionColor } from '../shared/wwell-approvals/wwell-approvals.config';
import { WwellCollapseAnimateDirective } from '../shared/wwell-collapse-animate/wwell-collapse-animate.directive';
import { WWELL_DETAIL_LOADING_MS, WwellDetailLoadingComponent } from '../shared/wwell-detail-loading/wwell-detail-loading.component';
import { createPendingSelection } from '../shared/wwell-pending-selection.util';
import { WwellIrStore } from './store/wwell-ir.store';
import { WwellIrEditorComponent } from './wwell-ir-editor/wwell-ir-editor.component';
import { buildWwellDynamicForm } from '../shared/dynamic-form/wwell-dynamic-form.builder';
import { buildIntegratedRequirementFromPayload } from './wwell-ir-form/wwell-ir-draft.util';
import { mapIrFormValueToSubmission } from './wwell-ir-form/wwell-ir-form.mapper';
import { WWELL_IR_FORM_SCHEMA } from './wwell-ir-form/wwell-ir-form.schema';
import { WwellIrFormRawValue } from './wwell-ir-form/wwell-ir-form.types';
import { WWELL_IR_STATUS_META } from './wwell-ir.config';

const SKELETON_ROW_COUNT = 6;

// Fixed row height the virtual-scroll viewport needs up front to compute which rows are in view
// (see cdk-virtual-scroll-viewport's `itemSize`) — every `.wwell-ir__row-item` is pinned to
// exactly this height in wwell-ir.component.scss so the two never drift out of sync (a mismatch
// shows up as overlapping or gapped rows, since the viewport positions each one by index * itemSize).
const WWELL_IR_ROW_ITEM_SIZE_PX = 84;

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
  imports: [
    FormsModule,
    ScrollingModule,
    MatButtonModule,
    MatIconModule,
    WwellIrEditorComponent,
    WwellDetailLoadingComponent,
    WwellCollapseAnimateDirective,
  ],
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

  // A brand-new IR created via createNewIr() below — never in `store.irs()` (no backend call has
  // happened yet, so there's nothing to add it to) and takes priority over `selectedIrSeq` here.
  // Cleared once its first save actually persists it (see the creatingIr effect below) or the
  // user selects an existing row instead (see selectIrRow), discarding whatever was unsaved.
  protected readonly pendingDraftIr = signal<IntegratedRequirement | null>(null);

  // Deliberately looks up the *unfiltered* store list (not `rows()`) so narrowing the search
  // never drops the current selection just because it fell outside the filtered results.
  protected readonly selectedIr = computed<IntegratedRequirement | null>(
    () => this.pendingDraftIr() ?? this.store.irs().find(ir => ir.irSeq === this.selectedIrSeq()) ?? null,
  );

  // Identity/order of the *visible set* of rows, not the row objects themselves — selecting a row
  // patches that one IR's `chain` in place (loadIrDetail / loadIrApprovalTimeline both replace
  // `irs` with a new array reference), which would otherwise look identical to "the result set changed" to a plain
  // `rows()` reference check below and replay the list-reveal animation across every row on every
  // click. This string only changes on an actual add/remove/reorder/filter.
  protected readonly rowsSignature = computed(() => this.rows().map(ir => ir.irSeq ?? ir.id).join('|'));

  protected readonly statusMeta = WWELL_IR_STATUS_META;

  protected readonly skeletonRows = Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => index);

  // Bound to the viewport's [itemSize] and each row-item's fixed height in the template — see
  // WWELL_IR_ROW_ITEM_SIZE_PX's own comment for why these must stay pinned together.
  protected readonly rowItemSize = WWELL_IR_ROW_ITEM_SIZE_PX;

  private readonly pendingSelection = createPendingSelection<number>(WWELL_DETAIL_LOADING_MS);
  protected readonly pendingId = this.pendingSelection.pendingId;
  // Shows the loading UI for the cosmetic selection transition *and* the real detail fetch it
  // now kicks off — otherwise the shimmer could resolve before the fetch does, briefly exposing
  // stale summary-only fields (blank casing/tops) before the enriched detail lands. Deliberately
  // excludes the approval-timeline flag: that fetch never blocks this panel, including the one
  // real fetch a brand-new record needs right after its first save (see the creatingIr effect
  // below) — re-showing the whole panel as a loading skeleton the instant after a save completes
  // would undo the "seamless save" this effect exists to provide.
  protected readonly isSelecting = computed(() => this.pendingSelection.isSelecting() || this.isLoadingDetail());

  @ViewChild('detailHost') private readonly detailHost?: ElementRef<HTMLElement>;
  // `{ read: ElementRef }` is required now that #listHost sits on <cdk-virtual-scroll-viewport>
  // (a component) — an unqualified @ViewChild query on a component host resolves to that
  // component instance by default, not its native element, which used to be the (unstated)
  // default back when this ref lived on a plain <ul>.
  @ViewChild('listHost', { read: ElementRef }) private readonly listHost?: ElementRef<HTMLElement>;
  private previousSelectedIrSeq: number | null = null;
  private wasCreatingIr = false;

  constructor() {
    effect(() => {
      const message = this.store.createIrError();
      if (message) this.notify.error(message);
    });

    // Reports the real outcome of a save once it settles — the editor deliberately shows nothing
    // at click time (see saveMergedRaw), since the request is still in flight there (its own Save
    // button shows a spinner instead — see wwell-ir-editor.component.html). A failure is already
    // toasted by the createIrError effect above, so only success is announced here.
    //
    // On success, a save that completes while pendingDraftIr is set means *this* draft just got
    // its first real backend row — swap from the local-only draft over to the now-real,
    // ir_seq-keyed record (which store.createIr has already put in `irs`, and already kicked off a
    // silent background refresh of — see WwellIrStore.refreshIrDetail). Future saves then UPDATE
    // instead of re-INSERTing.
    effect(() => {
      const creating = this.store.creatingIr();
      const settled = this.wasCreatingIr && !creating;
      this.wasCreatingIr = creating;
      if (!settled || this.store.createIrError()) return;

      const wasNewIr = this.pendingDraftIr() !== null;
      const savedIrSeq = wasNewIr ? this.store.draftIrSeq() : this.selectedIrSeq();

      if (wasNewIr && savedIrSeq !== null) {
        this.pendingDraftIr.set(null);
        // Deliberately sets `previousSelectedIrSeq` before selecting, so the "selection changed"
        // effect below no-ops for this transition instead of calling loadIrDetail (redundant —
        // refreshIrDetail above already covers it — and it would flip isLoadingDetail(), swapping
        // the whole detail panel to the loading skeleton right after the user just watched this
        // exact record save).
        this.previousSelectedIrSeq = savedIrSeq;
        this.selectedIrSeq.set(savedIrSeq);
        // The one fetch a brand-new record still needs: its local draft never had a real approval
        // chain, only whatever buildIntegratedRequirementFromPayload defaulted it to. Doesn't gate
        // isSelecting() (see that computed's comment), so this never reintroduces the skeleton.
        this.store.loadIrApprovalTimeline(savedIrSeq);
      }

      const savedCode = savedIrSeq !== null ? this.store.irs().find(ir => ir.irSeq === savedIrSeq)?.code : undefined;
      const subject = savedCode ?? 'Integrated requirement';
      this.notify.info(wasNewIr ? `${subject} created successfully.` : `${subject} updated successfully.`);
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
    // default selection is never a row the Active/Inactive toggle is currently hiding. Skipped
    // while a pendingDraftIr is open — selectedIrSeq is intentionally left null throughout
    // drafting (the draft isn't in `rows()`), and this effect would otherwise immediately fetch
    // and select an unrelated real record's detail out from under the still-open draft.
    effect(() => {
      if (this.pendingDraftIr()) return;
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
    // Selecting a real row discards whatever unsaved local draft was open — nothing was ever
    // persisted for it, so there's nothing to preserve.
    this.pendingDraftIr.set(null);
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

  /** `cdkVirtualFor`'s identity function — same identity rule as the old `@for`'s `track`
   *  expression, just spelled as a function since `*cdkVirtualFor` (a plain structural directive,
   *  not the `@for` built-in control flow) takes `trackBy` instead of an inline `track` expression. */
  protected trackByIrRow(_index: number, ir: IntegratedRequirement): number | string {
    return ir.irSeq ?? ir.id;
  }

  /** Opens a blank draft in the detail pane and selects it — purely client-side, no backend call,
   *  since there's nothing to save yet (see this class's `pendingDraftIr`). WwellIrEditorComponent
   *  binds to it exactly like any persisted record; its first real Save (a section's own, or the
   *  global "Save" button) is what actually creates the backend row. */
  protected createNewIr(): void {
    const raw = buildWwellDynamicForm(WWELL_IR_FORM_SCHEMA, this.fb).getRawValue() as WwellIrFormRawValue;
    const { payload } = mapIrFormValueToSubmission(raw, 'draft');
    const draft = buildIntegratedRequirementFromPayload(payload, { id: 'draft', code: 'New IR', irSeq: null }, []);

    this.pendingDraftIr.set(draft);
    this.selectedIrSeq.set(null);
    this.previousSelectedIrSeq = null;

    const host = this.detailHost?.nativeElement;
    if (host) playIfMotionAllowed(buildDetailRevealTimeline(host));
  }

  protected chainBorderColor(chain: readonly ApprovalChainStep[]): string {
    return chainCompletionColor(chain);
  }
}
