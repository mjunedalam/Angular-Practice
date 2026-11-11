import { WwellFieldOption } from '../../shared/dynamic-form/wwell-dynamic-form.types';

/** One selectable offset water well for the Area Water Wells "Select Offset Water Well" picker. Carries every Area
 *  Water Well column EXCEPT distance and location — those depend on where the new well sits, so the author enters them. */
export interface IrOffsetWellSource {
  readonly epANum: number;
  readonly name: string;
  readonly aquifer: string;
  readonly totalDepthFt: number;
  readonly testDurationMin: number;
  readonly rateGpm: number;
  readonly rpm: number;
  readonly swlFt: number;
  readonly pwlFt: number;
  readonly tdsPpm: number;
  readonly h2sPpm: number;
}

/** DUMMY DATA — the backend procedure that lists offset water wells is not ready yet. Replace this list (and
 *  `findIrOffsetWellSource`) with the real lookup when it is; the picker and the populate-on-select wiring in the
 *  editor only depend on the shape above. */
export const WWELL_IR_OFFSET_WELL_SOURCES: readonly IrOffsetWellSource[] = [
  { epANum: 805, name: 'HWTW-805', aquifer: 'Wasia-Biyadh', totalDepthFt: 2150, testDurationMin: 1440, rateGpm: 410, rpm: 1200, swlFt: 312, pwlFt: 365, tdsPpm: 1850, h2sPpm: 0 },
  { epANum: 809, name: 'HWTW-809', aquifer: 'Wasia-Biyadh', totalDepthFt: 2210, testDurationMin: 720, rateGpm: 0, rpm: 0, swlFt: 318, pwlFt: 318, tdsPpm: 0, h2sPpm: 0 },
  { epANum: 801, name: 'AMAR-801', aquifer: 'Umm Er Radhuma', totalDepthFt: 1480, testDurationMin: 1440, rateGpm: 385, rpm: 1180, swlFt: 142, pwlFt: 188, tdsPpm: 2400, h2sPpm: 5 },
  { epANum: 447, name: 'SHYB-447', aquifer: 'Dammam', totalDepthFt: 960, testDurationMin: 1080, rateGpm: 275, rpm: 1500, swlFt: 96, pwlFt: 131, tdsPpm: 3100, h2sPpm: 12 },
  { epANum: 1024, name: 'SHYB-1024', aquifer: 'Umm Er Radhuma', totalDepthFt: 1325, testDurationMin: 1440, rateGpm: 350, rpm: 1200, swlFt: 118, pwlFt: 160, tdsPpm: 2650, h2sPpm: 3 },
];

/** Options for the picker — the value is the well's EP A number. */
export const WWELL_IR_OFFSET_WELL_SOURCE_OPTIONS: readonly WwellFieldOption[] = WWELL_IR_OFFSET_WELL_SOURCES.map(well => ({
  value: String(well.epANum),
  label: well.name,
}));

export function findIrOffsetWellSource(value: string | null | undefined): IrOffsetWellSource | undefined {
  return value ? WWELL_IR_OFFSET_WELL_SOURCES.find(well => String(well.epANum) === value) : undefined;
}
