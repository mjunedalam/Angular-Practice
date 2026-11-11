import { computed, signal, type Signal } from '@angular/core';
import { WwellFieldConfig, WwellFieldOption, WwellFormStepConfig } from '../../shared/dynamic-form/wwell-dynamic-form.types';
import { WWELL_APPROVAL_WELL_NAME_PATTERN } from '../../shared/wwell-approvals/wwell-approvals.config';
import {
  WWELL_ACIDIZATION_OPTIONS,
  WWELL_COMPLETION_OPTIONS,
  WWELL_DEVELOPMENT_FLOW_TEST_OPTIONS,
  WWELL_DEVELOPMENT_TESTING_OPTIONS,
  WWELL_LOGGING_OPTIONS,
  WWELL_MUD_LOGGING_OPTIONS,
  WWELL_SAMPLING_OPTIONS,
  WWELL_TEST_TYPE_OPTIONS,
  WWELL_TRANSMISSION_OPTIONS,
} from '../../shared/wwell-planning-reference-data.config';
import { WWELL_COMPLETION_TYPE, WWELL_DEFAULT_LINER_SIZE, WWELL_LINER_COMPLETION_TYPES } from './wwell-ir-completion-type.config';
import { WWELL_IR_CASING_SIZE_MENU, WWELL_IR_CASING_TYPE_MENU, WWELL_IR_DROPDOWN_MENU_BY_FIELD } from './wwell-ir-dropdown-menu.config';
import { toUtmAxes } from '../wwell-ir-coordinates.util';

/** Splits the field's single "Northing X, Easting Y, Zone Z" value into its own Northing/
 *  Easting/UTM Zone box, shown exactly as the raw survey values — same fallback `toUtmAxes` uses
 *  elsewhere: text that doesn't read as that shape (or isn't populated yet) keeps one "Coordinates"
 *  box rather than showing empty Easting/Zone boxes next to it. */
function splitCoordinatesDisplay(value: string): readonly { readonly label: string; readonly value: string }[] {
  if (!value) return [{ label: 'Coordinates', value: '—' }];
  return toUtmAxes(value).map(axis => ({ label: axis.label, value: axis.value }));
}

/** Column order of the Area Water Wells table (the reference layout). The form lists the same fields with distance and
 *  location last instead. */
export const WWELL_IR_OFFSET_WELL_TABLE_ORDER: readonly string[] = [
  'wellName',
  'distanceKm',
  'location',
  'aquifer',
  'totalDepthFt',
  'testDurationMin',
  'rateGpm',
  'rpm',
  'swlFt',
  'pwlFt',
  'drawdownFt',
  'specificCapacity',
  'tdsPpm',
  'h2sPpm',
];

export const WWELL_IR_FORM_SCHEMA: readonly WwellFormStepConfig[] = [
  {
    key: 'reference',
    label: 'Request Reference',
    sections: [
      {
        key: 'main',
        title: null,
        fields: [
          {
            key: 'linkedRequestId',
            label: 'Link to Water Well',
            type: 'select',
            options: [],
            validators: { required: true },
            searchable: true,
          },
          {
            key: 'wellName',
            label: 'Water Well Name',
            type: 'text',
            placeholder: 'auto',
            readonly: true,
            validators: { required: true, pattern: WWELL_APPROVAL_WELL_NAME_PATTERN },
          },
          {
            key: 'letterNumber',
            label: 'Letter Number',
            type: 'text',
            placeholder: 'e.g., LTR-2026-0456',
            validators: { required: true },
          },
          {
            key: 'supportingBusiness',
            label: 'Supporting Business',
            type: 'text',
            placeholder: 'auto',
            readonly: true,
          },
          {
            key: 'targetAquifer',
            label: 'Target Aquifer',
            type: 'text',
            placeholder: 'auto',
            readonly: true,
          },
          {
            key: 'targetDepthFt',
            label: 'Target Depth',
            type: 'number',
            suffix: 'ft',
            placeholder: 'auto',
            readonly: true,
          },
          {
            key: 'surfaceElevationFtAsl',
            label: 'Surface Elevation',
            type: 'number',
            suffix: 'ft ASL',
          },
          {
            key: 'coordinates',
            label: 'Coordinates',
            type: 'text',
            placeholder: 'auto',
            readonly: true,
            colSpan: 2,
            splitDisplay: splitCoordinatesDisplay,
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
            { key: 'name', label: 'Formation', type: 'select', options: [], searchable: true },
            { key: 'depthFt', label: 'Depth', type: 'number', suffix: 'ft' },
            { key: 'subSeaFtAsl', label: 'Sub-sea', type: 'number', suffix: 'ft ASL' },
          ],
        },
      },
      {
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
              options: [],
              placeholder: 'e.g., Conductor',
            },
            { key: 'sizeIn', label: 'Size', type: 'select', options: [], placeholder: 'Select size' },
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
        key: 'main',
        title: null,
        fields: [
          {
            key: 'completionType',
            label: 'Completion',
            type: 'select',
            options: [],
            validators: { required: true },
            colSpan: 2,
          },
          {
            key: 'openHoleSizeIn',
            label: 'Open Hole Size',
            type: 'select',
            options: [],
            placeholder: 'Select open hole size',
            hint: 'Bit size below the last casing shoe — every completion is drawn inside this open hole',
            visibleWhen: { field: 'completionType', oneOf: Object.values(WWELL_COMPLETION_TYPE) },
            colSpan: 2,
          },
          {
            key: 'linerSizeIn',
            label: 'Liner Screen Size',
            type: 'select',
            options: [],
            defaultValue: WWELL_DEFAULT_LINER_SIZE,
            placeholder: 'Select liner size',
            hint: 'Outside diameter of the liner',
            visibleWhen: { field: 'completionType', oneOf: WWELL_LINER_COMPLETION_TYPES },
            validators: { required: true },
            colSpan: 2,
          },
          {
            key: 'linerDepthFt',
            label: 'Liner Depth (ft)',
            type: 'number',
            placeholder: 'e.g., 2500',
            hint: 'Shoe depth of the liner — left blank it runs down to the target depth',
            visibleWhen: { field: 'completionType', oneOf: WWELL_LINER_COMPLETION_TYPES },
            colSpan: 1,
          },
          {
            key: 'completion',
            label: 'Completion Remarks',
            type: 'rich-textarea',
            options: WWELL_COMPLETION_OPTIONS,
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
          // Every field is editable. Picking a well in "Select Offset Water Well" pre-fills them from its latest record,
          // and any of them can then be overwritten — or the whole row typed by hand. Distance and location depend on
          // where the new well sits, so they are never pre-filled and sit last. (The table lists the same fields in the
          // reference order instead — see WWELL_IR_OFFSET_WELL_TABLE_ORDER.)
          rowFields: [
            { key: 'wellName', label: 'Well Name', type: 'text' },
            // The id the save procedure keys a row on — assigned when the row is added (see addOffsetWellRow), never typed, so no input is drawn.
            { key: 'epANum', label: 'EP A Num', type: 'number', hidden: true },
            // A dropdown of the strat_info aquifer codes — its options are supplied by buildWwellIrFormSchema.
            { key: 'aquifer', label: 'Aquifer', type: 'select', options: [], keepUnlistedValue: true },
            { key: 'totalDepthFt', label: 'TD (ft bgl)', type: 'number' },
            { key: 'testDurationMin', label: 'Test Duration (min)', type: 'number' },
            { key: 'rateGpm', label: 'Rate (GPM)', type: 'number' },
            { key: 'rpm', label: 'RPM', type: 'number' },
            { key: 'swlFt', label: 'SWL (ft bgl)', type: 'number' },
            { key: 'pwlFt', label: 'PWL (ft bgl)', type: 'number' },
            { key: 'drawdownFt', label: 'Drawdown (ft)', type: 'number' },
            { key: 'specificCapacity', label: 'Specific Capacity (GPM/ft)', type: 'number' },
            { key: 'tdsPpm', label: 'Fluid TDS (ppm)', type: 'number' },
            { key: 'h2sPpm', label: 'H2S (ppm)', type: 'number' },
            { key: 'distanceKm', label: 'Distance (km)', type: 'number', placeholder: 'e.g., 2.5' },
            { key: 'location', label: 'Location', type: 'text', placeholder: 'e.g., N 2.5 km' },
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
            options: [],
            validators: { required: true },
          },
          { key: 'estimatedTdsPpm', label: 'Estimated TDS', type: 'number', suffix: 'ppm' },
          { key: 'estimatedRateGpm', label: 'Estimated Rate', type: 'number', suffix: 'GPM' },
          { key: 'h2sPpm', label: 'H2S', type: 'number', suffix: 'ppm' },
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
        key: 'locationMap',
        title: 'Location Map',
        fields: [
          {
            key: 'file',
            label: 'Location Map',
            type: 'file',
            placeholder: 'Click to attach file...',
            validators: { required: true },
          },
        ],
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
      {
        key: 'wlda',
        title: 'Well Location and Drilling Approval (WLDA)',
        fields: [
          {
            key: 'file',
            label: 'Well Location and Drilling Approval (WLDA)',
            type: 'file',
            placeholder: 'Click to attach file...',
            validators: { required: true },
          },
        ],
      },
    ],
  },
];

export function buildWwellIrFormSchema(
  linkedRequestOptions: Signal<readonly WwellFieldOption[]>,
  geologistOptions: Signal<readonly string[]>,
  dropdownMenus: Signal<Readonly<Record<string, readonly string[]>>> = signal({}),
  aquiferOptions: Signal<readonly WwellFieldOption[]> = signal([]),
  formationOptions: Signal<readonly WwellFieldOption[]> = signal([]),
  offsetWellAquiferOptions: Signal<readonly WwellFieldOption[]> = signal([]),
): readonly WwellFormStepConfig[] {
  return WWELL_IR_FORM_SCHEMA.map(step => {
    if (step.key === 'subsurface') {
      return {
        ...step,
        sections: step.sections.map(section =>
          section.key === 'formationTops' && section.repeatable
            ? {
                ...section,
                repeatable: {
                  ...section.repeatable,
                  rowFields: section.repeatable.rowFields.map(field => (field.key === 'name' ? { ...field, options: formationOptions } : field)),
                },
              }
            : section.key === 'casing' && section.repeatable
              ? {
                  ...section,
                  repeatable: {
                    ...section.repeatable,
                    rowFields: section.repeatable.rowFields.map(field => {
                      if (field.key === 'type') return { ...field, options: computed(() => dropdownMenus()[WWELL_IR_CASING_TYPE_MENU] ?? []) };
                      if (field.key === 'sizeIn') return { ...field, options: computed(() => dropdownMenus()[WWELL_IR_CASING_SIZE_MENU] ?? []) };
                      return field;
                    }),
                  },
                }
              : section,
        ),
      };
    }
    if (step.key === 'hydrogeology') {
      return {
        ...step,
        sections: step.sections.map(section => ({
          ...section,
          fields: section.fields?.map(field => (field.key === 'aquifer' ? { ...field, options: aquiferOptions } : field)),
        })),
      };
    }
    if (step.key === 'programDetails') {
      return {
        ...step,
        sections: step.sections.map(section => ({
          ...section,
          fields: section.fields?.map(field => withDropdownMenuOptions(field, dropdownMenus)),
        })),
      };
    }
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
          if (section.key === 'offsetWells' && section.repeatable) {
            return {
              ...section,
              repeatable: {
                ...section.repeatable,
                rowFields: section.repeatable.rowFields.map(field => (field.key === 'aquifer' ? { ...field, options: offsetWellAquiferOptions } : field)),
              },
            };
          }
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

/** Drives a Program Details dropdown purely from its EXAD_DHUB_LKUP_DATA menu — empty until loaded,
 *  and empty if the table has no rows for it (any fallback lives in WwellIrStore.loadDropdownMenus). */
function withDropdownMenuOptions(field: WwellFieldConfig, dropdownMenus: Signal<Readonly<Record<string, readonly string[]>>>): WwellFieldConfig {
  const menu = WWELL_IR_DROPDOWN_MENU_BY_FIELD[field.key];
  if (!menu) return field;
  return { ...field, options: computed(() => dropdownMenus()[menu] ?? []) };
}
