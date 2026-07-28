# IR & AP Approvals — Consolidated Staged Files

Generated: 2026-07-28 | Branch: `feature/rbac` | Total: 41

---

## Index

1. [src/app/core/models/wwell-planning/wwell-planning.model.ts](#file-1)
2. [src/app/features/wwell-planning/store/wwell-planning.state.ts](#file-2)
3. [src/app/features/wwell-planning/store/wwell-planning.store.ts](#file-3)
4. [src/app/features/wwell-planning/wwell-approvals/wwell-approval-pdf.util.ts](#file-4)
5. [src/app/features/wwell-planning/wwell-approvals/wwell-approval-request.util.ts](#file-5)
6. [src/app/features/wwell-planning/wwell-approvals/wwell-approval-timeline/wwell-approval-mini-chain.component.html](#file-6)
7. [src/app/features/wwell-planning/wwell-approvals/wwell-approval-timeline/wwell-approval-mini-chain.component.scss](#file-7)
8. [src/app/features/wwell-planning/wwell-approvals/wwell-approval-timeline/wwell-approval-mini-chain.component.ts](#file-8)
9. [src/app/features/wwell-planning/wwell-approvals/wwell-approval-timeline/wwell-approval-timeline.component.html](#file-9)
10. [src/app/features/wwell-planning/wwell-approvals/wwell-approval-timeline/wwell-approval-timeline.component.scss](#file-10)
11. [src/app/features/wwell-planning/wwell-approvals/wwell-approval-timeline/wwell-approval-timeline.component.ts](#file-11)
12. [src/app/features/wwell-planning/wwell-approvals/wwell-approvals.component.html](#file-12)
13. [src/app/features/wwell-planning/wwell-approvals/wwell-approvals.component.scss](#file-13)
14. [src/app/features/wwell-planning/wwell-approvals/wwell-approvals.component.ts](#file-14)
15. [src/app/features/wwell-planning/wwell-approvals/wwell-approvals.config.ts](#file-15)
16. [src/app/features/wwell-planning/wwell-approvals/wwell-approvals.mock.ts](#file-16)
17. [src/app/features/wwell-planning/wwell-approvals/wwell-attachment-dropzone/wwell-attachment-dropzone.component.html](#file-17)
18. [src/app/features/wwell-planning/wwell-approvals/wwell-attachment-dropzone/wwell-attachment-dropzone.component.scss](#file-18)
19. [src/app/features/wwell-planning/wwell-approvals/wwell-attachment-dropzone/wwell-attachment-dropzone.component.ts](#file-19)
20. [src/app/features/wwell-planning/wwell-approvals/wwell-ir-approval-request-form/wwell-ir-approval-request-form.component.html](#file-20)
21. [src/app/features/wwell-planning/wwell-approvals/wwell-ir-approval-request-form/wwell-ir-approval-request-form.component.scss](#file-21)
22. [src/app/features/wwell-planning/wwell-approvals/wwell-ir-approval-request-form/wwell-ir-approval-request-form.component.ts](#file-22)
23. [src/app/features/wwell-planning/wwell-approvals/wwell-ir-approval-request-form/wwell-ir-approval-request-form.config.ts](#file-23)
24. [src/app/features/wwell-planning/wwell-approvals/wwell-land-affairs-request-form/wwell-land-affairs-request-form.component.html](#file-24)
25. [src/app/features/wwell-planning/wwell-approvals/wwell-land-affairs-request-form/wwell-land-affairs-request-form.component.scss](#file-25)
26. [src/app/features/wwell-planning/wwell-approvals/wwell-land-affairs-request-form/wwell-land-affairs-request-form.component.ts](#file-26)
27. [src/app/features/wwell-planning/wwell-approvals/wwell-land-affairs-request-form/wwell-land-affairs-request-form.config.ts](#file-27)
28. [src/app/features/wwell-planning/wwell-approvals/wwell-wlda-request-form/wwell-wlda-request-form.component.html](#file-28)
29. [src/app/features/wwell-planning/wwell-approvals/wwell-wlda-request-form/wwell-wlda-request-form.component.scss](#file-29)
30. [src/app/features/wwell-planning/wwell-approvals/wwell-wlda-request-form/wwell-wlda-request-form.component.ts](#file-30)
31. [src/app/features/wwell-planning/wwell-approvals/wwell-wlda-request-form/wwell-wlda-request-form.config.ts](#file-31)
32. [src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.component.html](#file-32)
33. [src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.component.scss](#file-33)
34. [src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.component.ts](#file-34)
35. [src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.config.ts](#file-35)
36. [src/app/features/wwell-planning/wwell-ir/wwell-ir.component.html](#file-36)
37. [src/app/features/wwell-planning/wwell-ir/wwell-ir.component.scss](#file-37)
38. [src/app/features/wwell-planning/wwell-ir/wwell-ir.component.ts](#file-38)
39. [src/app/features/wwell-planning/wwell-ir/wwell-ir.config.ts](#file-39)
40. [src/app/features/wwell-planning/wwell-ir/wwell-ir.mock.ts](#file-40)
41. [src/app/features/wwell-planning/wwell-planning.service.ts](#file-41)

---

## File 1

**`src/app/core/models/wwell-planning/wwell-planning.model.ts`**

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

export interface CreateWwellPlanningRequestPayload {
  readonly client: string;
  readonly supporting: string;
  readonly coordinates: string;
  readonly targetAquifer: string;
  readonly proposedDepth: string;
  readonly businessUse: string;
  readonly priority: WwellPlanningPriority | null;
  readonly assignedTo: string | null;
  readonly notes: string | null;
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

interface ApprovalRequestBase {
  readonly id: string;
  readonly reqNo: string;
  readonly client: string;
  readonly wellName: string;
  readonly submittedBy: string;
  readonly date: string;
  readonly status: ApprovalWorkflowStatus;
  readonly chain: readonly ApprovalChainStep[];
}

export interface WldaApproval extends ApprovalRequestBase {
  readonly supporting: string;
}

export interface LandAffairsApproval extends ApprovalRequestBase {
  readonly x: string;
  readonly y: string;
  readonly utm: string;
}

export interface IrApproval extends ApprovalRequestBase {
  readonly supporting: string;
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

export interface CreateIrApprovalPayload {
  readonly client: string;
  readonly wellName: string;
  readonly supporting: string;
  readonly finalCoordinates: string;
  readonly casingPoints: string;
  readonly topsPicked: string;
  readonly completionType: string;
  readonly drillingMethod: string;
  readonly bitSize: string;
  readonly fluidType: string;
  readonly estimatedYield: string;
  readonly waterQualityTds: string;
  readonly stages: string;
  readonly cementingType: string;
}

export type IntegratedRequirementStatus = 'in-progress' | 'submit-for-review' | 'in-review' | 'approved';

export interface IntegratedRequirementWellDesign {
  readonly casingPoints: string;
  readonly topPicked: string;
  readonly completion: string;
}

export interface IntegratedRequirementDrillingProgram {
  readonly method: string;
  readonly bitSize: string;
  readonly fluidType: string;
  readonly stages: number;
  readonly cementing: string;
}

export interface IntegratedRequirementWaterProduction {
  readonly estYieldGpm: number;
  readonly waterQualityTds: number;
}

export interface IntegratedRequirement {
  readonly id: string;
  readonly code: string;
  readonly wellName: string;
  readonly requestId: string;
  readonly client: string;
  readonly updatedDate: string;
  readonly status: IntegratedRequirementStatus;
  readonly wellDesign: IntegratedRequirementWellDesign;
  readonly drillingProgram: IntegratedRequirementDrillingProgram;
  readonly waterProduction: IntegratedRequirementWaterProduction;
}

export interface CreateIntegratedRequirementPayload {
  readonly wellName: string;
  readonly requestId: string;
  readonly client: string;
  readonly wellDesign: IntegratedRequirementWellDesign;
  readonly drillingProgram: IntegratedRequirementDrillingProgram;
  readonly waterProduction: IntegratedRequirementWaterProduction;
  readonly status: Extract<IntegratedRequirementStatus, 'in-progress'>;
}
```

## File 2

**`src/app/features/wwell-planning/store/wwell-planning.state.ts`**

```typescript
import {
  IntegratedRequirement,
  IrApproval,
  LandAffairsApproval,
  WldaApproval,
  WwellPlanningRequest,
} from '@models/wwell-planning/wwell-planning.model';

export interface WwellPlanningStoreState {
  readonly requests: WwellPlanningRequest[];
  readonly wldaApprovals: WldaApproval[];
  readonly landAffairsApprovals: LandAffairsApproval[];
  readonly irApprovals: IrApproval[];
  readonly integratedRequirements: IntegratedRequirement[];
  readonly requestsLoading: boolean;
  readonly approvalsLoading: boolean;
  readonly integratedRequirementsLoading: boolean;
  readonly creatingRequest: boolean;
  readonly creatingIntegratedRequirement: boolean;
  readonly creatingApproval: boolean;
  readonly error: string | null;
}

export const initialWwellPlanningState: WwellPlanningStoreState = {
  requests: [],
  wldaApprovals: [],
  landAffairsApprovals: [],
  irApprovals: [],
  integratedRequirements: [],
  requestsLoading: false,
  approvalsLoading: false,
  integratedRequirementsLoading: false,
  creatingRequest: false,
  creatingIntegratedRequirement: false,
  creatingApproval: false,
  error: null,
};
```

## File 3

**`src/app/features/wwell-planning/store/wwell-planning.store.ts`**

```typescript
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { tapResponse } from '@ngrx/operators';
import { forkJoin, pipe, switchMap, tap } from 'rxjs';
import {
  CreateIntegratedRequirementPayload,
  CreateIrApprovalPayload,
  CreateLandAffairsApprovalPayload,
  CreateWldaApprovalPayload,
  CreateWwellPlanningRequestPayload,
} from '@models/wwell-planning/wwell-planning.model';
import { WwellPlanningService } from '../wwell-planning.service';
import { WwellPlanningStoreState, initialWwellPlanningState } from './wwell-planning.state';

function errorMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export const WwellPlanningStore = signalStore(
  withState<WwellPlanningStoreState>(initialWwellPlanningState),

  withComputed(({ requestsLoading, approvalsLoading, integratedRequirementsLoading, error }) => ({
    isLoading: computed(() => requestsLoading() || approvalsLoading() || integratedRequirementsLoading()),
    hasError: computed(() => error() !== null),
  })),

  withMethods((store, svc = inject(WwellPlanningService)) => {
    const loadRequests = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { requestsLoading: true, error: null })),
        switchMap(() =>
          svc.getRequests().pipe(
            tapResponse({
              next: requests => patchState(store, { requests, requestsLoading: false }),
              error: (err: unknown) =>
                patchState(store, { requestsLoading: false, error: errorMessage(err, 'Failed to load requests') }),
            }),
          ),
        ),
      ),
    );

    const loadApprovals = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { approvalsLoading: true, error: null })),
        switchMap(() =>
          forkJoin({
            wldaApprovals: svc.getWldaApprovals(),
            landAffairsApprovals: svc.getLandAffairsApprovals(),
            irApprovals: svc.getIrApprovals(),
          }).pipe(
            tapResponse({
              next: result => patchState(store, { ...result, approvalsLoading: false }),
              error: (err: unknown) =>
                patchState(store, { approvalsLoading: false, error: errorMessage(err, 'Failed to load approvals') }),
            }),
          ),
        ),
      ),
    );

    const loadIntegratedRequirements = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { integratedRequirementsLoading: true, error: null })),
        switchMap(() =>
          svc.getIntegratedRequirements().pipe(
            tapResponse({
              next: integratedRequirements => patchState(store, { integratedRequirements, integratedRequirementsLoading: false }),
              error: (err: unknown) =>
                patchState(store, {
                  integratedRequirementsLoading: false,
                  error: errorMessage(err, 'Failed to load integrated requirements'),
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

      loadApprovals(): void {
        loadApprovals();
      },

      loadIntegratedRequirements(): void {
        loadIntegratedRequirements();
      },

      createRequest(payload: CreateWwellPlanningRequestPayload, files: readonly File[] = []): void {
        patchState(store, { creatingRequest: true, error: null });
        svc.createRequest(payload, files).subscribe({
          next: created =>
            patchState(store, {
              requests: [created, ...store.requests()],
              creatingRequest: false,
            }),
          error: (err: unknown) =>
            patchState(store, { creatingRequest: false, error: errorMessage(err, 'Failed to create request') }),
        });
      },

      createIntegratedRequirement(payload: CreateIntegratedRequirementPayload): void {
        patchState(store, { creatingIntegratedRequirement: true, error: null });
        svc.createIntegratedRequirement(payload).subscribe({
          next: created =>
            patchState(store, {
              integratedRequirements: [created, ...store.integratedRequirements()],
              creatingIntegratedRequirement: false,
            }),
          error: (err: unknown) =>
            patchState(store, {
              creatingIntegratedRequirement: false,
              error: errorMessage(err, 'Failed to create integrated requirement'),
            }),
        });
      },

      submitWldaApproval(payload: CreateWldaApprovalPayload, files: readonly File[] = []): void {
        patchState(store, { creatingApproval: true, error: null });
        svc.createWldaApproval(payload, files).subscribe({
          next: created =>
            patchState(store, {
              wldaApprovals: [created, ...store.wldaApprovals()],
              creatingApproval: false,
            }),
          error: (err: unknown) =>
            patchState(store, { creatingApproval: false, error: errorMessage(err, 'Failed to submit WLDA approval request') }),
        });
      },

      submitLandAffairsApproval(payload: CreateLandAffairsApprovalPayload, files: readonly File[] = []): void {
        patchState(store, { creatingApproval: true, error: null });
        svc.createLandAffairsApproval(payload, files).subscribe({
          next: created =>
            patchState(store, {
              landAffairsApprovals: [created, ...store.landAffairsApprovals()],
              creatingApproval: false,
            }),
          error: (err: unknown) =>
            patchState(store, {
              creatingApproval: false,
              error: errorMessage(err, 'Failed to submit Land Affairs approval request'),
            }),
        });
      },

      submitIrApproval(payload: CreateIrApprovalPayload, files: readonly File[] = []): void {
        patchState(store, { creatingApproval: true, error: null });
        svc.createIrApproval(payload, files).subscribe({
          next: created =>
            patchState(store, {
              irApprovals: [created, ...store.irApprovals()],
              creatingApproval: false,
            }),
          error: (err: unknown) =>
            patchState(store, { creatingApproval: false, error: errorMessage(err, 'Failed to submit IR approval request') }),
        });
      },

      setUiError(message: string | null): void {
        patchState(store, { error: message });
      },
    };
  }),
);
```

## File 4

**`src/app/features/wwell-planning/wwell-approvals/wwell-approval-pdf.util.ts`**

```typescript
function escapePdfText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

// Hand-built minimal PDF (byte-accurate xref) so the approval-PDF fallback needs no external library.
export function buildApprovalPdfBlob(title: string, lines: readonly string[]): Blob {
  const encoder = new TextEncoder();
  const textOps = [title, '', ...lines]
    .map((line, i) => `BT /F1 ${i === 0 ? 16 : 11} Tf 72 ${740 - i * 20} Td (${escapePdfText(line)}) Tj ET`)
    .join('\n');
  const contentStream = `${textOps}\n`;
  const contentBytes = encoder.encode(contentStream);

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${contentBytes.length} >>\nstream\n${contentStream}endstream`,
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  objects.forEach((body, i) => {
    offsets.push(encoder.encode(pdf).length);
    pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = encoder.encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.map(offset => `${offset.toString().padStart(10, '0')} 00000 n \n`).join('');
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([encoder.encode(pdf)], { type: 'application/pdf' });
}
```

## File 5

**`src/app/features/wwell-planning/wwell-approvals/wwell-approval-request.util.ts`**

```typescript
import { ApprovalChainStep } from '@models/wwell-planning/wwell-planning.model';

const REQ_NO_MIN = 10000;
const REQ_NO_MAX = 99999;

export function generateApprovalReqNo(): string {
  const digits = Math.floor(Math.random() * (REQ_NO_MAX - REQ_NO_MIN + 1)) + REQ_NO_MIN;
  return `REQ-${digits}`;
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

// Freshly submitted requests start with their first reviewer in progress and the rest unassigned.
export function buildInitialApprovalChain(roles: readonly string[], submittedBy: string): ApprovalChainStep[] {
  return roles.map((role, i) => ({
    role,
    name: i === 0 ? submittedBy : 'Pending Assignment',
    status: i === 0 ? 'in-progress' : 'pending',
    date: null,
  }));
}
```

## File 6

**`src/app/features/wwell-planning/wwell-approvals/wwell-approval-timeline/wwell-approval-mini-chain.component.html`**

```html
<ol class="mini-chain" aria-label="Approval progress">
  @for (step of steps(); track step.role; let last = $last) {
    <li class="mini-chain__item" [attr.data-status]="step.status" [attr.title]="step.role + ': ' + step.status">
      <span class="mini-chain__dot"></span>
      @if (!last) {
        <span class="mini-chain__line" [class.mini-chain__line--filled]="step.status === 'approved'"></span>
      }
    </li>
  }
</ol>
```

## File 7

**`src/app/features/wwell-planning/wwell-approvals/wwell-approval-timeline/wwell-approval-mini-chain.component.scss`**

```scss
:host {
  display: inline-flex;
}

.mini-chain {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style: none;
}

.mini-chain__item {
  display: flex;
  align-items: center;
}

.mini-chain__dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: #cbd5e1;
  flex-shrink: 0;
  transition: background 200ms ease;
}

.mini-chain__item[data-status='approved'] .mini-chain__dot {
  background: #22c55e;
}

.mini-chain__item[data-status='in-progress'] .mini-chain__dot {
  background: #3b82f6;
  animation: mini-chain-pulse 1.4s ease-in-out infinite;
}

.mini-chain__item[data-status='rejected'] .mini-chain__dot {
  background: #ef4444;
}

.mini-chain__line {
  width: 14px;
  height: 2px;
  background: #e2e8f0;
  margin: 0 2px;
  transition: background 200ms ease;
}

.mini-chain__line--filled {
  background: #22c55e;
}

@keyframes mini-chain-pulse {
  0%,
  100% {
    opacity: 0.6;
    transform: scale(0.9);
  }
  50% {
    opacity: 1;
    transform: scale(1.2);
  }
}
```

## File 8

**`src/app/features/wwell-planning/wwell-approvals/wwell-approval-timeline/wwell-approval-mini-chain.component.ts`**

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ApprovalChainStep } from '@models/wwell-planning/wwell-planning.model';

@Component({
  selector: 'app-wwell-approval-mini-chain',
  standalone: true,
  imports: [],
  templateUrl: './wwell-approval-mini-chain.component.html',
  styleUrl: './wwell-approval-mini-chain.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellApprovalMiniChainComponent {
  readonly steps = input.required<readonly ApprovalChainStep[]>();
}
```

## File 9

**`src/app/features/wwell-planning/wwell-approvals/wwell-approval-timeline/wwell-approval-timeline.component.html`**

```html
<div class="approval-timeline">
  @if (reqNo(); as reqNo) {
    <header class="approval-timeline__header">
      <span class="approval-timeline__header-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="14" height="14">
          <path
            d="M12 8v5l3 2M21 12a9 9 0 1 1-9-9 9 9 0 0 1 9 9Z"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
      Approval Chain &mdash; {{ reqNo }}
    </header>
  }

  <ol class="approval-timeline__rail">
    @for (step of steps(); track step.role; let last = $last) {
      <li class="approval-timeline__item" [attr.data-status]="step.status">
        <div class="approval-timeline__track">
          <span class="approval-timeline__node">
            @switch (step.status) {
              @case ('approved') {
                <svg viewBox="0 0 24 24" class="approval-timeline__node-icon" aria-hidden="true">
                  <path
                    d="M5 13l4 4L19 7"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              }
              @case ('rejected') {
                <svg viewBox="0 0 24 24" class="approval-timeline__node-icon" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
                </svg>
              }
              @case ('in-progress') {
                <span class="approval-timeline__pulse"></span>
              }
            }
          </span>
        </div>

        <div class="approval-timeline__card">
          <span class="approval-timeline__role">{{ step.role }}</span>
          <span class="approval-timeline__name">{{ step.name }}</span>
          <span
            class="approval-timeline__badge"
            [style.background]="stepMeta[step.status].bg"
            [style.color]="stepMeta[step.status].color"
          >
            {{ stepMeta[step.status].label }}
          </span>
          @if (step.date) {
            <span class="approval-timeline__date">{{ step.date }}</span>
          }
        </div>
      </li>
    }
  </ol>
</div>
```

## File 10

**`src/app/features/wwell-planning/wwell-approvals/wwell-approval-timeline/wwell-approval-timeline.component.scss`**

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
```

## File 11

**`src/app/features/wwell-planning/wwell-approvals/wwell-approval-timeline/wwell-approval-timeline.component.ts`**

```typescript
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ApprovalChainStep } from '@models/wwell-planning/wwell-planning.model';
import { WWELL_APPROVAL_STEP_STATUS_META } from '../wwell-approvals.config';

@Component({
  selector: 'app-wwell-approval-timeline',
  standalone: true,
  imports: [],
  templateUrl: './wwell-approval-timeline.component.html',
  styleUrl: './wwell-approval-timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellApprovalTimelineComponent {
  readonly reqNo = input<string | null>(null);
  readonly steps = input.required<readonly ApprovalChainStep[]>();

  protected readonly stepMeta = WWELL_APPROVAL_STEP_STATUS_META;
}
```

## File 12

**`src/app/features/wwell-planning/wwell-approvals/wwell-approvals.component.html`**

```html
<section class="wwell-approvals">
  <header class="wwell-approvals__header">
    <div class="wwell-approvals__heading">
      <h1 class="wwell-approvals__title">Approvals</h1>
      <span class="wwell-approvals__count">{{ totalCount() }}</span>
    </div>

    <label class="wwell-approvals__search">
      <mat-icon class="wwell-approvals__search-icon">search</mat-icon>
      <input
        type="search"
        placeholder="Search by req #, client or well name&hellip;"
        [ngModel]="searchTerm()"
        (ngModelChange)="onSearchChange($event)"
      />
    </label>
  </header>

  @if (hasError()) {
    <div class="wwell-approvals__status wwell-approvals__status--error">{{ errorMessage() }}</div>
  }

  <!-- ── Well Location & Drilling Approval (WLDA) ─────────────────────── -->
  <section class="wwell-approvals__panel">
    <header class="wwell-approvals__panel-header">
      <h2 class="wwell-approvals__panel-title">Well Location &amp; Drilling Approval (WLDA)</h2>
      <button type="button" mat-flat-button color="primary" (click)="openWldaRequestDialog()">
        <mat-icon>add</mat-icon>
        Request WLDA Approval
      </button>
    </header>

    @if (isLoading()) {
      <div class="wwell-approvals__status">Loading WLDA approvals&hellip;</div>
    } @else if (wldaRows().length === 0) {
      <div class="wwell-approvals__status">No WLDA approval requests found.</div>
    } @else {
      <div class="wwell-approvals__table-wrap">
        <table class="wwell-approvals__table">
          <thead>
            <tr>
              <th>Req #</th>
              <th>Client</th>
              <th>Water Well Name</th>
              <th>Supporting</th>
              <th>Submitted By</th>
              <th>Date</th>
              <th>Status</th>
              <th>Workflow</th>
              <th class="wwell-approvals__col-actions"></th>
            </tr>
          </thead>
          <tbody>
            @for (row of wldaRows(); track row.id) {
              <tr class="wwell-approvals__row" [class.wwell-approvals__row--expanded]="isExpanded(row.id)" (click)="toggleRow(row.id)">
                <td class="wwell-approvals__req">{{ row.reqNo }}</td>
                <td>{{ row.client }}</td>
                <td>{{ row.wellName }}</td>
                <td>{{ row.supporting }}</td>
                <td>{{ row.submittedBy }}</td>
                <td>{{ row.date }}</td>
                <td>
                  <span
                    class="wwell-approvals__badge"
                    [style.background]="statusMeta[row.status].bg"
                    [style.color]="statusMeta[row.status].color"
                  >
                    <span class="wwell-approvals__badge-dot" [style.background]="statusMeta[row.status].dot"></span>
                    {{ statusMeta[row.status].label }}
                  </span>
                </td>
                <td class="wwell-approvals__workflow-cell">
                  <app-wwell-approval-mini-chain [steps]="row.chain" />
                  @if (isChainComplete(row.chain)) {
                    <button
                      type="button"
                      class="wwell-approvals__pdf-link"
                      [disabled]="isDownloading(row.id)"
                      [attr.aria-label]="'Download WLDA approval PDF for ' + row.reqNo"
                      (click)="$event.stopPropagation(); downloadWldaPdf(row)"
                    >
                      <mat-icon>picture_as_pdf</mat-icon>
                      {{ isDownloading(row.id) ? 'Preparing…' : 'WLDA.pdf' }}
                    </button>
                  }
                </td>
                <td class="wwell-approvals__col-actions">
                  <button
                    type="button"
                    class="wwell-approvals__toggle-btn"
                    [attr.aria-expanded]="isExpanded(row.id)"
                    [attr.aria-label]="(isExpanded(row.id) ? 'Hide' : 'View') + ' approval chain for ' + row.reqNo"
                    (click)="$event.stopPropagation(); toggleRow(row.id)"
                  >
                    <mat-icon>{{ isExpanded(row.id) ? 'expand_less' : 'chevron_right' }}</mat-icon>
                  </button>
                </td>
              </tr>
              @if (isExpanded(row.id)) {
                <tr class="wwell-approvals__detail-row">
                  <td colspan="9">
                    <app-wwell-approval-timeline [reqNo]="row.reqNo" [steps]="row.chain" />
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    }
  </section>

  <!-- ── Land Affairs ─────────────────────────────────────────────────── -->
  <section class="wwell-approvals__panel">
    <header class="wwell-approvals__panel-header">
      <h2 class="wwell-approvals__panel-title">Land Affairs</h2>
      <button type="button" mat-flat-button color="primary" (click)="openLandAffairsRequestDialog()">
        <mat-icon>add</mat-icon>
        Request Land Affairs Approval
      </button>
    </header>

    @if (isLoading()) {
      <div class="wwell-approvals__status">Loading Land Affairs approvals&hellip;</div>
    } @else if (landAffairsRows().length === 0) {
      <div class="wwell-approvals__status">No Land Affairs approval requests found.</div>
    } @else {
      <div class="wwell-approvals__table-wrap">
        <table class="wwell-approvals__table">
          <thead>
            <tr>
              <th>Req #</th>
              <th>Client</th>
              <th>Water Well Name</th>
              <th>X</th>
              <th>Y</th>
              <th>UTM</th>
              <th>Submitted By</th>
              <th>Date</th>
              <th>Status</th>
              <th>Workflow</th>
              <th class="wwell-approvals__col-actions"></th>
            </tr>
          </thead>
          <tbody>
            @for (row of landAffairsRows(); track row.id) {
              <tr class="wwell-approvals__row" [class.wwell-approvals__row--expanded]="isExpanded(row.id)" (click)="toggleRow(row.id)">
                <td class="wwell-approvals__req">{{ row.reqNo }}</td>
                <td>{{ row.client }}</td>
                <td>{{ row.wellName }}</td>
                <td>{{ row.x }}</td>
                <td>{{ row.y }}</td>
                <td>{{ row.utm }}</td>
                <td>{{ row.submittedBy }}</td>
                <td>{{ row.date }}</td>
                <td>
                  <span
                    class="wwell-approvals__badge"
                    [style.background]="statusMeta[row.status].bg"
                    [style.color]="statusMeta[row.status].color"
                  >
                    <span class="wwell-approvals__badge-dot" [style.background]="statusMeta[row.status].dot"></span>
                    {{ statusMeta[row.status].label }}
                  </span>
                </td>
                <td class="wwell-approvals__workflow-cell">
                  <app-wwell-approval-mini-chain [steps]="row.chain" />
                  @if (isChainComplete(row.chain)) {
                    <button
                      type="button"
                      class="wwell-approvals__pdf-link"
                      [disabled]="isDownloading(row.id)"
                      [attr.aria-label]="'Download Land Affairs approval PDF for ' + row.reqNo"
                      (click)="$event.stopPropagation(); downloadLandAffairsPdf(row)"
                    >
                      <mat-icon>picture_as_pdf</mat-icon>
                      {{ isDownloading(row.id) ? 'Preparing…' : 'Land Affairs.pdf' }}
                    </button>
                  }
                </td>
                <td class="wwell-approvals__col-actions">
                  <button
                    type="button"
                    class="wwell-approvals__toggle-btn"
                    [attr.aria-expanded]="isExpanded(row.id)"
                    [attr.aria-label]="(isExpanded(row.id) ? 'Hide' : 'View') + ' approval chain for ' + row.reqNo"
                    (click)="$event.stopPropagation(); toggleRow(row.id)"
                  >
                    <mat-icon>{{ isExpanded(row.id) ? 'expand_less' : 'chevron_right' }}</mat-icon>
                  </button>
                </td>
              </tr>
              @if (isExpanded(row.id)) {
                <tr class="wwell-approvals__detail-row">
                  <td colspan="11">
                    <app-wwell-approval-timeline [reqNo]="row.reqNo" [steps]="row.chain" />
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    }
  </section>

  <!-- ── Integrated Requirements (IR) ─────────────────────────────────── -->
  <section class="wwell-approvals__panel">
    <header class="wwell-approvals__panel-header">
      <h2 class="wwell-approvals__panel-title">Integrated Requirements (IR)</h2>
      <button type="button" mat-flat-button color="primary" (click)="openIrApprovalRequestDialog()">
        <mat-icon>add</mat-icon>
        Request IR Approval
      </button>
    </header>

    @if (isLoading()) {
      <div class="wwell-approvals__status">Loading IR approvals&hellip;</div>
    } @else if (irRows().length === 0) {
      <div class="wwell-approvals__status">No IR approval requests found.</div>
    } @else {
      <div class="wwell-approvals__table-wrap">
        <table class="wwell-approvals__table">
          <thead>
            <tr>
              <th>Req #</th>
              <th>Client</th>
              <th>Water Well Name</th>
              <th>Supporting</th>
              <th>Submitted By</th>
              <th>Date</th>
              <th>Status</th>
              <th>Workflow</th>
              <th class="wwell-approvals__col-actions"></th>
            </tr>
          </thead>
          <tbody>
            @for (row of irRows(); track row.id) {
              <tr class="wwell-approvals__row" [class.wwell-approvals__row--expanded]="isExpanded(row.id)" (click)="toggleRow(row.id)">
                <td class="wwell-approvals__req">{{ row.reqNo }}</td>
                <td>{{ row.client }}</td>
                <td>{{ row.wellName }}</td>
                <td>{{ row.supporting }}</td>
                <td>{{ row.submittedBy }}</td>
                <td>{{ row.date }}</td>
                <td>
                  <span
                    class="wwell-approvals__badge"
                    [style.background]="statusMeta[row.status].bg"
                    [style.color]="statusMeta[row.status].color"
                  >
                    <span class="wwell-approvals__badge-dot" [style.background]="statusMeta[row.status].dot"></span>
                    {{ statusMeta[row.status].label }}
                  </span>
                </td>
                <td class="wwell-approvals__workflow-cell">
                  <app-wwell-approval-mini-chain [steps]="row.chain" />
                  @if (isChainComplete(row.chain)) {
                    <button
                      type="button"
                      class="wwell-approvals__pdf-link"
                      [disabled]="isDownloading(row.id)"
                      [attr.aria-label]="'Download IR approval PDF for ' + row.reqNo"
                      (click)="$event.stopPropagation(); downloadIrPdf(row)"
                    >
                      <mat-icon>picture_as_pdf</mat-icon>
                      {{ isDownloading(row.id) ? 'Preparing…' : 'IR.pdf' }}
                    </button>
                  }
                </td>
                <td class="wwell-approvals__col-actions">
                  <button
                    type="button"
                    class="wwell-approvals__toggle-btn"
                    [attr.aria-expanded]="isExpanded(row.id)"
                    [attr.aria-label]="(isExpanded(row.id) ? 'Hide' : 'View') + ' approval chain for ' + row.reqNo"
                    (click)="$event.stopPropagation(); toggleRow(row.id)"
                  >
                    <mat-icon>{{ isExpanded(row.id) ? 'expand_less' : 'chevron_right' }}</mat-icon>
                  </button>
                </td>
              </tr>
              @if (isExpanded(row.id)) {
                <tr class="wwell-approvals__detail-row">
                  <td colspan="9">
                    <app-wwell-approval-timeline [reqNo]="row.reqNo" [steps]="row.chain" />
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    }
  </section>
</section>
```

## File 13

**`src/app/features/wwell-planning/wwell-approvals/wwell-approvals.component.scss`**

```scss
:host {
  display: block;
  height: 100%;
  overflow: auto;
  background: #f0f4f8;
}

.wwell-approvals {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.5rem;
}

/* ── Header ───────────────────────────────────────────────────── */
.wwell-approvals__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.wwell-approvals__heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.wwell-approvals__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.01em;
}

.wwell-approvals__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 6px;
  border-radius: 999px;
  background: #3b82f6;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
}

.wwell-approvals__search {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.5rem 0.9rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  max-width: 320px;
  width: 100%;
  transition: border-color 150ms ease;

  &:focus-within {
    border-color: #3b82f6;
  }
}

.wwell-approvals__search-icon {
  width: 18px;
  height: 18px;
  font-size: 18px;
  color: #94a3b8;
  flex-shrink: 0;
}

.wwell-approvals__search input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.85rem;
  color: #1e293b;

  &::placeholder {
    color: #94a3b8;
  }

  &::-webkit-search-cancel-button {
    cursor: pointer;
  }
}

.wwell-approvals__status {
  padding: 2rem 1rem;
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;

  &--error {
    color: #dc2626;
  }
}

/* ── Panels ───────────────────────────────────────────────────── */
.wwell-approvals__panel {
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e8edf4;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.06),
    0 4px 12px rgba(59, 130, 246, 0.05);
  overflow: hidden;
}

.wwell-approvals__panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #eef2f7;
}

.wwell-approvals__panel-title {
  margin: 0;
  font-size: 0.98rem;
  font-weight: 800;
  color: #1e293b;
}

/* ── Table ────────────────────────────────────────────────────── */
.wwell-approvals__table-wrap {
  overflow-x: auto;
}

.wwell-approvals__table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.84rem;

  th {
    padding: 0.65rem 1rem;
    text-align: left;
    font-size: 0.7rem;
    font-weight: 800;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: #f8fafc;
    white-space: nowrap;
    border-bottom: 1px solid #eef2f7;
  }

  td {
    padding: 0.75rem 1rem;
    color: #334155;
    white-space: nowrap;
    border-bottom: 1px solid #f1f5f9;
  }
}

.wwell-approvals__col-actions {
  width: 44px;
}

.wwell-approvals__req {
  font-weight: 700;
  color: #3b82f6;
}

.wwell-approvals__row {
  cursor: pointer;
  transition: background 120ms ease;

  &:hover {
    background: #f8fafc;
  }

  &--expanded {
    background: #eff6ff;

    td {
      border-bottom-color: transparent;
    }
  }

  &:last-child td {
    border-bottom: none;
  }
}

.wwell-approvals__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 11px;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 700;
  white-space: nowrap;
}

.wwell-approvals__badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.wwell-approvals__workflow-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.wwell-approvals__pdf-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px 3px 6px;
  border: 1px solid #bbf7d0;
  border-radius: 999px;
  background: #f0fdf4;
  color: #15803d;
  font-size: 0.72rem;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition:
    background 150ms ease,
    border-color 150ms ease;

  &:hover:not(:disabled) {
    background: #dcfce7;
    border-color: #86efac;
  }

  &:disabled {
    cursor: progress;
    opacity: 0.7;
  }

  mat-icon {
    width: 15px;
    height: 15px;
    font-size: 15px;
  }
}

.wwell-approvals__toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  transition:
    background 150ms ease,
    color 150ms ease;

  &:hover {
    background: #e2e8f0;
    color: #1e293b;
  }

  mat-icon {
    width: 20px;
    height: 20px;
    font-size: 20px;
  }
}

.wwell-approvals__detail-row {
  background: #f8fbff;

  td {
    padding: 1rem 1.5rem 1.25rem;
    white-space: normal;
    border-bottom: 1px solid #eef2f7;
  }
}

/* ── Responsive ───────────────────────────────────────────────── */
@media (max-width: 640px) {
  .wwell-approvals {
    padding: 1rem;
  }

  .wwell-approvals__header {
    flex-direction: column;
    align-items: stretch;
  }

  .wwell-approvals__search {
    max-width: none;
  }

  .wwell-approvals__panel-header {
    flex-direction: column;
    align-items: stretch;
  }
}
```

## File 14

**`src/app/features/wwell-planning/wwell-approvals/wwell-approvals.component.ts`**

```typescript
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { ApprovalChainStep, IrApproval, LandAffairsApproval, WldaApproval } from '@models/wwell-planning/wwell-planning.model';
import { WwellPlanningService } from '../wwell-planning.service';
import { WwellPlanningStore } from '../store/wwell-planning.store';
import { WWELL_APPROVAL_STATUS_META } from './wwell-approvals.config';
import { WwellApprovalMiniChainComponent } from './wwell-approval-timeline/wwell-approval-mini-chain.component';
import { WwellApprovalTimelineComponent } from './wwell-approval-timeline/wwell-approval-timeline.component';
import { WwellWldaRequestFormComponent } from './wwell-wlda-request-form/wwell-wlda-request-form.component';
import { WwellLandAffairsRequestFormComponent } from './wwell-land-affairs-request-form/wwell-land-affairs-request-form.component';
import { WwellIrApprovalRequestFormComponent } from './wwell-ir-approval-request-form/wwell-ir-approval-request-form.component';

interface SearchableApproval {
  readonly reqNo: string;
  readonly client: string;
  readonly wellName: string;
}

const SNACKBAR_DURATION_MS = 3000;
const DOWNLOAD_URL_REVOKE_DELAY_MS = 5000;

@Component({
  selector: 'app-wwell-approvals',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatIconModule, WwellApprovalMiniChainComponent, WwellApprovalTimelineComponent],
  templateUrl: './wwell-approvals.component.html',
  styleUrl: './wwell-approvals.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellApprovalsComponent implements OnInit {
  protected readonly store = inject(WwellPlanningStore);
  private readonly svc = inject(WwellPlanningService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  protected readonly isLoading = this.store.approvalsLoading;
  protected readonly hasError = this.store.hasError;
  protected readonly errorMessage = this.store.error;

  protected readonly statusMeta = WWELL_APPROVAL_STATUS_META;

  protected readonly searchTerm = signal('');
  private readonly expandedIds = signal<ReadonlySet<string>>(new Set());
  private readonly downloadingIds = signal<ReadonlySet<string>>(new Set());

  protected readonly wldaRows = computed(() => this.filterRows(this.store.wldaApprovals()));
  protected readonly landAffairsRows = computed(() => this.filterRows(this.store.landAffairsApprovals()));
  protected readonly irRows = computed(() => this.filterRows(this.store.irApprovals()));

  protected readonly totalCount = computed(
    () =>
      this.store.wldaApprovals().length +
      this.store.landAffairsApprovals().length +
      this.store.irApprovals().length,
  );

  ngOnInit(): void {
    this.store.loadApprovals();
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }

  protected isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }

  protected toggleRow(id: string): void {
    const next = new Set(this.expandedIds());
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    this.expandedIds.set(next);
  }

  protected openWldaRequestDialog(): void {
    this.dialog
      .open(WwellWldaRequestFormComponent, { panelClass: 'wwell-wlda-request-form-panel', maxWidth: '95vw', autoFocus: false })
      .afterClosed()
      .subscribe(result => {
        if (!result) return;
        if (result.mode === 'draft') {
          this.snackBar.open('WLDA request saved as draft.', 'Dismiss', { duration: SNACKBAR_DURATION_MS });
          return;
        }
        this.store.submitWldaApproval(result.payload, result.files);
        this.snackBar.open('WLDA approval request submitted.', 'Dismiss', { duration: SNACKBAR_DURATION_MS });
      });
  }

  protected openLandAffairsRequestDialog(): void {
    this.dialog
      .open(WwellLandAffairsRequestFormComponent, {
        panelClass: 'wwell-land-affairs-request-form-panel',
        maxWidth: '95vw',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe(result => {
        if (!result) return;
        if (result.mode === 'draft') {
          this.snackBar.open('Land Affairs request saved as draft.', 'Dismiss', { duration: SNACKBAR_DURATION_MS });
          return;
        }
        this.store.submitLandAffairsApproval(result.payload, result.files);
        this.snackBar.open('Land Affairs approval request submitted.', 'Dismiss', { duration: SNACKBAR_DURATION_MS });
      });
  }

  protected openIrApprovalRequestDialog(): void {
    this.dialog
      .open(WwellIrApprovalRequestFormComponent, {
        panelClass: 'wwell-ir-approval-request-form-panel',
        maxWidth: '95vw',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe(result => {
        if (!result) return;
        if (result.mode === 'draft') {
          this.snackBar.open('IR request saved as draft.', 'Dismiss', { duration: SNACKBAR_DURATION_MS });
          return;
        }
        this.store.submitIrApproval(result.payload, result.files);
        this.snackBar.open('IR approval request submitted.', 'Dismiss', { duration: SNACKBAR_DURATION_MS });
      });
  }

  protected isChainComplete(chain: readonly ApprovalChainStep[]): boolean {
    return chain.length > 0 && chain.every(step => step.status === 'approved');
  }

  protected isDownloading(id: string): boolean {
    return this.downloadingIds().has(id);
  }

  protected downloadWldaPdf(row: WldaApproval): void {
    this.downloadPdf(row.id, `${row.reqNo}-WLDA.pdf`, this.svc.getWldaApprovalPdf(row));
  }

  protected downloadLandAffairsPdf(row: LandAffairsApproval): void {
    this.downloadPdf(row.id, `${row.reqNo}-Land-Affairs.pdf`, this.svc.getLandAffairsApprovalPdf(row));
  }

  protected downloadIrPdf(row: IrApproval): void {
    this.downloadPdf(row.id, `${row.reqNo}-IR.pdf`, this.svc.getIrApprovalPdf(row));
  }

  private downloadPdf(id: string, fileName: string, request$: Observable<Blob>): void {
    if (this.isDownloading(id)) return;

    this.setDownloading(id, true);
    request$.subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = fileName;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        setTimeout(() => URL.revokeObjectURL(url), DOWNLOAD_URL_REVOKE_DELAY_MS);
        this.setDownloading(id, false);
      },
      error: () => {
        this.setDownloading(id, false);
        this.snackBar.open('Failed to download the approval PDF.', 'Dismiss', { duration: SNACKBAR_DURATION_MS });
      },
    });
  }

  private setDownloading(id: string, isDownloading: boolean): void {
    const next = new Set(this.downloadingIds());
    if (isDownloading) {
      next.add(id);
    } else {
      next.delete(id);
    }
    this.downloadingIds.set(next);
  }

  private filterRows<T extends SearchableApproval>(rows: readonly T[]): T[] {
    const term = this.searchTerm().trim().toLowerCase();
    if (!term) return [...rows];

    return rows.filter(
      row =>
        row.reqNo.toLowerCase().includes(term) ||
        row.client.toLowerCase().includes(term) ||
        row.wellName.toLowerCase().includes(term),
    );
  }
}
```

## File 15

**`src/app/features/wwell-planning/wwell-approvals/wwell-approvals.config.ts`**

```typescript
import { ApprovalStepStatus, ApprovalWorkflowStatus } from '@models/wwell-planning/wwell-planning.model';

interface WwellApprovalStatusMeta {
  readonly label: string;
  readonly bg: string;
  readonly color: string;
  readonly dot: string;
}

export const WWELL_APPROVAL_STATUS_META: Record<ApprovalWorkflowStatus, WwellApprovalStatusMeta> = {
  'in-progress': { label: 'In Progress', bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
  submitted: { label: 'Submitted', bg: '#e0e7ff', color: '#4338ca', dot: '#6366f1' },
  'in-review': { label: 'In Review', bg: '#f3e8ff', color: '#7e22ce', dot: '#a855f7' },
  approved: { label: 'Approved', bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
  rejected: { label: 'Rejected', bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
};

export const WWELL_APPROVAL_STEP_STATUS_META: Record<ApprovalStepStatus, WwellApprovalStatusMeta> = {
  approved: { label: 'Approved', bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
  'in-progress': { label: 'In Progress', bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
  pending: { label: 'Pending', bg: '#f1f5f9', color: '#64748b', dot: '#cbd5e1' },
  rejected: { label: 'Rejected', bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
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

## File 16

**`src/app/features/wwell-planning/wwell-approvals/wwell-approvals.mock.ts`**

```typescript
import {
  ApprovalChainStep,
  IrApproval,
  LandAffairsApproval,
  WldaApproval,
} from '@models/wwell-planning/wwell-planning.model';
import { WWELL_IR_CHAIN_ROLES, WWELL_LAND_AFFAIRS_CHAIN_ROLES, WWELL_WLDA_CHAIN_ROLES } from './wwell-approvals.config';

function buildChain(
  roles: readonly string[],
  names: readonly string[],
  dates: readonly string[],
  approvedThrough: number,
  inProgressAt: number | null,
): ApprovalChainStep[] {
  return roles.map((role, i) => ({
    role,
    name: names[i],
    status: i <= approvedThrough ? 'approved' : i === inProgressAt ? 'in-progress' : 'pending',
    date: i <= approvedThrough ? dates[i] : null,
  }));
}

export const WWELL_WLDA_APPROVALS_MOCK: readonly WldaApproval[] = [
  {
    id: 'WLDA-00231',
    reqNo: 'REQ-00231',
    client: 'BI-11',
    wellName: 'KHAJ-300',
    supporting: 'Riyadh GOSP',
    submittedBy: 'Eng. A. Al-Mutairi',
    date: '2026-06-16',
    status: 'in-progress',
    chain: buildChain(
      WWELL_WLDA_CHAIN_ROLES,
      ['Eng. A. Al-Mutairi', 'K. Al-Harbi', 'M. Al-Otaibi', 'SAP System'],
      ['2026-06-17', '', '', ''],
      0,
      1,
    ),
  },
  {
    id: 'WLDA-00242',
    reqNo: 'REQ-00242',
    client: 'BI-34',
    wellName: 'NJRZ-200',
    supporting: 'NJRZ GOSP',
    submittedBy: 'Eng. A. Al-Mutairi',
    date: '2026-06-23',
    status: 'submitted',
    chain: buildChain(
      WWELL_WLDA_CHAIN_ROLES,
      ['Eng. A. Al-Mutairi', 'K. Al-Harbi', 'M. Al-Otaibi', 'SAP System'],
      ['', '', '', ''],
      -1,
      0,
    ),
  },
  {
    id: 'WLDA-00198',
    reqNo: 'REQ-00198',
    client: 'BI-11',
    wellName: 'HAIL-500',
    supporting: 'HAIL GOSP',
    submittedBy: 'Eng. S. Al-Dossari',
    date: '2026-05-20',
    status: 'approved',
    chain: buildChain(
      WWELL_WLDA_CHAIN_ROLES,
      ['Eng. S. Al-Dossari', 'K. Al-Harbi', 'M. Al-Otaibi', 'SAP System'],
      ['2026-05-20', '2026-05-21', '2026-05-22', '2026-05-23'],
      3,
      null,
    ),
  },
  {
    id: 'WLDA-00279',
    reqNo: 'REQ-00279',
    client: 'BI-32',
    wellName: 'ABHA-300',
    supporting: 'Abha GOSP',
    submittedBy: 'Eng. A. Al-Mutairi',
    date: '2026-06-16',
    status: 'in-progress',
    chain: buildChain(
      WWELL_WLDA_CHAIN_ROLES,
      ['Eng. A. Al-Mutairi', 'K. Al-Harbi', 'M. Al-Otaibi', 'SAP System'],
      ['2026-06-18', '', '', ''],
      0,
      1,
    ),
  },
  {
    id: 'WLDA-00281',
    reqNo: 'REQ-00281',
    client: 'BI-11',
    wellName: 'SKAKA-500',
    supporting: 'Skaka GOSP',
    submittedBy: 'Eng. S. Al-Dossari',
    date: '2026-07-04',
    status: 'submitted',
    chain: buildChain(
      WWELL_WLDA_CHAIN_ROLES,
      ['Eng. S. Al-Dossari', 'K. Al-Harbi', 'M. Al-Otaibi', 'SAP System'],
      ['', '', '', ''],
      -1,
      0,
    ),
  },
];

export const WWELL_LAND_AFFAIRS_APPROVALS_MOCK: readonly LandAffairsApproval[] = [
  {
    id: 'LA-00252',
    reqNo: 'REQ-00252',
    client: 'BI-32',
    wellName: 'MADN-100',
    x: '588747.13',
    y: '2712981.45',
    utm: '37N',
    submittedBy: 'Eng. A. Al-Mutairi',
    date: '2026-06-22',
    status: 'in-progress',
    chain: buildChain(
      WWELL_LAND_AFFAIRS_CHAIN_ROLES,
      ['Eng. A. Al-Mutairi', 'S. Al-Ghamdi', 'M. Al-Otaibi'],
      ['2026-06-23', '', ''],
      0,
      1,
    ),
  },
  {
    id: 'LA-00241',
    reqNo: 'REQ-00241',
    client: 'BI-34',
    wellName: 'TBKA-200',
    x: '710884.38',
    y: '3193299.18',
    utm: '37N',
    submittedBy: 'Eng. S. Al-Dossari',
    date: '2026-06-30',
    status: 'approved',
    chain: buildChain(
      WWELL_LAND_AFFAIRS_CHAIN_ROLES,
      ['Eng. S. Al-Dossari', 'S. Al-Ghamdi', 'M. Al-Otaibi'],
      ['2026-06-30', '2026-07-01', '2026-07-02'],
      2,
      null,
    ),
  },
  {
    id: 'LA-00260',
    reqNo: 'REQ-00260',
    client: 'BI-33',
    wellName: 'JZAN-100',
    x: '421335.67',
    y: '1801668.92',
    utm: '38N',
    submittedBy: 'Eng. A. Al-Mutairi',
    date: '2026-06-25',
    status: 'submitted',
    chain: buildChain(
      WWELL_LAND_AFFAIRS_CHAIN_ROLES,
      ['Eng. A. Al-Mutairi', 'S. Al-Ghamdi', 'M. Al-Otaibi'],
      ['', '', ''],
      -1,
      0,
    ),
  },
  {
    id: 'LA-00280',
    reqNo: 'REQ-00280',
    client: 'BI-34',
    wellName: 'BAHA-100',
    x: '718338.94',
    y: '2215089.51',
    utm: '38N',
    submittedBy: 'Eng. A. Al-Mutairi',
    date: '2026-07-02',
    status: 'submitted',
    chain: buildChain(
      WWELL_LAND_AFFAIRS_CHAIN_ROLES,
      ['Eng. A. Al-Mutairi', 'S. Al-Ghamdi', 'M. Al-Otaibi'],
      ['', '', ''],
      -1,
      0,
    ),
  },
];

export const WWELL_IR_APPROVALS_MOCK: readonly IrApproval[] = [
  {
    id: 'IRA-00218',
    reqNo: 'REQ-00218',
    client: 'BI-32',
    wellName: 'RXYD-100',
    supporting: 'WDQS-200',
    submittedBy: 'Eng. A. Al-Mutairi',
    date: '2026-06-18',
    status: 'in-review',
    chain: buildChain(
      WWELL_IR_CHAIN_ROLES,
      ['Eng. A. Al-Mutairi', 'Dr. F. Al-Zahrani', 'M. Al-Otaibi'],
      ['2026-06-19', '2026-06-20', ''],
      1,
      2,
    ),
  },
  {
    id: 'IRA-00205',
    reqNo: 'REQ-00205',
    client: 'BI-11',
    wellName: 'QASS-400',
    supporting: 'QSSM-400',
    submittedBy: 'Eng. S. Al-Dossari',
    date: '2026-05-30',
    status: 'approved',
    chain: buildChain(
      WWELL_IR_CHAIN_ROLES,
      ['Eng. S. Al-Dossari', 'Dr. F. Al-Zahrani', 'M. Al-Otaibi'],
      ['2026-05-30', '2026-05-31', '2026-06-01'],
      2,
      null,
    ),
  },
  {
    id: 'IRA-00271',
    reqNo: 'REQ-00271',
    client: 'BI-33',
    wellName: 'DMAM-200',
    supporting: 'DMMAM-200',
    submittedBy: 'Eng. S. Al-Dossari',
    date: '2026-06-30',
    status: 'in-review',
    chain: buildChain(
      WWELL_IR_CHAIN_ROLES,
      ['Eng. S. Al-Dossari', 'Dr. F. Al-Zahrani', 'M. Al-Otaibi'],
      ['2026-07-01', '2026-07-02', ''],
      1,
      2,
    ),
  },
  {
    id: 'IRA-00266',
    reqNo: 'REQ-00266',
    client: 'BI-32',
    wellName: 'NJRC-200',
    supporting: 'NJRC-200',
    submittedBy: 'Eng. A. Al-Mutairi',
    date: '2026-07-05',
    status: 'in-progress',
    chain: buildChain(
      WWELL_IR_CHAIN_ROLES,
      ['Eng. A. Al-Mutairi', 'Dr. F. Al-Zahrani', 'M. Al-Otaibi'],
      ['2026-07-06', '', ''],
      0,
      1,
    ),
  },
];
```

## File 17

**`src/app/features/wwell-planning/wwell-approvals/wwell-attachment-dropzone/wwell-attachment-dropzone.component.html`**

```html
<div class="wad">
  <label
    class="wad__dropzone"
    [class.wad__dropzone--active]="isDragOver()"
    (dragover)="onDragOver($event)"
    (dragleave)="onDragLeave($event)"
    (drop)="onDrop($event)"
  >
    <input type="file" multiple class="wad__file-input" (change)="onFileInputChange($event)" />
    <mat-icon class="wad__dropzone-icon">attach_file</mat-icon>
    <span class="wad__dropzone-text">{{ hint() }}</span>
  </label>

  @if (attachments().length) {
    <ul class="wad__file-list">
      @for (item of attachments(); track item.id) {
        <li class="wad__file-item">
          <mat-icon class="wad__file-icon">description</mat-icon>
          <span class="wad__file-name">{{ item.file.name }}</span>
          <span class="wad__file-size">{{ fileSizeLabel(item.file.size) }}</span>
          <button
            type="button"
            mat-icon-button
            class="wad__file-remove"
            (click)="removeAttachment(item.id)"
            aria-label="Remove attachment"
          >
            <mat-icon>close</mat-icon>
          </button>
        </li>
      }
    </ul>
  }
</div>
```

## File 18

**`src/app/features/wwell-planning/wwell-approvals/wwell-attachment-dropzone/wwell-attachment-dropzone.component.scss`**

```scss
:host {
  display: block;
}

$navy: #1e293b;
$muted: #64748b;
$border: #e2e8f0;
$accent: #3b82f6;
$bg-subtle: #f8fafc;

.wad {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.wad__dropzone {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 1rem;
  border: 1.5px dashed #93c5fd;
  border-radius: 12px;
  background: $bg-subtle;
  color: $muted;
  cursor: pointer;
  text-align: center;
  transition:
    border-color 150ms ease,
    background 150ms ease;

  &:hover,
  &--active {
    border-color: $accent;
    background: #eff6ff;
  }
}

.wad__dropzone-icon {
  color: $accent;
}

.wad__dropzone-text {
  font-size: 0.8rem;
  max-width: 42ch;
  line-height: 1.4;
}

.wad__file-input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
}

.wad__file-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.wad__file-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.6rem 0.5rem 0.75rem;
  background: $bg-subtle;
  border: 1px solid $border;
  border-radius: 8px;
  font-size: 0.82rem;
  color: $navy;
}

.wad__file-icon {
  color: $accent;
  flex-shrink: 0;
}

.wad__file-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.wad__file-size {
  color: $muted;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.wad__file-remove {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  padding: 0;
}
```

## File 19

**`src/app/features/wwell-planning/wwell-approvals/wwell-attachment-dropzone/wwell-attachment-dropzone.component.ts`**

```typescript
import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

interface AttachmentItem {
  readonly id: string;
  readonly file: File;
}

const MAX_ATTACHMENT_SIZE_BYTES = 25 * 1024 * 1024;
const ALLOWED_ATTACHMENT_EXTENSIONS: readonly string[] = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png'];

@Component({
  selector: 'app-wwell-attachment-dropzone',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './wwell-attachment-dropzone.component.html',
  styleUrl: './wwell-attachment-dropzone.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellAttachmentDropzoneComponent {
  readonly hint = input('Click to attach files');
  readonly filesChange = output<File[]>();

  protected readonly isDragOver = signal(false);
  protected readonly attachments = signal<AttachmentItem[]>([]);

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(true);
  }

  protected onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver.set(false);
    this.addFiles(Array.from(event.dataTransfer?.files ?? []));
  }

  protected onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.addFiles(Array.from(input?.files ?? []));
    if (input) input.value = '';
  }

  protected removeAttachment(id: string): void {
    this.attachments.update(items => items.filter(item => item.id !== id));
    this.emitFiles();
  }

  protected fileSizeLabel(size: number): string {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  private addFiles(selected: File[]): void {
    if (!selected.length) return;

    const valid = selected.filter(file => this.hasAllowedExtension(file) && file.size <= MAX_ATTACHMENT_SIZE_BYTES);
    if (!valid.length) return;

    this.attachments.update(existing => [
      ...existing,
      ...valid.map((file, index) => ({ file, id: `${file.name}-${file.size}-${existing.length + index}` })),
    ]);
    this.emitFiles();
  }

  private emitFiles(): void {
    this.filesChange.emit(this.attachments().map(item => item.file));
  }

  private hasAllowedExtension(file: File): boolean {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    return ALLOWED_ATTACHMENT_EXTENSIONS.includes(ext);
  }
}
```

## File 20

**`src/app/features/wwell-planning/wwell-approvals/wwell-ir-approval-request-form/wwell-ir-approval-request-form.component.html`**

```html
<div class="iraf">
  <header class="iraf__header">
    <div class="iraf__header-copy">
      <h2 class="iraf__title">Request IR Approval</h2>
      <p class="iraf__subtitle">{{ chainSubtitle }}</p>
    </div>
    <button type="button" class="iraf__close" mat-icon-button (click)="close()" aria-label="Close dialog">
      <mat-icon>close</mat-icon>
    </button>
  </header>

  <div class="iraf__body">
    <form class="iraf__form" [formGroup]="form">
      <div class="iraf__grid">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="iraf__field">
          <mat-label>Client</mat-label>
          <mat-select formControlName="client" panelClass="iraf-select-panel">
            @for (opt of clientOptions; track opt) {
              <mat-option [value]="opt">{{ opt }}</mat-option>
            }
          </mat-select>
          @if (form.controls.client.invalid && form.controls.client.touched) {
            <mat-error>Client is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="iraf__field">
          <mat-label>Supporting</mat-label>
          <input matInput formControlName="supporting" placeholder="e.g., WDQS-200 or facility name" />
          @if (form.controls.supporting.invalid && form.controls.supporting.touched) {
            <mat-error>Supporting facility is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="iraf__field">
          <mat-label>Water Well Name</mat-label>
          <input matInput formControlName="wellName" placeholder="e.g., RXYD-100" />
          @if (form.controls.wellName.hasError('required') && form.controls.wellName.touched) {
            <mat-error>Well name is required</mat-error>
          } @else if (form.controls.wellName.hasError('pattern') && form.controls.wellName.touched) {
            <mat-error>4 letters + dash + hundreds, e.g. ABCD-200</mat-error>
          } @else {
            <mat-hint>4 letters + dash + hundreds</mat-hint>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="iraf__field">
          <mat-label>Final Coordinates (Lat, Long)</mat-label>
          <input matInput formControlName="finalCoordinates" placeholder="e.g., 24.1751°N, 47.2951°E" />
          @if (form.controls.finalCoordinates.hasError('required') && form.controls.finalCoordinates.touched) {
            <mat-error>Final coordinates are required</mat-error>
          } @else if (form.controls.finalCoordinates.hasError('pattern') && form.controls.finalCoordinates.touched) {
            <mat-error>Use "lat°N, long°E" format</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="iraf__field">
          <mat-label>Casing Points</mat-label>
          <input matInput formControlName="casingPoints" placeholder="e.g., 120m" />
          @if (form.controls.casingPoints.invalid && form.controls.casingPoints.touched) {
            <mat-error>Casing points are required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="iraf__field">
          <mat-label>Tops Picked</mat-label>
          <mat-select formControlName="topsPicked" panelClass="iraf-select-panel">
            @for (opt of topsOptions; track opt) {
              <mat-option [value]="opt">{{ opt }}</mat-option>
            }
          </mat-select>
          @if (form.controls.topsPicked.invalid && form.controls.topsPicked.touched) {
            <mat-error>Formation top is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="iraf__field">
          <mat-label>Completion Type</mat-label>
          <mat-select formControlName="completionType" panelClass="iraf-select-panel">
            @for (opt of completionOptions; track opt) {
              <mat-option [value]="opt">{{ opt }}</mat-option>
            }
          </mat-select>
          @if (form.controls.completionType.invalid && form.controls.completionType.touched) {
            <mat-error>Completion type is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="iraf__field">
          <mat-label>Drilling Method</mat-label>
          <mat-select formControlName="drillingMethod" panelClass="iraf-select-panel">
            @for (opt of methodOptions; track opt) {
              <mat-option [value]="opt">{{ opt }}</mat-option>
            }
          </mat-select>
          @if (form.controls.drillingMethod.invalid && form.controls.drillingMethod.touched) {
            <mat-error>Drilling method is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="iraf__field">
          <mat-label>Bit Size</mat-label>
          <mat-select formControlName="bitSize" panelClass="iraf-select-panel">
            @for (opt of bitSizeOptions; track opt) {
              <mat-option [value]="opt">{{ opt }}</mat-option>
            }
          </mat-select>
          @if (form.controls.bitSize.invalid && form.controls.bitSize.touched) {
            <mat-error>Bit size is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="iraf__field">
          <mat-label>Fluid Type</mat-label>
          <mat-select formControlName="fluidType" panelClass="iraf-select-panel">
            @for (opt of fluidTypeOptions; track opt) {
              <mat-option [value]="opt">{{ opt }}</mat-option>
            }
          </mat-select>
          @if (form.controls.fluidType.invalid && form.controls.fluidType.touched) {
            <mat-error>Fluid type is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="iraf__field">
          <mat-label>Estimated Yield</mat-label>
          <input matInput formControlName="estimatedYield" placeholder="e.g., 350 GPM" />
          @if (form.controls.estimatedYield.hasError('required') && form.controls.estimatedYield.touched) {
            <mat-error>Estimated yield is required</mat-error>
          } @else if (form.controls.estimatedYield.hasError('pattern') && form.controls.estimatedYield.touched) {
            <mat-error>Use a numeric value, e.g. 350 or 350 GPM</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="iraf__field">
          <mat-label>Water Quality (TDS)</mat-label>
          <input matInput formControlName="waterQualityTds" placeholder="e.g., TDS 1,200 mg/L" />
          @if (form.controls.waterQualityTds.hasError('required') && form.controls.waterQualityTds.touched) {
            <mat-error>Water quality is required</mat-error>
          } @else if (form.controls.waterQualityTds.hasError('pattern') && form.controls.waterQualityTds.touched) {
            <mat-error>Use a numeric value, e.g. TDS 1,200 mg/L</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="iraf__field">
          <mat-label>Stages</mat-label>
          <input matInput type="number" min="1" formControlName="stages" placeholder="e.g., 3" />
          @if (form.controls.stages.invalid && form.controls.stages.touched) {
            <mat-error>Enter at least 1 stage</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="iraf__field">
          <mat-label>Cementing Type</mat-label>
          <mat-select formControlName="cementingType" panelClass="iraf-select-panel">
            @for (opt of cementingOptions; track opt) {
              <mat-option [value]="opt">{{ opt }}</mat-option>
            }
          </mat-select>
          @if (form.controls.cementingType.invalid && form.controls.cementingType.touched) {
            <mat-error>Cementing type is required</mat-error>
          }
        </mat-form-field>
      </div>

      <div class="iraf__attachments">
        <span class="iraf__attachments-label">Attachments</span>
        <app-wwell-attachment-dropzone
          hint="Click to attach files (well design, drilling program, lab results…)"
          (filesChange)="onFilesChange($event)"
        />
      </div>
    </form>
  </div>

  <footer class="iraf__footer">
    <span class="iraf__hint"><span class="iraf__required-mark">*</span> Required fields</span>

    <div class="iraf__actions">
      <button type="button" mat-stroked-button class="iraf__btn-draft" (click)="saveDraft()">
        <mat-icon>bookmark_border</mat-icon>
        Save as Draft
      </button>
      <button type="button" mat-flat-button color="primary" class="iraf__btn-submit" (click)="submit()">
        <mat-icon>send</mat-icon>
        Submit
      </button>
    </div>
  </footer>
</div>
```

## File 21

**`src/app/features/wwell-planning/wwell-approvals/wwell-ir-approval-request-form/wwell-ir-approval-request-form.component.scss`**

```scss
@use '@angular/material' as mat;

/* ── wwell-ir-approval-request-form tokens ─────────────────────── */
$navy: #1e293b;
$muted: #64748b;
$border: #e2e8f0;
$accent: #3b82f6;
$danger: #dc2626;
$bg-subtle: #f8fafc;

/*
 * Same rationale as wwell-request-form.component.scss: the app only calls
 * mat.core() globally, so Material fields here would otherwise resolve
 * unset --mat-sys-* tokens. Scoping a real M3 theme to this dialog (and its
 * portaled select panel) fixes that at the source.
 */
.iraf,
.iraf-select-panel {
  color-scheme: light;

  @include mat.theme(
    (
      color: (
        theme-type: light,
        primary: mat.$blue-palette,
        tertiary: mat.$azure-palette,
      ),
      typography: (
        plain-family: (
          Roboto,
          'Helvetica Neue',
          sans-serif,
        ),
        brand-family: (
          Roboto,
          'Helvetica Neue',
          sans-serif,
        ),
      ),
      density: -1,
    )
  );
}

.iraf {
  @include mat.form-field-overrides(
    (
      outlined-container-shape: 10px,
    )
  );
}

/* ── Dialog surface reset (targets this dialog's overlay only) ──── */
.wwell-ir-approval-request-form-panel .mdc-dialog__surface {
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 16px !important;
  overflow: hidden !important;
}

.iraf-select-panel {
  border-radius: 10px !important;
  box-shadow:
    0 4px 10px rgba(15, 23, 42, 0.12),
    0 12px 28px rgba(15, 23, 42, 0.14) !important;
}

@keyframes irafIn {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.iraf {
  display: flex;
  flex-direction: column;
  width: min(800px, 92vw);
  max-height: min(94vh, 860px);
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid $border;
  box-shadow:
    0 24px 60px rgba(15, 23, 42, 0.18),
    0 4px 14px rgba(15, 23, 42, 0.08);
  overflow: hidden;
  animation: irafIn 260ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@media (prefers-reduced-motion: reduce) {
  .iraf {
    animation: none;
  }
}

.iraf__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.5rem 0.9rem;
  border-bottom: 1px solid $border;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

.iraf__header-copy {
  min-width: 0;
}

.iraf__title {
  margin: 0 0 0.3rem;
  font-size: 1.3rem;
  font-weight: 800;
  color: $navy;
  letter-spacing: -0.01em;
}

.iraf__subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: $muted;
  line-height: 1.4;
}

.iraf__close {
  flex-shrink: 0;
  color: $muted;
  margin-top: -4px;
  transition: color 150ms ease;

  &:hover {
    color: $navy;
  }
}

.iraf__body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem 1.25rem;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.iraf__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem 1.25rem;
  align-items: start;
}

.iraf__field {
  width: 100%;
  border-radius: 10px;
  transition: box-shadow 150ms ease;

  &:focus-within {
    box-shadow: 0 0 0 4px rgba($accent, 0.15);
  }

  &--full {
    grid-column: 1 / -1;
  }
}

.iraf .mat-mdc-form-field-required-marker {
  color: $danger;
}

.iraf__attachments {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.iraf__attachments-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: $navy;
}

.iraf__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1.5rem;
  border-top: 1px solid $border;
  background: $bg-subtle;
}

.iraf__hint {
  font-size: 0.78rem;
  color: $muted;
}

.iraf__required-mark {
  color: $danger;
  font-weight: 700;
}

.iraf__actions {
  display: flex;
  gap: 0.6rem;
}

.iraf__btn-draft,
.iraf__btn-submit {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  mat-icon {
    width: 18px;
    height: 18px;
    font-size: 18px;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .iraf__btn-draft,
  .iraf__btn-submit {
    transition: transform 150ms ease;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      transform: translateY(0) scale(0.97);
    }
  }
}

@media (max-width: 900px) {
  .iraf__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .iraf {
    width: 100vw;
    max-height: 100vh;
    height: 100vh;
    border-radius: 0;
  }

  .iraf__grid {
    grid-template-columns: 1fr;
  }

  .iraf__footer {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .iraf__actions {
    flex-direction: column-reverse;
  }

  .iraf__actions button {
    width: 100%;
    justify-content: center;
  }
}
```

## File 22

**`src/app/features/wwell-planning/wwell-approvals/wwell-ir-approval-request-form/wwell-ir-approval-request-form.component.ts`**

```typescript
import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CreateIrApprovalPayload } from '@models/wwell-planning/wwell-planning.model';
import {
  WWELL_APPROVAL_COORDINATES_PATTERN,
  WWELL_APPROVAL_WELL_NAME_PATTERN,
  WWELL_IR_CHAIN_ROLES,
} from '../wwell-approvals.config';
import { WwellAttachmentDropzoneComponent } from '../wwell-attachment-dropzone/wwell-attachment-dropzone.component';
import {
  WWELL_IR_APPROVAL_FORM_BIT_SIZE_OPTIONS,
  WWELL_IR_APPROVAL_FORM_CEMENTING_OPTIONS,
  WWELL_IR_APPROVAL_FORM_CLIENT_OPTIONS,
  WWELL_IR_APPROVAL_FORM_COMPLETION_OPTIONS,
  WWELL_IR_APPROVAL_FORM_FLUID_TYPE_OPTIONS,
  WWELL_IR_APPROVAL_FORM_METHOD_OPTIONS,
  WWELL_IR_APPROVAL_FORM_TDS_PATTERN,
  WWELL_IR_APPROVAL_FORM_TOPS_OPTIONS,
  WWELL_IR_APPROVAL_FORM_YIELD_PATTERN,
} from './wwell-ir-approval-request-form.config';

export interface WwellIrApprovalRequestFormResult {
  readonly mode: 'draft' | 'submit';
  readonly payload: CreateIrApprovalPayload;
  readonly files: File[];
}

@Component({
  selector: 'app-wwell-ir-approval-request-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    WwellAttachmentDropzoneComponent,
  ],
  templateUrl: './wwell-ir-approval-request-form.component.html',
  styleUrl: './wwell-ir-approval-request-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class WwellIrApprovalRequestFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(
    MatDialogRef<WwellIrApprovalRequestFormComponent, WwellIrApprovalRequestFormResult | undefined>,
  );

  protected readonly clientOptions = WWELL_IR_APPROVAL_FORM_CLIENT_OPTIONS;
  protected readonly topsOptions = WWELL_IR_APPROVAL_FORM_TOPS_OPTIONS;
  protected readonly completionOptions = WWELL_IR_APPROVAL_FORM_COMPLETION_OPTIONS;
  protected readonly methodOptions = WWELL_IR_APPROVAL_FORM_METHOD_OPTIONS;
  protected readonly bitSizeOptions = WWELL_IR_APPROVAL_FORM_BIT_SIZE_OPTIONS;
  protected readonly fluidTypeOptions = WWELL_IR_APPROVAL_FORM_FLUID_TYPE_OPTIONS;
  protected readonly cementingOptions = WWELL_IR_APPROVAL_FORM_CEMENTING_OPTIONS;

  protected readonly chainSubtitle = `Integrated Requirements — ${WWELL_IR_CHAIN_ROLES.length}-step chain: ${WWELL_IR_CHAIN_ROLES.join(' → ')}`;

  private files: File[] = [];

  protected readonly form = this.fb.nonNullable.group({
    client: ['', Validators.required],
    supporting: ['', Validators.required],
    wellName: ['', [Validators.required, Validators.pattern(WWELL_APPROVAL_WELL_NAME_PATTERN)]],
    finalCoordinates: ['', [Validators.required, Validators.pattern(WWELL_APPROVAL_COORDINATES_PATTERN)]],
    casingPoints: ['', Validators.required],
    topsPicked: ['', Validators.required],
    completionType: ['', Validators.required],
    drillingMethod: ['', Validators.required],
    bitSize: ['', Validators.required],
    fluidType: ['', Validators.required],
    estimatedYield: ['', [Validators.required, Validators.pattern(WWELL_IR_APPROVAL_FORM_YIELD_PATTERN)]],
    waterQualityTds: ['', [Validators.required, Validators.pattern(WWELL_IR_APPROVAL_FORM_TDS_PATTERN)]],
    stages: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    cementingType: ['', Validators.required],
  });

  protected close(): void {
    this.dialogRef.close(undefined);
  }

  protected onFilesChange(files: File[]): void {
    this.files = files;
  }

  protected saveDraft(): void {
    this.dialogRef.close({ mode: 'draft', payload: this.toPayload(), files: this.files });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close({ mode: 'submit', payload: this.toPayload(), files: this.files });
  }

  private toPayload(): CreateIrApprovalPayload {
    const value = this.form.getRawValue();
    return {
      client: value.client,
      wellName: value.wellName.toUpperCase(),
      supporting: value.supporting,
      finalCoordinates: value.finalCoordinates,
      casingPoints: value.casingPoints,
      topsPicked: value.topsPicked,
      completionType: value.completionType,
      drillingMethod: value.drillingMethod,
      bitSize: value.bitSize,
      fluidType: value.fluidType,
      estimatedYield: value.estimatedYield,
      waterQualityTds: value.waterQualityTds,
      stages: String(value.stages ?? ''),
      cementingType: value.cementingType,
    };
  }
}
```

## File 23

**`src/app/features/wwell-planning/wwell-approvals/wwell-ir-approval-request-form/wwell-ir-approval-request-form.config.ts`**

```typescript
export { WWELL_REQUEST_CLIENT_OPTIONS as WWELL_IR_APPROVAL_FORM_CLIENT_OPTIONS } from '../../wwell-requests/wwell-request-form/wwell-request-form.config';
export { WWELL_IR_COMPLETION_OPTIONS as WWELL_IR_APPROVAL_FORM_COMPLETION_OPTIONS } from '../../wwell-ir/wwell-ir-form/wwell-ir-form.config';
export { WWELL_IR_METHOD_OPTIONS as WWELL_IR_APPROVAL_FORM_METHOD_OPTIONS } from '../../wwell-ir/wwell-ir-form/wwell-ir-form.config';
export { WWELL_IR_FLUID_TYPE_OPTIONS as WWELL_IR_APPROVAL_FORM_FLUID_TYPE_OPTIONS } from '../../wwell-ir/wwell-ir-form/wwell-ir-form.config';
export { WWELL_IR_CEMENTING_OPTIONS as WWELL_IR_APPROVAL_FORM_CEMENTING_OPTIONS } from '../../wwell-ir/wwell-ir-form/wwell-ir-form.config';

export const WWELL_IR_APPROVAL_FORM_TOPS_OPTIONS: readonly string[] = [
  'Wasia-Biyadh',
  'Umm Er Radhuma',
  'Mirqat',
  'Wajid',
  'Dammam',
];

export const WWELL_IR_APPROVAL_FORM_BIT_SIZE_OPTIONS: readonly string[] = ['8.5"', '9.875"', '12.25"', '14.75"', '17.5"'];

/** Numeric estimated yield with a GPM unit, e.g. "350 GPM" or "350". */
export const WWELL_IR_APPROVAL_FORM_YIELD_PATTERN = /^\d+(\.\d+)?\s?(GPM)?$/i;

/** Numeric TDS reading with optional unit, e.g. "TDS 1,200 mg/L" or "1200". */
export const WWELL_IR_APPROVAL_FORM_TDS_PATTERN = /^(TDS\s?)?\d{1,3}(,\d{3})*(\.\d+)?\s?(mg\/L)?$/i;
```

## File 24

**`src/app/features/wwell-planning/wwell-approvals/wwell-land-affairs-request-form/wwell-land-affairs-request-form.component.html`**

```html
<div class="laf">
  <header class="laf__header">
    <div class="laf__header-copy">
      <h2 class="laf__title">Request Land Affairs Approval</h2>
      <p class="laf__subtitle">{{ chainSubtitle }}</p>
    </div>
    <button type="button" class="laf__close" mat-icon-button (click)="close()" aria-label="Close dialog">
      <mat-icon>close</mat-icon>
    </button>
  </header>

  <div class="laf__body">
    <form class="laf__form" [formGroup]="form">
      <div class="laf__grid">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="laf__field">
          <mat-label>Client</mat-label>
          <mat-select formControlName="client" panelClass="laf-select-panel">
            @for (opt of clientOptions; track opt) {
              <mat-option [value]="opt">{{ opt }}</mat-option>
            }
          </mat-select>
          @if (form.controls.client.invalid && form.controls.client.touched) {
            <mat-error>Client is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="laf__field">
          <mat-label>Water Well Name</mat-label>
          <input matInput formControlName="wellName" placeholder="e.g., MADN-100" />
          @if (form.controls.wellName.hasError('required') && form.controls.wellName.touched) {
            <mat-error>Well name is required</mat-error>
          } @else if (form.controls.wellName.hasError('pattern') && form.controls.wellName.touched) {
            <mat-error>4 letters + dash + hundreds, e.g. ABCD-200</mat-error>
          } @else {
            <mat-hint>4 letters + dash + hundreds</mat-hint>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="laf__field">
          <mat-label>Coordinate X</mat-label>
          <input matInput inputmode="decimal" formControlName="coordinateX" placeholder="e.g., 680542.12" />
          @if (form.controls.coordinateX.invalid && form.controls.coordinateX.touched) {
            <mat-error>Numeric easting value is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="laf__field">
          <mat-label>Coordinate Y</mat-label>
          <input matInput inputmode="decimal" formControlName="coordinateY" placeholder="e.g., 2712983.45" />
          @if (form.controls.coordinateY.invalid && form.controls.coordinateY.touched) {
            <mat-error>Numeric northing value is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="laf__field">
          <mat-label>UTM Zone</mat-label>
          <mat-select formControlName="utmZone" panelClass="laf-select-panel">
            @for (opt of utmZoneOptions; track opt) {
              <mat-option [value]="opt">{{ opt }}</mat-option>
            }
          </mat-select>
          @if (form.controls.utmZone.invalid && form.controls.utmZone.touched) {
            <mat-error>UTM zone is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="laf__field">
          <mat-label>Land Type</mat-label>
          <mat-select formControlName="landType" panelClass="laf-select-panel">
            @for (opt of landTypeOptions; track opt) {
              <mat-option [value]="opt">{{ opt }}</mat-option>
            }
          </mat-select>
          @if (form.controls.landType.invalid && form.controls.landType.touched) {
            <mat-error>Land type is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="laf__field">
          <mat-label>Surveyor</mat-label>
          <mat-select formControlName="surveyor" panelClass="laf-select-panel">
            <mat-option [value]="null">&mdash; Unassigned &mdash;</mat-option>
            @for (opt of surveyorOptions; track opt) {
              <mat-option [value]="opt">{{ opt }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="laf__field">
          <mat-label>Parcel Number</mat-label>
          <input matInput formControlName="parcelNumber" placeholder="e.g., PAR-2026-0123" />
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="laf__field laf__field--full">
          <mat-label>Land Use Notes</mat-label>
          <textarea
            matInput
            rows="3"
            formControlName="notes"
            placeholder="Land ownership details, restrictions..."
          ></textarea>
        </mat-form-field>
      </div>

      <div class="laf__attachments">
        <span class="laf__attachments-label">Attachments</span>
        <app-wwell-attachment-dropzone
          hint="Land deed, survey map, coordinates certificate"
          (filesChange)="onFilesChange($event)"
        />
      </div>
    </form>
  </div>

  <footer class="laf__footer">
    <span class="laf__hint"><span class="laf__required-mark">*</span> Required fields</span>

    <div class="laf__actions">
      <button type="button" mat-stroked-button class="laf__btn-draft" (click)="saveDraft()">
        <mat-icon>bookmark_border</mat-icon>
        Save as Draft
      </button>
      <button type="button" mat-flat-button color="primary" class="laf__btn-submit" (click)="submit()">
        <mat-icon>send</mat-icon>
        Submit
      </button>
    </div>
  </footer>
</div>
```

## File 25

**`src/app/features/wwell-planning/wwell-approvals/wwell-land-affairs-request-form/wwell-land-affairs-request-form.component.scss`**

```scss
@use '@angular/material' as mat;

/* ── wwell-land-affairs-request-form tokens ────────────────────── */
$navy: #1e293b;
$muted: #64748b;
$border: #e2e8f0;
$accent: #3b82f6;
$danger: #dc2626;
$bg-subtle: #f8fafc;

/*
 * Same rationale as wwell-request-form.component.scss: the app only calls
 * mat.core() globally, so Material fields here would otherwise resolve
 * unset --mat-sys-* tokens. Scoping a real M3 theme to this dialog (and its
 * portaled select panel) fixes that at the source.
 */
.laf,
.laf-select-panel {
  color-scheme: light;

  @include mat.theme(
    (
      color: (
        theme-type: light,
        primary: mat.$blue-palette,
        tertiary: mat.$azure-palette,
      ),
      typography: (
        plain-family: (
          Roboto,
          'Helvetica Neue',
          sans-serif,
        ),
        brand-family: (
          Roboto,
          'Helvetica Neue',
          sans-serif,
        ),
      ),
      density: -1,
    )
  );
}

.laf {
  @include mat.form-field-overrides(
    (
      outlined-container-shape: 10px,
    )
  );
}

/* ── Dialog surface reset (targets this dialog's overlay only) ──── */
.wwell-land-affairs-request-form-panel .mdc-dialog__surface {
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 16px !important;
  overflow: hidden !important;
}

.laf-select-panel {
  border-radius: 10px !important;
  box-shadow:
    0 4px 10px rgba(15, 23, 42, 0.12),
    0 12px 28px rgba(15, 23, 42, 0.14) !important;
}

@keyframes lafIn {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.laf {
  display: flex;
  flex-direction: column;
  width: min(720px, 92vw);
  max-height: min(94vh, 780px);
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid $border;
  box-shadow:
    0 24px 60px rgba(15, 23, 42, 0.18),
    0 4px 14px rgba(15, 23, 42, 0.08);
  overflow: hidden;
  animation: lafIn 260ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@media (prefers-reduced-motion: reduce) {
  .laf {
    animation: none;
  }
}

.laf__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.5rem 0.9rem;
  border-bottom: 1px solid $border;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

.laf__header-copy {
  min-width: 0;
}

.laf__title {
  margin: 0 0 0.3rem;
  font-size: 1.3rem;
  font-weight: 800;
  color: $navy;
  letter-spacing: -0.01em;
}

.laf__subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: $muted;
  line-height: 1.4;
}

.laf__close {
  flex-shrink: 0;
  color: $muted;
  margin-top: -4px;
  transition: color 150ms ease;

  &:hover {
    color: $navy;
  }
}

.laf__body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem 1.25rem;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.laf__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem 1.25rem;
  align-items: start;
}

.laf__field {
  width: 100%;
  border-radius: 10px;
  transition: box-shadow 150ms ease;

  &:focus-within {
    box-shadow: 0 0 0 4px rgba($accent, 0.15);
  }

  &--full {
    grid-column: 1 / -1;
  }
}

.laf .mat-mdc-form-field-required-marker {
  color: $danger;
}

.laf__attachments {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.laf__attachments-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: $navy;
}

.laf__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1.5rem;
  border-top: 1px solid $border;
  background: $bg-subtle;
}

.laf__hint {
  font-size: 0.78rem;
  color: $muted;
}

.laf__required-mark {
  color: $danger;
  font-weight: 700;
}

.laf__actions {
  display: flex;
  gap: 0.6rem;
}

.laf__btn-draft,
.laf__btn-submit {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  mat-icon {
    width: 18px;
    height: 18px;
    font-size: 18px;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .laf__btn-draft,
  .laf__btn-submit {
    transition: transform 150ms ease;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      transform: translateY(0) scale(0.97);
    }
  }
}

@media (max-width: 720px) {
  .laf__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .laf {
    width: 100vw;
    max-height: 100vh;
    height: 100vh;
    border-radius: 0;
  }

  .laf__footer {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .laf__actions {
    flex-direction: column-reverse;
  }

  .laf__actions button {
    width: 100%;
    justify-content: center;
  }
}
```

## File 26

**`src/app/features/wwell-planning/wwell-approvals/wwell-land-affairs-request-form/wwell-land-affairs-request-form.component.ts`**

```typescript
import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CreateLandAffairsApprovalPayload } from '@models/wwell-planning/wwell-planning.model';
import { WWELL_APPROVAL_WELL_NAME_PATTERN, WWELL_LAND_AFFAIRS_CHAIN_ROLES } from '../wwell-approvals.config';
import { WwellAttachmentDropzoneComponent } from '../wwell-attachment-dropzone/wwell-attachment-dropzone.component';
import {
  WWELL_LAND_AFFAIRS_FORM_CLIENT_OPTIONS,
  WWELL_LAND_AFFAIRS_FORM_COORDINATE_PATTERN,
  WWELL_LAND_AFFAIRS_FORM_LAND_TYPE_OPTIONS,
  WWELL_LAND_AFFAIRS_FORM_SURVEYOR_OPTIONS,
  WWELL_LAND_AFFAIRS_FORM_UTM_ZONE_OPTIONS,
} from './wwell-land-affairs-request-form.config';

export interface WwellLandAffairsRequestFormResult {
  readonly mode: 'draft' | 'submit';
  readonly payload: CreateLandAffairsApprovalPayload;
  readonly files: File[];
}

@Component({
  selector: 'app-wwell-land-affairs-request-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    WwellAttachmentDropzoneComponent,
  ],
  templateUrl: './wwell-land-affairs-request-form.component.html',
  styleUrl: './wwell-land-affairs-request-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class WwellLandAffairsRequestFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(
    MatDialogRef<WwellLandAffairsRequestFormComponent, WwellLandAffairsRequestFormResult | undefined>,
  );

  protected readonly clientOptions = WWELL_LAND_AFFAIRS_FORM_CLIENT_OPTIONS;
  protected readonly utmZoneOptions = WWELL_LAND_AFFAIRS_FORM_UTM_ZONE_OPTIONS;
  protected readonly landTypeOptions = WWELL_LAND_AFFAIRS_FORM_LAND_TYPE_OPTIONS;
  protected readonly surveyorOptions = WWELL_LAND_AFFAIRS_FORM_SURVEYOR_OPTIONS;

  protected readonly chainSubtitle = `Land Affairs — ${WWELL_LAND_AFFAIRS_CHAIN_ROLES.length}-step chain: ${WWELL_LAND_AFFAIRS_CHAIN_ROLES.join(' → ')}`;

  private files: File[] = [];

  protected readonly form = this.fb.nonNullable.group({
    client: ['', Validators.required],
    wellName: ['', [Validators.required, Validators.pattern(WWELL_APPROVAL_WELL_NAME_PATTERN)]],
    coordinateX: ['', [Validators.required, Validators.pattern(WWELL_LAND_AFFAIRS_FORM_COORDINATE_PATTERN)]],
    coordinateY: ['', [Validators.required, Validators.pattern(WWELL_LAND_AFFAIRS_FORM_COORDINATE_PATTERN)]],
    utmZone: ['', Validators.required],
    landType: ['', Validators.required],
    surveyor: this.fb.control<string | null>(null),
    parcelNumber: this.fb.control<string | null>(null),
    notes: this.fb.control<string | null>(null),
  });

  protected close(): void {
    this.dialogRef.close(undefined);
  }

  protected onFilesChange(files: File[]): void {
    this.files = files;
  }

  protected saveDraft(): void {
    this.dialogRef.close({ mode: 'draft', payload: this.toPayload(), files: this.files });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close({ mode: 'submit', payload: this.toPayload(), files: this.files });
  }

  private toPayload(): CreateLandAffairsApprovalPayload {
    const value = this.form.getRawValue();
    return {
      client: value.client,
      wellName: value.wellName.toUpperCase(),
      coordinateX: value.coordinateX,
      coordinateY: value.coordinateY,
      utmZone: value.utmZone,
      landType: value.landType,
      surveyor: value.surveyor,
      parcelNumber: value.parcelNumber?.trim() || null,
      notes: value.notes?.trim() || null,
    };
  }
}
```

## File 27

**`src/app/features/wwell-planning/wwell-approvals/wwell-land-affairs-request-form/wwell-land-affairs-request-form.config.ts`**

```typescript
export { WWELL_REQUEST_CLIENT_OPTIONS as WWELL_LAND_AFFAIRS_FORM_CLIENT_OPTIONS } from '../../wwell-requests/wwell-request-form/wwell-request-form.config';

export const WWELL_LAND_AFFAIRS_FORM_UTM_ZONE_OPTIONS: readonly string[] = ['36N', '37N', '38N', '39N'];

export const WWELL_LAND_AFFAIRS_FORM_LAND_TYPE_OPTIONS: readonly string[] = [
  'Government',
  'GOSP-Owned',
  'Private',
  'Agricultural',
  'Vacant Land',
];

export const WWELL_LAND_AFFAIRS_FORM_SURVEYOR_OPTIONS: readonly string[] = [
  'S. Al-Ghamdi',
  'H. Al-Zahrani',
  'N. Al-Qahtani',
];

/** UTM northing/easting values, e.g. 680542.12 or 2712983.45. */
export const WWELL_LAND_AFFAIRS_FORM_COORDINATE_PATTERN = /^\d+(\.\d+)?$/;
```

## File 28

**`src/app/features/wwell-planning/wwell-approvals/wwell-wlda-request-form/wwell-wlda-request-form.component.html`**

```html
<div class="wldaf">
  <header class="wldaf__header">
    <div class="wldaf__header-copy">
      <h2 class="wldaf__title">Request WLDA Approval</h2>
      <p class="wldaf__subtitle">{{ chainSubtitle }}</p>
    </div>
    <button type="button" class="wldaf__close" mat-icon-button (click)="close()" aria-label="Close dialog">
      <mat-icon>close</mat-icon>
    </button>
  </header>

  <div class="wldaf__body">
    <form class="wldaf__form" [formGroup]="form">
      <div class="wldaf__grid">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wldaf__field">
          <mat-label>Client</mat-label>
          <mat-select formControlName="client" panelClass="wldaf-select-panel">
            @for (opt of clientOptions; track opt) {
              <mat-option [value]="opt">{{ opt }}</mat-option>
            }
          </mat-select>
          @if (form.controls.client.invalid && form.controls.client.touched) {
            <mat-error>Client is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wldaf__field">
          <mat-label>Water Well Name</mat-label>
          <input matInput formControlName="wellName" placeholder="e.g., KHAJ-300" />
          @if (form.controls.wellName.hasError('required') && form.controls.wellName.touched) {
            <mat-error>Well name is required</mat-error>
          } @else if (form.controls.wellName.hasError('pattern') && form.controls.wellName.touched) {
            <mat-error>4 letters + dash + hundreds, e.g. ABCD-200</mat-error>
          } @else {
            <mat-hint>4 letters + dash + hundreds (ABCD-200)</mat-hint>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wldaf__field">
          <mat-label>Supporting</mat-label>
          <input matInput formControlName="supporting" placeholder="e.g., Riyadh GOSP or well name" />
          @if (form.controls.supporting.invalid && form.controls.supporting.touched) {
            <mat-error>Supporting facility is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wldaf__field">
          <mat-label>Initial Coordinates (Lat, Long)</mat-label>
          <input matInput formControlName="initialCoordinates" placeholder="e.g., 24.1751°N, 47.2951°E" />
          @if (form.controls.initialCoordinates.hasError('required') && form.controls.initialCoordinates.touched) {
            <mat-error>Initial coordinates are required</mat-error>
          } @else if (form.controls.initialCoordinates.hasError('pattern') && form.controls.initialCoordinates.touched) {
            <mat-error>Use "lat°N, long°E" format</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wldaf__field">
          <mat-label>Final Coordinates (Lat, Long)</mat-label>
          <input matInput formControlName="finalCoordinates" placeholder="e.g., 24.1765°N, 47.2960°E" />
          @if (form.controls.finalCoordinates.hasError('pattern') && form.controls.finalCoordinates.touched) {
            <mat-error>Use "lat°N, long°E" format</mat-error>
          } @else {
            <mat-hint>Confirmed after site survey</mat-hint>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wldaf__field">
          <mat-label>Proposed Depth</mat-label>
          <input matInput formControlName="proposedDepth" placeholder="e.g., 180m" />
          @if (form.controls.proposedDepth.hasError('required') && form.controls.proposedDepth.touched) {
            <mat-error>Proposed depth is required</mat-error>
          } @else if (form.controls.proposedDepth.hasError('pattern') && form.controls.proposedDepth.touched) {
            <mat-error>Use a numeric depth in meters, e.g. 180 or 180m</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wldaf__field">
          <mat-label>Target Aquifer</mat-label>
          <mat-select formControlName="targetAquifer" panelClass="wldaf-select-panel">
            @for (opt of aquiferOptions; track opt) {
              <mat-option [value]="opt">{{ opt }}</mat-option>
            }
          </mat-select>
          @if (form.controls.targetAquifer.invalid && form.controls.targetAquifer.touched) {
            <mat-error>Target aquifer is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wldaf__field">
          <mat-label>Business Use</mat-label>
          <mat-select formControlName="businessUse" panelClass="wldaf-select-panel">
            @for (opt of businessUseOptions; track opt) {
              <mat-option [value]="opt">{{ opt }}</mat-option>
            }
          </mat-select>
          @if (form.controls.businessUse.invalid && form.controls.businessUse.touched) {
            <mat-error>Business use is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wldaf__field">
          <mat-label>Drilling Method</mat-label>
          <mat-select formControlName="drillingMethod" panelClass="wldaf-select-panel">
            <mat-option [value]="null">&mdash; Select &mdash;</mat-option>
            @for (opt of drillingMethodOptions; track opt) {
              <mat-option [value]="opt">{{ opt }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wldaf__field">
          <mat-label>Assigned To</mat-label>
          <mat-select formControlName="assignedTo" panelClass="wldaf-select-panel">
            <mat-option [value]="null">&mdash; Unassigned &mdash;</mat-option>
            @for (opt of assigneeOptions; track opt) {
              <mat-option [value]="opt">{{ opt }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wldaf__field wldaf__field--full">
          <mat-label>Additional Notes</mat-label>
          <textarea matInput rows="3" formControlName="notes" placeholder="Any special requirements..."></textarea>
        </mat-form-field>
      </div>

      <div class="wldaf__attachments">
        <span class="wldaf__attachments-label">Attachments</span>
        <app-wwell-attachment-dropzone
          hint="Click to attach files (site plan, coordinates certificate, permits…)"
          (filesChange)="onFilesChange($event)"
        />
      </div>
    </form>
  </div>

  <footer class="wldaf__footer">
    <span class="wldaf__hint"><span class="wldaf__required-mark">*</span> Required fields</span>

    <div class="wldaf__actions">
      <button type="button" mat-stroked-button class="wldaf__btn-draft" (click)="saveDraft()">
        <mat-icon>bookmark_border</mat-icon>
        Save as Draft
      </button>
      <button type="button" mat-flat-button color="primary" class="wldaf__btn-submit" (click)="submit()">
        <mat-icon>send</mat-icon>
        Submit
      </button>
    </div>
  </footer>
</div>
```

## File 29

**`src/app/features/wwell-planning/wwell-approvals/wwell-wlda-request-form/wwell-wlda-request-form.component.scss`**

```scss
@use '@angular/material' as mat;

/* ── wwell-wlda-request-form tokens ────────────────────────────── */
$navy: #1e293b;
$muted: #64748b;
$border: #e2e8f0;
$accent: #3b82f6;
$danger: #dc2626;
$bg-subtle: #f8fafc;

/*
 * Same rationale as wwell-request-form.component.scss: the app only calls
 * mat.core() globally, so Material fields here would otherwise resolve
 * unset --mat-sys-* tokens. Scoping a real M3 theme to this dialog (and its
 * portaled select panel) fixes that at the source.
 */
.wldaf,
.wldaf-select-panel {
  color-scheme: light;

  @include mat.theme(
    (
      color: (
        theme-type: light,
        primary: mat.$blue-palette,
        tertiary: mat.$azure-palette,
      ),
      typography: (
        plain-family: (
          Roboto,
          'Helvetica Neue',
          sans-serif,
        ),
        brand-family: (
          Roboto,
          'Helvetica Neue',
          sans-serif,
        ),
      ),
      density: -1,
    )
  );
}

.wldaf {
  @include mat.form-field-overrides(
    (
      outlined-container-shape: 10px,
    )
  );
}

/* ── Dialog surface reset (targets this dialog's overlay only) ──── */
.wwell-wlda-request-form-panel .mdc-dialog__surface {
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 16px !important;
  overflow: hidden !important;
}

.wldaf-select-panel {
  border-radius: 10px !important;
  box-shadow:
    0 4px 10px rgba(15, 23, 42, 0.12),
    0 12px 28px rgba(15, 23, 42, 0.14) !important;
}

@keyframes wldafIn {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.wldaf {
  display: flex;
  flex-direction: column;
  width: min(760px, 92vw);
  max-height: min(94vh, 820px);
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid $border;
  box-shadow:
    0 24px 60px rgba(15, 23, 42, 0.18),
    0 4px 14px rgba(15, 23, 42, 0.08);
  overflow: hidden;
  animation: wldafIn 260ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@media (prefers-reduced-motion: reduce) {
  .wldaf {
    animation: none;
  }
}

.wldaf__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.5rem 0.9rem;
  border-bottom: 1px solid $border;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

.wldaf__header-copy {
  min-width: 0;
}

.wldaf__title {
  margin: 0 0 0.3rem;
  font-size: 1.3rem;
  font-weight: 800;
  color: $navy;
  letter-spacing: -0.01em;
}

.wldaf__subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: $muted;
  line-height: 1.4;
}

.wldaf__close {
  flex-shrink: 0;
  color: $muted;
  margin-top: -4px;
  transition: color 150ms ease;

  &:hover {
    color: $navy;
  }
}

.wldaf__body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem 1.25rem;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.wldaf__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem 1.25rem;
  align-items: start;
}

.wldaf__field {
  width: 100%;
  border-radius: 10px;
  transition: box-shadow 150ms ease;

  &:focus-within {
    box-shadow: 0 0 0 4px rgba($accent, 0.15);
  }

  &--full {
    grid-column: 1 / -1;
  }
}

.wldaf .mat-mdc-form-field-required-marker {
  color: $danger;
}

.wldaf__attachments {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.wldaf__attachments-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: $navy;
}

.wldaf__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1.5rem;
  border-top: 1px solid $border;
  background: $bg-subtle;
}

.wldaf__hint {
  font-size: 0.78rem;
  color: $muted;
}

.wldaf__required-mark {
  color: $danger;
  font-weight: 700;
}

.wldaf__actions {
  display: flex;
  gap: 0.6rem;
}

.wldaf__btn-draft,
.wldaf__btn-submit {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  mat-icon {
    width: 18px;
    height: 18px;
    font-size: 18px;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .wldaf__btn-draft,
  .wldaf__btn-submit {
    transition: transform 150ms ease;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      transform: translateY(0) scale(0.97);
    }
  }
}

@media (max-width: 720px) {
  .wldaf__grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .wldaf {
    width: 100vw;
    max-height: 100vh;
    height: 100vh;
    border-radius: 0;
  }

  .wldaf__footer {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .wldaf__actions {
    flex-direction: column-reverse;
  }

  .wldaf__actions button {
    width: 100%;
    justify-content: center;
  }
}
```

## File 30

**`src/app/features/wwell-planning/wwell-approvals/wwell-wlda-request-form/wwell-wlda-request-form.component.ts`**

```typescript
import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CreateWldaApprovalPayload } from '@models/wwell-planning/wwell-planning.model';
import {
  WWELL_APPROVAL_COORDINATES_PATTERN,
  WWELL_APPROVAL_WELL_NAME_PATTERN,
  WWELL_WLDA_CHAIN_ROLES,
} from '../wwell-approvals.config';
import { WwellAttachmentDropzoneComponent } from '../wwell-attachment-dropzone/wwell-attachment-dropzone.component';
import {
  WWELL_WLDA_FORM_AQUIFER_OPTIONS,
  WWELL_WLDA_FORM_ASSIGNEE_OPTIONS,
  WWELL_WLDA_FORM_BUSINESS_USE_OPTIONS,
  WWELL_WLDA_FORM_CLIENT_OPTIONS,
  WWELL_WLDA_FORM_DEPTH_PATTERN,
  WWELL_WLDA_FORM_DRILLING_METHOD_OPTIONS,
} from './wwell-wlda-request-form.config';

export interface WwellWldaRequestFormResult {
  readonly mode: 'draft' | 'submit';
  readonly payload: CreateWldaApprovalPayload;
  readonly files: File[];
}

@Component({
  selector: 'app-wwell-wlda-request-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    WwellAttachmentDropzoneComponent,
  ],
  templateUrl: './wwell-wlda-request-form.component.html',
  styleUrl: './wwell-wlda-request-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class WwellWldaRequestFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<WwellWldaRequestFormComponent, WwellWldaRequestFormResult | undefined>);

  protected readonly clientOptions = WWELL_WLDA_FORM_CLIENT_OPTIONS;
  protected readonly aquiferOptions = WWELL_WLDA_FORM_AQUIFER_OPTIONS;
  protected readonly businessUseOptions = WWELL_WLDA_FORM_BUSINESS_USE_OPTIONS;
  protected readonly drillingMethodOptions = WWELL_WLDA_FORM_DRILLING_METHOD_OPTIONS;
  protected readonly assigneeOptions = WWELL_WLDA_FORM_ASSIGNEE_OPTIONS;

  protected readonly chainSubtitle = `Well Location & Drilling Approval — ${WWELL_WLDA_CHAIN_ROLES.length}-step chain: ${WWELL_WLDA_CHAIN_ROLES.join(' → ')}`;

  private files: File[] = [];

  protected readonly form = this.fb.nonNullable.group({
    client: ['', Validators.required],
    wellName: ['', [Validators.required, Validators.pattern(WWELL_APPROVAL_WELL_NAME_PATTERN)]],
    supporting: ['', Validators.required],
    initialCoordinates: ['', [Validators.required, Validators.pattern(WWELL_APPROVAL_COORDINATES_PATTERN)]],
    finalCoordinates: this.fb.control<string | null>(null, Validators.pattern(WWELL_APPROVAL_COORDINATES_PATTERN)),
    proposedDepth: ['', [Validators.required, Validators.pattern(WWELL_WLDA_FORM_DEPTH_PATTERN)]],
    targetAquifer: ['', Validators.required],
    businessUse: ['', Validators.required],
    drillingMethod: this.fb.control<string | null>(null),
    assignedTo: this.fb.control<string | null>(null),
    notes: this.fb.control<string | null>(null),
  });

  protected close(): void {
    this.dialogRef.close(undefined);
  }

  protected onFilesChange(files: File[]): void {
    this.files = files;
  }

  protected saveDraft(): void {
    this.dialogRef.close({ mode: 'draft', payload: this.toPayload(), files: this.files });
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close({ mode: 'submit', payload: this.toPayload(), files: this.files });
  }

  private toPayload(): CreateWldaApprovalPayload {
    const value = this.form.getRawValue();
    return {
      client: value.client,
      wellName: value.wellName.toUpperCase(),
      supporting: value.supporting,
      initialCoordinates: value.initialCoordinates,
      finalCoordinates: value.finalCoordinates?.trim() || null,
      proposedDepth: value.proposedDepth,
      targetAquifer: value.targetAquifer,
      businessUse: value.businessUse,
      drillingMethod: value.drillingMethod,
      assignedTo: value.assignedTo,
      notes: value.notes?.trim() || null,
    };
  }
}
```

## File 31

**`src/app/features/wwell-planning/wwell-approvals/wwell-wlda-request-form/wwell-wlda-request-form.config.ts`**

```typescript
export { WWELL_REQUEST_CLIENT_OPTIONS as WWELL_WLDA_FORM_CLIENT_OPTIONS } from '../../wwell-requests/wwell-request-form/wwell-request-form.config';
export { WWELL_REQUEST_AQUIFER_OPTIONS as WWELL_WLDA_FORM_AQUIFER_OPTIONS } from '../../wwell-requests/wwell-request-form/wwell-request-form.config';
export { WWELL_REQUEST_BUSINESS_USE_OPTIONS as WWELL_WLDA_FORM_BUSINESS_USE_OPTIONS } from '../../wwell-requests/wwell-request-form/wwell-request-form.config';
export { WWELL_REQUEST_ASSIGNEE_OPTIONS as WWELL_WLDA_FORM_ASSIGNEE_OPTIONS } from '../../wwell-requests/wwell-request-form/wwell-request-form.config';
export { WWELL_REQUEST_DEPTH_PATTERN as WWELL_WLDA_FORM_DEPTH_PATTERN } from '../../wwell-requests/wwell-request-form/wwell-request-form.config';
export { WWELL_IR_METHOD_OPTIONS as WWELL_WLDA_FORM_DRILLING_METHOD_OPTIONS } from '../../wwell-ir/wwell-ir-form/wwell-ir-form.config';
```

## File 32

**`src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.component.html`**

```html
<div class="wif">
  <header class="wif__header">
    <div class="wif__header-copy">
      <h2 class="wif__title">New Integrated Requirement</h2>
      <p class="wif__subtitle">Capture well design, drilling program, and water production targets</p>
    </div>
    <button type="button" class="wif__close" mat-icon-button (click)="close()" aria-label="Close dialog">
      <mat-icon>close</mat-icon>
    </button>
  </header>

  <div class="wif__body">
    <form class="wif__form" [formGroup]="form">
      <h3 class="wif__section-title">Request Details</h3>
      <div class="wif__grid">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wif__field">
          <mat-label>Well Name</mat-label>
          <input matInput formControlName="wellName" placeholder="e.g., KHAJ-300" />
          @if (form.controls.wellName.invalid && form.controls.wellName.touched) {
            <mat-error>Well name is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wif__field">
          <mat-label>Related Request</mat-label>
          <input matInput formControlName="requestId" placeholder="e.g., REQ-00231" />
          @if (form.controls.requestId.invalid && form.controls.requestId.touched) {
            <mat-error>Related request is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wif__field">
          <mat-label>Client</mat-label>
          <mat-select formControlName="client" panelClass="wif-select-panel">
            @for (opt of clientOptions; track opt) {
              <mat-option [value]="opt">{{ opt }}</mat-option>
            }
          </mat-select>
          @if (form.controls.client.invalid && form.controls.client.touched) {
            <mat-error>Client is required</mat-error>
          }
        </mat-form-field>
      </div>

      <h3 class="wif__section-title">Well Design</h3>
      <div class="wif__grid" formGroupName="wellDesign">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wif__field">
          <mat-label>Casing Points</mat-label>
          <input matInput formControlName="casingPoints" placeholder="e.g., 120m" />
          @if (form.controls.wellDesign.controls.casingPoints.invalid && form.controls.wellDesign.controls.casingPoints.touched) {
            <mat-error>Casing points are required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wif__field">
          <mat-label>Top Picked</mat-label>
          <input matInput formControlName="topPicked" placeholder="e.g., Wasia-Biyadh" />
          @if (form.controls.wellDesign.controls.topPicked.invalid && form.controls.wellDesign.controls.topPicked.touched) {
            <mat-error>Formation top is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wif__field">
          <mat-label>Completion</mat-label>
          <mat-select formControlName="completion" panelClass="wif-select-panel">
            @for (opt of completionOptions; track opt) {
              <mat-option [value]="opt">{{ opt }}</mat-option>
            }
          </mat-select>
          @if (form.controls.wellDesign.controls.completion.invalid && form.controls.wellDesign.controls.completion.touched) {
            <mat-error>Completion type is required</mat-error>
          }
        </mat-form-field>
      </div>

      <h3 class="wif__section-title">Drilling Program</h3>
      <div class="wif__grid" formGroupName="drillingProgram">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wif__field">
          <mat-label>Method</mat-label>
          <mat-select formControlName="method" panelClass="wif-select-panel">
            @for (opt of methodOptions; track opt) {
              <mat-option [value]="opt">{{ opt }}</mat-option>
            }
          </mat-select>
          @if (form.controls.drillingProgram.controls.method.invalid && form.controls.drillingProgram.controls.method.touched) {
            <mat-error>Drilling method is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wif__field">
          <mat-label>Bit Size</mat-label>
          <input matInput formControlName="bitSize" placeholder='e.g., 12.25"' />
          @if (form.controls.drillingProgram.controls.bitSize.hasError('required') && form.controls.drillingProgram.controls.bitSize.touched) {
            <mat-error>Bit size is required</mat-error>
          } @else if (form.controls.drillingProgram.controls.bitSize.hasError('pattern') && form.controls.drillingProgram.controls.bitSize.touched) {
            <mat-error>Use a numeric size, e.g. 12.25 or 12.25&quot;</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wif__field">
          <mat-label>Fluid Type</mat-label>
          <mat-select formControlName="fluidType" panelClass="wif-select-panel">
            @for (opt of fluidTypeOptions; track opt) {
              <mat-option [value]="opt">{{ opt }}</mat-option>
            }
          </mat-select>
          @if (form.controls.drillingProgram.controls.fluidType.invalid && form.controls.drillingProgram.controls.fluidType.touched) {
            <mat-error>Fluid type is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wif__field">
          <mat-label>Stages</mat-label>
          <input matInput type="number" min="1" formControlName="stages" placeholder="e.g., 3" />
          @if (form.controls.drillingProgram.controls.stages.invalid && form.controls.drillingProgram.controls.stages.touched) {
            <mat-error>Enter at least 1 stage</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wif__field">
          <mat-label>Cementing</mat-label>
          <mat-select formControlName="cementing" panelClass="wif-select-panel">
            @for (opt of cementingOptions; track opt) {
              <mat-option [value]="opt">{{ opt }}</mat-option>
            }
          </mat-select>
          @if (form.controls.drillingProgram.controls.cementing.invalid && form.controls.drillingProgram.controls.cementing.touched) {
            <mat-error>Cementing plan is required</mat-error>
          }
        </mat-form-field>
      </div>

      <h3 class="wif__section-title">Water Production</h3>
      <div class="wif__grid" formGroupName="waterProduction">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wif__field">
          <mat-label>Est. Yield</mat-label>
          <input matInput type="number" min="0" formControlName="estYieldGpm" placeholder="e.g., 350" />
          <span matTextSuffix>&nbsp;GPM</span>
          @if (form.controls.waterProduction.controls.estYieldGpm.invalid && form.controls.waterProduction.controls.estYieldGpm.touched) {
            <mat-error>Estimated yield is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wif__field">
          <mat-label>Water Quality (TDS)</mat-label>
          <input matInput type="number" min="0" formControlName="waterQualityTds" placeholder="e.g., 1200" />
          <span matTextSuffix>&nbsp;mg/L</span>
          @if (form.controls.waterProduction.controls.waterQualityTds.invalid && form.controls.waterProduction.controls.waterQualityTds.touched) {
            <mat-error>Water quality is required</mat-error>
          }
        </mat-form-field>
      </div>
    </form>
  </div>

  <footer class="wif__footer">
    <span class="wif__hint"><span class="wif__required-mark">*</span> Required fields</span>

    <div class="wif__actions">
      <button type="button" mat-stroked-button (click)="close()">Cancel</button>
      <button type="button" mat-flat-button color="primary" class="wif__btn-submit" (click)="create()">
        <mat-icon>add</mat-icon>
        Create
      </button>
    </div>
  </footer>
</div>
```

## File 33

**`src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.component.scss`**

```scss
@use '@angular/material' as mat;

/* ── wwell-ir-form tokens ──────────────────────────────────────── */
$navy:      #1e293b;
$muted:     #64748b;
$border:    #e2e8f0;
$accent:    #3b82f6;
$danger:    #dc2626;
$bg-subtle: #f8fafc;

/*
 * Same rationale as wwell-request-form.component.scss: the app only calls
 * mat.core() globally, so Material fields here would otherwise resolve
 * unset --mat-sys-* tokens. Scoping a real M3 theme to this dialog (and its
 * portaled select panel) fixes that at the source.
 */
.wif,
.wif-select-panel {
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

.wif {
  @include mat.form-field-overrides((
    outlined-container-shape: 10px,
  ));
}

/* ── Dialog surface reset (targets this dialog's overlay only) ──── */
.wwell-ir-form-panel .mdc-dialog__surface {
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 16px !important;
  overflow: hidden !important;
}

.wif-select-panel {
  border-radius: 10px !important;
  box-shadow:
    0 4px 10px rgba(15, 23, 42, 0.12),
    0 12px 28px rgba(15, 23, 42, 0.14) !important;
}

@keyframes wifIn {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.wif {
  display: flex;
  flex-direction: column;
  width: min(760px, 92vw);
  max-height: min(94vh, 820px);
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid $border;
  box-shadow:
    0 24px 60px rgba(15, 23, 42, 0.18),
    0 4px 14px rgba(15, 23, 42, 0.08);
  overflow: hidden;
  animation: wifIn 260ms cubic-bezier(0.16, 1, 0.3, 1) both;
}

@media (prefers-reduced-motion: reduce) {
  .wif {
    animation: none;
  }
}

.wif__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.5rem 0.9rem;
  border-bottom: 1px solid $border;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

.wif__header-copy {
  min-width: 0;
}

.wif__title {
  margin: 0 0 0.3rem;
  font-size: 1.3rem;
  font-weight: 800;
  color: $navy;
  letter-spacing: -0.01em;
}

.wif__subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: $muted;
  line-height: 1.4;
}

.wif__close {
  flex-shrink: 0;
  color: $muted;
  margin-top: -4px;
  transition: color 150ms ease;

  &:hover {
    color: $navy;
  }
}

.wif__body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem 1.25rem;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.wif__section-title {
  margin: 1.1rem 0 0.6rem;
  font-size: 0.72rem;
  font-weight: 800;
  color: $accent;
  text-transform: uppercase;
  letter-spacing: 0.06em;

  &:first-child {
    margin-top: 0;
  }
}

.wif__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem 1.25rem;
  align-items: start;
}

.wif__field {
  width: 100%;
  border-radius: 10px;
  transition: box-shadow 150ms ease;

  &:focus-within {
    box-shadow: 0 0 0 4px rgba($accent, 0.15);
  }
}

.wif .mat-mdc-form-field-required-marker {
  color: $danger;
}

.wif__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1.5rem;
  border-top: 1px solid $border;
  background: $bg-subtle;
}

.wif__hint {
  font-size: 0.78rem;
  color: $muted;
}

.wif__required-mark {
  color: $danger;
  font-weight: 700;
}

.wif__actions {
  display: flex;
  gap: 0.6rem;
}

.wif__btn-submit {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  mat-icon {
    width: 18px;
    height: 18px;
    font-size: 18px;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .wif__btn-submit {
    transition: transform 150ms ease;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      transform: translateY(0) scale(0.97);
    }
  }
}

@media (max-width: 720px) {
  .wif__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .wif {
    width: 100vw;
    max-height: 100vh;
    height: 100vh;
    border-radius: 0;
  }

  .wif__grid {
    grid-template-columns: 1fr;
  }

  .wif__footer {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .wif__actions {
    flex-direction: column-reverse;
  }

  .wif__actions button {
    width: 100%;
    justify-content: center;
  }
}
```

## File 34

**`src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.component.ts`**

```typescript
import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CreateIntegratedRequirementPayload } from '@models/wwell-planning/wwell-planning.model';
import {
  WWELL_IR_BIT_SIZE_PATTERN,
  WWELL_IR_CEMENTING_OPTIONS,
  WWELL_IR_CLIENT_OPTIONS,
  WWELL_IR_COMPLETION_OPTIONS,
  WWELL_IR_FLUID_TYPE_OPTIONS,
  WWELL_IR_METHOD_OPTIONS,
} from './wwell-ir-form.config';

@Component({
  selector: 'app-wwell-ir-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './wwell-ir-form.component.html',
  styleUrl: './wwell-ir-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class WwellIrFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<WwellIrFormComponent, CreateIntegratedRequirementPayload | undefined>);

  protected readonly clientOptions = WWELL_IR_CLIENT_OPTIONS;
  protected readonly completionOptions = WWELL_IR_COMPLETION_OPTIONS;
  protected readonly methodOptions = WWELL_IR_METHOD_OPTIONS;
  protected readonly fluidTypeOptions = WWELL_IR_FLUID_TYPE_OPTIONS;
  protected readonly cementingOptions = WWELL_IR_CEMENTING_OPTIONS;

  protected readonly form = this.fb.nonNullable.group({
    wellName: ['', Validators.required],
    requestId: ['', Validators.required],
    client: ['', Validators.required],
    wellDesign: this.fb.nonNullable.group({
      casingPoints: ['', Validators.required],
      topPicked: ['', Validators.required],
      completion: ['', Validators.required],
    }),
    drillingProgram: this.fb.nonNullable.group({
      method: ['', Validators.required],
      bitSize: ['', [Validators.required, Validators.pattern(WWELL_IR_BIT_SIZE_PATTERN)]],
      fluidType: ['', Validators.required],
      stages: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
      cementing: ['', Validators.required],
    }),
    waterProduction: this.fb.nonNullable.group({
      estYieldGpm: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
      waterQualityTds: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    }),
  });

  protected close(): void {
    this.dialogRef.close(undefined);
  }

  protected create(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: CreateIntegratedRequirementPayload = {
      wellName: value.wellName,
      requestId: value.requestId,
      client: value.client,
      wellDesign: value.wellDesign,
      drillingProgram: {
        method: value.drillingProgram.method,
        bitSize: value.drillingProgram.bitSize,
        fluidType: value.drillingProgram.fluidType,
        stages: value.drillingProgram.stages ?? 0,
        cementing: value.drillingProgram.cementing,
      },
      waterProduction: {
        estYieldGpm: value.waterProduction.estYieldGpm ?? 0,
        waterQualityTds: value.waterProduction.waterQualityTds ?? 0,
      },
      status: 'in-progress',
    };

    this.dialogRef.close(payload);
  }
}
```

## File 35

**`src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.config.ts`**

```typescript
export { WWELL_REQUEST_CLIENT_OPTIONS as WWELL_IR_CLIENT_OPTIONS } from '../../wwell-requests/wwell-request-form/wwell-request-form.config';

export const WWELL_IR_COMPLETION_OPTIONS: readonly string[] = [
  'Open Hole',
  'Screened',
  'Screened + Gravel Pack',
  'Liner + Perforated',
  'Cased & Perforated',
];

export const WWELL_IR_METHOD_OPTIONS: readonly string[] = [
  'Rotary',
  'Rotary + Cable Tool',
  'Cable Tool',
  'Air Rotary',
  'Mud Rotary',
];

export const WWELL_IR_FLUID_TYPE_OPTIONS: readonly string[] = ['Water-based', 'Polymer', 'Bentonite', 'Air/Foam'];

export const WWELL_IR_CEMENTING_OPTIONS: readonly string[] = [
  'Class G',
  'Class G + Additives',
  'Class G + Silica Flour',
  'Class A',
];

/** Matches a numeric bit size with an optional inch mark, e.g. "12.25" or 12.25"". */
export const WWELL_IR_BIT_SIZE_PATTERN = /^\d+(\.\d+)?"?$/;
```

## File 36

**`src/app/features/wwell-planning/wwell-ir/wwell-ir.component.html`**

```html
<section class="wwell-ir">
  <header class="wwell-ir__header">
    <div class="wwell-ir__heading">
      <h1 class="wwell-ir__title">Integrated Requirements</h1>
      <span class="wwell-ir__count">{{ rows().length }}</span>
    </div>

    <button
      type="button"
      mat-flat-button
      color="primary"
      class="wwell-ir__new-btn"
      [disabled]="isCreating()"
      (click)="openNewIrDialog()"
    >
      <mat-icon>add</mat-icon>
      New Integrated Requirement
    </button>
  </header>

  <label class="wwell-ir__search">
    <mat-icon class="wwell-ir__search-icon">search</mat-icon>
    <input
      type="search"
      placeholder="Search integrated requirements&hellip;"
      [ngModel]="searchTerm()"
      (ngModelChange)="onSearchChange($event)"
    />
  </label>

  @if (isLoading()) {
    <div class="wwell-ir__status">Loading integrated requirements&hellip;</div>
  } @else if (hasError()) {
    <div class="wwell-ir__status wwell-ir__status--error">{{ errorMessage() }}</div>
  } @else if (rows().length === 0) {
    <div class="wwell-ir__status">No integrated requirements found.</div>
  } @else {
    <div class="wwell-ir__list">
      @for (ir of rows(); track ir.id) {
        <article class="wwell-ir__row">
          <header class="wwell-ir__row-header">
            <h2 class="wwell-ir__row-title">{{ ir.code }} — {{ ir.wellName }}</h2>

            <span
              class="wwell-ir__badge"
              [style.background]="statusMeta[ir.status].bg"
              [style.color]="statusMeta[ir.status].color"
            >
              <span class="wwell-ir__badge-dot" [style.background]="statusMeta[ir.status].dot"></span>
              {{ statusMeta[ir.status].label }}
            </span>

            <span class="wwell-ir__metrics">
              <strong>{{ ir.waterProduction.estYieldGpm }} GPM</strong>
              <span>TDS {{ ir.waterProduction.waterQualityTds | number }} mg/L</span>
            </span>
          </header>

          <p class="wwell-ir__row-meta">
            Request {{ ir.requestId }} &middot; Client: {{ ir.client }} &middot; Updated {{ ir.updatedDate }}
          </p>

          <div class="wwell-ir__sections">
            <div class="wwell-ir__section">
              <h3 class="wwell-ir__section-title">Well Design</h3>
              <dl class="wwell-ir__fields">
                <div class="wwell-ir__field">
                  <dt>Casing Points</dt>
                  <dd>{{ ir.wellDesign.casingPoints }}</dd>
                </div>
                <div class="wwell-ir__field">
                  <dt>Top Picked</dt>
                  <dd>{{ ir.wellDesign.topPicked }}</dd>
                </div>
                <div class="wwell-ir__field">
                  <dt>Completion</dt>
                  <dd>{{ ir.wellDesign.completion }}</dd>
                </div>
              </dl>
            </div>

            <div class="wwell-ir__section">
              <h3 class="wwell-ir__section-title">Drilling Program</h3>
              <dl class="wwell-ir__fields">
                <div class="wwell-ir__field">
                  <dt>Method</dt>
                  <dd>{{ ir.drillingProgram.method }}</dd>
                </div>
                <div class="wwell-ir__field">
                  <dt>Bit Size</dt>
                  <dd>{{ ir.drillingProgram.bitSize }}</dd>
                </div>
                <div class="wwell-ir__field">
                  <dt>Fluid Type</dt>
                  <dd>{{ ir.drillingProgram.fluidType }}</dd>
                </div>
                <div class="wwell-ir__field">
                  <dt>Stages</dt>
                  <dd>{{ ir.drillingProgram.stages }}</dd>
                </div>
                <div class="wwell-ir__field">
                  <dt>Cementing</dt>
                  <dd>{{ ir.drillingProgram.cementing }}</dd>
                </div>
              </dl>
            </div>

            <div class="wwell-ir__section">
              <h3 class="wwell-ir__section-title">Water Production</h3>
              <dl class="wwell-ir__fields">
                <div class="wwell-ir__field">
                  <dt>Est. Yield</dt>
                  <dd>{{ ir.waterProduction.estYieldGpm }} GPM</dd>
                </div>
                <div class="wwell-ir__field">
                  <dt>Water Quality</dt>
                  <dd>TDS {{ ir.waterProduction.waterQualityTds | number }} mg/L</dd>
                </div>
              </dl>
            </div>
          </div>
        </article>
      }
    </div>
  }
</section>
```

## File 37

**`src/app/features/wwell-planning/wwell-ir/wwell-ir.component.scss`**

```scss
:host {
  display: block;
  height: 100%;
  overflow: auto;
  background: #f0f4f8;
}

.wwell-ir {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding: 1.5rem;
  height: 100%;
}

/* ── Header ───────────────────────────────────────────────────── */
.wwell-ir__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.wwell-ir__heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.wwell-ir__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e293b;
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
  background: #3b82f6;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
}

.wwell-ir__new-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 8px;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.28);

  mat-icon {
    width: 18px;
    height: 18px;
    font-size: 18px;
  }
}

/* ── Search ───────────────────────────────────────────────────── */
.wwell-ir__search {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.5rem 0.9rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  max-width: 340px;
  transition: border-color 150ms ease;

  &:focus-within {
    border-color: #3b82f6;
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
  color: #1e293b;

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
  color: #64748b;
  font-size: 0.9rem;

  &--error {
    color: #dc2626;
  }
}

/* ── Rows ─────────────────────────────────────────────────────── */
.wwell-ir__list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.wwell-ir__row {
  background: #ffffff;
  border: 1px solid #e8edf4;
  border-radius: 12px;
  padding: 1.25rem 1.4rem;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.06),
    0 4px 12px rgba(59, 130, 246, 0.05);
  transition:
    transform 150ms ease,
    box-shadow 150ms ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.08);
  }
}

.wwell-ir__row-header {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.wwell-ir__row-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #1e293b;
}

.wwell-ir__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
}

.wwell-ir__badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.wwell-ir__metrics {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
  font-size: 0.82rem;
  color: #475569;

  strong {
    color: #1e293b;
    font-weight: 800;
  }
}

.wwell-ir__row-meta {
  margin: 0.35rem 0 0;
  font-size: 0.8rem;
  color: #64748b;
}

/* ── Detail sections ──────────────────────────────────────────── */
.wwell-ir__sections {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #eef2f7;
}

.wwell-ir__section-title {
  margin: 0 0 0.6rem;
  font-size: 0.72rem;
  font-weight: 800;
  color: #3b82f6;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.wwell-ir__fields {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.wwell-ir__field {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.82rem;

  dt {
    color: #64748b;
  }

  dd {
    margin: 0;
    color: #1e293b;
    font-weight: 600;
    text-align: right;
  }
}

/* ── Responsive ───────────────────────────────────────────────── */
@media (max-width: 900px) {
  .wwell-ir__sections {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .wwell-ir {
    padding: 1rem;
  }

  .wwell-ir__header {
    flex-direction: column;
    align-items: stretch;
  }

  .wwell-ir__new-btn {
    width: 100%;
    justify-content: center;
  }

  .wwell-ir__search {
    max-width: none;
  }
}
```

## File 38

**`src/app/features/wwell-planning/wwell-ir/wwell-ir.component.ts`**

```typescript
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CreateIntegratedRequirementPayload } from '@models/wwell-planning/wwell-planning.model';
import { WwellPlanningStore } from '../store/wwell-planning.store';
import { WWELL_IR_STATUS_META } from './wwell-ir.config';
import { WwellIrFormComponent } from './wwell-ir-form/wwell-ir-form.component';

@Component({
  selector: 'app-wwell-ir',
  standalone: true,
  imports: [DecimalPipe, FormsModule, MatButtonModule, MatIconModule],
  templateUrl: './wwell-ir.component.html',
  styleUrl: './wwell-ir.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellIrComponent implements OnInit {
  protected readonly store = inject(WwellPlanningStore);
  private readonly dialog = inject(MatDialog);

  protected readonly isLoading = this.store.integratedRequirementsLoading;
  protected readonly isCreating = this.store.creatingIntegratedRequirement;
  protected readonly hasError = this.store.hasError;
  protected readonly errorMessage = this.store.error;

  protected readonly searchTerm = signal('');

  protected readonly rows = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const all = this.store.integratedRequirements();
    if (!term) return all;

    return all.filter(
      ir =>
        ir.code.toLowerCase().includes(term) ||
        ir.wellName.toLowerCase().includes(term) ||
        ir.requestId.toLowerCase().includes(term) ||
        ir.client.toLowerCase().includes(term),
    );
  });

  protected readonly statusMeta = WWELL_IR_STATUS_META;

  ngOnInit(): void {
    this.store.loadIntegratedRequirements();
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
  }

  protected openNewIrDialog(): void {
    this.dialog
      .open<WwellIrFormComponent, unknown, CreateIntegratedRequirementPayload | undefined>(WwellIrFormComponent, {
        panelClass: 'wwell-ir-form-panel',
        maxWidth: '95vw',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe(payload => {
        if (!payload) return;
        this.store.createIntegratedRequirement(payload);
      });
  }
}
```

## File 39

**`src/app/features/wwell-planning/wwell-ir/wwell-ir.config.ts`**

```typescript
import { IntegratedRequirementStatus } from '@models/wwell-planning/wwell-planning.model';

interface WwellIrStatusMeta {
  readonly label: string;
  readonly bg: string;
  readonly color: string;
  readonly dot: string;
}

export const WWELL_IR_STATUS_META: Record<IntegratedRequirementStatus, WwellIrStatusMeta> = {
  'in-progress': { label: 'In Progress', bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
  'submit-for-review': { label: 'Submit for Review', bg: '#3b82f6', color: '#ffffff', dot: '#ffffff' },
  'in-review': { label: 'In Review', bg: '#f3e8ff', color: '#7e22ce', dot: '#a855f7' },
  approved: { label: 'Approved', bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
};
```

## File 40

**`src/app/features/wwell-planning/wwell-ir/wwell-ir.mock.ts`**

```typescript
import { IntegratedRequirement } from '@models/wwell-planning/wwell-planning.model';

export const WWELL_IR_MOCK: readonly IntegratedRequirement[] = [
  {
    id: 'IR-26-001',
    code: 'IR-26-001',
    wellName: 'KHAJ-300',
    requestId: 'REQ-00231',
    client: 'BI-11',
    updatedDate: '2026-06-19',
    status: 'in-progress',
    wellDesign: { casingPoints: '120m', topPicked: 'Wasia-Biyadh', completion: 'Open Hole' },
    drillingProgram: { method: 'Rotary', bitSize: '12.25"', fluidType: 'Water-based', stages: 3, cementing: 'Class G' },
    waterProduction: { estYieldGpm: 350, waterQualityTds: 1200 },
  },
  {
    id: 'IR-26-002',
    code: 'IR-26-002',
    wellName: 'RXYD-100',
    requestId: 'REQ-00218',
    client: 'BI-12',
    updatedDate: '2026-06-17',
    status: 'submit-for-review',
    wellDesign: { casingPoints: '150m', topPicked: 'Umm Er Radhuma', completion: 'Screened' },
    drillingProgram: {
      method: 'Rotary',
      bitSize: '14.75"',
      fluidType: 'Water-based',
      stages: 4,
      cementing: 'Class G + Additives',
    },
    waterProduction: { estYieldGpm: 500, waterQualityTds: 850 },
  },
  {
    id: 'IR-26-003',
    code: 'IR-26-003',
    wellName: 'QASS-400',
    requestId: 'REQ-00205',
    client: 'BI-11',
    updatedDate: '2026-06-01',
    status: 'in-review',
    wellDesign: { casingPoints: '250m', topPicked: 'Mirqat', completion: 'Screened + Gravel Pack' },
    drillingProgram: {
      method: 'Rotary + Cable Tool',
      bitSize: '17.5"',
      fluidType: 'Polymer',
      stages: 5,
      cementing: 'Class G + Silica Flour',
    },
    waterProduction: { estYieldGpm: 700, waterQualityTds: 600 },
  },
  {
    id: 'IR-26-004',
    code: 'IR-26-004',
    wellName: 'ABHA-300',
    requestId: 'REQ-00187',
    client: 'BI-16',
    updatedDate: '2026-05-22',
    status: 'approved',
    wellDesign: { casingPoints: '180m', topPicked: 'Wajid', completion: 'Liner + Perforated' },
    drillingProgram: { method: 'Rotary', bitSize: '12.25"', fluidType: 'Water-based', stages: 3, cementing: 'Class G' },
    waterProduction: { estYieldGpm: 620, waterQualityTds: 780 },
  },
];
```

## File 41

**`src/app/features/wwell-planning/wwell-planning.service.ts`**

```typescript
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import {
  ApprovalChainStep,
  CreateIntegratedRequirementPayload,
  CreateIrApprovalPayload,
  CreateLandAffairsApprovalPayload,
  CreateWldaApprovalPayload,
  CreateWwellPlanningRequestPayload,
  IntegratedRequirement,
  IrApproval,
  LandAffairsApproval,
  WldaApproval,
  WwellPlanningRequest,
} from '@models/wwell-planning/wwell-planning.model';
import { ApiResponse } from 'src/app/shared/models/wwell/api-response.model';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { WWELL_REQUESTS_MOCK } from './wwell-requests/wwell-requests.mock';
import { WWELL_IR_MOCK } from './wwell-ir/wwell-ir.mock';
import {
  WWELL_IR_APPROVALS_MOCK,
  WWELL_LAND_AFFAIRS_APPROVALS_MOCK,
  WWELL_WLDA_APPROVALS_MOCK,
} from './wwell-approvals/wwell-approvals.mock';
import { WWELL_IR_CHAIN_ROLES, WWELL_LAND_AFFAIRS_CHAIN_ROLES, WWELL_WLDA_CHAIN_ROLES } from './wwell-approvals/wwell-approvals.config';
import { buildApprovalPdfBlob } from './wwell-approvals/wwell-approval-pdf.util';
import { buildInitialApprovalChain, generateApprovalReqNo, todayIsoDate } from './wwell-approvals/wwell-approval-request.util';

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

  getIrApprovals(): Observable<IrApproval[]> {
    return this.http.get<ApiResponse<IrApproval>>(`${this.apiUrl}/approvals/ir`).pipe(
      map(res => res.data),
      // TODO: remove fallback once the IR approvals endpoint is live.
      catchError(() => of([...WWELL_IR_APPROVALS_MOCK])),
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

  createIrApproval(payload: CreateIrApprovalPayload, files: readonly File[] = []): Observable<IrApproval> {
    return this.http
      .post<ApiResponse<IrApproval>>(`${this.apiUrl}/approvals/ir`, this.toFormData(payload, files))
      .pipe(
        map(res => res.data[0]),
        // TODO: remove fallback once the IR approval-creation endpoint is live.
        catchError(() => of(this.buildFallbackIrApproval(payload))),
      );
  }

  private toFormData(payload: object, files: readonly File[]): FormData {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
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

  private buildFallbackIrApproval(payload: CreateIrApprovalPayload): IrApproval {
    const reqNo = generateApprovalReqNo();
    return {
      id: `IRA-${reqNo.slice(4)}`,
      reqNo,
      client: payload.client,
      wellName: payload.wellName,
      supporting: payload.supporting,
      submittedBy: 'You',
      date: todayIsoDate(),
      status: 'submitted',
      chain: buildInitialApprovalChain(WWELL_IR_CHAIN_ROLES, 'You'),
    };
  }

  getWldaApprovalPdf(row: WldaApproval): Observable<Blob> {
    return this.fetchApprovalPdf('wlda', row.id, 'WLDA Approval', row);
  }

  getLandAffairsApprovalPdf(row: LandAffairsApproval): Observable<Blob> {
    return this.fetchApprovalPdf('land-affairs', row.id, 'Land Affairs Approval', row);
  }

  getIrApprovalPdf(row: IrApproval): Observable<Blob> {
    return this.fetchApprovalPdf('ir', row.id, 'IR Approval', row);
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
  ): Observable<IntegratedRequirement> {
    return this.http
      .post<ApiResponse<IntegratedRequirement>>(`${this.apiUrl}/integrated-requirements`, payload)
      .pipe(map(res => res.data[0]));
  }
}
```
