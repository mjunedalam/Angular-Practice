/** Schema vocabulary for the wwell-planning dynamic form engine. Add a field = edit a schema array, not a template. */

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

/** Field is only shown (and its control enabled) while a sibling control in the same section equals this value. */
export interface WwellFieldVisibilityCondition {
  readonly field: string;
  readonly equals: string;
}

export interface WwellFieldConfig {
  readonly key: string;
  readonly label: string;
  readonly type: WwellFieldControlType;
  readonly placeholder?: string;
  readonly hint?: string;
  readonly suffix?: string;
  /** Used by 'select' | 'combo' | 'toggle-group'. Plain strings are shown as their own label. */
  readonly options?: readonly (string | WwellFieldOption)[];
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
