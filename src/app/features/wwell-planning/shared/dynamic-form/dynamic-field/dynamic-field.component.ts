import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { WwellAttachmentDropzoneComponent } from '../../wwell-attachment-dropzone/wwell-attachment-dropzone.component';
import {
  WwellFieldConfig,
  wwellFieldOptionIcon,
  wwellFieldOptionLabel,
  wwellFieldOptionValue,
} from '../wwell-dynamic-form.types';

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
    MatIconModule,
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
  protected readonly optionIcon = wwellFieldOptionIcon;

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

  protected readonly isReviewValueEmpty = computed(() => this.reviewValue() === '—');

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
