import { TestBed } from '@angular/core/testing';
import { ActiveWwellStore } from './active-wwell.store';
import { DailyOperationService } from '@services/daily-operation.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const dailyOperationServiceMock = {
  getWellList: jest.fn(),
  getWellData: jest.fn(),
  updateOperationSummary: jest.fn(),
  updateWellTest: jest.fn(),
  addStatus: jest.fn(),
};

const notificationServiceMock = {
  show: jest.fn(),
  error: jest.fn(),
  notifications: jest.fn(() => []),
  dismiss: jest.fn(),
};

describe('ActiveWwellStore', () => {
  let store: InstanceType<typeof ActiveWwellStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ActiveWwellStore,
        { provide: DailyOperationService, useValue: dailyOperationServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    });
    store = TestBed.inject(ActiveWwellStore);
  });

  it('should initialise with empty well list', () => {
    expect(store.wellList()).toEqual([]);
  });

  it('listLoading should be false initially', () => {
    expect(store.listLoading()).toBe(false);
  });

  it('error should be null initially', () => {
    expect(store.error()).toBeNull();
  });

  it('isLoading should be false initially', () => {
    expect(store.isLoading()).toBe(false);
  });
});
