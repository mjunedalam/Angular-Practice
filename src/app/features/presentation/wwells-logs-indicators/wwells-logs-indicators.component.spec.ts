import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WwellsLogsIndicatorsComponent } from './wwells-logs-indicators.component';
import { WellStore } from 'src/app/core/store/well.store';
import { signal, WritableSignal } from '@angular/core';

interface WellLogsIndicatorsState {
  rcc: boolean;
  mudLog: boolean;
  logging: boolean;
}

describe('WwellsLogsIndicatorsComponent', () => {
  let component: WwellsLogsIndicatorsComponent;
  let fixture: ComponentFixture<WwellsLogsIndicatorsComponent>;
  let mockStore: {
    wellsLogsIndicators: WritableSignal<WellLogsIndicatorsState>;
  };

  beforeEach(async () => {
    mockStore = {
      wellsLogsIndicators: signal({
        rcc: true,
        mudLog: false,
        logging: true,
      }),
    };

    await TestBed.configureTestingModule({
      imports: [WwellsLogsIndicatorsComponent],
      providers: [
        { provide: WellStore, useValue: mockStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WwellsLogsIndicatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set active/inactive classes and disabled status based on store data', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const indicators = compiled.querySelectorAll('.indicator-toggle');
    
    expect(indicators).toHaveLength(3);

    expect(indicators[0].classList.contains('indicator-toggle--active')).toBe(true);
    expect(indicators[1].classList.contains('indicator-toggle--active')).toBe(false);
    expect(indicators[2].classList.contains('indicator-toggle--active')).toBe(true);

    expect(indicators[0].textContent).toContain('RCC');
    expect(indicators[1].textContent).toContain('Mud Log');
    expect(indicators[2].textContent).toContain('Logging');
  });

  it('should update classes when store data changes', () => {
    mockStore.wellsLogsIndicators.set({
      rcc: false,
      mudLog: true,
      logging: false,
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const indicators = compiled.querySelectorAll('.indicator-toggle');
    
    expect(indicators[0].classList.contains('indicator-toggle--active')).toBe(false);
    expect(indicators[1].classList.contains('indicator-toggle--active')).toBe(true);
    expect(indicators[2].classList.contains('indicator-toggle--active')).toBe(false);
  });
});
