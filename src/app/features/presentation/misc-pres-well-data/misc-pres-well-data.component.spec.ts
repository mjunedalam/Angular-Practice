import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MiscPresWellDataComponent } from './misc-pres-well-data.component';
import { WellStore } from '@store/active-wwell/active-wwell.store';
import { signal, WritableSignal } from '@angular/core';

interface MiscWellDataViewModel {
  wellName: string;
  targetDesc: string;
  targetedAquifer: string;
  currentStatus: string;
  daysSinceSpud: number;
  targetDays: number;
  biNum: string;
  supportingWell: string;
  feetDrilledToday: number;
  previousWell: string;
  currentDepth: number;
  nextWell: string;
  operationSummary: string;
  next24HrOperation: string;
}

describe('MiscPresWellDataComponent', () => {
  let component: MiscPresWellDataComponent;
  let fixture: ComponentFixture<MiscPresWellDataComponent>;
  let mockStore: {
    miscWellData: WritableSignal<MiscWellDataViewModel | null>;
  };

  beforeEach(async () => {
    mockStore = {
      miscWellData: signal<MiscWellDataViewModel>({
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
    
    expect(compiled.querySelector('.cell__name')?.textContent).toContain('Test Well');
    expect(compiled.querySelector('.cell__sub')?.textContent).toContain('Test Description');
    expect(compiled.querySelector('.aquifer-name')?.textContent).toContain('Test Aquifer');
    expect(compiled.querySelector('.status-value')?.textContent).toContain('On Target');
  });

  it('should render days counter correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const daysText = compiled.querySelector('.days-value')?.textContent;
    expect(daysText).toContain('10.00/20');
  });

  it('should render BI and supporting well correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.bi-num')?.textContent).toContain('BIBI-123');
    expect(compiled.querySelector('.bi-well')?.textContent).toContain('Well Well 5');
  });

  it('should render drilled feet and current depth correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.feet-value')?.textContent).toContain('1,500');
    expect(compiled.querySelector('.depth-value')?.textContent).toContain('5,000');
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
