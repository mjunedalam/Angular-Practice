import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MiscPresWellDataComponent } from './misc-pres-well-data.component';
import { WellStore } from 'src/app/core/store/well.store';
import { signal, WritableSignal } from '@angular/core';

describe('MiscPresWellDataComponent', () => {
  let component: MiscPresWellDataComponent;
  let fixture: ComponentFixture<MiscPresWellDataComponent>;
  let mockStore: {
    miscWellData: WritableSignal<any | null>;
  };

  beforeEach(async () => {
    mockStore = {
      miscWellData: signal<any>({
        wellName: 'Test Well',
        targetDesc: 'Test Description',
        targetedAquifer: 'Test Aquifer',
        currentStatus: 'Testing',
        daysSinceSpud: 10,
        targetDays: 20,
        biNum: 'BI-123',
        supportingWell: 'Well 5',
        feetDrilledToday: 1500,
        previousWell: 'Prev Well',
        currentDepth: 5000,
        nextWell: 'Next Well',
        operationSummary: 'Summary 1',
        next24HrOperation: 'Next 24 1'
      }),
    };

    await TestBed.configureTestingModule({
      imports: [MiscPresWellDataComponent],
      providers: [
        { provide: WellStore, useValue: mockStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MiscPresWellDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render well information correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    
    expect(compiled.querySelector('.text-xl')?.textContent).toContain('Test Well');
    expect(compiled.querySelector('.text-xs')?.textContent).toContain('Test Description');
    expect(compiled.querySelector('.aquifer-icon + .cyan-text')?.textContent).toContain('Test Aquifer');
    // The div containing currentStatus is BEFORE .icon-gear in its parent .card
    const statusCard = compiled.querySelector('.icon-gear')?.parentElement;
    expect(statusCard?.querySelector('.cyan-text')?.textContent).toContain('Testing');
  });

  it('should render days counter correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const daysText = compiled.querySelector('.bg-gradient-dark-blue .text-md')?.textContent;
    expect(daysText).toContain('10 / 20');
  });

  it('should render BI and supporting well correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.bg-gradient-cyan .text-lg')?.textContent).toContain('BI-123');
    expect(compiled.querySelector('.bg-gradient-cyan .text-md')?.textContent).toContain('Well 5');
  });

  it('should render drilled feet and current depth correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    // feet Drilled Today with DecimalPipe (1,500)
    expect(compiled.querySelector('.text-xxl')?.textContent).toContain('1,500');
    // current Depth with DecimalPipe (5,000)
    const depths = compiled.querySelectorAll('.text-xxl');
    expect(depths[1]?.textContent).toContain('5,000');
  });

  it('should render previous and next well correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Prev Well');
    expect(compiled.textContent).toContain('Next Well');
  });

  it('should render nothing if miscWellData is null', () => {
    mockStore.miscWellData.set(null);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.misc-grid')).toBeFalsy();
  });
});
