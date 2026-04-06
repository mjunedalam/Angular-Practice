import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WwellsLogsIndicatorsComponent } from './wwells-logs-indicators.component';
import { WellStore } from 'src/app/core/store/well.store';
import { signal, WritableSignal } from '@angular/core';

describe('WwellsLogsIndicatorsComponent', () => {
  let component: WwellsLogsIndicatorsComponent;
  let fixture: ComponentFixture<WwellsLogsIndicatorsComponent>;
  let mockStore: {
    wellsLogsIndicators: WritableSignal<any>;
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
    const buttons = compiled.querySelectorAll('button.log-btn');
    
    // RTC (true)
    expect(buttons[0].classList.contains('log-btn--active')).toBe(true);
    expect((buttons[0] as HTMLButtonElement).disabled).toBe(false);

    // Mud Log (false)
    expect(buttons[1].classList.contains('log-btn--inactive')).toBe(true);
    expect((buttons[1] as HTMLButtonElement).disabled).toBe(true);

    // Logging (true)
    expect(buttons[2].classList.contains('log-btn--active')).toBe(true);
    expect((buttons[2] as HTMLButtonElement).disabled).toBe(false);
  });

  it('should update classes when store data changes', () => {
    mockStore.wellsLogsIndicators.set({
      rcc: false,
      mudLog: true,
      logging: false,
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll('button.log-btn');
    
    expect(buttons[0].classList.contains('log-btn--inactive')).toBe(true);
    expect(buttons[1].classList.contains('log-btn--active')).toBe(true);
    expect(buttons[2].classList.contains('log-btn--inactive')).toBe(true);
  });
});
