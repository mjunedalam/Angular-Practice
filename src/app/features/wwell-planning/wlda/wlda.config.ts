import { WldaStatus } from '@models/wwell-planning/wlda.model';
import { WWELL_STATUS_COLORS, WwellStatusMeta, wwellStatusMeta } from '../shared/wwell-status.config';

export const WLDA_WELL_TYPES: readonly string[] = [
  'Drilling Water Supply',
  'Facility Water Supply',
  'Production',
  'Observation',
  'Monitoring',
  'Injection',
];

/** Zones offered in the picker; the column itself accepts any whole number 1–60 (see wlda.util.ts). */
export const WLDA_UTM_ZONES: readonly string[] = ['37', '38', '39', '40'];

export const WLDA_DIVISION = 'Groundwater Division';
export const WLDA_LETTER_TITLE = 'Well Location & Drilling Approval';

export const WLDA_STATUS_META: Record<WldaStatus, WwellStatusMeta> = {
  draft: wwellStatusMeta('Draft', WWELL_STATUS_COLORS.amber),
  created: wwellStatusMeta('Created', WWELL_STATUS_COLORS.blue),
  approved: wwellStatusMeta('Approved', WWELL_STATUS_COLORS.green),
};

export const WLDA_FORM_TITLE = 'WELL LOCATION & DRILLING APPROVAL';
export const WLDA_FORM_NUMBER = 'Aramco Form 6208(9/93)';
export const WLDA_TO_LINE =
  'Director, Exploration & Oil Drilling Engineering Department R-R-32-1, Floor 1, D Wing, Dhahran Heights Portable (Bldg. 9171) Dhahran';

/** Placeholders until the SAP workflow chain and the distribution list are wired in. */
export const WLDA_WORKFLOW_PLACEHOLDER = 'SAP approval workflow steps will appear here.';
export const WLDA_DISTRIBUTION_PLACEHOLDER = 'Distribution list to be provided.';
export const WLDA_WORKFLOW_COLUMNS: readonly string[] = ['Name', 'Title', 'Status', 'Approved Date'];
