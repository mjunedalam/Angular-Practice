import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MorningReportStore } from './morning-report.store';
import { DailyOperationService } from '@services/daily-operation.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IWellData } from '@models/well-design/well-data.model';
import { WwellEntry } from '@models/daily-operation/wwell-entry.model';

const dailyOperationServiceMock = {
  getWellList: jest.fn(),
  getWellDetail: jest.fn(),
  getMorningReport: jest.fn(),
};

const notificationServiceMock = {
  show: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  notifications: jest.fn(() => []),
  dismiss: jest.fn(),
};

function makeWellEntry(epANum: number, wGnrName = `Well-${epANum}`): WwellEntry {
  return { epANum, wGnrName };
}

function makeWellData(wellName: string): IWellData {
  return { RIG_ACTIVITY: [{ wellName }] } as unknown as IWellData;
}

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

describe('MorningReportStore - fault-tolerant well detail fetch', () => {
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

  it('keeps successful wells and does not throw when other wells error or return no data', () => {
    const wellList = [makeWellEntry(101, 'Alpha'), makeWellEntry(102, 'Beta'), makeWellEntry(103, 'Gamma')];
    dailyOperationServiceMock.getWellList.mockReturnValue(of(wellList));
    dailyOperationServiceMock.getWellDetail.mockImplementation((_date: string, epANum: number) => {
      if (epANum === 101) return of(makeWellData('Alpha'));
      if (epANum === 102) return throwError(() => new Error('boom'));
      return of(null);
    });

    expect(() => store.loadMorningReportData('2026-01-01')).not.toThrow();

    expect(store.allWellsData().length).toBe(1);
    expect(store.allWellsData()[0].RIG_ACTIVITY?.[0]?.wellName).toBe('Alpha');
  });

  it('tracks failed wells with epANum, wellName and a failure reason', () => {
    const wellList = [makeWellEntry(101, 'Alpha'), makeWellEntry(102, 'Beta')];
    dailyOperationServiceMock.getWellList.mockReturnValue(of(wellList));
    dailyOperationServiceMock.getWellDetail.mockImplementation((_date: string, epANum: number) =>
      epANum === 101 ? of(makeWellData('Alpha')) : throwError(() => new Error('network down')),
    );

    store.loadMorningReportData('2026-01-01');

    expect(store.failedWells()).toEqual([
      { epANum: 102, wellName: 'Beta', reason: 'network down' },
    ]);
  });

  it('notifies the user with a long duration listing the failed well id when a well fails', () => {
    const wellList = [makeWellEntry(102, 'Beta')];
    dailyOperationServiceMock.getWellList.mockReturnValue(of(wellList));
    dailyOperationServiceMock.getWellDetail.mockReturnValue(throwError(() => new Error('boom')));

    store.loadMorningReportData('2026-01-01');

    expect(notificationServiceMock.error).toHaveBeenCalledWith(
      expect.stringContaining('#102'),
      expect.objectContaining({ durationMs: 15_000 }),
    );
  });

  it('does not notify or record failures when all wells load successfully', () => {
    const wellList = [makeWellEntry(101, 'Alpha')];
    dailyOperationServiceMock.getWellList.mockReturnValue(of(wellList));
    dailyOperationServiceMock.getWellDetail.mockReturnValue(of(makeWellData('Alpha')));

    store.loadMorningReportData('2026-01-01');

    expect(notificationServiceMock.error).not.toHaveBeenCalled();
    expect(store.failedWells()).toEqual([]);
  });
});
