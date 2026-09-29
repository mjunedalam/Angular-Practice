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
  signal,
  untracked,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { IntegratedRequirement, IntegratedRequirementStatus } from '@models/wwell-planning/integrated-requirement.model';
import { IrAttachment, IrAttachmentSlot } from '@models/wwell-planning/ir-attachment.model';
import { MatDialog } from '@angular/material/dialog';
import { ActionConfirmDialogService } from '@shared/components/action-confirm-dialog/action-confirm-dialog.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { WwellIrAttachmentViewerComponent } from '../wwell-ir-attachment-viewer/wwell-ir-attachment-viewer.component';
import { WwellCollapseAnimateDirective } from '../../shared/wwell-collapse-animate/wwell-collapse-animate.directive';
import { DynamicFieldComponent } from '../../shared/dynamic-form/dynamic-field/dynamic-field.component';
import { DynamicSectionComponent } from '../../shared/dynamic-form/dynamic-section/dynamic-section.component';
import { addRepeatableRow, buildSectionGroup, defaultValueFor } from '../../shared/dynamic-form/wwell-dynamic-form.builder';
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
  irAttachmentFor,
} from '../wwell-ir-attachments.config';
import { WwellIrService } from '../wwell-ir.service';
import { WWELL_IR_STATUS_META, WWELL_IR_SUBMITTABLE_STATUSES, hasKnownIrStatus } from '../wwell-ir.config';
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

/** A repeatable section's row fields as one flat form — what the section's "+" button opens. `requiredKeys`
 *  are the fields Save identifies a row by (see the payload mapper's row keys), so a row can't be added without them. */
function singleRowSection(section: WwellFormSectionConfig, requiredKeys: readonly string[]): WwellFormSectionConfig {
  const rowFields = section.repeatable?.rowFields ?? [];
  return {
    key: `${section.key}NewRow`,
    title: null,
    fields: rowFields.map(field =>
      requiredKeys.includes(field.key) ? { ...field, validators: { ...field.validators, required: true } } : field,
    ),
  };
}

@Component({
  selector: 'app-wwell-ir-editor',
  standalone: true,
  imports: [
    NgTemplateOutlet,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    DynamicFieldComponent,
    DynamicSectionComponent,
    WwellIrWellborePanelComponent,
    WwellIrKvValueComponent,
    WwellCollapseAnimateDirective,
  ],
  templateUrl: './wwell-ir-editor.component.html',
  styleUrl: './wwell-ir-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class WwellIrEditorComponent implements AfterViewInit {
  readonly ir = input.required<IntegratedRequirement>();

  private readonly fb = inject(FormBuilder);
  protected readonly store = inject(WwellIrStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly confirmDialog = inject(ActionConfirmDialogService);
  private readonly notify = inject(NotificationService);
  private readonly wwellIrService = inject(WwellIrService);
  private readonly dialog = inject(MatDialog);

  protected readonly statusMeta = WWELL_IR_STATUS_META;
  protected readonly hasKnownStatus = hasKnownIrStatus;
  protected readonly isSaving = this.store.creatingIr;
  protected readonly isDeleting = this.store.deletingIr;
  protected readonly isSubmittingForReview = this.store.updatingIrStatus;
  protected readonly anyFooterActionPending = computed(
    () => this.isSaving() || this.isDeleting() || this.isSubmittingForReview(),
  );
  protected readonly hasSavedIrSeq = computed(() => this.ir().irSeq !== null && this.ir().irSeq !== undefined);
  protected readonly selectPanelClass = SELECT_PANEL_CLASS;
  protected readonly canSubmitForReview = computed(
    () => WWELL_IR_SUBMITTABLE_STATUSES.includes(this.ir().status) && this.ir().sapWfId == null,
  );

  protected refreshApprovalStatus(): void {
    const ir = this.ir();
    if (ir.irSeq == null || ir.sapWfId == null) return;
    this.store.refreshIrApprovalStatus(ir.irSeq, ir.sapWfId);
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

  private readonly schema = buildWwellIrFormSchema(this.store.linkedRequestWellOptions, this.store.geologistOptions);
  protected readonly referenceMainSection = findSection(this.schema, 'reference', 'main');
  protected readonly programSection = findSection(this.schema, 'programDetails', 'main');
  protected readonly geologistSection = findSection(this.schema, 'contacts', 'geologist');
  protected readonly formationTopsSection = findSection(this.schema, 'subsurface', 'formationTops');
  protected readonly topsRemarksSection = findSection(this.schema, 'subsurface', 'remarks');
  protected readonly casingSection = findSection(this.schema, 'subsurface', 'casing');
  protected readonly hydrogeologySection = findSection(this.schema, 'hydrogeology', 'main');
  protected readonly offsetWellsSection = findSection(this.schema, 'contacts', 'offsetWells');
  protected readonly offsetRemarksSection = findSection(this.schema, 'contacts', 'remarks');
  protected readonly formationTopAddSection = singleRowSection(this.formationTopsSection, ['name', 'depthFt']);
  protected readonly casingAddSection = singleRowSection(this.casingSection, ['type', 'sizeIn', 'depthFtBgl']);
  protected readonly offsetWellAddSection = singleRowSection(this.offsetWellsSection, ['epANum', 'aquifer']);

  protected readonly requestReferenceRows = computed(() =>
    buildRequestReferenceRows(this.ir(), this.store.linkedRequestWellOptions()),
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
      completion: live.completion,
      openHoleSizeIn: live.openHoleSizeIn,
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

  /** The "+" buttons' one-row forms. Their control is a standalone group — a row only reaches the section's live
   *  FormArray (the one Save diffs) once "Add" commits it — so opening one never flips the section into its edit form. */
  protected readonly formationTopAdd = new SectionEditState<FormGroup, WwellIrRawFormationTop>(
    () => buildSectionGroup(this.formationTopAddSection, this.fb) as FormGroup,
  );
  protected readonly casingAdd = new SectionEditState<FormGroup, WwellIrRawCasingRow>(
    () => buildSectionGroup(this.casingAddSection, this.fb) as FormGroup,
  );
  protected readonly offsetWellAdd = new SectionEditState<FormGroup>(
    () => buildSectionGroup(this.offsetWellAddSection, this.fb) as FormGroup,
  );

  protected readonly formationTopsRows = computed(() => this.formationTopsEdit.liveValue() ?? this.ir().formationTops);
  protected readonly casingRows = computed(() => this.casingEdit.liveValue() ?? this.ir().casing);
  protected readonly offsetWellsRows = computed(() => this.offsetWellsEdit.liveValue()?.offsetWells ?? this.ir().offsetWells);

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
    draft: TRow | null,
    keyOf: (row: TRow) => string,
  ): readonly TRow[] | null {
    if (!draft) return live;
    const rows = live ?? saved();
    // "Add" refuses a row whose natural key is taken (it would overwrite that row), so it is not drawn either.
    return rows.some(row => keyOf(row) === keyOf(draft)) ? live : [...rows, draft];
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

  protected addFormationTopRow(): void {
    this.commitNewRow<WwellIrRawFormationTop>(this.formationTopAdd, this.formationTopsSection, {
      existingKeys: this.formationTopsRows().map(row => topKey(row)),
      keyOf: topKey,
      liveArray: () => {
        this.formationTopsEdit.open({ silent: true });
        return this.formationTopsEdit.control();
      },
      duplicate: key => `Formation ${key} already has a horizon — edit that row instead.`,
      added: 'Formation top added — click Save to apply.',
    });
  }

  protected addCasingRow(): void {
    this.commitNewRow<WwellIrRawCasingRow>(this.casingAdd, this.casingSection, {
      existingKeys: this.casingRows().map(row => casingKey(row)),
      keyOf: casingKey,
      liveArray: () => {
        this.casingEdit.open({ silent: true });
        return this.casingEdit.control();
      },
      duplicate: key => `Casing ${key} already exists — edit that row instead.`,
      added: 'Casing row added — click Save to apply.',
    });
  }

  protected addOffsetWellRow(): void {
    this.commitNewRow<WwellIrRawOffsetWell>(this.offsetWellAdd, this.offsetWellsSection, {
      existingKeys: this.offsetWellsRows().map(row => waterKey(row.epANum ?? 0)),
      keyOf: row => waterKey(row.epANum ?? 0),
      liveArray: () => {
        this.offsetWellsEdit.open({ silent: true });
        const ctrl = this.offsetWellsEdit.control();
        return ctrl ? this.offsetWellsArrayControl(ctrl) : null;
      },
      duplicate: key => `Area well ${key} already exists — edit that row instead.`,
      added: 'Offset well added — click Save to apply.',
    });
  }

  /** Commits a "+" form's row into the section's live FormArray — the same array inline edits and deletes write to,
   *  so Save diffs it like any other change. Save matches rows on their natural key, so a row whose key is already
   *  taken is refused: it would silently overwrite that row instead of being added. */
  private commitNewRow<TRow>(
    add: SectionEditState<FormGroup>,
    section: WwellFormSectionConfig,
    commit: {
      readonly existingKeys: readonly string[];
      readonly keyOf: (row: TRow) => string;
      readonly liveArray: () => FormArray | null;
      readonly duplicate: (key: string) => string;
      readonly added: string;
    },
  ): void {
    const form = add.control();
    if (!form || form.invalid) return;

    const row = form.getRawValue() as TRow;
    const key = commit.keyOf(row);
    if (commit.existingKeys.includes(key)) {
      this.notify.warn(commit.duplicate(key));
      return;
    }

    const array = commit.liveArray();
    if (!array) return;
    addRepeatableRow(array, section.repeatable?.rowFields ?? [], this.fb);
    array.at(array.length - 1).patchValue(row as object);
    add.close();
    this.notify.info(commit.added);
  }

  protected readonly attachmentSlots = WWELL_IR_ATTACHMENT_SLOTS;
  protected readonly acceptedAttachmentTypes = WWELL_IR_ATTACHMENT_ACCEPT;

  protected attachmentFor(slot: IrAttachmentSlot): IrAttachment | null {
    return irAttachmentFor(this.ir().attachments, slot);
  }

  protected isAttachmentBusy(slot: IrAttachmentSlot): boolean {
    return this.store.busyAttachmentSlot() === slot;
  }

  protected attachmentUploadPercent(): number | null {
    return this.store.attachmentUploadPercent();
  }

  protected canAttach(): boolean {
    return this.ir().irSeq != null;
  }

  protected pendingAttachmentFor(slot: IrAttachmentSlot): File | null {
    return this.store.pendingAttachments()[slot] ?? null;
  }

  protected hasAttachment(slot: IrAttachmentSlot): boolean {
    return this.attachmentFor(slot) !== null || this.pendingAttachmentFor(slot) !== null;
  }

  protected viewAttachment(slot: IrAttachmentSlot): void {
    const config = WWELL_IR_ATTACHMENT_SLOTS.find(entry => entry.slot === slot);
    const label = config?.label ?? 'Attachment';

    const staged = this.pendingAttachmentFor(slot);
    if (staged) {
      this.openViewer(staged, label);
      return;
    }

    const attachment = this.attachmentFor(slot);
    const irSeq = this.ir().irSeq;
    if (!attachment || irSeq == null) return;

    this.wwellIrService
      .getIrAttachmentFile(irSeq, slot, attachment.fileName)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: file => this.openViewer(file, label),
        error: () => this.notify.error(`Failed to open ${attachment.fileName}.`),
      });
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

  protected uploadStagedAttachment(slot: IrAttachmentSlot): void {
    const irSeq = this.ir().irSeq;
    if (irSeq == null) {
      this.notify.info('Save the integrated requirement first — this uploads automatically on save.');
      return;
    }
    this.store.uploadStagedAttachment(irSeq, slot);
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

    this.store.setPendingAttachment(slot, file);
  }

  protected removeAttachment(slot: IrAttachmentSlot): void {
    if (this.pendingAttachmentFor(slot)) {
      this.store.removePendingAttachment(slot);
      return;
    }
    const irSeq = this.ir().irSeq;
    if (irSeq == null) return;
    this.store.deleteIrAttachment(irSeq, slot);
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
      this.offsetWellsEdit.isEditing(),
  );

  private saveSettledResolvers: ((succeeded: boolean) => void)[] = [];
  private wasSavingForNavigation = false;

  constructor() {
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
      this.saveSettledResolvers.push(resolve);
      if (!this.store.creatingIr()) this.saveAll();
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
    return elevation === null || depthFt === null ? null : elevation - depthFt;
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

  protected offsetWellsArrayControl(ctrl: FormGroup): FormArray {
    return ctrl.get('offsetWells') as FormArray;
  }

  protected offsetWellsRemarksControl(ctrl: FormGroup): FormGroup {
    return ctrl.get('remarks') as FormGroup;
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
      { label: 'EP A Num', value: String(row.epANum) },
      { label: 'Aquifer', value: row.aquifer || '—' },
    ], () => {
      this.offsetWellsEdit.open({ silent: true });
      const ctrl = this.offsetWellsEdit.control();
      if (ctrl) this.offsetWellsArrayControl(ctrl).removeAt(index);
      this.notify.info('Offset well removed — click Save to apply.');
    });
  }

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

  protected saveAll(): void {
    // A record whose stored remarks still carry legacy HTML is saved even with nothing edited — the form already
    // holds the cleaned text, and saving is what writes it back.
    if (this.ir().irSeq !== null && !this.hasUnsavedChanges() && !this.ir().hasLegacyMarkup) {
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

    this.saveMergedRaw(raw);
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
    this.formationTopAdd.close();
    this.casingAdd.close();
    this.offsetWellAdd.close();
  }

  protected submitForReview(): void {
    this.store.submitIrForReview(this.ir());
  }
}
