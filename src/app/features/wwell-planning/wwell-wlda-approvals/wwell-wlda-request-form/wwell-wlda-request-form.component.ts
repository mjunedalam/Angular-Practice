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
