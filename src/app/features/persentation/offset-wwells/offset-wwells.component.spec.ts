import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OffsetWwellsComponent } from './offset-wwells.component';
import { WellStore } from 'src/app/core/store/well.store';
import { signal, WritableSignal } from '@angular/core';

describe('OffsetWwellsComponent', () => {
  let component: OffsetWwellsComponent;
  let fixture: ComponentFixture<OffsetWwellsComponent>;
  let mockStore: {
    offsetWells: WritableSignal<any[]>;
  };

  const mockOffsetWells = [
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
    const cards = compiled.querySelectorAll('.well-card');
    expect(cards.length).toBe(mockOffsetWells.length);
    expect(cards[0].querySelector('.name')?.textContent).toBe('Offset 1');
    expect(cards[1].querySelector('.name')?.textContent).toBe('Offset 2');
  });

  it('should show empty state if no wells', () => {
    mockStore.offsetWells.set([]);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.empty-state')).toBeTruthy();
  });

  it('should expand the first well by default', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const firstCardDetails = compiled.querySelector('.details-grid');
    expect(firstCardDetails).toBeTruthy();
    expect(firstCardDetails?.textContent).toContain('500m');
  });

  it('should toggle expansion when clicking a well card', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.well-card');
    
    // Clicking the second card
    (cards[1] as HTMLElement).click();
    fixture.detectChanges();
    
    expect(component['selectedIndex']()).toBe(1);
    expect(compiled.querySelectorAll('.details-grid').length).toBe(1);
    expect(compiled.querySelector('.details-grid')?.textContent).toContain('1.2km');

    // Clicking the same card again to collapse
    (cards[1] as HTMLElement).click();
    fixture.detectChanges();
    expect(component['selectedIndex']()).toBe(-1);
    expect(compiled.querySelector('.details-grid')).toBeFalsy();
  });

  it('should render correct details in the grid', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const details = compiled.querySelector('.details-grid');
    
    expect(details?.textContent).toContain('TDS (PPM)');
    expect(details?.textContent).toContain('300');
    expect(details?.textContent).toContain('1.5'); // productivity
    expect(details?.textContent).toContain('550'); // rate
  });
});
