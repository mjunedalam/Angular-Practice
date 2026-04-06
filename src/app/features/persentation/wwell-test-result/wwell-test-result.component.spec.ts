import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WwellTestResultComponent } from './wwell-test-result.component';
import { WellStore, WellTestResult } from 'src/app/core/store/well.store';
import { signal, WritableSignal } from '@angular/core';

describe('WwellTestResultComponent', () => {
  let component: WwellTestResultComponent;
  let fixture: ComponentFixture<WwellTestResultComponent>;
  let mockStore: {
    wellTestResults: WritableSignal<WellTestResult[]>;
  };

  const mockResults: WellTestResult[] = [
    {
      wellName: 'Well 1',
      aquifer: 'Aquifer A',
      testType: 'pumping',
      flowRate: 500,
      rpm: 1200,
      tds: 300,
      temperature: 25.5,
      productivity: 1.5,
      h2s: 0,
    },
    {
      wellName: 'Well 2',
      aquifer: 'Aquifer B',
      testType: 'recovery',
      flowRate: 300,
      rpm: 1000,
      tds: 450,
      temperature: 22.1,
      productivity: 0.8,
      h2s: 5,
    },
  ];

  beforeEach(async () => {
    mockStore = {
      wellTestResults: signal(mockResults),
    };

    await TestBed.configureTestingModule({
      imports: [WwellTestResultComponent],
      providers: [
        { provide: WellStore, useValue: mockStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WwellTestResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the list of test results', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const tabs = compiled.querySelectorAll('.test-tab');
    expect(tabs.length).toBe(mockResults.length);
    expect(tabs[0].textContent).toContain('Well 1');
    expect(tabs[1].textContent).toContain('Well 2');
  });

  it('should show empty state if no results', () => {
    mockStore.wellTestResults.set([]);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.test-results__empty')).toBeTruthy();
    expect(compiled.querySelector('.test-tab')).toBeFalsy();
  });

  it('should open the dialog when a result tab is clicked', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const tabs = compiled.querySelectorAll('.test-tab');
    (tabs[0] as HTMLElement).click();
    fixture.detectChanges();

    const dialog = compiled.querySelector('.dialog');
    expect(dialog).toBeTruthy();
    expect(dialog?.querySelector('.dialog__well-name')?.textContent).toBe('Well 1');
  });

  it('should render dialog metrics correctly', () => {
    // Open dialog for Well 2 (H2S > 0)
    const compiled = fixture.nativeElement as HTMLElement;
    const tabs = compiled.querySelectorAll('.test-tab');
    (tabs[1] as HTMLElement).click();
    fixture.detectChanges();

    const dialog = compiled.querySelector('.dialog');
    expect(dialog?.querySelector('.metric--highlight .metric__value')?.textContent).toContain('300'); // flowRate
    expect(dialog?.querySelector('.metric--warn')).toBeTruthy(); // h2s check
    expect(dialog?.textContent).toContain('Recovery Test');
    expect(dialog?.textContent).toContain('H₂S Detected');
  });

  it('should close the dialog when close button is clicked', () => {
    // Open first
    const compiled = fixture.nativeElement as HTMLElement;
    (compiled.querySelector('.test-tab') as HTMLElement).click();
    fixture.detectChanges();
    expect(compiled.querySelector('.dialog')).toBeTruthy();

    // Close
    (compiled.querySelector('.dialog__close') as HTMLElement).click();
    fixture.detectChanges();
    expect(compiled.querySelector('.dialog')).toBeFalsy();
  });

  it('should close the dialog when backdrop is clicked', () => {
    // Open first
    (fixture.nativeElement.querySelector('.test-tab') as HTMLElement).click();
    fixture.detectChanges();
    
    // Click backdrop
    (fixture.nativeElement.querySelector('.dialog-backdrop') as HTMLElement).click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.dialog')).toBeFalsy();
  });

  it('should NOT close the dialog when dialog content is clicked (stopPropagation)', () => {
    (fixture.nativeElement.querySelector('.test-tab') as HTMLElement).click();
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('.dialog') as HTMLElement;
    dialog.click(); // This should trigger stopPropagation
    fixture.detectChanges();
    
    expect(fixture.nativeElement.querySelector('.dialog')).toBeTruthy();
  });
});
