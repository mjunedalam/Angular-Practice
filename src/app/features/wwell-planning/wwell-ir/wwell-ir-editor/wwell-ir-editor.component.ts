import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  OnInit,
  QueryList,
  Signal,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { IntegratedRequirement, IntegratedRequirementStatus } from '@models/wwell-planning/integrated-requirement.model';
import { ActionConfirmDialogService } from '@shared/components/action-confirm-dialog/action-confirm-dialog.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { WellBoreViewComponent } from '../../../presentation/well-bore-view/well-bore-view.component';
import { WwellCollapseAnimateDirective } from '../../shared/wwell-collapse-animate/wwell-collapse-animate.directive';
import { DynamicFieldComponent } from '../../shared/dynamic-form/dynamic-field/dynamic-field.component';
import { DynamicSectionComponent } from '../../shared/dynamic-form/dynamic-section/dynamic-section.component';
import { defaultValueFor } from '../../shared/dynamic-form/wwell-dynamic-form.builder';
import { WwellFieldConfig, WwellFormSectionConfig } from '../../shared/dynamic-form/wwell-dynamic-form.types';
import { WwellIrStore } from '../store/wwell-ir.store';
import { WwellIrDepthScaleComponent } from '../wwell-ir-depth-scale/wwell-ir-depth-scale.component';
import {
  casingRowPatch,
  formationTopRowPatch,
  mapIntegratedRequirementToFormPatch,
  mapIntegratedRequirementToRawFormValue,
  offsetWellRowPatch,
} from '../wwell-ir-form/wwell-ir-edit.mapper';
import { CasingSizeWarning, findInvertedCasingSizeRows } from '../wwell-ir-form/wwell-ir-casing-warnings.util';
import { mapIrFormValueToSubmission } from '../wwell-ir-form/wwell-ir-form.mapper';
import { buildWwellIrFormSchema } from '../wwell-ir-form/wwell-ir-form.schema';
import {
  WwellIrFormRawValue,
  WwellIrRawCasingRow,
  WwellIrRawFormationTop,
  WwellIrRawHydrology,
  WwellIrRawOffsetWell,
  WwellIrRawProgramDetails,
  WwellIrRawProgramMain,
  WwellIrRawRemarks,
  WwellIrRawTopsRemarks,
} from '../wwell-ir-form/wwell-ir-form.types';
import { buildWwellIrBulkSavePayload } from '../wwell-ir-form/wwell-ir-payload.mapper';
import {
  buildWellboreDiagramDataFromIntegratedRequirement,
  hasWellboreDiagramDataForIntegratedRequirement,
} from '../wwell-ir-form/wwell-ir-wellbore-diagram.mapper';
import { WWELL_IR_STATUS_META, WWELL_IR_SUBMITTABLE_STATUSES } from '../wwell-ir.config';
import {
  buildGeologistContactRows,
  buildHydrogeologyRows,
  buildProgramDevRows,
  buildProgramMainRows,
  buildRequestReferenceRows,
} from './wwell-ir-detail-rows.util';
import { WWELL_IR_PREVIEW_DIAGRAM_LAYOUT } from './wwell-ir-preview-diagram-layout';
import {
  findLinkedWell,
  formatLinkedWellCoordinates,
  linkedWellHasCoordinates,
  linkedWellHasElevation,
} from '../wwell-ir-form/wwell-ir-linked-well.util';
import { InlineRowEditState, SectionEditState, buildAndPatchArray, buildAndPatchGroup } from './wwell-ir-section-edit.util';
import { SectionRailController } from './wwell-ir-section-rail.util';
import { WWELL_IR_SECTION_RAIL, WwellIrRailGroup, wwellIrRailLeaves } from './wwell-ir-section-rail.config';
import { WwellIrTimelineStepStatus, wwellIrTimelineStepStatus } from './wwell-ir-timeline.util';

export type WwellIrEditorViewMode = 'sections' | 'timeline';

const SELECT_PANEL_CLASS = 'ire-select-panel';

function findSection(schema: ReturnType<typeof buildWwellIrFormSchema>, stepKey: string, sectionKey: string): WwellFormSectionConfig {
  const section = schema.find(step => step.key === stepKey)?.sections.find(s => s.key === sectionKey);
  if (!section) throw new Error(`Missing IR form section ${stepKey}.${sectionKey}`);
  return { ...section, title: null };
}

/**
 * View-with-inline-edit surface for an Integrated Requirement, used for every status — replaces
 * both the old routed wizard (`wwell-ir-new-page`) and the separate read-only viewer
 * (`wwell-ir-detail`). Every section defaults to a compact read display; clicking its pencil
 * opens just that section for editing (via SectionEditState) without disturbing the rest of the
 * page. The IR SECTIONS rail scrolls straight to any section, editing or not.
 *
 * There is exactly one Save — the global button in the footer (see saveAll()). Sections have no
 * Save of their own: any number can be open at once, and one click persists all of them together
 * in a single request, so filling in a new IR is never a sequence of per-section round-trips.
 *
 * `WwellIrComponent.createNewIr()` opens a blank, purely local draft (`ir().irSeq === null`, no
 * backend call yet) and selects it, so `ir` isn't always an already-persisted record here — it
 * only becomes one on that first save, which reuses the exact same
 * saveMergedRaw()/buildWwellIrBulkSavePayload `irSeq: null → INSERT` route as any first-time save.
 */
@Component({
  selector: 'app-wwell-ir-editor',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    DynamicFieldComponent,
    DynamicSectionComponent,
    WellBoreViewComponent,
    WwellIrDepthScaleComponent,
    WwellCollapseAnimateDirective,
  ],
  templateUrl: './wwell-ir-editor.component.html',
  styleUrl: './wwell-ir-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // The app only calls mat.core() globally with no full M3 theme, so the scoped theme in
  // wwell-ir-editor.component.scss needs to reach a mat-select's portaled overlay panel (CDK
  // renders it into <body>, outside this component's own view). See that file for the full
  // rationale.
  encapsulation: ViewEncapsulation.None,
})
export class WwellIrEditorComponent implements OnInit, AfterViewInit {
  readonly ir = input.required<IntegratedRequirement>();

  private readonly fb = inject(FormBuilder);
  protected readonly store = inject(WwellIrStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmDialog = inject(ActionConfirmDialogService);
  private readonly notify = inject(NotificationService);

  protected readonly statusMeta = WWELL_IR_STATUS_META;
  protected readonly isSaving = this.store.creatingIr;
  protected readonly isDeleting = this.store.deletingIr;
  protected readonly isSubmittingForReview = this.store.updatingIrStatus;
  // Every footer button disables on every other button's in-flight request too, not just its own
  // — e.g. Delete IR must not be clickable mid-Save, since a save that's still in flight could
  // resurrect the very row the delete just removed once it settles.
  protected readonly anyFooterActionPending = computed(
    () => this.isSaving() || this.isDeleting() || this.isSubmittingForReview(),
  );
  // `irSeq` is `number | null | undefined` on the model (optional + nullable) — normalized here
  // (mirrors WwellIrComponent's rowIrSeq) so the template's Delete IR gate can compare with a
  // plain `!== null`, since Angular template expressions have no `!=`/loose-equality operator.
  protected readonly hasSavedIrSeq = computed(() => this.ir().irSeq !== null && this.ir().irSeq !== undefined);
  protected readonly selectPanelClass = SELECT_PANEL_CLASS;
  // "Submit for Review" is the one action gated by status — it only makes sense before the
  // record has already left the author's hands. Every section's inline edit, by contrast, is
  // available regardless of status (see saveMergedRaw's status-fallback comment below).
  protected readonly canSubmitForReview = computed(() => WWELL_IR_SUBMITTABLE_STATUSES.includes(this.ir().status));

  protected readonly railGroups = WWELL_IR_SECTION_RAIL;
  private readonly railLeaves = wwellIrRailLeaves(WWELL_IR_SECTION_RAIL);
  protected readonly rail = new SectionRailController(this.destroyRef);

  // ── Timeline view — an alternate, toggleable layout for the same sections: the IR SECTIONS
  // rail is replaced with a vertical lifecycle stepper (dot + connecting line per top-level rail
  // group), each step showing Completed/Pending and collapsing to just its header until expanded.
  // Purely a display mode — it reuses every section's existing read/edit markup and save methods
  // untouched, so switching modes never loses in-progress edits. Any number of steps can be open
  // at once — expanding one never collapses another, so several sections can be compared or
  // edited side by side.
  //
  // Defaults to 'sections' here and flips to 'timeline' in ngOnInit (via setViewMode, not a
  // different literal) rather than defaulting the field itself — setViewMode's expand-all-steps
  // seeding only runs through that one method. Runs before the first paint, so there's no visible
  // flash of the sections layout.
  protected readonly viewMode = signal<WwellIrEditorViewMode>('sections');
  private readonly expandedTimelineSteps = signal<ReadonlySet<string>>(new Set());

  protected setViewMode(mode: WwellIrEditorViewMode): void {
    this.viewMode.set(mode);
    // Every step starts open — a brand-new editor instance (a fresh record selection, or
    // switching over from the read-only view's own "Edit" button, which remounts this component —
    // see wwell-ir.component.html's `detailMode()` branch) should never land on an all-collapsed
    // timeline. Only seeds once per instance (`size === 0`): re-toggling Sections ⇄ Timeline mid-
    // session must not undo whatever the user has since collapsed themselves.
    if (mode === 'timeline' && this.expandedTimelineSteps().size === 0) {
      this.expandedTimelineSteps.set(new Set(this.railGroups.map(group => group.key)));
    }
  }

  protected timelineStepStatus(groupKey: string): WwellIrTimelineStepStatus {
    return wwellIrTimelineStepStatus(this.ir(), groupKey);
  }

  protected isTimelineStepExpanded(groupKey: string): boolean {
    return this.viewMode() !== 'timeline' || this.expandedTimelineSteps().has(groupKey);
  }

  // Drives the header's single expand-all/collapse-all icon — "all" means every top-level rail
  // group, so it flips to the collapse icon only once nothing is left closed.
  protected readonly allTimelineStepsExpanded = computed(() => this.expandedTimelineSteps().size >= this.railGroups.length);

  protected toggleAllTimelineSteps(): void {
    this.expandedTimelineSteps.set(
      this.allTimelineStepsExpanded() ? new Set() : new Set(this.railGroups.map(group => group.key)),
    );
  }

  // The Wellbore Preview panel (Timeline view only) floats free of the steps column, pinned to a
  // fixed corner (`position: fixed` — see .ire__tl-preview-sidebar in the stylesheet). Hiding it
  // is purely a CSS state (opacity/scale, not removal from the DOM) so the toggle gets a smooth
  // transition instead of an instant show/hide.
  protected readonly previewSidebarOpen = signal(true);

  protected togglePreviewSidebar(): void {
    this.previewSidebarOpen.update(open => !open);
  }

  protected toggleTimelineStep(groupKey: string): void {
    if (this.viewMode() !== 'timeline') return;
    this.expandedTimelineSteps.update(current => {
      const next = new Set(current);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  }

  // Live-wired to the store's linkedRequestWellOptions/geologistOptions Signals — same reasoning
  // as the old wizard's own `schema` field (see buildWwellIrFormSchema's doc comment).
  private readonly schema = buildWwellIrFormSchema(this.store.linkedRequestWellOptions, this.store.geologistOptions);
  protected readonly referenceMainSection = findSection(this.schema, 'reference', 'main');
  // One combined section — Program Details and Development & Testing are edited/saved together
  // now (see programEdit below) — see wwell-ir-form.schema.ts's own comment on this section for
  // why the field order there matters.
  protected readonly programSection = findSection(this.schema, 'programDetails', 'main');
  protected readonly geologistSection = findSection(this.schema, 'contacts', 'geologist');
  protected readonly formationTopsSection = findSection(this.schema, 'subsurface', 'formationTops');
  protected readonly topsRemarksSection = findSection(this.schema, 'subsurface', 'remarks');
  protected readonly casingSection = findSection(this.schema, 'subsurface', 'casing');
  protected readonly hydrogeologySection = findSection(this.schema, 'hydrogeology', 'main');
  protected readonly offsetWellsSection = findSection(this.schema, 'contacts', 'offsetWells');
  protected readonly offsetRemarksSection = findSection(this.schema, 'contacts', 'remarks');

  // ── View-mode read rows — one computed per section, re-derived whenever `ir()` changes ──────
  protected readonly requestReferenceRows = computed(() =>
    buildRequestReferenceRows(this.ir(), this.store.linkedRequestWellOptions()),
  );
  // One combined read-only list backing the merged Program Details section (see programSection
  // above) — [...main, ...developmentTesting], matching that section's own field grouping.
  protected readonly programRows = computed(() => [...buildProgramMainRows(this.ir()), ...buildProgramDevRows(this.ir())]);
  protected readonly hydrogeologyRows = computed(() => buildHydrogeologyRows(this.ir()));
  protected readonly geologistContactRows = computed(() => buildGeologistContactRows(this.ir()));

  // Wellbore preview + casing warnings track the persisted record by default, but read straight
  // from the Horizons/Casing sections' live FormArray values while either is open for editing —
  // via SectionEditState.liveValue — so the diagram builds/updates as rows are added, not only
  // once that section is saved (matching how the old wizard's live preview worked off raw form
  // values). `liveValue()` is `null` whenever that section isn't being edited, which both mapper
  // calls treat as "fall back to `ir()`". Program Details (Completion) and Estimated Hydrology
  // (static water level / SIWHP / pump depth) get the same live treatment — picking a different
  // Completion or test type while either section is open now moves the diagram immediately,
  // instead of only after Save.
  protected readonly wellboreDiagramData: Signal<WellboreDiagramData> = computed(() =>
    buildWellboreDiagramDataFromIntegratedRequirement(
      this.ir(),
      this.casingEdit.liveValue(),
      this.formationTopsEdit.liveValue(),
      this.programMainLiveValue(),
      this.hydrogeologyEdit.liveValue(),
    ),
  );
  // buildWellboreDiagramDataFromIntegratedRequirement only wants the Completion/Open Hole Size
  // slice — projects it out of the merged Program Details section's flat liveValue (see
  // programEdit below), which also carries the Development & Testing fields this diagram doesn't
  // care about.
  private readonly programMainLiveValue = computed<WwellIrRawProgramMain | null>(() => {
    const live = this.programEdit.liveValue();
    if (!live) return null;
    return {
      completion: live.completion,
      openHoleSizeIn: live.openHoleSizeIn,
      acidization: live.acidization,
      transmission: live.transmission,
    };
  });
  protected readonly hasWellboreData: Signal<boolean> = computed(() =>
    hasWellboreDiagramDataForIntegratedRequirement(
      this.ir(),
      this.casingEdit.liveValue(),
      this.formationTopsEdit.liveValue(),
    ),
  );
  protected readonly hasTargetDepth: Signal<boolean> = computed(() => (this.ir().requestReference.targetDepthFt ?? 0) > 0);
  // Used by both the Sections view's inline Wellbore Preview card and the Timeline view's sidebar
  // — see wwell-ir-preview-diagram-layout.ts for why a smaller *coordinate space* (not a smaller
  // container) is what keeps fixed-viewBox-unit labels and tooltips legible in either box.
  protected readonly previewDiagramLayout = WWELL_IR_PREVIEW_DIAGRAM_LAYOUT;
  protected readonly casingSizeWarnings: Signal<readonly CasingSizeWarning[]> = computed(() =>
    findInvertedCasingSizeRows(this.ir().casing.map(casingRowPatch)),
  );

  // ── Per-section inline-edit state — lazily built from the *current* record only once its
  // pencil is clicked, so opening a section always starts from the latest saved values. ─────────
  protected readonly requestReferenceEdit = new SectionEditState(() => {
    const group = buildAndPatchGroup(
      this.referenceMainSection,
      this.fb,
      mapIntegratedRequirementToFormPatch(this.ir()).reference.main,
    );
    // Record already has a linked request (opened for edit, not just picked this session) — lock
    // its populated fields immediately instead of waiting for a valueChanges emission that already
    // happened during patchValue() above, before anything was subscribed to hear it.
    const linkedRequestId = group.get('linkedRequestId')?.value as string | null;
    console.log('[IR:link] requestReferenceEdit — section opened', { irId: this.ir().id, linkedRequestId });
    if (linkedRequestId) this.applyLinkedRequestWell(group, linkedRequestId);
    return group;
  });
  protected readonly programEdit = new SectionEditState<FormGroup, WwellIrRawProgramDetails>(() => {
    const patch = mapIntegratedRequirementToFormPatch(this.ir()).programDetails;
    return buildAndPatchGroup(this.programSection, this.fb, { ...patch.main, ...patch.developmentTesting });
  });
  protected readonly geologistContactEdit = new SectionEditState(() =>
    buildAndPatchGroup(this.geologistSection, this.fb, mapIntegratedRequirementToFormPatch(this.ir()).contacts.geologist),
  );
  protected readonly hydrogeologyEdit = new SectionEditState<FormGroup, WwellIrRawHydrology>(() =>
    buildAndPatchGroup(this.hydrogeologySection, this.fb, mapIntegratedRequirementToFormPatch(this.ir()).hydrogeology.main),
  );
  // Horizons rows (3.1) and the single "applies to all" remarks field (3.2) are independent edit
  // units — unlike offsetWellsEdit below, opening one's pencil must not also flip the other into
  // its edit form (each has its own pencil and its own Cancel), even though saveAll() below still
  // merges whichever of the two are open into the same save call.
  protected readonly formationTopsEdit = new SectionEditState<FormArray, WwellIrRawFormationTop[]>(() =>
    buildAndPatchArray(this.formationTopsSection, this.fb, this.ir().formationTops, formationTopRowPatch),
  );
  protected readonly topsRemarksEdit = new SectionEditState<FormGroup, WwellIrRawTopsRemarks>(() =>
    buildAndPatchGroup(this.topsRemarksSection, this.fb, { topsRemarks: this.ir().topsRemarks ?? '' }),
  );
  protected readonly casingEdit = new SectionEditState<FormArray, WwellIrRawCasingRow[]>(() =>
    buildAndPatchArray(this.casingSection, this.fb, this.ir().casing, casingRowPatch),
  );
  protected readonly offsetWellsEdit = new SectionEditState<
    FormGroup,
    { offsetWells: WwellIrRawOffsetWell[]; remarks: WwellIrRawRemarks }
  >(() => {
    const current = this.ir();
    return this.fb.group({
      offsetWells: buildAndPatchArray(this.offsetWellsSection, this.fb, current.offsetWells, offsetWellRowPatch),
      remarks: buildAndPatchGroup(this.offsetRemarksSection, this.fb, { offsetWellsRemarks: current.offsetWellsRemarks ?? '' }),
    });
  });

  // ── Read-only table row sources — prefer whichever section's live FormArray value while it has
  // one open (even silently, from a row delete — see deleteCasingRow etc. below), falling back to
  // the persisted record otherwise. This is what lets a deleted row disappear from the read-only
  // table immediately, with the table staying on screen the whole time instead of the section
  // flipping over to its edit form just to reflect the removal. ─────────────────────────────────
  protected readonly formationTopsRows = computed(() => this.formationTopsEdit.liveValue() ?? this.ir().formationTops);
  protected readonly casingRows = computed(() => this.casingEdit.liveValue() ?? this.ir().casing);
  protected readonly offsetWellsRows = computed(() => this.offsetWellsEdit.liveValue()?.offsetWells ?? this.ir().offsetWells);

  // ── Row-level inline edit — "Edit" on a single read-only-table row edits just that row's
  // already-visible columns in place, the same "don't open the whole section" treatment the row
  // deletes above get. Offset Wells has several fields (TD, RPM, SWL, PWL, drawdown, TDS, H2S...)
  // that aren't shown as table columns at all — those stay reachable only through the section's own
  // "Edit Area Water Wells" pencil (the full form), a deliberate scope call, not an oversight. ────
  protected readonly formationTopsInlineEdit = new InlineRowEditState();
  protected readonly casingInlineEdit = new InlineRowEditState();
  protected readonly offsetWellsInlineEdit = new InlineRowEditState();

  protected rowFieldControl(row: FormGroup, key: string): FormControl {
    return row.get(key) as FormControl;
  }

  private fieldConfigFor(section: WwellFormSectionConfig, key: string): WwellFieldConfig {
    const field = section.repeatable?.rowFields.find(candidate => candidate.key === key);
    if (!field) throw new Error(`Unknown repeatable field "${key}" on section "${section.key}"`);
    return field;
  }

  protected formationTopsFieldConfig(key: string): WwellFieldConfig {
    return this.fieldConfigFor(this.formationTopsSection, key);
  }

  protected casingFieldConfig(key: string): WwellFieldConfig {
    return this.fieldConfigFor(this.casingSection, key);
  }

  protected offsetWellsFieldConfig(key: string): WwellFieldConfig {
    return this.fieldConfigFor(this.offsetWellsSection, key);
  }

  protected formationTopsRowGroup(index: number): FormGroup | null {
    return (this.formationTopsEdit.control()?.at(index) as FormGroup) ?? null;
  }

  protected casingRowGroup(index: number): FormGroup | null {
    return (this.casingEdit.control()?.at(index) as FormGroup) ?? null;
  }

  protected offsetWellsRowGroup(index: number): FormGroup | null {
    const ctrl = this.offsetWellsEdit.control();
    return ctrl ? (this.offsetWellsArrayControl(ctrl).at(index) as FormGroup) : null;
  }

  protected editFormationTopRowInline(index: number): void {
    this.formationTopsEdit.open({ silent: true });
    const row = this.formationTopsRowGroup(index);
    if (row) this.formationTopsInlineEdit.open(index, row);
  }

  protected saveFormationTopRowInline(): void {
    this.formationTopsInlineEdit.close();
    this.notify.info('Formation top updated — click Save to apply.');
  }

  protected cancelFormationTopRowInline(): void {
    const index = this.formationTopsInlineEdit.index();
    this.formationTopsInlineEdit.cancel(index !== null ? this.formationTopsRowGroup(index) : null);
  }

  protected editCasingRowInline(index: number): void {
    this.casingEdit.open({ silent: true });
    const row = this.casingRowGroup(index);
    if (row) this.casingInlineEdit.open(index, row);
  }

  protected saveCasingRowInline(): void {
    this.casingInlineEdit.close();
    this.notify.info('Casing row updated — click Save to apply.');
  }

  protected cancelCasingRowInline(): void {
    const index = this.casingInlineEdit.index();
    this.casingInlineEdit.cancel(index !== null ? this.casingRowGroup(index) : null);
  }

  protected editOffsetWellRowInline(index: number): void {
    this.offsetWellsEdit.open({ silent: true });
    const row = this.offsetWellsRowGroup(index);
    if (row) this.offsetWellsInlineEdit.open(index, row);
  }

  protected saveOffsetWellRowInline(): void {
    this.offsetWellsInlineEdit.close();
    this.notify.info('Offset well updated — click Save to apply.');
  }

  protected cancelOffsetWellRowInline(): void {
    const index = this.offsetWellsInlineEdit.index();
    this.offsetWellsInlineEdit.cancel(index !== null ? this.offsetWellsRowGroup(index) : null);
  }

  // Attachments has no schema-form counterpart worth reusing — both upload slots save into one
  // flat `attachmentNames` list on the domain record (see wwell-ir-section-rail.config.ts's
  // "attachments" entry), and a File can't be reconstructed from a saved name either way — so
  // this is a plain add/remove-by-name editor instead of a SectionEditState/dynamic-section instance.
  protected readonly attachmentsEditing = signal(false);
  protected readonly attachmentsDraftNames = signal<readonly string[]>([]);
  protected readonly attachmentsNewFiles = signal<readonly File[]>([]);

  // One entry per flattened rail leaf, in the same order — see wwell-ir-editor.component.html.
  @ViewChildren('sectionEl', { read: ElementRef }) private readonly sectionEls?: QueryList<ElementRef<HTMLElement>>;
  // The internally-scrolling region (header/footer stay fixed) — see wwell-ir-editor.component.scss.
  @ViewChild('body', { read: ElementRef }) private readonly bodyEl?: ElementRef<HTMLElement>;

  // Tracks which record this editor instance is currently showing — see the identity-change
  // effect below, which is the only reader/writer of this outside the constructor.
  private previousIrId: string | null = null;

  // ── Unsaved-changes tracking — read by WwellIrComponent (via ViewChild) before it lets the user
  // navigate away from this record: switch the selected row, open "New IR", or leave the route
  // entirely (see the wwell-ir CanDeactivate guard). Every open SectionEditState means "the global
  // Save button would submit this section's current live value" (see saveAll() below) — including
  // a row delete or section reset, which open their section and mutate it without saving (see
  // deleteCasingRow/resetProgramSection etc.) — so "any section open" is exactly "something would
  // be lost by leaving now", regardless of whether a control's own `dirty` flag happens to be set
  // (patchValue()/removeAt() don't set it).
  public readonly hasUnsavedChanges = computed(
    () =>
      this.requestReferenceEdit.isEditing() ||
      this.programEdit.isEditing() ||
      this.geologistContactEdit.isEditing() ||
      this.hydrogeologyEdit.isEditing() ||
      this.formationTopsEdit.isEditing() ||
      this.topsRemarksEdit.isEditing() ||
      this.casingEdit.isEditing() ||
      this.offsetWellsEdit.isEditing() ||
      this.attachmentsEditing(),
  );

  // Resolved once the in-flight save this array was queued for actually settles — see the
  // `creatingIr` effect below and saveUnsavedChangesAndWait()'s own doc comment.
  private saveSettledResolvers: ((succeeded: boolean) => void)[] = [];
  private wasSavingForNavigation = false;

  constructor() {
    // The "Link to Request" select lives inside requestReferenceEdit's own lazily-built
    // FormGroup (a fresh instance every time that section's pencil is clicked — see
    // SectionEditState.open()), so this can't be a one-time subscription set up in the
    // constructor: it has to re-subscribe to whichever FormGroup instance is *currently* open,
    // and stop when that section closes (control() goes back to null) or is reopened (a new
    // FormGroup replaces the old one). `effect()`'s cleanup callback handles both.
    effect(onCleanup => {
      const ctrl = this.requestReferenceEdit.control();
      if (!ctrl) return;
      const linkedRequestIdControl = ctrl.get('linkedRequestId');
      const subscription = linkedRequestIdControl?.valueChanges.subscribe((linkedRequestId: string) => {
        console.log('[IR:link] "Link to Request" select — valueChanges fired', { linkedRequestId });
        if (linkedRequestId) this.applyLinkedRequestWell(ctrl, linkedRequestId);
      });
      onCleanup(() => subscription?.unsubscribe());
    });

    // WwellIrComponent reuses this same editor instance across selections — its `@else if
    // (selectedIr(); as ir)` branch never changes just because the *bound* record does (switching
    // list rows, or opening a blank "New IR" draft), so nothing here gets recreated for free. A
    // section already open at that moment keeps the FormGroup it already built — SectionEditState
    // .open() is a no-op once editing (see its own doc comment) — so without this, an open
    // section keeps showing the *previous* record's values after the identity underneath it
    // changes. Closing everything forces every section back to its read display, which re-derives
    // fresh from whatever `ir()` now is on next open. Compares `id` (not the object reference,
    // which also changes on every in-place update from a save) so an update to the *same* record
    // never closes sections the user still has open mid-edit.
    effect(() => {
      const id = this.ir().id;
      if (this.previousIrId !== null && id !== this.previousIrId) this.closeAllSections();
      this.previousIrId = id;
    });

    // Resolves every promise queued by saveUnsavedChangesAndWait() once the save it kicked off
    // settles — mirrors WwellIrComponent's own `wasCreatingIr` settle-detection effect (see there
    // for why a plain `creatingIr()` read can't be used directly: it's a shared store flag, so only
    // the true→false *transition* means "a save just finished", not any particular read of it).
    effect(() => {
      const saving = this.store.creatingIr();
      const settled = this.wasSavingForNavigation && !saving;
      this.wasSavingForNavigation = saving;
      if (!settled || this.saveSettledResolvers.length === 0) return;

      const succeeded = !this.store.createIrError();
      const resolvers = this.saveSettledResolvers;
      this.saveSettledResolvers = [];
      resolvers.forEach(resolve => resolve(succeeded));
    });
  }

  /** Discards every open section's in-progress edits without saving — reverts the editor back to
   *  its all-read-display state, so the next `ir()` (a different record, or this one refreshed)
   *  renders clean. Used by WwellIrComponent's navigation guard when the user picks "Discard
   *  Changes" on the unsaved-changes prompt. */
  public discardUnsavedChanges(): void {
    this.closeAllSections();
  }

  /** Triggers the same global Save as the footer button and resolves once that save request
   *  settles — `true` on success, `false` on failure (the failure itself is already toasted by
   *  WwellIrComponent's `createIrError` effect, same as any other save). Used by WwellIrComponent's
   *  navigation guard when the user picks "Save & Continue"/"Save & Leave": the guard awaits this
   *  before actually letting the navigation proceed, so a failed save keeps the user on the record
   *  instead of losing it mid-flight. Reuses an already-in-flight save (rather than firing a second
   *  one) if saveAll() was already triggered from elsewhere when this is called. */
  public saveUnsavedChangesAndWait(): Promise<boolean> {
    return new Promise(resolve => {
      this.saveSettledResolvers.push(resolve);
      if (!this.store.creatingIr()) this.saveAll();
    });
  }

  ngOnInit(): void {
    this.setViewMode('timeline');
  }

  ngAfterViewInit(): void {
    if (this.bodyEl && this.sectionEls) this.rail.attach(this.bodyEl, this.sectionEls);
  }

  /** Rail click: leaf index is the flattened `railLeaves` index, which is also the `#sectionEl`
   *  DOM order — see wwellIrRailLeaves()'s doc comment. */
  protected leafIndex(leafKey: string): number {
    return this.railLeaves.findIndex(leaf => leaf.key === leafKey);
  }

  protected scrollToLeaf(leafKey: string): void {
    this.rail.scrollToIndex(this.leafIndex(leafKey));
  }

  /** Group header click (e.g. "2.0 General") scrolls to its first child. */
  protected scrollToGroupStart(group: WwellIrRailGroup): void {
    const key = group.leaf?.key ?? group.children?.[0]?.key;
    if (key) this.scrollToLeaf(key);
  }

  protected isLeafActive(leafKey: string): boolean {
    return this.rail.activeIndex() === this.leafIndex(leafKey);
  }

  protected subSeaFt(depthFt: number | null): number | null {
    const elevation = this.ir().requestReference.surfaceElevationFtAsl;
    return elevation === null || depthFt === null ? null : elevation - depthFt;
  }

  /** Selecting a "Link to Request" option auto-fills whichever Request Reference fields that
   *  eligible-well record actually has data for — BI Number/Supporting Business/Target
   *  Aquifer/Target Depth have no source there (exad_rcd_prewap doesn't carry them) and stay
   *  manually entered. Purely a client-side lookup against the already-loaded eligible-wells
   *  list (see store.loadLinkedRequestWells()) — selecting a link never itself triggers a
   *  network call.
   *
   *  Whichever fields the link actually supplies are then locked read-only: they track the source
   *  request record, so letting someone edit or clear them here would silently diverge from (or
   *  desync) that source. Also reused at initial section-open for an already-linked record (see
   *  requestReferenceEdit above) — re-locks the same fields to the same values, so it's a no-op
   *  data-wise there. */
  private applyLinkedRequestWell(referenceGroup: FormGroup, linkedRequestId: string): void {
    console.log('[IR:link] applyLinkedRequestWell — start', { linkedRequestId, eligibleWellsLoaded: this.store.linkedRequestWells().length });
    const well = findLinkedWell(linkedRequestId, this.store.linkedRequestWells());
    if (!well) {
      console.log('[IR:link] applyLinkedRequestWell — no matching eligible well, aborting patch', { linkedRequestId });
      return;
    }

    const hasElevation = linkedWellHasElevation(well);
    const hasCoordinates = linkedWellHasCoordinates(well);

    const patch: Record<string, string | number> = { wellName: well.wellName };
    if (hasElevation) patch['surfaceElevationFtAsl'] = well.surfaceElevation as number;
    if (hasCoordinates) patch['coordinates'] = formatLinkedWellCoordinates(well);
    console.log('[IR:link] applyLinkedRequestWell — patching form group', { patch, hasElevation, hasCoordinates });
    referenceGroup.patchValue(patch);

    referenceGroup.get('wellName')?.disable();
    this.setLinkedFieldLock(referenceGroup, 'surfaceElevationFtAsl', hasElevation);
    this.setLinkedFieldLock(referenceGroup, 'coordinates', hasCoordinates);
    console.log('[IR:link] applyLinkedRequestWell — done', { rawValue: referenceGroup.getRawValue() });
  }

  /** Locks/unlocks one Request Reference field depending on whether the currently-linked request
   *  actually supplied it — switching to a different linked request that lacks, say, coordinates
   *  hands that field back for manual entry rather than leaving it stuck disabled and empty. */
  private setLinkedFieldLock(group: FormGroup, key: string, locked: boolean): void {
    const control = group.get(key);
    if (!control) return;
    console.log('[IR:link] setLinkedFieldLock', { key, locked });
    if (locked) control.disable();
    else control.enable();
  }

  protected offsetWellsArrayControl(ctrl: FormGroup): FormArray {
    return ctrl.get('offsetWells') as FormArray;
  }

  protected offsetWellsRemarksControl(ctrl: FormGroup): FormGroup {
    return ctrl.get('remarks') as FormGroup;
  }

  /** Per-row delete from the read-only table (Casing/Formation Tops/Offset Wells), without first
   *  clicking the section's own pencil: asks for confirmation (the row's key fields are shown in
   *  the dialog so the user knows exactly what they're removing), then — only once confirmed —
   *  opens the section *silently* (building its FormArray fresh from the currently-persisted rows,
   *  in the same order the read-only table shows them — see buildAndPatchArray — so `index` lines
   *  up 1:1) and immediately removes that row, and confirms the removal with a toast.
   *
   *  `open({ silent: true })` is the whole fix for what used to read as "deleting one row reloads
   *  the whole section": a plain `open()` also flips the section over to its big edit-form UI,
   *  which is jarring for a single-row delete and is exactly what pushed content below it up/down
   *  and felt like the page had reloaded. Silent open still builds the same live FormArray Save
   *  reads from — formationTopsRows/casingRows/offsetWellsRows above fall back to that live value
   *  whenever one exists, so the read-only table simply loses that one row (animated out via
   *  appWwellCollapseAnimate on each `<tr>`, same as any other Angular-control-flow removal) while
   *  staying on screen the whole time. buildWwellIrBulkSavePayload's `existing`-diff (see
   *  wwell-ir-payload.mapper.ts) is what turns this missing row into a real DELETE action, kept
   *  rows into UPDATE/no-op, and any newly-added row into INSERT, all in the same eventual save. */
  protected deleteCasingRow(index: number): void {
    const row = this.ir().casing[index];
    this.confirmThenDelete('Delete casing row?', [
      { label: 'Type', value: row.type },
      { label: 'Size', value: row.sizeIn },
      { label: 'Depth', value: `${row.depthFtBgl} ft bgl` },
    ], () => {
      this.casingEdit.open({ silent: true });
      this.casingEdit.control()?.removeAt(index);
      this.notify.info('Casing row removed — click Save to apply.');
    });
  }

  protected deleteFormationTopRow(index: number): void {
    const row = this.ir().formationTops[index];
    this.confirmThenDelete('Delete formation top?', [
      { label: 'Formation', value: row.name },
      { label: 'Depth', value: `${row.depthFt} ft bgl` },
    ], () => {
      this.formationTopsEdit.open({ silent: true });
      this.formationTopsEdit.control()?.removeAt(index);
      this.notify.info('Formation top removed — click Save to apply.');
    });
  }

  protected deleteOffsetWellRow(index: number): void {
    const row = this.ir().offsetWells[index];
    this.confirmThenDelete('Delete offset well?', [
      { label: 'EP A Num', value: String(row.epANum) },
      { label: 'Aquifer', value: row.aquifer || '—' },
    ], () => {
      this.offsetWellsEdit.open({ silent: true });
      const ctrl = this.offsetWellsEdit.control();
      if (ctrl) this.offsetWellsArrayControl(ctrl).removeAt(index);
      this.notify.info('Offset well removed — click Save to apply.');
    });
  }

  /** Clears every field in Program Details (2.1) back to blank — a flat, non-repeatable section
   *  has no "row" to delete (see this section's own read-only view, which has no Actions column),
   *  so this is its equivalent destructive action. Opens the section for editing (if not already)
   *  with the reset values already applied, leaving the global Save button as the one place that
   *  actually persists it — same "review before Save" pattern as the row deletes above. */
  protected resetProgramSection(): void {
    this.confirmThenAct({ title: 'Reset Program Details?', confirmLabel: 'Reset' }, () =>
      this.resetFlatSection(this.programEdit, this.programSection, 'Program Details'),
    );
  }

  protected resetGeologistSection(): void {
    this.confirmThenAct({ title: 'Reset Geologist Contact?', confirmLabel: 'Reset' }, () =>
      this.resetFlatSection(this.geologistContactEdit, this.geologistSection, 'Geologist Contact'),
    );
  }

  private resetFlatSection(edit: SectionEditState<FormGroup, unknown>, section: WwellFormSectionConfig, label: string): void {
    edit.open();
    const ctrl = edit.control();
    if (!ctrl) return;
    const defaults: Record<string, unknown> = {};
    (section.fields ?? []).forEach(field => {
      defaults[field.key] = defaultValueFor(field);
    });
    ctrl.patchValue(defaults);
    this.notify.info(`${label} cleared — click Save to apply.`);
  }

  /** Shared confirm-before-destructive-action gate for the row deletes above and the section
   *  resets above — `onConfirmed` only ever runs once the user actually confirms. */
  private confirmThenAct(
    config: { title: string; rows?: { label: string; value: string }[]; confirmLabel: string },
    onConfirmed: () => void,
  ): void {
    this.confirmDialog
      .open({ title: config.title, rows: config.rows ?? [], confirmLabel: config.confirmLabel, severity: 'danger' })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(confirmed => {
        if (confirmed) onConfirmed();
      });
  }

  private confirmThenDelete(title: string, rows: { label: string; value: string }[], onConfirmed: () => void): void {
    this.confirmThenAct({ title, rows, confirmLabel: 'Delete' }, onConfirmed);
  }

  /** Deletes the whole IR from the backend (header row — casing/tops/hydrogeology/water cascade
   *  server-side via FK, see WwellIrService.deleteIr) after confirmation. Only reachable once the
   *  record is actually persisted (`ir().irSeq !== null`, gated in the template) — a local-only
   *  draft has nothing to delete server-side. WwellIrComponent reacts to store.deletingIr()
   *  settling to notify and fall back the selection once this record disappears from `irs`. */
  protected deleteIr(): void {
    const irSeq = this.ir().irSeq;
    if (irSeq === null || irSeq === undefined) return;
    this.confirmThenAct(
      {
        title: 'Delete this Integrated Requirement?',
        rows: [
          { label: 'IR', value: this.ir().code },
          { label: 'Well', value: this.ir().requestReference.wellName || 'Untitled Well' },
        ],
        confirmLabel: 'Delete',
      },
      () => this.store.deleteIr(irSeq),
    );
  }

  private currentRawFormValue(): WwellIrFormRawValue {
    return mapIntegratedRequirementToRawFormValue(this.ir());
  }

  /** Shared save path: re-derives the payload/bulk-save arrays from the *current* record with the
   *  open sections' slices overlaid, so a section nobody touched this time round is resent
   *  unchanged (and diffed to a DML no-op by buildWwellIrBulkSavePayload's `existing` comparison)
   *  rather than dropped.
   *
   *  Deliberately fires no success toast — the request is still in flight here, so anything shown
   *  now would claim success before the backend has answered (and would still show next to the
   *  error toast when the save actually fails). WwellIrComponent reports the real outcome once
   *  store.creatingIr() settles.
   *
   *  Status handling: the save payload type only ever accepts 'draft' | 'in-progress' (see
   *  CreateIntegratedRequirementPayload) — there's no contract for "edit this field but keep it
   *  Approved/In Review". Editing a draft/in-progress record keeps its current status; editing
   *  anything further along pulls it back to 'in-progress' (not 'draft', since it was already
   *  worked past that point) so it's clear the record needs to move through review again. */
  private saveMergedRaw(raw: WwellIrFormRawValue, attachmentNames?: readonly string[]): void {
    const current = this.ir();
    const status: Extract<IntegratedRequirementStatus, 'draft' | 'in-progress'> =
      current.status === 'draft' || current.status === 'in-progress' ? current.status : 'in-progress';
    const { payload } = mapIrFormValueToSubmission(raw, status);
    const irBulkPayload = buildWwellIrBulkSavePayload(raw, {
      irSeq: current.irSeq ?? null,
      existing: current,
      geologistEmpNumByName: this.store.geologistEmpNumByName(),
    });
    this.store.createIr(payload, irBulkPayload, attachmentNames ?? current.attachmentNames);
  }

  /** Global footer "Save" — merges every currently-open section's live form value (plus
   *  attachments, if that's open too) into a single raw value and saves it in one call, instead of
   *  requiring the user to click each open section's own Save button separately. A section that
   *  isn't open contributes its existing saved value unchanged, exactly as it would for any one
   *  section's own save (see saveMergedRaw / currentRawFormValue). This is also what turns a brand
   *  new local-only draft (ir().irSeq === null) into a real backend record on the very first click,
   *  even if the user never opened a single section — so the no-op guard below only applies once
   *  the record is already persisted; a still-local draft always goes through, even with nothing
   *  open, since that first click is what creates it.
   *
   *  Without the guard, clicking Save again after a save already settled (nothing reopened since)
   *  re-submitted the exact same payload — hasUnsavedChanges() false means no section is open, so
   *  there is nothing new to merge in, but saveMergedRaw() doesn't know that and hits the backend
   *  regardless. */
  protected saveAll(): void {
    if (this.ir().irSeq !== null && !this.hasUnsavedChanges()) {
      this.notify.info('No changes to save.');
      return;
    }

    let raw = this.currentRawFormValue();

    const referenceCtrl = this.requestReferenceEdit.control();
    if (referenceCtrl) raw = { ...raw, reference: { main: referenceCtrl.getRawValue() } };

    const programCtrl = this.programEdit.control();
    if (programCtrl) {
      const flat = programCtrl.getRawValue() as WwellIrRawProgramDetails;
      raw = {
        ...raw,
        programDetails: {
          main: {
            completion: flat.completion,
            openHoleSizeIn: flat.openHoleSizeIn,
            acidization: flat.acidization,
            transmission: flat.transmission,
          },
          developmentTesting: {
            logging: flat.logging,
            mudLogging: flat.mudLogging,
            sampling: flat.sampling,
            flowTest: flat.flowTest,
            remarks: flat.remarks,
          },
        },
      };
    }

    const geologistCtrl = this.geologistContactEdit.control();
    if (geologistCtrl) raw = { ...raw, contacts: { ...raw.contacts, geologist: geologistCtrl.getRawValue() } };

    const hydrogeologyCtrl = this.hydrogeologyEdit.control();
    if (hydrogeologyCtrl) raw = { ...raw, hydrogeology: { main: hydrogeologyCtrl.getRawValue() } };

    const formationTopsCtrl = this.formationTopsEdit.control();
    if (formationTopsCtrl) raw = { ...raw, subsurface: { ...raw.subsurface, formationTops: formationTopsCtrl.getRawValue() } };

    const topsRemarksCtrl = this.topsRemarksEdit.control();
    if (topsRemarksCtrl) raw = { ...raw, subsurface: { ...raw.subsurface, remarks: topsRemarksCtrl.getRawValue() } };

    const casingCtrl = this.casingEdit.control();
    if (casingCtrl) raw = { ...raw, subsurface: { ...raw.subsurface, casing: casingCtrl.getRawValue() } };

    const offsetWellsCtrl = this.offsetWellsEdit.control();
    if (offsetWellsCtrl) {
      raw = {
        ...raw,
        contacts: {
          ...raw.contacts,
          offsetWells: this.offsetWellsArrayControl(offsetWellsCtrl).getRawValue(),
          remarks: this.offsetWellsRemarksControl(offsetWellsCtrl).getRawValue(),
        },
      };
    }

    const attachmentNames = this.attachmentsEditing()
      ? [...this.attachmentsDraftNames(), ...this.attachmentsNewFiles().map(file => file.name)]
      : undefined;

    this.saveMergedRaw(raw, attachmentNames);
    this.closeAllSections();
  }

  private closeAllSections(): void {
    this.requestReferenceEdit.close();
    this.programEdit.close();
    this.geologistContactEdit.close();
    this.hydrogeologyEdit.close();
    this.formationTopsEdit.close();
    this.topsRemarksEdit.close();
    this.casingEdit.close();
    this.offsetWellsEdit.close();
    this.closeAttachmentsEdit();
  }

  protected openAttachmentsEdit(): void {
    this.attachmentsDraftNames.set(this.ir().attachmentNames);
    this.attachmentsNewFiles.set([]);
    this.attachmentsEditing.set(true);
  }

  protected closeAttachmentsEdit(): void {
    this.attachmentsEditing.set(false);
  }

  protected removeAttachmentName(name: string): void {
    this.attachmentsDraftNames.update(names => names.filter(existing => existing !== name));
  }

  protected removeNewAttachmentFile(file: File): void {
    this.attachmentsNewFiles.update(files => files.filter(existing => existing !== file));
  }

  protected onAttachmentFilesPicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const picked = input.files ? Array.from(input.files) : [];
    this.attachmentsNewFiles.update(files => [...files, ...picked]);
    input.value = '';
  }

  protected submitForReview(): void {
    this.store.submitIrForReview(this.ir());
  }
}
