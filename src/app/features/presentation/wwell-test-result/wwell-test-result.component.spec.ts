import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { WwellTestResultComponent } from './wwell-test-result.component';
import { WellStore, WellTestResult } from 'src/app/core/store/well.store';
import { signal, WritableSignal } from '@angular/core';

type WwellTestResultComponentPrivate = WwellTestResultComponent & {
  dialogVisible: () => boolean;
  selectedResult: () => WellTestResult | null;
  openDialog: (result: WellTestResult) => void;
  onDialogHide: () => void;
};

describe('WwellTestResultComponent', () => {
  let component: WwellTestResultComponent;
  let fixture: ComponentFixture<WwellTestResultComponent>;
  let componentPrivate: WwellTestResultComponentPrivate;
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
        provideNoopAnimations(),
        { provide: WellStore, useValue: mockStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WwellTestResultComponent);
    component = fixture.componentInstance;
    componentPrivate = component as WwellTestResultComponentPrivate;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the list of test results', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const tabs = compiled.querySelectorAll('.result-tab');
    expect(tabs.length).toBe(mockResults.length);
    expect(tabs[0].textContent).toContain('Well 1');
    expect(tabs[1].textContent).toContain('Well 2');
  });

  it('should show empty state if no results', () => {
    mockStore.wellTestResults.set([]);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.results-empty')).toBeTruthy();
    expect(compiled.querySelector('.result-tab')).toBeFalsy();
  });

  it('should open the dialog when a result tab is clicked', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const tabs = compiled.querySelectorAll('.result-tab');
    (tabs[0] as HTMLElement).click();
    fixture.detectChanges();

    expect(componentPrivate.dialogVisible()).toBe(true);
    expect(componentPrivate.selectedResult()).toEqual(mockResults[0]);
  });

  it('should render dialog metrics correctly', () => {
    componentPrivate.openDialog(mockResults[1]);
    fixture.detectChanges();

    const overlayText = document.body.textContent ?? '';
    expect(overlayText).toContain('Well 2');
    expect(overlayText).toContain('Recovery Test');
    expect(overlayText).toContain('H₂S Detected');
  });

  it('should close the dialog when onDialogHide is called', () => {
    componentPrivate.openDialog(mockResults[0]);
    expect(componentPrivate.dialogVisible()).toBe(true);

    componentPrivate.onDialogHide();

    expect(componentPrivate.dialogVisible()).toBe(false);
    expect(componentPrivate.selectedResult()).toBeNull();
  });

  it('should keep the selected result after change detection while dialog is open', () => {
    componentPrivate.openDialog(mockResults[1]);
    fixture.detectChanges();

    expect(componentPrivate.selectedResult()).toEqual(mockResults[1]);
    expect(componentPrivate.dialogVisible()).toBe(true);
  });

  it('should render the badge count from the store', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Well Test Results');
    expect(compiled.textContent).toContain(mockResults.length.toString());
  });
});
