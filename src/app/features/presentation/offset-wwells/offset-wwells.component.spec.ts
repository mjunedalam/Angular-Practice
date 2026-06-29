import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OffsetWwellsComponent } from './offset-wwells.component';
import { PresentationStore } from '../store/presentation.store';

const presentationStoreMock = {
  offsetWells: jest.fn(() => []),
  selectedWell: jest.fn(() => null),
  isLoaded: jest.fn(() => false),
};

describe('OffsetWwellsComponent', () => {
  let component: OffsetWwellsComponent;
  let fixture: ComponentFixture<OffsetWwellsComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [OffsetWwellsComponent],
      providers: [{ provide: PresentationStore, useValue: presentationStoreMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(OffsetWwellsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
