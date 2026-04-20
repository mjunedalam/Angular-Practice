import {
  uniqueByEpANum,
  selectTotalPages,
  selectPagedWellNames,
  selectHasPrevPage,
  selectHasNextPage,
  selectTotalDepth,
  selectDiagramData,
  selectMiscWellData,
  selectPickedFormations,
  selectOffsetWells,
  selectWellLogsIndicators,
  selectWellTestResults,
  PAGE_SIZE,
  FALLBACK_STR
} from '@store/active-wwell/active-wwell.selectors';
import { IWellData } from 'src/app/core/models/well-design/well-data.model';
import { WellName } from 'src/app/core/models/well-design/well-name.model';
import { expect, it, describe } from '@jest/globals';

describe('Well Selectors', () => {
  describe('uniqueByEpANum', () => {
    it('should return unique wells by epANum', () => {
      const names: WellName[] = [
        { wellName: 'A', epANum: 1 },
        { wellName: 'B', epANum: 2 },
        { wellName: 'A', epANum: 1 }
      ];
      const result = uniqueByEpANum(names);
      expect(result).toEqual([{ wellName: 'A', epANum: 1 }, { wellName: 'B', epANum: 2 }]);
    });
  });

  describe('selectTotalPages', () => {
    it('should calculate total pages correctly', () => {
      expect(selectTotalPages(new Array(0))).toBe(0);
      expect(selectTotalPages(new Array(1))).toBe(1);
      expect(selectTotalPages(new Array(PAGE_SIZE))).toBe(1);
      expect(selectTotalPages(new Array(PAGE_SIZE + 1))).toBe(2);
    });
  });

  describe('selectPagedWellNames', () => {
    it('should slice the array correctly', () => {
      const items = new Array(10).fill(0).map((_, i) => ({ wellName: `${i}`, epANum: i }));
      expect(selectPagedWellNames(items, 0).length).toBe(PAGE_SIZE);
      expect(selectPagedWellNames(items, 1).length).toBe(10 - PAGE_SIZE);
    });
  });

  describe('selectHasPrevPage', () => {
    it('should return true if page > 0', () => {
      expect(selectHasPrevPage(0)).toBe(false);
      expect(selectHasPrevPage(1)).toBe(true);
    });
  });

  describe('selectHasNextPage', () => {
    it('should return true if more items left', () => {
      const items = new Array(10).fill(0);
      expect(selectHasNextPage(items, 0)).toBe(true);
      expect(selectHasNextPage(items, 1)).toBe(false);
    });
  });

  describe('selectTotalDepth', () => {
    it('should return 0 when d is null or missing PREWAP', () => {
      expect(selectTotalDepth(null)).toBe(0);
      expect(selectTotalDepth({} as IWellData)).toBe(0);
    });

    it('should return estTargetDepth when valid', () => {
      expect(selectTotalDepth({ EXAD_RCD_PREWAP: [{ estTargetDepth: 1000 }] } as IWellData)).toBe(1000);
    });
  });

  describe('selectDiagramData', () => {
    it('should return null when input is null', () => {
      expect(selectDiagramData(null)).toBeNull();
    });

    it('should map the diagram data correctly', () => {
      const mockData = {
        WELL_MASTER: [{ well: 'TestWell' }],
        EXAD_RCD_PREWAP: [{ estTargetDepth: 1500 }],
        DRLG_OP_STATUS: [{ wPrsntDpth: 1400 }]
      } as unknown as IWellData;

      const res = selectDiagramData(mockData);
      expect(res?.wellName).toBe('TestWell');
      expect(res?.totalDepth).toBe(1500);
      expect(res?.currentDepth).toBe(1400);
    });
  });

  describe('selectMiscWellData', () => {
    it('should return null if d is null', () => {
      expect(selectMiscWellData(null)).toBeNull();
    });

    it('should provide fallbacks', () => {
      const data = selectMiscWellData({} as IWellData);
      expect(data?.wellName).toBe(FALLBACK_STR);
      expect(data?.targetDesc).toBe(FALLBACK_STR);
      expect(data?.targetedAquifer).toBe(FALLBACK_STR);
      expect(data?.currentStatus).toBe(FALLBACK_STR);
    });

    it('should map values correctly', () => {
      const mockData = {
        RIG_ACTIVITY: [{
           wellName: 'TestWell',
           drlgPlanWellDesc: 'Desc',
           wDrlgTrgtDay: 10,
           biNum: 'BI-1',
           waterWell: 'WW-1'
        }],
        DRLG_OP_STATUS: [{
           nxt24HrPlanRmk: 'Rmk',
           spuddays: 5,
           wPrsntDpth: 5000,
           wDpthChgDis: 100,
           footage: 150
        }],
        EXAD_GWD_IR_HYDROGEOLOGY: [{ estTargetAquifier: 'Aq' }],
      } as unknown as IWellData;
      const data = selectMiscWellData(mockData);
      expect(data).toEqual(expect.objectContaining({
        wellName: 'TestWell',
        targetDesc: 'Desc',
        targetedAquifer: 'Aq',
        currentStatus: FALLBACK_STR,
        daysSinceSpud: 5,
        targetDays: 10,
        biNum: 'BI-1',
        supportingWell: 'WW-1',
        feetDrilledToday: 150,
        previousWell: FALLBACK_STR,
        currentDepth: 5000,
        nextWell: FALLBACK_STR,
        footage: 100,
        operationSummary: FALLBACK_STR,
        next24HrOperation: 'Rmk',
      }));
    });
  });

  describe('selectPickedFormations', () => {
    it('should map correctly', () => {
       const mock = { DRLG_FM_TOPS: [{ stLongCd: 'FM1', wStDmrkDpth: 100, wStDmrkRmk: 'Rm' }] } as unknown as IWellData;
       const res = selectPickedFormations(mock);
       expect(res.length).toBe(1);
       expect(res[0]).toEqual({ formation: 'FM1', depth: 100, remarks: 'Rm' });
    });
  });

  describe('selectOffsetWells', () => {
    it('should map correctly to OffsetWaterWells list', () => {
      const mock = {
        EXAD_GWD_IR_WATER: [{ offsetWaterWell: 'W-1', specificCapacity: 5 }],
        WATER_WELL_TEST_OUTCOME: [{ wellName: 'W-1', flowRate: 50 }]
      } as unknown as IWellData;

      const res = selectOffsetWells(mock);
      expect(res.length).toBe(1);
      expect(res[0].wellName).toBe('W-1');
      expect(res[0].rate).toBe(50);
      expect(res[0].productivity).toBe(5);
    });
  });

  describe('selectWellLogsIndicators', () => {
    it('should correctly identify boolean indicators based on string trim', () => {
       const mock = { EXAD_GWD_IR_HEADER: [{ dtRemarks: ' yes ', mudRemarks: ' ', loggingRemarks: null }] } as unknown as IWellData;
       const res = selectWellLogsIndicators(mock);
       expect(res).toEqual({ rcc: true, mudLog: false, logging: false });
    });
  });

  describe('selectWellTestResults', () => {
    it('should map well test outcomes correctly', () => {
      const mock = {
        WATER_WELL_TEST_OUTCOME: [{ testType: 'Type-A', flowRate: 400 }]
      } as unknown as IWellData;

      const res = selectWellTestResults(mock);
      expect(res.length).toBe(1);
      expect(res[0].testType).toBe('Type-A');
      expect(res[0].flowRate).toBe(400);
    });
  });
});
