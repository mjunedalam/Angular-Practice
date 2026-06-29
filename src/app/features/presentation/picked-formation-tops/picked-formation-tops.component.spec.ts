import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PickedFormationTopsComponent } from './picked-formation-tops.component';
import { PresentationStore } from '../store/presentation.store';

const presentationStoreMock = {
  pickedFormations: jest.fn(() => []),
  allFormationTops: jest.fn(() => []),
  selectedWell: jest.fn(() => null),
  isLoaded: jest.fn(() => false),
};

describe('PickedFormationTopsComponent', () => {
  let component: PickedFormationTopsComponent;
  let fixture: ComponentFixture<PickedFormationTopsComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [PickedFormationTopsComponent],
      providers: [{ provide: PresentationStore, useValue: presentationStoreMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(PickedFormationTopsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
