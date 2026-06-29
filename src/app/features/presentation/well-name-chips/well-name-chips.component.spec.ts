import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WellNameChipsComponent } from './well-name-chips.component';
import { PresentationStore } from '../store/presentation.store';
import { NotificationService } from '@shared/components/notification/notification.service';

const presentationStoreMock = {
  wellNames: jest.fn(() => []),
  pagedWellNames: jest.fn(() => []),
  wellNamesPage: jest.fn(() => 0),
  totalPages: jest.fn(() => 1),
  hasPrevPage: jest.fn(() => false),
  hasNextPage: jest.fn(() => false),
  selectedWell: jest.fn(() => null),
  selectedEpANum: jest.fn(() => null),
  selectedDate: jest.fn(() => ''),
  isLoaded: jest.fn(() => false),
  isLoading: jest.fn(() => false),
  isDetailsLoading: jest.fn(() => false),
  loadWellList: jest.fn(),
  selectWell: jest.fn(),
  setDate: jest.fn(),
  nextPage: jest.fn(),
  prevPage: jest.fn(),
};

const notificationServiceMock = {
  show: jest.fn(),
  error: jest.fn(),
  notifications: jest.fn(() => []),
  dismiss: jest.fn(),
};

describe('WellNameChipsComponent', () => {
  let component: WellNameChipsComponent;
  let fixture: ComponentFixture<WellNameChipsComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [WellNameChipsComponent],
      providers: [
        { provide: PresentationStore, useValue: presentationStoreMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WellNameChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
