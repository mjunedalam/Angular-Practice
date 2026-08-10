import {
  getCasingTier,
  resolveCompletionBottomDepth,
  resolveCompletionBottomPx,
  resolveCompletionTopDepth,
  resolveOhHalfWidth,
  resolvePrePerforatedLinerDepth,
  resolveShoeDepth,
  shouldRenderGravelPack,
  shouldRenderLinerScreen,
  shouldRenderOpenHole,
  shouldRenderPrePerforatedLiner,
} from './wellbore-depth.helpers';
import { createDepthScale } from '@shared/utils/wellbore-math.util';
import { WellboreTestDataUtil } from '@shared/utils/testing/wellbore-test-data.util';

describe('wellbore-depth.helpers', () => {
  it('uses matching actual casing depth for the deepest structural casing', () => {
    const plannedCasing = WellboreTestDataUtil.casing({ csgSize: '13 3/8', csgDepth: 2020 });
    const actualCasing = WellboreTestDataUtil.drlgCasing({
      wCsgOdSz: '13 3/8',
      wCsgBotDpth: 2220,
    });

    expect(resolveShoeDepth([plannedCasing], [actualCasing])).toBe(2220);
  });

  it('falls back to planned casing depth when actual casing depth is missing', () => {
    const plannedCasing = WellboreTestDataUtil.casing({ csgSize: '13 3/8', csgDepth: 2020 });
    const actualCasing = WellboreTestDataUtil.drlgCasing({
      wCsgOdSz: '13 3/8',
      wCsgBotDpth: 0,
    });

    expect(resolveShoeDepth([plannedCasing], [actualCasing])).toBe(2020);
  });

  it('uses actual liner bottom depth as the completion top when available', () => {
    const liner = WellboreTestDataUtil.liner({ csgDepth: 3430 });
    const actualLiner = WellboreTestDataUtil.drlgCasing({
      wCsgOdSz: '13 3/8',
      wCsgBotDpth: 2020,
      wLnrOdSz: WellboreTestDataUtil.linerSize,
      wLnrBotDepth: 3600,
    });

    expect(resolveCompletionTopDepth([liner], [actualLiner])).toBe(3600);
  });

  it('anchors completion top below a DRLG-only liner when IR has no Liner-typed casing', () => {
    // Mirrors real EXAD_GWD_IR_CASING data where only structural casings are planned
    // (no 'Liner' row), but DRLG_CSG reports an as-drilled liner.
    const structuralCasing = WellboreTestDataUtil.casing({ csgSize: '13 3/8', csgType: 'Casing', csgDepth: 2004 });
    const drlgLinerRow = WellboreTestDataUtil.drlgCasing({
      wCsgOdSz: '13 3/8',
      wCsgBotDpth: 2004,
      wLnrOdSz: '7',
      wLnrTopDepth: 1872,
      wLnrBotDepth: 3146,
    });

    expect(resolveCompletionTopDepth([structuralCasing], [drlgLinerRow])).toBe(3146);
  });

  it('draws completion to total depth when current depth does not exceed planned target', () => {
    const data = WellboreTestDataUtil.diagramData({
      totalDepth: WellboreTestDataUtil.plannedTargetDepthFt,
      displayDepth: WellboreTestDataUtil.plannedTargetDepthFt + WellboreTestDataUtil.displayDepthPaddingFt,
      currentDepth: WellboreTestDataUtil.plannedTargetDepthFt,
    });

    expect(resolveCompletionBottomDepth(data)).toBe(WellboreTestDataUtil.plannedTargetDepthFt);
  });

  it('uses a static completion span when current depth exceeds planned target depth', () => {
    const data = WellboreTestDataUtil.diagramData({
      totalDepth: WellboreTestDataUtil.currentDepthBeyondTargetFt,
      displayDepth: WellboreTestDataUtil.currentDepthBeyondTargetFt + WellboreTestDataUtil.displayDepthPaddingFt,
      currentDepth: WellboreTestDataUtil.currentDepthBeyondTargetFt,
    });
    const expectedBottomDepth =
      WellboreTestDataUtil.linerDepthFt + WellboreTestDataUtil.overrunCompletionLengthFt;

    expect(resolveCompletionBottomDepth(data)).toBe(expectedBottomDepth);
  });

  it('clamps completion bottom to total depth when it is shorter than the overrun span', () => {
    const data = WellboreTestDataUtil.diagramData({
      totalDepth: 4100,
      displayDepth: 4200,
      currentDepth: WellboreTestDataUtil.currentDepthBeyondTargetFt,
    });

    expect(resolveCompletionBottomDepth(data)).toBe(4100);
  });

  it('maps resolved completion bottom depth through the supplied scale', () => {
    const data = WellboreTestDataUtil.diagramData({
      totalDepth: WellboreTestDataUtil.currentDepthBeyondTargetFt,
      displayDepth: WellboreTestDataUtil.currentDepthBeyondTargetFt + WellboreTestDataUtil.displayDepthPaddingFt,
      currentDepth: WellboreTestDataUtil.currentDepthBeyondTargetFt,
    });
    const scale = createDepthScale(7000, 700);

    expect(resolveCompletionBottomPx(data, scale)).toBeCloseTo(463, 3);
  });

  it('sizes open hole from remarks when the open-hole diameter is smaller than innermost casing', () => {
    const layout = WellboreTestDataUtil.layout({
      baseHalfWidth: 72,
      halfWidthIncrement: 26,
      openHoleHwMargin: 25,
    });
    const data = WellboreTestDataUtil.diagramData({
      casings: [WellboreTestDataUtil.casing({ csgSize: '9 5/8' })],
      drlgCasings: [],
      wellDesign: WellboreTestDataUtil.wellDesign({ ohFlg: 'Y', ohRemarks: '8 1/2' }),
    });

    expect(resolveOhHalfWidth(data, layout)).toBeCloseTo(63.584, 3);
  });

  it('falls back to layout margin when open-hole flag is not enabled', () => {
    const layout = WellboreTestDataUtil.layout({
      baseHalfWidth: 72,
      openHoleHwMargin: 25,
    });
    const data = WellboreTestDataUtil.diagramData({
      wellDesign: WellboreTestDataUtil.wellDesign({ ohFlg: 'N' }),
    });

    expect(resolveOhHalfWidth(data, layout)).toBe(97);
  });

  it('excludes gravel pack entries when resolving casing tier', () => {
    const casing = WellboreTestDataUtil.casing({ csgSize: '13 3/8', csgDepth: 2020 });
    const liner = WellboreTestDataUtil.liner();
    const gravelPack = WellboreTestDataUtil.gravelPack();

    expect(getCasingTier(liner, [liner, gravelPack, casing])).toBe(0);
    expect(getCasingTier(casing, [liner, gravelPack, casing])).toBe(1);
  });

  describe('shouldRenderOpenHole', () => {
    it('returns true when ohFlg is Y and ohRemarks has a parseable size', () => {
      expect(shouldRenderOpenHole(WellboreTestDataUtil.wellDesign({ ohFlg: 'Y', ohRemarks: '8 1/2' }))).toBe(true);
    });

    it('returns true when ohFlg is lowercase y', () => {
      expect(shouldRenderOpenHole(WellboreTestDataUtil.wellDesign({ ohFlg: 'y', ohRemarks: '8 1/2' }))).toBe(true);
    });

    it('returns false when ohRemarks has no parseable size', () => {
      expect(shouldRenderOpenHole(WellboreTestDataUtil.wellDesign({ ohFlg: 'Y', ohRemarks: 'TBD' }))).toBe(false);
    });

    it('returns false when ohRemarks is null', () => {
      expect(shouldRenderOpenHole(WellboreTestDataUtil.wellDesign({ ohFlg: 'Y', ohRemarks: null }))).toBe(false);
    });

    it('returns false when ohRemarks is empty', () => {
      expect(shouldRenderOpenHole(WellboreTestDataUtil.wellDesign({ ohFlg: 'Y', ohRemarks: '   ' }))).toBe(false);
    });

    it('returns false when ohFlg is N', () => {
      expect(shouldRenderOpenHole(WellboreTestDataUtil.wellDesign({ ohFlg: 'N', ohRemarks: '8 1/2' }))).toBe(false);
    });

    it('returns false when ohFlg is null', () => {
      expect(shouldRenderOpenHole(WellboreTestDataUtil.wellDesign({ ohFlg: null, ohRemarks: '8 1/2' }))).toBe(false);
    });

    it('returns false when wellDesign is null', () => {
      expect(shouldRenderOpenHole(null)).toBe(false);
    });
  });

  describe('shouldRenderGravelPack', () => {
    it('returns true when gpFlg is Y and gpRemarks has text', () => {
      expect(shouldRenderGravelPack(WellboreTestDataUtil.wellDesign({ gpFlg: 'Y', gpRemarks: '6" Gravel Pack' }))).toBe(true);
    });

    it('returns false when gpRemarks is null', () => {
      expect(shouldRenderGravelPack(WellboreTestDataUtil.wellDesign({ gpFlg: 'Y', gpRemarks: null }))).toBe(false);
    });

    it('returns false when gpRemarks is empty', () => {
      expect(shouldRenderGravelPack(WellboreTestDataUtil.wellDesign({ gpFlg: 'Y', gpRemarks: '  ' }))).toBe(false);
    });

    it('returns false when gpFlg is "no"', () => {
      expect(shouldRenderGravelPack(WellboreTestDataUtil.wellDesign({ gpFlg: 'no', gpRemarks: '6" Gravel Pack' }))).toBe(false);
    });

    it('returns false when wellDesign is null', () => {
      expect(shouldRenderGravelPack(null)).toBe(false);
    });
  });

  describe('shouldRenderLinerScreen', () => {
    it('returns true when lsFlg is Y and lsRemarks has text', () => {
      expect(shouldRenderLinerScreen(WellboreTestDataUtil.wellDesign({ lsFlg: 'Y', lsRemarks: 'Screen' }))).toBe(true);
    });

    it('returns false when lsRemarks is null', () => {
      expect(shouldRenderLinerScreen(WellboreTestDataUtil.wellDesign({ lsFlg: 'Y', lsRemarks: null }))).toBe(false);
    });

    it('returns false when lsFlg is N', () => {
      expect(shouldRenderLinerScreen(WellboreTestDataUtil.wellDesign({ lsFlg: 'N', lsRemarks: 'Screen' }))).toBe(false);
    });

    it('returns false when wellDesign is null', () => {
      expect(shouldRenderLinerScreen(null)).toBe(false);
    });
  });

  describe('resolvePrePerforatedLinerDepth', () => {
    it('resolves the matching 7" DRLG_CSG liner depths when all three conditions pass', () => {
      const wellDesign = WellboreTestDataUtil.wellDesign({
        perforatedFlg: 'Y',
        perforatedRemarks: '+/- 400 ft of 7" pre-perforated liner',
      });
      const drlgCasings = [
        WellboreTestDataUtil.drlgCasing({
          wCsgOdSz: '13 3/8',
          wCsgBotDpth: 2020,
          wLnrOdSz: '7',
          wLnrTopDepth: 3430,
          wLnrBotDepth: 3830,
        }),
      ];

      expect(resolvePrePerforatedLinerDepth(wellDesign, drlgCasings)).toEqual({
        odSz: '7',
        topDepth: 3430,
        botDepth: 3830,
      });
    });

    it('falls back to the casing shoe depth when wLnrTopDepth is missing', () => {
      const wellDesign = WellboreTestDataUtil.wellDesign({
        perforatedFlg: 'Y',
        perforatedRemarks: '7" perforated liner',
      });
      const drlgCasings = [
        WellboreTestDataUtil.drlgCasing({
          wCsgOdSz: '13 3/8',
          wCsgBotDpth: 2020,
          wLnrOdSz: '7',
          wLnrTopDepth: null,
          wLnrBotDepth: 3830,
        }),
      ];

      expect(resolvePrePerforatedLinerDepth(wellDesign, drlgCasings)?.topDepth).toBe(2020);
    });

    it('returns null when perforatedFlg is not Y', () => {
      const wellDesign = WellboreTestDataUtil.wellDesign({
        perforatedFlg: 'N',
        perforatedRemarks: '7" perforated liner',
      });
      const drlgCasings = [
        WellboreTestDataUtil.drlgCasing({ wLnrOdSz: '7', wLnrBotDepth: 3830 }),
      ];

      expect(resolvePrePerforatedLinerDepth(wellDesign, drlgCasings)).toBeNull();
    });

    it('returns null when perforatedRemarks does not reference a 7" size', () => {
      const wellDesign = WellboreTestDataUtil.wellDesign({
        perforatedFlg: 'Y',
        perforatedRemarks: 'Perforated interval, size TBD',
      });
      const drlgCasings = [
        WellboreTestDataUtil.drlgCasing({ wLnrOdSz: '7', wLnrBotDepth: 3830 }),
      ];

      expect(resolvePrePerforatedLinerDepth(wellDesign, drlgCasings)).toBeNull();
    });

    it('returns null when no DRLG_CSG liner reports a 7" OD', () => {
      const wellDesign = WellboreTestDataUtil.wellDesign({
        perforatedFlg: 'Y',
        perforatedRemarks: '7" perforated liner',
      });
      const drlgCasings = [
        WellboreTestDataUtil.drlgCasing({ wLnrOdSz: '5 1/2', wLnrBotDepth: 3830 }),
      ];

      expect(resolvePrePerforatedLinerDepth(wellDesign, drlgCasings)).toBeNull();
    });

    it('returns null when the matching 7" liner has no valid bottom depth', () => {
      const wellDesign = WellboreTestDataUtil.wellDesign({
        perforatedFlg: 'Y',
        perforatedRemarks: '7" perforated liner',
      });
      const drlgCasings = [
        WellboreTestDataUtil.drlgCasing({ wLnrOdSz: '7', wLnrBotDepth: 0 }),
      ];

      expect(resolvePrePerforatedLinerDepth(wellDesign, drlgCasings)).toBeNull();
    });

    it('returns null when wellDesign is null', () => {
      expect(resolvePrePerforatedLinerDepth(null, [])).toBeNull();
    });
  });

  describe('shouldRenderPrePerforatedLiner', () => {
    it('returns true when perforatedFlg is Y, perforatedRemarks references 7", and a 7" DRLG_CSG liner exists', () => {
      const wellDesign = WellboreTestDataUtil.wellDesign({
        perforatedFlg: 'Y',
        perforatedRemarks: '7" perforated liner',
      });
      const drlgCasings = [
        WellboreTestDataUtil.drlgCasing({ wLnrOdSz: '7', wLnrBotDepth: 3830 }),
      ];

      expect(shouldRenderPrePerforatedLiner(wellDesign, drlgCasings)).toBe(true);
    });

    it('returns false when perforatedRemarks has text but does not reference 7"', () => {
      const wellDesign = WellboreTestDataUtil.wellDesign({
        perforatedFlg: 'Y',
        perforatedRemarks: 'Perforated',
      });
      const drlgCasings = [
        WellboreTestDataUtil.drlgCasing({ wLnrOdSz: '7', wLnrBotDepth: 3830 }),
      ];

      expect(shouldRenderPrePerforatedLiner(wellDesign, drlgCasings)).toBe(false);
    });

    it('returns false when no matching DRLG_CSG liner is passed', () => {
      const wellDesign = WellboreTestDataUtil.wellDesign({
        perforatedFlg: 'Y',
        perforatedRemarks: '7" perforated liner',
      });

      expect(shouldRenderPrePerforatedLiner(wellDesign)).toBe(false);
    });

    it('returns false when perforatedFlg is null', () => {
      const drlgCasings = [
        WellboreTestDataUtil.drlgCasing({ wLnrOdSz: '7', wLnrBotDepth: 3830 }),
      ];

      expect(shouldRenderPrePerforatedLiner(
        WellboreTestDataUtil.wellDesign({ perforatedFlg: null, perforatedRemarks: '7" perforated liner' }),
        drlgCasings,
      )).toBe(false);
    });

    it('returns false when wellDesign is null', () => {
      expect(shouldRenderPrePerforatedLiner(null)).toBe(false);
    });
  });
});
