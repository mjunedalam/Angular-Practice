import { WldaFormValue, WldaStatus, WldaWellType } from '@models/wwell-planning/wlda.model';
import { WWELL_STATUS_COLORS, WwellStatusMeta, wwellStatusMeta } from '../shared/wwell-status.config';

export const WLDA_WELL_TYPES: readonly WldaWellType[] = ['Production', 'Observation', 'Monitoring', 'Injection'];

export const WLDA_UTM_ZONES: readonly string[] = ['37', '38', '39', '40'];

export const WLDA_DEFAULT_ZONE = '39';

export const WLDA_DIVISION = 'Groundwater Division';
export const WLDA_LETTER_TITLE = 'Well Location & Drilling Approval';

export const WLDA_STATUS_META: Record<WldaStatus, WwellStatusMeta> = {
  draft: wwellStatusMeta('Draft', WWELL_STATUS_COLORS.amber),
  submitted: wwellStatusMeta('Submitted', WWELL_STATUS_COLORS.blue),
  approved: wwellStatusMeta('Approved', WWELL_STATUS_COLORS.green),
};

export const WLDA_EMPTY_FORM: WldaFormValue = {
  waterWellName: '',
  field: '',
  wellNumber: '',
  reservoir: '',
  wellType: '',
  totalDepth: '',
  cathodicProtection: false,
  north: '',
  east: '',
  zone: WLDA_DEFAULT_ZONE,
  remarks: '',
  distribution: '',
  attachments: [],
};

/** Required by the form — Save/Create stays blocked until each is filled. */
export const WLDA_REQUIRED_FIELDS: readonly (keyof WldaFormValue)[] = [
  'waterWellName',
  'field',
  'wellNumber',
  'reservoir',
  'totalDepth',
  'north',
  'east',
];
