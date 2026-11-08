import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable, from, of, switchMap, take, tap } from 'rxjs';
import { ActionConfirmDialogService } from '@shared/components/action-confirm-dialog/action-confirm-dialog.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { ComponentCanDeactivate } from '@guards/unsaved-changes.guard';
import { ApprovalChainStep } from '@models/wwell-planning/wwell-planning.model';
import { IntegratedRequirement, IntegratedRequirementStatus } from '@models/wwell-planning/integrated-requirement.model';
import { buildDetailRevealTimeline } from '../shared/dynamic-form/detail-reveal.animation';
import { playIfMotionAllowed } from '../shared/dynamic-form/gsap-motion.util';
import { buildListRowsRevealTimeline } from '../shared/dynamic-form/list-reveal.animation';
import { WwellApprovalWorkflowCardComponent } from '../shared/wwell-approvals/wwell-approval-workflow-card/wwell-approval-workflow-card.component';
import { chainCompletionColor } from '../shared/wwell-approvals/wwell-approvals.config';
import { WWELL_LOAD_DELAY_MS } from '@models/wwell-planning/wwell-planning-loading.constants';
import { WwellDetailLoadingComponent } from '../shared/wwell-detail-loading/wwell-detail-loading.component';
import { createPendingSelection } from '../shared/wwell-pending-selection.util';
import { WwellIrStore } from './store/wwell-ir.store';
import { WwellIrEditorComponent, WwellIrEditorViewMode } from './wwell-ir-editor/wwell-ir-editor.component';
import { WwellIrEditorLoadingComponent } from './wwell-ir-editor-loading/wwell-ir-editor-loading.component';
import { WwellIrViewComponent, WwellIrViewTab } from './wwell-ir-view/wwell-ir-view.component';
import { buildWwellDynamicForm } from '../shared/dynamic-form/wwell-dynamic-form.builder';
import { buildIntegratedRequirementFromPayload } from './wwell-ir-form/wwell-ir-draft.util';
import { mapIrFormValueToSubmission } from './wwell-ir-form/wwell-ir-form.mapper';
import { WWELL_IR_FORM_SCHEMA } from './wwell-ir-form/wwell-ir-form.schema';
import { WwellIrFormRawValue } from './wwell-ir-form/wwell-ir-form.types';
import { WWELL_IR_STATUS_META, hasKnownIrStatus, irBadgeMeta } from './wwell-ir.config';

/** Which surface WwellIrEditorComponent's slot in the detail panel currently shows for the
 *  selected record — 'edit' is the existing view-with-inline-edit surface, 'view' is the
 *  read-only stepper (WwellIrViewComponent). Deliberately independent of *which* record is
 *  selected (see `viewIr`/`setDetailMode` below) so browsing other rows while viewing one keeps
 *  showing each newly-selected record in view mode too, instead of bouncing back to edit on
 *  every click. */
type WwellIrDetailMode = 'edit' | 'view';

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
    MatTooltipModule,
    WwellIrEditorComponent,
    WwellIrViewComponent,
    WwellApprovalWorkflowCardComponent,
    WwellDetailLoadingComponent,
    WwellIrEditorLoadingComponent,
  ],
  templateUrl: './wwell-ir.component.html',
  styleUrl: './wwell-ir.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrComponent implements OnInit, OnDestroy, ComponentCanDeactivate {
  protected readonly store = inject(WwellIrStore);
  private readonly fb = inject(FormBuilder);
  private readonly notify = inject(NotificationService);
  private readonly confirmDialog = inject(ActionConfirmDialogService);

  protected readonly isLoading = this.store.irsLoading;
  protected readonly loadError = this.store.irsError;
  protected readonly isLoadingDetail = this.store.irDetailLoading;

  protected readonly searchTerm = signal('');
  // ir_seq is the real primary key once an IR is saved (see integrated-requirement.model.ts) —
  // selection is keyed on it directly, not the display-only `code`/`id` string, so it can be
  // handed straight to loadIrDetail() below without a lookup.
  protected readonly selectedIrSeq = signal<number | null>(null);

  /** Sticky across selection changes — see WwellIrDetailMode's own doc comment. */
  protected readonly detailMode = signal<WwellIrDetailMode>('edit');

  /** Sticky for the same reason as `detailMode`: the editor is destroyed and rebuilt on a row
   *  switch (loading skeleton) and on the view→edit toggle, so a mode held on the editor itself
   *  snapped back to its default each time. Two-way bound to the editor's `viewMode` model. */
  protected readonly editorViewMode = signal<WwellIrEditorViewMode>('timeline');

  /** Sticky for the same reason as `editorViewMode`, for the read-only side: pick Well Design on
   *  one record and it stays selected when you open the next one, instead of snapping back to
   *  Details. Two-way bound to the view's `activeTab` model. */
  protected readonly viewTab = signal<WwellIrViewTab>('details');

  protected readonly lifecycleFilter = signal<WwellIrLifecycleFilter>('active');
  protected readonly statusFilter = signal<IntegratedRequirementStatus | 'all'>('all');
  // Sub-filter chips shown only in the Active bucket — Inactive is exactly one status
  // (approved), so there's nothing left to narrow further once that's selected.
  protected readonly statusChips: readonly (IntegratedRequirementStatus | 'all')[] = ['all', 'in-progress', 'approved'];

  // Scoped by the lifecycle toggle only (not the status chip or search term) so chip counts stay
  // stable while the user narrows further — each chip shows how many rows *it* would reveal, not
  // how many remain after some other filter already trimmed the set.
  private readonly lifecycleScopedIrs = computed(() => {
    const all = this.store.irs();
    const scoped =
      this.lifecycleFilter() === 'inactive'
        ? all.filter(ir => ir.status === 'approved')
        : all.filter(ir => WWELL_IR_ACTIVE_STATUSES.includes(ir.status));
    // Newest first: updatedDate already falls back to the created date; irSeq (monotonic) breaks
    // same-day ties, and undated records sink below dated ones.
    return [...scoped].sort(
      (a, b) =>
        (b.updatedDate ?? '').localeCompare(a.updatedDate ?? '') || (b.irSeq ?? 0) - (a.irSeq ?? 0),
    );
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

  // True only right after the detail panel's own back arrow explicitly closes it — the "default to
  // first visible record" effect below reads this to skip re-opening whatever it just closed. Never
  // set by anything else that clears `selectedIrSeq` (a delete, a fresh load): those paths *want*
  // that effect to auto-fill the panel, exactly as a fresh session start already does — only an
  // explicit deselect should leave it empty. See `deselect()`.
  private readonly deselected = signal(false);

  // Deliberately looks up the *unfiltered* store list (not `rows()`) so narrowing the search
  // never drops the current selection just because it fell outside the filtered results.
  // Water Well Name/Coordinates/Surface Elevation arrive on the record itself once its detail has
  // been fetched (see mergeIrDetailBlocksIntoIntegratedRequirement's exad_rcd_prewap block) — no
  // separate hydration pass needed here.
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
  protected readonly hasKnownStatus = hasKnownIrStatus;
  protected readonly badgeMeta = irBadgeMeta;

  protected readonly skeletonRows = Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => index);

  // Bound to the viewport's [itemSize] and each row-item's fixed height in the template — see
  // WWELL_IR_ROW_ITEM_SIZE_PX's own comment for why these must stay pinned together.
  protected readonly rowItemSize = WWELL_IR_ROW_ITEM_SIZE_PX;

  private readonly pendingSelection = createPendingSelection<number>(WWELL_LOAD_DELAY_MS);
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
  // Only rendered while detailMode() === 'edit' (see the template's `@else` branch) — undefined
  // whenever the detail panel is showing the read-only view stepper or the empty state, which is
  // exactly when there's nothing open to lose (see canDeactivate()'s guard below).
  @ViewChild(WwellIrEditorComponent) private readonly editorRef?: WwellIrEditorComponent;
  private previousSelectedIrSeq: number | null = null;
  private wasCreatingIr = false;
  private wasDeletingIr = false;
  private wasSubmittingForReview = false;
  private wasRecallingIr = false;

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
    // ir_seq-keyed record. By the time `creatingIr` flips false, store.createIr has already
    // waited out a real follow-up GET and merged it into `irs` (no optimistic echo — see that
    // method's own doc comment), so this is already the confirmed, persisted record. Future saves
    // then UPDATE instead of re-INSERTing.
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
        // store.createIr's own follow-up GET already covers it — and it would flip
        // isLoadingDetail(), swapping the whole detail panel to the loading skeleton right after
        // the user just watched this exact record save).
        this.previousSelectedIrSeq = savedIrSeq;
        this.selectedIrSeq.set(savedIrSeq);
        // The real approval chain (if any) is fetched from inside store.createIr itself, once its
        // own follow-up GET resolves a sapWfId — no separate call needed here.
        // A brand-new record has an ir_seq for the first time here, so this is the first moment
        // its attachment slots can be fetched (and the first moment uploads become possible).
        this.store.loadIrAttachments(savedIrSeq);
        // Anything the user attached while this was still an unsaved draft had nowhere to go until
        // now — send it against the id the save just assigned.
        this.store.uploadPendingAttachments(savedIrSeq);
      }

      const savedCode = savedIrSeq !== null ? this.store.irs().find(ir => ir.irSeq === savedIrSeq)?.code : undefined;
      const subject = savedCode ?? 'Integrated requirement';
      this.notify.info(wasNewIr ? `${subject} created successfully.` : `${subject} updated successfully.`);
    });

    effect(() => {
      const message = this.store.sapTriggerError();
      if (message) this.notify.error(message);
    });

    // Reports the outcome of a Submit for Review once the whole three-step flow settles (mint
    // workflow id → SAP /trigger → stamp sap_wf_id/sap_wf_status on the header). Same settled-edge
    // shape as the save effect above, and for the same reason: nothing is announced at click time
    // because the request is still in flight — the editor's own button shows a spinner until then.
    //
    // Without this the success path was silent: the flow completes in ~200ms locally and its only
    // visible trace was the Submit for Review button disappearing (the status leaves
    // WWELL_IR_SUBMITTABLE_STATUSES, so canSubmitForReview drops it), which reads as the click
    // having done nothing. A failure is already toasted by the sapTriggerError effect above, so
    // only success is announced here.
    effect(() => {
      const submitting = this.store.updatingIrStatus();
      const settled = this.wasSubmittingForReview && !submitting;
      this.wasSubmittingForReview = submitting;
      if (!settled || this.store.sapTriggerError()) return;

      const submittedCode = this.store.irs().find(ir => ir.irSeq === this.selectedIrSeq())?.code;
      this.notify.info(`${submittedCode ?? 'Integrated requirement'} submitted for review.`);
    });

    effect(() => {
      const message = this.store.sapRecallError();
      if (message) this.notify.error(message);
    });

    // Reports the outcome of a Recall once its own SAP call + follow-up status refetch both settle
    // (see WwellIrStore.recallSapWorkflow — `recallingIr` deliberately spans both so the editor's
    // Recall button spinner covers the whole action). Same settled-edge shape as the submit effect
    // above; a failure is already toasted by the sapRecallError effect just above.
    effect(() => {
      const recalling = this.store.recallingIr();
      const settled = this.wasRecallingIr && !recalling;
      this.wasRecallingIr = recalling;
      if (!settled || this.store.sapRecallError()) return;

      const recalledCode = this.store.irs().find(ir => ir.irSeq === this.selectedIrSeq())?.code;
      this.notify.info(`Workflow for ${recalledCode ?? 'this integrated requirement'} recalled successfully.`);
    });

    effect(() => {
      const message = this.store.irDetailError();
      if (message) this.notify.error(message);
    });

    effect(() => {
      const message = this.store.irApprovalTimelineError();
      if (message) this.notify.error(message);
    });

    effect(() => {
      const message = this.store.deleteIrError();
      if (message) this.notify.error(message);
    });

    // Reports success once a delete settles — the editor's own Delete IR button shows a spinner
    // while in flight (see wwell-ir-editor.component.html's isDeleting()), so nothing needs
    // announcing at click time. A failure is already toasted by the effect above.
    effect(() => {
      const deleting = this.store.deletingIr();
      const settled = this.wasDeletingIr && !deleting;
      this.wasDeletingIr = deleting;
      if (!settled || this.store.deleteIrError()) return;

      this.notify.info('Integrated requirement deleted.');

      // The deleted record is already gone from store.irs() by this point (WwellIrStore.deleteIr
      // removes it on success) — if it was the one open, fall back to null so the "default to
      // first visible record" effect below picks whatever the list now shows first (or leaves the
      // panel empty if nothing remains), the same path a fresh session start already uses.
      if (this.selectedIrSeq() !== null && !this.store.irs().some(ir => ir.irSeq === this.selectedIrSeq())) {
        this.selectedIrSeq.set(null);
        this.previousSelectedIrSeq = null;
        this.deselected.set(false);
      }
    });

    // Default to the first *visible* record once the list loads — mirrors the reference app,
    // which always has something selected in the detail pane rather than starting on an empty
    // state. Reads `rows()` (lifecycle/status/search-scoped), not the raw store list, so the
    // default selection is never a row the Active/Inactive toggle is currently hiding. Skipped
    // while a pendingDraftIr is open — selectedIrSeq is intentionally left null throughout
    // drafting (the draft isn't in `rows()`), and this effect would otherwise immediately fetch
    // and select an unrelated real record's detail out from under the still-open draft.
    effect(() => {
      if (this.pendingDraftIr() || this.deselected()) return;
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
      // The approval chain is fetched from inside store.loadIrDetail itself, once that GET's own
      // exad_gwd_ir_header block resolves the record's sapWfId (only the detail fetch carries it —
      // see wwell-ir-summary.mapper.ts) — no separate call needed here.
      // Also its own fetch: attachments are files on the backend's filesystem keyed by ir_seq, not
      // exad_gwd_ir_* columns, so they can't ride along in the detail blocks above.
      this.store.loadIrAttachments(irSeq);
      // Files held for an abandoned New IR belong to that draft alone — drop them rather than let
      // them surface on whichever record was just selected. (This effect deliberately no-ops on the
      // save transition, see the comment above, so it can't discard files mid-upload.)
      this.store.clearPendingAttachments();
      // Re-fetched on every selection, not just once at ngOnInit — this backs the editor's own
      // "Link to Request" dropdown and its live auto-populate-on-pick (see
      // wwell-ir-editor.component.ts's applyLinkedRequestWell / wwell-ir-linked-well.util.ts),
      // used when the user picks a NEW link on the opened record. Eligibility can change
      // server-side between selections in a long-lived session (another user initiates an IR for
      // a well, a well newly becomes eligible...) — no cached/one-time snapshot, always the
      // current server state for whichever record is being opened.
      this.store.loadLinkedRequestWells();
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
    // Started here (not lazily in the editor once a record is selected) so the "Link to Request"
    // dropdown/picker (see loadLinkedRequestWells's other call site, on selection change below)
    // has options ready by the time the first record's editor renders, instead of racing it.
    this.store.loadLinkedRequestWells();
    // Geologist Contact picker's option list — stable reference data, unlike linkedRequestWells
    // above, so it's only loaded once here rather than re-fetched on every IR selection.
    this.store.loadGwdOpsMembers();
    // Dropdown options (EXAD_DHUB_LKUP_DATA) for the Program Details fields — stable reference data.
    this.store.loadDropdownMenus();
    // Aquifer dropdown options (daily-operations /aquifers) for Estimated Hydrology.
    this.store.loadAquifers();
    // Formation dropdown options (st_long_cd from strat_info) for Formation Tops.
    this.store.loadStratInfos();
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

  /** Approved lives in the inactive lifecycle bucket, so its chip switches the bucket rather than filtering within Active. */
  protected isChipActive(status: IntegratedRequirementStatus | 'all'): boolean {
    if (status === 'approved') return this.lifecycleFilter() === 'inactive';
    return this.lifecycleFilter() === 'active' && this.statusFilter() === status;
  }

  protected selectChip(status: IntegratedRequirementStatus | 'all'): void {
    if (status === 'approved') {
      this.setLifecycleFilter('inactive');
      return;
    }
    this.setLifecycleFilter('active');
    this.setStatusFilter(status);
  }

  protected setStatusFilter(status: IntegratedRequirementStatus | 'all'): void {
    this.statusFilter.set(status);
  }

  // Chips only ever render within the Active lifecycle bucket (see the template's
  // `@if (lifecycleFilter() === 'active')` gate) — "All" here already only ever means "every
  // active-status record", never the inactive/approved ones the toggle hides. Labeling it
  // "Active" instead of the bare, easy-to-misread "All" makes that scope explicit.
  protected statusChipLabel(status: IntegratedRequirementStatus | 'all'): string {
    return status === 'all' ? 'Active' : this.statusMeta[status].label;
  }

  protected statusChipCount(status: IntegratedRequirementStatus | 'all'): number {
    // Independent of which bucket is showing: every chip always reports its own total.
    const all = this.store.irs();
    if (status === 'approved') return all.filter(ir => ir.status === 'approved').length;
    const active = all.filter(ir => WWELL_IR_ACTIVE_STATUSES.includes(ir.status));
    return status === 'all' ? active.length : active.filter(ir => ir.status === status).length;
  }

  protected selectIr(irSeq: number): void {
    this.guardNavigation(() => this.performSelectIr(irSeq));
  }

  /** Selecting a real row discards whatever unsaved local draft was open — nothing was ever
   *  persisted for it, so there's nothing to preserve (see guardNavigation()'s own comment for why
   *  a section *with* real edits is asked about before this ever runs). */
  private performSelectIr(irSeq: number): void {
    this.pendingDraftIr.set(null);
    this.deselected.set(false);
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

  /** The row's "view" (eye) icon — selects the record exactly like selectIrRow above, plus
   *  switches the detail panel to the read-only stepper. Staying in view mode afterwards (rather
   *  than resetting on every selection change) is what lets the master list double as a way to
   *  browse several records' read-only views in a row, without an extra click back into view
   *  mode each time. */
  protected viewIr(irSeq: number): void {
    // Switching to the read-only stepper destroys this editor instance (see the template's
    // `@if (detailMode() === 'view')` branch) even when `irSeq` is the record already open here —
    // so this needs the same guard as an actual selection change, not just performSelectIr's own
    // "discard a blank draft" case.
    this.guardNavigation(() => {
      this.detailMode.set('view');
      this.performSelectIr(irSeq);
    });
  }

  /** WwellIrViewComponent's own "Edit" button — switches the currently-open record's detail
   *  panel back to the inline-edit surface. Unguarded: the read-only view has no edits of its own
   *  to lose, so there's nothing this direction could discard. */
  protected setDetailMode(mode: WwellIrDetailMode): void {
    this.detailMode.set(mode);
  }

  /** The editor's own "View" toggle — switching the same record to the read-only stepper destroys
   *  this editor instance (see the template's `@if (detailMode() === 'view')` branch), so unlike
   *  `setDetailMode` above this direction needs the same unsaved-changes guard as an actual row
   *  switch, even though the selected record itself isn't changing. */
  protected requestViewMode(): void {
    this.guardNavigation(() => this.detailMode.set('view'));
  }

  /** The detail panel's back arrow — closes it entirely and returns to just the list, discarding a
   *  blank "New IR" draft or prompting to save/discard real edits first, same as any other
   *  "leave what's open" action. Sets `deselected` so the auto-select-first-record effect doesn't
   *  immediately reopen whatever this just closed. */
  protected deselect(): void {
    this.guardNavigation(() => {
      this.pendingDraftIr.set(null);
      this.selectedIrSeq.set(null);
      this.previousSelectedIrSeq = null;
      this.deselected.set(true);
    });
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
    this.guardNavigation(() => this.performCreateNewIr());
  }

  private performCreateNewIr(): void {
    const raw = buildWwellDynamicForm(WWELL_IR_FORM_SCHEMA, this.fb).getRawValue() as WwellIrFormRawValue;
    const { payload } = mapIrFormValueToSubmission(raw, 'draft');
    const draft = buildIntegratedRequirementFromPayload(payload, { id: 'draft', code: 'New IR', irSeq: null });
    // Start the new draft with empty slots — a previous draft's held files must not carry over.
    this.store.clearPendingAttachments();

    this.pendingDraftIr.set(draft);
    this.selectedIrSeq.set(null);
    this.previousSelectedIrSeq = null;
    this.deselected.set(false);
    // A brand-new draft has nothing committed to view read-only yet — always open it for editing,
    // regardless of whatever mode the previously-open record was left in.
    this.detailMode.set('edit');

    const host = this.detailHost?.nativeElement;
    if (host) playIfMotionAllowed(buildDetailRevealTimeline(host));
  }

  protected chainBorderColor(chain: readonly ApprovalChainStep[]): string {
    return chainCompletionColor(chain);
  }

  /** Manual "Refresh" action on the Approval Workflow sidebar/pill — pulls SAP's real current
   *  status/chain for the open record on demand, without needing to reselect it. A no-op for a
   *  record with no `sapWfId` (never submitted, so there is nothing in SAP to ask about) or no
   *  `irSeq` (a local-only draft) — the store's own `refreshIrApprovalStatus` guards the same
   *  case, but checking here too keeps the button itself disabled rather than silently doing
   *  nothing on click. */
  protected refreshApprovalStatus(ir: IntegratedRequirement): void {
    if (ir.irSeq == null || ir.sapWfId == null) return;
    this.store.refreshIrApprovalStatus(ir.irSeq, ir.sapWfId);
  }

  // ── Unsaved-changes guard — backs three separate "leaving the currently-open record" paths with
  // one prompt: switching the selected row / opening "New IR" / clicking the view (eye) icon (all
  // via guardNavigation below), and a real Angular route change away from this page entirely (via
  // canDeactivate(), wired up as the 'integrated-requirements' route's CanDeactivate guard — see
  // app.routes.ts and unsaved-changes.guard.ts). Browser tab close/refresh is covered separately by
  // the beforeunload listener below, which can't run this same async dialog flow.

  /** Router entry point (ComponentCanDeactivate) — resolves `true` once it's safe to actually leave
   *  the route: immediately if nothing is unsaved, after a confirmed Discard, or after a confirmed
   *  Save has settled. `false` means stay (Cancel, or a save that failed). */
  canDeactivate(): Observable<boolean> {
    const editor = this.editorRef;
    if (!editor?.hasPendingEdits()) return of(true);

    // Draw every pending edit in dark green behind the prompt, so it is clear what Save / Discard acts on.
    editor.showUnsavedHighlight();
    return this.confirmDialog
      .openWithResult({
        title: 'Unsaved changes',
        subtitle: 'This Integrated Requirement has section edits that haven’t been saved yet. Save them before leaving?',
        confirmLabel: 'Save & Leave',
        discardLabel: 'Discard Changes',
        cancelLabel: 'Stay Here',
        severity: 'warning',
      })
      .pipe(
        switchMap(result => {
          if (result === 'cancel') {
            editor.clearUnsavedHighlight();
            return of(false);
          }
          if (result === 'discard') {
            editor.discardUnsavedChanges();
            return of(true);
          }
          return from(editor.saveUnsavedChangesAndWait()).pipe(tap(saved => !saved && editor.clearUnsavedHighlight()));
        }),
      );
  }

  /** In-page equivalent of canDeactivate() — same prompt/save/discard flow, but for switching what
   *  this page itself shows (selecting another row, opening a blank "New IR", or the view-icon's
   *  mode switch) rather than leaving the route. `action` only runs once it's actually safe to
   *  proceed. */
  private guardNavigation(action: () => void): void {
    this.canDeactivate()
      .pipe(take(1))
      .subscribe(canLeave => {
        if (canLeave) action();
      });
  }

  /** Native browser navigation (tab close, refresh, typed URL) bypasses the Router entirely, so
   *  canDeactivate() never runs for it — this is the one place that has to use the browser's own
   *  confirmation prompt instead (no custom dialog is possible here; per spec, `returnValue` must be
   *  set and the browser supplies its own generic copy). */
  @HostListener('window:beforeunload', ['$event'])
  protected onBeforeUnload(event: BeforeUnloadEvent): void {
    if (!this.editorRef?.hasPendingEdits()) return;
    event.preventDefault();
    event.returnValue = '';
  }
}
