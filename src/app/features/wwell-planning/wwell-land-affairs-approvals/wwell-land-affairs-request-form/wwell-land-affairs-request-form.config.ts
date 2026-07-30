export { WWELL_CLIENT_OPTIONS as WWELL_LAND_AFFAIRS_FORM_CLIENT_OPTIONS } from '../../shared/wwell-planning-reference-data.config';

export const WWELL_LAND_AFFAIRS_FORM_UTM_ZONE_OPTIONS: readonly string[] = ['36N', '37N', '38N', '39N'];

export const WWELL_LAND_AFFAIRS_FORM_LAND_TYPE_OPTIONS: readonly string[] = [
  'Government',
  'GOSP-Owned',
  'Private',
  'Agricultural',
  'Vacant Land',
];

export const WWELL_LAND_AFFAIRS_FORM_SURVEYOR_OPTIONS: readonly string[] = [
  'S. Al-Ghamdi',
  'H. Al-Zahrani',
  'N. Al-Qahtani',
];

/** UTM northing/easting values, e.g. 680542.12 or 2712983.45. */
export const WWELL_LAND_AFFAIRS_FORM_COORDINATE_PATTERN = /^\d+(\.\d+)?$/;
