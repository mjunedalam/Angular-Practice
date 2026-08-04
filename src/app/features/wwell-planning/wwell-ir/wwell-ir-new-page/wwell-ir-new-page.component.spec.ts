import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper } from '@angular/material/stepper';
import { WwellPlanningStore } from '../../store/wwell-planning.store';
import { WwellIrNewPageComponent } from './wwell-ir-new-page.component';
import { WWELL_IR_FORM_SCHEMA } from '../wwell-ir-form/wwell-ir-form.schema';

interface TestableWwellIrNewPage {
  stepGroup(stepKey: string): { get(key: string): FormArray };
  submit(stepper: MatStepper): void;
  saveAsDraft(): void;
}

function asTestable(component: WwellIrNewPageComponent): TestableWwellIrNewPage {
  return component as unknown as TestableWwellIrNewPage;
}

const storeMock = {
  creatingIntegratedRequirement: jest.fn(() => false),
  createIntegratedRequirementError: jest.fn(() => null as string | null),
  createIntegratedRequirement: jest.fn(),
};

const snackBarMock = { open: jest.fn() };

function findButtonByText(fixture: ComponentFixture<WwellIrNewPageComponent>, text: string): HTMLButtonElement | undefined {
  return Array.from(fixture.nativeElement.querySelectorAll('button')).find((btn): btn is HTMLButtonElement =>
    (btn as HTMLButtonElement).textContent?.includes(text) ?? false,
  );
}

describe('WwellIrNewPageComponent', () => {
  let component: WwellIrNewPageComponent;
  let fixture: ComponentFixture<WwellIrNewPageComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [WwellIrNewPageComponent, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: WwellPlanningStore, useValue: storeMock },
        { provide: MatSnackBar, useValue: snackBarMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WwellIrNewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture?.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders one step header and one projected step-content block per schema entry', () => {
    const headers = fixture.nativeElement.querySelectorAll('.mat-step-header');
    const content = fixture.nativeElement.querySelectorAll('.nip__step-content');
    expect(headers.length).toBe(WWELL_IR_FORM_SCHEMA.length);
    expect(content.length).toBe(WWELL_IR_FORM_SCHEMA.length);
  });

  it('adding a casing row grows the underlying FormArray', () => {
    const casingArray = asTestable(component).stepGroup('subsurface').get('casing');
    expect(casingArray.length).toBe(0);

    findButtonByText(fixture, 'Add Casing')?.click();
    fixture.detectChanges();

    expect(casingArray.length).toBe(1);
  });

  it('blocks submit when required fields are missing', () => {
    asTestable(component).submit({ selectedIndex: 0 } as MatStepper);
    expect(storeMock.createIntegratedRequirement).not.toHaveBeenCalled();
  });

  it('lets Save as Draft bypass validation', () => {
    asTestable(component).saveAsDraft();

    expect(storeMock.createIntegratedRequirement).toHaveBeenCalledTimes(1);
    const [payload] = storeMock.createIntegratedRequirement.mock.calls[0];
    expect(payload.status).toBe('draft');
  });
});
