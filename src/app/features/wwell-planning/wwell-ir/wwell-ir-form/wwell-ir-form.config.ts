export { WWELL_CLIENT_OPTIONS as WWELL_IR_CLIENT_OPTIONS } from '../../shared/wwell-planning-reference-data.config';
export { WWELL_COMPLETION_OPTIONS as WWELL_IR_COMPLETION_OPTIONS } from '../../shared/wwell-planning-reference-data.config';
export { WWELL_DRILLING_METHOD_OPTIONS as WWELL_IR_METHOD_OPTIONS } from '../../shared/wwell-planning-reference-data.config';
export { WWELL_FLUID_TYPE_OPTIONS as WWELL_IR_FLUID_TYPE_OPTIONS } from '../../shared/wwell-planning-reference-data.config';
export { WWELL_CEMENTING_OPTIONS as WWELL_IR_CEMENTING_OPTIONS } from '../../shared/wwell-planning-reference-data.config';

/** Matches a numeric bit size with an optional inch mark, e.g. "12.25" or 12.25"". */
export const WWELL_IR_BIT_SIZE_PATTERN = /^\d+(\.\d+)?"?$/;
