/** Reference data shared by 2+ of the wwell-planning sub-features (requests, approvals, IR). */

export const WWELL_CLIENT_OPTIONS: readonly string[] = ['BI-11', 'BI-12', 'BI-13', 'BI-14', 'BI-15'];

/**
 * Clients fall into two subsurface-data tiers that drive which fields the Request and WLDA forms
 * collect: Tier 1 clients supply target depth/aquifer at intake; Tier 2 clients don't (that data
 * comes later) but do supply an as-drilled final coordinate. A client outside both named tiers
 * (e.g. BI-15) falls back to the Tier 1 field set.
 */
export const WWELL_CLIENT_TIER_1: readonly string[] = ['BI-11', 'BI-12'];
export const WWELL_CLIENT_TIER_2: readonly string[] = ['BI-13', 'BI-14'];

export const WWELL_AQUIFER_OPTIONS: readonly string[] = [
  'Umm Er Radhuma',
  'Wasia',
  'Biyadh',
  'Dammam',
  'Neogene',
];

export const WWELL_BUSINESS_USE_OPTIONS: readonly string[] = [
  'Water Injection',
  'Water Supply',
  'Observation',
  'Disposal',
  'Appraisal',
];

export const WWELL_ASSIGNEE_OPTIONS: readonly string[] = [
  'Eng. A. Al-Mutairi',
  'Eng. S. Al-Dossari',
  'Eng. F. Al-Harbi',
  'Eng. M. Al-Qahtani',
];

/** Matches a numeric depth with an optional "m" unit, e.g. "180", "180m" or "180.5 m". */
export const WWELL_DEPTH_PATTERN = /^\d+(\.\d+)?\s?m?$/i;

export const WWELL_DRILLING_METHOD_OPTIONS: readonly string[] = [
  'Rotary',
  'Rotary + Cable Tool',
  'Cable Tool',
  'Air Rotary',
  'Mud Rotary',
];

export const WWELL_COMPLETION_OPTIONS: readonly string[] = [
  'Open Hole',
  'Screened',
  'Screened + Gravel Pack',
  'Liner + Perforated',
  'Cased & Perforated',
];

export const WWELL_FLUID_TYPE_OPTIONS: readonly string[] = ['Water-based', 'Polymer', 'Bentonite', 'Air/Foam'];

export const WWELL_CEMENTING_OPTIONS: readonly string[] = [
  'Class G',
  'Class G + Additives',
  'Class G + Silica Flour',
  'Class A',
];

export const WWELL_SUPPORTING_BUSINESS_OPTIONS: readonly string[] = [
  'Agriculture',
  'Municipal',
  'Industrial',
  'Environmental',
  'Research',
];

export const WWELL_CASING_TYPE_OPTIONS: readonly string[] = [
  'Conductor',
  'Surface',
  'Intermediate',
  'Production',
  'Liner',
];

export const WWELL_ACIDIZATION_OPTIONS: readonly string[] = ['HCl Acid Wash', 'Mud Acid', 'None'];

export const WWELL_TRANSMISSION_OPTIONS: readonly string[] = [
  'Gravity Flow',
  'Pumped Transmission',
  'Pipeline',
  'Tanker',
];

/** exad_gwd_ir_header.trns_type is VARCHAR2(10) — too short for these labels (up to 19 chars) —
 *  so the wire payload sends this short code instead of the full label. */
export const WWELL_TRANSMISSION_CODE_BY_LABEL: Readonly<Record<string, string>> = {
  'Gravity Flow': 'GF',
  'Pumped Transmission': 'PT',
  Pipeline: 'PL',
  Tanker: 'TK',
};

export const WWELL_LOGGING_OPTIONS: readonly string[] = ['Caliper', 'Gamma Ray', 'Resistivity', 'SP'];

export const WWELL_MUD_LOGGING_OPTIONS: readonly string[] = ['Full Mud Logging', 'Cuttings Sample Only', 'None'];

export const WWELL_SAMPLING_OPTIONS: readonly string[] = ['Bailer Sample', 'Pump Sample', 'Composite Sample'];

export const WWELL_DEVELOPMENT_FLOW_TEST_OPTIONS: readonly string[] = [
  'Step-Rate Test',
  'Constant-Rate Test',
  'Recovery Test',
];

export const WWELL_DEVELOPMENT_TESTING_OPTIONS: readonly string[] = [
  'Step Drawdown Test',
  'Constant Rate Test',
  'Recovery Test',
  'Aquifer Performance Test (APT)',
  'Slug Test',
  'Bailer Test',
  'Air Lift Development',
  'Surge Block Development',
];

export const WWELL_TEST_TYPE_OPTIONS: readonly { value: 'flow-test' | 'pump-test'; label: string; icon: string }[] = [
  { value: 'flow-test', label: 'Flow Test', icon: 'waves' },
  { value: 'pump-test', label: 'Pump Test', icon: 'engineering' },
];
