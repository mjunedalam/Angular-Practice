import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
  ViewEncapsulation,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { DynamicSectionComponent } from '../../shared/dynamic-form/dynamic-section/dynamic-section.component';
import { playIfMotionAllowed } from '../../shared/dynamic-form/gsap-motion.util';
import { buildReviewRevealTimeline } from '../../shared/dynamic-form/review-reveal.animation';
import { buildStepTransitionTimeline, WwellStepDirection } from '../../shared/dynamic-form/step-transition.animation';
import { buildWwellDynamicForm } from '../../shared/dynamic-form/wwell-dynamic-form.builder';
import { WwellApprovalMiniChainComponent } from '../../shared/wwell-approvals/wwell-approval-timeline/wwell-approval-mini-chain.component';
import { WwellPlanningStore } from '../../store/wwell-planning.store';
import { WWELL_IR_CHAIN_PREVIEW } from '../wwell-ir-form/wwell-ir-form.config';
import { mapIrFormValueToSubmission } from '../wwell-ir-form/wwell-ir-form.mapper';
import { WWELL_IR_FORM_SCHEMA } from '../wwell-ir-form/wwell-ir-form.schema';
import { WwellIrFormRawValue } from '../wwell-ir-form/wwell-ir-form.types';

const SNACKBAR_DURATION_MS = 3000;
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
    DynamicSectionComponent,
    WwellApprovalMiniChainComponent,
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
export class WwellIrNewPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(WwellPlanningStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly schema = WWELL_IR_FORM_SCHEMA;
  protected readonly reviewSteps = WWELL_IR_FORM_SCHEMA.slice(0, -1);
  protected readonly chainPreview = WWELL_IR_CHAIN_PREVIEW;
  protected readonly selectPanelClass = SELECT_PANEL_CLASS;

  protected readonly form = buildWwellDynamicForm(WWELL_IR_FORM_SCHEMA, this.fb);
  protected readonly isSaving = this.store.creatingIntegratedRequirement;

  protected readonly activeStepIndex = signal(0);
  @ViewChildren('stepContent') private readonly stepContents?: QueryList<ElementRef<HTMLElement>>;
  @ViewChildren('reviewCard', { read: ElementRef }) private readonly reviewCards?: QueryList<ElementRef<HTMLElement>>;

  private previousStepIndex = 0;
  private wasSaving = false;
  private reviewRevealed = false;

  constructor() {
    effect(() => {
      const index = this.activeStepIndex();
      const host = this.stepContents?.get(index);
      if (!host) return;

      const direction: WwellStepDirection = index >= this.previousStepIndex ? 'forward' : 'backward';
      playIfMotionAllowed(buildStepTransitionTimeline(host.nativeElement, direction));
      this.previousStepIndex = index;
    });

    effect(() => {
      const isReviewStep = this.activeStepIndex() === WWELL_IR_FORM_SCHEMA.length - 1;
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
        this.snackBar.open(error, 'Dismiss', { duration: SNACKBAR_DURATION_MS });
      } else if (this.wasSaving && !saving) {
        this.router.navigate(['..'], { relativeTo: this.route });
      }
      this.wasSaving = saving;
    });
  }

  protected stepGroup(stepKey: string): FormGroup {
    return this.form.get(stepKey) as FormGroup;
  }

  protected sectionControl(stepKey: string, sectionKey: string): FormGroup | FormArray {
    return this.stepGroup(stepKey).get(sectionKey) as FormGroup | FormArray;
  }

  protected isStepValid(stepKey: string): boolean {
    return this.stepGroup(stepKey).valid;
  }

  protected onStepSelectionChange(index: number): void {
    this.activeStepIndex.set(index);
  }

  protected cancel(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  protected saveAsDraft(): void {
    this.submitAs('draft');
  }

  protected submit(stepper: MatStepper): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const invalidIndex = WWELL_IR_FORM_SCHEMA.findIndex(step => this.stepGroup(step.key).invalid);
      if (invalidIndex >= 0) stepper.selectedIndex = invalidIndex;
      return;
    }
    this.submitAs('in-progress');
  }

  private submitAs(status: 'draft' | 'in-progress'): void {
    const raw = this.form.getRawValue() as WwellIrFormRawValue;
    const { payload, files } = mapIrFormValueToSubmission(raw, status);
    this.store.createIntegratedRequirement(payload, files);
  }
}
