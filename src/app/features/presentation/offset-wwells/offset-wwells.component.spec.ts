import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { OffsetWwellsComponent } from './offset-wwells.component';
import { WellStore } from '@store/active-wwell/active-wwell.store';
import { signal, WritableSignal } from '@angular/core';

interface OffsetWell {
  wellName: string;
  aquifer: string;
  tds: number;
  rpm: number;
  h2s: number;
  distance: string;
  productivity: number;
  rate: number;
}

describe('OffsetWwellsComponent', () => {
  let component: OffsetWwellsComponent;
  let fixture: ComponentFixture<OffsetWwellsComponent>;
  let mockStore: {
    offsetWells: WritableSignal<OffsetWell[]>;
  };

  const mockOffsetWells: OffsetWell[] = [
    {
      wellName: 'Offset 1',
      aquifer: 'Aquifer A',
      tds: 300,
      rpm: 1200,
      h2s: 0,
      distance: '500m',
      productivity: 1.5,
      rate: 550,
    },
    {
      wellName: 'Offset 2',
      aquifer: 'Aquifer B',
      tds: 450,
      rpm: 1100,
      h2s: 2,
      distance: '1.2km',
      productivity: 0.9,
      rate: 400,
    },
  ];

  beforeEach(async () => {
    mockStore = {
      offsetWells: signal(mockOffsetWells),
    };

    await TestBed.configureTestingModule({
      imports: [OffsetWwellsComponent],
      providers: [
        provideNoopAnimations(),
        { provide: WellStore, useValue: mockStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OffsetWwellsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the list of offset wells', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const headers = compiled.querySelectorAll('.well-header-row');
    expect(headers.length).toBe(mockOffsetWells.length);
    expect(headers[0].querySelector('.well-name')?.textContent).toBe('Offset 1');
    expect(headers[1].querySelector('.well-name')?.textContent).toBe('Offset 2');
  });

  it('should show empty state if no wells', () => {
    mockStore.offsetWells.set([]);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')).toBeTruthy();
  });

  it('should expand the first well by default', () => {
    expect(component['activeValue']()).toBe('0');
  });

  it('should update activeValue when accordion value changes', () => {
    component['onValueChange']('1');
    expect(component['activeValue']()).toBe('1');

    component['onValueChange'](['0', '1']);
    expect(component['activeValue']()).toBe('0');
  });

  it('should render correct details in the grid', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const details = compiled.querySelector('.well-accordion__content');
    
    expect(details?.textContent).toContain('TDS (PPM)');
    expect(details?.textContent).toContain('300');
    expect(details?.textContent).toContain('500m ft');
    expect(details?.textContent).toContain('1.5');
    expect(details?.textContent).toContain('550 GPM');
  });
});
