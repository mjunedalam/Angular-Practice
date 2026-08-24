import { computed, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { addRepeatableRow, buildSectionGroup } from '../../shared/dynamic-form/wwell-dynamic-form.builder';
import { WwellFormSectionConfig } from '../../shared/dynamic-form/wwell-dynamic-form.types';

/**
 * One independent edit toggle for one detail-page section — the IR detail view creates one
 * instance per editable section (see wwell-ir-detail.component.ts) instead of a single shared
 * "which section is being edited" flag, so any number of sections can be mid-edit at once without
 * stepping on each other.
 */
export class SectionEditState<TControl extends FormGroup | FormArray> {
  private readonly controlSignal = signal<TControl | null>(null);
  readonly control = this.controlSignal.asReadonly();
  readonly isEditing = computed(() => this.controlSignal() !== null);

  constructor(private readonly buildControl: () => TControl) {}

  /** No-op if already editing — reopening must never discard in-progress edits with a fresh snapshot. */
  open(): void {
    if (!this.isEditing()) this.controlSignal.set(this.buildControl());
  }

  close(): void {
    this.controlSignal.set(null);
  }
}

/** Builds a section's plain-fields FormGroup (see buildSectionGroup) and seeds it from an
 *  already-saved record — the wizard-form counterpart to populateFormForEdit's `.patchValue()`. */
export function buildAndPatchGroup(section: WwellFormSectionConfig, fb: FormBuilder, patch: object): FormGroup {
  const group = buildSectionGroup(section, fb) as FormGroup;
  group.patchValue(patch);
  return group;
}

/** Builds a repeatable section's FormArray and grows+fills it to match existing domain rows —
 *  mirrors populateRepeatableSection in wwell-ir-new-page.component.ts, generalized for reuse here. */
export function buildAndPatchArray<TDomainRow>(
  section: WwellFormSectionConfig,
  fb: FormBuilder,
  rows: readonly TDomainRow[],
  toRowPatch: (row: TDomainRow) => object,
): FormArray {
  const array = buildSectionGroup(section, fb) as FormArray;
  const rowFields = section.repeatable?.rowFields ?? [];
  rows.forEach(row => {
    addRepeatableRow(array, rowFields, fb);
    array.at(array.length - 1).patchValue(toRowPatch(row));
  });
  return array;
}
