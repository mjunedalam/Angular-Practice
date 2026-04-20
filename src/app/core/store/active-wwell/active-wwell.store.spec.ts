import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { WellStore } from '@store/active-wwell/active-wwell.store';
import { WellDataService } from 'src/app/core/services/well-data.service';
import { MorningReportService } from 'src/app/core/services/morning-report.service';
import { of, throwError } from 'rxjs';

type WellStoreInstance = InstanceType<typeof WellStore>;
interface WellDataServiceMock {
  getWellDetails: jest.Mock;
}
interface MorningReportServiceMock {
  getMorningReport: jest.Mock;
}

describe('WellStore', () => {
  let store: WellStoreInstance;
  let wellDataServiceMock: WellDataServiceMock;
  let morningReportServiceMock: MorningReportServiceMock;

  beforeEach(() => {
    wellDataServiceMock = {
      getWellDetails: jest.fn()
    };
    morningReportServiceMock = {
      getMorningReport: jest.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        WellStore,
        { provide: WellDataService, useValue: wellDataServiceMock },
        { provide: MorningReportService, useValue: morningReportServiceMock }
      ]
    });

    store = TestBed.inject(WellStore);
  });

  it('should be created with initial state', () => {
    expect(store.wellNames()).toEqual([]);
    expect(store.selectedEpANum()).toBeNull();
    expect(store.wellDetails()).toBeNull();
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.animationTrigger()).toBe(0);
    expect(store.wellNamesPage()).toBe(0);
  });

  describe('selectWell', () => {
    it('should load well details on selectWell success', fakeAsync(() => {
      const mockDetails = { EXAD_RCD_PREWAP: [{ estTargetDepth: 1234 }] };
      wellDataServiceMock.getWellDetails.mockReturnValue(of(mockDetails));

      store.selectWell({ epANum: 100, date: '2026-04-16' });
      tick(1000);
      tick();

      expect(store.selectedEpANum()).toBe(100);
      expect(store.loading()).toBe(false);
      expect(store.wellDetails()).toEqual(mockDetails);
      expect(store.animationTrigger()).toBe(1);
      expect(store.error()).toBeNull();
    }));

    it('should handle selectWell error', fakeAsync(() => {
      wellDataServiceMock.getWellDetails.mockReturnValue(throwError(() => new Error('Error Loading Details')));

      store.selectWell({ epANum: 100, date: '2026-04-16' });
      tick(1000);
      tick();

      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Error Loading Details');
    }));
  });

  describe('loadWellNames', () => {
    it('should load well names and auto-select the first well', fakeAsync(() => {
      const mockReports = [
        { wGnrName: 'Well 1', epANum: '10' },
        { wGnrName: 'Well 2', epANum: '20' }
      ];
      morningReportServiceMock.getMorningReport.mockReturnValue(of(mockReports));
      wellDataServiceMock.getWellDetails.mockReturnValue(of({}));

      store.loadWellNames();

      expect(store.loading()).toBe(true);

      tick(1000);

      expect(store.wellNames()).toEqual([
        { wellName: 'Well 1', epANum: 10 },
        { wellName: 'Well 2', epANum: 20 }
      ]);

      expect(store.selectedEpANum()).toBe(10);
      tick(1000);
      tick();
    }));

    it('should handle loadWellNames error correctly', fakeAsync(() => {
      morningReportServiceMock.getMorningReport.mockReturnValue(throwError(() => new Error('Load Error')));

      store.loadWellNames();
      tick(1000);

      expect(store.loading()).toBe(false);
      expect(store.error()).toBe('Load Error');
    }));
  });

  describe('pagination methods', () => {
    it('should update wellNamesPage and call selectWell on nextPage and prevPage', fakeAsync(() => {
      const mockReports = Array.from({ length: 15 }).map((_, i) => ({ wGnrName: `Well ${i}`, epANum: `${i}` }));
      morningReportServiceMock.getMorningReport.mockReturnValue(of(mockReports));
      wellDataServiceMock.getWellDetails.mockReturnValue(of({}));

      store.loadWellNames();
      tick(1000);
      tick();
      tick(1000);
      tick();

      expect(store.wellNamesPage()).toBe(0);
      expect(store.selectedEpANum()).toBe(0);

      store.nextPage();
      tick(1000);
      tick();
      expect(store.wellNamesPage()).toBe(1);

      store.prevPage();
      tick(1000);
      tick();
      expect(store.wellNamesPage()).toBe(0);
    }));
  });
});
