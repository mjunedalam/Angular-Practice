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
  WWELL_DEVELOPMENT_TESTING_OPTIONS,
  WWELL_LOGGING_OPTIONS,
  WWELL_MUD_LOGGING_OPTIONS,
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
          // Required: it maps to exad_gwd_ir_header.prewap_seq, which is NOT NULL in production
          // (docs/ir/EXAD_GWD_IR_HEADER.md) — without this the save fails at the database with
          // ORA-01400 instead of telling the user which field is missing.
          {
            key: 'linkedRequestId',
            label: 'Link to Request',
            type: 'select',
            options: [],
            validators: { required: true },
            searchable: true,
          },
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
            // Odd field out in this section's otherwise-even count — colSpan:2 keeps it from
            // landing alone in a row with a dangling empty cell beside it (also just genuinely
            // useful room for a lat/long string).
            key: 'coordinates',
            label: 'Coordinates',
            type: 'text',
            placeholder: 'e.g., 27.5114°N, 41.7208°E',
            validators: { required: true, pattern: WWELL_APPROVAL_COORDINATES_PATTERN },
            colSpan: 2,
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
          ],
        },
      },
      {
        // One remarks field for the whole Horizons section (maps to the single
        // exad_gwd_ir_header.tops_remarks column) rather than one per formation-top row — mirrors
        // the Offset Wells / Area Water Wells 'remarks' section below.
        key: 'remarks',
        title: null,
        fields: [
          {
            key: 'topsRemarks',
            label: 'Formation Tops Remarks (applies to all)',
            type: 'textarea',
            placeholder: 'General notes about formation tops...',
            colSpan: 2,
          },
        ],
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
            {
              // colSpan:2 — same "don't orphan the trailing free-text field" fix as
              // Formation Tops' Remarks above.
              key: 'remarks',
              label: 'Remarks',
              type: 'text',
              placeholder: 'e.g., Cemented',
              colSpan: 2,
            },
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
        // One combined section — Program Details (completion/acidization/transmission) and
        // Development & Testing (logging/mudLogging/sampling/flowTest/remarks) used to be two
        // separately edited/saved sections; merged into one so they read as a single block
        // (matching the reference GWD/AGWA screen) instead of two stacked cards.
        //
        // Every field here is full-width (`colSpan: 2`), stacked one per row — a 2-column grid
        // made sense for the old single-line combo inputs, but these are big resizable textareas
        // now (see WwellRichTextareaComponent) that can legitimately hold several lines each;
        // sitting two per row would either cramp them or waste half the row's height. Plain
        // top-to-bottom order, not interleaved — there's no column pairing left to preserve.
        key: 'main',
        title: null,
        fields: [
          // Same control as its siblings below (dropdown-checkbox + big textarea) rather than a
          // strict `select`, per explicit request for visual/behavioral consistency across the
          // whole section. `openHoleSizeIn`'s `visibleWhen` and the wellbore diagram's completion
          // switch (wwell-ir-wellbore-diagram.mapper.ts) both still match on an EXACT string equal
          // to one of WWELL_COMPLETION_OPTIONS — that holds as long as exactly one option is
          // checked (the expected case), but checking more than one now produces a multi-line
          // value that matches none of them, same trade-off every other field here already accepts.
          {
            key: 'completion',
            label: 'Completion',
            type: 'rich-textarea',
            options: WWELL_COMPLETION_OPTIONS,
            validators: { required: true },
            colSpan: 2,
          },
          {
            key: 'openHoleSizeIn',
            label: 'Open Hole Size',
            type: 'text',
            placeholder: 'e.g., 8 1/2"',
            hint: 'Bit size below the last casing shoe',
            visibleWhen: { field: 'completion', equals: 'Open Hole' },
            colSpan: 2,
          },
          { key: 'acidization', label: 'Acidization', type: 'rich-textarea', options: WWELL_ACIDIZATION_OPTIONS, colSpan: 2 },
          { key: 'transmission', label: 'Transmission', type: 'rich-textarea', options: WWELL_TRANSMISSION_OPTIONS, colSpan: 2 },
          { key: 'logging', label: 'Logging', type: 'rich-textarea', options: WWELL_LOGGING_OPTIONS, colSpan: 2 },
          { key: 'mudLogging', label: 'Mud Logging', type: 'rich-textarea', options: WWELL_MUD_LOGGING_OPTIONS, colSpan: 2 },
          { key: 'sampling', label: 'Sampling', type: 'rich-textarea', options: WWELL_SAMPLING_OPTIONS, colSpan: 2 },
          { key: 'flowTest', label: 'Flow Test', type: 'rich-textarea', options: WWELL_DEVELOPMENT_FLOW_TEST_OPTIONS, colSpan: 2 },
          {
            key: 'remarks',
            label: 'Development/Testing',
            type: 'rich-textarea',
            options: WWELL_DEVELOPMENT_TESTING_OPTIONS,
            colSpan: 2,
          },
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
          // Static [] placeholder — buildWwellIrFormSchema() below swaps this for a live Signal
          // (backed by GET /planning/api/v1/gwd-ops-members) before this schema is rendered.
          {
            key: 'geologistPrimary',
            label: 'Primary',
            type: 'select',
            options: [],
            validators: { required: true },
            searchable: true,
          },
          { key: 'geologistSecondary', label: 'Secondary', type: 'select', options: [], searchable: true },
        ],
      },
      {
        key: 'offsetWells',
        title: 'Offset Water Wells',
        repeatable: {
          key: 'offsetWells',
          addLabel: '+ Add Offset Well',
          rowFields: [
            { key: 'epANum', label: 'EP A Num', type: 'number', placeholder: 'e.g., 200', validators: { required: true } },
            { key: 'distanceKm', label: 'Distance (km)', type: 'number', placeholder: 'e.g., 2.5' },
            { key: 'location', label: 'Location', type: 'text', placeholder: 'e.g., N 2.5 km' },
            // exad_gwd_ir_water.aquifer is NOT NULL (docs/ir/p2-ir.md), same reasoning as linkedRequestId above.
            { key: 'aquifer', label: 'Aquifer', type: 'text', placeholder: 'e.g., Wasia-Biyadh', validators: { required: true } },
            { key: 'totalDepthFt', label: 'TD (ft bgl)', type: 'number', placeholder: 'e.g., 530' },
            { key: 'testDurationMin', label: 'Test Dur. (min)', type: 'number', placeholder: 'e.g., 1440' },
            { key: 'rateGpm', label: 'Test Rate (GPM)', type: 'number', placeholder: 'e.g., 380' },
            { key: 'rpm', label: 'RPM', type: 'number', placeholder: 'e.g., 1200' },
            { key: 'swlFt', label: 'SWL (ft bgl)', type: 'number', placeholder: 'e.g., 85' },
            { key: 'pwlFt', label: 'PWL (ft bgl)', type: 'number', placeholder: 'e.g., 110' },
            {
              key: 'drawdownFt',
              label: 'Drawdown (ft)',
              type: 'number',
              placeholder: 'auto',
              hint: 'Calculated from PWL − SWL',
              readonly: true,
            },
            {
              key: 'specificCapacity',
              label: 'Spec. Cap. (GPM/ft)',
              type: 'number',
              placeholder: 'auto',
              hint: 'Calculated from Rate ÷ Drawdown',
              readonly: true,
            },
            { key: 'tdsPpm', label: 'TDS (ppm)', type: 'number', placeholder: 'e.g., 1200' },
            { key: 'h2sPpm', label: 'H2S (ppm)', type: 'number', placeholder: 'e.g., 5' },
          ],
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
    // Split into two single-field sections (rather than one 'files' section holding both) so each
    // becomes its own scrollable IR SECTIONS nav target (7.0 Location Map / 8.0 Initiation
    // Request) — see wwell-ir-section-rail.config.ts.
    key: 'attachments',
    label: 'Attachments & Review',
    sections: [
      {
        key: 'locationMap',
        title: 'Location Map',
        fields: [{ key: 'file', label: 'Location Map', type: 'file', placeholder: 'Click to attach file...' }],
      },
      {
        key: 'initiationRequest',
        title: 'Initiation Request',
        fields: [
          {
            key: 'file',
            label: 'Initiation Request',
            type: 'file',
            placeholder: 'Click to attach file...',
            validators: { required: true },
          },
        ],
      },
    ],
  },
];

/**
 * Returns a copy of WWELL_IR_FORM_SCHEMA with the 'reference'/'main' section's 'linkedRequestId'
 * field wired to `linkedRequestOptions`, and the 'contacts'/'geologist' section's
 * 'geologistPrimary'/'geologistSecondary' fields wired to `geologistOptions` — each replacing its
 * static `[]` placeholder. The schema array itself is a module-level constant (no injector
 * available at definition time), so a store-backed Signal can only be attached here, once, by the
 * component that actually has one — see WwellIrEditorComponent's `schema` field.
 */
export function buildWwellIrFormSchema(
  linkedRequestOptions: Signal<readonly WwellFieldOption[]>,
  geologistOptions: Signal<readonly string[]>,
): readonly WwellFormStepConfig[] {
  return WWELL_IR_FORM_SCHEMA.map(step => {
    if (step.key === 'reference') {
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
    }
    if (step.key === 'contacts') {
      return {
        ...step,
        sections: step.sections.map(section => {
          if (section.key !== 'geologist' || !section.fields) return section;
          return {
            ...section,
            fields: section.fields.map(field =>
              field.key === 'geologistPrimary' || field.key === 'geologistSecondary' ? { ...field, options: geologistOptions } : field,
            ),
          };
        }),
      };
    }
    return step;
  });
}
