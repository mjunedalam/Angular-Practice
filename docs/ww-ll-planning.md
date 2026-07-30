# WWell Planning — Full Source Dump

Full verbatim source of every file under `src/app/features/wwell-planning`, plus the core model it depends on.

## src/app/core/models/wwell-planning/wwell-planning.model.ts

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

export interface CreateIntegratedRequirementPayload
  extends Pick<
    IntegratedRequirement,
    'wellName' | 'requestId' | 'client' | 'wellDesign' | 'drillingProgram' | 'waterProduction'
  > {
  readonly status: Extract<IntegratedRequirementStatus, 'in-progress'>;
}
```

## src/app/features/wwell-planning/shared/_wwell-select-panel-mixin.scss

```scss
/*
 * Shared mat-select polish for every wwell-planning form dialog.
 *
 * Each dialog (wrf, wif, iraf, laf, wldaf) already scopes its own M3 theme to
 * itself and to its portaled `<panel-prefix>-select-panel` (see that
 * component's .scss for why). What's still bare-Material by default:
 *   - option rows have no radius/spacing and snap between states instantly
 *   - the trigger arrow rotates with an 80ms linear transition
 * `panel()` and `trigger()` fill both gaps using each dialog's own $accent /
 * $navy so the result matches that dialog's palette instead of introducing a
 * new one, and reuse the same cubic-bezier(0.16, 1, 0.3, 1) easing already
 * used for the dialog-open/field-in keyframes in these files.
 */

$_ease: cubic-bezier(0.16, 1, 0.3, 1);

@mixin panel($accent, $navy: #1e293b) {
  /*
   * MDC resolves the panel background from --mat-sys-surface-container, which
   * the M3 tonal palette generates as a faint gray/lavender tint rather than
   * pure white — visibly inconsistent with each dialog's own solid #fff
   * surface. Pin it to white here instead of chasing the token in 5 places.
   */
  background-color: #fff !important;
  padding: 6px !important;

  &.mat-select-panel-animations-enabled {
    animation-duration: 160ms;
    animation-timing-function: $_ease;
  }

  .mat-mdc-option {
    border-radius: 8px;
    margin: 2px 0;
    transition: background-color 140ms ease;

    &:hover:not(.mdc-list-item--disabled) {
      background-color: rgba($accent, 0.08);
    }

    &.mat-mdc-option-active,
    &:focus.mdc-list-item {
      background-color: rgba($accent, 0.12);
    }

    &.mdc-list-item--selected:not(.mdc-list-item--disabled):not(.mat-mdc-option-multiple) {
      background-color: rgba($accent, 0.14);

      .mdc-list-item__primary-text {
        color: $navy;
        font-weight: 600;
      }

      .mat-mdc-option-pseudo-checkbox {
        --mat-pseudo-checkbox-minimal-selected-checkmark-color: #{$accent};
      }
    }
  }

  .mat-mdc-optgroup-label {
    font-weight: 700;
    color: $navy;
  }

  scrollbar-width: thin;
  scrollbar-color: rgba($navy, 0.2) transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba($navy, 0.2);
    border-radius: 999px;
  }
}

@mixin trigger($accent) {
  .mat-mdc-select-arrow {
    transition: transform 200ms $_ease !important;
  }

  .mat-select-open .mat-mdc-select-arrow {
    color: $accent;
  }
}
```

## src/app/features/wwell-planning/shared/wwell-approvals/wwell-approval-pdf.util.ts

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

## src/app/features/wwell-planning/shared/wwell-approvals/wwell-approval-request.util.ts

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

## src/app/features/wwell-planning/shared/wwell-approvals/wwell-approval-table/wwell-approval-table.component.html

```html
<div class="wwell-approvals__table-wrap">
  <table class="wwell-approvals__table">
    <thead>
      <tr>
        <th>Req #</th>
        <th>Client</th>
        <th>Water Well Name</th>
        @for (col of columns(); track col.header) {
          <th>{{ col.header }}</th>
        }
        <th>Submitted By</th>
        <th>Date</th>
        <th>Status</th>
        <th>Workflow</th>
        <th class="wwell-approvals__col-actions"></th>
      </tr>
    </thead>
    <tbody>
      @for (row of rows(); track row.id) {
        <tr
          class="wwell-approvals__row"
          [class.wwell-approvals__row--expanded]="isExpanded(row.id)"
          (click)="rowToggle.emit(row.id)"
        >
          <td class="wwell-approvals__req">{{ row.reqNo }}</td>
          <td>{{ row.client }}</td>
          <td>{{ row.wellName }}</td>
          @for (col of columns(); track col.header) {
            <td>{{ col.value(row) }}</td>
          }
          <td>{{ row.submittedBy }}</td>
          <td>{{ row.date }}</td>
          <td>
            <span
              class="wwell-approvals__badge"
              [style.background]="statusMeta()[row.status].bg"
              [style.color]="statusMeta()[row.status].color"
            >
              <span class="wwell-approvals__badge-dot" [style.background]="statusMeta()[row.status].dot"></span>
              {{ statusMeta()[row.status].label }}
            </span>
          </td>
          <td class="wwell-approvals__workflow-cell">
            <app-wwell-approval-mini-chain [steps]="row.chain" />
            @if (isChainComplete(row.chain)) {
              <button
                type="button"
                class="wwell-approvals__pdf-link"
                [disabled]="isDownloading(row.id)"
                [attr.aria-label]="pdfAriaLabel(row)"
                (click)="$event.stopPropagation(); pdfDownload.emit(row)"
              >
                <mat-icon>picture_as_pdf</mat-icon>
                {{ pdfButtonLabel(row) }}
              </button>
            }
          </td>
          <td class="wwell-approvals__col-actions">
            <button
              type="button"
              class="wwell-approvals__toggle-btn"
              [attr.aria-expanded]="isExpanded(row.id)"
              [attr.aria-label]="toggleAriaLabel(row)"
              (click)="$event.stopPropagation(); rowToggle.emit(row.id)"
            >
              <mat-icon>{{ isExpanded(row.id) ? 'expand_less' : 'chevron_right' }}</mat-icon>
            </button>
          </td>
        </tr>
        @if (isExpanded(row.id)) {
          <tr class="wwell-approvals__detail-row">
            <td [attr.colspan]="colspan()">
              <app-wwell-approval-timeline [reqNo]="row.reqNo" [steps]="row.chain" />
            </td>
          </tr>
        }
      }
    </tbody>
  </table>
</div>
```

## src/app/features/wwell-planning/shared/wwell-approvals/wwell-approval-table/wwell-approval-table.component.scss

```scss
:host {
  display: block;
}

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
```

## src/app/features/wwell-planning/shared/wwell-approvals/wwell-approval-table/wwell-approval-table.component.ts

```typescript
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import {
  ApprovalChainStep,
  ApprovalRequestBase,
  ApprovalWorkflowStatus,
} from '@models/wwell-planning/wwell-planning.model';
import { WwellStatusMeta } from '../../wwell-status.config';
import { WwellApprovalMiniChainComponent } from '../wwell-approval-timeline/wwell-approval-mini-chain.component';
import { WwellApprovalTimelineComponent } from '../wwell-approval-timeline/wwell-approval-timeline.component';

export interface WwellApprovalTableColumn<T> {
  readonly header: string;
  readonly value: (row: T) => string;
}

const FIXED_COLUMN_COUNT = 8;

@Component({
  selector: 'app-wwell-approval-table',
  standalone: true,
  imports: [MatIconModule, WwellApprovalMiniChainComponent, WwellApprovalTimelineComponent],
  templateUrl: './wwell-approval-table.component.html',
  styleUrl: './wwell-approval-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellApprovalTableComponent<T extends ApprovalRequestBase> {
  readonly rows = input.required<readonly T[]>();
  readonly columns = input<readonly WwellApprovalTableColumn<T>[]>([]);
  readonly statusMeta = input.required<Record<ApprovalWorkflowStatus, WwellStatusMeta>>();
  readonly expandedIds = input.required<ReadonlySet<string>>();
  readonly downloadingIds = input.required<ReadonlySet<string>>();
  readonly approvalKindLabel = input.required<string>();

  readonly rowToggle = output<string>();
  readonly pdfDownload = output<T>();

  protected readonly colspan = computed(() => FIXED_COLUMN_COUNT + this.columns().length);

  protected isExpanded(id: string): boolean {
    return this.expandedIds().has(id);
  }

  protected isDownloading(id: string): boolean {
    return this.downloadingIds().has(id);
  }

  protected isChainComplete(chain: readonly ApprovalChainStep[]): boolean {
    return chain.length > 0 && chain.every(step => step.status === 'approved');
  }

  protected pdfButtonLabel(row: T): string {
    return this.isDownloading(row.id) ? 'Preparing…' : `${this.approvalKindLabel()}.pdf`;
  }

  protected pdfAriaLabel(row: T): string {
    return `Download ${this.approvalKindLabel()} approval PDF for ${row.reqNo}`;
  }

  protected toggleAriaLabel(row: T): string {
    return `${this.isExpanded(row.id) ? 'Hide' : 'View'} approval chain for ${row.reqNo}`;
  }
}
```

## src/app/features/wwell-planning/shared/wwell-approvals/wwell-approval-timeline/wwell-approval-mini-chain.component.html

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

## src/app/features/wwell-planning/shared/wwell-approvals/wwell-approval-timeline/wwell-approval-mini-chain.component.scss

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

## src/app/features/wwell-planning/shared/wwell-approvals/wwell-approval-timeline/wwell-approval-mini-chain.component.ts

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

## src/app/features/wwell-planning/shared/wwell-approvals/wwell-approval-timeline/wwell-approval-timeline.component.html

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

## src/app/features/wwell-planning/shared/wwell-approvals/wwell-approval-timeline/wwell-approval-timeline.component.scss

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

## src/app/features/wwell-planning/shared/wwell-approvals/wwell-approval-timeline/wwell-approval-timeline.component.ts

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

## src/app/features/wwell-planning/shared/wwell-approvals/wwell-approvals.config.ts

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

/** 4 letters + dash + a 2-4 digit "hundreds" suffix, e.g. KHAJ-300, RXYD-100. */
export const WWELL_APPROVAL_WELL_NAME_PATTERN = /^[A-Za-z]{4}-\d{2,4}$/;

/** Free-form "24.1751°N, 47.2951°E" style pair; hemisphere letters are optional. */
export const WWELL_APPROVAL_COORDINATES_PATTERN =
  /^\s*-?\d{1,3}(\.\d+)?\s*°?\s*[NnSs]?\s*,\s*-?\d{1,3}(\.\d+)?\s*°?\s*[EeWw]?\s*$/;
```

## src/app/features/wwell-planning/shared/wwell-approvals/wwell-approvals.mock.ts

```typescript
import { ApprovalChainStep, LandAffairsApproval, WldaApproval } from '@models/wwell-planning/wwell-planning.model';
import { WWELL_LAND_AFFAIRS_CHAIN_ROLES, WWELL_WLDA_CHAIN_ROLES } from './wwell-approvals.config';

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
```

## src/app/features/wwell-planning/shared/wwell-attachment-dropzone/wwell-attachment-dropzone.component.html

```html
<div class="wad">
  @if (!disabled()) {
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
  }

  @if (displayNames(); as names) {
    @if (names.length) {
      <ul class="wad__file-list">
        @for (name of names; track name) {
          <li class="wad__file-item">
            <mat-icon class="wad__file-icon">description</mat-icon>
            <span class="wad__file-name">{{ name }}</span>
          </li>
        }
      </ul>
    } @else {
      <p class="wad__no-files">No attachments were provided.</p>
    }
  } @else if (attachments().length) {
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

## src/app/features/wwell-planning/shared/wwell-attachment-dropzone/wwell-attachment-dropzone.component.scss

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

  /*
   * This component uses default (emulated) encapsulation, so a plain
   * descendant selector can't reach the touch-target span mat-icon-button
   * renders via its own internal template (it carries that component's
   * scoping attribute, not this one's) — ::ng-deep is required here.
   */
  ::ng-deep .mat-mdc-button-touch-target {
    width: 30px;
    height: 30px;
  }
}

.wad__no-files {
  margin: 0;
  font-size: 0.82rem;
  color: $muted;
  font-style: italic;
}
```

## src/app/features/wwell-planning/shared/wwell-attachment-dropzone/wwell-attachment-dropzone.component.ts

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
  /** When true, hides the dropzone control and shows only a read-only file list (e.g. a "view" dialog mode). */
  readonly disabled = input(false);
  /** When set, renders this fixed list of names read-only instead of the live drag-and-drop attachments. */
  readonly displayNames = input<readonly string[] | null>(null);
  readonly filesChange = output<File[]>();

  protected readonly isDragOver = signal(false);
  protected readonly attachments = signal<AttachmentItem[]>([]);

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.disabled()) return;
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
    if (this.disabled()) return;
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

## src/app/features/wwell-planning/shared/wwell-form-dialog-shell/wwell-form-dialog-shell.component.html

```html
<header class="wfds__header">
  <div class="wfds__header-copy">
    <h2 class="wfds__title">{{ title() }}</h2>
    @if (subtitle()) {
      <p class="wfds__subtitle">{{ subtitle() }}</p>
    }
  </div>
  <button type="button" class="wfds__close" mat-icon-button (click)="closed.emit()" aria-label="Close dialog">
    <mat-icon>close</mat-icon>
  </button>
</header>

<div class="wfds__body">
  <ng-content />
</div>

<footer class="wfds__footer">
  <span class="wfds__hint">
    @if (requiredHint()) {
      <span class="wfds__required-mark">*</span> Required fields
    }
  </span>
  <div class="wfds__actions">
    <ng-content select="[dialogActions]" />
  </div>
</footer>
```

## src/app/features/wwell-planning/shared/wwell-form-dialog-shell/wwell-form-dialog-shell.component.scss

```scss
/* ── wwell-form-dialog-shell tokens ────────────────────────────── */
$navy: #1e293b;
$muted: #64748b;
$border: #e2e8f0;
$danger: #dc2626;
$bg-subtle: #f8fafc;

/*
 * ViewEncapsulation.None (matching wwell-request-form.component.ts) so these
 * chrome rules also reach the buttons projected into [dialogActions] by each
 * consuming dialog — those elements carry the consuming component's own
 * content attribute, not this component's, so emulated encapsulation
 * wouldn't otherwise let a shared selector like .wfds__actions button match.
 */
.wfds__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.1rem 1.5rem 0.9rem;
  border-bottom: 1px solid $border;
  background: linear-gradient(180deg, #f8fbff 0%, #ffffff 100%);
}

.wfds__header-copy {
  min-width: 0;
}

.wfds__title {
  margin: 0 0 0.3rem;
  font-size: 1.3rem;
  font-weight: 800;
  color: $navy;
  letter-spacing: -0.01em;
}

.wfds__subtitle {
  margin: 0;
  font-size: 0.85rem;
  color: $muted;
  line-height: 1.4;
}

.wfds__close {
  flex-shrink: 0;
  color: $muted;
  margin-top: -4px;
  transition: color 150ms ease;

  &:hover {
    color: $navy;
  }
}

.wfds__body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 1.5rem 1.25rem;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.wfds__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1.5rem;
  border-top: 1px solid $border;
  background: $bg-subtle;
}

.wfds__hint {
  font-size: 0.78rem;
  color: $muted;
}

.wfds__required-mark {
  color: $danger;
  font-weight: 700;
}

.wfds__actions {
  display: flex;
  gap: 0.6rem;

  button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  mat-icon {
    width: 18px;
    height: 18px;
    font-size: 18px;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .wfds__actions button {
    transition: transform 150ms ease;

    &:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      transform: translateY(0) scale(0.97);
    }
  }
}

@media (max-width: 640px) {
  .wfds__footer {
    flex-direction: column-reverse;
    align-items: stretch;
  }

  .wfds__actions {
    flex-direction: column-reverse;

    button {
      width: 100%;
      justify-content: center;
    }
  }
}
```

## src/app/features/wwell-planning/shared/wwell-form-dialog-shell/wwell-form-dialog-shell.component.ts

```typescript
import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-wwell-form-dialog-shell',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './wwell-form-dialog-shell.component.html',
  styleUrl: './wwell-form-dialog-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class WwellFormDialogShellComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly requiredHint = input(true);
  readonly closed = output<void>();
}
```

## src/app/features/wwell-planning/shared/wwell-planning-reference-data.config.ts

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
```

## src/app/features/wwell-planning/shared/wwell-status.config.ts

```typescript
export interface WwellStatusMeta {
  readonly label: string;
  readonly bg: string;
  readonly color: string;
  readonly dot: string;
}

interface WwellStatusPalette {
  readonly bg: string;
  readonly color: string;
  readonly dot: string;
}

export const WWELL_STATUS_COLORS = {
  slate: { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
  slateMuted: { bg: '#f1f5f9', color: '#64748b', dot: '#cbd5e1' },
  indigo: { bg: '#e0e7ff', color: '#4338ca', dot: '#6366f1' },
  purple: { bg: '#f3e8ff', color: '#7e22ce', dot: '#a855f7' },
  blue: { bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
  green: { bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
  red: { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
} as const satisfies Record<string, WwellStatusPalette>;

export function wwellStatusMeta(label: string, palette: WwellStatusPalette): WwellStatusMeta {
  return { label, ...palette };
}
```

## src/app/features/wwell-planning/store/wwell-planning.state.ts

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
  requestsError: null,
  approvalsError: null,
  integratedRequirementsError: null,
  createRequestError: null,
  createIntegratedRequirementError: null,
  createApprovalError: null,
};
```

## src/app/features/wwell-planning/store/wwell-planning.store.ts

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
        ].filter((message): message is string => message !== null),
      ),
      hasError: computed(
        () =>
          requestsError() !== null ||
          approvalsError() !== null ||
          integratedRequirementsError() !== null ||
          createRequestError() !== null ||
          createIntegratedRequirementError() !== null ||
          createApprovalError() !== null,
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

      createIntegratedRequirement(payload: CreateIntegratedRequirementPayload): void {
        patchState(store, { creatingIntegratedRequirement: true, createIntegratedRequirementError: null });
        svc.createIntegratedRequirement(payload).subscribe({
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

## src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.component.html

```html
<div class="wif">
  <app-wwell-form-dialog-shell
    title="New Integrated Requirement"
    subtitle="Capture well design, drilling program, and water production targets"
    (closed)="close()"
  >
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

    <ng-container dialogActions>
      <button type="button" mat-stroked-button (click)="close()">Cancel</button>
      <button type="button" mat-flat-button color="primary" (click)="create()">
        <mat-icon>add</mat-icon>
        Create
      </button>
    </ng-container>
  </app-wwell-form-dialog-shell>
</div>
```

## src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.component.scss

```scss
@use '@angular/material' as mat;
@use '../../shared/wwell-select-panel-mixin' as wsel;

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
  @include wsel.panel($accent, $navy);
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
  @include wsel.trigger($accent);
}

@media (prefers-reduced-motion: reduce) {
  .wif {
    animation: none;
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
}
```

## src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.component.ts

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
import { WwellFormDialogShellComponent } from '../../shared/wwell-form-dialog-shell/wwell-form-dialog-shell.component';
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
    WwellFormDialogShellComponent,
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

## src/app/features/wwell-planning/wwell-ir/wwell-ir-form/wwell-ir-form.config.ts

```typescript
export { WWELL_CLIENT_OPTIONS as WWELL_IR_CLIENT_OPTIONS } from '../../shared/wwell-planning-reference-data.config';
export { WWELL_COMPLETION_OPTIONS as WWELL_IR_COMPLETION_OPTIONS } from '../../shared/wwell-planning-reference-data.config';
export { WWELL_DRILLING_METHOD_OPTIONS as WWELL_IR_METHOD_OPTIONS } from '../../shared/wwell-planning-reference-data.config';
export { WWELL_FLUID_TYPE_OPTIONS as WWELL_IR_FLUID_TYPE_OPTIONS } from '../../shared/wwell-planning-reference-data.config';
export { WWELL_CEMENTING_OPTIONS as WWELL_IR_CEMENTING_OPTIONS } from '../../shared/wwell-planning-reference-data.config';

/** Matches a numeric bit size with an optional inch mark, e.g. "12.25" or 12.25"". */
export const WWELL_IR_BIT_SIZE_PATTERN = /^\d+(\.\d+)?"?$/;
```

## src/app/features/wwell-planning/wwell-ir/wwell-ir.component.html

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
  } @else if (loadError()) {
    <div class="wwell-ir__status wwell-ir__status--error">{{ loadError() }}</div>
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

## src/app/features/wwell-planning/wwell-ir/wwell-ir.component.scss

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

## src/app/features/wwell-planning/wwell-ir/wwell-ir.component.ts

```typescript
import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CreateIntegratedRequirementPayload } from '@models/wwell-planning/wwell-planning.model';
import { WwellPlanningStore } from '../store/wwell-planning.store';
import { WWELL_IR_STATUS_META } from './wwell-ir.config';
import { WwellIrFormComponent } from './wwell-ir-form/wwell-ir-form.component';

const SNACKBAR_DURATION_MS = 3000;

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
  private readonly snackBar = inject(MatSnackBar);

  protected readonly isLoading = this.store.integratedRequirementsLoading;
  protected readonly isCreating = this.store.creatingIntegratedRequirement;
  protected readonly loadError = this.store.integratedRequirementsError;

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

  constructor() {
    effect(() => {
      const message = this.store.createIntegratedRequirementError();
      if (message) {
        this.snackBar.open(message, 'Dismiss', { duration: SNACKBAR_DURATION_MS });
      }
    });
  }

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

## src/app/features/wwell-planning/wwell-ir/wwell-ir.config.ts

```typescript
import { IntegratedRequirementStatus } from '@models/wwell-planning/wwell-planning.model';
import { WWELL_STATUS_COLORS, WwellStatusMeta, wwellStatusMeta } from '../shared/wwell-status.config';

export const WWELL_IR_STATUS_META: Record<IntegratedRequirementStatus, WwellStatusMeta> = {
  'in-progress': wwellStatusMeta('In Progress', WWELL_STATUS_COLORS.blue),
  'submit-for-review': { label: 'Submit for Review', bg: '#3b82f6', color: '#ffffff', dot: '#ffffff' },
  'in-review': wwellStatusMeta('In Review', WWELL_STATUS_COLORS.purple),
  approved: wwellStatusMeta('Approved', WWELL_STATUS_COLORS.green),
};
```

## src/app/features/wwell-planning/wwell-ir/wwell-ir.mock.ts

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

## src/app/features/wwell-planning/wwell-land-affairs-approvals/wwell-land-affairs-approvals.component.html

```html
<section class="wwell-approvals">
  <header class="wwell-approvals__header">
    <div class="wwell-approvals__heading">
      <h1 class="wwell-approvals__title">Land Affairs Approvals</h1>
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

  @if (loadError()) {
    <div class="wwell-approvals__status wwell-approvals__status--error">{{ loadError() }}</div>
  }

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
      <app-wwell-approval-table
        [rows]="landAffairsRows()"
        [columns]="landAffairsColumns"
        [statusMeta]="statusMeta"
        [expandedIds]="expandedIds()"
        [downloadingIds]="downloadingIds()"
        approvalKindLabel="Land Affairs"
        (rowToggle)="toggleRow($event)"
        (pdfDownload)="downloadLandAffairsPdf($event)"
      />
    }
  </section>
</section>
```

## src/app/features/wwell-planning/wwell-land-affairs-approvals/wwell-land-affairs-approvals.component.scss

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

## src/app/features/wwell-planning/wwell-land-affairs-approvals/wwell-land-affairs-approvals.component.ts

```typescript
import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { LandAffairsApproval } from '@models/wwell-planning/wwell-planning.model';
import { WwellPlanningService } from '../wwell-planning.service';
import { WwellPlanningStore } from '../store/wwell-planning.store';
import { WWELL_APPROVAL_STATUS_META } from '../shared/wwell-approvals/wwell-approvals.config';
import {
  WwellApprovalTableColumn,
  WwellApprovalTableComponent,
} from '../shared/wwell-approvals/wwell-approval-table/wwell-approval-table.component';
import {
  WwellLandAffairsRequestFormComponent,
  WwellLandAffairsRequestFormResult,
} from './wwell-land-affairs-request-form/wwell-land-affairs-request-form.component';

interface SearchableApproval {
  readonly reqNo: string;
  readonly client: string;
  readonly wellName: string;
}

const SNACKBAR_DURATION_MS = 3000;
const DOWNLOAD_URL_REVOKE_DELAY_MS = 5000;

@Component({
  selector: 'app-wwell-land-affairs-approvals',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatIconModule, WwellApprovalTableComponent],
  templateUrl: './wwell-land-affairs-approvals.component.html',
  styleUrl: './wwell-land-affairs-approvals.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellLandAffairsApprovalsComponent implements OnInit {
  protected readonly store = inject(WwellPlanningStore);
  private readonly svc = inject(WwellPlanningService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  protected readonly isLoading = this.store.approvalsLoading;
  protected readonly loadError = this.store.approvalsError;

  protected readonly statusMeta = WWELL_APPROVAL_STATUS_META;

  protected readonly searchTerm = signal('');
  protected readonly expandedIds = signal<ReadonlySet<string>>(new Set());
  protected readonly downloadingIds = signal<ReadonlySet<string>>(new Set());

  protected readonly landAffairsRows = computed(() => this.filterRows(this.store.landAffairsApprovals()));

  protected readonly landAffairsColumns: readonly WwellApprovalTableColumn<LandAffairsApproval>[] = [
    { header: 'X', value: row => row.x },
    { header: 'Y', value: row => row.y },
    { header: 'UTM', value: row => row.utm },
  ];

  protected readonly totalCount = computed(() => this.store.landAffairsApprovals().length);

  constructor() {
    effect(() => {
      const message = this.store.createApprovalError();
      if (message) {
        this.snackBar.open(message, 'Dismiss', { duration: SNACKBAR_DURATION_MS });
      }
    });
  }

  ngOnInit(): void {
    this.store.loadLandAffairsApprovals();
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
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

  protected openLandAffairsRequestDialog(): void {
    this.dialog
      .open<WwellLandAffairsRequestFormComponent, unknown, WwellLandAffairsRequestFormResult>(
        WwellLandAffairsRequestFormComponent,
        { panelClass: 'wwell-land-affairs-request-form-panel', maxWidth: '95vw', autoFocus: false },
      )
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

  protected isDownloading(id: string): boolean {
    return this.downloadingIds().has(id);
  }

  protected downloadLandAffairsPdf(row: LandAffairsApproval): void {
    this.downloadPdf(row.id, `${row.reqNo}-Land-Affairs.pdf`, this.svc.getLandAffairsApprovalPdf(row));
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

## src/app/features/wwell-planning/wwell-land-affairs-approvals/wwell-land-affairs-request-form/wwell-land-affairs-request-form.component.html

```html
<div class="laf">
  <app-wwell-form-dialog-shell title="Request Land Affairs Approval" [subtitle]="chainSubtitle" (closed)="close()">
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

    <ng-container dialogActions>
      <button type="button" mat-stroked-button (click)="saveDraft()">
        <mat-icon>bookmark_border</mat-icon>
        Save as Draft
      </button>
      <button type="button" mat-flat-button color="primary" (click)="submit()">
        <mat-icon>send</mat-icon>
        Submit
      </button>
    </ng-container>
  </app-wwell-form-dialog-shell>
</div>
```

## src/app/features/wwell-planning/wwell-land-affairs-approvals/wwell-land-affairs-request-form/wwell-land-affairs-request-form.component.scss

```scss
@use '@angular/material' as mat;
@use '../../shared/wwell-select-panel-mixin' as wsel;

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
  @include wsel.panel($accent, $navy);
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
  @include wsel.trigger($accent);
}

@media (prefers-reduced-motion: reduce) {
  .laf {
    animation: none;
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
}
```

## src/app/features/wwell-planning/wwell-land-affairs-approvals/wwell-land-affairs-request-form/wwell-land-affairs-request-form.component.ts

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
import { WWELL_APPROVAL_WELL_NAME_PATTERN, WWELL_LAND_AFFAIRS_CHAIN_ROLES } from '../../shared/wwell-approvals/wwell-approvals.config';
import { WwellAttachmentDropzoneComponent } from '../../shared/wwell-attachment-dropzone/wwell-attachment-dropzone.component';
import { WwellFormDialogShellComponent } from '../../shared/wwell-form-dialog-shell/wwell-form-dialog-shell.component';
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
    WwellFormDialogShellComponent,
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

## src/app/features/wwell-planning/wwell-land-affairs-approvals/wwell-land-affairs-request-form/wwell-land-affairs-request-form.config.ts

```typescript
export { WWELL_CLIENT_OPTIONS as WWELL_LAND_AFFAIRS_FORM_CLIENT_OPTIONS } from '../../shared/wwell-planning-reference-data.config';

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

## src/app/features/wwell-planning/wwell-planning.service.ts

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
import { WWELL_LAND_AFFAIRS_CHAIN_ROLES, WWELL_WLDA_CHAIN_ROLES } from './shared/wwell-approvals/wwell-approvals.config';
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
  ): Observable<IntegratedRequirement> {
    return this.http
      .post<ApiResponse<IntegratedRequirement>>(`${this.apiUrl}/integrated-requirements`, payload)
      .pipe(map(res => res.data[0]));
  }
}
```

## src/app/features/wwell-planning/wwell-requests/wwell-request-form/wwell-request-form.component.html

```html
<div class="wrf">
  <app-wwell-form-dialog-shell
    [title]="dialogTitle"
    [subtitle]="dialogSubtitle"
    [requiredHint]="!isViewMode"
    (closed)="close()"
  >
    <form class="wrf__form" [formGroup]="form">
      <div class="wrf__grid">
        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wrf__field">
          <mat-label>Client</mat-label>
          <mat-select formControlName="client" panelClass="wrf-select-panel">
            @for (opt of clientOptions; track opt) {
              <mat-option [value]="opt">{{ opt }}</mat-option>
            }
          </mat-select>
          @if (form.controls.client.invalid && form.controls.client.touched) {
            <mat-error>Client is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wrf__field">
          <mat-label>Supporting</mat-label>
          <input matInput formControlName="supporting" placeholder="e.g., Riyadh GOSP or WDQS-200" />
          @if (form.controls.supporting.invalid && form.controls.supporting.touched) {
            <mat-error>Supporting facility is required</mat-error>
          }
        </mat-form-field>

        <div class="wrf__field wrf__coord-group">
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wrf__coord-value">
            <mat-label>Latitude</mat-label>
            <input matInput inputmode="decimal" formControlName="latValue" placeholder="e.g., 24.1751" />
            @if (form.controls.latValue.invalid && form.controls.latValue.touched) {
              <mat-error>0&ndash;90&deg;, decimal</mat-error>
            } @else {
              <mat-hint>Decimal degrees, 0&ndash;90&deg;</mat-hint>
            }
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wrf__coord-hemi">
            <mat-select formControlName="latHemi" panelClass="wrf-select-panel" aria-label="Latitude hemisphere">
              @for (opt of latHemiOptions; track opt) {
                <mat-option [value]="opt">{{ opt }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <div class="wrf__field wrf__coord-group">
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wrf__coord-value">
            <mat-label>Longitude</mat-label>
            <input matInput inputmode="decimal" formControlName="lngValue" placeholder="e.g., 47.2951" />
            @if (form.controls.lngValue.invalid && form.controls.lngValue.touched) {
              <mat-error>0&ndash;180&deg;, decimal</mat-error>
            } @else {
              <mat-hint>Decimal degrees, 0&ndash;180&deg;</mat-hint>
            }
          </mat-form-field>
          <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wrf__coord-hemi">
            <mat-select formControlName="lngHemi" panelClass="wrf-select-panel" aria-label="Longitude hemisphere">
              @for (opt of lngHemiOptions; track opt) {
                <mat-option [value]="opt">{{ opt }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wrf__field">
          <mat-label>Target Aquifer</mat-label>
          <mat-select formControlName="targetAquifer" panelClass="wrf-select-panel">
            @for (opt of aquiferOptions; track opt) {
              <mat-option [value]="opt">{{ opt }}</mat-option>
            }
          </mat-select>
          @if (form.controls.targetAquifer.invalid && form.controls.targetAquifer.touched) {
            <mat-error>Target aquifer is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wrf__field">
          <mat-label>Proposed Depth</mat-label>
          <input matInput formControlName="proposedDepth" placeholder="e.g., 180m" />
          @if (form.controls.proposedDepth.hasError('required') && form.controls.proposedDepth.touched) {
            <mat-error>Proposed depth is required</mat-error>
          } @else if (form.controls.proposedDepth.hasError('pattern') && form.controls.proposedDepth.touched) {
            <mat-error>Use a numeric depth in meters, e.g. 180 or 180m</mat-error>
          } @else {
            <mat-hint>Numeric value in meters</mat-hint>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wrf__field">
          <mat-label>Business Use</mat-label>
          <mat-select formControlName="businessUse" panelClass="wrf-select-panel">
            @for (opt of businessUseOptions; track opt) {
              <mat-option [value]="opt">{{ opt }}</mat-option>
            }
          </mat-select>
          @if (form.controls.businessUse.invalid && form.controls.businessUse.touched) {
            <mat-error>Business use is required</mat-error>
          }
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wrf__field">
          <mat-label>Assigned To</mat-label>
          <mat-select formControlName="assignedTo" panelClass="wrf-select-panel">
            <mat-option [value]="null">&mdash; Unassigned &mdash;</mat-option>
            @for (opt of assigneeOptions; track opt) {
              <mat-option [value]="opt">{{ opt }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wrf__field">
          <mat-label>Priority</mat-label>
          <mat-select formControlName="priority" panelClass="wrf-select-panel">
            @for (opt of priorityOptions; track opt.value) {
              <mat-option [value]="opt.value">{{ opt.label }}</mat-option>
            }
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline" subscriptSizing="dynamic" class="wrf__field wrf__field--full">
          <mat-label>Request Notes</mat-label>
          <textarea
            matInput
            rows="3"
            formControlName="notes"
            placeholder="Project background, timeline, special requirements..."
          ></textarea>
        </mat-form-field>
      </div>

      <div class="wrf__attachments">
        <span class="wrf__attachments-label">Attachments</span>
        <app-wwell-attachment-dropzone
          hint="Click to attach files (site plan, client authorization, reports, permits…)"
          [disabled]="isViewMode"
          [displayNames]="isViewMode ? (data.request?.attachments ?? []) : null"
          (filesChange)="onFilesChange($event)"
        />
      </div>
    </form>

    <ng-container dialogActions>
      @if (isViewMode) {
        <button type="button" mat-stroked-button (click)="close()">Close</button>
      } @else {
        <button type="button" mat-stroked-button (click)="saveDraft()">
          <mat-icon>bookmark_border</mat-icon>
          Save as Draft
        </button>
        <button type="button" mat-flat-button color="primary" [disabled]="form.invalid" (click)="submitRequest()">
          <mat-icon>send</mat-icon>
          Submit
        </button>
      }
    </ng-container>
  </app-wwell-form-dialog-shell>
</div>
```

## src/app/features/wwell-planning/wwell-requests/wwell-request-form/wwell-request-form.component.scss

```scss
@use '@angular/material' as mat;
@use '../../shared/wwell-select-panel-mixin' as wsel;

/* ── wwell-request-form tokens ─────────────────────────────────── */
$navy:      #1e293b;
$muted:     #64748b;
$border:    #e2e8f0;
$accent:    #3b82f6;
$danger:    #dc2626;
$bg-subtle: #f8fafc;

/*
 * The app only calls mat.core() globally (no color theme is configured in
 * styles.scss), so every Material component here resolves unset
 * --mat-sys-* tokens. That's what caused the cramped text inset, the
 * hint text sitting out of line with the field text above it, and the
 * washed-out borders/select arrows — patching individual .mdc-* classes
 * with !important (the previous approach) fights the symptom, not the
 * cause, and leaves the internal notch-width/shape math inconsistent
 * with the border-radius it draws. Scoping a real M3 theme to this
 * dialog fixes the token source directly, and applies to the select
 * overlay panel too (it's portaled to <body>, so it needs its own scope).
 */
.wrf,
.wrf-select-panel {
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

.wrf {
  @include mat.form-field-overrides((
    outlined-container-shape: 10px,
  ));
}

/* ── Dialog surface reset (targets this dialog's overlay only) ──── */
.wwell-request-form-panel .mdc-dialog__surface {
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 16px !important;
  overflow: hidden !important;
}

.wrf-select-panel {
  border-radius: 10px !important;
  box-shadow:
    0 4px 10px rgba(15, 23, 42, 0.12),
    0 12px 28px rgba(15, 23, 42, 0.14) !important;
  @include wsel.panel($accent, $navy);
}

@keyframes wrfIn {
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes wrfFieldIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.wrf {
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
  animation: wrfIn 260ms cubic-bezier(0.16, 1, 0.3, 1) both;
  @include wsel.trigger($accent);
}

@media (prefers-reduced-motion: reduce) {
  .wrf {
    animation: none;
  }
}

.wrf__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem 1.25rem;
  /* Fields without a hint would otherwise be stretched (grid's default
     align-items: stretch) to match a sibling that has one, making the two
     side-by-side boxes in a row render at visibly different heights. */
  align-items: start;
}

.wrf__field {
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

.wrf__coord-group {
  display: flex;
  align-items: flex-start;
  gap: 0.4rem;
}

.wrf__coord-value {
  flex: 1;
  min-width: 0;
}

.wrf__coord-hemi {
  flex: 0 0 60px;

  .mat-mdc-select-value-text {
    display: block;
    text-align: center;
  }
}

@media (prefers-reduced-motion: no-preference) {
  .wrf__field {
    opacity: 0;
    animation: wrfFieldIn 360ms cubic-bezier(0.16, 1, 0.3, 1) both;

    @for $i from 1 through 10 {
      &:nth-child(#{$i}) {
        animation-delay: #{40ms * ($i - 1)};
      }
    }
  }
}

.wrf .mat-mdc-form-field-required-marker {
  color: $danger;
}

.wrf__attachments {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.wrf__attachments-label {
  font-size: 0.8rem;
  font-weight: 700;
  color: $navy;
}

@media (max-width: 640px) {
  .wrf {
    width: 100vw;
    max-height: 100vh;
    height: 100vh;
    border-radius: 0;
  }

  .wrf__grid {
    grid-template-columns: 1fr;
  }
}
```

## src/app/features/wwell-planning/wwell-requests/wwell-request-form/wwell-request-form.component.ts

```typescript
import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  CreateWwellPlanningRequestPayload,
  WwellPlanningPriority,
  WwellPlanningRequest,
} from '@models/wwell-planning/wwell-planning.model';
import { WwellAttachmentDropzoneComponent } from '../../shared/wwell-attachment-dropzone/wwell-attachment-dropzone.component';
import { WwellFormDialogShellComponent } from '../../shared/wwell-form-dialog-shell/wwell-form-dialog-shell.component';
import {
  WWELL_REQUEST_AQUIFER_OPTIONS,
  WWELL_REQUEST_ASSIGNEE_OPTIONS,
  WWELL_REQUEST_BUSINESS_USE_OPTIONS,
  WWELL_REQUEST_CLIENT_OPTIONS,
  WWELL_REQUEST_DEPTH_PATTERN,
  WWELL_REQUEST_LAT_HEMISPHERES,
  WWELL_REQUEST_LAT_VALUE_PATTERN,
  WWELL_REQUEST_LNG_HEMISPHERES,
  WWELL_REQUEST_LNG_VALUE_PATTERN,
  WWELL_REQUEST_PRIORITY_OPTIONS,
  formatWwellCoordinates,
  parseWwellCoordinates,
} from './wwell-request-form.config';

export type WwellRequestFormMode = 'create' | 'view';

export interface WwellRequestFormDialogData {
  readonly mode: WwellRequestFormMode;
  readonly request?: WwellPlanningRequest;
}

export interface WwellRequestFormResult {
  readonly payload: CreateWwellPlanningRequestPayload;
  readonly files: File[];
}

@Component({
  selector: 'app-wwell-request-form',
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
    WwellFormDialogShellComponent,
  ],
  templateUrl: './wwell-request-form.component.html',
  styleUrl: './wwell-request-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class WwellRequestFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<WwellRequestFormComponent, WwellRequestFormResult | undefined>);
  protected readonly data = inject<WwellRequestFormDialogData>(MAT_DIALOG_DATA);

  protected readonly clientOptions = WWELL_REQUEST_CLIENT_OPTIONS;
  protected readonly aquiferOptions = WWELL_REQUEST_AQUIFER_OPTIONS;
  protected readonly businessUseOptions = WWELL_REQUEST_BUSINESS_USE_OPTIONS;
  protected readonly assigneeOptions = WWELL_REQUEST_ASSIGNEE_OPTIONS;
  protected readonly priorityOptions = WWELL_REQUEST_PRIORITY_OPTIONS;
  protected readonly latHemiOptions = WWELL_REQUEST_LAT_HEMISPHERES;
  protected readonly lngHemiOptions = WWELL_REQUEST_LNG_HEMISPHERES;

  protected readonly isViewMode = this.data.mode === 'view';
  private files: File[] = [];

  protected readonly dialogTitle = this.isViewMode ? 'Request Details' : 'New Request';
  protected readonly dialogSubtitle = this.isViewMode
    ? this.data.request
      ? `${this.data.request.id} · Submitted ${this.data.request.requestedDate}`
      : null
    : 'Create a new well request — will be routed for approvals after submission';

  private readonly initialCoordinates = parseWwellCoordinates(this.data.request?.coordinates);

  protected readonly form = this.fb.nonNullable.group({
    client: [this.data.request?.client ?? '', Validators.required],
    supporting: [this.data.request?.supporting ?? '', Validators.required],
    latValue: [
      this.initialCoordinates.latValue,
      [Validators.required, Validators.pattern(WWELL_REQUEST_LAT_VALUE_PATTERN)],
    ],
    latHemi: this.fb.nonNullable.control(this.initialCoordinates.latHemi),
    lngValue: [
      this.initialCoordinates.lngValue,
      [Validators.required, Validators.pattern(WWELL_REQUEST_LNG_VALUE_PATTERN)],
    ],
    lngHemi: this.fb.nonNullable.control(this.initialCoordinates.lngHemi),
    targetAquifer: [this.data.request?.targetAquifer ?? '', Validators.required],
    proposedDepth: [
      this.data.request?.proposedDepth ?? '',
      [Validators.required, Validators.pattern(WWELL_REQUEST_DEPTH_PATTERN)],
    ],
    businessUse: [this.data.request?.businessUse ?? '', Validators.required],
    assignedTo: this.fb.control<string | null>(this.data.request?.assignedTo ?? null),
    priority: this.fb.control<WwellPlanningPriority | null>(this.data.request?.priority ?? null),
    notes: this.fb.control<string | null>(this.data.request?.notes ?? null),
  });

  constructor() {
    if (this.isViewMode) {
      this.form.disable();
    }
  }

  protected close(): void {
    this.dialogRef.close(undefined);
  }

  protected saveDraft(): void {
    this.finish('draft');
  }

  protected submitRequest(): void {
    this.finish('submitted');
  }

  private finish(status: 'draft' | 'submitted'): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const payload: CreateWwellPlanningRequestPayload = {
      client: value.client,
      supporting: value.supporting,
      coordinates: formatWwellCoordinates({
        latValue: value.latValue,
        latHemi: value.latHemi,
        lngValue: value.lngValue,
        lngHemi: value.lngHemi,
      }),
      targetAquifer: value.targetAquifer,
      proposedDepth: value.proposedDepth,
      businessUse: value.businessUse,
      assignedTo: value.assignedTo,
      priority: value.priority,
      notes: value.notes?.trim() || null,
      status,
    };

    this.dialogRef.close({ payload, files: this.files });
  }

  protected onFilesChange(files: File[]): void {
    this.files = files;
  }
}
```

## src/app/features/wwell-planning/wwell-requests/wwell-request-form/wwell-request-form.config.ts

```typescript
import { WwellPlanningPriority } from '@models/wwell-planning/wwell-planning.model';

export { WWELL_CLIENT_OPTIONS as WWELL_REQUEST_CLIENT_OPTIONS } from '../../shared/wwell-planning-reference-data.config';
export { WWELL_AQUIFER_OPTIONS as WWELL_REQUEST_AQUIFER_OPTIONS } from '../../shared/wwell-planning-reference-data.config';
export { WWELL_BUSINESS_USE_OPTIONS as WWELL_REQUEST_BUSINESS_USE_OPTIONS } from '../../shared/wwell-planning-reference-data.config';
export { WWELL_ASSIGNEE_OPTIONS as WWELL_REQUEST_ASSIGNEE_OPTIONS } from '../../shared/wwell-planning-reference-data.config';
export { WWELL_DEPTH_PATTERN as WWELL_REQUEST_DEPTH_PATTERN } from '../../shared/wwell-planning-reference-data.config';

export interface WwellRequestPriorityOption {
  readonly value: WwellPlanningPriority;
  readonly label: string;
}

export const WWELL_REQUEST_PRIORITY_OPTIONS: readonly WwellRequestPriorityOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export type WwellLatHemisphere = 'N' | 'S';
export type WwellLngHemisphere = 'E' | 'W';

export const WWELL_REQUEST_LAT_HEMISPHERES: readonly WwellLatHemisphere[] = ['N', 'S'];
export const WWELL_REQUEST_LNG_HEMISPHERES: readonly WwellLngHemisphere[] = ['E', 'W'];

/** Decimal degrees, 0–90 (sign is carried by the hemisphere select, not typed). */
export const WWELL_REQUEST_LAT_VALUE_PATTERN = /^(90(\.0+)?|[1-8]?\d(\.\d+)?)$/;

/** Decimal degrees, 0–180 (sign is carried by the hemisphere select, not typed). */
export const WWELL_REQUEST_LNG_VALUE_PATTERN = /^(180(\.0+)?|1[0-7]\d(\.\d+)?|[1-9]?\d(\.\d+)?)$/;

export interface WwellCoordinateParts {
  readonly latValue: string;
  readonly latHemi: WwellLatHemisphere;
  readonly lngValue: string;
  readonly lngHemi: WwellLngHemisphere;
}

const COORDINATE_PART_PATTERN = /^\s*(-?\d{1,3}(?:\.\d+)?)\s*°?\s*([NnSsEeWw]?)\s*$/;

function parseCoordinatePart<H extends string>(
  part: string,
  positiveHemi: H,
  negativeHemi: H,
): { value: string; hemi: H } | null {
  const match = COORDINATE_PART_PATTERN.exec(part);
  if (!match) return null;

  const numeric = Number(match[1]);
  if (Number.isNaN(numeric)) return null;

  const letter = match[2].toUpperCase();
  let hemi = numeric < 0 ? negativeHemi : positiveHemi;
  if (letter === negativeHemi || letter === positiveHemi) {
    hemi = letter as H;
  }

  return { value: `${Math.abs(numeric)}`, hemi };
}

/** Parses a free-form "24.1751°N, 47.2951°E" style string (as previously stored) into editable parts. */
export function parseWwellCoordinates(raw: string | null | undefined): WwellCoordinateParts {
  const fallback: WwellCoordinateParts = { latValue: '', latHemi: 'N', lngValue: '', lngHemi: 'E' };
  if (!raw) return fallback;

  const [rawLat, rawLng] = raw.split(',').map(part => part.trim());
  if (!rawLat || !rawLng) return fallback;

  const lat = parseCoordinatePart(rawLat, 'N', 'S');
  const lng = parseCoordinatePart(rawLng, 'E', 'W');
  if (!lat || !lng) return fallback;

  return { latValue: lat.value, latHemi: lat.hemi, lngValue: lng.value, lngHemi: lng.hemi };
}

/** Formats editable coordinate parts back into the "24.1751°N, 47.2951°E" style string the API expects. */
export function formatWwellCoordinates(parts: WwellCoordinateParts): string {
  const { latValue, latHemi, lngValue, lngHemi } = parts;
  if (!latValue || !lngValue) return '';
  return `${latValue}°${latHemi}, ${lngValue}°${lngHemi}`;
}
```

## src/app/features/wwell-planning/wwell-requests/wwell-requests.component.html

```html
<section class="wwell-requests">
  <header class="wwell-requests__header">
    <div class="wwell-requests__heading">
      <h1 class="wwell-requests__title">Requests</h1>
      <span class="wwell-requests__count">{{ totalCount() }}</span>
    </div>

    <button
      type="button"
      mat-flat-button
      color="primary"
      class="wwell-requests__new-btn"
      [disabled]="isCreating()"
      (click)="openNewRequestDialog()"
    >
      <mat-icon>add</mat-icon>
      New Request
    </button>
  </header>

  <div class="wwell-requests__stats">
    <div class="wwell-requests__stat">
      <span class="wwell-requests__stat-label">Total Requests</span>
      <span class="wwell-requests__stat-value">{{ totalCount() }}</span>
    </div>
    <div class="wwell-requests__stat wwell-requests__stat--progress">
      <span class="wwell-requests__stat-label">In Progress</span>
      <span class="wwell-requests__stat-value">{{ inProgressCount() }}</span>
    </div>
    <div class="wwell-requests__stat wwell-requests__stat--review">
      <span class="wwell-requests__stat-label">In Review</span>
      <span class="wwell-requests__stat-value">{{ inReviewCount() }}</span>
    </div>
    <div class="wwell-requests__stat wwell-requests__stat--approved">
      <span class="wwell-requests__stat-label">Approved</span>
      <span class="wwell-requests__stat-value">{{ approvedCount() }}</span>
    </div>
  </div>

  <div class="wwell-requests__card">
    <div class="wwell-requests__toolbar">
      <h2 class="wwell-requests__toolbar-title">All Requests</h2>
      <label class="wwell-requests__search">
        <mat-icon class="wwell-requests__search-icon">search</mat-icon>
        <input
          type="search"
          placeholder="Search requests&hellip;"
          [ngModel]="searchTerm()"
          (ngModelChange)="onSearchChange($event)"
        />
      </label>
    </div>

    @if (isLoading()) {
      <div class="wwell-requests__status">Loading requests&hellip;</div>
    } @else if (loadError()) {
      <div class="wwell-requests__status wwell-requests__status--error">{{ loadError() }}</div>
    } @else if (rows().length === 0) {
      <div class="wwell-requests__status">No requests found.</div>
    } @else {
      <ag-grid-angular
        class="wwell-requests__grid"
        style="width: 100%"
        [theme]="gridTheme"
        [rowData]="rows()"
        [columnDefs]="columnDefs"
        [gridOptions]="gridOptions"
        (gridReady)="onGridReady($event.api)"
        (cellClicked)="onCellClicked($event)"
      />
    }
  </div>
</section>
```

## src/app/features/wwell-planning/wwell-requests/wwell-requests.component.scss

```scss
:host {
  display: block;
  height: 100%;
  overflow: auto;
  background: #f0f4f8;
}

.wwell-requests {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  padding: 1.5rem;
  height: 100%;
}

/* ── Header ───────────────────────────────────────────────────── */
.wwell-requests__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.wwell-requests__heading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.wwell-requests__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.01em;
}

.wwell-requests__count {
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

.wwell-requests__new-btn {
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

/* ── Stat cards ───────────────────────────────────────────────── */
.wwell-requests__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 0.85rem;
}

.wwell-requests__stat {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 1rem 1.15rem;
  background: #ffffff;
  border: 1px solid #e8edf4;
  border-left: 4px solid #94a3b8;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  transition:
    transform 150ms ease,
    box-shadow 150ms ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
  }

  &--progress {
    border-left-color: #3b82f6;
  }

  &--review {
    border-left-color: #a855f7;
  }

  &--approved {
    border-left-color: #22c55e;
  }
}

.wwell-requests__stat-label {
  font-size: 0.75rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.wwell-requests__stat-value {
  font-size: 1.65rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1.1;
}

/* ── Card / toolbar ───────────────────────────────────────────── */
.wwell-requests__card {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e8edf4;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.06),
    0 4px 12px rgba(59, 130, 246, 0.05);
  overflow: hidden;
}

.wwell-requests__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #e8edf4;
}

.wwell-requests__toolbar-title {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 800;
  color: #1e293b;
}

.wwell-requests__search {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0.4rem 0.75rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 999px;
  min-width: 220px;
  flex: 0 1 280px;
  transition: border-color 150ms ease;

  &:focus-within {
    border-color: #3b82f6;
    background: #ffffff;
  }
}

.wwell-requests__search-icon {
  width: 18px;
  height: 18px;
  font-size: 18px;
  color: #94a3b8;
  flex-shrink: 0;
}

.wwell-requests__search input {
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

.wwell-requests__status {
  padding: 2rem 1rem;
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;

  &--error {
    color: #dc2626;
  }
}

.wwell-requests__grid {
  display: block;
  width: 100%;
}

/* ── Responsive ───────────────────────────────────────────────── */
@media (max-width: 640px) {
  .wwell-requests {
    padding: 1rem;
  }

  .wwell-requests__header {
    flex-direction: column;
    align-items: stretch;
  }

  .wwell-requests__new-btn {
    width: 100%;
    justify-content: center;
  }

  .wwell-requests__stats {
    grid-template-columns: repeat(2, 1fr);
  }

  .wwell-requests__toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .wwell-requests__search {
    flex: 1 1 auto;
    width: 100%;
  }
}
```

## src/app/features/wwell-planning/wwell-requests/wwell-requests.component.ts

```typescript
import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CellClickedEvent, GridApi } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { WwellPlanningRequest } from '@models/wwell-planning/wwell-planning.model';
import { WwellPlanningStore } from '../store/wwell-planning.store';
import {
  WWELL_REQUESTS_ACTIONS_COL_ID,
  wwellRequestsColumnDefs,
  wwellRequestsGridOptions,
  wwellRequestsGridTheme,
} from './wwell-requests.config';
import { WwellRequestFormComponent, WwellRequestFormResult } from './wwell-request-form/wwell-request-form.component';

const SNACKBAR_DURATION_MS = 3000;

@Component({
  selector: 'app-wwell-requests',
  standalone: true,
  imports: [AgGridAngular, FormsModule, MatButtonModule, MatIconModule],
  templateUrl: './wwell-requests.component.html',
  styleUrl: './wwell-requests.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellRequestsComponent implements OnInit {
  protected readonly store = inject(WwellPlanningStore);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly rows = this.store.requests;
  protected readonly isLoading = this.store.requestsLoading;
  protected readonly isCreating = this.store.creatingRequest;
  protected readonly loadError = this.store.requestsError;

  protected readonly totalCount = computed(() => this.rows().length);
  protected readonly inProgressCount = computed(() => this.rows().filter(r => r.status === 'in-progress').length);
  protected readonly inReviewCount = computed(() => this.rows().filter(r => r.status === 'in-review').length);
  protected readonly approvedCount = computed(() => this.rows().filter(r => r.status === 'approved').length);

  protected readonly searchTerm = signal('');

  protected readonly columnDefs = wwellRequestsColumnDefs;
  protected readonly gridOptions = wwellRequestsGridOptions;
  protected readonly gridTheme = wwellRequestsGridTheme;

  private gridApi: GridApi<WwellPlanningRequest> | null = null;

  constructor() {
    effect(() => {
      const message = this.store.createRequestError();
      if (message) {
        this.snackBar.open(message, 'Dismiss', { duration: SNACKBAR_DURATION_MS });
      }
    });
  }

  ngOnInit(): void {
    this.store.loadRequests();
  }

  protected onGridReady(api: GridApi<WwellPlanningRequest>): void {
    this.gridApi = api;
    this.gridApi.sizeColumnsToFit();
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.gridApi?.setGridOption('quickFilterText', term);
  }

  protected onCellClicked(event: CellClickedEvent<WwellPlanningRequest>): void {
    if (event.colDef.colId !== WWELL_REQUESTS_ACTIONS_COL_ID || !event.data) return;
    this.openViewDialog(event.data);
  }

  protected openNewRequestDialog(): void {
    this.dialog
      .open<WwellRequestFormComponent, unknown, WwellRequestFormResult | undefined>(WwellRequestFormComponent, {
        data: { mode: 'create' },
        panelClass: 'wwell-request-form-panel',
        maxWidth: '95vw',
        autoFocus: false,
      })
      .afterClosed()
      .subscribe(result => {
        if (!result) return;
        this.store.createRequest(result.payload, result.files);
      });
  }

  private openViewDialog(request: WwellPlanningRequest): void {
    this.dialog.open(WwellRequestFormComponent, {
      data: { mode: 'view', request },
      panelClass: 'wwell-request-form-panel',
      maxWidth: '95vw',
      autoFocus: false,
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms',
    });
  }
}
```

## src/app/features/wwell-planning/wwell-requests/wwell-requests.config.ts

```typescript
import { ColDef, GridOptions, ICellRendererParams, themeQuartz } from 'ag-grid-community';
import { WwellPlanningRequest, WwellPlanningRequestStatus } from '@models/wwell-planning/wwell-planning.model';
import { WWELL_STATUS_COLORS, WwellStatusMeta, wwellStatusMeta } from '../shared/wwell-status.config';

export const wwellRequestsGridTheme = themeQuartz.withParams({
  accentColor: '#3b82f6',
  backgroundColor: '#ffffff',
  foregroundColor: '#1e293b',
  headerBackgroundColor: '#dbeafe',
  headerTextColor: '#1d4ed8',
  fontSize: 15,
  rowHeight: 44,
  headerHeight: 40,
  borderRadius: 0,
});

export const WWELL_REQUEST_STATUS_META: Record<WwellPlanningRequestStatus, WwellStatusMeta> = {
  draft: wwellStatusMeta('Draft', WWELL_STATUS_COLORS.slate),
  submitted: { label: 'Submitted', bg: '#f1f5f9', color: '#475569', dot: '#64748b' },
  'in-review': wwellStatusMeta('In Review', WWELL_STATUS_COLORS.purple),
  'in-progress': wwellStatusMeta('In Progress', WWELL_STATUS_COLORS.blue),
  approved: wwellStatusMeta('Approved', WWELL_STATUS_COLORS.green),
  rejected: wwellStatusMeta('Rejected', WWELL_STATUS_COLORS.red),
};

function statusCellRenderer(
  params: ICellRendererParams<WwellPlanningRequest, WwellPlanningRequestStatus>,
): string {
  const meta = WWELL_REQUEST_STATUS_META[params.value ?? 'draft'] ?? WWELL_REQUEST_STATUS_META.draft;
  return `<span style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;background:${meta.bg};color:${meta.color};font-size:12.5px;font-weight:700;line-height:1.6;white-space:nowrap;">
    <span style="width:6px;height:6px;border-radius:50%;background:${meta.dot};flex-shrink:0;"></span>${meta.label}
  </span>`;
}

function actionsCellRenderer(): string {
  return `<button type="button" data-action="open" style="display:inline-flex;align-items:center;gap:4px;padding:4px 12px;border-radius:6px;border:1px solid #dbeafe;background:#eff6ff;color:#1d4ed8;font-size:12.5px;font-weight:700;cursor:pointer;">Open</button>`;
}

export const WWELL_REQUESTS_ACTIONS_COL_ID = 'actions';

export const wwellRequestsColumnDefs: ColDef<WwellPlanningRequest>[] = [
  { headerName: 'REQ #', field: 'id', flex: 0.9, minWidth: 110, cellStyle: { fontWeight: '700', color: '#3b82f6' } },
  { headerName: 'Client', field: 'client', flex: 0.8, minWidth: 100 },
  { headerName: 'Supporting', field: 'supporting', flex: 1.3, minWidth: 160 },
  { headerName: 'Status', field: 'status', flex: 1, minWidth: 130, cellRenderer: statusCellRenderer },
  { headerName: 'Submitted', field: 'requestedDate', flex: 0.9, minWidth: 120 },
  {
    headerName: 'Assigned To',
    field: 'assignedTo',
    flex: 1.1,
    minWidth: 150,
    valueFormatter: params => params.value || 'Unassigned',
  },
  {
    headerName: 'Actions',
    colId: WWELL_REQUESTS_ACTIONS_COL_ID,
    field: 'id',
    flex: 0.7,
    minWidth: 100,
    sortable: false,
    filter: false,
    resizable: false,
    cellRenderer: actionsCellRenderer,
    cellStyle: { display: 'flex', alignItems: 'center' },
  },
];

export const wwellRequestsGridOptions: GridOptions<WwellPlanningRequest> = {
  animateRows: true,
  suppressMovableColumns: true,
  domLayout: 'autoHeight',
  pagination: true,
  paginationPageSize: 5,
  paginationPageSizeSelector: false,
  defaultColDef: { sortable: true, filter: true, resizable: true },
  onGridReady: params => params.api.sizeColumnsToFit(),
};
```

## src/app/features/wwell-planning/wwell-requests/wwell-requests.mock.ts

```typescript
import { WwellPlanningRequest } from '@models/wwell-planning/wwell-planning.model';

export const WWELL_REQUESTS_MOCK: readonly WwellPlanningRequest[] = [
  {
    id: 'REQ-00231',
    title: 'Water supply well — Riyadh GOSP',
    description: 'New water supply well to support Riyadh GOSP operations.',
    requestedBy: 'Eng. A. Al-Mutairi',
    requestedDate: '2026-06-15',
    status: 'in-progress',
    client: 'BI-11',
    supporting: 'Riyadh GOSP',
    coordinates: '24.7136, 46.6753',
    targetAquifer: 'Umm Er Radhuma',
    proposedDepth: '850 m',
    businessUse: 'Facility water supply',
    priority: 'high',
    assignedTo: 'Eng. A. Al-Mutairi',
    notes: null,
    attachments: [],
  },
  {
    id: 'REQ-00218',
    title: 'Monitoring well — WDQS-200',
    description: 'Groundwater monitoring well for WDQS-200 well pad.',
    requestedBy: 'Eng. A. Al-Mutairi',
    requestedDate: '2026-06-08',
    status: 'in-review',
    client: 'BI-12',
    supporting: 'WDQS-200',
    coordinates: '25.3548, 49.5822',
    targetAquifer: 'Wasia',
    proposedDepth: '620 m',
    businessUse: 'Environmental monitoring',
    priority: 'medium',
    assignedTo: 'Eng. A. Al-Mutairi',
    notes: null,
    attachments: [],
  },
  {
    id: 'REQ-00225',
    title: 'Water supply well — Jeddah Facility',
    description: 'Supplemental water supply well for Jeddah Facility expansion.',
    requestedBy: 'Eng. A. Al-Mutairi',
    requestedDate: '2026-06-12',
    status: 'in-progress',
    client: 'BI-13',
    supporting: 'Jeddah Facility',
    coordinates: '21.5433, 39.1728',
    targetAquifer: 'Wajid',
    proposedDepth: '710 m',
    businessUse: 'Facility water supply',
    priority: 'high',
    assignedTo: 'Eng. A. Al-Mutairi',
    notes: null,
    attachments: [],
  },
  {
    id: 'REQ-00240',
    title: 'Injection well — NIRZ-300',
    description: 'Injection well request pending assignment.',
    requestedBy: 'Eng. S. Al-Doosari',
    requestedDate: '2026-06-20',
    status: 'submitted',
    client: 'BI-14',
    supporting: 'NIRZ-300',
    coordinates: '26.2172, 50.0069',
    targetAquifer: 'Biyadh',
    proposedDepth: '540 m',
    businessUse: 'Water injection',
    priority: 'medium',
    assignedTo: null,
    notes: null,
    attachments: [],
  },
  {
    id: 'REQ-00205',
    title: 'Water supply well — QSSM-400',
    description: 'Approved water supply well for QSSM-400 support area.',
    requestedBy: 'Eng. S. Al-Doosari',
    requestedDate: '2026-05-28',
    status: 'approved',
    client: 'BI-11',
    supporting: 'QSSM-400',
    coordinates: '27.0174, 49.6251',
    targetAquifer: 'Umm Er Radhuma',
    proposedDepth: '790 m',
    businessUse: 'Facility water supply',
    priority: 'high',
    assignedTo: 'Eng. S. Al-Doosari',
    notes: 'Approved by planning committee.',
    attachments: [],
  },
  {
    id: 'REQ-00198',
    title: 'Water supply well — Dammam Central',
    description: 'Approved well request for Dammam Central facility.',
    requestedBy: 'Eng. S. Al-Doosari',
    requestedDate: '2026-05-20',
    status: 'approved',
    client: 'BI-15',
    supporting: 'Dammam Central',
    coordinates: '26.4207, 50.0888',
    targetAquifer: 'Dammam',
    proposedDepth: '460 m',
    businessUse: 'Facility water supply',
    priority: 'low',
    assignedTo: 'Eng. S. Al-Doosari',
    notes: 'Approved by planning committee.',
    attachments: [],
  },
  {
    id: 'REQ-00187',
    title: 'Water supply well — Yanbu Terminal',
    description: 'Approved well request for Yanbu Terminal operations.',
    requestedBy: 'Eng. M. Al-Harbi',
    requestedDate: '2026-05-15',
    status: 'approved',
    client: 'BI-16',
    supporting: 'Yanbu Terminal',
    coordinates: '24.0895, 38.0618',
    targetAquifer: 'Wajid',
    proposedDepth: '605 m',
    businessUse: 'Facility water supply',
    priority: 'medium',
    assignedTo: 'Eng. M. Al-Harbi',
    notes: 'Approved by planning committee.',
    attachments: [],
  },
  {
    id: 'REQ-00252',
    title: 'Water supply well — Abqaiq Plant',
    description: 'New water supply well for Abqaiq Plant.',
    requestedBy: 'Eng. A. Al-Mutairi',
    requestedDate: '2026-06-22',
    status: 'in-progress',
    client: 'BI-12',
    supporting: 'Abqaiq Plant',
    coordinates: '25.9373, 49.6672',
    targetAquifer: 'Umm Er Radhuma',
    proposedDepth: '830 m',
    businessUse: 'Facility water supply',
    priority: 'urgent',
    assignedTo: 'Eng. A. Al-Mutairi',
    notes: null,
    attachments: [],
  },
  {
    id: 'REQ-00260',
    title: 'Water supply well — Ras Tanura',
    description: 'New water supply well for Ras Tanura refinery.',
    requestedBy: 'Eng. F. Al-Zahrani',
    requestedDate: '2026-06-25',
    status: 'in-progress',
    client: 'BI-13',
    supporting: 'Ras Tanura',
    coordinates: '26.6444, 50.1638',
    targetAquifer: 'Wasia',
    proposedDepth: '675 m',
    businessUse: 'Facility water supply',
    priority: 'high',
    assignedTo: 'Eng. F. Al-Zahrani',
    notes: null,
    attachments: [],
  },
  {
    id: 'REQ-00212',
    title: 'Monitoring well — Shaybah Field',
    description: 'Groundwater monitoring well for Shaybah Field.',
    requestedBy: 'Eng. M. Al-Harbi',
    requestedDate: '2026-06-05',
    status: 'in-review',
    client: 'BI-14',
    supporting: 'Shaybah Field',
    coordinates: '22.5372, 53.9736',
    targetAquifer: 'Wajid',
    proposedDepth: '590 m',
    businessUse: 'Environmental monitoring',
    priority: 'medium',
    assignedTo: 'Eng. M. Al-Harbi',
    notes: null,
    attachments: [],
  },
  {
    id: 'REQ-00175',
    title: 'Water supply well — Haradh GOSP',
    description: 'Submitted well request pending assignment.',
    requestedBy: 'Eng. F. Al-Zahrani',
    requestedDate: '2026-05-10',
    status: 'submitted',
    client: 'BI-11',
    supporting: 'Haradh GOSP',
    coordinates: '24.1667, 49.0833',
    targetAquifer: 'Biyadh',
    proposedDepth: '520 m',
    businessUse: 'Facility water supply',
    priority: 'low',
    assignedTo: null,
    notes: null,
    attachments: [],
  },
  {
    id: 'REQ-00160',
    title: 'Water supply well — Khurais Facility',
    description: 'Draft well request, not yet submitted.',
    requestedBy: 'Eng. F. Al-Zahrani',
    requestedDate: '2026-04-30',
    status: 'draft',
    client: 'BI-15',
    supporting: 'Khurais Facility',
    coordinates: '25.1200, 48.0200',
    targetAquifer: 'Umm Er Radhuma',
    proposedDepth: '480 m',
    businessUse: 'Facility water supply',
    priority: null,
    assignedTo: null,
    notes: null,
    attachments: [],
  },
];
```

## src/app/features/wwell-planning/wwell-wlda-approvals/wwell-wlda-approvals.component.html

```html
<section class="wwell-approvals">
  <header class="wwell-approvals__header">
    <div class="wwell-approvals__heading">
      <h1 class="wwell-approvals__title">WLDA Approvals</h1>
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

  @if (loadError()) {
    <div class="wwell-approvals__status wwell-approvals__status--error">{{ loadError() }}</div>
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
      <app-wwell-approval-table
        [rows]="wldaRows()"
        [columns]="wldaColumns"
        [statusMeta]="statusMeta"
        [expandedIds]="expandedIds()"
        [downloadingIds]="downloadingIds()"
        approvalKindLabel="WLDA"
        (rowToggle)="toggleRow($event)"
        (pdfDownload)="downloadWldaPdf($event)"
      />
    }
  </section>
</section>
```

## src/app/features/wwell-planning/wwell-wlda-approvals/wwell-wlda-approvals.component.scss

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

## src/app/features/wwell-planning/wwell-wlda-approvals/wwell-wlda-approvals.component.ts

```typescript
import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable } from 'rxjs';
import { WldaApproval } from '@models/wwell-planning/wwell-planning.model';
import { WwellPlanningService } from '../wwell-planning.service';
import { WwellPlanningStore } from '../store/wwell-planning.store';
import { WWELL_APPROVAL_STATUS_META } from '../shared/wwell-approvals/wwell-approvals.config';
import {
  WwellApprovalTableColumn,
  WwellApprovalTableComponent,
} from '../shared/wwell-approvals/wwell-approval-table/wwell-approval-table.component';
import { WwellWldaRequestFormComponent, WwellWldaRequestFormResult } from './wwell-wlda-request-form/wwell-wlda-request-form.component';

interface SearchableApproval {
  readonly reqNo: string;
  readonly client: string;
  readonly wellName: string;
}

const SNACKBAR_DURATION_MS = 3000;
const DOWNLOAD_URL_REVOKE_DELAY_MS = 5000;

@Component({
  selector: 'app-wwell-wlda-approvals',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatIconModule, WwellApprovalTableComponent],
  templateUrl: './wwell-wlda-approvals.component.html',
  styleUrl: './wwell-wlda-approvals.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellWldaApprovalsComponent implements OnInit {
  protected readonly store = inject(WwellPlanningStore);
  private readonly svc = inject(WwellPlanningService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  protected readonly isLoading = this.store.approvalsLoading;
  protected readonly loadError = this.store.approvalsError;

  protected readonly statusMeta = WWELL_APPROVAL_STATUS_META;

  protected readonly searchTerm = signal('');
  protected readonly expandedIds = signal<ReadonlySet<string>>(new Set());
  protected readonly downloadingIds = signal<ReadonlySet<string>>(new Set());

  protected readonly wldaRows = computed(() => this.filterRows(this.store.wldaApprovals()));

  protected readonly wldaColumns: readonly WwellApprovalTableColumn<WldaApproval>[] = [
    { header: 'Supporting', value: row => row.supporting },
  ];

  protected readonly totalCount = computed(() => this.store.wldaApprovals().length);

  constructor() {
    effect(() => {
      const message = this.store.createApprovalError();
      if (message) {
        this.snackBar.open(message, 'Dismiss', { duration: SNACKBAR_DURATION_MS });
      }
    });
  }

  ngOnInit(): void {
    this.store.loadWldaApprovals();
  }

  protected onSearchChange(term: string): void {
    this.searchTerm.set(term);
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
      .open<WwellWldaRequestFormComponent, unknown, WwellWldaRequestFormResult>(WwellWldaRequestFormComponent, {
        panelClass: 'wwell-wlda-request-form-panel',
        maxWidth: '95vw',
        autoFocus: false,
      })
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

  protected isDownloading(id: string): boolean {
    return this.downloadingIds().has(id);
  }

  protected downloadWldaPdf(row: WldaApproval): void {
    this.downloadPdf(row.id, `${row.reqNo}-WLDA.pdf`, this.svc.getWldaApprovalPdf(row));
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

## src/app/features/wwell-planning/wwell-wlda-approvals/wwell-wlda-request-form/wwell-wlda-request-form.component.html

```html
<div class="wldaf">
  <app-wwell-form-dialog-shell title="Request WLDA Approval" [subtitle]="chainSubtitle" (closed)="close()">
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

    <ng-container dialogActions>
      <button type="button" mat-stroked-button (click)="saveDraft()">
        <mat-icon>bookmark_border</mat-icon>
        Save as Draft
      </button>
      <button type="button" mat-flat-button color="primary" (click)="submit()">
        <mat-icon>send</mat-icon>
        Submit
      </button>
    </ng-container>
  </app-wwell-form-dialog-shell>
</div>
```

## src/app/features/wwell-planning/wwell-wlda-approvals/wwell-wlda-request-form/wwell-wlda-request-form.component.scss

```scss
@use '@angular/material' as mat;
@use '../../shared/wwell-select-panel-mixin' as wsel;

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
  @include wsel.panel($accent, $navy);
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
  @include wsel.trigger($accent);
}

@media (prefers-reduced-motion: reduce) {
  .wldaf {
    animation: none;
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
}
```

## src/app/features/wwell-planning/wwell-wlda-approvals/wwell-wlda-request-form/wwell-wlda-request-form.component.ts

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
} from '../../shared/wwell-approvals/wwell-approvals.config';
import { WwellAttachmentDropzoneComponent } from '../../shared/wwell-attachment-dropzone/wwell-attachment-dropzone.component';
import { WwellFormDialogShellComponent } from '../../shared/wwell-form-dialog-shell/wwell-form-dialog-shell.component';
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
    WwellFormDialogShellComponent,
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

## src/app/features/wwell-planning/wwell-wlda-approvals/wwell-wlda-request-form/wwell-wlda-request-form.config.ts

```typescript
export { WWELL_CLIENT_OPTIONS as WWELL_WLDA_FORM_CLIENT_OPTIONS } from '../../shared/wwell-planning-reference-data.config';
export { WWELL_AQUIFER_OPTIONS as WWELL_WLDA_FORM_AQUIFER_OPTIONS } from '../../shared/wwell-planning-reference-data.config';
export { WWELL_BUSINESS_USE_OPTIONS as WWELL_WLDA_FORM_BUSINESS_USE_OPTIONS } from '../../shared/wwell-planning-reference-data.config';
export { WWELL_ASSIGNEE_OPTIONS as WWELL_WLDA_FORM_ASSIGNEE_OPTIONS } from '../../shared/wwell-planning-reference-data.config';
export { WWELL_DEPTH_PATTERN as WWELL_WLDA_FORM_DEPTH_PATTERN } from '../../shared/wwell-planning-reference-data.config';
export { WWELL_DRILLING_METHOD_OPTIONS as WWELL_WLDA_FORM_DRILLING_METHOD_OPTIONS } from '../../shared/wwell-planning-reference-data.config';
```

