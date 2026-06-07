/**
 * Format a Date object to ISO date string (YYYY-MM-DD) for HTML date input.
 *
 * @param date - The date to format
 * @returns ISO date string (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date): string {
  if (!date) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

/**
 * Parse an ISO date string (from HTML date input) to a Date object.
 *
 * @param isoString - ISO date string (YYYY-MM-DD)
 * @returns Date object at midnight (00:00:00)
 */
export function parseDateFromInput(isoString: string): Date {
  if (!isoString) return new Date();

  // Parse YYYY-MM-DD format
  const [year, month, day] = isoString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Format a Date object to human-readable display format (e.g., "Apr 10, 2026").
 *
 * @param date - The date to format
 * @returns Human-readable date string
 */
export function formatDateDisplay(date: Date): string {
  if (!date) return '';

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  return new Intl.DateTimeFormat('en-US', options).format(date);
}

/**
 * Get the current date (useful for default values).
 * Returns date at midnight in local timezone.
 *
 * @returns Current date at midnight
 */
export function getTodayAtMidnight(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

/**
 * Check if a date is today.
 *
 * @param date - The date to check
 * @returns true if date is today
 */
export function isToday(date: Date): boolean {
  const today = getTodayAtMidnight();
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);

  return checkDate.getTime() === today.getTime();
}

/**
 * Add days to a date.
 *
 * @param date - The base date
 * @param days - Number of days to add (can be negative)
 * @returns New date with days added
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Clamp a raw digit string (max 8 chars) to a valid YYYY-MM-DD digit sequence.
 * Auto-prefixes 0 for months starting with > 1, clamps month to 01-12,
 * clamps day first digit to max 3, clamps day to 01-31.
 */
export function clampDateDigits(digits: string): string {
  if (digits.length === 5 && parseInt(digits[4], 10) > 1) {
    digits = digits.slice(0, 4) + '0' + digits[4];
  }
  if (digits.length >= 6) {
    const month = Math.min(Math.max(parseInt(digits.slice(4, 6), 10), 1), 12);
    digits = digits.slice(0, 4) + String(month).padStart(2, '0') + digits.slice(6);
  }
  if (digits.length === 7 && parseInt(digits[6], 10) > 3) {
    digits = digits.slice(0, 6) + '3';
  }
  if (digits.length === 8) {
    const day = Math.min(Math.max(parseInt(digits.slice(6, 8), 10), 1), 31);
    digits = digits.slice(0, 6) + String(day).padStart(2, '0');
  }
  return digits;
}

/**
 * Truncates the digit string at the first point where a future date is clearly detected,
 * preventing the user from typing further until they correct the value.
 *
 * - 4+ digits: blocks if year > currentYear (truncates to 4)
 * - 6+ digits: blocks if year == currentYear and month > currentMonth (truncates to 6)
 *
 * Must be called AFTER clampDateDigits so month values are already normalised.
 */
export function blockFutureDigits(digits: string): { digits: string; isFuture: boolean } {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (digits.length >= 4) {
    const year = parseInt(digits.slice(0, 4), 10);
    if (year > currentYear) {
      return { digits: digits.slice(0, 4), isFuture: true };
    }
  }

  if (digits.length >= 6) {
    const year = parseInt(digits.slice(0, 4), 10);
    const month = parseInt(digits.slice(4, 6), 10);
    if (year === currentYear && month > currentMonth) {
      return { digits: digits.slice(0, 6), isFuture: true };
    }
  }

  return { digits, isFuture: false };
}

export type DateValidationError = 'invalid' | 'future';

/**
 * Validates a full YYYY-MM-DD date string.
 * Returns 'invalid' for malformed dates, 'future' for future dates, null when valid.
 * Returns null (no-op) when the string is empty or has fewer than 8 digit characters.
 */
export function validateDateInput(value: string): DateValidationError | null {
  const trimmed = value.trim();
  if (!trimmed || trimmed.replace(/\D/g, '').length < 8) return null;

  const parts = trimmed.split('-');
  if (parts.length === 3) {
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 31) {
      return 'invalid';
    }
  }

  const date = parseDateFromInput(trimmed);
  if (Number.isNaN(date.getTime())) return 'invalid';
  if (date > getTodayAtMidnight()) return 'future';

  return null;
}
