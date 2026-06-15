import {
  PAGE_SIZE,
  selectDiagramData,
  selectDisplayDepth,
  selectHasNextPage,
  selectHasPrevPage,
  selectPageIndexForEpANum,
  selectPagedWellNames,
  selectTotalDepth,
  selectTotalPages,
  selectWellNamesFromList,
} from './well-data.selectors';
import { WellboreTestDataUtil } from '@shared/utils/testing/wellbore-test-data.util';

describe('well-data.selectors', () => {
  it('maps only entries with positive epANum values into well names', () => {
    const names = selectWellNamesFromList([
      { wGnrName: 'A', epANum: 101 },
      { wGnrName: 'B', epANum: 0 },
      { wGnrName: 'C', epANum: -1 },
      { wGnrName: 'D', epANum: 202 },
    ]);

    expect(names).toEqual([
      { wellName: 'A', epANum: 101 },
      { wellName: 'D', epANum: 202 },
    ]);
  });

  it('calculates page metadata from the shared page size', () => {
    const names = Array.from({ length: PAGE_SIZE + 1 }, (_, index) => ({
      wellName: `Well-${index}`,
      epANum: index + 1,
    }));

    expect(selectTotalPages(names)).toBe(2);
    expect(selectPagedWellNames(names, 0)).toHaveLength(PAGE_SIZE);
    expect(selectPageIndexForEpANum(names, PAGE_SIZE + 1)).toBe(1);
    expect(selectHasPrevPage(1)).toBe(true);
    expect(selectHasNextPage(names, 0)).toBe(true);
    expect(selectHasNextPage(names, 1)).toBe(false);
  });

  it('uses current depth as total depth when it exceeds planned target depth', () => {
    const wellData = WellboreTestDataUtil.wellData({
      DRLG_OP_STATUS: [
        WellboreTestDataUtil.drillingStatus({
          wPrsntDpth: WellboreTestDataUtil.currentDepthBeyondTargetFt,
        }),
      ],
      EXAD_RCD_PREWAP: [
        WellboreTestDataUtil.preWellData({
          estTargetDepth: WellboreTestDataUtil.plannedTargetDepthFt,
        }),
      ],
    });

    expect(selectTotalDepth(wellData)).toBe(WellboreTestDataUtil.currentDepthBeyondTargetFt);
  });

  it('adds minimum display padding above total depth and geologic layer depths', () => {
    const deepestLayerDepth = 7200;
    const wellData = WellboreTestDataUtil.wellData({
      DRLG_OP_STATUS: [
        WellboreTestDataUtil.drillingStatus({
          wPrsntDpth: WellboreTestDataUtil.currentDepthBeyondTargetFt,
        }),
      ],
      EXAD_GWD_IR_TOPS: [
        WellboreTestDataUtil.plannedTop({
          stLongCd: 'DEEP',
          planTvdDepth: deepestLayerDepth,
          planSsDepth: deepestLayerDepth,
        }),
      ],
      DRLG_FM_TOPS: [
        WellboreTestDataUtil.actualTop({
          stLongCd: 'ACTUAL',
          wStDmrkDpth: 6900,
        }),
      ],
    });

    expect(selectDisplayDepth(wellData)).toBe(
      deepestLayerDepth + WellboreTestDataUtil.displayDepthPaddingFt,
    );
  });

  it('builds sorted diagram data with current and display depths', () => {
    const shallowCasing = WellboreTestDataUtil.casing({ csgSize: '13 3/8', csgDepth: 2020 });
    const deepLiner = WellboreTestDataUtil.liner({ csgDepth: WellboreTestDataUtil.linerDepthFt });
    const shallowTop = WellboreTestDataUtil.plannedTop({
      stLongCd: 'JILH',
      planTvdDepth: 690,
      planSsDepth: 690,
    });
    const deepTop = WellboreTestDataUtil.plannedTop({
      stLongCd: 'TWLF',
      planTvdDepth: 6500,
      planSsDepth: 6500,
    });
    const currentDepth = WellboreTestDataUtil.currentDepthBeyondTargetFt;
    const wellData = WellboreTestDataUtil.wellData({
      EXAD_GWD_IR_CASING: [shallowCasing, deepLiner],
      DRLG_CSG: [
        WellboreTestDataUtil.drlgCasing({ wCsgOdSz: '13 3/8', wCsgBotDpth: 2020 }),
        WellboreTestDataUtil.drlgCasing({ wCsgOdSz: '9 5/8', wCsgBotDpth: 3430 }),
      ],
      EXAD_GWD_IR_TOPS: [deepTop, shallowTop],
      DRLG_OP_STATUS: [
        WellboreTestDataUtil.drillingStatus({
          wPrsntDpth: currentDepth,
        }),
      ],
      EXAD_RCD_PREWAP: [
        WellboreTestDataUtil.preWellData({
          estTargetDepth: WellboreTestDataUtil.plannedTargetDepthFt,
        }),
      ],
    });

    const diagramData = selectDiagramData(wellData);

    expect(diagramData).not.toBeNull();
    expect(diagramData?.totalDepth).toBe(currentDepth);
    expect(diagramData?.displayDepth).toBe(currentDepth + WellboreTestDataUtil.displayDepthPaddingFt);
    expect(diagramData?.currentDepth).toBe(currentDepth);
    expect(diagramData?.casings.map(casing => casing.csgDepth)).toEqual([3430, 2020]);
    expect(diagramData?.drlgCasings.map(casing => casing.wCsgBotDpth)).toEqual([3430, 2020]);
    expect(diagramData?.geologicTops.map(top => top.planTvdDepth)).toEqual([690, 6500]);
  });
});
