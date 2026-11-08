import { ChangeDetectionStrategy, Component, ElementRef, computed, input, signal, viewChild } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { switchMap, startWith } from 'rxjs';
import { WwellAttachmentDropzoneComponent } from '../../wwell-attachment-dropzone/wwell-attachment-dropzone.component';
import { WwellRichTextareaComponent } from '../rich-textarea/wwell-rich-textarea.component';
import {
  WwellFieldConfig,
  resolveFieldOptions,
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
    WwellRichTextareaComponent,
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

  /** Resolves the config's `options` (static array or live Signal) once per change — every
   *  options `@for` loop below reads this instead of `config().options` directly. */
  protected readonly resolvedOptions = computed(() => resolveFieldOptions(this.config()));

  /** Backs the filter input a `searchable: true` 'select' field projects into its own mat-select
   *  panel (see the template) — mat-select has no built-in search. Stays '' for every other
   *  field, since nothing renders an input to change it, so `filteredOptions` below is then just
   *  `resolvedOptions()` unfiltered. */
  protected readonly optionSearchTerm = signal('');

  /** The searchable-select panel's filter `<input>` — queried instead of using the `autofocus`
   *  attribute (flagged by @angular-eslint/template/no-autofocus and unreliable for content
   *  that mounts into a CDK overlay after the panel opens). */
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  protected readonly filteredOptions = computed(() => {
    const term = this.optionSearchTerm().trim().toLowerCase();
    if (!term) return this.resolvedOptions();
    return this.resolvedOptions().filter(opt => this.optionLabel(opt).toLowerCase().includes(term));
  });

  /** Clears the filter on close so reopening the panel always starts from the full list instead
   *  of whatever was last typed. On open, focuses the filter input once the overlay panel has
   *  attached — a plain template `autofocus` fires before that element exists in the DOM. */
  protected onSelectOpenedChange(opened: boolean): void {
    if (!opened) {
      this.optionSearchTerm.set('');
      return;
    }
    setTimeout(() => this.searchInput()?.nativeElement.focus());
  }

  protected onOptionSearchInput(event: Event): void {
    this.optionSearchTerm.set((event.target as HTMLInputElement).value);
  }

  /**
   * `control()` is a Signal input, but the bound FormControl's own `.value` mutates in place
   * on every keystroke and is never itself signal-tracked — reading it directly inside a
   * `computed()` (as `reviewValue` below used to) only evaluates once, at first read, and then
   * freezes forever: the Attachments & Review step's tiles kept showing '—' even after the
   * matching field was filled in on an earlier step. Bridging through `valueChanges` (and
   * re-subscribing whenever a *different* control is bound) keeps this genuinely reactive.
   */
  // No `initialValue`/`requireSync`: reading `this.control()` synchronously in a field
  // initializer (for an `initialValue`) fails the compiler's NG8118 check — inputs aren't bound
  // yet at that point — and `toObservable` doesn't emit synchronously either (its effect is
  // scheduled, not immediate), so `requireSync` throws NG0601 at construction instead. Left
  // without either, `liveValue()` is simply `undefined` for the first tick, which `reviewValue`
  // below already treats the same as an empty value.
  private readonly liveValue = toSignal(
    toObservable(this.control).pipe(switchMap(control => control.valueChanges.pipe(startWith(control.value)))),
  );

  protected readonly reviewValue = computed(() => {
    const value = this.liveValue();
    const cfg = this.config();

    if (cfg.type === 'file') {
      const files = value as File[] | null;
      return files?.length ? `${files.length} file(s) attached` : '—';
    }
    if (cfg.type === 'select' || cfg.type === 'toggle-group') {
      const match = this.resolvedOptions().find(opt => wwellFieldOptionValue(opt) === value);
      return match ? wwellFieldOptionLabel(match) : (value || '—');
    }
    return value === null || value === undefined || value === '' ? '—' : String(value);
  });

  /** True once the user has changed this control (Angular's `dirty`, set only by user input — the
   *  programmatic patches that seed a form leave it false). Re-evaluated on every value change; stays
   *  true until the owner resets the control (Save/Discard rebuild or `markAsPristine`). */
  protected readonly isModified = computed(() => {
    this.liveValue();
    return this.control().dirty;
  });

  protected readonly isReviewValueEmpty = computed(() => this.reviewValue() === '—');

  /** Non-null only for a field carrying `splitDisplay` — the parts it renders as separate boxes
   *  instead of the type-based `@switch` in the template. */
  protected readonly splitParts = computed(() => {
    const split = this.config().splitDisplay;
    if (!split) return null;
    const value = this.liveValue();
    return split(typeof value === 'string' ? value : '');
  });

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
