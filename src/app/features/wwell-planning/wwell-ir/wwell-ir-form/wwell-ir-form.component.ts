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
