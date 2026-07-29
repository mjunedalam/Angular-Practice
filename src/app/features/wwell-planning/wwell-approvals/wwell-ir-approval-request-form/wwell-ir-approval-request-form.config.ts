export { WWELL_CLIENT_OPTIONS as WWELL_IR_APPROVAL_FORM_CLIENT_OPTIONS } from '../../shared/wwell-planning-reference-data.config';
export { WWELL_COMPLETION_OPTIONS as WWELL_IR_APPROVAL_FORM_COMPLETION_OPTIONS } from '../../shared/wwell-planning-reference-data.config';
export { WWELL_DRILLING_METHOD_OPTIONS as WWELL_IR_APPROVAL_FORM_METHOD_OPTIONS } from '../../shared/wwell-planning-reference-data.config';
export { WWELL_FLUID_TYPE_OPTIONS as WWELL_IR_APPROVAL_FORM_FLUID_TYPE_OPTIONS } from '../../shared/wwell-planning-reference-data.config';
export { WWELL_CEMENTING_OPTIONS as WWELL_IR_APPROVAL_FORM_CEMENTING_OPTIONS } from '../../shared/wwell-planning-reference-data.config';

export const WWELL_IR_APPROVAL_FORM_TOPS_OPTIONS: readonly string[] = [
  'Wasia-Biyadh',
  'Umm Er Radhuma',
  'Mirqat',
  'Wajid',
  'Dammam',
];

export const WWELL_IR_APPROVAL_FORM_BIT_SIZE_OPTIONS: readonly string[] = ['8.5"', '9.875"', '12.25"', '14.75"', '17.5"'];

/** Numeric estimated yield with a GPM unit, e.g. "350 GPM" or "350". */
export const WWELL_IR_APPROVAL_FORM_YIELD_PATTERN = /^\d+(\.\d+)?\s?(GPM)?$/i;

/** Numeric TDS reading with optional unit, e.g. "TDS 1,200 mg/L" or "1200". */
export const WWELL_IR_APPROVAL_FORM_TDS_PATTERN = /^(TDS\s?)?\d{1,3}(,\d{3})*(\.\d+)?\s?(mg\/L)?$/i;
