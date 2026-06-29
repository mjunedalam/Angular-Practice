import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MiscPresWellDataComponent } from './misc-pres-well-data.component';
import { PresentationStore } from '../store/presentation.store';

const presentationStoreMock = {
  miscWellData: jest.fn(() => null),
  selectedWell: jest.fn(() => null),
  isLoaded: jest.fn(() => false),
};

describe('MiscPresWellDataComponent', () => {
  let component: MiscPresWellDataComponent;
  let fixture: ComponentFixture<MiscPresWellDataComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [MiscPresWellDataComponent],
      providers: [{ provide: PresentationStore, useValue: presentationStoreMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(MiscPresWellDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
