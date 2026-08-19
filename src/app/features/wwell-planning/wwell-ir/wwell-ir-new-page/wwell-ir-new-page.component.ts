import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  ElementRef,
  QueryList,
  Signal,
  ViewChildren,
  ViewEncapsulation,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatStepperModule } from '@angular/material/stepper';
import { NotificationService } from '@shared/components/notification/notification.service';
import { WellboreDiagramData } from '@models/well-design/wellbore-diagram.model';
import { IntegratedRequirement } from '@models/wwell-planning/wwell-planning.model';
import { WellBoreViewComponent } from '../../../presentation/well-bore-view/well-bore-view.component';
import { DynamicSectionComponent } from '../../shared/dynamic-form/dynamic-section/dynamic-section.component';
import { playIfMotionAllowed } from '../../shared/dynamic-form/gsap-motion.util';
import { buildReviewRevealTimeline } from '../../shared/dynamic-form/review-reveal.animation';
import { buildStepTransitionTimeline, WwellStepDirection } from '../../shared/dynamic-form/step-transition.animation';
import { addRepeatableRow, buildWwellDynamicForm } from '../../shared/dynamic-form/wwell-dynamic-form.builder';
import { WwellFieldConfig } from '../../shared/dynamic-form/wwell-dynamic-form.types';
import { WwellPlanningStore } from '../../store/wwell-planning.store';
import { WwellIrDepthScaleComponent } from '../wwell-ir-depth-scale/wwell-ir-depth-scale.component';
import { casingRowPatch, formationTopRowPatch, mapIntegratedRequirementToFormPatch, offsetWellRowPatch } from '../wwell-ir-form/wwell-ir-edit.mapper';
import { WWELL_IR_CHAIN_PREVIEW } from '../wwell-ir-form/wwell-ir-form.config';
import { WWELL_IR_STATUS_META } from '../wwell-ir.config';
import { mapIrFormValueToSubmission } from '../wwell-ir-form/wwell-ir-form.mapper';
import { buildWwellIrBulkSavePayload } from '../wwell-ir-form/wwell-ir-payload.mapper';
import { buildWwellIrFormSchema, WWELL_IR_FORM_SCHEMA } from '../wwell-ir-form/wwell-ir-form.schema';
import { WwellIrFormRawValue } from '../wwell-ir-form/wwell-ir-form.types';
import { CasingSizeWarning, findInvertedCasingSizeRows } from '../wwell-ir-form/wwell-ir-casing-warnings.util';
import { buildWellboreDiagramData, hasWellboreDiagramData } from '../wwell-ir-form/wwell-ir-wellbore-diagram.mapper';

const SELECT_PANEL_CLASS = 'nip-select-panel';

@Component({
  selector: 'app-wwell-ir-new-page',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatStepperModule,
    MatExpansionModule,
    CdkDrag,
    CdkDragHandle,
    DynamicSectionComponent,
    WellBoreViewComponent,
    WwellIrDepthScaleComponent,
  ],
  templateUrl: './wwell-ir-new-page.component.html',
  styleUrl: './wwell-ir-new-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Required for the scoped M3 theme (and the portaled select/autocomplete panel it targets) to
  // actually reach those elements — see wwell-ir-new-page.component.scss for the full rationale.
  encapsulation: ViewEncapsulation.None,
  providers: [
    // Default indicator logic shows a pencil (not a checkmark) for any completed-but-editable,
    // non-active step — and *every* step here is editable (we never set [editable]="false", since
    // that flag also gates CdkStepper's backward-navigation, which we still need). This "guideline"
    // mode instead shows: done (green check) whenever completed and not the active step, regardless
    // of editable — exactly what we want, without touching navigability.
    { provide: STEPPER_GLOBAL_OPTIONS, useValue: { displayDefaultIndicatorType: false } },
  ],
})
export class WwellIrNewPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(WwellPlanningStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notify = inject(NotificationService);

  // Live-wired to the store's linkedRequestWells Signal so both the edit-mode picker and its
  // review-step label lookup (see DynamicFieldComponent.reviewValue) show the same fetched wells —
  // see buildWwellIrFormSchema's doc comment for why this can't just live in the static schema.
  protected readonly schema = buildWwellIrFormSchema(this.store.linkedRequestWells);
  // Excludes 'attachments' (it renders the review UI itself, so it can't review itself) and
  // 'wellDesignView' (a pure visualization step with no fields to review).
  protected readonly reviewSteps = this.schema.filter(
    step => step.key !== 'attachments' && step.key !== 'wellDesignView',
  );
  protected readonly chainPreview = WWELL_IR_CHAIN_PREVIEW;
  protected readonly selectPanelClass = SELECT_PANEL_CLASS;

  // Bound from the :irSeq route param (see app.routes.ts's 'edit/:irSeq' route) via
  // withComponentInputBinding() — undefined on the plain 'new' route. Property name must match
  // the route param name exactly (aliasing isn't allowed by this project's lint rules).
  readonly irSeq = input<string | undefined>(undefined);

  protected readonly editIrSeq = computed<number | null>(() => {
    const raw = this.irSeq();
    if (raw == null) return null;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  });
  protected readonly isEditMode = computed(() => this.editIrSeq() !== null);

  // The record being edited. Only ever populated from the store's already-loaded list — reaching
  // this page happens via the "Edit" button on an already-selected (and therefore already
  // detail-fetched) list row, so no separate detail fetch is triggered here. A direct deep link
  // into the edit URL that skips that flow will show an empty form rather than crash.
  protected readonly editingIr = computed<IntegratedRequirement | null>(() => {
    const irSeq = this.editIrSeq();
    if (irSeq === null) return null;
    return this.store.integratedRequirements().find(ir => ir.irSeq === irSeq) ?? null;
  });

  // Keyed on `draftIrSeq` (not `editIrSeq`) so this also lights up for a brand-new IR that was
  // just "Save as Draft"-ed on the *plain* 'new' route, where the route never changes to
  // 'edit/:irSeq' — the wizard just stays put per the "stay on same screen" draft-save behavior.
  protected readonly isDraftMode = computed(() => {
    const irSeq = this.store.draftIrSeq();
    if (irSeq === null) return false;
    return this.store.integratedRequirements().find(ir => ir.irSeq === irSeq)?.status === 'draft';
  });
  protected readonly draftBadge = WWELL_IR_STATUS_META.draft;

  protected readonly form = buildWwellDynamicForm(WWELL_IR_FORM_SCHEMA, this.fb);
  protected readonly isSaving = this.store.creatingIntegratedRequirement;

  // Live-mirrors the form so every well-bore preview (Subsurface & Construction, Attachments &
  // Review, and the dedicated Well Design View step) redraws as casing/formation/completion
  // data changes anywhere earlier in the wizard.
  private readonly rawFormValue: Signal<WwellIrFormRawValue> = toSignal(this.form.valueChanges, {
    initialValue: this.form.getRawValue() as WwellIrFormRawValue,
  });

  protected readonly activeStepIndex = signal(0);

  // Position-based fill for the custom step rail (see wwell-ir-new-page.component.scss's
  // `.nip__rail`) — width is a percentage of the *whole* track div, but the track itself is
  // inset by half a step's flex-width on each side (so it starts/ends at the first/last
  // chip's center, not the track container's edge). Dividing by `schema.length` rather than
  // `schema.length - 1` bakes that inset directly into the percentage: for n evenly-flexed
  // steps the chip centers sit at (i + 0.5) / n, and the track's own left inset is 0.5 / n,
  // so distance-from-left-inset-to-chip-i's-center reduces exactly to i / n.
  protected readonly railProgressPercent = computed(
    () => (this.activeStepIndex() / this.schema.length) * 100,
  );

  /*
   * Feeds every `app-well-bore-view` instance in this wizard — same real diagram
   * everywhere, just adapted from the raw form value into the richer WellboreDiagramData
   * shape.
   *
   * `well-bore-view`'s own redraw effect never reads its `animTrigger` input (confirmed by
   * reading well-bore-view.component.ts — only `diagramData`/`diagramLayout`/`isFullscreen`
   * are tracked), so it only ever redraws when `diagramData` gets a NEW object reference.
   * Angular Material's horizontal stepper renders every step's content upfront and keeps it
   * mounted (hidden inactive steps get `visibility: hidden` + an off-screen `transform`, not
   * `display: none`/destroyed) — so the very first redraw (with its clip-path "grow" reveal
   * transition, see casing.renderer.ts's `renderCasings`) runs while this step is still
   * hidden and transformed off-screen, and has already finished — collapsed — by the time
   * the user actually navigates here. Tracking `activeStepIndex` below forces a brand-new
   * `WellboreDiagramData` object (and therefore a fresh redraw + reveal animation) every time
   * the active step changes, so it's guaranteed to run once while genuinely visible. This is
   * also a wwell-ir-local fix, per the standing rule not to modify anything under
   * `presentation/well-bore-view/`.
   */
  protected readonly wellboreDiagramData: Signal<WellboreDiagramData> = computed(() => {
    this.activeStepIndex();
    return buildWellboreDiagramData(this.rawFormValue());
  });

  // Gates the diagram card's scale/ground-level/total-depth chrome, not just individual
  // casing/formation-top shapes — see `hasWellboreDiagramData`'s own doc comment.
  protected readonly hasWellboreData: Signal<boolean> = computed(() =>
    hasWellboreDiagramData(this.rawFormValue()),
  );

  // Surfaces cases where a deeper casing's entered size is larger than a shallower casing's —
  // see `findInvertedCasingSizeRows`'s doc comment for why the diagram can never draw that
  // combination correctly.
  protected readonly casingSizeWarnings: Signal<readonly CasingSizeWarning[]> = computed(() =>
    findInvertedCasingSizeRows(this.rawFormValue().subsurface.casing),
  );

  // `wellboreDiagramData().totalDepth` falls back to 0 when Target Depth (Request Reference,
  // a required field) hasn't been filled in yet — reachable via the stepper's free (non-linear)
  // navigation. `well-bore-view` always draws its "TOTAL DEPTH: 0 FT" label regardless (see the
  // standing rule against editing anything under `presentation/well-bore-view/`), so this instead
  // drives a page-local CSS hook (`.nip__wellbore-diagram-row--no-depth` in
  // wwell-ir-new-page.component.scss) that hides that one D3-rendered label group.
  protected readonly hasTargetDepth: Signal<boolean> = computed(
    () => (this.rawFormValue().reference.main.targetDepthFt ?? 0) > 0,
  );
  @ViewChildren('stepContent') private readonly stepContents?: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('reviewCard', { read: ElementRef }) private readonly reviewCards?: QueryList<ElementRef<HTMLElement>>;

  private previousStepIndex = 0;
  private wasSaving = false;
  private reviewRevealed = false;
  // Which submitAs() call is currently in flight, and whether it targeted an already-saved draft
  // (UPDATE) or a brand-new one (INSERT) — the success effect below reads both to decide the
  // notification wording and whether to stay on this page or exit the wizard.
  private lastSubmitStatus: 'draft' | 'in-progress' | null = null;
  private lastSubmitWasUpdate = false;
  private editFormPopulated = false;

  constructor() {
    effect(() => {
      const irSeq = this.editIrSeq();
      if (irSeq === null) {
        // A brand-new visit to this page must never inherit a previous draft's ir_seq.
        this.store.resetIntegratedRequirementDraft();
        return;
      }
      // Every Save/Submit for the rest of this visit must UPDATE this record, not INSERT a new one.
      this.store.startEditingIntegratedRequirement(irSeq);
    });

    effect(() => {
      if (this.editFormPopulated) return;
      const ir = this.editingIr();
      if (!ir) return;
      this.populateFormForEdit(ir);
      this.editFormPopulated = true;
    });

    effect(() => {
      const index = this.activeStepIndex();
      const host = this.stepContents?.get(index);
      if (!host) return;

      const direction: WwellStepDirection = index >= this.previousStepIndex ? 'forward' : 'backward';
      playIfMotionAllowed(buildStepTransitionTimeline(host.nativeElement, direction));
      this.previousStepIndex = index;
    });

    effect(() => {
      // Keyed on the 'attachments' step itself (not "last step") — Well Design View is now
      // appended after it, so the review UI is no longer on the final step.
      const isReviewStep = WWELL_IR_FORM_SCHEMA[this.activeStepIndex()]?.key === 'attachments';
      if (!isReviewStep || this.reviewRevealed) return;

      const cards = this.reviewCards?.map(card => card.nativeElement) ?? [];
      if (!cards.length) return;

      playIfMotionAllowed(buildReviewRevealTimeline(cards));
      this.reviewRevealed = true;
    });

    effect(() => {
      const saving = this.isSaving();
      const error = this.store.createIntegratedRequirementError();

      if (error) {
        this.notify.error(error);
      } else if (this.wasSaving && !saving) {
        this.onSaveSucceeded();
      }
      this.wasSaving = saving;
    });
  }

  ngOnInit(): void {
    this.store.loadLinkedRequestWells();
  }

  /**
   * A draft save notifies and stays on the wizard — drafts are a checkpoint for continued
   * editing, not a workflow exit, so navigating away would strand the author mid-form and force
   * them to reopen the record to keep going. A full Submit still notifies and exits, since that
   * completes the intake step.
   */
  private onSaveSucceeded(): void {
    // Look up by the ir_seq that was actually just saved — never assume index 0. That was only
    // ever true for a brand-new INSERT (upsertByIrSeq prepends those); an UPDATE to an existing
    // record replaces it *in place* at its original index, so index 0 can point at a totally
    // different (and possibly stale) record.
    const savedIrSeq = this.store.draftIrSeq();
    const code = this.store.integratedRequirements().find(ir => ir.irSeq === savedIrSeq)?.code;

    if (this.lastSubmitStatus === 'draft') {
      const verb = this.lastSubmitWasUpdate ? 'updated' : 'saved';
      this.notify.info(code ? `Draft ${verb} — ${code}.` : `Draft ${verb}.`);
      return;
    }

    this.notify.info(code ? `${code} submitted for review.` : 'Integrated requirement submitted for review.');
    this.navigateToList();
  }

  // 'edit/:irSeq' is one route config with a *compound* path, so its ActivatedRoute carries two
  // URL segments (['edit', irSeq]) on a single node. Angular's relative `['..']` pops only the
  // last URL segment of the current node, not "up to the parent route" — from here that lands on
  // '/main/integrated-requirements/edit' (matches no route, falls through to the '**' redirect to
  // login). Anchoring at `this.route.parent` instead sidesteps this regardless of how many URL
  // segments the current leaf route (this one, or the single-segment 'new') consumed.
  private navigateToList(): void {
    this.router.navigate(['.'], { relativeTo: this.route.parent });
  }

  protected stepGroup(stepKey: string): FormGroup {
    return this.form.get(stepKey) as FormGroup;
  }

  protected sectionControl(stepKey: string, sectionKey: string): FormGroup | FormArray {
    return this.stepGroup(stepKey).get(sectionKey) as FormGroup | FormArray;
  }

  /** Fills every simple field from the saved record, then grows+fills each repeatable section's
   *  FormArray to match. Attachments are left empty — a File object can't be reconstructed from
   *  just the saved attachment names, so re-attaching (if needed) is a manual step in edit mode. */
  private populateFormForEdit(ir: IntegratedRequirement): void {
    const patch = mapIntegratedRequirementToFormPatch(ir);
    this.stepGroup('reference').patchValue(patch.reference);
    this.stepGroup('programDetails').patchValue(patch.programDetails);
    this.stepGroup('contacts').patchValue({ geologist: patch.contacts.geologist, remarks: patch.contacts.remarks });
    this.stepGroup('hydrogeology').patchValue(patch.hydrogeology);

    this.populateRepeatableSection('subsurface', 'formationTops', ir.formationTops, formationTopRowPatch);
    this.populateRepeatableSection('subsurface', 'casing', ir.casing, casingRowPatch);
    this.populateRepeatableSection('contacts', 'offsetWells', ir.offsetWells, offsetWellRowPatch);
  }

  private populateRepeatableSection<TDomainRow>(
    stepKey: string,
    sectionKey: string,
    rows: readonly TDomainRow[],
    toRowPatch: (row: TDomainRow) => object,
  ): void {
    const array = this.sectionControl(stepKey, sectionKey) as FormArray;
    const rowFields = this.repeatableRowFields(stepKey, sectionKey);
    rows.forEach((row, index) => {
      if (index >= array.length) addRepeatableRow(array, rowFields, this.fb);
      array.at(index).patchValue(toRowPatch(row));
    });
  }

  private repeatableRowFields(stepKey: string, sectionKey: string): readonly WwellFieldConfig[] {
    const section = WWELL_IR_FORM_SCHEMA.find(step => step.key === stepKey)?.sections.find(s => s.key === sectionKey);
    return section?.repeatable?.rowFields ?? [];
  }

  protected isStepValid(stepKey: string): boolean {
    return this.stepGroup(stepKey).valid;
  }

  protected reviewCompletionSummary(): { done: number; total: number } {
    const total = this.reviewSteps.length;
    const done = this.reviewSteps.filter(step => this.isStepValid(step.key)).length;
    return { done, total };
  }

  protected onReviewCardOpened(index: number): void {
    this.reviewCards?.get(index)?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  protected onStepSelectionChange(index: number): void {
    this.activeStepIndex.set(index);
  }

  protected cancel(): void {
    this.navigateToList();
  }

  protected saveAsDraft(): void {
    this.submitAs('draft');
  }

  // TEMPORARY: validation gate disabled per explicit request — Submit saves whatever is filled
  // in across all steps, same as Save as Draft, instead of blocking on invalid/incomplete fields.
  protected submit(): void {
    this.submitAs('in-progress');
  }

  private submitAs(status: 'draft' | 'in-progress'): void {
    const raw = this.form.getRawValue() as WwellIrFormRawValue;
    const { payload, files } = mapIrFormValueToSubmission(raw, status);
    const knownIrSeq = this.store.draftIrSeq();
    // Reusing the remembered ir_seq turns a repeat "Save as Draft" into an UPDATE instead of a duplicate INSERT.
    const irBulkPayload = buildWwellIrBulkSavePayload(raw, { irSeq: knownIrSeq });
    this.lastSubmitStatus = status;
    this.lastSubmitWasUpdate = knownIrSeq !== null;
    this.store.createIntegratedRequirement(payload, irBulkPayload, files);
  }
}
