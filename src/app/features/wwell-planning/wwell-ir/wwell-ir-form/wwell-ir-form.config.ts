export { WWELL_REQUEST_CLIENT_OPTIONS as WWELL_IR_CLIENT_OPTIONS } from '../../wwell-requests/wwell-request-form/wwell-request-form.config';

export const WWELL_IR_COMPLETION_OPTIONS: readonly string[] = [
  'Open Hole',
  'Screened',
  'Screened + Gravel Pack',
  'Liner + Perforated',
  'Cased & Perforated',
];

export const WWELL_IR_METHOD_OPTIONS: readonly string[] = [
  'Rotary',
  'Rotary + Cable Tool',
  'Cable Tool',
  'Air Rotary',
  'Mud Rotary',
];

export const WWELL_IR_FLUID_TYPE_OPTIONS: readonly string[] = ['Water-based', 'Polymer', 'Bentonite', 'Air/Foam'];

export const WWELL_IR_CEMENTING_OPTIONS: readonly string[] = [
  'Class G',
  'Class G + Additives',
  'Class G + Silica Flour',
  'Class A',
];

/** Matches a numeric bit size with an optional inch mark, e.g. "12.25" or 12.25"". */
export const WWELL_IR_BIT_SIZE_PATTERN = /^\d+(\.\d+)?"?$/;
