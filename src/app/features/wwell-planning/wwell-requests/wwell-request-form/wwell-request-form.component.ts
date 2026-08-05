import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  CreateWwellPlanningRequestPayload,
  WwellPlanningPriority,
  WwellPlanningRequest,
} from '@models/wwell-planning/wwell-planning.model';
import { DynamicSectionComponent } from '../../shared/dynamic-form/dynamic-section/dynamic-section.component';
import { WwellDynamicFieldMode } from '../../shared/dynamic-form/dynamic-field/dynamic-field.component';
import { buildSectionGroup } from '../../shared/dynamic-form/wwell-dynamic-form.builder';
import { WwellAttachmentDropzoneComponent } from '../../shared/wwell-attachment-dropzone/wwell-attachment-dropzone.component';
import { WwellFormDialogShellComponent } from '../../shared/wwell-form-dialog-shell/wwell-form-dialog-shell.component';
import { WWELL_REQUEST_FORM_SECTION } from './wwell-request-form.config';

export type WwellRequestFormMode = 'create' | 'view';

export interface WwellRequestFormDialogData {
  readonly mode: WwellRequestFormMode;
  readonly request?: WwellPlanningRequest;
}

export interface WwellRequestFormResult {
  readonly payload: CreateWwellPlanningRequestPayload;
  readonly files: File[];
}

interface WwellRequestFormRawValue {
  readonly client: string;
  readonly wellName: string;
  readonly initialCoordinates: string;
  readonly supportingBusiness: string;
  readonly proposedDepth: string;
  readonly targetAquifer: string;
  readonly finalCoordinates: string;
  readonly assignedTo: string;
  readonly priority: WwellPlanningPriority | '';
  readonly notes: string;
}

const SELECT_PANEL_CLASS = 'wrf-select-panel';

@Component({
  selector: 'app-wwell-request-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    DynamicSectionComponent,
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

  protected readonly formSection = WWELL_REQUEST_FORM_SECTION;
  protected readonly selectPanelClass = SELECT_PANEL_CLASS;

  protected readonly isViewMode = this.data.mode === 'view';
  protected readonly fieldMode: WwellDynamicFieldMode = this.isViewMode ? 'review' : 'edit';
  private files: File[] = [];

  protected readonly dialogTitle = this.isViewMode ? 'Request Details' : 'New Request';
  protected readonly dialogSubtitle = this.isViewMode
    ? this.data.request
      ? `${this.data.request.id} · Submitted ${this.data.request.requestedDate}`
      : null
    : 'Create a new well request — will be routed for approvals after submission';

  protected readonly form = buildSectionGroup(WWELL_REQUEST_FORM_SECTION, this.fb) as FormGroup;

  constructor() {
    const request = this.data.request;
    if (request) {
      this.form.patchValue({
        client: request.client,
        wellName: request.wellName,
        initialCoordinates: request.initialCoordinates,
        supportingBusiness: request.supportingBusiness,
        proposedDepth: request.proposedDepth ?? '',
        targetAquifer: request.targetAquifer ?? '',
        finalCoordinates: request.finalCoordinates ?? '',
        assignedTo: request.assignedTo ?? '',
        priority: request.priority ?? '',
        notes: request.notes ?? '',
      });
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

    const value = this.form.getRawValue() as WwellRequestFormRawValue;
    const payload: CreateWwellPlanningRequestPayload = {
      client: value.client,
      wellName: value.wellName.toUpperCase(),
      supportingBusiness: value.supportingBusiness,
      initialCoordinates: value.initialCoordinates,
      finalCoordinates: value.finalCoordinates.trim() || null,
      targetAquifer: value.targetAquifer || null,
      proposedDepth: value.proposedDepth || null,
      assignedTo: value.assignedTo || null,
      priority: value.priority || null,
      notes: value.notes.trim() || null,
      status,
    };

    this.dialogRef.close({ payload, files: this.files });
  }

  protected onFilesChange(files: File[]): void {
    this.files = files;
  }
}
