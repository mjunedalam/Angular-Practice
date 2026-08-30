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
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { IntegratedRequirement, IntegratedRequirementStatus } from '@models/wwell-planning/integrated-requirement.model';
import { WellBoreViewComponent } from '../../../presentation/well-bore-view/well-bore-view.component';
import { WwellCollapseAnimateDirective } from '../../shared/wwell-collapse-animate/wwell-collapse-animate.directive';
import { DynamicSectionComponent } from '../../shared/dynamic-form/dynamic-section/dynamic-section.component';
import { WwellFormSectionConfig } from '../../shared/dynamic-form/wwell-dynamic-form.types';
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
import { WwellIrFormRawValue, WwellIrRawCasingRow, WwellIrRawFormationTop } from '../wwell-ir-form/wwell-ir-form.types';
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
import { SectionEditState, buildAndPatchArray, buildAndPatchGroup } from './wwell-ir-section-edit.util';
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

  protected readonly statusMeta = WWELL_IR_STATUS_META;
  protected readonly isSaving = this.store.creatingIr;
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
  protected readonly viewMode = signal<WwellIrEditorViewMode>('sections');
  private readonly expandedTimelineSteps = signal<ReadonlySet<string>>(new Set());

  protected setViewMode(mode: WwellIrEditorViewMode): void {
    this.viewMode.set(mode);
    if (mode === 'timeline' && this.expandedTimelineSteps().size === 0) {
      const firstPending = this.railGroups.find(group => this.timelineStepStatus(group.key) === 'pending');
      this.expandedTimelineSteps.set(new Set([(firstPending ?? this.railGroups[0]).key]));
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

  // Live-wired to the store's linkedRequestWellOptions Signal — same reasoning as the old
  // wizard's own `schema` field (see buildWwellIrFormSchema's doc comment).
  private readonly schema = buildWwellIrFormSchema(this.store.linkedRequestWellOptions);
  protected readonly referenceMainSection = findSection(this.schema, 'reference', 'main');
  protected readonly programMainSection = findSection(this.schema, 'programDetails', 'main');
  protected readonly programDevSection = findSection(this.schema, 'programDetails', 'developmentTesting');
  protected readonly geologistSection = findSection(this.schema, 'contacts', 'geologist');
  protected readonly formationTopsSection = findSection(this.schema, 'subsurface', 'formationTops');
  protected readonly casingSection = findSection(this.schema, 'subsurface', 'casing');
  protected readonly hydrogeologySection = findSection(this.schema, 'hydrogeology', 'main');
  protected readonly offsetWellsSection = findSection(this.schema, 'contacts', 'offsetWells');
  protected readonly offsetRemarksSection = findSection(this.schema, 'contacts', 'remarks');

  // ── View-mode read rows — one computed per section, re-derived whenever `ir()` changes ──────
  protected readonly requestReferenceRows = computed(() =>
    buildRequestReferenceRows(this.ir(), this.store.linkedRequestWellOptions()),
  );
  protected readonly programMainRows = computed(() => buildProgramMainRows(this.ir()));
  protected readonly programDevRows = computed(() => buildProgramDevRows(this.ir()));
  protected readonly hydrogeologyRows = computed(() => buildHydrogeologyRows(this.ir()));
  protected readonly geologistContactRows = computed(() => buildGeologistContactRows(this.ir()));

  // Wellbore preview + casing warnings track the persisted record by default, but read straight
  // from the Horizons/Casing sections' live FormArray values while either is open for editing —
  // via SectionEditState.liveValue — so the diagram builds/updates as rows are added, not only
  // once that section is saved (matching how the old wizard's live preview worked off raw form
  // values). `liveValue()` is `null` whenever that section isn't being edited, which both mapper
  // calls treat as "fall back to `ir()`".
  protected readonly wellboreDiagramData: Signal<WellboreDiagramData> = computed(() =>
    buildWellboreDiagramDataFromIntegratedRequirement(this.ir(), this.casingEdit.liveValue(), this.formationTopsEdit.liveValue()),
  );
  protected readonly hasWellboreData: Signal<boolean> = computed(() =>
    hasWellboreDiagramDataForIntegratedRequirement(this.ir(), this.casingEdit.liveValue(), this.formationTopsEdit.liveValue()),
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
    if (linkedRequestId) this.applyLinkedRequestWell(group, linkedRequestId);
    return group;
  });
  protected readonly programMainEdit = new SectionEditState(() =>
    buildAndPatchGroup(this.programMainSection, this.fb, mapIntegratedRequirementToFormPatch(this.ir()).programDetails.main),
  );
  protected readonly programDevEdit = new SectionEditState(() =>
    buildAndPatchGroup(
      this.programDevSection,
      this.fb,
      mapIntegratedRequirementToFormPatch(this.ir()).programDetails.developmentTesting,
    ),
  );
  protected readonly geologistContactEdit = new SectionEditState(() =>
    buildAndPatchGroup(this.geologistSection, this.fb, mapIntegratedRequirementToFormPatch(this.ir()).contacts.geologist),
  );
  protected readonly hydrogeologyEdit = new SectionEditState(() =>
    buildAndPatchGroup(this.hydrogeologySection, this.fb, mapIntegratedRequirementToFormPatch(this.ir()).hydrogeology.main),
  );
  protected readonly formationTopsEdit = new SectionEditState<FormArray, WwellIrRawFormationTop[]>(() =>
    buildAndPatchArray(this.formationTopsSection, this.fb, this.ir().formationTops, formationTopRowPatch),
  );
  protected readonly casingEdit = new SectionEditState<FormArray, WwellIrRawCasingRow[]>(() =>
    buildAndPatchArray(this.casingSection, this.fb, this.ir().casing, casingRowPatch),
  );
  protected readonly offsetWellsEdit = new SectionEditState(() => {
    const current = this.ir();
    return this.fb.group({
      offsetWells: buildAndPatchArray(this.offsetWellsSection, this.fb, current.offsetWells, offsetWellRowPatch),
      remarks: buildAndPatchGroup(this.offsetRemarksSection, this.fb, { offsetWellsRemarks: current.offsetWellsRemarks ?? '' }),
    });
  });

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
  }

  ngOnInit(): void {
    this.store.loadLinkedRequestWells();
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

  protected subSeaFt(depthFt: number): number | null {
    const elevation = this.ir().requestReference.surfaceElevationFtAsl;
    return elevation === null ? null : elevation - depthFt;
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
    const well = this.store.linkedRequestWells().find(candidate => String(candidate.prewapSeq) === linkedRequestId);
    if (!well) return;

    const hasElevation = well.surfaceElevation != null;
    const hasCoordinates = well.surfaceNorth != null && well.surfaceEast != null;

    const patch: Record<string, string | number> = { wellName: well.wellName };
    if (hasElevation) patch['surfaceElevationFtAsl'] = well.surfaceElevation;
    if (hasCoordinates) patch['coordinates'] = `${well.surfaceNorth}°N, ${well.surfaceEast}°E`;
    referenceGroup.patchValue(patch);

    referenceGroup.get('wellName')?.disable();
    this.setLinkedFieldLock(referenceGroup, 'surfaceElevationFtAsl', hasElevation);
    this.setLinkedFieldLock(referenceGroup, 'coordinates', hasCoordinates);
  }

  /** Locks/unlocks one Request Reference field depending on whether the currently-linked request
   *  actually supplied it — switching to a different linked request that lacks, say, coordinates
   *  hands that field back for manual entry rather than leaving it stuck disabled and empty. */
  private setLinkedFieldLock(group: FormGroup, key: string, locked: boolean): void {
    const control = group.get(key);
    if (!control) return;
    if (locked) control.disable();
    else control.enable();
  }

  protected offsetWellsArrayControl(ctrl: FormGroup): FormArray {
    return ctrl.get('offsetWells') as FormArray;
  }

  protected offsetWellsRemarksControl(ctrl: FormGroup): FormGroup {
    return ctrl.get('remarks') as FormGroup;
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
    const irBulkPayload = buildWwellIrBulkSavePayload(raw, { irSeq: current.irSeq ?? null, existing: current });
    this.store.createIr(payload, irBulkPayload, attachmentNames ?? current.attachmentNames);
  }

  /** Global footer "Save" — merges every currently-open section's live form value (plus
   *  attachments, if that's open too) into a single raw value and saves it in one call, instead of
   *  requiring the user to click each open section's own Save button separately. A section that
   *  isn't open contributes its existing saved value unchanged, exactly as it would for any one
   *  section's own save (see saveMergedRaw / currentRawFormValue). This is also what turns a brand
   *  new local-only draft (ir().irSeq === null) into a real backend record on the very first click,
   *  even if the user never opened a single section. */
  protected saveAll(): void {
    let raw = this.currentRawFormValue();

    const referenceCtrl = this.requestReferenceEdit.control();
    if (referenceCtrl) raw = { ...raw, reference: { main: referenceCtrl.getRawValue() } };

    const programMainCtrl = this.programMainEdit.control();
    if (programMainCtrl) raw = { ...raw, programDetails: { ...raw.programDetails, main: programMainCtrl.getRawValue() } };

    const programDevCtrl = this.programDevEdit.control();
    if (programDevCtrl) {
      raw = { ...raw, programDetails: { ...raw.programDetails, developmentTesting: programDevCtrl.getRawValue() } };
    }

    const geologistCtrl = this.geologistContactEdit.control();
    if (geologistCtrl) raw = { ...raw, contacts: { ...raw.contacts, geologist: geologistCtrl.getRawValue() } };

    const hydrogeologyCtrl = this.hydrogeologyEdit.control();
    if (hydrogeologyCtrl) raw = { ...raw, hydrogeology: { main: hydrogeologyCtrl.getRawValue() } };

    const formationTopsCtrl = this.formationTopsEdit.control();
    if (formationTopsCtrl) raw = { ...raw, subsurface: { ...raw.subsurface, formationTops: formationTopsCtrl.getRawValue() } };

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
    this.programMainEdit.close();
    this.programDevEdit.close();
    this.geologistContactEdit.close();
    this.hydrogeologyEdit.close();
    this.formationTopsEdit.close();
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
