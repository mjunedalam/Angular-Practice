import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WwellTestResultComponent } from './wwell-test-result.component';
import { PresentationStore } from '../store/presentation.store';
import { MatDialog } from '@angular/material/dialog';

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

const presentationStoreMock = {
  wellTestResults: jest.fn(() => []),
  waterWelltestResult: jest.fn(() => []),
  wwellTest: jest.fn(() => null),
  wellHeaderData: jest.fn(() => null),
  selectedWell: jest.fn(() => null),
  isLoaded: jest.fn(() => false),
};

const dialogMock = { open: jest.fn() };

describe('WwellTestResultComponent', () => {
  let component: WwellTestResultComponent;
  let fixture: ComponentFixture<WwellTestResultComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [WwellTestResultComponent],
      providers: [
        { provide: PresentationStore, useValue: presentationStoreMock },
        { provide: MatDialog, useValue: dialogMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WwellTestResultComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture?.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
