import { wellDataValidator, validateWellData } from './well-data.validator';

describe('wellDataValidator', () => {
  afterEach(() => {
    wellDataValidator.disable();
  });

  it('should be disabled by default', () => {
    expect(wellDataValidator.isEnabled).toBe(false);
  });

  it('enable() should set isEnabled to true', () => {
    wellDataValidator.enable();
    expect(wellDataValidator.isEnabled).toBe(true);
  });

  it('disable() should set isEnabled to false', () => {
    wellDataValidator.enable();
    wellDataValidator.disable();
    expect(wellDataValidator.isEnabled).toBe(false);
  });
});

describe('validateWellData', () => {
  it('should not throw when data is null', () => {
    expect(() => validateWellData(null)).not.toThrow();
  });

  it('should not throw when validator is disabled and data is provided', () => {
    wellDataValidator.disable();
    expect(() => validateWellData({} as never)).not.toThrow();
  });
});
