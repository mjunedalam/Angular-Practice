import { FormArray, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import {
  WwellFieldConfig,
  WwellFormSectionConfig,
  WwellFormStepConfig,
  WwellRepeatableRowConfig,
} from './wwell-dynamic-form.types';

/** Empty `File[]` isn't falsy to Angular's default `required` validator — needs its own check. */
const requiredFileList: ValidatorFn = control => (control.value?.length ? null : { required: true });

/**
 * `Validators.minLength` looks like the obvious fit for `minRequiredRows`, but Angular's own
 * `isEmptyInputValue` check makes it treat a *zero-length* array as "nothing to validate yet"
 * and returns null (valid) — the same opt-out that lets `minLength` coexist with an optional
 * field. That silently defeated `minRequiredRows`'s whole point (see its doc comment): a
 * freshly-loaded step with zero rows showed up as complete (green check) in both the step rail
 * and the Attachments & Review completion count. This validator has no such exemption — an
 * array shorter than `min`, including empty, is always invalid.
 */
function minRowsValidator(min: number): ValidatorFn {
  return control => ((control.value?.length ?? 0) < min ? { minRows: { requiredLength: min, actualLength: control.value?.length ?? 0 } } : null);
}

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
  return fb.control({ value: defaultValueFor(field), disabled: !!field.readonly }, buildValidators(field));
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
  const arrayValidators = config.minRequiredRows ? [minRowsValidator(config.minRequiredRows)] : [];
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
