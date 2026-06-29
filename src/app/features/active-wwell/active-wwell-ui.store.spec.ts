import { ActiveWwellUiStore } from './active-wwell-ui.store';

describe('ActiveWwellUiStore', () => {
  let store: ActiveWwellUiStore;

  beforeEach(() => {
    store = new ActiveWwellUiStore();
  });

  it('initializes isUpdating to false', () => {
    expect(store.isUpdating()).toBe(false);
  });

  it('setUpdating toggles isUpdating', () => {
    store.setUpdating(true);
    expect(store.isUpdating()).toBe(true);
    store.setUpdating(false);
    expect(store.isUpdating()).toBe(false);
  });

  it('has default statusOptions', () => {
    expect(store.statusOptions().length).toBeGreaterThan(0);
  });

  it('addStatusOption normalizes and adds a new status', () => {
    const initial = store.statusOptions().length;
    store.addStatusOption('CustomStatus');
    expect(store.statusOptions().length).toBe(initial + 1);
    expect(store.statusOptions()).toContain('CustomStatus');
  });

  it('addStatusOption does not add duplicate (case-insensitive)', () => {
    store.addStatusOption('Drilling');
    const afterFirst = store.statusOptions().length;
    store.addStatusOption('drilling');
    expect(store.statusOptions().length).toBe(afterFirst);
  });

  it('setStatusForWell sets status for a well', () => {
    store.setStatusForWell(1001, 'Drilling');
    expect(store.statusForWell(1001)).toBe('Drilling');
  });

  it('statusForWell returns null for unknown well', () => {
    expect(store.statusForWell(9999)).toBeNull();
  });

  it('ensureStatusForWell sets status if not already set', () => {
    store.ensureStatusForWell(2001, 'Testing');
    expect(store.statusForWell(2001)).toBe('Testing');
  });

  it('ensureStatusForWell does not override existing status', () => {
    store.setStatusForWell(2001, 'Drilling');
    store.ensureStatusForWell(2001, 'Testing');
    expect(store.statusForWell(2001)).toBe('Drilling');
  });

  it('selectedArea defaults to RAK', () => {
    expect(store.selectedArea()).toBe('RAK');
  });

  it('setSelectedArea updates the area', () => {
    store.setSelectedArea('Northern Area');
    expect(store.selectedArea()).toBe('Northern Area');
  });
});
