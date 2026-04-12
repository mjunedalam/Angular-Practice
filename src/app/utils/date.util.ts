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
