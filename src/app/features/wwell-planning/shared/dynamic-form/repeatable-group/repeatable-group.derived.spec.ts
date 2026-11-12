import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { addRepeatableRow } from '../wwell-dynamic-form.builder';
import { WwellRepeatableRowConfig } from '../wwell-dynamic-form.types';
import { RepeatableGroupComponent } from './repeatable-group.component';

const ELEVATION = 600;

const config: WwellRepeatableRowConfig = {
  key: 'tops',
  addLabel: 'Add',
  rowFields: [
    { key: 'depthFt', label: 'Depth', type: 'number' },
    {
      key: 'subSeaFtAsl',
      label: 'Sub-sea',
      type: 'number',
      readonly: true,
      derived: {
        compute: row => (typeof row['depthFt'] === 'number' ? ELEVATION - row['depthFt'] : null),
        explain: row => `Sub-sea = ${ELEVATION} − ${String(row['depthFt'])}`,
      },
    },
  ],
};

describe('RepeatableGroupComponent — derived fields', () => {
  let fixture: ComponentFixture<RepeatableGroupComponent>;
  let array: FormArray;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [RepeatableGroupComponent, NoopAnimationsModule] });
    const fb = TestBed.inject(FormBuilder);
    array = fb.array<FormGroup>([]);
    addRepeatableRow(array, config.rowFields, fb);
    fixture = TestBed.createComponent(RepeatableGroupComponent);
    fixture.componentRef.setInput('config', config);
    fixture.componentRef.setInput('formArray', array);
    fixture.detectChanges();
  });

  it('recalculates the derived control whenever the field it depends on changes', () => {
    const row = array.at(0) as FormGroup;

    row.get('depthFt')?.setValue(250);

    expect(row.get('subSeaFtAsl')?.value).toBe(350);
  });

  it('clears the derived control when its input is emptied', () => {
    const row = array.at(0) as FormGroup;
    row.get('depthFt')?.setValue(250);

    row.get('depthFt')?.setValue(null);

    expect(row.get('subSeaFtAsl')?.value).toBeNull();
  });

  it('keeps a derived control read-only (disabled) so it cannot be typed into', () => {
    expect((array.at(0) as FormGroup).get('subSeaFtAsl')?.disabled).toBe(true);
  });
});
