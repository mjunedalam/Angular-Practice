# IR and AP — Staged Files Snapshot

_Snapshot of all git-staged files on branch `feature/rbac`, generated 2026-08-04 14:01._

## Files

- `docs/plan/current-plan.md`
- `src/app/core/models/wwell-planning/wwell-planning.model.ts`
- `src/app/features/wwell-planning/shared/dynamic-form/dynamic-field/dynamic-field.component.html`
- `src/app/features/wwell-planning/shared/dynamic-form/dynamic-field/dynamic-field.component.scss`
- `src/app/features/wwell-planning/shared/dynamic-form/dynamic-field/dynamic-field.component.ts`
- `src/app/features/wwell-planning/shared/dynamic-form/dynamic-section/conditional-field.animation.ts`
- `src/app/features/wwell-planning/shared/dynamic-form/dynamic-section/dynamic-section.component.html`
- `src/app/features/wwell-planning/shared/dynamic-form/dynamic-section/dynamic-section.component.scss`
- `src/app/features/wwell-planning/shared/dynamic-form/dynamic-section/dynamic-section.component.ts`
- `src/app/features/wwell-planning/shared/dynamic-form/wwell-dynamic-form.builder.ts`
- `src/app/features/wwell-planning/shared/dynamic-form/wwell-dynamic-form.types.ts`
- `src/app/features/wwell-planning/shared/wwell-planning-reference-data.config.ts`
- `src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.mapper.spec.ts`
- `src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.mapper.ts`
- `src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.schema.ts`
- `src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.types.ts`
- `src/app/features/wwell-planning/wwell-ir/wwell-ir-new-page/wwell-ir-new-page.component.html`
- `src/app/features/wwell-planning/wwell-ir/wwell-ir-new-page/wwell-ir-new-page.component.scss`
- `src/app/features/wwell-planning/wwell-ir/wwell-ir-new-page/wwell-ir-new-page.component.ts`

## `docs/plan/current-plan.md`

```markdown
### Task: Redesign Step 5 in Angular Feature Component

**Target Path:** `@src/app/features/well-planning/well-ir/`

#### Requirements

1. **Step Title Update:**
   - Rename "Hydrology and testing" to **"Estimated Hydrology"**.

2. **Test Type Toggle Control:**
   - Convert the "Test Type" selection into a **button-based toggle group** (e.g., using Angular Material `mat-button-toggle-group` or custom styled buttons).
   - Toggle options: `FLOW` and `PUMP`.

3. **Dynamic Form Fields (Reactive Forms):**
   - **When Test Type = `FLOW`**, render the following fields:
     - Aquifer
     - SIWHP (psi)
     - Estimated TDS (ppm)
     - Estimated Rate (GPM)
     - H2S (ppm)
   - **When Test Type = `PUMP`**, render the following fields:
     - Aquifer
     - Estimated TDS (ppm)
     - Estimated Rate (GPM)
     - H2S (ppm)
     - Estimated Water Level (ft)
     - Estimated Pump Depth (ft)

4. **Animations & UX:**
   - Integrate **GSAP (`gsap`)** to handle smooth entrance/exit transitions when toggling between `FLOW` and `PUMP` view fields.
   - Ensure form control validation states are updated dynamically (`addControl` / `removeControl` or conditional validation) when switching modes.

5. **Deliverables:**
   - Updated Component TypeScript (`.ts`) file with reactive form logic and GSAP transition handlers.
   - Updated Template HTML (`.html`) with button toggle group and animated containers.
   - Updated Component Styles (`.scss` / `.css`).```

## `src/app/core/models/wwell-planning/wwell-planning.model.ts`

```typescript
export type WwellPlanningRequestStatus =
  | 'draft'
  | 'submitted'
  | 'in-review'
  | 'in-progress'
  | 'approved'
  | 'rejected';

export type WwellPlanningPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface WwellPlanningRequest {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly requestedBy: string;
  readonly requestedDate: string;
  readonly status: WwellPlanningRequestStatus;
  readonly client: string;
  readonly supporting: string;
  readonly coordinates: string;
  readonly targetAquifer: string;
  readonly proposedDepth: string;
  readonly businessUse: string;
  readonly priority: WwellPlanningPriority | null;
  readonly assignedTo: string | null;
  readonly notes: string | null;
  readonly attachments: readonly string[];
}

export interface CreateWwellPlanningRequestPayload
  extends Pick<
    WwellPlanningRequest,
    | 'client'
    | 'supporting'
    | 'coordinates'
    | 'targetAquifer'
    | 'proposedDepth'
    | 'businessUse'
    | 'priority'
    | 'assignedTo'
    | 'notes'
  > {
  readonly status: Extract<WwellPlanningRequestStatus, 'draft' | 'submitted'>;
}

export type ApprovalWorkflowStatus = 'in-progress' | 'submitted' | 'in-review' | 'approved' | 'rejected';
export type ApprovalStepStatus = 'approved' | 'in-progress' | 'pending' | 'rejected';

export interface ApprovalChainStep {
  readonly role: string;
  readonly name: string;
  readonly status: ApprovalStepStatus;
  readonly date: string | null;
}

export interface ApprovalRequestBase {
  readonly id: string;
  readonly reqNo: string;
  readonly client: string;
  readonly wellName: string;
  readonly submittedBy: string;
  readonly date: string;
  readonly status: ApprovalWorkflowStatus;
  readonly chain: readonly ApprovalChainStep[];
}

interface ApprovalWithSupportingDoc extends ApprovalRequestBase {
  readonly supporting: string;
}

export type WldaApproval = ApprovalWithSupportingDoc;

export interface LandAffairsApproval extends ApprovalRequestBase {
  readonly x: string;
  readonly y: string;
  readonly utm: string;
}

export interface CreateWldaApprovalPayload {
  readonly client: string;
  readonly wellName: string;
  readonly supporting: string;
  readonly initialCoordinates: string;
  readonly finalCoordinates: string | null;
  readonly proposedDepth: string;
  readonly targetAquifer: string;
  readonly businessUse: string;
  readonly drillingMethod: string | null;
  readonly assignedTo: string | null;
  readonly notes: string | null;
}

export interface CreateLandAffairsApprovalPayload {
  readonly client: string;
  readonly wellName: string;
  readonly coordinateX: string;
  readonly coordinateY: string;
  readonly utmZone: string;
  readonly landType: string;
  readonly surveyor: string | null;
  readonly parcelNumber: string | null;
  readonly notes: string | null;
}

export type IntegratedRequirementStatus = 'draft' | 'in-progress' | 'submit-for-review' | 'in-review' | 'approved';
export type IntegratedRequirementTestType = 'flow-test' | 'pump-test';

export interface IntegratedRequirementRequestReference {
  readonly linkedRequestId: string | null;
  readonly client: string;
  readonly supportingBusiness: string;
  readonly wellName: string;
  readonly targetAquifer: string;
  readonly targetDepthFt: number;
  readonly surfaceElevationFtAsl: number | null;
  readonly coordinates: string;
}

export interface IntegratedRequirementFormationTop {
  readonly name: string;
  readonly depthFt: number;
}

export interface IntegratedRequirementCasingRow {
  readonly type: string;
  readonly sizeIn: string;
  readonly depthFtBgl: number;
  readonly remarks: string | null;
}

export interface IntegratedRequirementDevelopmentTesting {
  readonly logging: string;
  readonly mudLogging: string;
  readonly sampling: string;
  readonly flowTest: string;
}

export interface IntegratedRequirementProgramDetails {
  readonly completion: string;
  readonly acidization: string;
  readonly transmission: string;
  readonly developmentTesting: IntegratedRequirementDevelopmentTesting;
}

export interface IntegratedRequirementContacts {
  readonly geologistPrimary: string;
  readonly geologistSecondary: string | null;
}

export interface IntegratedRequirementOffsetWell {
  readonly wellName: string;
  /** Everything below is historical test-result data — usually enriched after creation, not captured at intake. */
  readonly distanceKm?: number | null;
  readonly location?: string | null;
  readonly aquifer?: string | null;
  readonly totalDepthFt?: number | null;
  readonly testDurationMin?: number | null;
  readonly rateGpm?: number | null;
  readonly rpm?: number | null;
  readonly swlFt?: number | null;
  readonly pwlFt?: number | null;
  readonly drawdownFt?: number | null;
  readonly specificCapacity?: number | null;
  readonly tdsPpm?: number | null;
  readonly h2sPpm?: number | null;
}

export interface IntegratedRequirementHydrogeology {
  readonly aquifer: string;
  readonly estimatedTdsPpm: number | null;
  readonly h2sPpm: number | null;
  readonly estimatedPumpDepthFt: number | null;
}

export interface IntegratedRequirementTestProgram {
  readonly testType: IntegratedRequirementTestType;
  readonly estimatedRateGpm: number | null;
  readonly estimatedWaterLevelFt: number | null;
  /** Shut-in wellhead pressure — only meaningful for a flow test. */
  readonly siwhpPsi?: number | null;
}

export interface IntegratedRequirement {
  readonly id: string;
  readonly code: string;
  readonly updatedDate: string;
  readonly status: IntegratedRequirementStatus;
  readonly requestReference: IntegratedRequirementRequestReference;
  readonly formationTops: readonly IntegratedRequirementFormationTop[];
  readonly casing: readonly IntegratedRequirementCasingRow[];
  readonly programDetails: IntegratedRequirementProgramDetails;
  readonly contacts: IntegratedRequirementContacts;
  readonly offsetWells: readonly IntegratedRequirementOffsetWell[];
  readonly offsetWellsRemarks: string | null;
  readonly hydrogeology: IntegratedRequirementHydrogeology;
  readonly testProgram: IntegratedRequirementTestProgram;
  readonly attachmentNames: readonly string[];
  readonly chain: readonly ApprovalChainStep[];
}

export interface CreateIntegratedRequirementPayload
  extends Pick<
    IntegratedRequirement,
    | 'requestReference'
    | 'formationTops'
    | 'casing'
    | 'programDetails'
    | 'contacts'
    | 'offsetWells'
    | 'offsetWellsRemarks'
    | 'hydrogeology'
    | 'testProgram'
  > {
  readonly status: Extract<IntegratedRequirementStatus, 'draft' | 'in-progress'>;
}
```

## `src/app/features/wwell-planning/shared/dynamic-form/dynamic-field/dynamic-field.component.html`

```html
@if (mode() === 'review') {
  <div class="dyf dyf--review" [class.dyf--span-2]="config().colSpan === 2">
    <dt class="dyf__label">{{ config().label }}</dt>
    <dd class="dyf__value" [class.dyf__value--empty]="isReviewValueEmpty()">{{ reviewValue() }}</dd>
  </div>
} @else {
  <div class="dyf" [class.dyf--span-2]="config().colSpan === 2">
    @switch (config().type) {
      @case ('textarea') {
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="dyf__field">
          <mat-label>{{ config().label }}</mat-label>
          <textarea matInput [formControl]="control()" [placeholder]="config().placeholder ?? ''" rows="3"></textarea>
          @if (config().hint && !errorMessage()) {
            <mat-hint>{{ config().hint }}</mat-hint>
          }
          @if (errorMessage()) {
            <mat-error>{{ errorMessage() }}</mat-error>
          }
        </mat-form-field>
      }
      @case ('select') {
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="dyf__field">
          <mat-label>{{ config().label }}</mat-label>
          <mat-select [formControl]="control()" [panelClass]="selectPanelClass()">
            @for (opt of config().options ?? []; track optionValue(opt)) {
              <mat-option [value]="optionValue(opt)">{{ optionLabel(opt) }}</mat-option>
            }
          </mat-select>
          @if (config().hint && !errorMessage()) {
            <mat-hint>{{ config().hint }}</mat-hint>
          }
          @if (errorMessage()) {
            <mat-error>{{ errorMessage() }}</mat-error>
          }
        </mat-form-field>
      }
      @case ('combo') {
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="dyf__field">
          <mat-label>{{ config().label }}</mat-label>
          <input matInput [formControl]="control()" [matAutocomplete]="auto" [placeholder]="config().placeholder ?? 'Type or select from dropdown'" />
          <mat-autocomplete #auto="matAutocomplete" [class]="selectPanelClass()">
            @for (opt of config().options ?? []; track optionValue(opt)) {
              <mat-option [value]="optionValue(opt)">{{ optionLabel(opt) }}</mat-option>
            }
          </mat-autocomplete>
          @if (config().hint && !errorMessage()) {
            <mat-hint>{{ config().hint }}</mat-hint>
          }
          @if (errorMessage()) {
            <mat-error>{{ errorMessage() }}</mat-error>
          }
        </mat-form-field>
      }
      @case ('toggle-group') {
        <div class="dyf__toggle">
          <span class="dyf__toggle-label">
            {{ config().label }}
            @if (config().validators?.required) {
              <span class="dyf__required">*</span>
            }
          </span>
          <mat-button-toggle-group class="dyf__toggle-group" [formControl]="control()">
            @for (opt of config().options ?? []; track optionValue(opt)) {
              <mat-button-toggle [value]="optionValue(opt)">
                @if (optionIcon(opt); as icon) {
                  <mat-icon class="dyf__toggle-icon">{{ icon }}</mat-icon>
                }
                {{ optionLabel(opt) }}
              </mat-button-toggle>
            }
          </mat-button-toggle-group>
          @if (errorMessage()) {
            <div class="dyf__toggle-error">{{ errorMessage() }}</div>
          }
        </div>
      }
      @case ('file') {
        <div class="dyf__file">
          <span class="dyf__toggle-label">{{ config().label }}</span>
          <app-wwell-attachment-dropzone
            [hint]="config().placeholder ?? 'Click to attach file...'"
            (filesChange)="onFilesChange($event)"
          />
          @if (errorMessage()) {
            <div class="dyf__toggle-error">{{ errorMessage() }}</div>
          }
        </div>
      }
      @default {
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="dyf__field">
          <mat-label>{{ config().label }}</mat-label>
          <input
            matInput
            [type]="config().type === 'number' ? 'number' : 'text'"
            [formControl]="control()"
            [placeholder]="config().placeholder ?? ''"
          />
          @if (config().suffix) {
            <span matTextSuffix>&nbsp;{{ config().suffix }}</span>
          }
          @if (config().hint && !errorMessage()) {
            <mat-hint>{{ config().hint }}</mat-hint>
          }
          @if (errorMessage()) {
            <mat-error>{{ errorMessage() }}</mat-error>
          }
        </mat-form-field>
      }
    }
  </div>
}
```

## `src/app/features/wwell-planning/shared/dynamic-form/dynamic-field/dynamic-field.component.scss`

```scss
/* The component host sits between the grid container and `.dyf`, so without this,
 * `.dyf--span-2`'s grid-column has no grid item to act on — flatten it away. */
:host {
  display: contents;
}

.dyf__field {
  width: 100%;
}

.dyf--span-2 {
  grid-column: span 2;
}

.dyf__toggle,
.dyf__file {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  width: 100%;
}

.dyf__toggle-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: #475569;
}

.dyf__required {
  margin-left: 0.15rem;
  color: #dc2626;
}

.dyf__toggle-error {
  font-size: 0.72rem;
  color: #dc2626;
}

/* Enterprise segmented toggle — one connected bar, equal-width segments, solid
 * fill for the active segment. Overrides Material's default toggle chrome via
 * ::ng-deep since mat-button-toggle's internal markup lives outside this
 * component's view encapsulation boundary. */
.dyf__toggle-group {
  display: flex;
  width: 100%;
  border: 1.5px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  background: #f8fafc;

  ::ng-deep .mat-button-toggle {
    flex: 1 1 0;

    & + .mat-button-toggle {
      border-left: 1.5px solid #e2e8f0;
    }
  }

  ::ng-deep .mat-button-toggle-button {
    width: 100%;
    height: auto;
    padding: 0 !important;
  }

  /* Material reserves left padding on the button for this checkbox glyph — hiding just
   * the wrapper leaves that space unfilled by our background, exposing the focus overlay
   * underneath. Removing it from layout (not just hiding it) is what actually closes the gap. */
  ::ng-deep .mat-button-toggle-checkbox-wrapper {
    display: none !important;
    width: 0 !important;
  }

  ::ng-deep .mat-button-toggle-label-content {
    display: flex !important;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    box-sizing: border-box;
    width: 100%;
    padding: 0.7rem 1rem;
    line-height: 1.2;
    font-size: 0.86rem;
    font-weight: 600;
    color: #64748b;
    transition:
      color 150ms ease,
      background-color 150ms ease;
  }

  ::ng-deep .mat-button-toggle:not(.mat-button-toggle-checked):hover .mat-button-toggle-label-content {
    color: #1e293b;
    background: #eef2f7;
  }

  ::ng-deep .mat-button-toggle-checked .mat-button-toggle-label-content {
    color: #fff;
    background: #3b82f6;
  }

  ::ng-deep .mat-button-toggle-button:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: -2px;
  }
}

.dyf__toggle-icon {
  width: 18px;
  height: 18px;
  font-size: 18px;
  line-height: 18px;
  flex-shrink: 0;
}

.dyf--review {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.65rem 0.85rem;
  background: #f8fafc;
  border: 1px solid #eef2f7;
  border-radius: 10px;
  transition:
    background-color 150ms ease,
    border-color 150ms ease;

  &:hover {
    background: #f1f5f9;
    border-color: #e2e8f0;
  }
}

.dyf__label {
  margin: 0;
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}

.dyf__value {
  margin: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  word-break: break-word;

  &--empty {
    color: #cbd5e1;
    font-weight: 500;
    font-style: italic;
  }
}
```

## `src/app/features/wwell-planning/shared/dynamic-form/dynamic-field/dynamic-field.component.ts`

```typescript
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { WwellAttachmentDropzoneComponent } from '../../wwell-attachment-dropzone/wwell-attachment-dropzone.component';
import {
  WwellFieldConfig,
  wwellFieldOptionIcon,
  wwellFieldOptionLabel,
  wwellFieldOptionValue,
} from '../wwell-dynamic-form.types';

export type WwellDynamicFieldMode = 'edit' | 'review';

@Component({
  selector: 'app-dynamic-field',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonToggleModule,
    MatAutocompleteModule,
    MatIconModule,
    WwellAttachmentDropzoneComponent,
  ],
  templateUrl: './dynamic-field.component.html',
  styleUrl: './dynamic-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicFieldComponent {
  readonly config = input.required<WwellFieldConfig>();
  readonly control = input.required<FormControl>();
  readonly mode = input<WwellDynamicFieldMode>('edit');
  /** Class applied to this field's portaled select/autocomplete overlay panel, so a host page can theme it. */
  readonly selectPanelClass = input('');

  protected readonly optionLabel = wwellFieldOptionLabel;
  protected readonly optionValue = wwellFieldOptionValue;
  protected readonly optionIcon = wwellFieldOptionIcon;

  protected readonly reviewValue = computed(() => {
    const value = this.control().value;
    const cfg = this.config();

    if (cfg.type === 'file') {
      const files = value as File[] | null;
      return files?.length ? `${files.length} file(s) attached` : '—';
    }
    if ((cfg.type === 'select' || cfg.type === 'toggle-group') && cfg.options) {
      const match = cfg.options.find(opt => wwellFieldOptionValue(opt) === value);
      return match ? wwellFieldOptionLabel(match) : (value || '—');
    }
    return value === null || value === undefined || value === '' ? '—' : String(value);
  });

  protected readonly isReviewValueEmpty = computed(() => this.reviewValue() === '—');

  protected onFilesChange(files: File[]): void {
    this.control().setValue(files);
    this.control().markAsTouched();
  }

  protected errorMessage(): string | null {
    const control = this.control();
    if (!control.touched || control.valid) return null;
    if (control.hasError('required')) return `${this.config().label} is required`;
    if (control.hasError('pattern')) return `${this.config().label} format is invalid`;
    if (control.hasError('min')) return `${this.config().label} is below the minimum`;
    return 'Invalid value';
  }
}
```

## `src/app/features/wwell-planning/shared/dynamic-form/dynamic-section/conditional-field.animation.ts`

```typescript
import gsap from 'gsap';

const FIELD_ENTER_DURATION_S = 0.26;
const FIELD_EXIT_DURATION_S = 0.2;

/** Instantly pins a conditional field to its resting shown/hidden state — no tween (used on first render). */
export function setConditionalFieldVisibility(host: HTMLElement, visible: boolean): void {
  gsap.set(host, { opacity: visible ? 1 : 0, height: visible ? 'auto' : 0 });
}

/** Paused — caller decides when to play via `playIfMotionAllowed`. */
export function buildConditionalFieldEnterTimeline(host: HTMLElement): gsap.core.Timeline {
  return gsap
    .timeline({ paused: true })
    .fromTo(
      host,
      { opacity: 0, height: 0 },
      { opacity: 1, height: 'auto', duration: FIELD_ENTER_DURATION_S, ease: 'power2.out' },
    );
}

/** Runs `onComplete` (disabling + resetting the control) only once the exit animation finishes. */
export function buildConditionalFieldExitTimeline(host: HTMLElement, onComplete: () => void): gsap.core.Timeline {
  return gsap
    .timeline({ paused: true, onComplete })
    .to(host, { opacity: 0, height: 0, duration: FIELD_EXIT_DURATION_S, ease: 'power2.in' });
}
```

## `src/app/features/wwell-planning/shared/dynamic-form/dynamic-section/dynamic-section.component.html`

```html
<section class="dys" [class.dys--review]="mode() === 'review'">
  @if (section().title) {
    <h3 class="dys__title">{{ section().title }}</h3>
  }

  @if (section().fields) {
    <div class="dys__grid">
      @for (field of section().fields!; track field.key) {
        @if (field.visibleWhen) {
          <div class="dys__field-host" [class.dys__field-host--span-2]="field.colSpan === 2" #fieldHost>
            <app-dynamic-field
              [config]="field"
              [control]="fieldControl(field.key)"
              [mode]="mode()"
              [selectPanelClass]="selectPanelClass()"
            />
          </div>
        } @else {
          <app-dynamic-field
            [config]="field"
            [control]="fieldControl(field.key)"
            [mode]="mode()"
            [selectPanelClass]="selectPanelClass()"
          />
        }
      }
    </div>
  } @else if (section().repeatable) {
    <app-repeatable-group
      [config]="section().repeatable!"
      [formArray]="asFormArray()"
      [mode]="mode()"
      [selectPanelClass]="selectPanelClass()"
    />
  }
</section>
```

## `src/app/features/wwell-planning/shared/dynamic-form/dynamic-section/dynamic-section.component.scss`

```scss
.dys {
  margin-bottom: 1.25rem;

  &:last-child {
    margin-bottom: 0;
  }
}

.dys__title {
  margin: 0 0 0.6rem;
  font-size: 0.72rem;
  font-weight: 800;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.dys__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem 1.25rem;
  align-items: start;
}

/* Conditional field wrapper — GSAP animates opacity/height on this element when its
 * controlling field (e.g. Test Type) toggles; overflow:hidden keeps the collapse clean. */
.dys__field-host {
  overflow: hidden;
}

.dys__field-host--span-2 {
  grid-column: span 2;
}

/* Review mode: fields render as tiles (see dyf--review), so section titles
 * read as a divider between tile groups rather than a plain caption. */
.dys--review {
  padding-bottom: 0.9rem;
  border-bottom: 1px dashed #e2e8f0;

  &:last-child {
    padding-bottom: 0;
    border-bottom: none;
  }
}

.dys--review .dys__grid {
  gap: 0.6rem 0.75rem;
}

@media (max-width: 640px) {
  .dys__grid {
    grid-template-columns: 1fr;
  }
}
```

## `src/app/features/wwell-planning/shared/dynamic-form/dynamic-section/dynamic-section.component.ts`

```typescript
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChildren,
  computed,
  input,
} from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DynamicFieldComponent, WwellDynamicFieldMode } from '../dynamic-field/dynamic-field.component';
import { playIfMotionAllowed } from '../gsap-motion.util';
import { RepeatableGroupComponent } from '../repeatable-group/repeatable-group.component';
import { defaultValueFor } from '../wwell-dynamic-form.builder';
import { WwellFieldConfig, WwellFormSectionConfig } from '../wwell-dynamic-form.types';
import {
  buildConditionalFieldEnterTimeline,
  buildConditionalFieldExitTimeline,
  setConditionalFieldVisibility,
} from './conditional-field.animation';

@Component({
  selector: 'app-dynamic-section',
  standalone: true,
  imports: [DynamicFieldComponent, RepeatableGroupComponent],
  templateUrl: './dynamic-section.component.html',
  styleUrl: './dynamic-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicSectionComponent implements AfterViewInit, OnDestroy {
  readonly section = input.required<WwellFormSectionConfig>();
  readonly control = input.required<AbstractControl>();
  readonly mode = input<WwellDynamicFieldMode>('edit');
  readonly selectPanelClass = input('');

  @ViewChildren('fieldHost') private readonly fieldHosts?: QueryList<ElementRef<HTMLElement>>;

  /** Only fields with `visibleWhen` grow a `#fieldHost` wrapper — this stays index-aligned with that query list. */
  protected readonly conditionalFields = computed(() => (this.section().fields ?? []).filter(field => field.visibleWhen));

  /** Tracks last-applied visibility per field key so we only animate on an actual flip, not every keystroke. */
  private readonly lastVisibility = new Map<string, boolean>();
  private valueChangesSubscription?: Subscription;

  ngAfterViewInit(): void {
    this.syncConditionalFields();
    this.valueChangesSubscription = this.control().valueChanges.subscribe(() => this.syncConditionalFields());
  }

  ngOnDestroy(): void {
    this.valueChangesSubscription?.unsubscribe();
  }

  protected fieldControl(key: string): FormControl {
    return (this.control() as FormGroup).get(key) as FormControl;
  }

  protected asFormArray(): FormArray {
    return this.control() as FormArray;
  }

  private syncConditionalFields(): void {
    this.conditionalFields().forEach((field, index) => {
      const host = this.fieldHosts?.get(index)?.nativeElement;
      if (host) this.applyFieldVisibility(field, host);
    });
  }

  private applyFieldVisibility(field: WwellFieldConfig, host: HTMLElement): void {
    const isVisible = this.isFieldVisible(field);
    const seenBefore = this.lastVisibility.has(field.key);
    const wasVisible = this.lastVisibility.get(field.key);
    this.lastVisibility.set(field.key, isVisible);

    if (!seenBefore) {
      setConditionalFieldVisibility(host, isVisible);
      this.syncControlEnabled(field, isVisible);
      return;
    }
    if (isVisible === wasVisible) return;

    if (isVisible) {
      this.syncControlEnabled(field, true);
      playIfMotionAllowed(buildConditionalFieldEnterTimeline(host));
    } else {
      playIfMotionAllowed(buildConditionalFieldExitTimeline(host, () => this.syncControlEnabled(field, false)));
    }
  }

  private isFieldVisible(field: WwellFieldConfig): boolean {
    if (!field.visibleWhen) return true;
    const sibling = (this.control() as FormGroup).get(field.visibleWhen.field);
    return sibling?.value === field.visibleWhen.equals;
  }

  /** Hidden fields are disabled (excluded from validity/`.value`) and reset so a stale value from the other mode never submits. */
  private syncControlEnabled(field: WwellFieldConfig, isVisible: boolean): void {
    const control = this.fieldControl(field.key);
    if (isVisible) {
      if (control.disabled) control.enable({ emitEvent: false });
      return;
    }
    if (control.enabled) {
      control.reset(defaultValueFor(field), { emitEvent: false });
      control.disable({ emitEvent: false });
    }
  }
}
```

## `src/app/features/wwell-planning/shared/dynamic-form/wwell-dynamic-form.builder.ts`

```typescript
import { FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import {
  WwellFieldConfig,
  WwellFormSectionConfig,
  WwellFormStepConfig,
  WwellRepeatableRowConfig,
} from './wwell-dynamic-form.types';

/** Empty `File[]` isn't falsy to Angular's default `required` validator — needs its own check. */
const requiredFileList: ValidatorFn = control => (control.value?.length ? null : { required: true });

export function defaultValueFor(field: WwellFieldConfig): unknown {
  if (field.defaultValue !== undefined) return field.defaultValue;
  if (field.type === 'file') return [];
  if (field.type === 'number') return null;
  return '';
}

function buildValidators(field: WwellFieldConfig): ValidatorFn[] {
  const config = field.validators;
  if (!config) return [];

  const validators: ValidatorFn[] = [];
  if (config.required) {
    validators.push(field.type === 'file' ? requiredFileList : Validators.required);
  }
  if (config.pattern) validators.push(Validators.pattern(config.pattern));
  if (config.min !== undefined) validators.push(Validators.min(config.min));
  return validators;
}

export function buildFieldControl(field: WwellFieldConfig, fb: FormBuilder): FormControl {
  return fb.control(defaultValueFor(field), buildValidators(field));
}

export function buildRepeatableRowGroup(rowFields: readonly WwellFieldConfig[], fb: FormBuilder): FormGroup {
  const group = fb.group({});
  rowFields.forEach(field => group.addControl(field.key, buildFieldControl(field, fb)));
  return group;
}

export function addRepeatableRow(array: FormArray, rowFields: readonly WwellFieldConfig[], fb: FormBuilder): void {
  array.push(buildRepeatableRowGroup(rowFields, fb));
}

function buildRepeatableArray(config: WwellRepeatableRowConfig, fb: FormBuilder): FormArray {
  const arrayValidators = config.minRequiredRows ? [Validators.minLength(config.minRequiredRows)] : [];
  const array = fb.array<FormGroup>([], arrayValidators);
  const minRows = config.minRows ?? 0;
  for (let i = 0; i < minRows; i++) {
    addRepeatableRow(array, config.rowFields, fb);
  }
  return array;
}

export function buildSectionGroup(section: WwellFormSectionConfig, fb: FormBuilder): FormGroup | FormArray {
  if (section.repeatable) return buildRepeatableArray(section.repeatable, fb);

  const group = fb.group({});
  (section.fields ?? []).forEach(field => group.addControl(field.key, buildFieldControl(field, fb)));
  return group;
}

export function buildWwellDynamicForm(schema: readonly WwellFormStepConfig[], fb: FormBuilder): FormGroup {
  const root = fb.group({});
  schema.forEach(step => {
    const stepGroup = fb.group({});
    step.sections.forEach(section => stepGroup.addControl(section.key, buildSectionGroup(section, fb)));
    root.addControl(step.key, stepGroup);
  });
  return root;
}
```

## `src/app/features/wwell-planning/shared/dynamic-form/wwell-dynamic-form.types.ts`

```typescript
/** Schema vocabulary for the wwell-planning dynamic form engine. Add a field = edit a schema array, not a template. */

export type WwellFieldControlType = 'text' | 'number' | 'textarea' | 'select' | 'combo' | 'toggle-group' | 'file';

export interface WwellFieldOption {
  readonly value: string;
  readonly label: string;
  /** Material icon ligature name — used by 'toggle-group' only. */
  readonly icon?: string;
}

export interface WwellFieldValidatorConfig {
  readonly required?: boolean;
  readonly pattern?: RegExp;
  readonly min?: number;
}

/** Field is only shown (and its control enabled) while a sibling control in the same section equals this value. */
export interface WwellFieldVisibilityCondition {
  readonly field: string;
  readonly equals: string;
}

export interface WwellFieldConfig {
  readonly key: string;
  readonly label: string;
  readonly type: WwellFieldControlType;
  readonly placeholder?: string;
  readonly hint?: string;
  readonly suffix?: string;
  /** Used by 'select' | 'combo' | 'toggle-group'. Plain strings are shown as their own label. */
  readonly options?: readonly (string | WwellFieldOption)[];
  readonly validators?: WwellFieldValidatorConfig;
  readonly colSpan?: 1 | 2;
  readonly visibleWhen?: WwellFieldVisibilityCondition;
  /** Overrides the type-based empty default (e.g. pre-selecting a toggle-group option). */
  readonly defaultValue?: string | number;
}

export interface WwellRepeatableRowConfig {
  readonly key: string;
  readonly addLabel: string;
  readonly rowFields: readonly WwellFieldConfig[];
  /** How many empty rows to seed the array with on load. */
  readonly minRows?: number;
  /** If set, the array itself is invalid until it holds at least this many rows — an empty array is not "complete" just because it has no invalid children. */
  readonly minRequiredRows?: number;
}

export interface WwellFormSectionConfig {
  readonly key: string;
  readonly title: string | null;
  /** Mutually exclusive with `repeatable`. */
  readonly fields?: readonly WwellFieldConfig[];
  readonly repeatable?: WwellRepeatableRowConfig;
}

export interface WwellFormStepConfig {
  readonly key: string;
  readonly label: string;
  readonly sections: readonly WwellFormSectionConfig[];
}

export function wwellFieldOptionLabel(option: string | WwellFieldOption): string {
  return typeof option === 'string' ? option : option.label;
}

export function wwellFieldOptionValue(option: string | WwellFieldOption): string {
  return typeof option === 'string' ? option : option.value;
}

export function wwellFieldOptionIcon(option: string | WwellFieldOption): string | undefined {
  return typeof option === 'string' ? undefined : option.icon;
}
```

## `src/app/features/wwell-planning/shared/wwell-planning-reference-data.config.ts`

```typescript
/** Reference data shared by 2+ of the wwell-planning sub-features (requests, approvals, IR). */

export const WWELL_CLIENT_OPTIONS: readonly string[] = ['BI-11', 'BI-12', 'BI-13', 'BI-14', 'BI-15'];

export const WWELL_AQUIFER_OPTIONS: readonly string[] = [
  'Umm Er Radhuma',
  'Wasia',
  'Biyadh',
  'Dammam',
  'Neogene',
];

export const WWELL_BUSINESS_USE_OPTIONS: readonly string[] = [
  'Water Injection',
  'Water Supply',
  'Observation',
  'Disposal',
  'Appraisal',
];

export const WWELL_ASSIGNEE_OPTIONS: readonly string[] = [
  'Eng. A. Al-Mutairi',
  'Eng. S. Al-Dossari',
  'Eng. F. Al-Harbi',
  'Eng. M. Al-Qahtani',
];

/** Matches a numeric depth with an optional "m" unit, e.g. "180", "180m" or "180.5 m". */
export const WWELL_DEPTH_PATTERN = /^\d+(\.\d+)?\s?m?$/i;

export const WWELL_DRILLING_METHOD_OPTIONS: readonly string[] = [
  'Rotary',
  'Rotary + Cable Tool',
  'Cable Tool',
  'Air Rotary',
  'Mud Rotary',
];

export const WWELL_COMPLETION_OPTIONS: readonly string[] = [
  'Open Hole',
  'Screened',
  'Screened + Gravel Pack',
  'Liner + Perforated',
  'Cased & Perforated',
];

export const WWELL_FLUID_TYPE_OPTIONS: readonly string[] = ['Water-based', 'Polymer', 'Bentonite', 'Air/Foam'];

export const WWELL_CEMENTING_OPTIONS: readonly string[] = [
  'Class G',
  'Class G + Additives',
  'Class G + Silica Flour',
  'Class A',
];

export const WWELL_SUPPORTING_BUSINESS_OPTIONS: readonly string[] = [
  'Agriculture',
  'Municipal',
  'Industrial',
  'Environmental',
  'Research',
];

export const WWELL_CASING_TYPE_OPTIONS: readonly string[] = [
  'Conductor',
  'Surface',
  'Intermediate',
  'Production',
  'Liner',
];

export const WWELL_ACIDIZATION_OPTIONS: readonly string[] = ['HCl Acid Wash', 'Mud Acid', 'None'];

export const WWELL_TRANSMISSION_OPTIONS: readonly string[] = [
  'Gravity Flow',
  'Pumped Transmission',
  'Pipeline',
  'Tanker',
];

export const WWELL_LOGGING_OPTIONS: readonly string[] = ['Caliper', 'Gamma Ray', 'Resistivity', 'SP'];

export const WWELL_MUD_LOGGING_OPTIONS: readonly string[] = ['Full Mud Logging', 'Cuttings Sample Only', 'None'];

export const WWELL_SAMPLING_OPTIONS: readonly string[] = ['Bailer Sample', 'Pump Sample', 'Composite Sample'];

export const WWELL_DEVELOPMENT_FLOW_TEST_OPTIONS: readonly string[] = [
  'Step-Rate Test',
  'Constant-Rate Test',
  'Recovery Test',
];

export const WWELL_GEOLOGIST_OPTIONS: readonly string[] = WWELL_ASSIGNEE_OPTIONS;

export const WWELL_OFFSET_WELL_OPTIONS: readonly string[] = ['HAIL-100', 'HAIL-200', 'HAIL-300', 'HAIL-400'];

export const WWELL_TEST_TYPE_OPTIONS: readonly { value: 'flow-test' | 'pump-test'; label: string; icon: string }[] = [
  { value: 'flow-test', label: 'Flow Test', icon: 'waves' },
  { value: 'pump-test', label: 'Pump Test', icon: 'engineering' },
];
```

## `src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.mapper.spec.ts`

```typescript
import { mapIrFormValueToSubmission } from './wwell-ir-form.mapper';
import { WwellIrFormRawValue } from './wwell-ir-form.types';

function buildRaw(overrides: Partial<WwellIrFormRawValue> = {}): WwellIrFormRawValue {
  return {
    reference: {
      main: {
        linkedRequestId: 'REQ-00198',
        client: 'BI-12',
        supportingBusiness: 'Agriculture',
        wellName: 'HAIL-500',
        targetAquifer: 'Saq',
        targetDepthFt: 510,
        surfaceElevationFtAsl: 980,
        coordinates: '27.5114°N, 41.7208°E',
      },
    },
    subsurface: {
      formationTops: [{ name: 'Saq', depthFt: 200 }],
      casing: [{ type: 'Conductor', sizeIn: '20"', depthFtBgl: 30, remarks: 'Cemented' }],
    },
    programDetails: {
      main: { completion: 'Screened', acidization: '', transmission: '' },
      developmentTesting: { logging: 'Caliper', mudLogging: '', sampling: '', flowTest: '' },
    },
    contacts: {
      geologist: { geologistPrimary: 'Eng. A. Al-Mutairi', geologistSecondary: '' },
      offsetWells: [{ wellName: 'HAIL-100' }],
      remarks: { offsetWellsRemarks: '' },
    },
    hydrogeology: {
      main: {
        testType: 'pump-test',
        aquifer: 'Saq',
        siwhpPsi: null,
        estimatedTdsPpm: 1200,
        estimatedRateGpm: 350,
        h2sPpm: 5,
        estimatedWaterLevelFt: 95,
        estimatedPumpDepthFt: 150,
      },
    },
    attachments: { files: { locationMap: [], initiationRequest: [new File(['x'], 'init.pdf')] } },
    ...overrides,
  };
}

describe('mapIrFormValueToSubmission', () => {
  it('maps the nested raw form value to the domain payload shape', () => {
    const { payload } = mapIrFormValueToSubmission(buildRaw(), 'in-progress');

    expect(payload.status).toBe('in-progress');
    expect(payload.requestReference.wellName).toBe('HAIL-500');
    expect(payload.requestReference.linkedRequestId).toBe('REQ-00198');
    expect(payload.casing).toEqual([{ type: 'Conductor', sizeIn: '20"', depthFtBgl: 30, remarks: 'Cemented' }]);
    expect(payload.testProgram.testType).toBe('pump-test');
  });

  it('collects every file-typed field into one flat files array', () => {
    const { files } = mapIrFormValueToSubmission(buildRaw(), 'in-progress');

    expect(files).toHaveLength(1);
    expect(files[0].name).toBe('init.pdf');
  });

  it('normalizes blank optional strings to null', () => {
    const { payload } = mapIrFormValueToSubmission(buildRaw(), 'draft');

    expect(payload.contacts.geologistSecondary).toBeNull();
    expect(payload.offsetWellsRemarks).toBeNull();
    expect(payload.requestReference.linkedRequestId).toBe('REQ-00198');
  });

  it('preserves the requested status, including draft', () => {
    const { payload } = mapIrFormValueToSubmission(buildRaw(), 'draft');
    expect(payload.status).toBe('draft');
  });
});
```

## `src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.mapper.ts`

```typescript
import {
  CreateIntegratedRequirementPayload,
  IntegratedRequirementStatus,
  IntegratedRequirementTestType,
} from '@models/wwell-planning/wwell-planning.model';
import { WwellIrFormRawValue } from './wwell-ir-form.types';

export interface MappedIrSubmission {
  readonly payload: CreateIntegratedRequirementPayload;
  readonly files: readonly File[];
}

/** Bridges the schema-shaped raw form value to the domain payload — the two are deliberately not the same shape. */
export function mapIrFormValueToSubmission(
  raw: WwellIrFormRawValue,
  status: Extract<IntegratedRequirementStatus, 'draft' | 'in-progress'>,
): MappedIrSubmission {
  const payload: CreateIntegratedRequirementPayload = {
    status,
    requestReference: {
      linkedRequestId: raw.reference.main.linkedRequestId || null,
      client: raw.reference.main.client,
      supportingBusiness: raw.reference.main.supportingBusiness,
      wellName: raw.reference.main.wellName,
      targetAquifer: raw.reference.main.targetAquifer,
      targetDepthFt: raw.reference.main.targetDepthFt ?? 0,
      surfaceElevationFtAsl: raw.reference.main.surfaceElevationFtAsl,
      coordinates: raw.reference.main.coordinates,
    },
    formationTops: raw.subsurface.formationTops.map(row => ({ name: row.name, depthFt: row.depthFt ?? 0 })),
    casing: raw.subsurface.casing.map(row => ({
      type: row.type,
      sizeIn: row.sizeIn,
      depthFtBgl: row.depthFtBgl ?? 0,
      remarks: row.remarks || null,
    })),
    programDetails: {
      completion: raw.programDetails.main.completion,
      acidization: raw.programDetails.main.acidization,
      transmission: raw.programDetails.main.transmission,
      developmentTesting: { ...raw.programDetails.developmentTesting },
    },
    contacts: {
      geologistPrimary: raw.contacts.geologist.geologistPrimary,
      geologistSecondary: raw.contacts.geologist.geologistSecondary || null,
    },
    offsetWells: raw.contacts.offsetWells.map(row => ({ wellName: row.wellName })),
    offsetWellsRemarks: raw.contacts.remarks.offsetWellsRemarks || null,
    hydrogeology: {
      aquifer: raw.hydrogeology.main.aquifer,
      estimatedTdsPpm: raw.hydrogeology.main.estimatedTdsPpm,
      h2sPpm: raw.hydrogeology.main.h2sPpm,
      estimatedPumpDepthFt: raw.hydrogeology.main.estimatedPumpDepthFt,
    },
    testProgram: {
      testType: raw.hydrogeology.main.testType as IntegratedRequirementTestType,
      estimatedRateGpm: raw.hydrogeology.main.estimatedRateGpm,
      estimatedWaterLevelFt: raw.hydrogeology.main.estimatedWaterLevelFt,
      siwhpPsi: raw.hydrogeology.main.siwhpPsi,
    },
  };

  const files = [...raw.attachments.files.locationMap, ...raw.attachments.files.initiationRequest];

  return { payload, files };
}
```

## `src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.schema.ts`

```typescript
import { WwellFormStepConfig } from '../../shared/dynamic-form/wwell-dynamic-form.types';
import {
  WWELL_APPROVAL_COORDINATES_PATTERN,
  WWELL_APPROVAL_WELL_NAME_PATTERN,
} from '../../shared/wwell-approvals/wwell-approvals.config';
import {
  WWELL_ACIDIZATION_OPTIONS,
  WWELL_AQUIFER_OPTIONS,
  WWELL_CASING_TYPE_OPTIONS,
  WWELL_CLIENT_OPTIONS,
  WWELL_COMPLETION_OPTIONS,
  WWELL_DEVELOPMENT_FLOW_TEST_OPTIONS,
  WWELL_GEOLOGIST_OPTIONS,
  WWELL_LOGGING_OPTIONS,
  WWELL_MUD_LOGGING_OPTIONS,
  WWELL_OFFSET_WELL_OPTIONS,
  WWELL_SAMPLING_OPTIONS,
  WWELL_SUPPORTING_BUSINESS_OPTIONS,
  WWELL_TEST_TYPE_OPTIONS,
  WWELL_TRANSMISSION_OPTIONS,
} from '../../shared/wwell-planning-reference-data.config';

/** Single source of truth for the IR stepper — add a field here, not in a template. */
export const WWELL_IR_FORM_SCHEMA: readonly WwellFormStepConfig[] = [
  {
    key: 'reference',
    label: 'Request Reference',
    sections: [
      {
        key: 'main',
        title: null,
        fields: [
          { key: 'linkedRequestId', label: 'Link to Request', type: 'text', placeholder: 'e.g., REQ-00198 — HAIL-500' },
          { key: 'client', label: 'Client', type: 'select', options: WWELL_CLIENT_OPTIONS, validators: { required: true } },
          {
            key: 'supportingBusiness',
            label: 'Supporting Business',
            type: 'select',
            options: WWELL_SUPPORTING_BUSINESS_OPTIONS,
            validators: { required: true },
          },
          {
            key: 'wellName',
            label: 'Water Well Name',
            type: 'text',
            placeholder: 'e.g., HAIL-500',
            validators: { required: true, pattern: WWELL_APPROVAL_WELL_NAME_PATTERN },
          },
          {
            key: 'targetAquifer',
            label: 'Target Aquifer',
            type: 'select',
            options: WWELL_AQUIFER_OPTIONS,
            validators: { required: true },
          },
          {
            key: 'targetDepthFt',
            label: 'Target Depth',
            type: 'number',
            suffix: 'ft',
            validators: { required: true, min: 0 },
          },
          {
            key: 'surfaceElevationFtAsl',
            label: 'Surface Elevation',
            type: 'number',
            suffix: 'ft ASL',
            hint: 'Used for auto-calculating sub-sea depths',
          },
          {
            key: 'coordinates',
            label: 'Coordinates',
            type: 'text',
            placeholder: 'e.g., 27.5114°N, 41.7208°E',
            validators: { required: true, pattern: WWELL_APPROVAL_COORDINATES_PATTERN },
          },
        ],
      },
    ],
  },
  {
    key: 'subsurface',
    label: 'Subsurface & Construction',
    sections: [
      {
        key: 'formationTops',
        title: 'Formation Tops',
        repeatable: {
          key: 'formationTops',
          addLabel: '+ Add Formation Top',
          minRequiredRows: 1,
          rowFields: [
            { key: 'name', label: 'Formation', type: 'text' },
            { key: 'depthFt', label: 'Depth', type: 'number', suffix: 'ft' },
          ],
        },
      },
      {
        key: 'casing',
        title: 'Casing',
        repeatable: {
          key: 'casing',
          addLabel: '+ Add Casing',
          minRequiredRows: 1,
          rowFields: [
            {
              key: 'type',
              label: 'Type',
              type: 'select',
              options: WWELL_CASING_TYPE_OPTIONS,
              placeholder: 'e.g., Conductor',
            },
            { key: 'sizeIn', label: 'Size', type: 'text', placeholder: 'e.g., 20"' },
            { key: 'depthFtBgl', label: 'Depth', type: 'number', suffix: 'ft bgl' },
            { key: 'remarks', label: 'Remarks', type: 'text', placeholder: 'e.g., Cemented' },
          ],
        },
      },
    ],
  },
  {
    key: 'programDetails',
    label: 'Program Details',
    sections: [
      {
        key: 'main',
        title: null,
        fields: [
          {
            key: 'completion',
            label: 'Completion',
            type: 'select',
            options: WWELL_COMPLETION_OPTIONS,
            validators: { required: true },
          },
          { key: 'acidization', label: 'Acidization', type: 'combo', options: WWELL_ACIDIZATION_OPTIONS },
          { key: 'transmission', label: 'Transmission', type: 'combo', options: WWELL_TRANSMISSION_OPTIONS },
        ],
      },
      {
        key: 'developmentTesting',
        title: 'Development / Testing',
        fields: [
          { key: 'logging', label: 'Logging', type: 'combo', options: WWELL_LOGGING_OPTIONS },
          { key: 'mudLogging', label: 'Mud Logging', type: 'combo', options: WWELL_MUD_LOGGING_OPTIONS },
          { key: 'sampling', label: 'Sampling', type: 'combo', options: WWELL_SAMPLING_OPTIONS },
          { key: 'flowTest', label: 'Flow Test', type: 'combo', options: WWELL_DEVELOPMENT_FLOW_TEST_OPTIONS },
        ],
      },
    ],
  },
  {
    key: 'contacts',
    label: 'Contacts & Offset Wells',
    sections: [
      {
        key: 'geologist',
        title: 'Geologist Contact',
        fields: [
          {
            key: 'geologistPrimary',
            label: 'Primary',
            type: 'select',
            options: WWELL_GEOLOGIST_OPTIONS,
            validators: { required: true },
          },
          { key: 'geologistSecondary', label: 'Secondary', type: 'select', options: WWELL_GEOLOGIST_OPTIONS },
        ],
      },
      {
        key: 'offsetWells',
        title: 'Offset Water Wells',
        repeatable: {
          key: 'offsetWells',
          addLabel: '+ Add Offset Well',
          rowFields: [{ key: 'wellName', label: 'Well', type: 'select', options: WWELL_OFFSET_WELL_OPTIONS }],
        },
      },
      {
        key: 'remarks',
        title: null,
        fields: [
          {
            key: 'offsetWellsRemarks',
            label: 'Offset Wells Remarks (applies to all)',
            type: 'textarea',
            placeholder: 'General notes about offset wells...',
            colSpan: 2,
          },
        ],
      },
    ],
  },
  {
    key: 'hydrogeology',
    label: 'Estimated Hydrology',
    sections: [
      {
        key: 'main',
        title: null,
        fields: [
          {
            key: 'testType',
            label: 'Test Type',
            type: 'toggle-group',
            options: WWELL_TEST_TYPE_OPTIONS,
            validators: { required: true },
            colSpan: 2,
            defaultValue: 'flow-test',
          },
          {
            key: 'aquifer',
            label: 'Aquifer',
            type: 'select',
            options: WWELL_AQUIFER_OPTIONS,
            validators: { required: true },
          },
          { key: 'estimatedTdsPpm', label: 'Estimated TDS', type: 'number', suffix: 'ppm' },
          { key: 'estimatedRateGpm', label: 'Estimated Rate', type: 'number', suffix: 'GPM' },
          { key: 'h2sPpm', label: 'H2S', type: 'number', suffix: 'ppm' },
          // Mode-specific fields are grouped last (after an even count of always-visible fields above)
          // so a collapsed field never shares a grid row with an unrelated visible one.
          {
            key: 'siwhpPsi',
            label: 'SIWHP',
            type: 'number',
            suffix: 'psi',
            colSpan: 2,
            visibleWhen: { field: 'testType', equals: 'flow-test' },
          },
          {
            key: 'estimatedWaterLevelFt',
            label: 'Estimated Water Level',
            type: 'number',
            suffix: 'ft',
            visibleWhen: { field: 'testType', equals: 'pump-test' },
          },
          {
            key: 'estimatedPumpDepthFt',
            label: 'Estimated Pump Depth',
            type: 'number',
            suffix: 'ft',
            visibleWhen: { field: 'testType', equals: 'pump-test' },
          },
        ],
      },
    ],
  },
  {
    key: 'attachments',
    label: 'Attachments & Review',
    sections: [
      {
        key: 'files',
        title: 'Required Attachments',
        fields: [
          { key: 'locationMap', label: 'Location Map', type: 'file', placeholder: 'Click to attach file...' },
          {
            key: 'initiationRequest',
            label: 'Initiation Request',
            type: 'file',
            placeholder: 'Click to attach file...',
            validators: { required: true },
          },
        ],
      },
    ],
  },
];
```

## `src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.types.ts`

```typescript
/** Mirrors WWELL_IR_FORM_SCHEMA's nested FormGroup shape 1:1 — hand-written since the schema is runtime data. */

export interface WwellIrRawReference {
  readonly linkedRequestId: string;
  readonly client: string;
  readonly supportingBusiness: string;
  readonly wellName: string;
  readonly targetAquifer: string;
  readonly targetDepthFt: number | null;
  readonly surfaceElevationFtAsl: number | null;
  readonly coordinates: string;
}

export interface WwellIrRawFormationTop {
  readonly name: string;
  readonly depthFt: number | null;
}

export interface WwellIrRawCasingRow {
  readonly type: string;
  readonly sizeIn: string;
  readonly depthFtBgl: number | null;
  readonly remarks: string;
}

export interface WwellIrRawProgramMain {
  readonly completion: string;
  readonly acidization: string;
  readonly transmission: string;
}

export interface WwellIrRawDevelopmentTesting {
  readonly logging: string;
  readonly mudLogging: string;
  readonly sampling: string;
  readonly flowTest: string;
}

export interface WwellIrRawGeologist {
  readonly geologistPrimary: string;
  readonly geologistSecondary: string;
}

export interface WwellIrRawOffsetWell {
  readonly wellName: string;
}

export interface WwellIrRawRemarks {
  readonly offsetWellsRemarks: string;
}

export interface WwellIrRawHydrology {
  readonly testType: string;
  readonly aquifer: string;
  readonly siwhpPsi: number | null;
  readonly estimatedTdsPpm: number | null;
  readonly estimatedRateGpm: number | null;
  readonly h2sPpm: number | null;
  readonly estimatedWaterLevelFt: number | null;
  readonly estimatedPumpDepthFt: number | null;
}

export interface WwellIrRawFiles {
  readonly locationMap: File[];
  readonly initiationRequest: File[];
}

export interface WwellIrFormRawValue {
  readonly reference: { readonly main: WwellIrRawReference };
  readonly subsurface: {
    readonly formationTops: WwellIrRawFormationTop[];
    readonly casing: WwellIrRawCasingRow[];
  };
  readonly programDetails: {
    readonly main: WwellIrRawProgramMain;
    readonly developmentTesting: WwellIrRawDevelopmentTesting;
  };
  readonly contacts: {
    readonly geologist: WwellIrRawGeologist;
    readonly offsetWells: WwellIrRawOffsetWell[];
    readonly remarks: WwellIrRawRemarks;
  };
  readonly hydrogeology: { readonly main: WwellIrRawHydrology };
  readonly attachments: { readonly files: WwellIrRawFiles };
}
```

## `src/app/features/wwell-planning/wwell-ir/wwell-ir-new-page/wwell-ir-new-page.component.html`

```html
<div class="nip">
  <header class="nip__header">
    <div class="nip__heading">
      <button type="button" mat-icon-button class="nip__back" (click)="cancel()" aria-label="Back to integrated requirements">
        <mat-icon>arrow_back</mat-icon>
      </button>
      <div>
        <h1 class="nip__title">New Integrated Requirement (IR)</h1>
        <p class="nip__subtitle">3-step chain: Hydrogeologist → Lead Hydrogeologist → Manager</p>
      </div>
    </div>

    <app-wwell-approval-mini-chain [steps]="chainPreview" />
  </header>

  <mat-stepper
    class="nip__stepper"
    [linear]="false"
    labelPosition="bottom"
    (selectionChange)="onStepSelectionChange($event.selectedIndex)"
    #stepper
  >
    @for (step of schema; track step.key) {
      <mat-step [stepControl]="stepGroup(step.key)" [label]="step.label">
        <div class="nip__step-content" #stepContent>
          @for (section of step.sections; track section.key) {
            <app-dynamic-section
              [section]="section"
              [control]="sectionControl(step.key, section.key)"
              mode="edit"
              [selectPanelClass]="selectPanelClass"
            />
          }

          @if (step.key === 'attachments') {
            <div class="nip__review">
              <div class="nip__review-head">
                <div class="nip__review-heading">
                  <span class="nip__review-icon">
                    <mat-icon>fact_check</mat-icon>
                  </span>
                  <div>
                    <h3 class="nip__review-title">Review before you submit</h3>
                    <p class="nip__review-subtitle">Check each section below — use Edit to jump back and fix anything.</p>
                  </div>
                </div>

                @let summary = reviewCompletionSummary();
                <span
                  class="nip__review-summary"
                  [class.nip__review-summary--done]="summary.done === summary.total"
                >
                  <mat-icon>{{ summary.done === summary.total ? 'verified' : 'pending_actions' }}</mat-icon>
                  {{ summary.done }} of {{ summary.total }} complete
                </span>
              </div>

              <mat-accordion class="nip__review-grid" multi>
                @for (reviewStep of reviewSteps; track reviewStep.key; let i = $index) {
                  <mat-expansion-panel
                    class="nip__review-card"
                    [class.nip__review-card--done]="isStepValid(reviewStep.key)"
                    #reviewCard
                    (opened)="onReviewCardOpened(i)"
                  >
                    <mat-expansion-panel-header class="nip__review-card-header">
                      <mat-panel-title class="nip__review-card-title">
                        <span
                          class="nip__review-card-badge"
                          [class.nip__review-card-badge--done]="isStepValid(reviewStep.key)"
                        >
                          <mat-icon>{{ isStepValid(reviewStep.key) ? 'check' : 'priority_high' }}</mat-icon>
                        </span>
                        {{ reviewStep.label }}
                      </mat-panel-title>

                      <button
                        type="button"
                        mat-button
                        class="nip__review-card-edit"
                        (click)="$event.stopPropagation(); stepper.selectedIndex = i"
                      >
                        <mat-icon>edit</mat-icon>
                        Edit
                      </button>
                    </mat-expansion-panel-header>

                    <div class="nip__review-card-body">
                      @for (section of reviewStep.sections; track section.key) {
                        <app-dynamic-section
                          [section]="section"
                          [control]="sectionControl(reviewStep.key, section.key)"
                          mode="review"
                        />
                      }
                    </div>
                  </mat-expansion-panel>
                }
              </mat-accordion>
            </div>
          }
        </div>
      </mat-step>
    }
  </mat-stepper>

  <footer class="nip__footer">
    <button type="button" mat-stroked-button (click)="cancel()">Cancel</button>
    <button type="button" mat-stroked-button [disabled]="isSaving()" (click)="saveAsDraft()">
      <mat-icon>save</mat-icon>
      Save as Draft
    </button>
    <button type="button" mat-flat-button color="primary" [disabled]="isSaving()" (click)="submit(stepper)">
      <mat-icon>send</mat-icon>
      Submit
    </button>
  </footer>
</div>
```

## `src/app/features/wwell-planning/wwell-ir/wwell-ir-new-page/wwell-ir-new-page.component.scss`

```scss
@use '@angular/material' as mat;
@use '../../shared/wwell-select-panel-mixin' as wsel;

/* ── wwell-ir-new-page tokens ─────────────────────────────────── */
$navy:   #1e293b;
$muted:  #64748b;
$border: #e2e8f0;
$accent: #3b82f6;
$danger: #dc2626;

/*
 * Same rationale as wwell-ir-form.component.scss: the app only calls mat.core()
 * globally with no real M3 theme, so every Material control here (form fields,
 * selects, stepper, expansion panels, button toggles) would resolve unset
 * --mat-sys-* tokens without its own scoped theme.
 */
.nip,
.nip-select-panel {
  color-scheme: light;

  @include mat.theme((
    color: (
      theme-type: light,
      primary: mat.$blue-palette,
      tertiary: mat.$azure-palette,
    ),
    typography: (
      plain-family: (Roboto, 'Helvetica Neue', sans-serif),
      brand-family: (Roboto, 'Helvetica Neue', sans-serif),
    ),
    density: -1,
  ));
}

.nip {
  @include mat.form-field-overrides((
    outlined-container-shape: 10px,
  ));
}

.nip-select-panel {
  border-radius: 10px !important;
  box-shadow:
    0 4px 10px rgba(15, 23, 42, 0.12),
    0 12px 28px rgba(15, 23, 42, 0.14) !important;
  @include wsel.panel($accent, $navy);
}

/*
 * `:host` is a no-op on this component: ViewEncapsulation.None (see the M3
 * theme rationale above) strips Angular's `:host` processing entirely, since
 * there's no shadow boundary left to scope it against — the block silently
 * compiles to nothing. Confirmed at runtime: no rule in any stylesheet ever
 * set this background, so the host never became its own scroll container.
 * That matters here specifically because the parent layout applies
 * `overflow: hidden` to `.dashboard__content` for this route
 * (dashboard__content--scroll-locked, in layout.component.scss) — it expects
 * routed pages under 'integrated-requirements' to own their own scrolling.
 * Target the tag directly instead; under None encapsulation styles are
 * already global, so this is exactly what `:host` was meant to do.
 */
app-wwell-ir-new-page {
  display: block;
  height: 100%;
  overflow: auto;
  background: #f0f4f8;
}

.nip {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding: 1.5rem;
  min-height: 100%;
  @include wsel.trigger($accent);
}

/* ── Header ───────────────────────────────────────────────────────
 * Explicit opaque background — this was the one element on the page relying
 * on bleed-through from the page host's light background instead of owning
 * its own surface like `.nip__stepper` / `.nip__footer` do. That bleed-through
 * isn't reliable (the app shell's content area sits on a dark navy backdrop,
 * `--bg-content` in styles.scss), so the navy title text lost contrast.
 */
.nip__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  background: #ffffff;
  border: 1px solid $border;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.06),
    0 4px 12px rgba(59, 130, 246, 0.05);
}

.nip__heading {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.nip__back {
  margin-top: -2px;
}

.nip__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: $navy;
  letter-spacing: -0.01em;
}

.nip__subtitle {
  margin: 0.15rem 0 0;
  font-size: 0.82rem;
  color: $muted;
}

/* ── Stepper card ─────────────────────────────────────────────── */
.nip__stepper {
  background: #ffffff;
  border: 1px solid $border;
  border-radius: 12px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.06),
    0 4px 12px rgba(59, 130, 246, 0.05);
  padding: 0.5rem 1rem 1.25rem;
}

.nip__step-content {
  padding: 1rem 0.25rem 0;
}

/* Material's stepper hardcodes `overflow: hidden` on the content container
 * (see @angular/material/stepper structural styles) to clip the horizontal
 * slide transition between steps. That also clips anything inside the active
 * step that grows *after* the step has settled — e.g. expanding a review
 * accordion — so the newly revealed content is cut off with no way to scroll
 * to it. The host element above already owns the real scroll container
 * (`overflow: auto`), so it's safe to let this inner container size to its
 * content.
 */
.nip .mat-horizontal-content-container {
  overflow: visible;
}

/* ── Stepper header ───────────────────────────────────────────────────────
 * Icon-above-label layout via Material's own `labelPosition="bottom"` mode.
 * Material centers the connector line using a hardcoded assumption of a 24px
 * icon: `top: (header-height - 24) / 2 + 12`. Our icon is deliberately bigger
 * (40px) for a more prominent, modern look, so that formula would leave the
 * line ~8px too high. $header-height / $icon-size below feed the same
 * variable Material reads, and the hand-computed $line-top corrects for the
 * bigger icon: padding-top ((header-height - 24) / 2, Material's own formula)
 * plus half our real icon size.
 *
 * Material actually draws this connector in THREE separate pieces: the
 * `<div class="mat-stepper-horizontal-line">` between each pair of headers,
 * plus a `::before`/`::after` pseudo-element on each header itself (bridging
 * the header's own side padding up to its icon). Only the middle `<div>` was
 * shifted down to `$line-top` below — the pseudo-elements stayed at
 * Material's un-adjusted default `top`, so they visibly break away from the
 * div's line right next to every circle. All three need the same `top` and
 * color to read as one continuous line.
 */
$header-height: 88px;
$icon-size: 40px;
$line-top: calc((#{$header-height} - 24px) / 2 + #{$icon-size} / 2);
$line-idle: #e5e7eb;

.nip .mat-stepper-horizontal {
  --mat-stepper-header-height: #{$header-height};
}

.nip .mat-horizontal-stepper-header-container {
  padding: 0.5rem 0.5rem 1rem;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid $border;
}

.nip .mat-step-header {
  border-radius: 12px;
  background-color: transparent !important;
  transition: background-color 150ms ease;

  &:not([aria-disabled='true']):hover {
    background-color: rgba($accent, 0.06) !important;
  }
}

.nip .mat-step-icon {
  width: $icon-size;
  height: $icon-size;
  background: #e5e7eb;
  color: #94a3b8;
  font-weight: 700;
  font-size: 1rem;
  transition:
    background 200ms ease,
    color 200ms ease,
    transform 200ms ease,
    box-shadow 200ms ease;
}

.nip .mat-step-icon-selected {
  background: linear-gradient(135deg, $accent, #60a5fa);
  color: #fff;
  transform: scale(1.1);
  box-shadow: 0 4px 14px rgba($accent, 0.38);
}

.nip .mat-step-icon-state-done {
  background: #10b981;
  color: #fff;
}

.nip .mat-step-icon-state-error {
  background: $danger;
  color: #fff;
}

.nip .mat-step-label {
  max-width: 132px;
  white-space: normal;
  line-height: 1.25;
  font-size: 0.82rem;
  font-weight: 700;
  color: $muted;
  transition: color 150ms ease;
}

.nip .mat-step-label-selected,
.nip .mat-step-label-active {
  color: $navy;
  font-weight: 800;
}

.nip .mat-stepper-horizontal-line {
  border-top-width: 2px;
  border-top-color: $line-idle;
  top: #{$line-top} !important;
  transition: border-top-color 300ms ease;
}

/* The header's own bridging pieces — see the comment above $header-height
 * for why these need to match the connector `<div>` exactly. */
.nip .mat-horizontal-stepper-header::before,
.nip .mat-horizontal-stepper-header::after {
  top: #{$line-top} !important;
  border-top-width: 2px;
  border-top-color: $line-idle;
  transition: border-top-color 300ms ease;
}

/* Traveled-path progress: recolor every connector segment that sits behind a
 * completed step — the header's own trailing edge, the `<div>` after it, and
 * the following header's leading edge — so the path already walked reads as
 * a distinct accent track instead of a flat uniform gray. Driven entirely by
 * Material's own `mat-step-icon-state-done` class, so it stays in sync with
 * navigation for free and animates via the transitions above.
 */
.nip .mat-step-header:has(.mat-step-icon-state-done)::after,
.nip .mat-step-header:has(.mat-step-icon-state-done) + .mat-stepper-horizontal-line,
.nip .mat-step-header:has(.mat-step-icon-state-done) + .mat-stepper-horizontal-line + .mat-step-header::before {
  border-top-color: $accent !important;
}

/* ── Review section ───────────────────────────────────────────── */
$done: #10b981;
$pending: #b45309;

.nip__review {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: linear-gradient(180deg, rgba($accent, 0.05), rgba($accent, 0));
  border: 1px solid rgba($accent, 0.14);
  border-radius: 14px;
}

.nip__review-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.1rem;
}

.nip__review-heading {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
}

.nip__review-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 10px;
  background: linear-gradient(135deg, $accent, #60a5fa);
  color: #fff;
  box-shadow: 0 4px 12px rgba($accent, 0.32);

  mat-icon {
    width: 20px;
    height: 20px;
    font-size: 20px;
  }
}

.nip__review-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: $navy;
}

.nip__review-subtitle {
  margin: 0.2rem 0 0;
  font-size: 0.82rem;
  color: $muted;
}

.nip__review-summary {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  color: $pending;
  background: #fef3c7;
  white-space: nowrap;

  mat-icon {
    width: 16px;
    height: 16px;
    font-size: 16px;
  }

  &--done {
    color: #047857;
    background: #d1fae5;
  }
}

.nip__review-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.nip .nip__review-card {
  position: relative;
  border: 1px solid $border !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  overflow: hidden;
  background: #fff;
  transition:
    box-shadow 180ms ease,
    border-color 180ms ease;

  &::before {
    display: none;
  }

  /* Status accent bar — pending amber, complete green. */
  &::after {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 3px;
    background: $pending;
  }

  &--done::after {
    background: $done;
  }

  &:not(.mat-expanded) .nip__review-card-header:hover {
    background: rgba($accent, 0.04);
  }

  &.mat-expanded {
    border-color: rgba($accent, 0.35) !important;
    box-shadow: 0 6px 18px rgba(15, 23, 42, 0.08) !important;
  }
}

.nip__review-card-header {
  transition: background-color 150ms ease;
}

.nip__review-card-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 700;
  color: $navy;
}

.nip__review-card-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #fef3c7;
  color: #b45309;
  transition:
    background-color 150ms ease,
    color 150ms ease;

  mat-icon {
    width: 14px;
    height: 14px;
    font-size: 14px;
  }

  &--done {
    background: #d1fae5;
    color: #047857;
  }
}

.nip__review-card-edit {
  margin-left: auto;
  color: $accent;
  font-weight: 700;
  font-size: 0.78rem;

  mat-icon {
    width: 16px;
    height: 16px;
    font-size: 16px;
    margin-right: 2px;
  }
}

.nip__review-card-body {
  padding: 0.75rem 0.25rem 0.25rem;
}

/* ── Footer ───────────────────────────────────────────────────── */
.nip__footer {
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 0.9rem 1.1rem;
  background: #ffffff;
  border: 1px solid $border;
  border-radius: 12px;
  box-shadow: 0 -4px 12px rgba(15, 23, 42, 0.05);
}

.nip .mat-mdc-form-field-required-marker {
  color: $danger;
}

@media (max-width: 640px) {
  .nip {
    padding: 1rem;
  }

  .nip__footer {
    flex-wrap: wrap;

    button {
      flex: 1;
    }
  }
}
```

## `src/app/features/wwell-planning/wwell-ir/wwell-ir-new-page/wwell-ir-new-page.component.ts`

```typescript
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
```

