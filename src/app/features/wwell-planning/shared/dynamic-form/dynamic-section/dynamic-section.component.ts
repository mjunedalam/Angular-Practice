import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { DynamicFieldComponent, WwellDynamicFieldMode } from '../dynamic-field/dynamic-field.component';
import { RepeatableGroupComponent } from '../repeatable-group/repeatable-group.component';
import { WwellFormSectionConfig } from '../wwell-dynamic-form.types';

@Component({
  selector: 'app-dynamic-section',
  standalone: true,
  imports: [DynamicFieldComponent, RepeatableGroupComponent],
  templateUrl: './dynamic-section.component.html',
  styleUrl: './dynamic-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicSectionComponent {
  readonly section = input.required<WwellFormSectionConfig>();
  readonly control = input.required<AbstractControl>();
  readonly mode = input<WwellDynamicFieldMode>('edit');
  readonly selectPanelClass = input('');

  protected fieldControl(key: string): FormControl {
    return (this.control() as FormGroup).get(key) as FormControl;
  }

  protected asFormArray(): FormArray {
    return this.control() as FormArray;
  }
}
