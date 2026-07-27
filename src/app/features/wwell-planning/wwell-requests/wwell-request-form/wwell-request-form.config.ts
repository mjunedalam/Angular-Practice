import { WwellPlanningPriority } from '@models/wwell-planning/wwell-planning.model';

export const WWELL_REQUEST_CLIENT_OPTIONS: readonly string[] = ['BI-11', 'BI-12', 'BI-13', 'BI-14', 'BI-15'];

export const WWELL_REQUEST_AQUIFER_OPTIONS: readonly string[] = [
  'Umm Er Radhuma',
  'Wasia',
  'Biyadh',
  'Dammam',
  'Neogene',
];

export const WWELL_REQUEST_BUSINESS_USE_OPTIONS: readonly string[] = [
  'Water Injection',
  'Water Supply',
  'Observation',
  'Disposal',
  'Appraisal',
];

export const WWELL_REQUEST_ASSIGNEE_OPTIONS: readonly string[] = [
  'Eng. A. Al-Mutairi',
  'Eng. S. Al-Dossari',
  'Eng. F. Al-Harbi',
  'Eng. M. Al-Qahtani',
];

export interface WwellRequestPriorityOption {
  readonly value: WwellPlanningPriority;
  readonly label: string;
}

export const WWELL_REQUEST_PRIORITY_OPTIONS: readonly WwellRequestPriorityOption[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export type WwellLatHemisphere = 'N' | 'S';
export type WwellLngHemisphere = 'E' | 'W';

export const WWELL_REQUEST_LAT_HEMISPHERES: readonly WwellLatHemisphere[] = ['N', 'S'];
export const WWELL_REQUEST_LNG_HEMISPHERES: readonly WwellLngHemisphere[] = ['E', 'W'];

/** Decimal degrees, 0–90 (sign is carried by the hemisphere select, not typed). */
export const WWELL_REQUEST_LAT_VALUE_PATTERN = /^(90(\.0+)?|[1-8]?\d(\.\d+)?)$/;

/** Decimal degrees, 0–180 (sign is carried by the hemisphere select, not typed). */
export const WWELL_REQUEST_LNG_VALUE_PATTERN = /^(180(\.0+)?|1[0-7]\d(\.\d+)?|[1-9]?\d(\.\d+)?)$/;

export interface WwellCoordinateParts {
  readonly latValue: string;
  readonly latHemi: WwellLatHemisphere;
  readonly lngValue: string;
  readonly lngHemi: WwellLngHemisphere;
}

const COORDINATE_PART_PATTERN = /^\s*(-?\d{1,3}(?:\.\d+)?)\s*°?\s*([NnSsEeWw]?)\s*$/;

function parseCoordinatePart<H extends string>(
  part: string,
  positiveHemi: H,
  negativeHemi: H,
): { value: string; hemi: H } | null {
  const match = COORDINATE_PART_PATTERN.exec(part);
  if (!match) return null;

  const numeric = Number(match[1]);
  if (Number.isNaN(numeric)) return null;

  const letter = match[2].toUpperCase();
  let hemi = numeric < 0 ? negativeHemi : positiveHemi;
  if (letter === negativeHemi || letter === positiveHemi) {
    hemi = letter as H;
  }

  return { value: `${Math.abs(numeric)}`, hemi };
}

/** Parses a free-form "24.1751°N, 47.2951°E" style string (as previously stored) into editable parts. */
export function parseWwellCoordinates(raw: string | null | undefined): WwellCoordinateParts {
  const fallback: WwellCoordinateParts = { latValue: '', latHemi: 'N', lngValue: '', lngHemi: 'E' };
  if (!raw) return fallback;

  const [rawLat, rawLng] = raw.split(',').map(part => part.trim());
  if (!rawLat || !rawLng) return fallback;

  const lat = parseCoordinatePart(rawLat, 'N', 'S');
  const lng = parseCoordinatePart(rawLng, 'E', 'W');
  if (!lat || !lng) return fallback;

  return { latValue: lat.value, latHemi: lat.hemi, lngValue: lng.value, lngHemi: lng.hemi };
}

/** Formats editable coordinate parts back into the "24.1751°N, 47.2951°E" style string the API expects. */
export function formatWwellCoordinates(parts: WwellCoordinateParts): string {
  const { latValue, latHemi, lngValue, lngHemi } = parts;
  if (!latValue || !lngValue) return '';
  return `${latValue}°${latHemi}, ${lngValue}°${lngHemi}`;
}

/** Matches a numeric depth with an optional "m" unit, e.g. "180", "180m" or "180.5 m". */
export const WWELL_REQUEST_DEPTH_PATTERN = /^\d+(\.\d+)?\s?m?$/i;

export const WWELL_REQUEST_MAX_ATTACHMENT_SIZE_BYTES = 25 * 1024 * 1024;

export const WWELL_REQUEST_ALLOWED_ATTACHMENT_EXTENSIONS: readonly string[] = [
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'jpg',
  'jpeg',
  'png',
];
