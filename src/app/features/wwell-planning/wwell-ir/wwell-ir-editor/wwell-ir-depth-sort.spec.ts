import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { sortByDepthAscending } from '../wwell-ir-form/wwell-ir-detail-response.mapper';
import { sortFormArrayByDepth } from './wwell-ir-section-edit.util';

describe('depth ordering of the casing and formation-tops grids', () => {
  it('sortByDepthAscending lists the shallowest first and puts rows with no depth last', () => {
    const rows = [{ n: 'c', d: 900 }, { n: 'x', d: null }, { n: 'a', d: 100 }, { n: 'b', d: 500 }];

    expect(sortByDepthAscending(rows, row => row.d).map(row => row.n)).toEqual(['a', 'b', 'c', 'x']);
  });

  it('sortByDepthAscending does not mutate its input', () => {
    const rows = [{ d: 2 }, { d: 1 }];

    sortByDepthAscending(rows, row => row.d);

    expect(rows.map(row => row.d)).toEqual([2, 1]);
  });

  it('sortFormArrayByDepth reorders the rows of a form array in place', () => {
    const fb = new FormBuilder();
    const array: FormArray = fb.array([
      fb.group({ name: 'deep', depthFt: 900 }),
      fb.group({ name: 'shallow', depthFt: 100 }),
      fb.group({ name: 'mid', depthFt: 500 }),
    ]);

    sortFormArrayByDepth(array, 'depthFt');

    expect(array.controls.map(row => (row as FormGroup).get('name')?.value)).toEqual(['shallow', 'mid', 'deep']);
  });
});
