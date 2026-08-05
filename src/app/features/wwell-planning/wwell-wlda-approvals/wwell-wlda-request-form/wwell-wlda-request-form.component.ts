import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { CreateWldaApprovalPayload } from '@models/wwell-planning/wwell-planning.model';
import { WWELL_WLDA_CHAIN_ROLES } from '../../shared/wwell-approvals/wwell-approvals.config';
import { DynamicSectionComponent } from '../../shared/dynamic-form/dynamic-section/dynamic-section.component';
import { buildSectionGroup } from '../../shared/dynamic-form/wwell-dynamic-form.builder';
import { WwellAttachmentDropzoneComponent } from '../../shared/wwell-attachment-dropzone/wwell-attachment-dropzone.component';
import { WwellFormDialogShellComponent } from '../../shared/wwell-form-dialog-shell/wwell-form-dialog-shell.component';
import { WWELL_WLDA_FORM_SECTION } from './wwell-wlda-request-form.config';

export interface WwellWldaRequestFormResult {
  readonly mode: 'draft' | 'submit';
  readonly payload: CreateWldaApprovalPayload;
  readonly files: File[];
}

interface WwellWldaFormRawValue {
  readonly client: string;
  readonly wellName: string;
  readonly supporting: string;
  readonly initialCoordinates: string;
  readonly finalCoordinates: string;
  readonly proposedDepth: string;
  readonly targetAquifer: string;
  readonly businessUse: string;
  readonly drillingMethod: string;
  readonly assignedTo: string;
  readonly notes: string;
}

const SELECT_PANEL_CLASS = 'wldaf-select-panel';

@Component({
  selector: 'app-wwell-wlda-request-form',
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
  templateUrl: './wwell-wlda-request-form.component.html',
  styleUrl: './wwell-wlda-request-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class WwellWldaRequestFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<WwellWldaRequestFormComponent, WwellWldaRequestFormResult | undefined>);

  protected readonly formSection = WWELL_WLDA_FORM_SECTION;
  protected readonly selectPanelClass = SELECT_PANEL_CLASS;

  protected readonly chainSubtitle = `Well Location & Drilling Approval — ${WWELL_WLDA_CHAIN_ROLES.length}-step chain: ${WWELL_WLDA_CHAIN_ROLES.join(' → ')}`;

  private files: File[] = [];

  protected readonly form = buildSectionGroup(WWELL_WLDA_FORM_SECTION, this.fb) as FormGroup;

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
    const value = this.form.getRawValue() as WwellWldaFormRawValue;
    return {
      client: value.client,
      wellName: value.wellName.toUpperCase(),
      supporting: value.supporting,
      initialCoordinates: value.initialCoordinates,
      finalCoordinates: value.finalCoordinates.trim() || null,
      proposedDepth: value.proposedDepth || null,
      targetAquifer: value.targetAquifer || null,
      businessUse: value.businessUse,
      drillingMethod: value.drillingMethod || null,
      assignedTo: value.assignedTo || null,
      notes: value.notes.trim() || null,
    };
  }
}
