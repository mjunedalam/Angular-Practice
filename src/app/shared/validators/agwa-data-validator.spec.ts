import { FormControl } from '@angular/forms';
import {
  allowKeypress,
  commaSeparatedNetworkIds,
  NETWORK_ID_LIST_PATTERN,
  NUMERIC_KEY_PATTERN,
} from './agwa-data-validator';

function keyEvent(key: string): KeyboardEvent {
  return new KeyboardEvent('keypress', { key });
}

describe('NETWORK_ID_LIST_PATTERN', () => {
  it('matches a single alphanumeric ID', () => {
    expect(NETWORK_ID_LIST_PATTERN.test('jd12345')).toBe(true);
  });

  it('matches a comma-separated list with no spaces', () => {
    expect(NETWORK_ID_LIST_PATTERN.test('jd12345,ab67890')).toBe(true);
  });

  it('rejects spaces, empty entries, and non-alphanumeric characters', () => {
    expect(NETWORK_ID_LIST_PATTERN.test('jd12345, ab67890')).toBe(false);
    expect(NETWORK_ID_LIST_PATTERN.test('jd12345,,ab67890')).toBe(false);
    expect(NETWORK_ID_LIST_PATTERN.test('jd-12345')).toBe(false);
    expect(NETWORK_ID_LIST_PATTERN.test(',jd12345')).toBe(false);
  });
});

describe('commaSeparatedNetworkIds', () => {
  const validator = commaSeparatedNetworkIds();

  it('returns null for an empty value', () => {
    expect(validator(new FormControl(null))).toBeNull();
    expect(validator(new FormControl(''))).toBeNull();
  });

  it('returns null for a valid comma-separated list', () => {
    expect(validator(new FormControl('jd12345,ab67890'))).toBeNull();
  });

  it('returns invalidNetworkIds for a malformed list', () => {
    expect(validator(new FormControl('jd12345, ab67890'))).toEqual({ invalidNetworkIds: true });
  });
});

describe('allowKeypress', () => {
  it('allows keys matching the pattern', () => {
    const event = keyEvent('5');
    const spy = jest.spyOn(event, 'preventDefault');
    allowKeypress(event, NUMERIC_KEY_PATTERN);
    expect(spy).not.toHaveBeenCalled();
  });

  it('blocks keys not matching the pattern', () => {
    const event = keyEvent('a');
    const spy = jest.spyOn(event, 'preventDefault');
    allowKeypress(event, NUMERIC_KEY_PATTERN);
    expect(spy).toHaveBeenCalled();
  });

  it('always allows navigation keys regardless of pattern', () => {
    const event = keyEvent('Backspace');
    const spy = jest.spyOn(event, 'preventDefault');
    allowKeypress(event, NUMERIC_KEY_PATTERN);
    expect(spy).not.toHaveBeenCalled();
  });
});
