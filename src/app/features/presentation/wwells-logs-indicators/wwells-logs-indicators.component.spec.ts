import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WwellsLogsIndicatorsComponent } from './wwells-logs-indicators.component';
import { PresentationStore } from '../store/presentation.store';

const presentationStoreMock = {
  wellsLogsIndicators: jest.fn(() => null),
  wellsLogsRemarks: jest.fn(() => null),
  selectedWell: jest.fn(() => null),
  isLoaded: jest.fn(() => false),
};

describe('WwellsLogsIndicatorsComponent', () => {
  let component: WwellsLogsIndicatorsComponent;
  let fixture: ComponentFixture<WwellsLogsIndicatorsComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [WwellsLogsIndicatorsComponent],
      providers: [{ provide: PresentationStore, useValue: presentationStoreMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(WwellsLogsIndicatorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
