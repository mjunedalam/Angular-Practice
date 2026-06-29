import { TestBed } from '@angular/core/testing';
import { MorningReportStore } from './morning-report.store';
import { DailyOperationService } from '@services/daily-operation.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const dailyOperationServiceMock = {
  getWellList: jest.fn(),
  getMorningReport: jest.fn(),
};

const notificationServiceMock = {
  show: jest.fn(),
  error: jest.fn(),
  notifications: jest.fn(() => []),
  dismiss: jest.fn(),
};

describe('MorningReportStore', () => {
  let store: InstanceType<typeof MorningReportStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        MorningReportStore,
        { provide: DailyOperationService, useValue: dailyOperationServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    });
    store = TestBed.inject(MorningReportStore);
  });

  it('should initialise with empty allWellsData', () => {
    expect(store.allWellsData()).toEqual([]);
  });

  it('isLoading should be false initially', () => {
    expect(store.isLoading()).toBe(false);
  });

  it('hasError should be false initially', () => {
    expect(store.hasError()).toBe(false);
  });

  it('errorMessage should be empty initially', () => {
    expect(store.errorMessage()).toBe('');
  });
});
