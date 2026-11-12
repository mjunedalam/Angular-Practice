import { computed, signal } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
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
 *
 * `isEditing` vs `visible`: a row delete from the read-only table (see deleteCasingRow etc. in
 * wwell-ir-editor.component.ts) needs a live control to remove the row from and to source Save's
 * payload/diff from — same mechanism a real edit uses — but must NOT flip the whole section over
 * to its big edit-form UI just to remove one row; that swap is what made a single-row delete read
 * as "the whole section reloaded". `open({ silent: true })` builds the control (or reuses the
 * existing one) without revealing the edit form; `isEditing` still reports true so
 * hasUnsavedChanges (which must catch a silent delete too) is unaffected, while `visible` — what
 * the template actually gates the edit-form-vs-read-table branch on — stays false until an
 * explicit `open()`/`open({ silent: false })` (the pencil buttons) asks for it.
 */
export class SectionEditState<TControl extends FormGroup | FormArray, TValue = unknown> {
  private readonly controlSignal = signal<TControl | null>(null);
  readonly control = this.controlSignal.asReadonly();
  readonly isEditing = computed(() => this.controlSignal() !== null);

  private readonly visibleSignal = signal(false);
  readonly visible = this.visibleSignal.asReadonly();

  private readonly liveValueSignal = signal<TValue | null>(null);
  readonly liveValue = this.liveValueSignal.asReadonly();
  private subscription: Subscription | null = null;

  constructor(private readonly buildControl: () => TControl) {}

  /** No-op on the control itself if already editing — reopening must never discard in-progress
   *  edits with a fresh snapshot. A visible open reveals the form even if it was already open
   *  silently (e.g. the user deletes a row, then clicks the section's own pencil afterward). */
  open(opts?: { silent?: boolean }): void {
    if (!this.isEditing()) {
      const control = this.buildControl();
      this.controlSignal.set(control);
      this.liveValueSignal.set(control.getRawValue());
      this.subscription = control.valueChanges.subscribe(() => this.liveValueSignal.set(control.getRawValue()));
    }
    if (!opts?.silent) this.visibleSignal.set(true);
  }

  close(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;
    this.controlSignal.set(null);
    this.liveValueSignal.set(null);
    this.visibleSignal.set(false);
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

/**
 * Tracks which single row (by index) of a repeatable section's live FormArray is being edited
 * inline, directly inside the read-only table — the row-level counterpart to `SectionEditState`'s
 * `visible`/silent split: a delete already avoids opening the whole section's form (see
 * deleteCasingRow etc. in wwell-ir-editor.component.ts), and this does the same for a row-level
 * edit, so "Edit" on one row never swaps the whole table over to the big multi-row form either.
 *
 * Editing writes straight into the FormArray's own row control (via the same `xEdit.control()`
 * a delete opens silently), so Save's `existing`-diff sees it exactly like any other edit — no
 * separate draft/merge step needed. `cancel()` restores whatever the row held right when `open()`
 * was called, not the persisted record, so it stays correct even if an earlier uncommitted
 * delete/edit already sits in the same FormArray this session (index-based, not identity-based, so
 * it only ever needs the row's own control, not the whole array).
 */
export class InlineRowEditState {
  private readonly indexSignal = signal<number | null>(null);
  readonly index = this.indexSignal.asReadonly();
  private snapshot: unknown = null;
  private wasPristine = true;

  isEditing(rowIndex: number): boolean {
    return this.indexSignal() === rowIndex;
  }

  open(rowIndex: number, control: AbstractControl): void {
    this.snapshot = control.getRawValue();
    this.wasPristine = control.pristine;
    this.indexSignal.set(rowIndex);
  }

  /** No-op if nothing was ever opened (e.g. the row control disappeared from under it). */
  cancel(control: AbstractControl | undefined | null): void {
    if (control && this.snapshot !== null) {
      control.patchValue(this.snapshot);
      // Restored to what it held before this edit began, so the unsaved-change highlight goes with it.
      if (this.wasPristine) control.markAsPristine();
    }
    this.close();
  }

  close(): void {
    this.indexSignal.set(null);
    this.snapshot = null;
  }
}

/** Reorders an array's rows shallowest-first by the named depth control, in place. Rows are reshuffled by rewriting
 *  their values (every row group has the same shape), so the controls and the array stay the same objects. */
export function sortFormArrayByDepth(array: FormArray, depthKey: string): void {
  const rows = array.controls.map(control => (control as FormGroup).getRawValue() as Record<string, unknown>);
  const depth = (row: Record<string, unknown>): number => (typeof row[depthKey] === 'number' ? (row[depthKey] as number) : Number.POSITIVE_INFINITY);
  const sorted = [...rows].sort((a, b) => depth(a) - depth(b));
  if (sorted.every((row, index) => row === rows[index])) return;
  sorted.forEach((row, index) => array.at(index).patchValue(row));
}
