import { WwellFormSectionConfig } from '../../shared/dynamic-form/wwell-dynamic-form.types';
import { WWELL_APPROVAL_COORDINATES_PATTERN, WWELL_APPROVAL_WELL_NAME_PATTERN } from '../../shared/wwell-approvals/wwell-approvals.config';
import {
  WWELL_AQUIFER_OPTIONS,
  WWELL_ASSIGNEE_OPTIONS,
  WWELL_BUSINESS_USE_OPTIONS,
  WWELL_CLIENT_OPTIONS,
  WWELL_CLIENT_TIER_2,
  WWELL_DEPTH_PATTERN,
  WWELL_DRILLING_METHOD_OPTIONS,
} from '../../shared/wwell-planning-reference-data.config';

/**
 * Single source of truth for the WLDA dialog's fields — add a field here, not in the template.
 *
 * Target Depth/Aquifer are only collected for Tier 1 clients (see WWELL_CLIENT_TIER_1 /
 * WWELL_CLIENT_TIER_2) — every other field applies to both tiers. A hidden field still holds its
 * grid cell (collapsed to 0 height, not removed), so this pair sits right after an even number of
 * always-visible fields and stays adjacent — that way the pair either fills its row or the whole
 * row collapses to nothing, instead of leaving a gap next to a visible sibling.
 */
export const WWELL_WLDA_FORM_SECTION: WwellFormSectionConfig = {
  key: 'main',
  title: null,
  fields: [
    { key: 'client', label: 'Client', type: 'select', options: WWELL_CLIENT_OPTIONS, validators: { required: true } },
    {
      key: 'wellName',
      label: 'Water Well Name',
      type: 'text',
      placeholder: 'e.g., KHAJ-300',
      hint: '4 letters + dash + hundreds (ABCD-200)',
      validators: { required: true, pattern: WWELL_APPROVAL_WELL_NAME_PATTERN },
    },
    {
      key: 'supporting',
      label: 'Supporting',
      type: 'text',
      placeholder: 'e.g., Riyadh GOSP or well name',
      validators: { required: true },
    },
    {
      key: 'initialCoordinates',
      label: 'Initial Coordinates (Lat, Long)',
      type: 'text',
      placeholder: 'e.g., 24.1751°N, 47.2951°E',
      validators: { required: true, pattern: WWELL_APPROVAL_COORDINATES_PATTERN },
    },
    // Tier 1 pair — always toggle together, so they either fill this row or collapse it entirely.
    {
      key: 'proposedDepth',
      label: 'Target Depth',
      type: 'text',
      placeholder: 'e.g., 180m',
      validators: { required: true, pattern: WWELL_DEPTH_PATTERN },
      visibleWhen: { field: 'client', notOneOf: WWELL_CLIENT_TIER_2 },
    },
    {
      key: 'targetAquifer',
      label: 'Target Aquifer',
      type: 'select',
      options: WWELL_AQUIFER_OPTIONS,
      validators: { required: true },
      visibleWhen: { field: 'client', notOneOf: WWELL_CLIENT_TIER_2 },
    },
    {
      key: 'finalCoordinates',
      label: 'Final Coordinates (Lat, Long)',
      type: 'text',
      placeholder: 'e.g., 24.1765°N, 47.2960°E',
      hint: 'Confirmed after site survey',
      validators: { pattern: WWELL_APPROVAL_COORDINATES_PATTERN },
    },
    {
      key: 'businessUse',
      label: 'Business Use',
      type: 'select',
      options: WWELL_BUSINESS_USE_OPTIONS,
      validators: { required: true },
    },
    { key: 'drillingMethod', label: 'Drilling Method', type: 'select', options: WWELL_DRILLING_METHOD_OPTIONS },
    { key: 'assignedTo', label: 'Assigned To', type: 'select', options: WWELL_ASSIGNEE_OPTIONS },
    {
      key: 'notes',
      label: 'Additional Notes',
      type: 'textarea',
      placeholder: 'Any special requirements...',
      colSpan: 2,
    },
  ],
};
