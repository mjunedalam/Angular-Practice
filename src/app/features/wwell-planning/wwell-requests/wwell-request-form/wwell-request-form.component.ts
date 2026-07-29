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
