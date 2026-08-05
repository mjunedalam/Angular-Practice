import { WwellPlanningPriority } from '@models/wwell-planning/wwell-planning.model';
import { WwellFormSectionConfig } from '../../shared/dynamic-form/wwell-dynamic-form.types';
import { WWELL_APPROVAL_COORDINATES_PATTERN, WWELL_APPROVAL_WELL_NAME_PATTERN } from '../../shared/wwell-approvals/wwell-approvals.config';
import {
  WWELL_AQUIFER_OPTIONS,
  WWELL_ASSIGNEE_OPTIONS,
  WWELL_CLIENT_OPTIONS,
  WWELL_CLIENT_TIER_2,
  WWELL_DEPTH_PATTERN,
  WWELL_SUPPORTING_BUSINESS_OPTIONS,
} from '../../shared/wwell-planning-reference-data.config';

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

/**
 * Single source of truth for the Request dialog's fields — add a field here, not in the template.
 *
 * Target Depth/Aquifer vs. Final Coordinates are mutually exclusive, gated by the selected
 * client's data tier (see WWELL_CLIENT_TIER_1 / WWELL_CLIENT_TIER_2). A hidden field still holds
 * its grid cell (collapsed to 0 height, not removed), so every tier-conditional field is grouped
 * after an even number of always-visible fields and sized to fill a full row on its own — that
 * way a collapsed field's row shrinks to nothing instead of leaving a gap next to a visible
 * sibling. Keep new conditional fields at the end of this array for the same reason.
 */
export const WWELL_REQUEST_FORM_SECTION: WwellFormSectionConfig = {
  key: 'main',
  title: null,
  fields: [
    { key: 'client', label: 'Client', type: 'select', options: WWELL_CLIENT_OPTIONS, validators: { required: true } },
    {
      key: 'wellName',
      label: 'Water Well Name',
      type: 'text',
      placeholder: 'e.g., HAIL-500',
      validators: { required: true, pattern: WWELL_APPROVAL_WELL_NAME_PATTERN },
    },
    {
      key: 'initialCoordinates',
      label: 'Initial Coordinates',
      type: 'text',
      placeholder: 'e.g., 24.1751°N, 47.2951°E',
      validators: { required: true, pattern: WWELL_APPROVAL_COORDINATES_PATTERN },
    },
    {
      key: 'supportingBusiness',
      label: 'Supporting Business',
      type: 'select',
      options: WWELL_SUPPORTING_BUSINESS_OPTIONS,
      validators: { required: true },
    },
    { key: 'assignedTo', label: 'Assigned To', type: 'select', options: WWELL_ASSIGNEE_OPTIONS },
    { key: 'priority', label: 'Priority', type: 'select', options: WWELL_REQUEST_PRIORITY_OPTIONS },
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
    // Tier 2 — full-width so it never has to share a row with a neighbor while collapsed.
    {
      key: 'finalCoordinates',
      label: 'Final Coordinates',
      type: 'text',
      placeholder: 'e.g., 24.1765°N, 47.2960°E',
      hint: 'Confirmed after site survey',
      colSpan: 2,
      validators: { pattern: WWELL_APPROVAL_COORDINATES_PATTERN },
      visibleWhen: { field: 'client', oneOf: WWELL_CLIENT_TIER_2 },
    },
    {
      key: 'notes',
      label: 'Request Note',
      type: 'textarea',
      placeholder: 'Project background, timeline, special requirements...',
      colSpan: 2,
    },
  ],
};
