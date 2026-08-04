# IR and AP — Staged Files Snapshot

_Snapshot of all git-staged files on branch `feature/rbac`, generated 2026-08-04 10:32._

## Files

- `src/app/app.routes.ts`
- `src/app/core/models/wwell-planning/wwell-planning.model.ts`
- `src/app/features/wwell-planning/shared/dynamic-form/detail-reveal.animation.ts`
- `src/app/features/wwell-planning/shared/dynamic-form/dynamic-field/dynamic-field.component.html`
- `src/app/features/wwell-planning/shared/dynamic-form/dynamic-field/dynamic-field.component.scss`
- `src/app/features/wwell-planning/shared/dynamic-form/dynamic-field/dynamic-field.component.ts`
- `src/app/features/wwell-planning/shared/dynamic-form/dynamic-section/dynamic-section.component.html`
- `src/app/features/wwell-planning/shared/dynamic-form/dynamic-section/dynamic-section.component.scss`
- `src/app/features/wwell-planning/shared/dynamic-form/dynamic-section/dynamic-section.component.ts`
- `src/app/features/wwell-planning/shared/dynamic-form/gsap-motion.util.ts`
- `src/app/features/wwell-planning/shared/dynamic-form/repeatable-group/repeatable-group.component.html`
- `src/app/features/wwell-planning/shared/dynamic-form/repeatable-group/repeatable-group.component.scss`
- `src/app/features/wwell-planning/shared/dynamic-form/repeatable-group/repeatable-group.component.ts`
- `src/app/features/wwell-planning/shared/dynamic-form/repeatable-group/repeatable-row.animation.ts`
- `src/app/features/wwell-planning/shared/dynamic-form/review-reveal.animation.ts`
- `src/app/features/wwell-planning/shared/dynamic-form/step-transition.animation.ts`
- `src/app/features/wwell-planning/shared/dynamic-form/wwell-dynamic-form.builder.spec.ts`
- `src/app/features/wwell-planning/shared/dynamic-form/wwell-dynamic-form.builder.ts`
- `src/app/features/wwell-planning/shared/dynamic-form/wwell-dynamic-form.types.ts`
- `src/app/features/wwell-planning/shared/wwell-approvals/wwell-approval-timeline/wwell-approval-timeline.component.scss`
- `src/app/features/wwell-planning/shared/wwell-approvals/wwell-approval-timeline/wwell-approval-timeline.component.ts`
- `src/app/features/wwell-planning/shared/wwell-approvals/wwell-approvals.config.ts`
- `src/app/features/wwell-planning/shared/wwell-planning-reference-data.config.ts`
- `src/app/features/wwell-planning/store/wwell-planning.state.ts`
- `src/app/features/wwell-planning/store/wwell-planning.store.spec.ts`
- `src/app/features/wwell-planning/store/wwell-planning.store.ts`
- `src/app/features/wwell-planning/wwell-ir/wwell-ir-design-preview/wwell-ir-design-preview.component.html`
- `src/app/features/wwell-planning/wwell-ir/wwell-ir-design-preview/wwell-ir-design-preview.component.scss`
- `src/app/features/wwell-planning/wwell-ir/wwell-ir-design-preview/wwell-ir-design-preview.component.ts`
- `src/app/features/wwell-planning/wwell-ir/wwell-ir-detail/wwell-ir-detail.component.html`
- `src/app/features/wwell-planning/wwell-ir/wwell-ir-detail/wwell-ir-detail.component.scss`
- `src/app/features/wwell-planning/wwell-ir/wwell-ir-detail/wwell-ir-detail.component.ts`
- `src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.component.html` _(deleted)_
- `src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.component.scss` _(deleted)_
- `src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.component.ts` _(deleted)_
- `src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.config.ts`
- `src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.mapper.spec.ts`
- `src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.mapper.ts`
- `src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.schema.ts`
- `src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.types.ts`
- `src/app/features/wwell-planning/wwell-ir/wwell-ir-new-page/wwell-ir-new-page.component.html`
- `src/app/features/wwell-planning/wwell-ir/wwell-ir-new-page/wwell-ir-new-page.component.scss`
- `src/app/features/wwell-planning/wwell-ir/wwell-ir-new-page/wwell-ir-new-page.component.spec.ts`
- `src/app/features/wwell-planning/wwell-ir/wwell-ir-new-page/wwell-ir-new-page.component.ts`
- `src/app/features/wwell-planning/wwell-ir/wwell-ir.component.html`
- `src/app/features/wwell-planning/wwell-ir/wwell-ir.component.scss`
- `src/app/features/wwell-planning/wwell-ir/wwell-ir.component.ts`
- `src/app/features/wwell-planning/wwell-ir/wwell-ir.config.ts`
- `src/app/features/wwell-planning/wwell-ir/wwell-ir.mock.ts`
- `src/app/features/wwell-planning/wwell-planning.service.ts`
- `src/app/layout/layout.component.html`

## `src/app/app.routes.ts`

```typescript
import { Routes } from '@angular/router';
import { authGuard } from '@guards/auth.guard';
import { roleGuard } from '@guards/role.guard';
import { EmailStore } from '@store/email/email.store';
import { WellDocsStore } from '@store/well-docs/well-docs.store';
import { PresentationStore } from './features/presentation/store/presentation.store';
import { ActiveWwellStore } from './features/active-wwell/store/active-wwell.store';
import { MorningReportStore } from './features/morning-report/store/morning-report.store';
import { WwellPlanningStore } from './features/wwell-planning/store/wwell-planning.store';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'main',
    loadComponent: () =>
      import('./layout/layout.component').then(
        (m) => m.LayoutComponent,
      ),
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/home/home.component').then(
            (m) => m.HomeComponent,
          ),
      },
      // PLANNING — open to all roles for now, mirrors left-sidenav.component.ts (no RBAC gating yet)
      {
        path: 'requests',
        loadComponent: () =>
          import('./features/wwell-planning/wwell-requests/wwell-requests.component').then(
            (m) => m.WwellRequestsComponent,
          ),
        providers: [WwellPlanningStore],
      },
      {
        path: 'wlda-approvals',
        loadComponent: () =>
          import('./features/wwell-planning/wwell-wlda-approvals/wwell-wlda-approvals.component').then(
            (m) => m.WwellWldaApprovalsComponent,
          ),
        providers: [WwellPlanningStore],
      },
      {
        path: 'land-affairs-approvals',
        loadComponent: () =>
          import('./features/wwell-planning/wwell-land-affairs-approvals/wwell-land-affairs-approvals.component').then(
            (m) => m.WwellLandAffairsApprovalsComponent,
          ),
        providers: [WwellPlanningStore],
      },
      {
        path: 'integrated-requirements',
        // Store hoisted to this parent (not per-child) so 'new' shares one live store instance
        // with the list route — otherwise a freshly created IR would vanish on navigate-back.
        providers: [WwellPlanningStore],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/wwell-planning/wwell-ir/wwell-ir.component').then(
                (m) => m.WwellIrComponent,
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/wwell-planning/wwell-ir/wwell-ir-new-page/wwell-ir-new-page.component').then(
                (m) => m.WwellIrNewPageComponent,
              ),
          },
        ],
      },
      {
        path: 'presentations',
        data: { routeId: 'presentations' },
        canActivate: [roleGuard],
        loadComponent: () =>
          import('./features/presentation/presentation.component').then(
            (m) => m.PresentationComponent,
          ),
        providers: [PresentationStore, WellDocsStore],
      },
      {
        path: 'active-wwell',
        data: { routeId: 'active-wwell' },
        canActivate: [roleGuard],
        loadComponent: () =>
          import('./features/active-wwell/active-wwell-view/active-wwell-view.component').then(
            (m) => m.ActiveWwellViewComponent,
          ),
        providers: [ActiveWwellStore],
      },
      {
        path: 'morning-report',
        data: { routeId: 'morning-report' },
        canActivate: [roleGuard],
        loadComponent: () =>
          import('./features/morning-report/morning-report.component').then(
            (m) => m.MorningReportComponent,
          ),
        providers: [EmailStore, MorningReportStore],
      },
      {
        path: 'water-wells-overview',
        data: { routeId: 'presentations' },
        canActivate: [roleGuard],
        loadComponent: () =>
          import('./features/water-wells-overview/water-wells-overview.component').then(
            (m) => m.WaterWellsOverviewComponent,
          ),
        providers: [MorningReportStore],
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
```

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

## `src/app/features/wwell-planning/shared/dynamic-form/detail-reveal.animation.ts`

```typescript
import gsap from 'gsap';

const DETAIL_REVEAL_DURATION_S = 0.28;
const DETAIL_SLIDE_PX = 12;

/** Fade + slide-up reveal for a master-detail panel when the selected record changes. Paused — caller decides when to play. */
export function buildDetailRevealTimeline(host: HTMLElement): gsap.core.Timeline {
  return gsap
    .timeline({ paused: true })
    .fromTo(
      host,
      { opacity: 0, y: DETAIL_SLIDE_PX },
      { opacity: 1, y: 0, duration: DETAIL_REVEAL_DURATION_S, ease: 'power2.out' },
    );
}
```

## `src/app/features/wwell-planning/shared/dynamic-form/dynamic-field/dynamic-field.component.html`

```html
@if (mode() === 'review') {
  <div class="dyf dyf--review" [class.dyf--span-2]="config().colSpan === 2">
    <dt class="dyf__label">{{ config().label }}</dt>
    <dd class="dyf__value">{{ reviewValue() }}</dd>
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
          <span class="dyf__toggle-label">{{ config().label }}</span>
          <mat-button-toggle-group [formControl]="control()">
            @for (opt of config().options ?? []; track optionValue(opt)) {
              <mat-button-toggle [value]="optionValue(opt)">{{ optionLabel(opt) }}</mat-button-toggle>
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

.dyf__toggle-error {
  font-size: 0.72rem;
  color: #dc2626;
}

.dyf--review {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.dyf__label {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #64748b;
}

.dyf__value {
  margin: 0;
  font-size: 0.92rem;
  color: #1e293b;
}
```

## `src/app/features/wwell-planning/shared/dynamic-form/dynamic-field/dynamic-field.component.ts`

```typescript
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { WwellAttachmentDropzoneComponent } from '../../wwell-attachment-dropzone/wwell-attachment-dropzone.component';
import { WwellFieldConfig, wwellFieldOptionLabel, wwellFieldOptionValue } from '../wwell-dynamic-form.types';

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

## `src/app/features/wwell-planning/shared/dynamic-form/dynamic-section/dynamic-section.component.html`

```html
<section class="dys">
  @if (section().title) {
    <h3 class="dys__title">{{ section().title }}</h3>
  }

  @if (section().fields) {
    <div class="dys__grid">
      @for (field of section().fields!; track field.key) {
        <app-dynamic-field
          [config]="field"
          [control]="fieldControl(field.key)"
          [mode]="mode()"
          [selectPanelClass]="selectPanelClass()"
        />
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

@media (max-width: 640px) {
  .dys__grid {
    grid-template-columns: 1fr;
  }
}
```

## `src/app/features/wwell-planning/shared/dynamic-form/dynamic-section/dynamic-section.component.ts`

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { DynamicFieldComponent, WwellDynamicFieldMode } from '../dynamic-field/dynamic-field.component';
import { RepeatableGroupComponent } from '../repeatable-group/repeatable-group.component';
import { WwellFormSectionConfig } from '../wwell-dynamic-form.types';

@Component({
  selector: 'app-dynamic-section',
  standalone: true,
  imports: [DynamicFieldComponent, RepeatableGroupComponent],
  templateUrl: './dynamic-section.component.html',
  styleUrl: './dynamic-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicSectionComponent {
  readonly section = input.required<WwellFormSectionConfig>();
  readonly control = input.required<AbstractControl>();
  readonly mode = input<WwellDynamicFieldMode>('edit');
  readonly selectPanelClass = input('');

  protected fieldControl(key: string): FormControl {
    return (this.control() as FormGroup).get(key) as FormControl;
  }

  protected asFormArray(): FormArray {
    return this.control() as FormArray;
  }
}
```

## `src/app/features/wwell-planning/shared/dynamic-form/gsap-motion.util.ts`

```typescript
import gsap from 'gsap';

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Plays the timeline, or jumps straight to its end state when the user prefers reduced motion. */
export function playIfMotionAllowed(timeline: gsap.core.Timeline): gsap.core.Timeline {
  if (prefersReducedMotion()) {
    timeline.progress(1);
    return timeline;
  }
  timeline.play();
  return timeline;
}
```

## `src/app/features/wwell-planning/shared/dynamic-form/repeatable-group/repeatable-group.component.html`

```html
<div class="rpg">
  @for (row of rows(); track row; let i = $index) {
    <div class="rpg__row" #rowHost>
      <span class="rpg__row-index">#{{ i + 1 }}</span>
      <div class="rpg__row-fields">
        @for (field of config().rowFields; track field.key) {
          <app-dynamic-field
            [config]="field"
            [control]="fieldControl(row, field.key)"
            [mode]="mode()"
            [selectPanelClass]="selectPanelClass()"
          />
        }
      </div>
      @if (mode() === 'edit') {
        <button type="button" mat-icon-button [attr.aria-label]="'Remove row ' + (i + 1)" (click)="removeRow(i)">
          <mat-icon>close</mat-icon>
        </button>
      }
    </div>
  }

  @if (mode() === 'edit') {
    <button type="button" mat-stroked-button class="rpg__add" (click)="addRow()">
      <mat-icon>add</mat-icon>
      {{ config().addLabel }}
    </button>
  }
</div>
```

## `src/app/features/wwell-planning/shared/dynamic-form/repeatable-group/repeatable-group.component.scss`

```scss
.rpg {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.rpg__row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
  overflow: hidden;
}

.rpg__row-index {
  margin-top: 0.6rem;
  font-size: 0.72rem;
  font-weight: 700;
  color: #64748b;
  min-width: 1.5rem;
}

.rpg__row-fields {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.6rem 1rem;
}

.rpg__add {
  align-self: flex-start;
}
```

## `src/app/features/wwell-planning/shared/dynamic-form/repeatable-group/repeatable-group.component.ts`

```typescript
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DynamicFieldComponent, WwellDynamicFieldMode } from '../dynamic-field/dynamic-field.component';
import { playIfMotionAllowed } from '../gsap-motion.util';
import { addRepeatableRow } from '../wwell-dynamic-form.builder';
import { WwellRepeatableRowConfig } from '../wwell-dynamic-form.types';
import { buildRowEnterTimeline, buildRowExitTimeline } from './repeatable-row.animation';

@Component({
  selector: 'app-repeatable-group',
  standalone: true,
  imports: [DynamicFieldComponent, MatButtonModule, MatIconModule],
  templateUrl: './repeatable-group.component.html',
  styleUrl: './repeatable-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RepeatableGroupComponent {
  private readonly fb = inject(FormBuilder);

  readonly config = input.required<WwellRepeatableRowConfig>();
  readonly formArray = input.required<FormArray>();
  readonly mode = input<WwellDynamicFieldMode>('edit');
  readonly selectPanelClass = input('');

  @ViewChildren('rowHost') private readonly rowHosts?: QueryList<ElementRef<HTMLElement>>;

  /** Bumped only on user-triggered `addRow()` so the effect below can play an entrance animation for it. */
  private readonly addedRowTick = signal(0);

  constructor() {
    effect(() => {
      const tick = this.addedRowTick();
      if (tick === 0) return;
      const last = this.rowHosts?.last;
      if (last) playIfMotionAllowed(buildRowEnterTimeline(last.nativeElement));
    });
  }

  protected rows(): FormGroup[] {
    return this.formArray().controls as FormGroup[];
  }

  protected fieldControl(row: FormGroup, key: string): FormControl {
    return row.get(key) as FormControl;
  }

  protected addRow(): void {
    addRepeatableRow(this.formArray(), this.config().rowFields, this.fb);
    this.addedRowTick.update(tick => tick + 1);
  }

  protected removeRow(index: number): void {
    const host = this.rowHosts?.get(index);
    if (!host) {
      this.formArray().removeAt(index);
      return;
    }

    playIfMotionAllowed(buildRowExitTimeline(host.nativeElement, () => this.formArray().removeAt(index)));
  }
}
```

## `src/app/features/wwell-planning/shared/dynamic-form/repeatable-group/repeatable-row.animation.ts`

```typescript
import gsap from 'gsap';

const ROW_ENTER_DURATION_S = 0.28;
const ROW_EXIT_DURATION_S = 0.22;

/** Paused — caller decides when to play via `playIfMotionAllowed`. */
export function buildRowEnterTimeline(row: HTMLElement): gsap.core.Timeline {
  return gsap
    .timeline({ paused: true })
    .fromTo(row, { opacity: 0, height: 0 }, { opacity: 1, height: 'auto', duration: ROW_ENTER_DURATION_S, ease: 'power2.out' });
}

/** Runs `onComplete` (the actual `FormArray.removeAt`) only once the exit animation finishes. */
export function buildRowExitTimeline(row: HTMLElement, onComplete: () => void): gsap.core.Timeline {
  return gsap
    .timeline({ paused: true, onComplete })
    .to(row, { opacity: 0, height: 0, duration: ROW_EXIT_DURATION_S, ease: 'power2.in' });
}
```

## `src/app/features/wwell-planning/shared/dynamic-form/review-reveal.animation.ts`

```typescript
import gsap from 'gsap';

const REVEAL_STAGGER_S = 0.06;
const REVEAL_DURATION_S = 0.32;

/** Paused — caller decides when to play via `playIfMotionAllowed`. Plays once, on first arrival at the review step. */
export function buildReviewRevealTimeline(cards: readonly HTMLElement[]): gsap.core.Timeline {
  return gsap.timeline({ paused: true }).fromTo(
    cards,
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: REVEAL_DURATION_S, ease: 'power2.out', stagger: REVEAL_STAGGER_S },
  );
}
```

## `src/app/features/wwell-planning/shared/dynamic-form/step-transition.animation.ts`

```typescript
import gsap from 'gsap';

export type WwellStepDirection = 'forward' | 'backward';

const STEP_ENTER_DURATION_S = 0.32;
const STEP_SLIDE_PX = 24;

/** Fade + slide reveal for a stepper's active step content. Paused — caller decides when to play. */
export function buildStepTransitionTimeline(host: HTMLElement, direction: WwellStepDirection): gsap.core.Timeline {
  const offset = direction === 'forward' ? STEP_SLIDE_PX : -STEP_SLIDE_PX;

  return gsap
    .timeline({ paused: true })
    .fromTo(host, { opacity: 0, x: offset }, { opacity: 1, x: 0, duration: STEP_ENTER_DURATION_S, ease: 'power2.out' });
}
```

## `src/app/features/wwell-planning/shared/dynamic-form/wwell-dynamic-form.builder.spec.ts`

```typescript
import { FormArray, FormBuilder } from '@angular/forms';
import { addRepeatableRow, buildWwellDynamicForm } from './wwell-dynamic-form.builder';
import { WwellFormStepConfig } from './wwell-dynamic-form.types';

const fb = new FormBuilder();

const SCHEMA: readonly WwellFormStepConfig[] = [
  {
    key: 'reference',
    label: 'Reference',
    sections: [
      {
        key: 'main',
        title: null,
        fields: [
          { key: 'wellName', label: 'Well Name', type: 'text', validators: { required: true } },
          { key: 'targetDepthFt', label: 'Target Depth', type: 'number' },
        ],
      },
    ],
  },
  {
    key: 'subsurface',
    label: 'Subsurface',
    sections: [
      {
        key: 'casing',
        title: 'Casing',
        repeatable: {
          key: 'casing',
          addLabel: '+ Add Casing',
          minRows: 1,
          rowFields: [
            { key: 'type', label: 'Type', type: 'select' },
            { key: 'depthFtBgl', label: 'Depth', type: 'number' },
          ],
        },
      },
      {
        key: 'attachments',
        title: 'Attachments',
        fields: [{ key: 'locationMap', label: 'Location Map', type: 'file', validators: { required: true } }],
      },
    ],
  },
];

describe('buildWwellDynamicForm', () => {
  it('builds one nested FormGroup per step/section, keyed to match the schema', () => {
    const form = buildWwellDynamicForm(SCHEMA, fb);

    expect(form.get('reference.main.wellName')).toBeTruthy();
    expect(form.get('reference.main.targetDepthFt')).toBeTruthy();
    expect(form.get('subsurface.attachments.locationMap')).toBeTruthy();
  });

  it('wires required validators from field config', () => {
    const form = buildWwellDynamicForm(SCHEMA, fb);
    const wellName = form.get('reference.main.wellName');

    expect(wellName?.valid).toBe(false);
    wellName?.setValue('HAIL-500');
    expect(wellName?.valid).toBe(true);
  });

  it('treats an empty file list as failing a required file field', () => {
    const form = buildWwellDynamicForm(SCHEMA, fb);
    const locationMap = form.get('subsurface.attachments.locationMap');

    expect(locationMap?.value).toEqual([]);
    expect(locationMap?.hasError('required')).toBe(true);

    locationMap?.setValue([new File(['x'], 'map.pdf')]);
    expect(locationMap?.valid).toBe(true);
  });

  it('seeds a repeatable section with minRows rows, and addRepeatableRow appends more', () => {
    const form = buildWwellDynamicForm(SCHEMA, fb);
    const casingArray = form.get('subsurface.casing');

    expect(casingArray?.value).toHaveLength(1);

    const rowFields = SCHEMA[1].sections[0].repeatable!.rowFields;
    addRepeatableRow(form.get('subsurface.casing') as FormArray, rowFields, fb);

    expect(casingArray?.value).toHaveLength(2);
  });
});
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

function defaultValueFor(field: WwellFieldConfig): unknown {
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
}

export interface WwellFieldValidatorConfig {
  readonly required?: boolean;
  readonly pattern?: RegExp;
  readonly min?: number;
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
```

## `src/app/features/wwell-planning/shared/wwell-approvals/wwell-approval-timeline/wwell-approval-timeline.component.scss`

```scss
:host {
  display: block;
}

.approval-timeline {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.approval-timeline__header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.74rem;
  font-weight: 800;
  color: #1e293b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.approval-timeline__header-icon {
  display: inline-flex;
  color: #3b82f6;
}

.approval-timeline__rail {
  display: flex;
  align-items: flex-start;
  margin: 0;
  padding: 0.35rem 0 0;
  list-style: none;
}

.approval-timeline__item {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 0;

  &[data-status='approved'] {
    .approval-timeline__track::after {
      background: #22c55e;
    }

    .approval-timeline__node {
      background: #22c55e;
      border-color: #22c55e;
      color: #fff;
    }
  }

  &[data-status='in-progress'] .approval-timeline__node {
    background: #dbeafe;
    border-color: #3b82f6;
  }

  &[data-status='rejected'] .approval-timeline__node {
    background: #ef4444;
    border-color: #ef4444;
    color: #fff;
  }

  &:last-child .approval-timeline__track::after {
    display: none;
  }
}

.approval-timeline__track {
  position: relative;
  display: flex;
  justify-content: center;
  width: 100%;

  &::after {
    content: '';
    position: absolute;
    top: 13px;
    left: 50%;
    width: 100%;
    height: 2px;
    background: #e2e8f0;
    z-index: 0;
    transition: background 200ms ease;
  }
}

.approval-timeline__node {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #f8fafc;
  border: 2px solid #cbd5e1;
  color: #94a3b8;
  flex-shrink: 0;
  transition:
    background 200ms ease,
    border-color 200ms ease;
}

.approval-timeline__node-icon {
  width: 14px;
  height: 14px;
}

.approval-timeline__pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3b82f6;
  animation: approval-timeline-pulse 1.4s ease-in-out infinite;
}

@keyframes approval-timeline-pulse {
  0%,
  100% {
    transform: scale(0.85);
    opacity: 0.7;
  }
  50% {
    transform: scale(1.15);
    opacity: 1;
  }
}

.approval-timeline__card {
  margin-top: 0.6rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  text-align: center;
  padding: 0 6px;
  max-width: 150px;
}

.approval-timeline__role {
  font-size: 0.66rem;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.approval-timeline__name {
  font-size: 0.82rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
}

.approval-timeline__badge {
  display: inline-flex;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 0.66rem;
  font-weight: 700;
}

.approval-timeline__date {
  font-size: 0.7rem;
  color: #94a3b8;
}

/*
 * Stacked layout — shared by the explicit `orientation="vertical"` mode (e.g. the IR detail
 * sidebar) and the automatic narrow-viewport fallback for the default horizontal mode
 * (WLDA / Land-Affairs approval-table rows).
 */
@media (max-width: 720px) {
  .approval-timeline__rail {
    flex-direction: column;
    gap: 0;
  }

  .approval-timeline__item {
    flex-direction: row;
    align-items: stretch;
    gap: 0.85rem;
    padding-bottom: 1.25rem;

    &:last-child {
      padding-bottom: 0;
    }
  }

  .approval-timeline__track {
    width: auto;

    &::after {
      top: 28px;
      left: 13px;
      width: 2px;
      height: calc(100% - 14px);
    }
  }

  .approval-timeline__card {
    margin-top: 0;
    align-items: flex-start;
    text-align: left;
    max-width: none;
    padding: 2px 0 0;
  }
}

:host(.approval-timeline--vertical) {
  .approval-timeline__rail {
    flex-direction: column;
    gap: 0;
  }

  .approval-timeline__item {
    flex-direction: row;
    align-items: stretch;
    gap: 0.85rem;
    padding-bottom: 1.5rem;

    &:last-child {
      padding-bottom: 0;
    }
  }

  .approval-timeline__track {
    width: auto;

    &::after {
      top: 28px;
      left: 13px;
      width: 2px;
      height: calc(100% - 14px);
    }
  }

  .approval-timeline__card {
    margin-top: 0;
    align-items: flex-start;
    text-align: left;
    max-width: none;
    padding: 2px 0 0;
  }
}
```

## `src/app/features/wwell-planning/shared/wwell-approvals/wwell-approval-timeline/wwell-approval-timeline.component.ts`

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ApprovalChainStep } from '@models/wwell-planning/wwell-planning.model';
import { WWELL_APPROVAL_STEP_STATUS_META } from '../wwell-approvals.config';

export type WwellApprovalTimelineOrientation = 'horizontal' | 'vertical';

@Component({
  selector: 'app-wwell-approval-timeline',
  standalone: true,
  imports: [],
  templateUrl: './wwell-approval-timeline.component.html',
  styleUrl: './wwell-approval-timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.approval-timeline--vertical]': "orientation() === 'vertical'",
  },
})
export class WwellApprovalTimelineComponent {
  readonly reqNo = input<string | null>(null);
  readonly steps = input.required<readonly ApprovalChainStep[]>();
  /** 'horizontal' (default) preserves the existing WLDA/Land-Affairs approval-table look. */
  readonly orientation = input<WwellApprovalTimelineOrientation>('horizontal');

  protected readonly stepMeta = WWELL_APPROVAL_STEP_STATUS_META;
}
```

## `src/app/features/wwell-planning/shared/wwell-approvals/wwell-approvals.config.ts`

```typescript
import { ApprovalStepStatus, ApprovalWorkflowStatus } from '@models/wwell-planning/wwell-planning.model';
import { WWELL_STATUS_COLORS, WwellStatusMeta, wwellStatusMeta } from '../wwell-status.config';

export const WWELL_APPROVAL_STATUS_META: Record<ApprovalWorkflowStatus, WwellStatusMeta> = {
  'in-progress': wwellStatusMeta('In Progress', WWELL_STATUS_COLORS.blue),
  submitted: wwellStatusMeta('Submitted', WWELL_STATUS_COLORS.indigo),
  'in-review': wwellStatusMeta('In Review', WWELL_STATUS_COLORS.purple),
  approved: wwellStatusMeta('Approved', WWELL_STATUS_COLORS.green),
  rejected: wwellStatusMeta('Rejected', WWELL_STATUS_COLORS.red),
};

export const WWELL_APPROVAL_STEP_STATUS_META: Record<ApprovalStepStatus, WwellStatusMeta> = {
  approved: wwellStatusMeta('Approved', WWELL_STATUS_COLORS.green),
  'in-progress': wwellStatusMeta('In Progress', WWELL_STATUS_COLORS.blue),
  pending: wwellStatusMeta('Pending', WWELL_STATUS_COLORS.slateMuted),
  rejected: wwellStatusMeta('Rejected', WWELL_STATUS_COLORS.red),
};

export const WWELL_WLDA_CHAIN_ROLES: readonly string[] = [
  'Hydrogeologist',
  'Field Supervisor',
  'Dept. Manager',
  'SAP / Upper Mgmt',
];

export const WWELL_LAND_AFFAIRS_CHAIN_ROLES: readonly string[] = ['Land Surveyor', 'Land Affairs Officer', 'Manager'];

export const WWELL_IR_CHAIN_ROLES: readonly string[] = ['Hydrogeologist', 'Lead Hydrogeologist', 'Manager'];

/** 4 letters + dash + a 2-4 digit "hundreds" suffix, e.g. KHAJ-300, RXYD-100. */
export const WWELL_APPROVAL_WELL_NAME_PATTERN = /^[A-Za-z]{4}-\d{2,4}$/;

/** Free-form "24.1751°N, 47.2951°E" style pair; hemisphere letters are optional. */
export const WWELL_APPROVAL_COORDINATES_PATTERN =
  /^\s*-?\d{1,3}(\.\d+)?\s*°?\s*[NnSs]?\s*,\s*-?\d{1,3}(\.\d+)?\s*°?\s*[EeWw]?\s*$/;
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

export const WWELL_TEST_TYPE_OPTIONS: readonly { value: 'flow-test' | 'pump-test'; label: string }[] = [
  { value: 'flow-test', label: 'Flow Test' },
  { value: 'pump-test', label: 'Pump Test' },
];
```

## `src/app/features/wwell-planning/store/wwell-planning.state.ts`

```typescript
import {
  IntegratedRequirement,
  LandAffairsApproval,
  WldaApproval,
  WwellPlanningRequest,
} from '@models/wwell-planning/wwell-planning.model';

export interface WwellPlanningStoreState {
  readonly requests: WwellPlanningRequest[];
  readonly wldaApprovals: WldaApproval[];
  readonly landAffairsApprovals: LandAffairsApproval[];
  readonly integratedRequirements: IntegratedRequirement[];
  readonly requestsLoading: boolean;
  readonly approvalsLoading: boolean;
  readonly integratedRequirementsLoading: boolean;
  readonly creatingRequest: boolean;
  readonly creatingIntegratedRequirement: boolean;
  readonly creatingApproval: boolean;
  readonly updatingIntegratedRequirementStatus: boolean;
  /**
   * One error slot per async operation instead of a single shared `error` field — each
   * operation must only ever read/write its own slot, so an unrelated failure (or a
   * successful, unrelated operation starting) can never silently clear or overwrite a
   * still-relevant error from a different operation.
   */
  readonly requestsError: string | null;
  readonly approvalsError: string | null;
  readonly integratedRequirementsError: string | null;
  readonly createRequestError: string | null;
  readonly createIntegratedRequirementError: string | null;
  readonly createApprovalError: string | null;
  readonly updateIntegratedRequirementStatusError: string | null;
}

export const initialWwellPlanningState: WwellPlanningStoreState = {
  requests: [],
  wldaApprovals: [],
  landAffairsApprovals: [],
  integratedRequirements: [],
  requestsLoading: false,
  approvalsLoading: false,
  integratedRequirementsLoading: false,
  creatingRequest: false,
  creatingIntegratedRequirement: false,
  creatingApproval: false,
  updatingIntegratedRequirementStatus: false,
  requestsError: null,
  approvalsError: null,
  integratedRequirementsError: null,
  createRequestError: null,
  createIntegratedRequirementError: null,
  createApprovalError: null,
  updateIntegratedRequirementStatusError: null,
};
```

## `src/app/features/wwell-planning/store/wwell-planning.store.spec.ts`

```typescript
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { CreateIntegratedRequirementPayload, IntegratedRequirement } from '@models/wwell-planning/wwell-planning.model';
import { WwellPlanningService } from '../wwell-planning.service';
import { WwellPlanningStore } from './wwell-planning.store';

const serviceMock = {
  createIntegratedRequirement: jest.fn(),
};

function buildPayload(): CreateIntegratedRequirementPayload {
  return {
    status: 'in-progress',
    requestReference: {
      linkedRequestId: null,
      client: 'BI-12',
      supportingBusiness: 'Agriculture',
      wellName: 'HAIL-500',
      targetAquifer: 'Saq',
      targetDepthFt: 510,
      surfaceElevationFtAsl: 980,
      coordinates: '27.5114°N, 41.7208°E',
    },
    formationTops: [],
    casing: [],
    programDetails: {
      completion: 'Screened',
      acidization: '',
      transmission: '',
      developmentTesting: { logging: '', mudLogging: '', sampling: '', flowTest: '' },
    },
    contacts: { geologistPrimary: 'Eng. A. Al-Mutairi', geologistSecondary: null },
    offsetWells: [],
    offsetWellsRemarks: null,
    hydrogeology: { aquifer: 'Saq', estimatedTdsPpm: 1200, h2sPpm: 5, estimatedPumpDepthFt: 150 },
    testProgram: { testType: 'pump-test', estimatedRateGpm: 350, estimatedWaterLevelFt: 95 },
  };
}

function buildCreated(): IntegratedRequirement {
  return {
    id: 'IR-26-999',
    code: 'IR-26-999',
    updatedDate: '2026-08-04',
    attachmentNames: [],
    chain: [],
    ...buildPayload(),
  };
}

describe('WwellPlanningStore - createIntegratedRequirement', () => {
  let store: InstanceType<typeof WwellPlanningStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [WwellPlanningStore, { provide: WwellPlanningService, useValue: serviceMock }],
    });
    store = TestBed.inject(WwellPlanningStore);
  });

  it('passes files through to the service and prepends the created row on success', () => {
    const created = buildCreated();
    const files = [new File(['x'], 'map.pdf')];
    serviceMock.createIntegratedRequirement.mockReturnValue(of(created));

    store.createIntegratedRequirement(buildPayload(), files);

    expect(serviceMock.createIntegratedRequirement).toHaveBeenCalledWith(buildPayload(), files);
    expect(store.integratedRequirements()).toEqual([created]);
    expect(store.creatingIntegratedRequirement()).toBe(false);
    expect(store.createIntegratedRequirementError()).toBeNull();
  });

  it('defaults files to an empty array when omitted', () => {
    serviceMock.createIntegratedRequirement.mockReturnValue(of(buildCreated()));

    store.createIntegratedRequirement(buildPayload());

    expect(serviceMock.createIntegratedRequirement).toHaveBeenCalledWith(buildPayload(), []);
  });

  it('sets createIntegratedRequirementError on failure and clears the creating flag', () => {
    serviceMock.createIntegratedRequirement.mockReturnValue(throwError(() => new Error('Network down')));

    store.createIntegratedRequirement(buildPayload());

    expect(store.creatingIntegratedRequirement()).toBe(false);
    expect(store.createIntegratedRequirementError()).toBe('Network down');
  });
});
```

## `src/app/features/wwell-planning/store/wwell-planning.store.ts`

```typescript
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { pipe, switchMap, tap } from 'rxjs';
import {
  CreateIntegratedRequirementPayload,
  CreateLandAffairsApprovalPayload,
  CreateWldaApprovalPayload,
  CreateWwellPlanningRequestPayload,
  IntegratedRequirement,
} from '@models/wwell-planning/wwell-planning.model';
import { WwellPlanningService } from '../wwell-planning.service';
import { WwellPlanningStoreState, initialWwellPlanningState } from './wwell-planning.state';

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export const WwellPlanningStore = signalStore(
  withState<WwellPlanningStoreState>(initialWwellPlanningState),

  withComputed(
    ({
      requestsLoading,
      approvalsLoading,
      integratedRequirementsLoading,
      requestsError,
      approvalsError,
      integratedRequirementsError,
      createRequestError,
      createIntegratedRequirementError,
      createApprovalError,
      updateIntegratedRequirementStatusError,
    }) => ({
      isLoading: computed(() => requestsLoading() || approvalsLoading() || integratedRequirementsLoading()),
      activeErrors: computed(() =>
        [
          requestsError(),
          approvalsError(),
          integratedRequirementsError(),
          createRequestError(),
          createIntegratedRequirementError(),
          createApprovalError(),
          updateIntegratedRequirementStatusError(),
        ].filter((message): message is string => message !== null),
      ),
      hasError: computed(
        () =>
          requestsError() !== null ||
          approvalsError() !== null ||
          integratedRequirementsError() !== null ||
          createRequestError() !== null ||
          createIntegratedRequirementError() !== null ||
          createApprovalError() !== null ||
          updateIntegratedRequirementStatusError() !== null,
      ),
    }),
  ),

  withMethods((store, svc = inject(WwellPlanningService)) => {
    const loadRequests = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { requestsLoading: true, requestsError: null })),
        switchMap(() =>
          svc.getRequests().pipe(
            tapResponse({
              next: requests => patchState(store, { requests, requestsLoading: false }),
              error: (err: unknown) =>
                patchState(store, { requestsLoading: false, requestsError: errorMessage(err, 'Failed to load requests') }),
            }),
          ),
        ),
      ),
    );

    const loadWldaApprovals = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { approvalsLoading: true, approvalsError: null })),
        switchMap(() =>
          svc.getWldaApprovals().pipe(
            tapResponse({
              next: wldaApprovals => patchState(store, { wldaApprovals, approvalsLoading: false }),
              error: (err: unknown) =>
                patchState(store, {
                  approvalsLoading: false,
                  approvalsError: errorMessage(err, 'Failed to load WLDA approvals'),
                }),
            }),
          ),
        ),
      ),
    );

    const loadLandAffairsApprovals = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { approvalsLoading: true, approvalsError: null })),
        switchMap(() =>
          svc.getLandAffairsApprovals().pipe(
            tapResponse({
              next: landAffairsApprovals => patchState(store, { landAffairsApprovals, approvalsLoading: false }),
              error: (err: unknown) =>
                patchState(store, {
                  approvalsLoading: false,
                  approvalsError: errorMessage(err, 'Failed to load Land Affairs approvals'),
                }),
            }),
          ),
        ),
      ),
    );

    const loadIntegratedRequirements = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { integratedRequirementsLoading: true, integratedRequirementsError: null })),
        switchMap(() =>
          svc.getIntegratedRequirements().pipe(
            tapResponse({
              next: integratedRequirements => patchState(store, { integratedRequirements, integratedRequirementsLoading: false }),
              error: (err: unknown) =>
                patchState(store, {
                  integratedRequirementsLoading: false,
                  integratedRequirementsError: errorMessage(err, 'Failed to load integrated requirements'),
                }),
            }),
          ),
        ),
      ),
    );

    return {
      loadRequests(): void {
        loadRequests();
      },

      loadWldaApprovals(): void {
        loadWldaApprovals();
      },

      loadLandAffairsApprovals(): void {
        loadLandAffairsApprovals();
      },

      loadIntegratedRequirements(): void {
        loadIntegratedRequirements();
      },

      createRequest(payload: CreateWwellPlanningRequestPayload, files: readonly File[] = []): void {
        patchState(store, { creatingRequest: true, createRequestError: null });
        svc.createRequest(payload, files).subscribe({
          next: created =>
            patchState(store, {
              requests: [created, ...store.requests()],
              creatingRequest: false,
            }),
          error: (err: unknown) =>
            patchState(store, { creatingRequest: false, createRequestError: errorMessage(err, 'Failed to create request') }),
        });
      },

      createIntegratedRequirement(payload: CreateIntegratedRequirementPayload, files: readonly File[] = []): void {
        patchState(store, { creatingIntegratedRequirement: true, createIntegratedRequirementError: null });
        svc.createIntegratedRequirement(payload, files).subscribe({
          next: created =>
            patchState(store, {
              integratedRequirements: [created, ...store.integratedRequirements()],
              creatingIntegratedRequirement: false,
            }),
          error: (err: unknown) =>
            patchState(store, {
              creatingIntegratedRequirement: false,
              createIntegratedRequirementError: errorMessage(err, 'Failed to create integrated requirement'),
            }),
        });
      },

      submitWldaApproval(payload: CreateWldaApprovalPayload, files: readonly File[] = []): void {
        patchState(store, { creatingApproval: true, createApprovalError: null });
        svc.createWldaApproval(payload, files).subscribe({
          next: created =>
            patchState(store, {
              wldaApprovals: [created, ...store.wldaApprovals()],
              creatingApproval: false,
            }),
          error: (err: unknown) =>
            patchState(store, {
              creatingApproval: false,
              createApprovalError: errorMessage(err, 'Failed to submit WLDA approval request'),
            }),
        });
      },

      submitIntegratedRequirementForReview(ir: IntegratedRequirement): void {
        patchState(store, { updatingIntegratedRequirementStatus: true, updateIntegratedRequirementStatusError: null });
        svc.submitIntegratedRequirementForReview(ir).subscribe({
          next: updated =>
            patchState(store, {
              integratedRequirements: store.integratedRequirements().map(item => (item.id === updated.id ? updated : item)),
              updatingIntegratedRequirementStatus: false,
            }),
          error: (err: unknown) =>
            patchState(store, {
              updatingIntegratedRequirementStatus: false,
              updateIntegratedRequirementStatusError: errorMessage(err, 'Failed to submit integrated requirement for review'),
            }),
        });
      },

      submitLandAffairsApproval(payload: CreateLandAffairsApprovalPayload, files: readonly File[] = []): void {
        patchState(store, { creatingApproval: true, createApprovalError: null });
        svc.createLandAffairsApproval(payload, files).subscribe({
          next: created =>
            patchState(store, {
              landAffairsApprovals: [created, ...store.landAffairsApprovals()],
              creatingApproval: false,
            }),
          error: (err: unknown) =>
            patchState(store, {
              creatingApproval: false,
              createApprovalError: errorMessage(err, 'Failed to submit Land Affairs approval request'),
            }),
        });
      },
    };
  }),
);
```

## `src/app/features/wwell-planning/wwell-ir/wwell-ir-design-preview/wwell-ir-design-preview.component.html`

```html
<figure class="preview">
  <svg [attr.viewBox]="viewBox" class="preview__svg" role="img" aria-label="Well design schematic">
    <line class="preview__surface-line" x1="0" [attr.y1]="surfaceY" x2="260" [attr.y2]="surfaceY" />
    @if (surfaceElevationFtAsl() !== null) {
      <text class="preview__surface-label" x="4" [attr.y]="surfaceY - 8">Surface {{ surfaceElevationFtAsl() }} ft ASL</text>
    }

    <line
      class="preview__centerline"
      [attr.x1]="centerX"
      [attr.y1]="surfaceY"
      [attr.x2]="centerX"
      [attr.y2]="surfaceY + 320"
    />

    @for (band of formationLines(); track band.name + band.depthFt) {
      <line class="preview__formation-line" x1="0" [attr.y1]="band.y" x2="260" [attr.y2]="band.y" />
      <text class="preview__formation-label" x="4" [attr.y]="band.y - 5">{{ band.name }} &mdash; {{ band.depthFt }} ft</text>
    }

    @for (shape of casingShapes(); track shape.type + shape.depthFtBgl) {
      <path class="preview__casing" [attr.d]="shape.path" [attr.fill]="shape.fill" />
      <text class="preview__casing-label" [attr.x]="centerX + 4" [attr.y]="shape.labelY - 4">
        {{ shape.type }} {{ shape.sizeIn }}
      </text>
      @if (shape.remarks) {
        <text class="preview__casing-remarks" [attr.x]="centerX + 4" [attr.y]="shape.labelY + 10">{{ shape.remarks }}</text>
      }
    }
  </svg>

  @if (!casing().length && !formationTops().length) {
    <figcaption class="preview__empty">No casing or formation data yet.</figcaption>
  }
</figure>
```

## `src/app/features/wwell-planning/wwell-ir/wwell-ir-design-preview/wwell-ir-design-preview.component.scss`

```scss
$navy: #1e293b;
$muted: #64748b;
$border: #e2e8f0;

:host {
  display: block;
}

.preview {
  margin: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f8fafc;
  border: 1px solid $border;
  border-radius: 12px;
}

.preview__svg {
  width: 100%;
  max-width: 320px;
  height: auto;
}

.preview__surface-line {
  stroke: $navy;
  stroke-width: 1.5;
}

.preview__surface-label {
  font-size: 8px;
  font-weight: 700;
  fill: $navy;
}

.preview__centerline {
  stroke: $border;
  stroke-width: 1;
  stroke-dasharray: 2 3;
}

.preview__formation-line {
  stroke: #cbd5e1;
  stroke-width: 1;
  stroke-dasharray: 3 3;
}

.preview__formation-label {
  font-size: 7px;
  font-weight: 600;
  fill: $muted;
}

.preview__casing {
  stroke: $navy;
  stroke-width: 1;
  opacity: 0.92;
}

.preview__casing-label {
  font-size: 7.5px;
  font-weight: 700;
  fill: $navy;
}

.preview__casing-remarks {
  font-size: 6.5px;
  font-style: italic;
  fill: $muted;
}

.preview__empty {
  font-size: 0.78rem;
  color: $muted;
}
```

## `src/app/features/wwell-planning/wwell-ir/wwell-ir-design-preview/wwell-ir-design-preview.component.ts`

```typescript
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  IntegratedRequirementCasingRow,
  IntegratedRequirementFormationTop,
} from '@models/wwell-planning/wwell-planning.model';
import { buildCasingPath, computeCasingHalfWidth, createDepthScale } from '@shared/utils/wellbore-math.util';

interface CasingShape {
  readonly type: string;
  readonly sizeIn: string;
  readonly remarks: string | null;
  readonly depthFtBgl: number;
  readonly path: string;
  readonly fill: string;
  readonly labelY: number;
}

interface FormationLine {
  readonly name: string;
  readonly depthFt: number;
  readonly y: number;
}

const VIEW_WIDTH = 260;
const DRAWING_HEIGHT = 340;
const TOP_MARGIN = 24;
const BOTTOM_MARGIN = 20;
const BASE_HALF_WIDTH = 12;
const HALF_WIDTH_INCREMENT = 16;
const SHOE_CURVE_OFFSET = 10;
const CENTER_X = VIEW_WIDTH / 2;
// Darkest (deepest/narrowest, e.g. Production) first, lightest (shallowest/widest, e.g. Conductor) last.
const CASING_FILL_PALETTE: readonly string[] = ['#1d4ed8', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];

/**
 * Read-only well-bore schematic for the IR detail view. Deliberately NOT built on the
 * heavier `presentation/well-bore-view` renderer system — that one does imperative D3 DOM
 * manipulation (hover tooltips, actual-vs-planned overlays, liners/gravel packs) tuned for a
 * full engineering wellbore design view. Per CLAUDE.md, D3 here is used only for the depth
 * scale/half-width math (reused from the same `wellbore-math.util` this repo already has);
 * the actual rendering is plain Angular template bindings driven by computed signals.
 */
@Component({
  selector: 'app-wwell-ir-design-preview',
  standalone: true,
  imports: [],
  templateUrl: './wwell-ir-design-preview.component.html',
  styleUrl: './wwell-ir-design-preview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrDesignPreviewComponent {
  readonly formationTops = input.required<readonly IntegratedRequirementFormationTop[]>();
  readonly casing = input.required<readonly IntegratedRequirementCasingRow[]>();
  readonly surfaceElevationFtAsl = input<number | null>(null);
  readonly targetDepthFt = input<number>(0);

  protected readonly centerX = CENTER_X;
  protected readonly surfaceY = TOP_MARGIN;
  protected readonly viewBox = `0 0 ${VIEW_WIDTH} ${DRAWING_HEIGHT + TOP_MARGIN + BOTTOM_MARGIN}`;

  private readonly maxDepthFt = computed(() => {
    const depths = [this.targetDepthFt(), ...this.casing().map(row => row.depthFtBgl), ...this.formationTops().map(top => top.depthFt)].filter(
      (value): value is number => typeof value === 'number' && value > 0,
    );
    return depths.length ? Math.max(...depths) : 1;
  });

  private readonly depthScale = computed(() => createDepthScale(this.maxDepthFt(), DRAWING_HEIGHT));

  protected readonly casingShapes = computed<readonly CasingShape[]>(() => {
    const scale = this.depthScale();
    // Tiered deepest-first, matching this repo's established convention (see wellbore-math.util's
    // computeCasingHalfWidth): tier 0 = deepest string = narrowest.
    const byDepthDesc = [...this.casing()].sort((a, b) => b.depthFtBgl - a.depthFtBgl);

    const shapes = byDepthDesc.map((row, tier) => {
      const halfWidth = computeCasingHalfWidth(tier, BASE_HALF_WIDTH, HALF_WIDTH_INCREMENT);
      const bottomPx = TOP_MARGIN + scale(row.depthFtBgl);
      return {
        type: row.type,
        sizeIn: row.sizeIn,
        remarks: row.remarks,
        depthFtBgl: row.depthFtBgl,
        path: buildCasingPath(CENTER_X, halfWidth, TOP_MARGIN, bottomPx, SHOE_CURVE_OFFSET),
        fill: CASING_FILL_PALETTE[Math.min(tier, CASING_FILL_PALETTE.length - 1)],
        labelY: bottomPx,
      };
    });

    // Paint shallow/wide first, then deep/narrow on top, so telescoping strings read correctly.
    return [...shapes].reverse();
  });

  protected readonly formationLines = computed<readonly FormationLine[]>(() => {
    const scale = this.depthScale();
    return [...this.formationTops()]
      .sort((a, b) => a.depthFt - b.depthFt)
      .map(top => ({ name: top.name, depthFt: top.depthFt, y: TOP_MARGIN + scale(top.depthFt) }));
  });
}
```

## `src/app/features/wwell-planning/wwell-ir/wwell-ir-detail/wwell-ir-detail.component.html`

```html
<div class="ird">
  <header class="ird__header">
    <div class="ird__heading">
      <p class="ird__eyebrow">{{ ir().code }}</p>
      <h2 class="ird__title">{{ ir().requestReference.wellName }}</h2>
      <p class="ird__subtitle">
        ID# {{ ir().code }}
        @if (ir().requestReference.linkedRequestId) {
          &middot; Request# {{ ir().requestReference.linkedRequestId }}
        }
      </p>
    </div>

    <span class="ird__badge" [style.background]="statusMeta[ir().status].bg" [style.color]="statusMeta[ir().status].color">
      <span class="ird__badge-dot" [style.background]="statusMeta[ir().status].dot"></span>
      {{ statusMeta[ir().status].label }}
    </span>
  </header>

  <div class="ird__body">
    <div class="ird__main">
      <div class="ird__stats">
        <div class="ird__stat ird__stat--depth">
          <mat-icon class="ird__stat-icon">straighten</mat-icon>
          <div class="ird__stat-text">
            <span class="ird__stat-label">Target Depth</span>
            <span class="ird__stat-value">{{ ir().requestReference.targetDepthFt }}<small>ft</small></span>
          </div>
        </div>
        <div class="ird__stat ird__stat--rate">
          <mat-icon class="ird__stat-icon">speed</mat-icon>
          <div class="ird__stat-text">
            <span class="ird__stat-label">Estimated Rate</span>
            <span class="ird__stat-value">{{ ir().testProgram.estimatedRateGpm ?? '—' }}<small>GPM</small></span>
          </div>
        </div>
        <div class="ird__stat ird__stat--tds">
          <mat-icon class="ird__stat-icon">opacity</mat-icon>
          <div class="ird__stat-text">
            <span class="ird__stat-label">Estimated TDS</span>
            <span class="ird__stat-value">{{ ir().hydrogeology.estimatedTdsPpm ?? '—' }}<small>ppm</small></span>
          </div>
        </div>
        <div class="ird__stat ird__stat--h2s">
          <mat-icon class="ird__stat-icon">warning</mat-icon>
          <div class="ird__stat-text">
            <span class="ird__stat-label">H2S</span>
            <span class="ird__stat-value">{{ ir().hydrogeology.h2sPpm ?? '—' }}<small>ppm</small></span>
          </div>
        </div>
        <div class="ird__stat ird__stat--offset">
          <mat-icon class="ird__stat-icon">radar</mat-icon>
          <div class="ird__stat-text">
            <span class="ird__stat-label">Offset Wells</span>
            <span class="ird__stat-value">{{ ir().offsetWells.length }}</span>
          </div>
        </div>
      </div>

      <section class="ird__card">
        <h3 class="ird__card-title"><mat-icon class="ird__card-icon">info</mat-icon>General Information</h3>
        <dl class="ird__kv-grid ird__kv-grid--wide">
          <div class="ird__kv"><dt>ID#</dt><dd>{{ ir().code }}</dd></div>
          <div class="ird__kv"><dt>Letter#</dt><dd>{{ ir().requestReference.linkedRequestId || '—' }}</dd></div>
          <div class="ird__kv"><dt>Water Well Name</dt><dd>{{ ir().requestReference.wellName }}</dd></div>
          <div class="ird__kv"><dt>Client</dt><dd>{{ ir().requestReference.client }}</dd></div>
          <div class="ird__kv"><dt>Coordinates</dt><dd>{{ ir().requestReference.coordinates }}</dd></div>
          <div class="ird__kv"><dt>Supporting Business</dt><dd>{{ ir().requestReference.supportingBusiness }}</dd></div>
          <div class="ird__kv">
            <dt>Surface Elevation</dt>
            <dd>{{ ir().requestReference.surfaceElevationFtAsl ?? '—' }} ft ASL</dd>
          </div>
          <div class="ird__kv"><dt>Target Aquifer</dt><dd>{{ ir().requestReference.targetAquifer }}</dd></div>
          <div class="ird__kv"><dt>Target Depth</dt><dd>{{ ir().requestReference.targetDepthFt }} ft</dd></div>
          <div class="ird__kv"><dt>Last Updated</dt><dd>{{ ir().updatedDate }}</dd></div>
        </dl>
      </section>

      <section class="ird__card">
        <h3 class="ird__card-title"><mat-icon class="ird__card-icon">architecture</mat-icon>Wellbore Design</h3>
        <div class="ird__wellbore">
          <div class="ird__wellbore-preview">
            <app-wwell-ir-design-preview
              [formationTops]="ir().formationTops"
              [casing]="ir().casing"
              [surfaceElevationFtAsl]="ir().requestReference.surfaceElevationFtAsl"
              [targetDepthFt]="ir().requestReference.targetDepthFt"
            />
          </div>

          <div class="ird__wellbore-tables">
            <div class="ird__subsection">
              <h4 class="ird__subsection-title">Formation Tops</h4>
              <div class="ird__table-wrap">
                <table class="ird__table">
                  <thead>
                    <tr>
                      <th>Formation</th>
                      <th>Depth (ft bgl)</th>
                      <th>Sub-sea (ft asl)</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (top of ir().formationTops; track top.name) {
                      <tr>
                        <td>{{ top.name }}</td>
                        <td>{{ top.depthFt }}</td>
                        <td>{{ subSeaFt(top.depthFt) ?? '—' }}</td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="3" class="ird__table-empty">No formation tops recorded.</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <div class="ird__subsection">
              <h4 class="ird__subsection-title">Casing</h4>
              <div class="ird__table-wrap">
                <table class="ird__table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Size</th>
                      <th>Depth (ft bgl)</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of ir().casing; track row.type + row.depthFtBgl) {
                      <tr>
                        <td>{{ row.type }}</td>
                        <td>{{ row.sizeIn }}</td>
                        <td>{{ row.depthFtBgl }}</td>
                        <td>{{ row.remarks || '—' }}</td>
                      </tr>
                    } @empty {
                      <tr>
                        <td colspan="4" class="ird__table-empty">No casing recorded.</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div class="ird__pair">
        <section class="ird__card">
          <h3 class="ird__card-title"><mat-icon class="ird__card-icon">science</mat-icon>Program &amp; Hydrogeology</h3>

          <div class="ird__subsection">
            <h4 class="ird__subsection-title">Program Details</h4>
            <dl class="ird__kv-grid">
              <div class="ird__kv"><dt>Completion</dt><dd>{{ ir().programDetails.completion }}</dd></div>
              <div class="ird__kv"><dt>Logging</dt><dd>{{ ir().programDetails.developmentTesting.logging || '—' }}</dd></div>
              <div class="ird__kv"><dt>Acidization</dt><dd>{{ ir().programDetails.acidization || '—' }}</dd></div>
              <div class="ird__kv">
                <dt>Mud Logging</dt>
                <dd>{{ ir().programDetails.developmentTesting.mudLogging || '—' }}</dd>
              </div>
              <div class="ird__kv"><dt>Transmission</dt><dd>{{ ir().programDetails.transmission || '—' }}</dd></div>
              <div class="ird__kv"><dt>Sampling</dt><dd>{{ ir().programDetails.developmentTesting.sampling || '—' }}</dd></div>
              <div class="ird__kv"><dt>Flow Test</dt><dd>{{ ir().programDetails.developmentTesting.flowTest || '—' }}</dd></div>
            </dl>
          </div>

          <div class="ird__subsection">
            <h4 class="ird__subsection-title">Estimated Hydrogeology</h4>
            <dl class="ird__kv-grid">
              <div class="ird__kv"><dt>Aquifer</dt><dd>{{ ir().hydrogeology.aquifer }}</dd></div>
              <div class="ird__kv">
                <dt>Test Type</dt>
                <dd>{{ ir().testProgram.testType === 'pump-test' ? 'Pump Test' : 'Flow Test' }}</dd>
              </div>
              <div class="ird__kv"><dt>Estimated TDS</dt><dd>{{ ir().hydrogeology.estimatedTdsPpm ?? '—' }} ppm</dd></div>
              <div class="ird__kv"><dt>Estimated Rate</dt><dd>{{ ir().testProgram.estimatedRateGpm ?? '—' }} GPM</dd></div>
              <div class="ird__kv"><dt>H2S</dt><dd>{{ ir().hydrogeology.h2sPpm ?? '—' }} ppm</dd></div>
              <div class="ird__kv">
                <dt>Estimated Water Level</dt>
                <dd>{{ ir().testProgram.estimatedWaterLevelFt ?? '—' }} ft</dd>
              </div>
              <div class="ird__kv">
                <dt>Estimated Pump Depth</dt>
                <dd>{{ ir().hydrogeology.estimatedPumpDepthFt ?? '—' }} ft</dd>
              </div>
            </dl>
          </div>
        </section>

        <section class="ird__card">
          <h3 class="ird__card-title"><mat-icon class="ird__card-icon">badge</mat-icon>Contacts &amp; Attachments</h3>

          <div class="ird__subsection">
            <h4 class="ird__subsection-title">Geologist Contact</h4>
            <dl class="ird__kv-grid">
              <div class="ird__kv"><dt>Primary</dt><dd>{{ ir().contacts.geologistPrimary }}</dd></div>
              <div class="ird__kv"><dt>Secondary</dt><dd>{{ ir().contacts.geologistSecondary || '—' }}</dd></div>
            </dl>
          </div>

          <div class="ird__subsection">
            <h4 class="ird__subsection-title">Attachments</h4>
            @if (ir().attachmentNames.length) {
              <ul class="ird__attachments">
                @for (name of ir().attachmentNames; track name) {
                  <li class="ird__attachment">
                    <mat-icon>attach_file</mat-icon>
                    {{ name }}
                  </li>
                }
              </ul>
            } @else {
              <p class="ird__empty-text">No attachments uploaded.</p>
            }
          </div>
        </section>
      </div>

      <section class="ird__card">
        <h3 class="ird__card-title"><mat-icon class="ird__card-icon">share_location</mat-icon>Offset Water Wells</h3>
        <div class="ird__table-wrap">
          <table class="ird__table ird__table--wide">
            <thead>
              <tr>
                <th>Well</th>
                <th>Dist (km)</th>
                <th>Location</th>
                <th>Aquifer</th>
                <th>TD (ft)</th>
                <th>Dur (min)</th>
                <th>Rate (GPM)</th>
                <th>RPM</th>
                <th>SWL (ft)</th>
                <th>PWL (ft)</th>
                <th>DD (ft)</th>
                <th>Spec Cap</th>
                <th>TDS (ppm)</th>
                <th>H2S (ppm)</th>
              </tr>
            </thead>
            <tbody>
              @for (well of ir().offsetWells; track well.wellName) {
                <tr>
                  <td>{{ well.wellName }}</td>
                  <td>{{ well.distanceKm ?? '—' }}</td>
                  <td>{{ well.location || '—' }}</td>
                  <td>{{ well.aquifer || '—' }}</td>
                  <td>{{ well.totalDepthFt ?? '—' }}</td>
                  <td>{{ well.testDurationMin ?? '—' }}</td>
                  <td>{{ well.rateGpm ?? '—' }}</td>
                  <td>{{ well.rpm ?? '—' }}</td>
                  <td>{{ well.swlFt ?? '—' }}</td>
                  <td>{{ well.pwlFt ?? '—' }}</td>
                  <td>{{ well.drawdownFt ?? '—' }}</td>
                  <td>{{ well.specificCapacity ?? '—' }}</td>
                  <td>{{ well.tdsPpm ?? '—' }}</td>
                  <td>{{ well.h2sPpm ?? '—' }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="14" class="ird__table-empty">No offset wells recorded.</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        @if (ir().offsetWellsRemarks) {
          <p class="ird__remarks">{{ ir().offsetWellsRemarks }}</p>
        }
      </section>
    </div>

    <aside class="ird__sidebar">
      <section class="ird__card">
        <app-wwell-approval-timeline [reqNo]="ir().code" [steps]="ir().chain" orientation="vertical" />
      </section>

      @if (canSubmitForReview()) {
        <button
          type="button"
          mat-flat-button
          color="primary"
          class="ird__submit-btn"
          [disabled]="submitting()"
          (click)="submitForReview.emit(ir())"
        >
          <mat-icon>send</mat-icon>
          {{ submitting() ? 'Submitting…' : 'Submit for Review' }}
        </button>
      }
    </aside>
  </div>
</div>
```

## `src/app/features/wwell-planning/wwell-ir/wwell-ir-detail/wwell-ir-detail.component.scss`

```scss
$navy: #1e293b;
$muted: #64748b;
$border: #e2e8f0;
$accent: #3b82f6;

$stat-depth: #3b82f6;
$stat-rate: #0891b2;
$stat-tds: #d97706;
$stat-h2s: #dc2626;
$stat-offset: #7c3aed;

:host {
  display: block;
}

.ird {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Header ───────────────────────────────────────────────────── */
.ird__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding-bottom: 1rem;
  border-bottom: 1px solid $border;
}

.ird__eyebrow {
  margin: 0;
  font-size: 0.72rem;
  font-weight: 800;
  color: $accent;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.ird__title {
  margin: 0.15rem 0 0;
  font-size: 1.4rem;
  font-weight: 800;
  color: $navy;
  letter-spacing: -0.01em;
}

.ird__subtitle {
  margin: 0.2rem 0 0;
  font-size: 0.8rem;
  color: $muted;
}

.ird__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 14px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 700;
  white-space: nowrap;
}

.ird__badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ── Body: card column + sticky approval sidebar ─────────────────
 * The sidebar sticks to the top of whatever ancestor actually scrolls
 * (`.wwell-ir__detail` in the host page) so the approval status is visible
 * without scrolling through every card first.
 */
.ird__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 260px;
  align-items: start;
  gap: 1.75rem;
}

.ird__sidebar {
  position: sticky;
  top: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ird__submit-btn {
  width: 100%;
  justify-content: center;
  gap: 6px;
  font-weight: 700;

  mat-icon {
    width: 18px;
    height: 18px;
    font-size: 18px;
  }
}

/*
 * ── Card column ──────────────────────────────────────────────────
 * Deliberately a vertical stack, not an auto-fit grid. Auto-fit packed
 * cards into whatever column count the viewport happened to produce,
 * which paired unrelated cards by coincidence and left ragged empty
 * space next to short ones (grid has no masonry). Related content is
 * now merged into single cards (Wellbore Design; the Program/Contacts
 * pair below) so every section gets the width it actually needs.
 */
.ird__main {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
}

.ird__pair {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  align-items: start;
  gap: 1.1rem;
}

.ird__card {
  background: #ffffff;
  border: 1px solid $border;
  border-radius: 14px;
  padding: 1.1rem 1.25rem;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
}

.ird__card-title {
  margin: 0 0 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.72rem;
  font-weight: 800;
  color: $navy;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.ird__card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 7px;
  background: rgba($accent, 0.1);
  color: $accent;
  flex-shrink: 0;

  &.mat-icon {
    width: 24px;
    height: 24px;
    font-size: 15px;
  }
}

/* ── Subsections within a merged card ─────────────────────────── */
.ird__subsection + .ird__subsection {
  margin-top: 1.1rem;
  padding-top: 1.1rem;
  border-top: 1px dashed $border;
}

.ird__subsection-title {
  margin: 0 0 0.65rem;
  font-size: 0.68rem;
  font-weight: 800;
  color: $muted;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── Wellbore Design: schematic beside its data tables ───────────── */
.ird__wellbore {
  display: grid;
  grid-template-columns: minmax(220px, 300px) 1fr;
  align-items: start;
  gap: 1.5rem;
}

.ird__wellbore-tables {
  min-width: 0;
}

/* ── KPI stat strip ───────────────────────────────────────────────
 * Flexbox, not grid: items wrap and the trailing one grows to fill
 * its row instead of leaving an empty grid track behind it.
 */
.ird__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1px;
  overflow: hidden;
  background: $border;
  border: 1px solid $border;
  border-radius: 14px;
}

.ird__stat {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  flex: 1 1 190px;
  padding: 0.9rem 1.15rem;
  background: #ffffff;
}

.ird__stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  flex-shrink: 0;

  &.mat-icon {
    width: 34px;
    height: 34px;
    font-size: 18px;
  }
}

.ird__stat--depth .ird__stat-icon {
  background: rgba($stat-depth, 0.12);
  color: $stat-depth;
}

.ird__stat--rate .ird__stat-icon {
  background: rgba($stat-rate, 0.12);
  color: $stat-rate;
}

.ird__stat--tds .ird__stat-icon {
  background: rgba($stat-tds, 0.12);
  color: $stat-tds;
}

.ird__stat--h2s .ird__stat-icon {
  background: rgba($stat-h2s, 0.12);
  color: $stat-h2s;
}

.ird__stat--offset .ird__stat-icon {
  background: rgba($stat-offset, 0.12);
  color: $stat-offset;
}

.ird__stat-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.ird__stat-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: $muted;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.ird__stat-value {
  font-size: 1.45rem;
  font-weight: 800;
  color: $navy;
  letter-spacing: -0.02em;

  small {
    margin-left: 3px;
    font-size: 0.76rem;
    font-weight: 700;
    color: $muted;
  }
}

/* ── Key/value grid ───────────────────────────────────────────── */
.ird__kv-grid {
  margin: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.5rem;
}

.ird__kv-grid--wide {
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem 2rem;
}

.ird__kv {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.85rem;
  padding: 0.35rem 0;
  border-bottom: 1px dashed $border;

  dt {
    color: $muted;
  }

  dd {
    margin: 0;
    color: $navy;
    font-weight: 600;
    text-align: right;
  }
}

/* ── Tables ───────────────────────────────────────────────────── */
.ird__table-wrap {
  overflow-x: auto;
  border: 1px solid $border;
  border-radius: 10px;
}

.ird__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
  white-space: nowrap;

  th {
    background: #f8fafc;
    color: $muted;
    font-weight: 700;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    text-align: left;
    padding: 0.6rem 0.85rem;
    border-bottom: 1px solid $border;
  }

  td {
    padding: 0.55rem 0.85rem;
    color: $navy;
    border-bottom: 1px solid #f1f5f9;
  }

  tr:last-child td {
    border-bottom: none;
  }
}

.ird__table--wide th,
.ird__table--wide td {
  padding-left: 0.6rem;
  padding-right: 0.6rem;
}

.ird__table-empty {
  text-align: center;
  color: $muted;
  font-style: italic;
}

.ird__remarks {
  margin: 0.75rem 0 0;
  font-size: 0.82rem;
  color: $muted;
  font-style: italic;
}

/* ── Attachments ──────────────────────────────────────────────── */
.ird__attachments {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ird__attachment {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #f8fafc;
  border: 1px solid $border;
  border-radius: 8px;
  font-size: 0.82rem;
  color: $accent;
  font-weight: 600;
  width: fit-content;

  mat-icon {
    width: 16px;
    height: 16px;
    font-size: 16px;
    color: $muted;
  }
}

.ird__empty-text {
  margin: 0;
  font-size: 0.82rem;
  color: $muted;
  font-style: italic;
}

/* ── Responsive ───────────────────────────────────────────────── */
@media (max-width: 900px) {
  .ird__body {
    grid-template-columns: 1fr;
  }

  .ird__sidebar {
    position: static;
    order: -1;
  }
}

@media (max-width: 760px) {
  .ird__wellbore {
    grid-template-columns: 1fr;
  }

  .ird__pair {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .ird__kv-grid--wide {
    grid-template-columns: 1fr;
  }
}
```

## `src/app/features/wwell-planning/wwell-ir/wwell-ir-detail/wwell-ir-detail.component.ts`

```typescript
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { IntegratedRequirement } from '@models/wwell-planning/wwell-planning.model';
import { WwellApprovalTimelineComponent } from '../../shared/wwell-approvals/wwell-approval-timeline/wwell-approval-timeline.component';
import { WwellIrDesignPreviewComponent } from '../wwell-ir-design-preview/wwell-ir-design-preview.component';
import { WWELL_IR_STATUS_META } from '../wwell-ir.config';

const SUBMITTABLE_STATUSES: readonly IntegratedRequirement['status'][] = ['draft', 'in-progress'];

@Component({
  selector: 'app-wwell-ir-detail',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, WwellIrDesignPreviewComponent, WwellApprovalTimelineComponent],
  templateUrl: './wwell-ir-detail.component.html',
  styleUrl: './wwell-ir-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrDetailComponent {
  readonly ir = input.required<IntegratedRequirement>();
  readonly submitting = input(false);

  readonly submitForReview = output<IntegratedRequirement>();

  protected readonly statusMeta = WWELL_IR_STATUS_META;
  protected readonly canSubmitForReview = computed(() => SUBMITTABLE_STATUSES.includes(this.ir().status));

  protected subSeaFt(depthFt: number): number | null {
    const elevation = this.ir().requestReference.surfaceElevationFtAsl;
    return elevation === null ? null : elevation - depthFt;
  }
}
```

## `src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.component.html`

_File deleted (staged for removal)._

## `src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.component.scss`

_File deleted (staged for removal)._

## `src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.component.ts`

_File deleted (staged for removal)._

## `src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.config.ts`

```typescript
import { ApprovalChainStep } from '@models/wwell-planning/wwell-planning.model';
import { WWELL_IR_CHAIN_ROLES } from '../../shared/wwell-approvals/wwell-approvals.config';

/** Pending-state chain preview shown in the IR page header before the form is submitted. */
export const WWELL_IR_CHAIN_PREVIEW: readonly ApprovalChainStep[] = WWELL_IR_CHAIN_ROLES.map(role => ({
  role,
  name: 'Pending Assignment',
  status: 'pending',
  date: null,
}));
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
      estimated: { aquifer: 'Saq', estimatedTdsPpm: 1200, h2sPpm: 5, estimatedPumpDepthFt: 150 },
      testProgram: { testType: 'pump-test', estimatedRateGpm: 350, estimatedWaterLevelFt: 95 },
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
    hydrogeology: { ...raw.hydrogeology.estimated },
    testProgram: {
      testType: raw.hydrogeology.testProgram.testType as IntegratedRequirementTestType,
      estimatedRateGpm: raw.hydrogeology.testProgram.estimatedRateGpm,
      estimatedWaterLevelFt: raw.hydrogeology.testProgram.estimatedWaterLevelFt,
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
    label: 'Hydrogeology & Testing',
    sections: [
      {
        key: 'estimated',
        title: 'Estimated Hydrogeology',
        fields: [
          {
            key: 'aquifer',
            label: 'Aquifer',
            type: 'select',
            options: WWELL_AQUIFER_OPTIONS,
            validators: { required: true },
          },
          { key: 'estimatedTdsPpm', label: 'Estimated TDS', type: 'number', suffix: 'ppm' },
          { key: 'h2sPpm', label: 'H2S', type: 'number', suffix: 'ppm' },
          { key: 'estimatedPumpDepthFt', label: 'Estimated Pump Depth', type: 'number', suffix: 'ft' },
        ],
      },
      {
        key: 'testProgram',
        title: 'Test Program',
        fields: [
          {
            key: 'testType',
            label: 'Test Type',
            type: 'toggle-group',
            options: WWELL_TEST_TYPE_OPTIONS,
            validators: { required: true },
          },
          { key: 'estimatedRateGpm', label: 'Estimated Rate', type: 'number', suffix: 'GPM' },
          { key: 'estimatedWaterLevelFt', label: 'Estimated Water Level', type: 'number', suffix: 'ft' },
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

export interface WwellIrRawEstimatedHydrogeology {
  readonly aquifer: string;
  readonly estimatedTdsPpm: number | null;
  readonly h2sPpm: number | null;
  readonly estimatedPumpDepthFt: number | null;
}

export interface WwellIrRawTestProgram {
  readonly testType: string;
  readonly estimatedRateGpm: number | null;
  readonly estimatedWaterLevelFt: number | null;
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
  readonly hydrogeology: {
    readonly estimated: WwellIrRawEstimatedHydrogeology;
    readonly testProgram: WwellIrRawTestProgram;
  };
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
              <h3 class="nip__review-title">Review before you submit</h3>
              <p class="nip__review-subtitle">Check each section below — use Edit to jump back and fix anything.</p>

              <mat-accordion class="nip__review-grid" multi>
                @for (reviewStep of reviewSteps; track reviewStep.key; let i = $index) {
                  <mat-expansion-panel class="nip__review-card" #reviewCard>
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

:host {
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

/* ── Stepper header ───────────────────────────────────────────────────────
 * Icon-above-label layout via Material's own `labelPosition="bottom"` mode.
 * Material centers the connector line using a hardcoded assumption of a 24px
 * icon: `top: (header-height - 24) / 2 + 12`. Our icon is deliberately bigger
 * (40px) for a more prominent, modern look, so that formula would leave the
 * line ~8px too high. $header-height / $icon-size below feed the same
 * variable Material reads, and the hand-computed $line-top corrects for the
 * bigger icon: padding-top ((header-height - 24) / 2, Material's own formula)
 * plus half our real icon size.
 */
$header-height: 88px;
$icon-size: 40px;
$line-top: calc((#{$header-height} - 24px) / 2 + #{$icon-size} / 2);

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
  border-top-color: #e5e7eb;
  top: #{$line-top} !important;
}

/* ── Review section ───────────────────────────────────────────── */
.nip__review {
  margin-top: 1.5rem;
  padding-top: 1.25rem;
  border-top: 1px solid $border;
}

.nip__review-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 800;
  color: $navy;
}

.nip__review-subtitle {
  margin: 0.2rem 0 1rem;
  font-size: 0.82rem;
  color: $muted;
}

.nip__review-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.nip .nip__review-card {
  border: 1px solid $border !important;
  border-radius: 12px !important;
  box-shadow: none !important;
  overflow: hidden;

  &::before {
    display: none;
  }

  &:not(.mat-expanded) .nip__review-card-header:hover {
    background: rgba($accent, 0.04);
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
  padding-top: 0.5rem;
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

## `src/app/features/wwell-planning/wwell-ir/wwell-ir-new-page/wwell-ir-new-page.component.spec.ts`

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { WwellPlanningStore } from '../../store/wwell-planning.store';
import { WwellIrNewPageComponent } from './wwell-ir-new-page.component';
import { WWELL_IR_FORM_SCHEMA } from '../wwell-ir-form/wwell-ir-form.schema';

interface TestableWwellIrNewPage {
  stepGroup(stepKey: string): { get(key: string): FormArray };
  submit(stepper: MatStepper): void;
  saveAsDraft(): void;
}

function asTestable(component: WwellIrNewPageComponent): TestableWwellIrNewPage {
  return component as unknown as TestableWwellIrNewPage;
}

const storeMock = {
  creatingIntegratedRequirement: jest.fn(() => false),
  createIntegratedRequirementError: jest.fn(() => null as string | null),
  createIntegratedRequirement: jest.fn(),
};

const snackBarMock = { open: jest.fn() };

function findButtonByText(fixture: ComponentFixture<WwellIrNewPageComponent>, text: string): HTMLButtonElement | undefined {
  return Array.from(fixture.nativeElement.querySelectorAll('button')).find((btn): btn is HTMLButtonElement =>
    (btn as HTMLButtonElement).textContent?.includes(text) ?? false,
  );
}

describe('WwellIrNewPageComponent', () => {
  let component: WwellIrNewPageComponent;
  let fixture: ComponentFixture<WwellIrNewPageComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [WwellIrNewPageComponent, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: WwellPlanningStore, useValue: storeMock },
        { provide: MatSnackBar, useValue: snackBarMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WwellIrNewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture?.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders one step header and one projected step-content block per schema entry', () => {
    const headers = fixture.nativeElement.querySelectorAll('.mat-step-header');
    const content = fixture.nativeElement.querySelectorAll('.nip__step-content');
    expect(headers.length).toBe(WWELL_IR_FORM_SCHEMA.length);
    expect(content.length).toBe(WWELL_IR_FORM_SCHEMA.length);
  });

  it('adding a casing row grows the underlying FormArray', () => {
    const casingArray = asTestable(component).stepGroup('subsurface').get('casing');
    expect(casingArray.length).toBe(0);

    findButtonByText(fixture, 'Add Casing')?.click();
    fixture.detectChanges();

    expect(casingArray.length).toBe(1);
  });

  it('blocks submit when required fields are missing', () => {
    asTestable(component).submit({ selectedIndex: 0 } as MatStepper);
    expect(storeMock.createIntegratedRequirement).not.toHaveBeenCalled();
  });

  it('lets Save as Draft bypass validation', () => {
    asTestable(component).saveAsDraft();

    expect(storeMock.createIntegratedRequirement).toHaveBeenCalledTimes(1);
    const [payload] = storeMock.createIntegratedRequirement.mock.calls[0];
    expect(payload.status).toBe('draft');
  });
});
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

## `src/app/features/wwell-planning/wwell-ir/wwell-ir.component.html`

```html
<section class="wwell-ir">
  <div class="wwell-ir__master">
    <header class="wwell-ir__header">
      <div class="wwell-ir__heading">
        <h1 class="wwell-ir__title">Integrated Requirements</h1>
        <span class="wwell-ir__count">{{ rows().length }}</span>
      </div>

      <button type="button" mat-flat-button color="primary" class="wwell-ir__new-btn" (click)="openNewIrPage()">
        <mat-icon>add</mat-icon>
        New IR
      </button>
    </header>

    <label class="wwell-ir__search">
      <mat-icon class="wwell-ir__search-icon">search</mat-icon>
      <input
        type="search"
        placeholder="Search by code, well, request or client&hellip;"
        [ngModel]="searchTerm()"
        (ngModelChange)="onSearchChange($event)"
      />
    </label>

    @if (isLoading()) {
      <div class="wwell-ir__status">Loading&hellip;</div>
    } @else if (loadError()) {
      <div class="wwell-ir__status wwell-ir__status--error">{{ loadError() }}</div>
    } @else if (rows().length === 0) {
      <div class="wwell-ir__status">No integrated requirements found.</div>
    } @else {
      <ul class="wwell-ir__list">
        @for (ir of rows(); track ir.id) {
          <li>
            <button
              type="button"
              class="wwell-ir__row"
              [class.wwell-ir__row--active]="ir.id === selectedId()"
              (click)="selectIr(ir.id)"
            >
              <div class="wwell-ir__row-top">
                <span class="wwell-ir__row-code">{{ ir.code }}</span>
                <span
                  class="wwell-ir__badge"
                  [style.background]="statusMeta[ir.status].bg"
                  [style.color]="statusMeta[ir.status].color"
                >
                  <span class="wwell-ir__badge-dot" [style.background]="statusMeta[ir.status].dot"></span>
                  {{ statusMeta[ir.status].label }}
                </span>
              </div>
              <p class="wwell-ir__row-name">{{ ir.requestReference.wellName }}</p>
              <p class="wwell-ir__row-meta">{{ ir.requestReference.client }} &middot; Updated {{ ir.updatedDate }}</p>
            </button>
          </li>
        }
      </ul>
    }
  </div>

  <div class="wwell-ir__detail">
    @if (selectedIr(); as ir) {
      <div class="wwell-ir__detail-panel" #detailHost>
        <app-wwell-ir-detail [ir]="ir" [submitting]="isSubmittingForReview()" (submitForReview)="submitForReview($event)" />
      </div>
    } @else {
      <div class="wwell-ir__empty">
        <mat-icon>description</mat-icon>
        <p>Select an integrated requirement to view its details.</p>
      </div>
    }
  </div>
</section>
```

## `src/app/features/wwell-planning/wwell-ir/wwell-ir.component.scss`

```scss
$navy: #1e293b;
$muted: #64748b;
$border: #e2e8f0;
$accent: #3b82f6;

:host {
  display: block;
  height: 100%;
  background: #f0f4f8;
}

.wwell-ir {
  display: flex;
  /*
   * Not `stretch` (the flex default): with only a handful of rows, stretching the master
   * column to match `.wwell-ir`'s full 100%-height would force its white card down to fill
   * the whole page, leaving dead empty space below the last row. Each column instead sizes
   * to its own content, capped by `max-height: 100%` — `.wwell-ir__detail` opts back into
   * filling the available height via `align-self: stretch` since its content is meant to.
   */
  align-items: flex-start;
  gap: 1.25rem;
  height: 100%;
  padding: 1.5rem;
}

/* ── Master column ────────────────────────────────────────────── */
.wwell-ir__master {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;
  width: 360px;
  flex-shrink: 0;
  max-height: 100%;
  background: #ffffff;
  border: 1px solid #e8edf4;
  border-radius: 12px;
  padding: 1.1rem;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.06),
    0 4px 12px rgba(59, 130, 246, 0.05);
  overflow: hidden;
}

.wwell-ir__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.wwell-ir__heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.wwell-ir__title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: $navy;
  letter-spacing: -0.01em;
}

.wwell-ir__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: $accent;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
}

.wwell-ir__new-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 0 12px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.28);

  mat-icon {
    width: 16px;
    height: 16px;
    font-size: 16px;
  }
}

/* ── Search ───────────────────────────────────────────────────── */
.wwell-ir__search {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.5rem 0.9rem;
  background: #f8fafc;
  border: 1px solid $border;
  border-radius: 10px;
  transition: border-color 150ms ease;

  &:focus-within {
    border-color: $accent;
  }
}

.wwell-ir__search-icon {
  width: 18px;
  height: 18px;
  font-size: 18px;
  color: #94a3b8;
  flex-shrink: 0;
}

.wwell-ir__search input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.85rem;
  color: $navy;

  &::placeholder {
    color: #94a3b8;
  }

  &::-webkit-search-cancel-button {
    cursor: pointer;
  }
}

.wwell-ir__status {
  padding: 2rem 1rem;
  text-align: center;
  color: $muted;
  font-size: 0.85rem;

  &--error {
    color: #dc2626;
  }
}

/* ── Row list ─────────────────────────────────────────────────── */
.wwell-ir__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
  flex: 1;
  min-height: 0;

  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.wwell-ir__row {
  width: 100%;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.7rem 0.85rem;
  background: #ffffff;
  border: 1px solid $border;
  border-left: 3px solid transparent;
  border-radius: 10px;
  cursor: pointer;
  font: inherit;
  transition:
    background-color 150ms ease,
    border-color 150ms ease,
    transform 150ms ease;

  &:hover {
    background: #f8fafc;
    transform: translateX(1px);
  }

  &--active {
    background: rgba($accent, 0.06);
    border-color: rgba($accent, 0.35);
    border-left-color: $accent;
  }
}

.wwell-ir__row-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.wwell-ir__row-code {
  font-size: 0.82rem;
  font-weight: 800;
  color: $navy;
}

.wwell-ir__row-name {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 700;
  color: $navy;
}

.wwell-ir__row-meta {
  margin: 0;
  font-size: 0.76rem;
  color: $muted;
}

.wwell-ir__badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 0.68rem;
  font-weight: 700;
  white-space: nowrap;
}

.wwell-ir__badge-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  flex-shrink: 0;
}

/* ── Detail column ────────────────────────────────────────────── */
.wwell-ir__detail {
  flex: 1;
  min-width: 0;
  align-self: stretch;
  max-height: 100%;
  overflow-y: auto;

  /* Scrolls, but stays visually quiet — the bento cards inside are the only
   * chrome on screen; a visible track/thumb here would just be more noise. */
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

/*
 * Deliberately no background/border/shadow here — that used to wrap the whole detail
 * view in its own white card, which then contained the bento cards from
 * wwell-ir-detail.component.scss, i.e. cards nested inside a card. This is just a
 * padding wrapper now; the neutral page background (`:host`) shows through behind
 * the bento cards themselves, which is the only "card" layer left.
 */
.wwell-ir__detail-panel {
  padding: 0.25rem;
}

.wwell-ir__empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: $muted;
  background: #ffffff;
  border: 1px dashed $border;
  border-radius: 12px;
  min-height: 320px;

  mat-icon {
    width: 32px;
    height: 32px;
    font-size: 32px;
    color: #cbd5e1;
  }

  p {
    margin: 0;
    font-size: 0.88rem;
  }
}

/* ── Responsive ───────────────────────────────────────────────── */
@media (max-width: 900px) {
  .wwell-ir {
    flex-direction: column;
    height: auto;
  }

  .wwell-ir__master {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .wwell-ir {
    padding: 1rem;
  }
}
```

## `src/app/features/wwell-planning/wwell-ir/wwell-ir.component.ts`

```typescript
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IntegratedRequirement } from '@models/wwell-planning/wwell-planning.model';
import { buildDetailRevealTimeline } from '../shared/dynamic-form/detail-reveal.animation';
import { playIfMotionAllowed } from '../shared/dynamic-form/gsap-motion.util';
import { WwellPlanningStore } from '../store/wwell-planning.store';
import { WwellIrDetailComponent } from './wwell-ir-detail/wwell-ir-detail.component';
import { WWELL_IR_STATUS_META } from './wwell-ir.config';

const SNACKBAR_DURATION_MS = 3000;

@Component({
  selector: 'app-wwell-ir',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatIconModule, WwellIrDetailComponent],
  templateUrl: './wwell-ir.component.html',
  styleUrl: './wwell-ir.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrComponent implements OnInit {
  protected readonly store = inject(WwellPlanningStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly isLoading = this.store.integratedRequirementsLoading;
  protected readonly loadError = this.store.integratedRequirementsError;
  protected readonly isSubmittingForReview = this.store.updatingIntegratedRequirementStatus;

  protected readonly searchTerm = signal('');
  protected readonly selectedId = signal<string | null>(null);

  protected readonly rows = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const all = this.store.integratedRequirements();
    if (!term) return all;

    return all.filter(
      ir =>
        ir.code.toLowerCase().includes(term) ||
        ir.requestReference.wellName.toLowerCase().includes(term) ||
        (ir.requestReference.linkedRequestId ?? '').toLowerCase().includes(term) ||
        ir.requestReference.client.toLowerCase().includes(term),
    );
  });

  // Deliberately looks up the *unfiltered* store list (not `rows()`) so narrowing the search
  // never drops the current selection just because it fell outside the filtered results.
  protected readonly selectedIr = computed<IntegratedRequirement | null>(
    () => this.store.integratedRequirements().find(ir => ir.id === this.selectedId()) ?? null,
  );

  protected readonly statusMeta = WWELL_IR_STATUS_META;

  @ViewChild('detailHost') private readonly detailHost?: ElementRef<HTMLElement>;
  private previousSelectedId: string | null = null;

  constructor() {
    effect(() => {
      const message = this.store.createIntegratedRequirementError();
      if (message) {
        this.snackBar.open(message, 'Dismiss', { duration: SNACKBAR_DURATION_MS });
      }
    });

    effect(() => {
      const message = this.store.updateIntegratedRequirementStatusError();
      if (message) {
        this.snackBar.open(message, 'Dismiss', { duration: SNACKBAR_DURATION_MS });
      }
    });

    // Default to the first record once the list loads — mirrors the reference app, which
    // always has something selected in the detail pane rather than starting on an empty state.
    effect(() => {
      const all = this.store.integratedRequirements();
      if (all.length > 0 && this.selectedId() === null) {
        this.selectedId.set(all[0].id);
      }
    });

    effect(() => {
      const id = this.selectedId();
      if (id === null || id === this.previousSelectedId) return;

      const host = this.detailHost?.nativeElement;
      if (host) playIfMotionAllowed(buildDetailRevealTimeline(host));
      this.previousSelectedId = id;
    });
  }

  ngOnInit(): void {
    this.store.loadIntegratedRequirements();
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }

  protected selectIr(id: string): void {
    this.selectedId.set(id);
  }

  protected openNewIrPage(): void {
    this.router.navigate(['new'], { relativeTo: this.route });
  }

  protected submitForReview(ir: IntegratedRequirement): void {
    this.store.submitIntegratedRequirementForReview(ir);
  }
}
```

## `src/app/features/wwell-planning/wwell-ir/wwell-ir.config.ts`

```typescript
import { IntegratedRequirementStatus } from '@models/wwell-planning/wwell-planning.model';
import { WWELL_STATUS_COLORS, WwellStatusMeta, wwellStatusMeta } from '../shared/wwell-status.config';

export const WWELL_IR_STATUS_META: Record<IntegratedRequirementStatus, WwellStatusMeta> = {
  draft: wwellStatusMeta('Draft', WWELL_STATUS_COLORS.slate),
  'in-progress': wwellStatusMeta('In Progress', WWELL_STATUS_COLORS.blue),
  'submit-for-review': { label: 'Submit for Review', bg: '#3b82f6', color: '#ffffff', dot: '#ffffff' },
  'in-review': wwellStatusMeta('In Review', WWELL_STATUS_COLORS.purple),
  approved: wwellStatusMeta('Approved', WWELL_STATUS_COLORS.green),
};
```

## `src/app/features/wwell-planning/wwell-ir/wwell-ir.mock.ts`

```typescript
import { IntegratedRequirement } from '@models/wwell-planning/wwell-planning.model';

export const WWELL_IR_MOCK: readonly IntegratedRequirement[] = [
  {
    id: 'IR-26-001',
    code: 'IR-26-001',
    updatedDate: '2026-06-19',
    status: 'in-progress',
    requestReference: {
      linkedRequestId: 'REQ-00231',
      client: 'BI-11',
      supportingBusiness: 'Agriculture',
      wellName: 'KHAJ-300',
      targetAquifer: 'Wasia',
      targetDepthFt: 480,
      surfaceElevationFtAsl: 910,
      coordinates: '24.1751°N, 47.2951°E',
    },
    formationTops: [
      { name: 'Dammam', depthFt: 120 },
      { name: 'Rus', depthFt: 210 },
      { name: 'Umm er Radhuma', depthFt: 340 },
      { name: 'Wasia-Biyadh', depthFt: 420 },
    ],
    casing: [
      { type: 'Conductor', sizeIn: '20"', depthFtBgl: 30, remarks: 'Driven, cemented' },
      { type: 'Surface', sizeIn: '13.375"', depthFtBgl: 140, remarks: 'Cemented to surface' },
      { type: 'Production', sizeIn: '8.625"', depthFtBgl: 510, remarks: 'Slotted liner 420-510' },
    ],
    programDetails: {
      completion: 'Open Hole with Gravel Pack',
      acidization: 'Matrix Acidizing 15% HCl',
      transmission: 'Pipeline + Pump Station',
      developmentTesting: {
        logging: 'Full Suite (GR-RES-NEU-DEN-SONIC)',
        mudLogging: 'Advanced Mud Logging (Gas + Cuttings + Chromatography)',
        sampling: 'Flow-Weighted Composite',
        flowTest: 'Multi-Rate Flow Test',
      },
    },
    contacts: { geologistPrimary: 'Eng. A. Al-Mutairi', geologistSecondary: 'Dr. F. Al-Qahtani' },
    offsetWells: [
      {
        wellName: 'KHAJ-200',
        distanceKm: 2.5,
        location: 'N 2.5 km',
        aquifer: 'Wasia-Biyadh',
        totalDepthFt: 550,
        testDurationMin: 1200,
        rateGpm: 180,
        rpm: 1200,
        swlFt: 85,
        pwlFt: 150,
        drawdownFt: 25,
        specificCapacity: 15.2,
        tdsPpm: 1200,
        h2sPpm: 5,
      },
      {
        wellName: 'KHAJ-150',
        distanceKm: 4.3,
        location: 'NE 4.1 km',
        aquifer: 'Wasia-Biyadh',
        totalDepthFt: 580,
        testDurationMin: 720,
        rateGpm: 120,
        rpm: 400,
        swlFt: 90,
        pwlFt: 160,
        drawdownFt: 18,
        specificCapacity: 17.8,
        tdsPpm: 1250,
        h2sPpm: 3,
      },
    ],
    offsetWellsRemarks:
      'Both offset wells completed in same aquifer. KHAJ-200 showed slight water quality decline over 5 years.',
    hydrogeology: { aquifer: 'Wasia-Biyadh', estimatedTdsPpm: 1200, h2sPpm: 5, estimatedPumpDepthFt: 150 },
    testProgram: { testType: 'flow-test', estimatedRateGpm: 350, estimatedWaterLevelFt: 95 },
    attachmentNames: ['KHAJ-300_LocationMap.pdf', 'REQ-00231_Initiation.pdf'],
    chain: [
      { role: 'Hydrogeologist', name: 'You', status: 'in-progress', date: null },
      { role: 'Lead Hydrogeologist', name: 'Pending Assignment', status: 'pending', date: null },
      { role: 'Manager', name: 'Pending Assignment', status: 'pending', date: null },
    ],
  },
  {
    id: 'IR-26-002',
    code: 'IR-26-002',
    updatedDate: '2026-06-17',
    status: 'submit-for-review',
    requestReference: {
      linkedRequestId: 'REQ-00218',
      client: 'BI-12',
      supportingBusiness: 'Municipal',
      wellName: 'RXYD-100',
      targetAquifer: 'Umm Er Radhuma',
      targetDepthFt: 620,
      surfaceElevationFtAsl: 760,
      coordinates: '24.6408°N, 46.7728°E',
    },
    formationTops: [{ name: 'Umm Er Radhuma', depthFt: 340 }],
    casing: [{ type: 'Surface', sizeIn: '16"', depthFtBgl: 60, remarks: null }],
    programDetails: {
      completion: 'Screened',
      acidization: 'HCl Acid Wash',
      transmission: 'Pumped Transmission',
      developmentTesting: { logging: 'Gamma Ray', mudLogging: 'Cuttings Sample Only', sampling: 'Pump Sample', flowTest: 'Step-Rate Test' },
    },
    contacts: { geologistPrimary: 'Eng. S. Al-Dossari', geologistSecondary: 'Eng. F. Al-Harbi' },
    offsetWells: [{ wellName: 'HAIL-200' }],
    offsetWellsRemarks: 'Offset wells within 500m radius.',
    hydrogeology: { aquifer: 'Umm Er Radhuma', estimatedTdsPpm: 850, h2sPpm: 2, estimatedPumpDepthFt: 210 },
    testProgram: { testType: 'pump-test', estimatedRateGpm: 500, estimatedWaterLevelFt: 130 },
    attachmentNames: ['location-map.pdf'],
    chain: [
      { role: 'Hydrogeologist', name: 'Eng. S. Al-Dossari', status: 'approved', date: '2026-06-15' },
      { role: 'Lead Hydrogeologist', name: 'Eng. M. Al-Qahtani', status: 'in-progress', date: null },
      { role: 'Manager', name: 'Pending Assignment', status: 'pending', date: null },
    ],
  },
  {
    id: 'IR-26-003',
    code: 'IR-26-003',
    updatedDate: '2026-06-01',
    status: 'in-review',
    requestReference: {
      linkedRequestId: 'REQ-00205',
      client: 'BI-11',
      supportingBusiness: 'Industrial',
      wellName: 'QASS-400',
      targetAquifer: 'Biyadh',
      targetDepthFt: 710,
      surfaceElevationFtAsl: 640,
      coordinates: '25.3382°N, 49.5896°E',
    },
    formationTops: [{ name: 'Biyadh', depthFt: 410 }],
    casing: [{ type: 'Intermediate', sizeIn: '13.375"', depthFtBgl: 260, remarks: 'Cemented to surface' }],
    programDetails: {
      completion: 'Screened + Gravel Pack',
      acidization: 'Mud Acid',
      transmission: 'Pipeline',
      developmentTesting: { logging: 'Resistivity', mudLogging: 'Full Mud Logging', sampling: 'Composite Sample', flowTest: 'Recovery Test' },
    },
    contacts: { geologistPrimary: 'Eng. F. Al-Harbi', geologistSecondary: null },
    offsetWells: [{ wellName: 'HAIL-300' }, { wellName: 'HAIL-400' }],
    offsetWellsRemarks: null,
    hydrogeology: { aquifer: 'Biyadh', estimatedTdsPpm: 600, h2sPpm: 8, estimatedPumpDepthFt: 300 },
    testProgram: { testType: 'flow-test', estimatedRateGpm: 700, estimatedWaterLevelFt: 180 },
    attachmentNames: ['location-map.pdf', 'initiation-request.pdf'],
    chain: [
      { role: 'Hydrogeologist', name: 'Eng. F. Al-Harbi', status: 'approved', date: '2026-05-28' },
      { role: 'Lead Hydrogeologist', name: 'Eng. A. Al-Mutairi', status: 'approved', date: '2026-05-30' },
      { role: 'Manager', name: 'Eng. M. Al-Qahtani', status: 'in-progress', date: null },
    ],
  },
  {
    id: 'IR-26-004',
    code: 'IR-26-004',
    updatedDate: '2026-05-22',
    status: 'approved',
    requestReference: {
      linkedRequestId: 'REQ-00187',
      client: 'BI-16',
      supportingBusiness: 'Environmental',
      wellName: 'ABHA-300',
      targetAquifer: 'Dammam',
      targetDepthFt: 390,
      surfaceElevationFtAsl: 1020,
      coordinates: '18.2465°N, 42.5117°E',
    },
    formationTops: [{ name: 'Dammam', depthFt: 180 }],
    casing: [{ type: 'Production', sizeIn: '9.625"', depthFtBgl: 380, remarks: null }],
    programDetails: {
      completion: 'Liner + Perforated',
      acidization: 'None',
      transmission: 'Gravity Flow',
      developmentTesting: { logging: 'SP', mudLogging: 'None', sampling: 'Bailer Sample', flowTest: 'Constant-Rate Test' },
    },
    contacts: { geologistPrimary: 'Eng. M. Al-Qahtani', geologistSecondary: 'Eng. A. Al-Mutairi' },
    offsetWells: [],
    offsetWellsRemarks: null,
    hydrogeology: { aquifer: 'Dammam', estimatedTdsPpm: 780, h2sPpm: 1, estimatedPumpDepthFt: 120 },
    testProgram: { testType: 'pump-test', estimatedRateGpm: 620, estimatedWaterLevelFt: 88 },
    attachmentNames: ['location-map.pdf', 'initiation-request.pdf'],
    chain: [
      { role: 'Hydrogeologist', name: 'Eng. M. Al-Qahtani', status: 'approved', date: '2026-05-15' },
      { role: 'Lead Hydrogeologist', name: 'Eng. S. Al-Dossari', status: 'approved', date: '2026-05-18' },
      { role: 'Manager', name: 'Eng. F. Al-Harbi', status: 'approved', date: '2026-05-22' },
    ],
  },
];
```

## `src/app/features/wwell-planning/wwell-planning.service.ts`

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import {
  ApprovalChainStep,
  CreateIntegratedRequirementPayload,
  CreateLandAffairsApprovalPayload,
  CreateWldaApprovalPayload,
  CreateWwellPlanningRequestPayload,
  IntegratedRequirement,
  LandAffairsApproval,
  WldaApproval,
  WwellPlanningRequest,
} from '@models/wwell-planning/wwell-planning.model';
import { ApiResponse } from 'src/app/shared/models/wwell/api-response.model';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { WWELL_REQUESTS_MOCK } from './wwell-requests/wwell-requests.mock';
import { WWELL_IR_MOCK } from './wwell-ir/wwell-ir.mock';
import { WWELL_LAND_AFFAIRS_APPROVALS_MOCK, WWELL_WLDA_APPROVALS_MOCK } from './shared/wwell-approvals/wwell-approvals.mock';
import {
  WWELL_IR_CHAIN_ROLES,
  WWELL_LAND_AFFAIRS_CHAIN_ROLES,
  WWELL_WLDA_CHAIN_ROLES,
} from './shared/wwell-approvals/wwell-approvals.config';
import { buildApprovalPdfBlob } from './shared/wwell-approvals/wwell-approval-pdf.util';
import { buildInitialApprovalChain, generateApprovalReqNo, todayIsoDate } from './shared/wwell-approvals/wwell-approval-request.util';

interface ApprovalPdfSource {
  readonly reqNo: string;
  readonly client: string;
  readonly wellName: string;
  readonly submittedBy: string;
  readonly date: string;
  readonly chain: readonly ApprovalChainStep[];
}

@Injectable({ providedIn: 'root' })
export class WwellPlanningService {
  private readonly http = inject(HttpClient);
  private readonly extConfigService = inject(ExternalConfigService);

  private get apiUrl(): string {
    const serverUrl = this.extConfigService.settings.planningServiceUrl ?? '';
    return `${serverUrl}/planning/api/v1`;
  }

  getRequests(): Observable<WwellPlanningRequest[]> {
    return this.http.get<ApiResponse<WwellPlanningRequest>>(`${this.apiUrl}/requests`).pipe(
      map(res => res.data),
      // TODO: remove fallback once the requests endpoint is live.
      catchError(() => of([...WWELL_REQUESTS_MOCK])),
    );
  }

  createRequest(
    payload: CreateWwellPlanningRequestPayload,
    files: readonly File[] = [],
  ): Observable<WwellPlanningRequest> {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    });
    files.forEach(file => formData.append('attachments', file, file.name));

    return this.http
      .post<ApiResponse<WwellPlanningRequest>>(`${this.apiUrl}/requests`, formData)
      .pipe(map(res => res.data[0]));
  }

  getWldaApprovals(): Observable<WldaApproval[]> {
    return this.http.get<ApiResponse<WldaApproval>>(`${this.apiUrl}/approvals/wlda`).pipe(
      map(res => res.data),
      // TODO: remove fallback once the WLDA approvals endpoint is live.
      catchError(() => of([...WWELL_WLDA_APPROVALS_MOCK])),
    );
  }

  getLandAffairsApprovals(): Observable<LandAffairsApproval[]> {
    return this.http.get<ApiResponse<LandAffairsApproval>>(`${this.apiUrl}/approvals/land-affairs`).pipe(
      map(res => res.data),
      // TODO: remove fallback once the Land Affairs approvals endpoint is live.
      catchError(() => of([...WWELL_LAND_AFFAIRS_APPROVALS_MOCK])),
    );
  }

  createWldaApproval(payload: CreateWldaApprovalPayload, files: readonly File[] = []): Observable<WldaApproval> {
    return this.http
      .post<ApiResponse<WldaApproval>>(`${this.apiUrl}/approvals/wlda`, this.toFormData(payload, files))
      .pipe(
        map(res => res.data[0]),
        // TODO: remove fallback once the WLDA approval-creation endpoint is live.
        catchError(() => of(this.buildFallbackWldaApproval(payload))),
      );
  }

  createLandAffairsApproval(
    payload: CreateLandAffairsApprovalPayload,
    files: readonly File[] = [],
  ): Observable<LandAffairsApproval> {
    return this.http
      .post<ApiResponse<LandAffairsApproval>>(`${this.apiUrl}/approvals/land-affairs`, this.toFormData(payload, files))
      .pipe(
        map(res => res.data[0]),
        // TODO: remove fallback once the Land Affairs approval-creation endpoint is live.
        catchError(() => of(this.buildFallbackLandAffairsApproval(payload))),
      );
  }

  private toFormData(payload: object, files: readonly File[]): FormData {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        // Nested objects/arrays (e.g. IR's requestReference/programDetails/casing[]) would
        // otherwise serialize to the literal string "[object Object]" via String(value).
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
      }
    });
    files.forEach(file => formData.append('attachments', file, file.name));
    return formData;
  }

  private buildFallbackWldaApproval(payload: CreateWldaApprovalPayload): WldaApproval {
    const reqNo = generateApprovalReqNo();
    return {
      id: `WLDA-${reqNo.slice(4)}`,
      reqNo,
      client: payload.client,
      wellName: payload.wellName,
      supporting: payload.supporting,
      submittedBy: 'You',
      date: todayIsoDate(),
      status: 'submitted',
      chain: buildInitialApprovalChain(WWELL_WLDA_CHAIN_ROLES, 'You'),
    };
  }

  private buildFallbackLandAffairsApproval(payload: CreateLandAffairsApprovalPayload): LandAffairsApproval {
    const reqNo = generateApprovalReqNo();
    return {
      id: `LA-${reqNo.slice(4)}`,
      reqNo,
      client: payload.client,
      wellName: payload.wellName,
      x: payload.coordinateX,
      y: payload.coordinateY,
      utm: payload.utmZone,
      submittedBy: 'You',
      date: todayIsoDate(),
      status: 'submitted',
      chain: buildInitialApprovalChain(WWELL_LAND_AFFAIRS_CHAIN_ROLES, 'You'),
    };
  }

  getWldaApprovalPdf(row: WldaApproval): Observable<Blob> {
    return this.fetchApprovalPdf('wlda', row.id, 'WLDA Approval', row);
  }

  getLandAffairsApprovalPdf(row: LandAffairsApproval): Observable<Blob> {
    return this.fetchApprovalPdf('land-affairs', row.id, 'Land Affairs Approval', row);
  }

  private fetchApprovalPdf(kind: string, id: string, label: string, row: ApprovalPdfSource): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/approvals/${kind}/${id}/pdf`, { responseType: 'blob' }).pipe(
      // TODO: remove fallback once the approval-PDF endpoint is live.
      catchError(() =>
        of(
          buildApprovalPdfBlob(`${label} — ${row.reqNo}`, [
            `Client: ${row.client}    Well: ${row.wellName}`,
            `Submitted By: ${row.submittedBy}    Date: ${row.date}`,
            '',
            'Approval Chain:',
            ...row.chain.map(step => `  ${step.role}: ${step.name}${step.date ? ' — ' + step.date : ''} (${step.status})`),
          ]),
        ),
      ),
    );
  }

  getIntegratedRequirements(): Observable<IntegratedRequirement[]> {
    return this.http.get<ApiResponse<IntegratedRequirement>>(`${this.apiUrl}/integrated-requirements`).pipe(
      map(res => res.data),
      // TODO: remove fallback once the integrated-requirements endpoint is live.
      catchError(() => of([...WWELL_IR_MOCK])),
    );
  }

  createIntegratedRequirement(
    payload: CreateIntegratedRequirementPayload,
    files: readonly File[] = [],
  ): Observable<IntegratedRequirement> {
    return this.http
      .post<ApiResponse<IntegratedRequirement>>(`${this.apiUrl}/integrated-requirements`, this.toFormData(payload, files))
      .pipe(
        map(res => res.data[0]),
        // TODO: remove fallback once the integrated-requirements creation endpoint is live.
        catchError(() => of(this.buildFallbackIntegratedRequirement(payload, files))),
      );
  }

  submitIntegratedRequirementForReview(ir: IntegratedRequirement): Observable<IntegratedRequirement> {
    return this.http
      .post<ApiResponse<IntegratedRequirement>>(`${this.apiUrl}/integrated-requirements/${ir.id}/submit-for-review`, {})
      .pipe(
        map(res => res.data[0]),
        // TODO: remove fallback once the submit-for-review endpoint is live.
        catchError(() => of({ ...ir, status: 'submit-for-review' as const, updatedDate: todayIsoDate() })),
      );
  }

  private buildFallbackIntegratedRequirement(
    payload: CreateIntegratedRequirementPayload,
    files: readonly File[],
  ): IntegratedRequirement {
    const code = `IR-${todayIsoDate().slice(2, 4)}-${Math.floor(Math.random() * 900 + 100)}`;
    return {
      id: code,
      code,
      updatedDate: todayIsoDate(),
      status: payload.status,
      requestReference: payload.requestReference,
      formationTops: payload.formationTops,
      casing: payload.casing,
      programDetails: payload.programDetails,
      contacts: payload.contacts,
      offsetWells: payload.offsetWells,
      offsetWellsRemarks: payload.offsetWellsRemarks,
      hydrogeology: payload.hydrogeology,
      testProgram: payload.testProgram,
      attachmentNames: files.map(file => file.name),
      chain: buildInitialApprovalChain(WWELL_IR_CHAIN_ROLES, 'You'),
    };
  }
}
```

## `src/app/layout/layout.component.html`

```html
<div class="dashboard" [class.dashboard--sidenav-collapsed]="sidenavCollapsed()">

  <!-- ① Top Navbar ──────────────────────────────────────────── -->
  <app-top-navbar
    class="dashboard__topbar"
    [sidenavCollapsed]="sidenavCollapsed()"
    (toggleSidenav)="toggleSidenav()"
  />

  <!-- ② Body row: Sidenav + Content ─────────────────────────── -->
  <div class="dashboard__body">

    <!-- ③ Left Sidenav ────────────────────────────────────────── -->
    <app-left-sidenav
      class="dashboard__sidenav"
      [collapsed]="sidenavCollapsed()"
      [activeRoute]="activeRoute()"
      (navItemClick)="onNavItemClick($event)"
    />

    <!-- ④ Main content area ─────────────────────────────────── -->
    <main
      class="dashboard__content"
      [class.dashboard__content--scroll-locked]="activeRoute() === 'active-wwell' || activeRoute() === 'integrated-requirements'"
    >
      <router-outlet />
    </main>

  </div>
</div>
```

## Scaffold Newly Added Files

Creates the 32 new files added in this staged changeset (empty placeholders — directories via `mkdirp`, files via `touch`, both run through `npx`).

```bash
npx -y mkdirp \
  "src/app/features/wwell-planning/shared/dynamic-form" \
  "src/app/features/wwell-planning/shared/dynamic-form/dynamic-field" \
  "src/app/features/wwell-planning/shared/dynamic-form/dynamic-section" \
  "src/app/features/wwell-planning/shared/dynamic-form/repeatable-group" \
  "src/app/features/wwell-planning/store" \
  "src/app/features/wwell-planning/wwell-ir/wwell-ir-design-preview" \
  "src/app/features/wwell-planning/wwell-ir/wwell-ir-detail" \
  "src/app/features/wwell-planning/wwell-ir/wwell-ir-form" \
  "src/app/features/wwell-planning/wwell-ir/wwell-ir-new-page" \
  && npx -y touch \
  "src/app/features/wwell-planning/shared/dynamic-form/detail-reveal.animation.ts" \
  "src/app/features/wwell-planning/shared/dynamic-form/dynamic-field/dynamic-field.component.html" \
  "src/app/features/wwell-planning/shared/dynamic-form/dynamic-field/dynamic-field.component.scss" \
  "src/app/features/wwell-planning/shared/dynamic-form/dynamic-field/dynamic-field.component.ts" \
  "src/app/features/wwell-planning/shared/dynamic-form/dynamic-section/dynamic-section.component.html" \
  "src/app/features/wwell-planning/shared/dynamic-form/dynamic-section/dynamic-section.component.scss" \
  "src/app/features/wwell-planning/shared/dynamic-form/dynamic-section/dynamic-section.component.ts" \
  "src/app/features/wwell-planning/shared/dynamic-form/gsap-motion.util.ts" \
  "src/app/features/wwell-planning/shared/dynamic-form/repeatable-group/repeatable-group.component.html" \
  "src/app/features/wwell-planning/shared/dynamic-form/repeatable-group/repeatable-group.component.scss" \
  "src/app/features/wwell-planning/shared/dynamic-form/repeatable-group/repeatable-group.component.ts" \
  "src/app/features/wwell-planning/shared/dynamic-form/repeatable-group/repeatable-row.animation.ts" \
  "src/app/features/wwell-planning/shared/dynamic-form/review-reveal.animation.ts" \
  "src/app/features/wwell-planning/shared/dynamic-form/step-transition.animation.ts" \
  "src/app/features/wwell-planning/shared/dynamic-form/wwell-dynamic-form.builder.spec.ts" \
  "src/app/features/wwell-planning/shared/dynamic-form/wwell-dynamic-form.builder.ts" \
  "src/app/features/wwell-planning/shared/dynamic-form/wwell-dynamic-form.types.ts" \
  "src/app/features/wwell-planning/store/wwell-planning.store.spec.ts" \
  "src/app/features/wwell-planning/wwell-ir/wwell-ir-design-preview/wwell-ir-design-preview.component.html" \
  "src/app/features/wwell-planning/wwell-ir/wwell-ir-design-preview/wwell-ir-design-preview.component.scss" \
  "src/app/features/wwell-planning/wwell-ir/wwell-ir-design-preview/wwell-ir-design-preview.component.ts" \
  "src/app/features/wwell-planning/wwell-ir/wwell-ir-detail/wwell-ir-detail.component.html" \
  "src/app/features/wwell-planning/wwell-ir/wwell-ir-detail/wwell-ir-detail.component.scss" \
  "src/app/features/wwell-planning/wwell-ir/wwell-ir-detail/wwell-ir-detail.component.ts" \
  "src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.mapper.spec.ts" \
  "src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.mapper.ts" \
  "src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.schema.ts" \
  "src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.types.ts" \
  "src/app/features/wwell-planning/wwell-ir/wwell-ir-new-page/wwell-ir-new-page.component.html" \
  "src/app/features/wwell-planning/wwell-ir/wwell-ir-new-page/wwell-ir-new-page.component.scss" \
  "src/app/features/wwell-planning/wwell-ir/wwell-ir-new-page/wwell-ir-new-page.component.spec.ts" \
  "src/app/features/wwell-planning/wwell-ir/wwell-ir-new-page/wwell-ir-new-page.component.ts"
```

