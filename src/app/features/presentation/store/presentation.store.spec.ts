import { TestBed } from '@angular/core/testing';
import { PresentationStore } from './presentation.store';
import { DailyOperationService } from '@services/daily-operation.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const dailyOperationServiceMock = {
  getWellList: jest.fn(),
  getWellData: jest.fn(),
};

const notificationServiceMock = {
  show: jest.fn(),
  error: jest.fn(),
  notifications: jest.fn(() => []),
  dismiss: jest.fn(),
};

describe('PresentationStore', () => {
  let store: InstanceType<typeof PresentationStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PresentationStore,
        { provide: DailyOperationService, useValue: dailyOperationServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    });
    store = TestBed.inject(PresentationStore);
  });

  it('should initialise with empty well list', () => {
    expect(store.wellList()).toEqual([]);
  });

  it('isLoaded should be false initially', () => {
    expect(store.isLoaded()).toBe(false);
  });

  it('isLoading should be false initially', () => {
    expect(store.isLoading()).toBe(false);
  });

  it('hasError should be false initially', () => {
    expect(store.hasError()).toBe(false);
  });

  it('selectedWell should be null initially', () => {
    expect(store.selectedWell()).toBeNull();
  });
});
