import { of } from 'rxjs';
import { WwellIrService } from '../wwell-planning/wwell-ir/wwell-ir.service';
import { TestBed } from '@angular/core/testing';
import { WellProfileStore } from './well-profile.store';
import { projectStrings, stringsAtDepth, formationAtDepth } from './well-profile.geometry';
import { REFERENCE_STRINGS, REFERENCE_FORMATIONS } from './well-profile.data';

describe('Well Profile construction relationships', () => {
  it('keeps conductor outside surface casing and liner at production shoe in every spread', () => {
    for (const spread of [0, 0.5, 1]) {
      const strings = projectStrings(REFERENCE_STRINGS, spread);
      expect(strings[0].radius / strings[1].radius).toBeCloseTo(30 / 24);
      expect(strings.slice(0, 4).map(s => s.topY)).toEqual([60, 60, 60, 60]);
      expect(strings[4].topY).toBe(strings[3].bottomY);
      expect(strings[0].bottomY).toBeCloseTo(77.4947, 3);
    }
  });
  it('reports all overlapping strings and moves into the liner at the shoe boundary', () => {
    expect(stringsAtDepth(REFERENCE_STRINGS, 5).map(s => s.csgSize)).toEqual(['30', '24', '18', '13']);
    expect(stringsAtDepth(REFERENCE_STRINGS, 2000).map(s => s.csgSize)).toEqual(['9']);
    expect(stringsAtDepth(REFERENCE_STRINGS, 3300)).toEqual([]);
    expect(formationAtDepth(REFERENCE_FORMATIONS, 2150)?.stLongCd).toBe('WASI');
  });
});

describe('WellProfileStore', () => {
  it('clamps depth and preserves valid selection when asked for an unknown string', () => {
    TestBed.configureTestingModule({ providers: [WellProfileStore, { provide: WwellIrService, useValue: { getIrs: () => of([]) } }] });
    const store = TestBed.inject(WellProfileStore);
    store.setDepth(9000);
    expect(store.depth()).toBe(0);
    store.select('unknown');
    expect(store.selected()).toBeNull();
    store.setDepth(2500);
    expect(store.strings()).toEqual([]);
  });
  it('switches profile to 3D on explode and uses a translucent default', () => {
    TestBed.configureTestingModule({ providers: [WellProfileStore, { provide: WwellIrService, useValue: { getIrs: () => of([]) } }] });
    const store = TestBed.inject(WellProfileStore);
    store.setMode('profile');
    store.toggleExploded();
    expect(store.mode()).toBe('solid');
    expect(store.exploded()).toBe(true);
    expect(store.shellOpacity()).toBe(0.45);
    store.toggleExploded();
    expect(store.exploded()).toBe(false);
  });
});
