import { FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import {
  WwellFieldConfig,
  WwellFormSectionConfig,
  WwellFormStepConfig,
  WwellRepeatableRowConfig,
} from './wwell-dynamic-form.types';

/** Empty `File[]` isn't falsy to Angular's default `required` validator — needs its own check. */
const requiredFileList: ValidatorFn = control => (control.value?.length ? null : { required: true });

export function defaultValueFor(field: WwellFieldConfig): unknown {
  if (field.defaultValue !== undefined) return field.defaultValue;
  if (field.type === 'file') return [];
  if (field.type === 'number') return null;
  return '';
}

function buildValidators(field: WwellFieldConfig): ValidatorFn[] {
  const config = field.validators;
  if (!config) return [];

  const validators: ValidatorFn[] = [];
  if (config.required) {
    validators.push(field.type === 'file' ? requiredFileList : Validators.required);
  }
  if (config.pattern) validators.push(Validators.pattern(config.pattern));
  if (config.min !== undefined) validators.push(Validators.min(config.min));
  return validators;
}

export function buildFieldControl(field: WwellFieldConfig, fb: FormBuilder): FormControl {
  return fb.control(defaultValueFor(field), buildValidators(field));
}

export function buildRepeatableRowGroup(rowFields: readonly WwellFieldConfig[], fb: FormBuilder): FormGroup {
  const group = fb.group({});
  rowFields.forEach(field => group.addControl(field.key, buildFieldControl(field, fb)));
  return group;
}

export function addRepeatableRow(array: FormArray, rowFields: readonly WwellFieldConfig[], fb: FormBuilder): void {
  array.push(buildRepeatableRowGroup(rowFields, fb));
}

function buildRepeatableArray(config: WwellRepeatableRowConfig, fb: FormBuilder): FormArray {
  const arrayValidators = config.minRequiredRows ? [Validators.minLength(config.minRequiredRows)] : [];
  const array = fb.array<FormGroup>([], arrayValidators);
  const minRows = config.minRows ?? 0;
  for (let i = 0; i < minRows; i++) {
    addRepeatableRow(array, config.rowFields, fb);
  }
  return array;
}

export function buildSectionGroup(section: WwellFormSectionConfig, fb: FormBuilder): FormGroup | FormArray {
  if (section.repeatable) return buildRepeatableArray(section.repeatable, fb);

  const group = fb.group({});
  (section.fields ?? []).forEach(field => group.addControl(field.key, buildFieldControl(field, fb)));
  return group;
}

export function buildWwellDynamicForm(schema: readonly WwellFormStepConfig[], fb: FormBuilder): FormGroup {
  const root = fb.group({});
  schema.forEach(step => {
    const stepGroup = fb.group({});
    step.sections.forEach(section => stepGroup.addControl(section.key, buildSectionGroup(section, fb)));
    root.addControl(step.key, stepGroup);
  });
  return root;
}
