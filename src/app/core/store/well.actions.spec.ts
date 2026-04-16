import { WellActions, WellEvents } from '@store/well.actions';

describe('WellActions', () => {
  it('should have standard action types', () => {
    expect(WellActions.loadWellNames).toBe('[Well] Load Well Names');
    expect(WellActions.selectWell).toBe('[Well] Select Well');
    expect(WellActions.nextPage).toBe('[Well] Next Page');
    expect(WellActions.prevPage).toBe('[Well] Prev Page');
  });
});

describe('WellEvents', () => {
  it('should have standard event types', () => {
    expect(WellEvents.wellNamesLoaded).toBe('[Well] Well Names Loaded');
    expect(WellEvents.wellNamesLoadFailed).toBe('[Well] Well Names Load Failed');
    expect(WellEvents.wellDetailsLoaded).toBe('[Well] Well Details Loaded');
    expect(WellEvents.wellDetailsLoadFailed).toBe('[Well] Well Details Load Failed');
    expect(WellEvents.wellTestResultsLoaded).toBe('[Well] Well Test Results Loaded');
  });
});
