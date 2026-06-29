import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CasingInfoComponent } from './casing-info.component';
import { ActiveWwellStore } from '../store/active-wwell.store';

function createFixture(casingData: { csgDepth: number; csgType: string }[] | null): ComponentFixture<CasingInfoComponent> {
  const activeWwellStoreMock = {
    allCasingData: jest.fn(() => casingData),
    selectedWell: jest.fn(() => null),
  };
  TestBed.configureTestingModule({
    imports: [CasingInfoComponent],
    providers: [{ provide: ActiveWwellStore, useValue: activeWwellStoreMock }],
  });
  const fixture = TestBed.createComponent(CasingInfoComponent);
  fixture.detectChanges();
  return fixture;
}

describe('CasingInfoComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    const fixture = createFixture([]);
    expect(fixture.componentInstance).toBeTruthy();
    fixture.destroy();
  });

  it('data() returns empty array when store returns null', () => {
    const fixture = createFixture(null);
    expect((fixture.componentInstance as unknown as { data: () => unknown[] }).data()).toEqual([]);
    fixture.destroy();
  });

  it('data() sorts by csgDepth ascending', () => {
    const fixture = createFixture([
      { csgDepth: 300, csgType: 'C' },
      { csgDepth: 100, csgType: 'A' },
      { csgDepth: 200, csgType: 'B' },
    ]);
    const result = (fixture.componentInstance as unknown as { data: () => { csgDepth: number; csgType: string }[] }).data();
    expect(result[0].csgDepth).toBe(100);
    expect(result[2].csgDepth).toBe(300);
    fixture.destroy();
  });
});
