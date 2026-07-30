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
