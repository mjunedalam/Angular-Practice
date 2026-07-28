export { WWELL_REQUEST_CLIENT_OPTIONS as WWELL_IR_APPROVAL_FORM_CLIENT_OPTIONS } from '../../wwell-requests/wwell-request-form/wwell-request-form.config';
export { WWELL_IR_COMPLETION_OPTIONS as WWELL_IR_APPROVAL_FORM_COMPLETION_OPTIONS } from '../../wwell-ir/wwell-ir-form/wwell-ir-form.config';
export { WWELL_IR_METHOD_OPTIONS as WWELL_IR_APPROVAL_FORM_METHOD_OPTIONS } from '../../wwell-ir/wwell-ir-form/wwell-ir-form.config';
export { WWELL_IR_FLUID_TYPE_OPTIONS as WWELL_IR_APPROVAL_FORM_FLUID_TYPE_OPTIONS } from '../../wwell-ir/wwell-ir-form/wwell-ir-form.config';
export { WWELL_IR_CEMENTING_OPTIONS as WWELL_IR_APPROVAL_FORM_CEMENTING_OPTIONS } from '../../wwell-ir/wwell-ir-form/wwell-ir-form.config';

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
