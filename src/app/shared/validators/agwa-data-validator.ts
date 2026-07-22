import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// ── Network ID list (Reactive Forms validator) ───────────────────────────────

export const NETWORK_ID_LIST_PATTERN = /^[a-zA-Z0-9]+(,[a-zA-Z0-9]+)*$/;
export const NETWORK_ID_KEY_PATTERN = /[a-zA-Z0-9,]/;

/** Validates a comma-separated list of alphanumeric network IDs (e.g. "jd12345,ab67890"). */
export function commaSeparatedNetworkIds(): ValidatorFn {
  return (ctrl: AbstractControl): ValidationErrors | null => {
    const value = ctrl.value;
    if (value == null || String(value).trim() === '') return null;
    return NETWORK_ID_LIST_PATTERN.test(String(value).trim()) ? null : { invalidNetworkIds: true };
  };
}

// ── Keyboard input restriction (live keypress filtering) ────────────────────

const NAVIGATION_KEYS = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];

export const NUMERIC_KEY_PATTERN = /[\d.-]/;

/** Blocks a keypress unless it matches `pattern` or is a navigation/editing key. */
export function allowKeypress(event: KeyboardEvent, pattern: RegExp): void {
  const allowed = pattern.test(event.key) || NAVIGATION_KEYS.includes(event.key);
  if (!allowed) event.preventDefault();
}
