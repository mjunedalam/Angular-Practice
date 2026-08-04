import { FormArray, FormBuilder } from '@angular/forms';
import { addRepeatableRow, buildWwellDynamicForm } from './wwell-dynamic-form.builder';
import { WwellFormStepConfig } from './wwell-dynamic-form.types';

const fb = new FormBuilder();

const SCHEMA: readonly WwellFormStepConfig[] = [
  {
    key: 'reference',
    label: 'Reference',
    sections: [
      {
        key: 'main',
        title: null,
        fields: [
          { key: 'wellName', label: 'Well Name', type: 'text', validators: { required: true } },
          { key: 'targetDepthFt', label: 'Target Depth', type: 'number' },
        ],
      },
    ],
  },
  {
    key: 'subsurface',
    label: 'Subsurface',
    sections: [
      {
        key: 'casing',
        title: 'Casing',
        repeatable: {
          key: 'casing',
          addLabel: '+ Add Casing',
          minRows: 1,
          rowFields: [
            { key: 'type', label: 'Type', type: 'select' },
            { key: 'depthFtBgl', label: 'Depth', type: 'number' },
          ],
        },
      },
      {
        key: 'attachments',
        title: 'Attachments',
        fields: [{ key: 'locationMap', label: 'Location Map', type: 'file', validators: { required: true } }],
      },
    ],
  },
];

describe('buildWwellDynamicForm', () => {
  it('builds one nested FormGroup per step/section, keyed to match the schema', () => {
    const form = buildWwellDynamicForm(SCHEMA, fb);

    expect(form.get('reference.main.wellName')).toBeTruthy();
    expect(form.get('reference.main.targetDepthFt')).toBeTruthy();
    expect(form.get('subsurface.attachments.locationMap')).toBeTruthy();
  });

  it('wires required validators from field config', () => {
    const form = buildWwellDynamicForm(SCHEMA, fb);
    const wellName = form.get('reference.main.wellName');

    expect(wellName?.valid).toBe(false);
    wellName?.setValue('HAIL-500');
    expect(wellName?.valid).toBe(true);
  });

  it('treats an empty file list as failing a required file field', () => {
    const form = buildWwellDynamicForm(SCHEMA, fb);
    const locationMap = form.get('subsurface.attachments.locationMap');

    expect(locationMap?.value).toEqual([]);
    expect(locationMap?.hasError('required')).toBe(true);

    locationMap?.setValue([new File(['x'], 'map.pdf')]);
    expect(locationMap?.valid).toBe(true);
  });

  it('seeds a repeatable section with minRows rows, and addRepeatableRow appends more', () => {
    const form = buildWwellDynamicForm(SCHEMA, fb);
    const casingArray = form.get('subsurface.casing');

    expect(casingArray?.value).toHaveLength(1);

    const rowFields = SCHEMA[1].sections[0].repeatable!.rowFields;
    addRepeatableRow(form.get('subsurface.casing') as FormArray, rowFields, fb);

    expect(casingArray?.value).toHaveLength(2);
  });
});
