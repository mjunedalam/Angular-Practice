import { formatUtmCoordinates, toUtmAxes } from './wwell-ir-coordinates.util';

describe('wwell-ir coordinates', () => {
  it('composes northing/easting without a unit', () => {
    expect(formatUtmCoordinates(3043496.7774, 766571.9346, 37)).toBe('Northing 3043496.7774, Easting 766571.9346, Zone 37');
  });

  it('splits the composed string into bare values', () => {
    expect(toUtmAxes('Northing 3043496.7774, Easting 766571.9346, Zone 37').map(a => [a.label, a.value])).toEqual([
      ['Northing', '3043496.7774'],
      ['Easting', '766571.9346'],
      ['UTM Zone', '37'],
    ]);
  });

  it('still reads IRs saved with the old "m" suffix, and shows them without it', () => {
    expect(toUtmAxes('Northing 3043496.7774m, Easting 766571.9346 m, Zone 37').map(a => a.value)).toEqual([
      '3043496.7774',
      '766571.9346',
      '37',
    ]);
  });

  it('keeps free text whole', () => {
    expect(toUtmAxes('near the old pump station')).toEqual([{ label: 'Coordinates', value: 'near the old pump station', icon: 'location_on' }]);
  });
});
