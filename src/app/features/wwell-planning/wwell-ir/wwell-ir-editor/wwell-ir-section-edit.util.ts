import { computed, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { addRepeatableRow, buildSectionGroup } from '../../shared/dynamic-form/wwell-dynamic-form.builder';
import { WwellFormSectionConfig } from '../../shared/dynamic-form/wwell-dynamic-form.types';

/**
 * One independent edit toggle for one editor section — the IR editor creates one instance per
 * inline-editable section instead of a single shared "which section is being edited" flag, so any
 * number of sections can be mid-edit at once without stepping on each other.
 *
 * `liveValue` mirrors the control's raw value as a signal, kept in sync via `valueChanges` for as
 * long as the section stays open — this is what lets a consumer (e.g. the Wellbore Preview) react
 * to an in-progress edit instead of only the last-saved record. It's `null` whenever the section
 * isn't being edited, so callers should fall back to their own persisted data in that case.
 */
export class SectionEditState<TControl extends FormGroup | FormArray, TValue = unknown> {
  private readonly controlSignal = signal<TControl | null>(null);
  readonly control = this.controlSignal.asReadonly();
  readonly isEditing = computed(() => this.controlSignal() !== null);

  private readonly liveValueSignal = signal<TValue | null>(null);
  readonly liveValue = this.liveValueSignal.asReadonly();
  private subscription: Subscription | null = null;

  constructor(private readonly buildControl: () => TControl) {}

  /** No-op if already editing — reopening must never discard in-progress edits with a fresh snapshot. */
  open(): void {
    if (this.isEditing()) return;
    const control = this.buildControl();
    this.controlSignal.set(control);
    this.liveValueSignal.set(control.getRawValue());
    this.subscription = control.valueChanges.subscribe(() => this.liveValueSignal.set(control.getRawValue()));
  }

  close(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
    this.controlSignal.set(null);
    this.liveValueSignal.set(null);
  }
}

/** Builds a section's plain-fields FormGroup (see buildSectionGroup) and seeds it from an
 *  already-saved record — the editor's counterpart to populateFormForEdit's `.patchValue()`. */
export function buildAndPatchGroup(section: WwellFormSectionConfig, fb: FormBuilder, patch: object): FormGroup {
  const group = buildSectionGroup(section, fb) as FormGroup;
  group.patchValue(patch);
  return group;
}

/** Builds a repeatable section's FormArray and grows+fills it to match existing domain rows. */
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
