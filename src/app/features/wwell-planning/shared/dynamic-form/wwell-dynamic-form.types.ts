/** Schema vocabulary for the wwell-planning dynamic form engine. Add a field = edit a schema array, not a template. */

import type { Signal } from '@angular/core';

export type WwellFieldControlType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'select'
  | 'combo'
  | 'rich-textarea'
  | 'toggle-group'
  | 'file';

export interface WwellFieldOption {
  readonly value: string;
  readonly label: string;
  /** Material icon ligature name — used by 'toggle-group' only. */
  readonly icon?: string;
}

export interface WwellFieldValidatorConfig {
  readonly required?: boolean;
  readonly pattern?: RegExp;
  readonly min?: number;
}

/**
 * Field is only shown (and its control enabled) while a sibling control in the same section
 * matches this condition. Exactly one of `equals` | `oneOf` | `notOneOf` | `includesLine` should
 * be set:
 *  - `equals`: sibling value === this value
 *  - `oneOf`: sibling value is one of this set (e.g. a client tier)
 *  - `notOneOf`: sibling value is absent from this set — the fallback for values outside every
 *    named tier (e.g. a client not yet assigned to a tier keeps the default field set)
 *  - `includesLine`: sibling value, split on `\n` and trimmed, includes this exact line — for a
 *    sibling that's a `type: 'rich-textarea'` checkbox list (see WwellRichTextareaComponent),
 *    whose committed value is every checked option newline-joined rather than a single picked
 *    value, so `equals` can only ever match when exactly one box is checked. `openHoleSizeIn`
 *    (wwell-ir-form.schema.ts) is the motivating case: gated on `completion` (a rich-textarea)
 *    having "Open Hole" checked, which must still hold when other options are checked alongside
 *    it — an `equals` gate there hid (and reset — see DynamicSectionComponent.syncControlEnabled)
 *    this field the instant a second option was checked, silently discarding whatever open hole
 *    size had been typed and leaving `resolveOhHalfWidth` (wellbore-depth.helpers.ts) with no real
 *    diameter to scale Open Hole against — it fell back to a fixed wide default, wider than an
 *    actual entered casing OD.
 */
export interface WwellFieldVisibilityCondition {
  readonly field: string;
  readonly equals?: string;
  readonly oneOf?: readonly string[];
  readonly notOneOf?: readonly string[];
  readonly includesLine?: string;
}

export interface WwellFieldConfig {
  readonly key: string;
  readonly label: string;
  readonly type: WwellFieldControlType;
  readonly placeholder?: string;
  readonly hint?: string;
  readonly suffix?: string;
  /** Used by 'select' | 'combo' | 'toggle-group'. Plain strings are shown as their own label.
   *  A Signal is resolved lazily via `resolveFieldOptions` — for options that come from a store
   *  (e.g. the IR wizard's "Link to Request" picker) rather than being known at schema-definition
   *  time (the schema array itself is a static, module-level constant with no injector). */
  readonly options?: readonly (string | WwellFieldOption)[] | Signal<readonly (string | WwellFieldOption)[]>;
  readonly validators?: WwellFieldValidatorConfig;
  readonly colSpan?: 1 | 2;
  readonly visibleWhen?: WwellFieldVisibilityCondition;
  /** Overrides the type-based empty default (e.g. pre-selecting a toggle-group option). */
  readonly defaultValue?: string | number;
  /** 'select' only — adds a filter input inside the option panel, narrowing `options` as the user
   *  types. For a picker backed by a long or live-fetched list (e.g. the IR wizard's "Link to
   *  Request", backed by every well eligible for IR initiation) where scrolling an unfiltered
   *  mat-select is impractical; the short, hand-picked lists most 'select' fields use don't need it. */
  readonly searchable?: boolean;
  /** Disables the control — for values derived elsewhere (e.g. a server-computed metric) rather
   *  than typed in directly. Pair with a `placeholder` like 'auto' to signal that visually. */
  readonly readonly?: boolean;
  /** Renders this field's single control value as several read-only labelled boxes side by side
   *  instead of one — e.g. a combined "lat, long" string split into a Latitude box and a
   *  Longitude box. Applies in both edit and review mode; the control itself is untouched (still
   *  one value, one key), this only changes how DynamicFieldComponent draws it. */
  readonly splitDisplay?: (value: string) => readonly { readonly label: string; readonly value: string }[];
}

export interface WwellRepeatableRowConfig {
  readonly key: string;
  readonly addLabel: string;
  readonly rowFields: readonly WwellFieldConfig[];
  /** How many empty rows to seed the array with on load. */
  readonly minRows?: number;
  /** If set, the array itself is invalid until it holds at least this many rows — an empty array is not "complete" just because it has no invalid children. */
  readonly minRequiredRows?: number;
  /** `false` hides `RepeatableGroupComponent`'s own "+ Add Row" button — for a caller that drives
   *  adding rows itself (e.g. a section-head "+" icon that appends a row on every click), so there's
   *  exactly one add affordance instead of two doing the same thing. Defaults to shown (`true`). */
  readonly showAddButton?: boolean;
}

export interface WwellFormSectionConfig {
  readonly key: string;
  readonly title: string | null;
  /** Mutually exclusive with `repeatable`. */
  readonly fields?: readonly WwellFieldConfig[];
  readonly repeatable?: WwellRepeatableRowConfig;
}

export interface WwellFormStepConfig {
  readonly key: string;
  readonly label: string;
  readonly sections: readonly WwellFormSectionConfig[];
}

export function wwellFieldOptionLabel(option: string | WwellFieldOption): string {
  return typeof option === 'string' ? option : option.label;
}

export function wwellFieldOptionValue(option: string | WwellFieldOption): string {
  return typeof option === 'string' ? option : option.value;
}

export function wwellFieldOptionIcon(option: string | WwellFieldOption): string | undefined {
  return typeof option === 'string' ? undefined : option.icon;
}

/** Unwraps a field's `options` (static array or live Signal) into the array consumers iterate. */
export function resolveFieldOptions(field: WwellFieldConfig): readonly (string | WwellFieldOption)[] {
  const options = field.options;
  if (!options) return [];
  return typeof options === 'function' ? options() : options;
}
