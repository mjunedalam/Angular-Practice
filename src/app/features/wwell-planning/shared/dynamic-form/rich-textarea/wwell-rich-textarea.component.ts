import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnDestroy, computed, input, signal, viewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { Subscription } from 'rxjs';
import {
  WwellFieldConfig,
  WwellFieldOption,
  resolveFieldOptions,
  wwellFieldOptionLabel,
  wwellFieldOptionValue,
} from '../wwell-dynamic-form.types';

/**
 * "Dropdown + big textarea" control for the IR Program Details remarks fields (Acidization,
 * Transmission, Logging, Mud Logging, Sampling, Flow Test, Development/Testing) — several of
 * these carry long, multi-line legacy remarks (see wwell-ir-legacy-html.util.ts), too much for the
 * single-line `combo` autocomplete input the rest of the dynamic-form engine uses.
 *
 * The dropdown is a checkbox list, not a single-pick select: any number of the field's canned
 * options can be checked at once, and each checked option becomes its own line in the box below
 * (see `toggleOption`) — unchecking one removes exactly that line. A box line that doesn't match
 * any option's label (free-typed text) is left alone either way. Checked state is derived live
 * from the box's own content (`checkedLabels`), not tracked separately, so typing a line that
 * happens to match an option's label also shows it checked, and deleting that line unchecks it.
 *
 * The `FormControl<string>` this binds to always holds plain text with real `\n` line breaks —
 * never markup. Deliberately no rich-formatting toolbar (bold/italic/font-size were all tried and
 * dropped) — the IR "no HTML in storage" fix (wwell-ir-legacy-html.util.ts) intentionally keeps
 * these columns plain-text-only, so there was never anything for formatting to actually persist.
 *
 * Not a `ControlValueAccessor` — `DynamicFieldComponent` (this control's only caller) already
 * hands every field its own live `FormControl` instance directly rather than binding through
 * `formControlName`/`[formControl]`, so this only needs to read/write that instance's `.value`
 * and listen to its `valueChanges`, not implement the full CVA contract.
 */
@Component({
  selector: 'app-wwell-rich-textarea',
  standalone: true,
  imports: [MatIconModule, MatMenuModule, MatCheckboxModule],
  templateUrl: './wwell-rich-textarea.component.html',
  styleUrl: './wwell-rich-textarea.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellRichTextareaComponent implements AfterViewInit, OnDestroy {
  readonly config = input.required<WwellFieldConfig>();
  readonly control = input.required<FormControl>();
  /** Class applied to the options dropdown's portaled mat-menu panel, so a host page can theme it — mirrors DynamicFieldComponent's own `selectPanelClass`. */
  readonly selectPanelClass = input('');

  protected readonly optionLabel = wwellFieldOptionLabel;
  protected readonly optionValue = wwellFieldOptionValue;
  protected readonly resolvedOptions = computed(() => resolveFieldOptions(this.config()));
  protected readonly hasOptions = computed(() => this.resolvedOptions().length > 0);

  private readonly boxRef = viewChild<ElementRef<HTMLDivElement>>('box');
  private valueChangesSubscription?: Subscription;
  /** Set immediately before this component pushes its own edit into the control, so the
   *  `valueChanges` echo that causes doesn't get rebuilt back into the DOM — rebuilding on every
   *  keystroke would reset the caret to the start of the box on every character typed. */
  private isOwnEdit = false;

  /** Mirrors the control's current plain-text value as a signal purely so `checkedLabels` (and
   *  therefore each checkbox's checked state) stays reactive — kept in sync on every value change
   *  regardless of source (typed, or a checkbox toggle), unlike `isOwnEdit` which only gates
   *  whether the DOM box itself needs rebuilding. */
  private readonly boxText = signal('');
  private readonly checkedLabels = computed(() => new Set(this.linesOf(this.boxText())));
  /** Backs the remove-icon column — one button per current line, same order, always derived from
   *  `boxText` so it (and the checkboxes above, via `checkedLabels`) never drift out of sync with
   *  whatever the box actually contains, regardless of whether a line arrived by checking an
   *  option, typing directly, or a previous remove-icon click. */
  protected readonly currentLines = computed(() => this.linesOf(this.boxText()));

  ngAfterViewInit(): void {
    // Normalizes Enter-key behavior across browsers to one `<div>` per line (Chrome/Edge already
    // default to this; Firefox defaults to `<br>`-separated lines within a single block instead)
    // — renderIntoBox/extractPlainText below both assume "one line == one `<div>`".
    document.execCommand('defaultParagraphSeparator', false, 'div');
    const initial = this.control().value ?? '';
    this.boxText.set(initial);
    this.renderIntoBox(initial);
    this.valueChangesSubscription = this.control().valueChanges.subscribe((value: string) => {
      this.boxText.set(value ?? '');
      if (this.isOwnEdit) {
        this.isOwnEdit = false;
        return;
      }
      this.renderIntoBox(value ?? '');
    });
  }

  ngOnDestroy(): void {
    this.valueChangesSubscription?.unsubscribe();
  }

  /** A dropdown checkbox flipping on appends that option's label as a new line (unless it's
   *  already present); flipping off removes exactly that line. Multiple options can be checked at
   *  once — each becomes its own line, always appended, never inserted mid-text. */
  protected toggleOption(option: string | WwellFieldOption, event: MatCheckboxChange): void {
    const label = this.optionLabel(option);
    const lines = this.linesOf(this.extractPlainText());
    const nextLines = event.checked
      ? (lines.includes(label) ? lines : [...lines, label])
      : lines.filter(line => line !== label);
    this.renderIntoBox(nextLines.join('\n'));
    this.commitFromBox();
  }

  protected isOptionChecked(option: string | WwellFieldOption): boolean {
    return this.checkedLabels().has(this.optionLabel(option));
  }

  /** The remove-icon column's click handler — drops one line by position (not by text, so two
   *  identical lines can be removed independently) and commits, which flows straight back through
   *  `boxText`/`checkedLabels` and unchecks that option's checkbox if the removed line matched one. */
  protected removeLine(index: number): void {
    const lines = this.linesOf(this.boxText());
    lines.splice(index, 1);
    this.renderIntoBox(lines.join('\n'));
    this.commitFromBox();
  }

  protected onBoxInput(): void {
    this.commitFromBox();
  }

  private commitFromBox(): void {
    const text = this.extractPlainText();
    this.isOwnEdit = true;
    this.boxText.set(text);
    this.control().setValue(text);
    this.control().markAsTouched();
  }

  /** Deliberately does NOT drop blank lines — `currentLines()` (backing the remove-icon column)
   *  needs to stay index-aligned 1:1 with `renderIntoBox`'s one-`<div>`-per-line output, blank
   *  lines included, or a blank line in the middle would leave the icon column one short and every
   *  icon after it would line up with the wrong row. A genuinely empty box still yields `[]` here
   *  (the `text ? ... : []` guard), which is what keeps the icon column hidden when there's really
   *  nothing in the box — see the template's `@if (currentLines().length > 0)`. */
  private linesOf(text: string): string[] {
    return text ? text.split('\n') : [];
  }

  /** `innerText` (not `textContent`) — reflects the box's actual rendered lines as `\n`-joined
   *  text, matching how `renderIntoBox` below wrote them in (one `<div>` per line). */
  private extractPlainText(): string {
    const text = this.boxRef()?.nativeElement.innerText ?? '';
    return text.replace(/\n+$/, '');
  }

  /** Rebuilds the box's content from plain text — one `<div>` per line, an empty line rendered as
   *  `<div><br></div>` so it keeps its line height (a truly empty `<div>` collapses to zero height
   *  in most browsers). Leaves the box with no children at all for an empty value, so the
   *  `:empty::before` placeholder in the stylesheet actually shows. */
  private renderIntoBox(text: string): void {
    const box = this.boxRef()?.nativeElement;
    if (!box) return;
    box.textContent = '';
    if (!text) return;

    text.split('\n').forEach(line => {
      const row = document.createElement('div');
      if (line) row.textContent = line;
      else row.appendChild(document.createElement('br'));
      box.appendChild(row);
    });
  }
}
