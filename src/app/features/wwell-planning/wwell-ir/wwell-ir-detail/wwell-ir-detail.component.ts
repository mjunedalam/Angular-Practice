import { ChangeDetectionStrategy, Component, OnInit, Signal, ViewEncapsulation, computed, inject, input, output, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { AgGridAngular } from 'ag-grid-angular';
import { WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { IntegratedRequirement, IntegratedRequirementStatus } from '@models/wwell-planning/integrated-requirement.model';
import { WellBoreViewComponent } from '../../../presentation/well-bore-view/well-bore-view.component';
import { DynamicSectionComponent } from '../../shared/dynamic-form/dynamic-section/dynamic-section.component';
import { WwellFormSectionConfig, WwellFormStepConfig } from '../../shared/dynamic-form/wwell-dynamic-form.types';
import { WwellApprovalMiniChainComponent } from '../../shared/wwell-approvals/wwell-approval-timeline/wwell-approval-mini-chain.component';
import { WwellApprovalTimelineComponent } from '../../shared/wwell-approvals/wwell-approval-timeline/wwell-approval-timeline.component';
import { WwellIrStore } from '../store/wwell-ir.store';
import { WwellIrDepthScaleComponent } from '../wwell-ir-depth-scale/wwell-ir-depth-scale.component';
import {
  casingRowPatch,
  formationTopRowPatch,
  mapIntegratedRequirementToFormPatch,
  mapIntegratedRequirementToRawFormValue,
  offsetWellRowPatch,
} from '../wwell-ir-form/wwell-ir-edit.mapper';
import { mapIrFormValueToSubmission } from '../wwell-ir-form/wwell-ir-form.mapper';
import { buildWwellIrFormSchema } from '../wwell-ir-form/wwell-ir-form.schema';
import { WwellIrFormRawValue } from '../wwell-ir-form/wwell-ir-form.types';
import { buildWwellIrBulkSavePayload } from '../wwell-ir-form/wwell-ir-payload.mapper';
import {
  buildWellboreDiagramDataFromIntegratedRequirement,
  hasWellboreDiagramDataForIntegratedRequirement,
} from '../wwell-ir-form/wwell-ir-wellbore-diagram.mapper';
import { WWELL_IR_STATUS_META } from '../wwell-ir.config';
import {
  buildGeologistContactRows,
  buildHydrogeologyRows,
  buildProgramDetailsRows,
  buildRequestReferenceRows,
} from './wwell-ir-detail-rows.util';
import {
  buildLetterDrillingProgramRows,
  buildLetterProductionTestingRows,
  buildLetterWellLocationRows,
  letterApprovedByName,
} from './wwell-ir-letter-rows.util';
import {
  wwellIrOffsetWellsColumnDefs,
  wwellIrOffsetWellsGridOptions,
  wwellIrOffsetWellsGridTheme,
} from './wwell-ir-offset-wells.config';
import { SectionEditState, buildAndPatchArray, buildAndPatchGroup } from './wwell-ir-section-edit.util';

const SUBMITTABLE_STATUSES: readonly IntegratedRequirement['status'][] = ['draft', 'in-progress'];

// Matches wwell-ir-new-page.component.ts's own SELECT_PANEL_CLASS — the app calls mat.core()
// globally with no full M3 color theme, so a mat-select's portaled panel (CDK renders it into
// <body>, outside this component's own DOM) resolves --mat-sys-surface-container to nothing and
// renders transparent. The matching .ird-select-panel block in wwell-ir-detail.component.scss
// re-establishes the theme tokens for that detached subtree; ViewEncapsulation.None below is what
// lets that selector reach the portaled pane at all (see the class's own encapsulation comment).
const SELECT_PANEL_CLASS = 'ird-select-panel';

function findSection(schema: readonly WwellFormStepConfig[], stepKey: string, sectionKey: string): WwellFormSectionConfig {
  const section = schema.find(step => step.key === stepKey)?.sections.find(s => s.key === sectionKey);
  if (!section) throw new Error(`Missing IR form section ${stepKey}.${sectionKey}`);
  return section;
}

@Component({
  selector: 'app-wwell-ir-detail',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    AgGridAngular,
    WellBoreViewComponent,
    WwellIrDepthScaleComponent,
    WwellApprovalTimelineComponent,
    WwellApprovalMiniChainComponent,
    DynamicSectionComponent,
  ],
  templateUrl: './wwell-ir-detail.component.html',
  styleUrl: './wwell-ir-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Needed so `.ird-select-panel` (see wwell-ir-detail.component.scss) can reach a mat-select's
  // portaled overlay panel — CDK renders it into <body>, outside this component's own view, and
  // Emulated encapsulation's per-component scoping attribute never reaches DOM created out there.
  // `:host` becomes a no-op under None (there's no shadow boundary left to scope it against) —
  // this component's `:host { ... }` rule is written against the `app-wwell-ir-detail` tag
  // selector instead; see that rule's own comment.
  encapsulation: ViewEncapsulation.None,
})
export class WwellIrDetailComponent implements OnInit {
  readonly ir = input.required<IntegratedRequirement>();
  readonly submitting = input(false);

  readonly submitForReview = output<IntegratedRequirement>();
  readonly edit = output<IntegratedRequirement>();

  protected readonly store = inject(WwellIrStore);
  private readonly fb = inject(FormBuilder);

  protected readonly statusMeta = WWELL_IR_STATUS_META;
  protected readonly canSubmitForReview = computed(() => SUBMITTABLE_STATUSES.includes(this.ir().status));
  // Inline section editing only makes sense while the IR still belongs to its author — same gate
  // as the Submit button. Once it's left draft/in-progress, edits belong in a real revision
  // workflow, not a quick inline tweak here.
  protected readonly canEditSections = computed(() => SUBMITTABLE_STATUSES.includes(this.ir().status));
  // WwellIrStore.createIr has one shared `creatingIr` flag for every caller — every section's
  // Save button disables together rather than tracking per-section in-flight state, since a
  // second save should never race the first against the same record anyway.
  protected readonly savingSection = this.store.creatingIr;
  protected readonly selectPanelClass = SELECT_PANEL_CLASS;

  protected readonly requestReferenceRows = computed(() => buildRequestReferenceRows(this.ir()));
  protected readonly programDetailsRows = computed(() => buildProgramDetailsRows(this.ir()));
  protected readonly hydrogeologyRows = computed(() => buildHydrogeologyRows(this.ir()));
  protected readonly geologistContactRows = computed(() => buildGeologistContactRows(this.ir()));

  protected readonly letterWellLocationRows = computed(() => buildLetterWellLocationRows(this.ir()));
  protected readonly letterDrillingProgramRows = computed(() => buildLetterDrillingProgramRows(this.ir()));
  protected readonly letterProductionTestingRows = computed(() => buildLetterProductionTestingRows(this.ir()));
  protected readonly letterApprovedBy = computed(() => letterApprovedByName(this.ir()));

  // Same live `app-well-bore-view` diagram the IR wizard's "Well Design View" step uses,
  // fed from this (already-submitted) IR instead of an in-progress form value — replaces the
  // lighter `wwell-ir-design-preview` sketch that used to sit here.
  protected readonly wellboreDiagramData: Signal<WellboreDiagramData> = computed(() =>
    buildWellboreDiagramDataFromIntegratedRequirement(this.ir()),
  );
  protected readonly hasWellboreData: Signal<boolean> = computed(() =>
    hasWellboreDiagramDataForIntegratedRequirement(this.ir()),
  );

  // AG Grid's `rowData` input wants a mutable array; `ir().offsetWells` is `readonly`.
  protected readonly offsetWellsRows = computed(() => [...this.ir().offsetWells]);

  protected readonly offsetWellsColumnDefs = wwellIrOffsetWellsColumnDefs;
  protected readonly offsetWellsGridOptions = wwellIrOffsetWellsGridOptions;
  protected readonly offsetWellsGridTheme = wwellIrOffsetWellsGridTheme;
  // AG Grid's own module init + first layout pass takes a tick after the component is created —
  // this mirrors the `mat-spinner` + label loading block used in `active-wwell-docs-viewer`
  // (presentation feature) rather than the shimmer-skeleton used on the master list, since a
  // spinner-over-content overlay is the closer match for a widget that's already-visible chrome
  // with in-flight content, not a whole page being fetched.
  protected readonly offsetWellsGridReady = signal(false);

  // Live-option copy of the wizard's schema (its `linkedRequestId` select needs the same
  // store-backed eligible-wells list the wizard uses) — see buildWwellIrFormSchema's own doc
  // comment. Built once; `loadLinkedRequestWells()` below keeps the underlying signal fresh.
  private readonly schema = buildWwellIrFormSchema(this.store.linkedRequestWells);

  protected readonly referenceMainSection = findSection(this.schema, 'reference', 'main');
  protected readonly programMainSection = findSection(this.schema, 'programDetails', 'main');
  protected readonly programDevSection = findSection(this.schema, 'programDetails', 'developmentTesting');
  protected readonly hydrogeologySection = findSection(this.schema, 'hydrogeology', 'main');
  // `title: null` on these four — this component already renders its own `.ird__doc-section-title`
  // heading for each, so the schema's own section title (rendered by `app-dynamic-section` itself)
  // would otherwise double up right above the form.
  protected readonly geologistSection: WwellFormSectionConfig = {
    ...findSection(this.schema, 'contacts', 'geologist'),
    title: null,
  };
  protected readonly offsetWellsSection: WwellFormSectionConfig = {
    ...findSection(this.schema, 'contacts', 'offsetWells'),
    title: null,
  };
  protected readonly offsetRemarksSection = findSection(this.schema, 'contacts', 'remarks');
  protected readonly formationTopsSection: WwellFormSectionConfig = {
    ...findSection(this.schema, 'subsurface', 'formationTops'),
    title: null,
  };
  protected readonly casingSection: WwellFormSectionConfig = {
    ...findSection(this.schema, 'subsurface', 'casing'),
    title: null,
  };

  protected readonly requestReferenceEdit = new SectionEditState(() =>
    buildAndPatchGroup(this.referenceMainSection, this.fb, mapIntegratedRequirementToFormPatch(this.ir()).reference.main),
  );

  protected readonly programDetailsEdit = new SectionEditState(() => {
    const patch = mapIntegratedRequirementToFormPatch(this.ir()).programDetails;
    return this.fb.group({
      main: buildAndPatchGroup(this.programMainSection, this.fb, patch.main),
      developmentTesting: buildAndPatchGroup(this.programDevSection, this.fb, patch.developmentTesting),
    });
  });

  protected readonly geologistContactEdit = new SectionEditState(() =>
    buildAndPatchGroup(this.geologistSection, this.fb, mapIntegratedRequirementToFormPatch(this.ir()).contacts.geologist),
  );

  protected readonly offsetWellsEdit = new SectionEditState(() => {
    const currentIr = this.ir();
    return this.fb.group({
      offsetWells: buildAndPatchArray(this.offsetWellsSection, this.fb, currentIr.offsetWells, offsetWellRowPatch),
      remarks: buildAndPatchGroup(this.offsetRemarksSection, this.fb, { offsetWellsRemarks: currentIr.offsetWellsRemarks ?? '' }),
    });
  });

  protected readonly hydrogeologyEdit = new SectionEditState(() =>
    buildAndPatchGroup(this.hydrogeologySection, this.fb, mapIntegratedRequirementToFormPatch(this.ir()).hydrogeology.main),
  );

  protected readonly formationTopsEdit = new SectionEditState(() =>
    buildAndPatchArray(this.formationTopsSection, this.fb, this.ir().formationTops, formationTopRowPatch),
  );

  protected readonly casingEdit = new SectionEditState(() =>
    buildAndPatchArray(this.casingSection, this.fb, this.ir().casing, casingRowPatch),
  );

  // Attachments has no schema-form counterpart worth reusing — the wizard's two named file slots
  // (locationMap/initiationRequest) don't round-trip against an already-saved flat
  // `attachmentNames` list any better than a bespoke editor would (see wwell-ir.service.ts's
  // buildIrFromPayload: a File can't be reconstructed from just a saved name either way), so this
  // is a plain add/remove-by-name editor instead of a SectionEditState/dynamic-section instance.
  protected readonly attachmentsEditing = signal(false);
  protected readonly attachmentsDraftNames = signal<readonly string[]>([]);
  protected readonly attachmentsNewFiles = signal<readonly File[]>([]);

  ngOnInit(): void {
    this.store.loadLinkedRequestWells();
  }

  protected subSeaFt(depthFt: number): number | null {
    const elevation = this.ir().requestReference.surfaceElevationFtAsl;
    return elevation === null ? null : elevation - depthFt;
  }

  protected onOffsetWellsGridReady(): void {
    this.offsetWellsGridReady.set(true);
  }

  private currentRawFormValue(): WwellIrFormRawValue {
    return mapIntegratedRequirementToRawFormValue(this.ir());
  }

  /** Shared save path for every section: re-derives the payload/bulk-save arrays from the
   *  *current* record with just one section's slice overlaid, so an in-flight edit on another
   *  still-open section is never read (it saves separately, whenever its own Save fires) and a
   *  section nobody touched this time round is resent unchanged (and diffed to a DML no-op by
   *  buildWwellIrBulkSavePayload's `existing` comparison) rather than dropped. */
  private saveMergedRaw(raw: WwellIrFormRawValue, attachmentNames?: readonly string[]): void {
    const current = this.ir();
    const status: Extract<IntegratedRequirementStatus, 'draft' | 'in-progress'> =
      current.status === 'draft' || current.status === 'in-progress' ? current.status : 'draft';
    const { payload } = mapIrFormValueToSubmission(raw, status);
    const irBulkPayload = buildWwellIrBulkSavePayload(raw, { irSeq: current.irSeq ?? null, existing: current });
    this.store.createIr(payload, irBulkPayload, attachmentNames ?? current.attachmentNames);
  }

  protected saveRequestReference(): void {
    const ctrl = this.requestReferenceEdit.control();
    if (!ctrl) return;
    const raw = this.currentRawFormValue();
    this.saveMergedRaw({ ...raw, reference: { main: ctrl.getRawValue() } });
    this.requestReferenceEdit.close();
  }

  protected programMainControl(ctrl: FormGroup): FormGroup {
    return ctrl.get('main') as FormGroup;
  }

  protected programDevControl(ctrl: FormGroup): FormGroup {
    return ctrl.get('developmentTesting') as FormGroup;
  }

  protected saveProgramDetails(): void {
    const ctrl = this.programDetailsEdit.control();
    if (!ctrl) return;
    const raw = this.currentRawFormValue();
    this.saveMergedRaw({
      ...raw,
      programDetails: {
        main: this.programMainControl(ctrl).getRawValue(),
        developmentTesting: this.programDevControl(ctrl).getRawValue(),
      },
    });
    this.programDetailsEdit.close();
  }

  protected saveGeologistContact(): void {
    const ctrl = this.geologistContactEdit.control();
    if (!ctrl) return;
    const raw = this.currentRawFormValue();
    this.saveMergedRaw({ ...raw, contacts: { ...raw.contacts, geologist: ctrl.getRawValue() } });
    this.geologistContactEdit.close();
  }

  protected offsetWellsArrayControl(ctrl: FormGroup): FormArray {
    return ctrl.get('offsetWells') as FormArray;
  }

  protected offsetWellsRemarksControl(ctrl: FormGroup): FormGroup {
    return ctrl.get('remarks') as FormGroup;
  }

  protected saveOffsetWells(): void {
    const ctrl = this.offsetWellsEdit.control();
    if (!ctrl) return;
    const raw = this.currentRawFormValue();
    this.saveMergedRaw({
      ...raw,
      contacts: {
        ...raw.contacts,
        offsetWells: this.offsetWellsArrayControl(ctrl).getRawValue(),
        remarks: this.offsetWellsRemarksControl(ctrl).getRawValue(),
      },
    });
    this.offsetWellsEdit.close();
  }

  protected saveHydrogeology(): void {
    const ctrl = this.hydrogeologyEdit.control();
    if (!ctrl) return;
    const raw = this.currentRawFormValue();
    this.saveMergedRaw({ ...raw, hydrogeology: { main: ctrl.getRawValue() } });
    this.hydrogeologyEdit.close();
  }

  protected saveFormationTops(): void {
    const ctrl = this.formationTopsEdit.control();
    if (!ctrl) return;
    const raw = this.currentRawFormValue();
    this.saveMergedRaw({ ...raw, subsurface: { ...raw.subsurface, formationTops: ctrl.getRawValue() } });
    this.formationTopsEdit.close();
  }

  protected saveCasing(): void {
    const ctrl = this.casingEdit.control();
    if (!ctrl) return;
    const raw = this.currentRawFormValue();
    this.saveMergedRaw({ ...raw, subsurface: { ...raw.subsurface, casing: ctrl.getRawValue() } });
    this.casingEdit.close();
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

  protected saveAttachments(): void {
    const finalNames = [...this.attachmentsDraftNames(), ...this.attachmentsNewFiles().map(file => file.name)];
    this.saveMergedRaw(this.currentRawFormValue(), finalNames);
    this.closeAttachmentsEdit();
  }
}
