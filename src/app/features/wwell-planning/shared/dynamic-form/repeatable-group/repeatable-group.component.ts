import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  QueryList,
  ViewChildren,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import {
  buildConditionalFieldEnterTimeline,
  buildConditionalFieldExitTimeline,
  setConditionalFieldVisibility,
} from '../dynamic-section/conditional-field.animation';
import { DynamicFieldComponent, WwellDynamicFieldMode } from '../dynamic-field/dynamic-field.component';
import { playIfMotionAllowed } from '../motion.util';
import { addRepeatableRow, defaultValueFor } from '../wwell-dynamic-form.builder';
import { WwellFieldConfig, WwellRepeatableRowConfig } from '../wwell-dynamic-form.types';
import { buildRowEnterTimeline, buildRowExitTimeline } from './repeatable-row.animation';

@Component({
  selector: 'app-repeatable-group',
  standalone: true,
  imports: [DynamicFieldComponent, MatButtonModule, MatIconModule],
  templateUrl: './repeatable-group.component.html',
  styleUrl: './repeatable-group.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RepeatableGroupComponent implements AfterViewInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly config = input.required<WwellRepeatableRowConfig>();
  readonly formArray = input.required<FormArray>();
  readonly mode = input<WwellDynamicFieldMode>('edit');
  readonly selectPanelClass = input('');

  @ViewChildren('rowHost') private readonly rowHosts?: QueryList<ElementRef<HTMLElement>>;

  /**
   * Row-level `visibleWhen` support — `app-dynamic-section` implements this for flat
   * `section().fields`, but never for `section().repeatable` rows, so it's ported here
   * rather than duplicated per-feature. Each row gets its own independent visibility
   * state, resolved against that row's own `FormGroup` (not the whole array), because a
   * repeatable row's condition (e.g. "this row's Type is Liner") only ever depends on a
   * sibling field within the *same* row.
   */
  @ViewChildren('rowFieldHost') private readonly rowFieldHosts?: QueryList<ElementRef<HTMLElement>>;

  /** Only fields with `visibleWhen` grow a `#rowFieldHost` wrapper — the template renders
   * exactly this many per row, in this order, so `row index * length + field index` maps
   * a (row, field) pair onto the flat, document-order `rowFieldHosts` query list. */
  protected readonly conditionalRowFields = computed(() => this.config().rowFields.filter(field => field.visibleWhen));

  /** Bumped only on user-triggered `addRow()` so the effect below can play an entrance animation for it. */
  private readonly addedRowTick = signal(0);

  /** Tracks last-applied visibility per (row, field key) so we only animate on an actual flip. Keyed by row
   * object identity (not index) so it survives rows being added/removed/reordered without misattribution. */
  private readonly lastVisibility = new Map<FormGroup, Map<string, boolean>>();
  private valueChangesSubscription?: Subscription;
  private rowFieldHostsSubscription?: Subscription;

  constructor() {
    effect(() => {
      const tick = this.addedRowTick();
      if (tick === 0) return;
      const last = this.rowHosts?.last;
      if (last) playIfMotionAllowed(buildRowEnterTimeline(last.nativeElement));
    });
  }

  ngAfterViewInit(): void {
    this.syncDerivedFields();
    this.syncConditionalRowFields();
    this.valueChangesSubscription = this.formArray().valueChanges.subscribe(() => this.onFormArrayChanged());
    // Re-sync whenever the query list's elements change (row added/removed) — a freshly
    // added row's #rowFieldHost isn't queryable until after this fires.
    this.rowFieldHostsSubscription = this.rowFieldHosts?.changes.subscribe(() => this.syncConditionalRowFields());
    // See `onFormArrayChanged`'s doc comment — the very first render can be just as stale as
    // any later one, for the same reason, so it needs the same forced re-check.
    this.cdr.detectChanges();
  }

  ngOnDestroy(): void {
    this.valueChangesSubscription?.unsubscribe();
    this.rowFieldHostsSubscription?.unsubscribe();
  }

  protected rows(): FormGroup[] {
    return this.formArray().controls as FormGroup[];
  }

  /**
   * Pushing/removing a row (or editing any field in one) mutates the `formArray` input's own
   * `FormArray` object in place — the input's own signal reference never changes, so Angular's
   * standard OnPush triggers (changed input, event sourced from this component's own template,
   * a *directly template-read* signal changing) never fire for a `RepeatableGroupComponent`
   * instance that didn't cause the mutation itself. That's invisible for the normal "edit"
   * instance (its own "+ Add"/remove buttons are template-sourced click events, so zone.js
   * re-checks it for free) but left every *other* instance of the same section — concretely,
   * the read-only copy the Attachments & Review step renders for the same FormArray — stuck
   * forever showing whatever row count existed when it first mounted. Confirmed live: filling
   * in an Offset Water Well and opening the review step showed a completely empty section,
   * with the underlying FormArray provably holding the right row the whole time. Forcing a
   * synchronous `detectChanges()` here — rather than the usual `markForCheck()` — is deliberate:
   * this component sits inside a `mat-expansion-panel`, and Material detaches a collapsed
   * panel's content from the ambient change-detection walk, so merely flagging "needs a check"
   * isn't enough when nothing ever walks back down to it on its own.
   */
  private onFormArrayChanged(): void {
    this.syncDerivedFields();
    this.syncConditionalRowFields();
    this.cdr.detectChanges();
  }

  protected fieldControl(row: FormGroup, key: string): FormControl {
    return row.get(key) as FormControl;
  }

  protected addRow(): void {
    addRepeatableRow(this.formArray(), this.config().rowFields, this.fb);
    this.addedRowTick.update(tick => tick + 1);
  }

  protected removeRow(index: number): void {
    const row = this.rows()[index];
    const host = this.rowHosts?.get(index);
    if (!host) {
      this.formArray().removeAt(index);
      this.lastVisibility.delete(row);
      return;
    }

    playIfMotionAllowed(buildRowExitTimeline(host.nativeElement, () => {
      this.formArray().removeAt(index);
      this.lastVisibility.delete(row);
    }));
  }

  /** Writes each `derived` field's computed value into its control. Only a changed value is written, so the
   *  valueChanges this triggers settles on the next pass instead of looping. */
  private syncDerivedFields(): void {
    const derivedFields = this.config().rowFields.filter(field => field.derived);
    if (!derivedFields.length) return;

    for (const row of this.rows()) {
      for (const field of derivedFields) {
        const control = this.fieldControl(row, field.key);
        const value = field.derived?.compute(row.getRawValue()) ?? null;
        if (control.value !== value) control.setValue(value);
      }
    }
  }

  private syncConditionalRowFields(): void {
    const conditionalFields = this.conditionalRowFields();
    if (!conditionalFields.length) return;

    this.rows().forEach((row, rowIndex) => {
      conditionalFields.forEach((field, fieldIndex) => {
        const host = this.rowFieldHosts?.get(rowIndex * conditionalFields.length + fieldIndex)?.nativeElement;
        if (host) this.applyFieldVisibility(row, field, host);
      });
    });
  }

  private applyFieldVisibility(row: FormGroup, field: WwellFieldConfig, host: HTMLElement): void {
    const rowVisibility = this.lastVisibility.get(row) ?? new Map<string, boolean>();
    this.lastVisibility.set(row, rowVisibility);

    const isVisible = this.isFieldVisible(row, field);
    const seenBefore = rowVisibility.has(field.key);
    const wasVisible = rowVisibility.get(field.key);
    rowVisibility.set(field.key, isVisible);

    if (!seenBefore) {
      setConditionalFieldVisibility(host, isVisible);
      this.syncControlEnabled(row, field, isVisible);
      return;
    }
    if (isVisible === wasVisible) return;

    if (isVisible) {
      this.syncControlEnabled(row, field, true);
      playIfMotionAllowed(buildConditionalFieldEnterTimeline(host));
    } else {
      playIfMotionAllowed(buildConditionalFieldExitTimeline(host, () => this.syncControlEnabled(row, field, false)));
    }
  }

  private isFieldVisible(row: FormGroup, field: WwellFieldConfig): boolean {
    const condition = field.visibleWhen;
    if (!condition) return true;

    const sibling = row.get(condition.field);
    const value = sibling?.value;
    if (condition.equals !== undefined) return value === condition.equals;
    if (condition.oneOf) return condition.oneOf.includes(value);
    if (condition.notOneOf) return !condition.notOneOf.includes(value);
    if (condition.includesLine !== undefined) {
      return typeof value === 'string' && value.split('\n').some(line => line.trim() === condition.includesLine);
    }
    return true;
  }

  /** Hidden fields are disabled (excluded from validity/`.value`) and reset so a stale value from another row/mode never submits. */
  private syncControlEnabled(row: FormGroup, field: WwellFieldConfig, isVisible: boolean): void {
    const control = this.fieldControl(row, field.key);
    if (isVisible) {
      if (control.disabled) control.enable({ emitEvent: false });
      return;
    }
    if (control.enabled) {
      control.reset(defaultValueFor(field), { emitEvent: false });
      control.disable({ emitEvent: false });
    }
  }
}
