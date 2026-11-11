import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  QueryList,
  Signal,
  ViewChild,
  ViewChildren,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { IntegratedRequirement, IntegratedRequirementStatus } from '@models/wwell-planning/integrated-requirement.model';
import { IrAttachment, IrAttachmentSlot, IrPendingAttachment } from '@models/wwell-planning/ir-attachment.model';
import { MatDialog } from '@angular/material/dialog';
import { ActionConfirmDialogService } from '@shared/components/action-confirm-dialog/action-confirm-dialog.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { WwellIrAttachmentUploadDialogComponent } from '../wwell-ir-attachment-upload-dialog/wwell-ir-attachment-upload-dialog.component';
import { WwellIrAttachmentViewerComponent } from '../wwell-ir-attachment-viewer/wwell-ir-attachment-viewer.component';
import { WwellApprovalWorkflowCardComponent } from '../../shared/wwell-approvals/wwell-approval-workflow-card/wwell-approval-workflow-card.component';
import { approvalRingPercent, chainCompletionColor, countApprovedSteps } from '../../shared/wwell-approvals/wwell-approvals.config';
import { WwellCollapseAnimateDirective } from '../../shared/wwell-collapse-animate/wwell-collapse-animate.directive';
import { DynamicFieldComponent } from '../../shared/dynamic-form/dynamic-field/dynamic-field.component';
import { DynamicSectionComponent } from '../../shared/dynamic-form/dynamic-section/dynamic-section.component';
import { addRepeatableRow, blankValueFor, buildSectionGroup, defaultValueFor } from '../../shared/dynamic-form/wwell-dynamic-form.builder';
import { WwellFieldConfig, WwellFormSectionConfig } from '../../shared/dynamic-form/wwell-dynamic-form.types';
import { WwellIrStore } from '../store/wwell-ir.store';
import { WwellIrWellborePanelComponent } from '../wwell-ir-wellbore-panel/wwell-ir-wellbore-panel.component';
import { WwellIrKvValueComponent } from '../wwell-ir-kv-value/wwell-ir-kv-value.component';
import {
  casingRowPatch,
  formationTopRowPatch,
  mapIntegratedRequirementToFormPatch,
  mapIntegratedRequirementToRawFormValue,
  offsetWellRowPatch,
} from '../wwell-ir-form/wwell-ir-edit.mapper';
import { CasingSizeWarning, findInvertedCasingSizeRows } from '../wwell-ir-form/wwell-ir-casing-warnings.util';
import { mapIrFormValueToSubmission } from '../wwell-ir-form/wwell-ir-form.mapper';
import { WWELL_IR_OFFSET_WELL_SOURCE_OPTIONS, findIrOffsetWellSource } from '../wwell-ir-form/wwell-ir-offset-well-source.config';
import { buildWwellIrFormSchema } from '../wwell-ir-form/wwell-ir-form.schema';
import {
  WwellIrFormRawValue,
  WwellIrRawCasingRow,
  WwellIrRawFormationTop,
  WwellIrRawHydrology,
  WwellIrRawOffsetWell,
  WwellIrRawProgramDetails,
  WwellIrRawProgramMain,
  WwellIrRawReference,
  WwellIrRawRemarks,
  WwellIrRawTopsRemarks,
} from '../wwell-ir-form/wwell-ir-form.types';
import { buildWwellIrBulkSavePayload, casingKey, topKey, waterKey } from '../wwell-ir-form/wwell-ir-payload.mapper';
import {
  buildWellboreDiagramDataFromIntegratedRequirement,
  hasWellboreDiagramDataForIntegratedRequirement,
  wellboreDiagramDataEqual,
} from '../wwell-ir-form/wwell-ir-wellbore-diagram.mapper';
import {
  WWELL_IR_ATTACHMENT_ACCEPT,
  WWELL_IR_ATTACHMENT_MAX_BYTES,
  WWELL_IR_ATTACHMENT_SLOTS,
  hasAllRequiredAttachments,
  irAttachmentsFor,
} from '../wwell-ir-attachments.config';
import { S3Service } from '@services/s3/s3.service';
import {
  WWELL_IR_SUBMITTABLE_STATUSES,
  hasKnownIrStatus,
  irBadgeMeta,
  isSapWorkflowResubmittable,
  isSapWorkflowTerminal,
  wwellIrHasRequiredSubmitFields,
} from '../wwell-ir.config';
import {
  buildGeologistContactRows,
  buildHydrogeologyRows,
  buildProgramDevRows,
  buildProgramMainRows,
  buildRequestReferenceRows,
} from './wwell-ir-detail-rows.util';
import { WWELL_IR_PREVIEW_DIAGRAM_LAYOUT, WWELL_IR_SIDEBAR_DIAGRAM_LAYOUT } from './wwell-ir-preview-diagram-layout';
import {
  findLinkedWell,
  formatLinkedWellCoordinates,
  linkedWellHasCoordinates,
  linkedWellHasElevation,
  linkedWellHasSupportingBusiness,
  linkedWellHasTargetAquifer,
  linkedWellHasTargetDepth,
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

/** A repeatable config for the section's "+" add-form — same row shape as the full section's own
 *  repeatable config, `requiredKeys` (the fields Save identifies a row by, so a row can't be added
 *  without them) additionally marked required. Rendered through the same `<app-repeatable-group>`
 *  the full section's own edit view uses, so each staged row gets its own remove (✕) button for
 *  free — but `showAddButton: false` hides that component's own "+ Add Row" button, since the
 *  section-head "+" icon already appends a row on every click (`addStagedRow`); keeping both would
 *  be two buttons doing the same thing. `minRows` is deliberately omitted (defaults to 0) — the
 *  array starts empty and `addStagedRow` adds exactly one row per click, including the first,
 *  rather than the click handler and a `minRows: 1` seed both trying to supply that first row. */
function addRowsSection(section: WwellFormSectionConfig, requiredKeys: readonly string[], addLabel: string): WwellFormSectionConfig {
  const rowFields = section.repeatable?.rowFields ?? [];
  const key = `${section.key}NewRows`;
  return {
    key,
    title: null,
    repeatable: {
      key,
      addLabel,
      showAddButton: false,
      rowFields: rowFields.map(field =>
        requiredKeys.includes(field.key) ? { ...field, validators: { ...field.validators, required: true } } : field,
      ),
    },
  };
}

const OFFSET_WELL_PICKER_KEY = 'sourceWell';

/** Prepends the "Select Offset Water Well" picker to a section's row fields — required in the "+" add form (it supplies
 *  the row's id and name), optional when editing existing rows. */
function withOffsetWellPicker(section: WwellFormSectionConfig, required: boolean): WwellFormSectionConfig {
  const repeatable = section.repeatable;
  if (!repeatable) return section;
  const picker: WwellFieldConfig = {
    key: OFFSET_WELL_PICKER_KEY,
    label: 'Select Offset Water Well',
    type: 'select',
    options: WWELL_IR_OFFSET_WELL_SOURCE_OPTIONS,
    placeholder: 'Select a well — fills the fields below',
    ...(required ? { validators: { required: true } } : {}),
    searchable: true,
    colSpan: 2,
  };
  return { ...section, repeatable: { ...repeatable, rowFields: [picker, ...repeatable.rowFields] } };
}

@Component({
  selector: 'app-wwell-ir-editor',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    OverlayModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    DynamicFieldComponent,
    DynamicSectionComponent,
    WwellIrWellborePanelComponent,
    WwellIrKvValueComponent,
    WwellApprovalWorkflowCardComponent,
    WwellCollapseAnimateDirective,
  ],
  templateUrl: './wwell-ir-editor.component.html',
  styleUrls: ['./wwell-ir-editor.component.scss', './wwell-ir-editor.sections.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { '[class.ire-flag-unsaved]': 'flagUnsaved()' },
})
export class WwellIrEditorComponent implements AfterViewInit {
  readonly ir = input.required<IntegratedRequirement>();

  /** The header's back arrow — WwellIrComponent listens and closes the whole detail panel
   *  (deselects), going through the same unsaved-changes guard any other "leave this record"
   *  action does. This component never checks `hasUnsavedChanges()` itself before emitting; the
   *  guard lives one level up, exactly like every other navigation trigger here (row switch, New IR,
   *  the view toggle below). */
  readonly backRequested = output<void>();
  /** The header's "View" toggle — WwellIrComponent listens and switches this same record's detail
   *  panel to the read-only stepper, again guarded one level up since that switch destroys this
   *  editor instance. */
  readonly viewRequested = output<void>();

  private readonly fb = inject(FormBuilder);
  protected readonly store = inject(WwellIrStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmDialog = inject(ActionConfirmDialogService);
  private readonly notify = inject(NotificationService);
  private readonly s3 = inject(S3Service);
  private readonly dialog = inject(MatDialog);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly hasKnownStatus = hasKnownIrStatus;
  protected readonly badgeMeta = irBadgeMeta;
  protected readonly isSaving = this.store.creatingIr;
  protected readonly isSubmittingForReview = this.store.updatingIrStatus;
  protected readonly isRecalling = this.store.recallingIr;
  protected readonly anyFooterActionPending = computed(
    () => this.isSaving() || this.isSubmittingForReview() || this.isRecalling(),
  );
  protected readonly hasSavedIrSeq = computed(() => this.ir().irSeq !== null && this.ir().irSeq !== undefined);
  protected readonly selectPanelClass = SELECT_PANEL_CLASS;
  /** A never-submitted record (no `sapWfId`), or one whose workflow was recalled, rejected or cancelled —
   *  they get "Submit for Review" back to resubmit fresh under a new SAP workflow id (submitIrForReview
   *  mints one regardless of the old sapWfId). Once submitted, "Recall" replaces it while the workflow is
   *  live. Only Approved is final — no way back from here.
   *
   *  Requires `hasSavedIrSeq()` first — an unsaved draft has no `ir_seq` to file the SAP workflow
   *  under, so it must be created (Save) before it can be submitted. Also requires
   *  every attachment slot (Location Map, Initiation Request, WLDA) holding a file, and
   *  `wwellIrHasRequiredSubmitFields` — a saved-but-incomplete record (missing fields the schema
   *  itself marks required) shouldn't be submittable just because *something* was saved. */
  protected readonly canSubmitForReview = computed(() => {
    const ir = this.ir();
    if (!this.hasSavedIrSeq() || !wwellIrHasRequiredSubmitFields(ir) || !hasAllRequiredAttachments(ir.attachments)) return false;
    return (WWELL_IR_SUBMITTABLE_STATUSES.includes(ir.status) && ir.sapWfId == null) || isSapWorkflowResubmittable(ir.sapWfStatusText);
  });
  /** Once a record has been submitted (a real `sapWfId`), "Submit for Review" no longer applies —
   *  "Recall" takes its place in the same footer slot, but only while the workflow is still live:
   *  an already-Approved/Rejected/Cancelled/Recalled workflow has nothing left to pull back
   *  (Recalled instead brings back "Submit for Review", see canSubmitForReview above). */
  protected readonly canRecallIr = computed(() => this.ir().sapWfId != null && !isSapWorkflowTerminal(this.ir().sapWfStatusText));

  protected refreshApprovalStatus(): void {
    const ir = this.ir();
    if (ir.irSeq == null || ir.sapWfId == null) return;
    this.store.refreshIrApprovalStatus(ir.irSeq, ir.sapWfId);
  }

  // ── Approval-workflow header pill — the editor's own compact stand-in for the main IR page's
  // persistent approval sidebar (View mode only, see WwellIrComponent's template): reserving a
  // fixed-width column here would compete with the rail/sections/wellbore-preview columns this
  // view already has, so instead a small ring+count pill sits in the header and expands into the
  // exact same WwellApprovalWorkflowCardComponent via a CDK connected overlay, anchored to itself.
  protected readonly countApprovedSteps = countApprovedSteps;
  protected readonly approvalRingPercent = approvalRingPercent;
  protected readonly chainCompletionColor = chainCompletionColor;
  protected readonly approvalPopoverOpen = signal(false);
  protected readonly approvalPopoverPositions: ConnectedPosition[] = [
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 8 },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -8 },
  ];

  protected toggleApprovalPopover(): void {
    this.approvalPopoverOpen.update(open => !open);
  }

  protected readonly railGroups = WWELL_IR_SECTION_RAIL;
  private readonly railLeaves = wwellIrRailLeaves(WWELL_IR_SECTION_RAIL);
  protected readonly rail = new SectionRailController(this.destroyRef);

  readonly viewMode = model<WwellIrEditorViewMode>('timeline');
  private readonly expandedTimelineSteps = signal<ReadonlySet<string>>(new Set(this.railGroups.map(group => group.key)));

  protected setViewMode(mode: WwellIrEditorViewMode): void {
    this.viewMode.set(mode);
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

  protected readonly allTimelineStepsExpanded = computed(() => this.expandedTimelineSteps().size >= this.railGroups.length);

  protected toggleAllTimelineSteps(): void {
    this.expandedTimelineSteps.set(
      this.allTimelineStepsExpanded() ? new Set() : new Set(this.railGroups.map(group => group.key)),
    );
  }

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

  private readonly schema = buildWwellIrFormSchema(
    this.store.linkedRequestWellOptions,
    this.store.geologistOptions,
    this.store.dropdownMenus,
    this.store.aquiferOptions,
    this.store.formationOptions,
  );
  protected readonly referenceMainSection = findSection(this.schema, 'reference', 'main');
  protected readonly programSection = findSection(this.schema, 'programDetails', 'main');
  protected readonly geologistSection = findSection(this.schema, 'contacts', 'geologist');
  protected readonly formationTopsSection = findSection(this.schema, 'subsurface', 'formationTops');
  protected readonly topsRemarksSection = findSection(this.schema, 'subsurface', 'remarks');
  protected readonly casingSection = findSection(this.schema, 'subsurface', 'casing');
  protected readonly hydrogeologySection = findSection(this.schema, 'hydrogeology', 'main');
  protected readonly offsetWellsSection = findSection(this.schema, 'contacts', 'offsetWells');
  /** What the section pencil's form is built and drawn from: the section's own rows plus the optional "Select Offset
   *  Water Well" picker on each (see `withOffsetWellPicker`). Existing rows have no picked well, so it is not required here. */
  protected readonly offsetWellsEditSection = withOffsetWellPicker(this.offsetWellsSection, false);
  protected readonly offsetRemarksSection = findSection(this.schema, 'contacts', 'remarks');
  protected readonly formationTopAddSection = addRowsSection(this.formationTopsSection, ['name', 'depthFt'], '+ Add Formation Top');
  protected readonly casingAddSection = addRowsSection(this.casingSection, ['type', 'sizeIn', 'depthFtBgl'], '+ Add Casing');
  /** The "+" add-form's rows carry one extra, never-saved field up front: "Select Offset Water Well", which fills every
   *  other column except distance and location (see `applyOffsetWellSource`) and is required, since it is what supplies the
   *  well's id (EP A number — the save key, no longer typed or shown) and name. It is not part of the section's own
   *  schema, so the live rows, the saved payload and the read-only table never see it. */
  protected readonly offsetWellAddSection = withOffsetWellPicker(
    addRowsSection(this.offsetWellsSection, ['aquifer'], '+ Add Offset Well'),
    true,
  );

  protected readonly requestReferenceRows = computed(() =>
    buildRequestReferenceRows(this.ir(), this.store.linkedRequestWellOptions(), !this.hasSavedIrSeq()),
  );
  protected readonly headerTitle = computed(() => {
    const live = this.requestReferenceEdit.liveValue();
    return (live ? live.wellName : this.ir().requestReference.wellName) || 'Untitled Well';
  });
  /** Follows the live edit like the title: picking a linked request fills the coordinates before Save. */
  protected readonly headerCoordinates = computed(() => {
    const live = this.requestReferenceEdit.liveValue();
    return (live ? live.coordinates : this.ir().requestReference.coordinates) ?? '';
  });
  /** Follows the live edit of the Estimated Hydrology step's Test Type toggle. */
  protected readonly headerTestType = computed(() => this.hydrogeologyEdit.liveValue()?.testType ?? this.ir().testProgram.testType);
  /** The Program Details form for the current Hydrology Test Type (live while Hydrology is being
   *  edited): Flow Test (FLOW_RMKS) for a flow test, Development/Testing (DEV_PUMP_TEST) for a pump
   *  test. The hidden field's control stays in the form, so its stored value is left untouched. */
  protected readonly programSectionForTest = computed(() => {
    const hiddenKey = this.headerTestType() === 'flow-test' ? 'remarks' : 'flowTest';
    return { ...this.programSection, fields: (this.programSection.fields ?? []).filter(field => field.key !== hiddenKey) };
  });
  protected readonly programRows = computed(() => [...buildProgramMainRows(this.ir()), ...buildProgramDevRows(this.ir())]);
  protected readonly hydrogeologyRows = computed(() => buildHydrogeologyRows(this.ir()));
  protected readonly geologistContactRows = computed(() => buildGeologistContactRows(this.ir()));

  /**
   * `equal` is load-bearing, not an optimisation. Every section open for live edit re-emits its whole
   * raw value on each keystroke, so this rebuilds on input the diagram does not draw — a client name, a
   * letter number, a geologist. Signals compare by reference, so each of those rebuilt objects read as a
   * change and `well-bore-view`'s effect fades the drawing out and re-animates it. Comparing structurally
   * keeps the previous object whenever nothing the diagram actually renders has moved.
   */
  protected readonly wellboreDiagramData: Signal<WellboreDiagramData> = computed(
    () =>
      buildWellboreDiagramDataFromIntegratedRequirement(
        this.ir(),
        this.casingPreviewRows(),
        this.formationTopsPreviewRows(),
        this.programMainLiveValue(),
        this.hydrogeologyEdit.liveValue(),
        this.requestReferenceEdit.liveValue(),
      ),
    { equal: wellboreDiagramDataEqual },
  );
  private readonly programMainLiveValue = computed<WwellIrRawProgramMain | null>(() => {
    const live = this.programEdit.liveValue();
    if (!live) return null;
    return {
      completionType: live.completionType,
      completion: live.completion,
      openHoleSizeIn: live.openHoleSizeIn,
      linerSizeIn: live.linerSizeIn,
      linerDepthFt: live.linerDepthFt,
      acidization: live.acidization,
      transmission: live.transmission,
    };
  });
  protected readonly hasWellboreData: Signal<boolean> = computed(() =>
    hasWellboreDiagramDataForIntegratedRequirement(
      this.ir(),
      this.casingPreviewRows(),
      this.formationTopsPreviewRows(),
      this.programMainLiveValue(),
    ),
  );
  /** Follows the live edit too — otherwise typing a Target Depth left the readout and the D3 label
   *  hidden until save, while the drawing beneath them had already moved. */
  protected readonly hasTargetDepth: Signal<boolean> = computed(() => {
    const live = this.requestReferenceEdit.liveValue();
    return ((live ? live.targetDepthFt : this.ir().requestReference.targetDepthFt) ?? 0) > 0;
  });
  protected readonly previewDiagramLayout = WWELL_IR_PREVIEW_DIAGRAM_LAYOUT;
  protected readonly sidebarDiagramLayout = WWELL_IR_SIDEBAR_DIAGRAM_LAYOUT;
  protected readonly casingSizeWarnings: Signal<readonly CasingSizeWarning[]> = computed(() =>
    findInvertedCasingSizeRows(this.ir().casing.map(casingRowPatch)),
  );

  protected readonly requestReferenceEdit = new SectionEditState<FormGroup, WwellIrRawReference>(() => {
    const group = buildAndPatchGroup(
      this.referenceMainSection,
      this.fb,
      mapIntegratedRequirementToFormPatch(this.ir()).reference.main,
    );
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
  protected readonly formationTopsEdit = new SectionEditState<FormArray, WwellIrRawFormationTop[]>(() =>
    buildAndPatchArray(this.formationTopsSection, this.fb, this.ir().formationTops, formationTopRowPatch),
  );
  protected readonly topsRemarksEdit = new SectionEditState<FormGroup, WwellIrRawTopsRemarks>(() =>
    buildAndPatchGroup(this.topsRemarksSection, this.fb, { topsRemarks: this.ir().topsRemarks ?? '' }),
  );
  protected readonly casingEdit = new SectionEditState<FormArray, WwellIrRawCasingRow[]>(() =>
    buildAndPatchArray(this.casingSection, this.fb, this.ir().casing, casingRowPatch),
  );
  protected readonly offsetWellsEdit = new SectionEditState<FormArray, WwellIrRawOffsetWell[]>(() =>
    buildAndPatchArray(this.offsetWellsEditSection, this.fb, this.ir().offsetWells, offsetWellRowPatch),
  );
  protected readonly offsetRemarksEdit = new SectionEditState<FormGroup, WwellIrRawRemarks>(() =>
    buildAndPatchGroup(this.offsetRemarksSection, this.fb, { offsetWellsRemarks: this.ir().offsetWellsRemarks ?? '' }),
  );

  /** The "+" buttons' add-forms. Their control is a standalone array — rows only reach the section's live
   *  FormArray (the one Save diffs) once "Add" commits them — so opening one never flips the section into
   *  its edit form. Starts at one empty row (`addRowsSection`'s `minRows: 1`); the add-form's own
   *  `<app-repeatable-group>` "+ Add Row" button grows it further, so any number of rows can be staged
   *  and filled in before a single "Add" click commits all of them together (see `commitNewRows`). */
  protected readonly formationTopAdd = new SectionEditState<FormArray, WwellIrRawFormationTop[]>(
    () => buildSectionGroup(this.formationTopAddSection, this.fb) as FormArray,
  );
  protected readonly casingAdd = new SectionEditState<FormArray, WwellIrRawCasingRow[]>(
    () => buildSectionGroup(this.casingAddSection, this.fb) as FormArray,
  );
  protected readonly offsetWellAdd = new SectionEditState<FormArray, WwellIrRawOffsetWell[]>(
    () => buildSectionGroup(this.offsetWellAddSection, this.fb) as FormArray,
  );

  protected readonly formationTopsRows = computed(() => this.formationTopsEdit.liveValue() ?? this.ir().formationTops.map(formationTopRowPatch));
  protected readonly casingRows = computed(() => this.casingEdit.liveValue() ?? this.ir().casing.map(casingRowPatch));
  protected readonly offsetWellsRows = computed(() => this.offsetWellsEdit.liveValue() ?? this.ir().offsetWells.map(offsetWellRowPatch));

  // The saved rows, by natural key — what a table cell is compared against to decide whether it carries an
  // unsaved change (green). A row whose key isn't saved yet (added, or its key edited) is wholly green.
  private readonly savedTops = computed(() => new Map(this.ir().formationTops.map(formationTopRowPatch).map(row => [topKey(row), row])));
  private readonly savedCasing = computed(() => new Map(this.ir().casing.map(casingRowPatch).map(row => [casingKey(row), row])));
  private readonly savedWells = computed(() => new Map(this.ir().offsetWells.map(offsetWellRowPatch).map(row => [waterKey(row.epANum ?? 0), row])));

  private cellChanged<TRow extends object>(saved: ReadonlyMap<string, TRow>, key: string, row: TRow, field: keyof TRow): boolean {
    const original = saved.get(key);
    return !original || original[field] !== row[field];
  }

  protected topChanged(row: WwellIrRawFormationTop, field: keyof WwellIrRawFormationTop): boolean {
    return this.cellChanged(this.savedTops(), topKey(row), row, field);
  }

  protected casingChanged(row: WwellIrRawCasingRow, field: keyof WwellIrRawCasingRow): boolean {
    return this.cellChanged(this.savedCasing(), casingKey(row), row, field);
  }

  protected wellChanged(row: WwellIrRawOffsetWell, field: keyof WwellIrRawOffsetWell): boolean {
    return this.cellChanged(this.savedWells(), waterKey(row.epANum ?? 0), row, field);
  }

  /** What the Wellbore Preview draws for the casing / formation tops: the section's live rows (edits, deletes, committed
   *  adds) plus the "+" form's row as it is typed, so a row is in the drawing the moment it is complete — not only once
   *  "Add" (and then Save) has been pressed — and leaves it again on Cancel. `null` while neither is in play, so the
   *  mapper keeps reading the saved record. */
  protected readonly casingPreviewRows = computed(() =>
    this.previewRows(this.casingEdit.liveValue(), () => this.ir().casing.map(casingRowPatch), this.casingAdd.liveValue(), casingKey),
  );
  protected readonly formationTopsPreviewRows = computed(() =>
    this.previewRows(
      this.formationTopsEdit.liveValue(),
      () => this.ir().formationTops.map(formationTopRowPatch),
      this.formationTopAdd.liveValue(),
      topKey,
    ),
  );

  private previewRows<TRow>(
    live: readonly TRow[] | null,
    saved: () => readonly TRow[],
    draftRows: readonly TRow[] | null,
    keyOf: (row: TRow) => string,
  ): readonly TRow[] | null {
    if (!draftRows?.length) return live;
    const rows = live ?? saved();
    const keys = new Set(rows.map(keyOf));
    // "Add" refuses a row whose natural key is already taken (it would overwrite that row) — including by
    // another staged draft row — so a colliding draft is not drawn either.
    const additions = draftRows.filter(draft => {
      const key = keyOf(draft);
      if (keys.has(key)) return false;
      keys.add(key);
      return true;
    });
    return additions.length ? [...rows, ...additions] : live;
  }

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
    return ctrl ? (ctrl.at(index) as FormGroup) : null;
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

  /** The section-head "+" icon's handler — opens the add-form if it isn't already (a no-op on the
   *  control if it is, same as `SectionEditState.open()` always does), then unconditionally appends
   *  one more empty row. Every click adds exactly one row, including the first, since the add-form's
   *  own section config seeds none (`addRowsSection` omits `minRows`) — this is the only thing that
   *  ever adds a row to it now that `showAddButton: false` hides the repeatable-group's own button. */
  private addStagedRow(add: SectionEditState<FormArray>, section: WwellFormSectionConfig): void {
    add.open();
    const array = add.control();
    if (array) addRepeatableRow(array, section.repeatable?.rowFields ?? [], this.fb);
  }

  protected addFormationTopAddRow(): void {
    this.addStagedRow(this.formationTopAdd, this.formationTopAddSection);
  }

  protected addCasingAddRow(): void {
    this.addStagedRow(this.casingAdd, this.casingAddSection);
  }

  protected addOffsetWellAddRow(): void {
    this.addStagedRow(this.offsetWellAdd, this.offsetWellAddSection);
  }

  /** Watches an offset-well FormArray (the "+" add form, or the section pencil's edit form) and, whenever a row's
   *  "Select Offset Water Well" value changes, fills that row from the picked well. Re-binds each time the form is
   *  opened afresh; the previous subscription is dropped with the previous array. */
  private bindOffsetWellPicker(array: () => FormArray | null): void {
    effect(onCleanup => {
      const live = array();
      if (!live) return;
      const picked = new WeakMap<FormGroup, unknown>();
      const subscription = live.valueChanges.subscribe(() => {
        for (const row of live.controls as FormGroup[]) {
          const value = row.get(OFFSET_WELL_PICKER_KEY)?.value;
          if (picked.get(row) === value) continue;
          picked.set(row, value);
          if (value) this.applyOffsetWellSource(row, value as string);
        }
      });
      onCleanup(() => subscription.unsubscribe());
    });
  }

  /** Fills a staged row from the picked offset water well — every column except distance and location, which are
   *  specific to the new well and stay as the author typed them. The source list is dummy data for now
   *  (wwell-ir-offset-well-source.config.ts) until the backend procedure exists. */
  private applyOffsetWellSource(row: FormGroup, value: string | null): void {
    const well = findIrOffsetWellSource(value);
    if (!well) return;
    row.patchValue({
      epANum: well.epANum,
      wellName: well.name,
      aquifer: well.aquifer,
      totalDepthFt: well.totalDepthFt,
      testDurationMin: well.testDurationMin,
      rateGpm: well.rateGpm,
      rpm: well.rpm,
      swlFt: well.swlFt,
      pwlFt: well.pwlFt,
      tdsPpm: well.tdsPpm,
      h2sPpm: well.h2sPpm,
    });
  }

  protected addFormationTopRow(): void {
    this.commitNewRows<WwellIrRawFormationTop>(this.formationTopAdd, this.formationTopsSection, {
      existingKeys: this.formationTopsRows().map(row => topKey(row)),
      keyOf: topKey,
      liveArray: () => {
        this.formationTopsEdit.open({ silent: true });
        return this.formationTopsEdit.control();
      },
      duplicate: key => `Formation ${key} already has a horizon — edit that row instead.`,
      added: count => `${count} formation top${count === 1 ? '' : 's'} added — click Save to apply.`,
    });
  }

  protected addCasingRow(): void {
    this.commitNewRows<WwellIrRawCasingRow>(this.casingAdd, this.casingSection, {
      existingKeys: this.casingRows().map(row => casingKey(row)),
      keyOf: casingKey,
      liveArray: () => {
        this.casingEdit.open({ silent: true });
        return this.casingEdit.control();
      },
      duplicate: key => `Casing ${key} already exists — edit that row instead.`,
      added: count => `${count} casing row${count === 1 ? '' : 's'} added — click Save to apply.`,
    });
  }

  protected addOffsetWellRow(): void {
    this.commitNewRows<WwellIrRawOffsetWell>(this.offsetWellAdd, this.offsetWellsEditSection, {
      existingKeys: this.offsetWellsRows().map(row => waterKey(row.epANum ?? 0)),
      keyOf: row => waterKey(row.epANum ?? 0),
      liveArray: () => {
        this.offsetWellsEdit.open({ silent: true });
        const ctrl = this.offsetWellsEdit.control();
        return ctrl;
      },
      duplicate: key => `Area well ${key} already exists — edit that row instead.`,
      added: count => `${count} offset well${count === 1 ? '' : 's'} added — click Save to apply.`,
    });
  }

  /** Commits every row staged in a "+" add-form's own FormArray into the section's live FormArray — the
   *  same array inline edits and deletes write to, so Save diffs it like any other change. All-or-nothing:
   *  Save matches rows on their natural key, so if ANY staged row's key is already taken (by an existing
   *  row, or by another row in the same batch) the whole commit is refused rather than silently overwriting
   *  that row, or committing some rows and leaving the colliding one stranded in the add-form. */
  private commitNewRows<TRow>(
    add: SectionEditState<FormArray>,
    section: WwellFormSectionConfig,
    commit: {
      readonly existingKeys: readonly string[];
      readonly keyOf: (row: TRow) => string;
      readonly liveArray: () => FormArray | null;
      readonly duplicate: (key: string) => string;
      readonly added: (count: number) => string;
    },
  ): void {
    const form = add.control();
    if (!form || form.invalid || form.length === 0) return;

    const rows = form.getRawValue() as TRow[];
    const keys = new Set(commit.existingKeys);
    for (const row of rows) {
      const key = commit.keyOf(row);
      if (keys.has(key)) {
        this.notify.warn(commit.duplicate(key));
        return;
      }
      keys.add(key);
    }

    const array = commit.liveArray();
    if (!array) return;
    rows.forEach(row => {
      addRepeatableRow(array, section.repeatable?.rowFields ?? [], this.fb);
      array.at(array.length - 1).patchValue(row as object);
    });
    add.close();
    this.notify.info(commit.added(rows.length));
  }

  protected readonly attachmentSlots = WWELL_IR_ATTACHMENT_SLOTS;
  protected readonly acceptedAttachmentTypes = WWELL_IR_ATTACHMENT_ACCEPT;

  /** Every stored attachment in a slot — a slot holds any number of files, not just one. */
  protected attachmentsFor(slot: IrAttachmentSlot): readonly IrAttachment[] {
    return irAttachmentsFor(this.ir().attachments, slot);
  }

  protected pendingAttachmentsFor(slot: IrAttachmentSlot): readonly IrPendingAttachment[] {
    return this.store.pendingAttachments()[slot] ?? [];
  }

  /** Normalizes the model's `irSeq?: number | null` to a plain `number | null` for the template
   *  (which can't express an `== null` check under the eqeqeq lint rule). */
  protected editorIrSeq(): number | null {
    return this.ir().irSeq ?? null;
  }

  protected isPendingUploadBusy(id: string): boolean {
    return this.store.uploadingPendingIds().has(id);
  }

  protected isStoredAttachmentBusy(objectKey: string): boolean {
    return this.store.deletingAttachmentKeys().has(objectKey);
  }

  /** `null` while busy with no measurable byte progress yet (indeterminate bar) — see
   *  WwellIrStoreState.uploadProgressByPendingId's own doc comment. */
  protected uploadPercentFor(id: string): number | null {
    return this.store.uploadProgressByPendingId()[id] ?? null;
  }

  protected viewPendingAttachment(item: IrPendingAttachment, slot: IrAttachmentSlot): void {
    this.openViewer(item.file, this.slotLabel(slot));
  }

  protected viewStoredAttachment(attachment: IrAttachment, slot: IrAttachmentSlot): void {
    this.s3
      .download(attachment.objectKey, attachment.fileName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: file => this.openViewer(file, this.slotLabel(slot)),
        error: () => this.notify.error(`Failed to open ${attachment.fileName}.`),
      });
  }

  private slotLabel(slot: IrAttachmentSlot): string {
    return WWELL_IR_ATTACHMENT_SLOTS.find(entry => entry.slot === slot)?.label ?? 'Attachment';
  }

  private slotIcon(slot: IrAttachmentSlot): string {
    return WWELL_IR_ATTACHMENT_SLOTS.find(entry => entry.slot === slot)?.icon ?? 'attach_file';
  }

  private openViewer(file: File, label: string): void {
    this.dialog.open(WwellIrAttachmentViewerComponent, {
      data: { file, label },
      panelClass: 'ir-viewer-panel',
      width: '92vw',
      maxWidth: '1500px',
      height: '92vh',
      autoFocus: false,
    });
  }

  protected attachmentSizeLabel(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  protected attachmentIcon(contentType: string): string {
    return contentType === 'application/pdf' ? 'picture_as_pdf' : 'image';
  }

  protected onAttachmentPicked(slot: IrAttachmentSlot, event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (input) input.value = '';
    if (!file) return;

    if (file.size > WWELL_IR_ATTACHMENT_MAX_BYTES) {
      this.notify.error('Attachment exceeds the 25 MB limit.');
      return;
    }

    const pendingId = this.store.addPendingAttachment(slot, file);
    // Straight into the upload dialog; dismissing it leaves the file staged on its row.
    this.dialog.open(WwellIrAttachmentUploadDialogComponent, {
      data: { store: this.store, slot, slotLabel: this.slotLabel(slot), slotIcon: this.slotIcon(slot), pendingId, irSeq: this.editorIrSeq() },
      panelClass: 'ir-upload-panel',
      autoFocus: false,
    });
  }

  /** Un-stages a file that was never sent — purely local, no backend call — but still behind a
   *  confirm dialog, same as every other delete action in this editor: a wrong click shouldn't
   *  silently drop a file the user just attached. */
  protected removePendingAttachment(slot: IrAttachmentSlot, item: IrPendingAttachment): void {
    this.confirmThenDelete(
      'Remove this attachment?',
      [
        { label: 'Section', value: this.slotLabel(slot) },
        { label: 'File', value: item.file.name },
      ],
      () => this.store.removePendingAttachment(slot, item.id),
    );
  }

  /**
   * Deletes an already-uploaded attachment from the server. Guarded the same way
   * `uploadPendingAttachment` is: the row's own `[disabled]` binding can lag a frame behind a rapid
   * repeated click, so `isStoredAttachmentBusy` is checked here too rather than trusted alone.
   */
  protected deleteStoredAttachment(attachment: IrAttachment): void {
    if (this.isStoredAttachmentBusy(attachment.objectKey)) return;
    const irSeq = this.ir().irSeq;
    if (irSeq == null) return;
    this.confirmThenDelete(
      'Delete this attachment?',
      [
        { label: 'Section', value: this.slotLabel(attachment.slot) },
        { label: 'File', value: attachment.fileName },
      ],
      () => this.store.deleteIrAttachment(irSeq, attachment.objectKey),
    );
  }

  @ViewChildren('sectionEl', { read: ElementRef }) private readonly sectionEls?: QueryList<ElementRef<HTMLElement>>;
  @ViewChild('body', { read: ElementRef }) private readonly bodyEl?: ElementRef<HTMLElement>;

  private previousIrId: string | null = null;

  private readonly hasUnsavedReferenceEdits = computed(() => {
    const ctrl = this.requestReferenceEdit.control();
    return ctrl !== null && this.requestReferenceEdit.liveValue() !== null && ctrl.dirty;
  });

  public readonly hasUnsavedChanges = computed(
    () =>
      this.hasUnsavedReferenceEdits() ||
      this.programEdit.isEditing() ||
      this.geologistContactEdit.isEditing() ||
      this.hydrogeologyEdit.isEditing() ||
      this.formationTopsEdit.isEditing() ||
      this.topsRemarksEdit.isEditing() ||
      this.casingEdit.isEditing() ||
      this.offsetWellsEdit.isEditing() ||
      this.offsetRemarksEdit.isEditing(),
  );

  /** True while the "Unsaved changes" prompt is up: every pending edit on the page is drawn in solid dark
   *  green (see the `ire-flag-unsaved` rules in the stylesheet) so the user can see exactly what Save or
   *  Discard would act on. Cleared on Stay, Save and Discard. */
  protected readonly flagUnsaved = signal(false);

  /** Edits that are open but not yet committed with their ✓ or "Add" — typed into a "+" add-form's rows.
   *  `hasUnsavedChanges` deliberately excludes these (Save never commits them), but leaving would drop them. */
  private readonly hasStagedRows = computed(
    () => this.formationTopAdd.isEditing() || this.casingAdd.isEditing() || this.offsetWellAdd.isEditing(),
  );

  /** What the leave-guard asks about: saveable section edits plus rows still staged in an add-form. */
  public readonly hasPendingEdits = computed(() => this.hasUnsavedChanges() || this.hasStagedRows());

  public showUnsavedHighlight(): void {
    this.flagUnsaved.set(true);
    setTimeout(() =>
      this.host.nativeElement
        .querySelector('.dyf--modified, .ire__cell--changed')
        ?.scrollIntoView({ block: 'center', behavior: 'smooth' }),
    );
  }

  public clearUnsavedHighlight(): void {
    this.flagUnsaved.set(false);
  }

  private saveSettledResolvers: ((succeeded: boolean) => void)[] = [];
  private wasSavingForNavigation = false;

  constructor() {
    this.bindOffsetWellPicker(() => this.offsetWellAdd.control());
    this.bindOffsetWellPicker(() => this.offsetWellsEdit.control());
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

    effect(() => {
      const id = this.ir().id;
      if (this.previousIrId !== null && id !== this.previousIrId) this.closeAllSections();
      this.previousIrId = id;
    });

    effect(() => {
      if (this.ir().irSeq != null) return;
      untracked(() => this.requestReferenceEdit.open());
    });

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

  public discardUnsavedChanges(): void {
    this.closeAllSections();
  }

  public saveUnsavedChangesAndWait(): Promise<boolean> {
    return new Promise(resolve => {
      if (this.store.creatingIr()) {
        this.saveSettledResolvers.push(resolve);
        return;
      }
      if (this.saveAll()) {
        this.saveSettledResolvers.push(resolve);
      } else {
        resolve(false);
      }
    });
  }

  ngAfterViewInit(): void {
    if (this.bodyEl && this.sectionEls) this.rail.attach(this.bodyEl, this.sectionEls);
  }

  protected leafIndex(leafKey: string): number {
    return this.railLeaves.findIndex(leaf => leaf.key === leafKey);
  }

  protected scrollToLeaf(leafKey: string): void {
    this.rail.scrollToIndex(this.leafIndex(leafKey));
  }

  protected scrollToGroupStart(group: WwellIrRailGroup): void {
    const key = group.leaf?.key ?? group.children?.[0]?.key;
    if (key) this.scrollToLeaf(key);
  }

  protected isLeafActive(leafKey: string): boolean {
    return this.rail.activeIndex() === this.leafIndex(leafKey);
  }

  protected subSeaFt(depthFt: number | null): number | null {
    const elevation = this.ir().requestReference.surfaceElevationFtAsl;
    // Elevation is a decimal, so the raw subtraction carries binary-float noise (108.10000000000002).
    return elevation === null || depthFt === null ? null : Math.round((elevation - depthFt) * 10) / 10;
  }

  private applyLinkedRequestWell(referenceGroup: FormGroup, linkedRequestId: string): void {
    console.log('[IR:link] applyLinkedRequestWell — start', { linkedRequestId, eligibleWellsLoaded: this.store.linkedRequestWells().length });
    const well = findLinkedWell(linkedRequestId, this.store.linkedRequestWells());
    if (!well) {
      console.log('[IR:link] applyLinkedRequestWell — no matching eligible well, aborting patch', { linkedRequestId });
      return;
    }

    const hasElevation = linkedWellHasElevation(well);
    const hasCoordinates = linkedWellHasCoordinates(well);
    const hasTargetDepth = linkedWellHasTargetDepth(well);
    const hasTargetAquifer = linkedWellHasTargetAquifer(well);
    const hasSupportingBusiness = linkedWellHasSupportingBusiness(well);

    const patch: Record<string, string | number> = { wellName: well.wellName };
    if (hasElevation) patch['surfaceElevationFtAsl'] = well.surfaceElevation as number;
    patch['coordinates'] = hasCoordinates ? formatLinkedWellCoordinates(well) : '';
    if (hasTargetDepth) patch['targetDepthFt'] = well.targetDepth as number;
    patch['targetAquifer'] = hasTargetAquifer ? (well.targetAquifer as string) : '';
    patch['supportingBusiness'] = hasSupportingBusiness ? (well.supportings as string) : '';
    console.log('[IR:link] applyLinkedRequestWell — patching form group', {
      patch,
      hasElevation,
      hasCoordinates,
      hasTargetDepth,
      hasTargetAquifer,
      hasSupportingBusiness,
    });
    referenceGroup.patchValue(patch);

    referenceGroup.get('wellName')?.disable();
    this.setLinkedFieldLock(referenceGroup, 'surfaceElevationFtAsl', hasElevation);
    console.log('[IR:link] applyLinkedRequestWell — done', { rawValue: referenceGroup.getRawValue() });
  }

  private setLinkedFieldLock(group: FormGroup, key: string, locked: boolean): void {
    const control = group.get(key);
    if (!control) return;
    console.log('[IR:link] setLinkedFieldLock', { key, locked });
    if (locked) control.disable();
    else control.enable();
  }

  protected deleteCasingRow(index: number): void {
    const row = this.casingRows()[index];
    if (!row) return;
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
    const row = this.formationTopsRows()[index];
    if (!row) return;
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
    const row = this.offsetWellsRows()[index];
    if (!row) return;
    this.confirmThenDelete('Delete offset well?', [
      { label: 'Well Name', value: row.wellName || String(row.epANum) },
      { label: 'Aquifer', value: row.aquifer || '—' },
    ], () => {
      this.offsetWellsEdit.open({ silent: true });
      const ctrl = this.offsetWellsEdit.control();
      if (ctrl) ctrl.removeAt(index);
      this.notify.info('Offset well removed — click Save to apply.');
    });
  }

  /** Which section's delete icon was pressed, while that delete (a real save) is in flight — so the spinner shows on that
   *  icon alone, not on every delete icon whenever the footer's Save runs. */
  private readonly deletingSection = signal<'program' | 'geologist' | null>(null);
  protected readonly isProgramDeleting = computed(() => this.deletingSection() === 'program' && this.isSaving());
  protected readonly isGeologistDeleting = computed(() => this.deletingSection() === 'geologist' && this.isSaving());

  protected resetProgramSection(): void {
    this.confirmThenAct({ title: 'Delete Program Details?', confirmLabel: 'Delete' }, () =>
      this.resetFlatSection(this.programEdit, this.programSection, 'Program Details', 'program', true),
    );
  }

  protected resetGeologistSection(): void {
    this.confirmThenAct({ title: 'Delete Geologist Contact?', confirmLabel: 'Delete' }, () =>
      this.resetFlatSection(this.geologistContactEdit, this.geologistSection, 'Geologist Contact', 'geologist'),
    );
  }

  /** `blank` empties every field outright — including those with a schema default (Liner Screen Size) —
   *  instead of restoring that default. Program Details uses it so the whole General step's program
   *  data is deleted; Geologist Contact is a separate section and is never touched by that reset. */
  private resetFlatSection(
    edit: SectionEditState<FormGroup, unknown>,
    section: WwellFormSectionConfig,
    label: string,
    key: 'program' | 'geologist',
    blank = false,
  ): void {
    edit.open();
    const ctrl = edit.control();
    if (!ctrl) return;
    const defaults: Record<string, unknown> = {};
    (section.fields ?? []).forEach(field => {
      defaults[field.key] = blank ? blankValueFor(field) : defaultValueFor(field);
    });
    ctrl.patchValue(defaults);
    // A saved record is deleted for real, right now (the button is a delete icon, not a draft edit). A
    // never-saved draft has nothing stored to delete, so there the form is just emptied.
    if (this.hasSavedIrSeq()) {
      this.deletingSection.set(key);
      // A save that does not start (nothing to save, a validation stop) never raises `isSaving`, so the marker is dropped here.
      if (!this.saveAll()) this.deletingSection.set(null);
      return;
    }
    this.notify.info(`${label} cleared.`);
  }

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

  private currentRawFormValue(): WwellIrFormRawValue {
    return mapIntegratedRequirementToRawFormValue(this.ir());
  }

  private saveMergedRaw(raw: WwellIrFormRawValue): void {
    const current = this.ir();
    const status: Extract<IntegratedRequirementStatus, 'draft' | 'in-progress'> =
      current.status === 'draft' || current.status === 'in-progress' ? current.status : 'in-progress';
    const { payload } = mapIrFormValueToSubmission(raw, status);
    const irBulkPayload = buildWwellIrBulkSavePayload(raw, {
      irSeq: current.irSeq ?? null,
      existing: current,
      geologistEmpNumByName: this.store.geologistEmpNumByName(),
    });
    this.store.createIr(payload, irBulkPayload);
  }

  /** Returns whether a save was actually kicked off — `false` on every early-return branch below
   *  (nothing to save, or a blocked validation). `saveUnsavedChangesAndWait` needs this to settle
   *  its own promise immediately in those cases instead of waiting forever for a `creatingIr`
   *  transition that will now never happen. */
  protected saveAll(): boolean {
    // A record whose stored remarks still carry legacy HTML is saved even with nothing edited — the form already
    // holds the cleaned text, and saving is what writes it back.
    if (this.ir().irSeq !== null && !this.hasUnsavedChanges() && !this.ir().hasLegacyMarkup) {
      this.notify.info('No changes to save.');
      return false;
    }

    let raw = this.currentRawFormValue();

    const referenceCtrl = this.requestReferenceEdit.control();
    if (referenceCtrl) raw = { ...raw, reference: { main: referenceCtrl.getRawValue() } };

    // `letterNumber` carries a `Validators.required` in the schema (wwell-ir-form.schema.ts), but
    // nothing elsewhere in this method ever checks form validity before saving — it only gathers
    // raw values. Without this explicit gate, a blank Letter Number saved silently; the asterisk
    // and mat-error only ever showed once the field itself had been touched.
    if (!raw.reference.main.letterNumber?.trim()) {
      this.requestReferenceEdit.open();
      this.requestReferenceEdit.control()?.get('letterNumber')?.markAsTouched();
      this.notify.error('Letter Number is required before saving.');
      return false;
    }

    const programCtrl = this.programEdit.control();
    if (programCtrl) {
      const flat = programCtrl.getRawValue() as WwellIrRawProgramDetails;
      raw = {
        ...raw,
        programDetails: {
          main: {
            completionType: flat.completionType,
            completion: flat.completion,
            openHoleSizeIn: flat.openHoleSizeIn,
            linerSizeIn: flat.linerSizeIn,
            linerDepthFt: flat.linerDepthFt,
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
    if (offsetWellsCtrl) raw = { ...raw, contacts: { ...raw.contacts, offsetWells: offsetWellsCtrl.getRawValue() } };

    const offsetRemarksCtrl = this.offsetRemarksEdit.control();
    if (offsetRemarksCtrl) raw = { ...raw, contacts: { ...raw.contacts, remarks: offsetRemarksCtrl.getRawValue() } };

    this.saveMergedRaw(raw);
    this.closeAllSections();
    return true;
  }

  private closeAllSections(): void {
    this.flagUnsaved.set(false);
    this.requestReferenceEdit.close();
    this.programEdit.close();
    this.geologistContactEdit.close();
    this.hydrogeologyEdit.close();
    this.formationTopsEdit.close();
    this.topsRemarksEdit.close();
    this.casingEdit.close();
    this.offsetWellsEdit.close();
    this.offsetRemarksEdit.close();
    this.formationTopAdd.close();
    this.casingAdd.close();
    this.offsetWellAdd.close();
  }

  protected submitForReview(): void {
    // The submitted letter/payload is built from the saved record, so unsaved edits would be silently
    // left out — the button is disabled in that state; this guards any other entry point.
    if (this.hasPendingEdits()) return;
    this.store.submitIrForReview(this.ir());
  }

  /** Recalling stops a live SAP workflow — uses the same "confirm, then act" pattern as the other
   *  row-delete actions above, since it's not reversible from here (SAP itself would need a fresh
   *  Submit for Review). */
  protected recallIr(): void {
    const ir = this.ir();
    this.confirmThenAct(
      {
        title: 'Recall this Integrated Requirement?',
        rows: [
          { label: 'IR', value: ir.code },
          { label: 'Well', value: ir.requestReference.wellName || 'Untitled Well' },
        ],
        confirmLabel: 'Recall',
      },
      () => this.store.recallIr(ir),
    );
  }
}
