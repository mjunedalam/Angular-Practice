import type { Signal } from '@angular/core';
import { WwellFieldOption, WwellFormStepConfig } from '../../shared/dynamic-form/wwell-dynamic-form.types';
import {
  WWELL_APPROVAL_COORDINATES_PATTERN,
  WWELL_APPROVAL_WELL_NAME_PATTERN,
} from '../../shared/wwell-approvals/wwell-approvals.config';
import {
  WWELL_ACIDIZATION_OPTIONS,
  WWELL_CASING_TYPE_OPTIONS,
  WWELL_CLIENT_OPTIONS,
  WWELL_COMPLETION_OPTIONS,
  WWELL_DEVELOPMENT_FLOW_TEST_OPTIONS,
  WWELL_GEOLOGIST_OPTIONS,
  WWELL_LOGGING_OPTIONS,
  WWELL_MUD_LOGGING_OPTIONS,
  WWELL_OFFSET_WELL_OPTIONS,
  WWELL_SAMPLING_OPTIONS,
  WWELL_SUPPORTING_BUSINESS_OPTIONS,
  WWELL_TEST_TYPE_OPTIONS,
  WWELL_TRANSMISSION_OPTIONS,
} from '../../shared/wwell-planning-reference-data.config';
import { WWELL_IR_FORMATION_OPTIONS } from './wwell-ir-form.config';

/** Single source of truth for the IR stepper — add a field here, not in a template. */
export const WWELL_IR_FORM_SCHEMA: readonly WwellFormStepConfig[] = [
  {
    key: 'reference',
    label: 'Request Reference',
    sections: [
      {
        key: 'main',
        title: null,
        fields: [
          // Static [] placeholder — buildWwellIrFormSchema() below swaps this for a live Signal
          // (backed by GET /planning/api/v1/wells/eligible-for-ir) before this schema is rendered.
          { key: 'linkedRequestId', label: 'Link to Request', type: 'select', options: [] },
          { key: 'letterNumber', label: 'Letter Number', type: 'text', placeholder: 'e.g., LTR-2026-0456' },
          { key: 'client', label: 'BI Number', type: 'select', options: WWELL_CLIENT_OPTIONS, validators: { required: true } },
          {
            key: 'supportingBusiness',
            label: 'Supporting Business',
            type: 'select',
            options: WWELL_SUPPORTING_BUSINESS_OPTIONS,
            validators: { required: true },
          },
          {
            key: 'wellName',
            label: 'Water Well Name',
            type: 'text',
            placeholder: 'e.g., HAIL-500',
            validators: { required: true, pattern: WWELL_APPROVAL_WELL_NAME_PATTERN },
          },
          {
            key: 'targetAquifer',
            label: 'Target Aquifer',
            type: 'select',
            options: WWELL_IR_FORMATION_OPTIONS,
            validators: { required: true },
          },
          {
            key: 'targetDepthFt',
            label: 'Target Depth',
            type: 'number',
            suffix: 'ft',
            validators: { required: true, min: 0 },
          },
          {
            key: 'surfaceElevationFtAsl',
            label: 'Surface Elevation',
            type: 'number',
            suffix: 'ft ASL',
            hint: 'Used for auto-calculating sub-sea depths',
          },
          {
            key: 'coordinates',
            label: 'Coordinates',
            type: 'text',
            placeholder: 'e.g., 27.5114°N, 41.7208°E',
            validators: { required: true, pattern: WWELL_APPROVAL_COORDINATES_PATTERN },
          },
        ],
      },
    ],
  },
  {
    key: 'subsurface',
    label: 'Subsurface & Construction',
    sections: [
      {
        key: 'formationTops',
        title: 'Formation Tops',
        repeatable: {
          key: 'formationTops',
          addLabel: '+ Add Formation Top',
          minRequiredRows: 1,
          rowFields: [
            { key: 'name', label: 'Formation', type: 'select', options: WWELL_IR_FORMATION_OPTIONS },
            { key: 'depthFt', label: 'Depth', type: 'number', suffix: 'ft' },
            { key: 'subSeaFtAsl', label: 'Sub-sea', type: 'number', suffix: 'ft ASL' },
            { key: 'description', label: 'Description', type: 'text', placeholder: 'e.g., Top of Umm Er Radhuma' },
          ],
        },
      },
      {
        key: 'casing',
        title: 'Casing',
        repeatable: {
          key: 'casing',
          addLabel: '+ Add Casing',
          minRequiredRows: 1,
          rowFields: [
            {
              key: 'type',
              label: 'Type',
              type: 'select',
              options: WWELL_CASING_TYPE_OPTIONS,
              placeholder: 'e.g., Conductor',
            },
            { key: 'sizeIn', label: 'Size', type: 'text', placeholder: 'e.g., 20"' },
            { key: 'depthFtBgl', label: 'Depth', type: 'number', suffix: 'ft bgl' },
            {
              key: 'tolFtBgl',
              label: 'Top Of Liner (TOL)',
              type: 'number',
              suffix: 'ft bgl',
              hint: 'Depth this liner hangs from',
              visibleWhen: { field: 'type', equals: 'Liner' },
            },
            { key: 'remarks', label: 'Remarks', type: 'text', placeholder: 'e.g., Cemented' },
          ],
        },
      },
    ],
  },
  {
    key: 'programDetails',
    label: 'Program Details',
    sections: [
      {
        key: 'main',
        title: null,
        fields: [
          {
            key: 'completion',
            label: 'Completion',
            type: 'select',
            options: WWELL_COMPLETION_OPTIONS,
            validators: { required: true },
          },
          {
            key: 'openHoleSizeIn',
            label: 'Open Hole Size',
            type: 'text',
            placeholder: 'e.g., 8 1/2"',
            hint: 'Bit size below the last casing shoe',
            visibleWhen: { field: 'completion', equals: 'Open Hole' },
          },
          { key: 'acidization', label: 'Acidization', type: 'combo', options: WWELL_ACIDIZATION_OPTIONS },
          { key: 'transmission', label: 'Transmission', type: 'combo', options: WWELL_TRANSMISSION_OPTIONS },
        ],
      },
      {
        key: 'developmentTesting',
        title: 'Development / Testing',
        fields: [
          { key: 'logging', label: 'Logging', type: 'combo', options: WWELL_LOGGING_OPTIONS },
          { key: 'mudLogging', label: 'Mud Logging', type: 'combo', options: WWELL_MUD_LOGGING_OPTIONS },
          { key: 'sampling', label: 'Sampling', type: 'combo', options: WWELL_SAMPLING_OPTIONS },
          { key: 'flowTest', label: 'Flow Test', type: 'combo', options: WWELL_DEVELOPMENT_FLOW_TEST_OPTIONS },
        ],
      },
    ],
  },
  {
    key: 'contacts',
    label: 'Contacts & Offset Wells',
    sections: [
      {
        key: 'geologist',
        title: 'Geologist Contact',
        fields: [
          {
            key: 'geologistPrimary',
            label: 'Primary',
            type: 'select',
            options: WWELL_GEOLOGIST_OPTIONS,
            validators: { required: true },
          },
          { key: 'geologistSecondary', label: 'Secondary', type: 'select', options: WWELL_GEOLOGIST_OPTIONS },
        ],
      },
      {
        key: 'offsetWells',
        title: 'Offset Water Wells',
        repeatable: {
          key: 'offsetWells',
          addLabel: '+ Add Offset Well',
          rowFields: [{ key: 'wellName', label: 'Well', type: 'select', options: WWELL_OFFSET_WELL_OPTIONS }],
        },
      },
      {
        key: 'remarks',
        title: null,
        fields: [
          {
            key: 'offsetWellsRemarks',
            label: 'Offset Wells Remarks (applies to all)',
            type: 'textarea',
            placeholder: 'General notes about offset wells...',
            colSpan: 2,
          },
        ],
      },
    ],
  },
  {
    key: 'hydrogeology',
    label: 'Estimated Hydrology',
    sections: [
      {
        key: 'main',
        title: null,
        fields: [
          {
            key: 'testType',
            label: 'Test Type',
            type: 'toggle-group',
            options: WWELL_TEST_TYPE_OPTIONS,
            validators: { required: true },
            colSpan: 2,
            defaultValue: 'flow-test',
          },
          {
            key: 'aquifer',
            label: 'Aquifer',
            type: 'select',
            options: WWELL_IR_FORMATION_OPTIONS,
            validators: { required: true },
          },
          { key: 'estimatedTdsPpm', label: 'Estimated TDS', type: 'number', suffix: 'ppm' },
          { key: 'estimatedRateGpm', label: 'Estimated Rate', type: 'number', suffix: 'GPM' },
          { key: 'h2sPpm', label: 'H2S', type: 'number', suffix: 'ppm' },
          // Mode-specific fields are grouped last (after an even count of always-visible fields above)
          // so a collapsed field never shares a grid row with an unrelated visible one.
          {
            key: 'siwhpPsi',
            label: 'SIWHP',
            type: 'number',
            suffix: 'psi',
            colSpan: 2,
            visibleWhen: { field: 'testType', equals: 'flow-test' },
          },
          {
            key: 'estimatedWaterLevelFt',
            label: 'Estimated Water Level',
            type: 'number',
            suffix: 'ft',
            visibleWhen: { field: 'testType', equals: 'pump-test' },
          },
          {
            key: 'estimatedPumpDepthFt',
            label: 'Estimated Pump Depth',
            type: 'number',
            suffix: 'ft',
            visibleWhen: { field: 'testType', equals: 'pump-test' },
          },
        ],
      },
    ],
  },
  {
    key: 'attachments',
    label: 'Attachments & Review',
    sections: [
      {
        key: 'files',
        title: 'Required Attachments',
        fields: [
          { key: 'locationMap', label: 'Location Map', type: 'file', placeholder: 'Click to attach file...' },
          {
            key: 'initiationRequest',
            label: 'Initiation Request',
            type: 'file',
            placeholder: 'Click to attach file...',
            validators: { required: true },
          },
        ],
      },
    ],
  },
  {
    key: 'wellDesignView',
    label: 'Well Design View',
    sections: [], // pure visualization step — no form fields
  },
];

/**
 * Returns a copy of WWELL_IR_FORM_SCHEMA with the 'reference'/'main' section's 'linkedRequestId'
 * field wired to `linkedRequestOptions` instead of its static `[]` placeholder. The schema array
 * itself is a module-level constant (no injector available at definition time), so a store-backed
 * Signal can only be attached here, once, by the component that actually has one — see
 * WwellIrNewPageComponent's `schema` field.
 */
export function buildWwellIrFormSchema(
  linkedRequestOptions: Signal<readonly WwellFieldOption[]>,
): readonly WwellFormStepConfig[] {
  return WWELL_IR_FORM_SCHEMA.map(step => {
    if (step.key !== 'reference') return step;
    return {
      ...step,
      sections: step.sections.map(section => {
        if (section.key !== 'main' || !section.fields) return section;
        return {
          ...section,
          fields: section.fields.map(field =>
            field.key === 'linkedRequestId' ? { ...field, options: linkedRequestOptions } : field,
          ),
        };
      }),
    };
  });
}
