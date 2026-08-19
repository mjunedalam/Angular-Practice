import { WwellFieldOption } from '../shared/dynamic-form/wwell-dynamic-form.types';

/** Offline fallback for GET /wells/eligible-for-ir — used when the endpoint is unreachable or
 *  returns an empty (unseeded) list, same reasoning as WWELL_IR_MOCK. `value` mirrors prewap_seq
 *  as a string (form control values are strings for 'select' fields). */
export const WWELL_IR_ELIGIBLE_WELLS_MOCK: readonly WwellFieldOption[] = [
  { value: '5001', label: 'HAIL-601' },
  { value: '5002', label: 'HAIL-602' },
  { value: '5003', label: 'HAIL-610' },
  { value: '5004', label: 'HAIL-615' },
];
