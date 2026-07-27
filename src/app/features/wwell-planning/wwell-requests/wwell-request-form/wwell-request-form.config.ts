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

/** Loosely matches "24.1751°N, 47.2951°E" style decimal-degree coordinate pairs. */
export const WWELL_REQUEST_COORDINATES_PATTERN =
  /^-?\d{1,3}(\.\d+)?\s*°?\s*[NnSs]?\s*,\s*-?\d{1,3}(\.\d+)?\s*°?\s*[EeWw]?$/;

/** Matches a numeric depth with an optional unit, e.g. "180m" or "180.5 m". */
export const WWELL_REQUEST_DEPTH_PATTERN = /^\d+(\.\d+)?\s?m$/i;

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
