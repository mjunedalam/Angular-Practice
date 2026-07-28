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
