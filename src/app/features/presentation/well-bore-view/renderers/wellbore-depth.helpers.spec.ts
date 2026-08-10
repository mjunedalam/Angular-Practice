import {
  getCasingTier,
  resolveCompletionBottomDepth,
  resolveCompletionBottomPx,
  resolveCompletionTopDepth,
  resolveOhHalfWidth,
  resolvePerforatedIntervalInfo,
  resolveShoeDepth,
  shouldRenderGravelPack,
  shouldRenderLinerScreen,
  shouldRenderOpenHole,
  shouldRenderPerforatedInterval,
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

  it('anchors completion top at the last casing shoe when a 7" liner is the completion target', () => {
    // Rule 2 standard evaluation ('single'): start depth is the casing shoe the liner
    // hangs from, not the liner's own bottom — the liner is drawn within that interval,
    // not below it.
    const liner = WellboreTestDataUtil.liner({ csgDepth: 3430 });
    const actualLiner = WellboreTestDataUtil.drlgCasing({
      wCsgOdSz: '13 3/8',
      wCsgBotDpth: 2020,
      wLnrOdSz: WellboreTestDataUtil.linerSize,
      wLnrBotDepth: 3600,
    });

    expect(resolveCompletionTopDepth([liner], [actualLiner])).toBe(2020);
  });

  it('anchors completion top at the casing shoe for a DRLG-only liner when IR has no Liner-typed casing', () => {
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

    expect(resolveCompletionTopDepth([structuralCasing], [drlgLinerRow])).toBe(2004);
  });

  it('draws completion to total depth when current depth does not exceed planned target', () => {
    // A non-7" liner takes the 'single-fallback' rule (Rule 2's non-target liner), the
    // only kind that runs the total-depth/overrun logic under test here — the default
    // fixture's 7" liner would instead resolve to its own fixed shoe depth.
    const data = WellboreTestDataUtil.diagramData({
      casings: [WellboreTestDataUtil.liner({ csgSize: '9 5/8' })],
      drlgCasings: [],
      totalDepth: WellboreTestDataUtil.plannedTargetDepthFt,
      displayDepth: WellboreTestDataUtil.plannedTargetDepthFt + WellboreTestDataUtil.displayDepthPaddingFt,
      currentDepth: WellboreTestDataUtil.plannedTargetDepthFt,
    });

    expect(resolveCompletionBottomDepth(data)).toBe(WellboreTestDataUtil.plannedTargetDepthFt);
  });

  it('uses a static completion span when current depth exceeds planned target depth', () => {
    const data = WellboreTestDataUtil.diagramData({
      casings: [WellboreTestDataUtil.liner({ csgSize: '9 5/8' })],
      drlgCasings: [],
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
      casings: [WellboreTestDataUtil.liner({ csgSize: '9 5/8' })],
      drlgCasings: [],
      totalDepth: 4100,
      displayDepth: 4200,
      currentDepth: WellboreTestDataUtil.currentDepthBeyondTargetFt,
    });

    expect(resolveCompletionBottomDepth(data)).toBe(4100);
  });

  it('maps resolved completion bottom depth through the supplied scale', () => {
    const data = WellboreTestDataUtil.diagramData({
      casings: [WellboreTestDataUtil.liner({ csgSize: '9 5/8' })],
      drlgCasings: [],
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

  it('nests open hole inside a non-7" liner when no 7" target liner exists (single-fallback)', () => {
    const layout = WellboreTestDataUtil.layout({
      baseHalfWidth: 72,
      halfWidthIncrement: 26,
      openHoleHwMargin: 25,
    });
    const data = WellboreTestDataUtil.diagramData({
      casings: [
        WellboreTestDataUtil.liner({ csgSize: '9 5/8', csgDepth: 3430 }),
        WellboreTestDataUtil.casing({ csgSize: '13 3/8', csgDepth: 2020 }),
      ],
      drlgCasings: [],
      wellDesign: WellboreTestDataUtil.wellDesign({ ohFlg: 'Y', ohRemarks: '8 1/2' }),
    });

    // Boundary liner (9 5/8") half-width is 58 (72 - 14 decrement); open hole (8.5") is
    // narrower than the liner, so it must render smaller than 58, not equal to it.
    const ohHalfWidth = resolveOhHalfWidth(data, layout);
    expect(ohHalfWidth).toBeLessThan(58);
    expect(ohHalfWidth).toBeCloseTo(58 * (8.5 / 9.625), 3);
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

    // ohRemarks is free text used only for label copy downstream (see completion.renderer)
    // — it must never gate visibility, so a missing/unparseable value still renders when
    // the flag opts in.
    it('returns true when ohRemarks has no parseable size', () => {
      expect(shouldRenderOpenHole(WellboreTestDataUtil.wellDesign({ ohFlg: 'Y', ohRemarks: 'TBD' }))).toBe(true);
    });

    it('returns true when ohRemarks is null', () => {
      expect(shouldRenderOpenHole(WellboreTestDataUtil.wellDesign({ ohFlg: 'Y', ohRemarks: null }))).toBe(true);
    });

    it('returns true when ohRemarks is empty', () => {
      expect(shouldRenderOpenHole(WellboreTestDataUtil.wellDesign({ ohFlg: 'Y', ohRemarks: '   ' }))).toBe(true);
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

    // gpRemarks is free text used only for label copy — it must never gate visibility.
    it('returns true when gpRemarks is null', () => {
      expect(shouldRenderGravelPack(WellboreTestDataUtil.wellDesign({ gpFlg: 'Y', gpRemarks: null }))).toBe(true);
    });

    it('returns true when gpRemarks is empty', () => {
      expect(shouldRenderGravelPack(WellboreTestDataUtil.wellDesign({ gpFlg: 'Y', gpRemarks: '  ' }))).toBe(true);
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

    // lsRemarks is free text used only for label copy — it must never gate visibility.
    it('returns true when lsRemarks is null', () => {
      expect(shouldRenderLinerScreen(WellboreTestDataUtil.wellDesign({ lsFlg: 'Y', lsRemarks: null }))).toBe(true);
    });

    it('returns false when lsFlg is N', () => {
      expect(shouldRenderLinerScreen(WellboreTestDataUtil.wellDesign({ lsFlg: 'N', lsRemarks: 'Screen' }))).toBe(false);
    });

    it('returns false when wellDesign is null', () => {
      expect(shouldRenderLinerScreen(null)).toBe(false);
    });
  });

  describe('resolvePerforatedIntervalInfo', () => {
    it('resolves the qualifying 7" liner OD when perforatedFlg is Y and a 7" liner is the completion target', () => {
      const wellDesign = WellboreTestDataUtil.wellDesign({
        perforatedFlg: 'Y',
        perforatedRemarks: '+/- 400 ft of 7" pre-perforated liner',
      });
      const casings = [WellboreTestDataUtil.liner({ csgSize: '7', csgDepth: 3830 })];

      expect(resolvePerforatedIntervalInfo(wellDesign, casings, [])).toEqual({ linerOdSz: '7' });
    });

    it('resolves a null liner OD when perforatedFlg is Y but no liner qualifies as the 7" target', () => {
      const wellDesign = WellboreTestDataUtil.wellDesign({
        perforatedFlg: 'Y',
        perforatedRemarks: '7" perforated liner',
      });
      const casings = [WellboreTestDataUtil.casing({ csgSize: '13 3/8', csgDepth: 2020 })];

      expect(resolvePerforatedIntervalInfo(wellDesign, casings, [])).toEqual({ linerOdSz: null });
    });

    it('returns null when perforatedFlg is not Y', () => {
      const wellDesign = WellboreTestDataUtil.wellDesign({
        perforatedFlg: 'N',
        perforatedRemarks: '7" perforated liner',
      });
      const casings = [WellboreTestDataUtil.liner({ csgSize: '7', csgDepth: 3830 })];

      expect(resolvePerforatedIntervalInfo(wellDesign, casings, [])).toBeNull();
    });

    it('returns null when perforatedFlg is null', () => {
      const wellDesign = WellboreTestDataUtil.wellDesign({
        perforatedFlg: null,
        perforatedRemarks: '7" perforated liner',
      });

      expect(resolvePerforatedIntervalInfo(wellDesign, [], [])).toBeNull();
    });

    it('returns null when wellDesign is null', () => {
      expect(resolvePerforatedIntervalInfo(null, [], [])).toBeNull();
    });
  });

  describe('shouldRenderPerforatedInterval', () => {
    it('returns true when perforatedFlg is Y and a 7" liner is the completion target', () => {
      const wellDesign = WellboreTestDataUtil.wellDesign({
        perforatedFlg: 'Y',
        perforatedRemarks: '7" perforated liner',
      });
      const casings = [WellboreTestDataUtil.liner({ csgSize: '7', csgDepth: 3830 })];

      expect(shouldRenderPerforatedInterval(wellDesign, casings, [])).toBe(true);
    });

    // perforatedRemarks is free text used only for label copy downstream — it must never
    // gate visibility, so this stays true even though the remarks don't mention 7".
    it('returns true when perforatedRemarks has text but does not reference 7"', () => {
      const wellDesign = WellboreTestDataUtil.wellDesign({
        perforatedFlg: 'Y',
        perforatedRemarks: 'Perforated',
      });
      const casings = [WellboreTestDataUtil.liner({ csgSize: '7', csgDepth: 3830 })];

      expect(shouldRenderPerforatedInterval(wellDesign, casings, [])).toBe(true);
    });

    it('returns true when no liner qualifies as the 7" target, since the flag alone gates visibility', () => {
      const wellDesign = WellboreTestDataUtil.wellDesign({
        perforatedFlg: 'Y',
        perforatedRemarks: '7" perforated liner',
      });

      expect(shouldRenderPerforatedInterval(wellDesign)).toBe(true);
    });

    it('returns false when perforatedFlg is null', () => {
      const casings = [WellboreTestDataUtil.liner({ csgSize: '7', csgDepth: 3830 })];

      expect(shouldRenderPerforatedInterval(
        WellboreTestDataUtil.wellDesign({ perforatedFlg: null, perforatedRemarks: '7" perforated liner' }),
        casings,
      )).toBe(false);
    });

    it('returns false when wellDesign is null', () => {
      expect(shouldRenderPerforatedInterval(null)).toBe(false);
    });
  });
});
