/** Schema vocabulary for the wwell-planning dynamic form engine. Add a field = edit a schema array, not a template. */

import type { Signal } from '@angular/core';

export type WwellFieldControlType = 'text' | 'number' | 'textarea' | 'select' | 'combo' | 'toggle-group' | 'file';

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
 * matches this condition. Exactly one of `equals` | `oneOf` | `notOneOf` should be set:
 *  - `equals`: sibling value === this value
 *  - `oneOf`: sibling value is one of this set (e.g. a client tier)
 *  - `notOneOf`: sibling value is absent from this set — the fallback for values outside every
 *    named tier (e.g. a client not yet assigned to a tier keeps the default field set)
 */
export interface WwellFieldVisibilityCondition {
  readonly field: string;
  readonly equals?: string;
  readonly oneOf?: readonly string[];
  readonly notOneOf?: readonly string[];
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
}

export interface WwellRepeatableRowConfig {
  readonly key: string;
  readonly addLabel: string;
  readonly rowFields: readonly WwellFieldConfig[];
  /** How many empty rows to seed the array with on load. */
  readonly minRows?: number;
  /** If set, the array itself is invalid until it holds at least this many rows — an empty array is not "complete" just because it has no invalid children. */
  readonly minRequiredRows?: number;
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
