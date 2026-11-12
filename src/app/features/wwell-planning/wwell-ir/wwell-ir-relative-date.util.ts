const DAY_MS = 86_400_000;

/** "Updated today / yesterday / 3d ago / 2w ago / 5mo ago" for an ISO date (yyyy-mm-dd); the full date for anything over a year. */
export function relativeUpdatedLabel(isoDate: string | null | undefined, now: Date = new Date()): string {
  if (!isoDate) return 'Update date unknown';
  const then = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(then.getTime())) return `Updated ${isoDate}`;
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const days = Math.round((startOfToday - then.getTime()) / DAY_MS);
  if (days <= 0) return 'Updated today';
  if (days === 1) return 'Updated yesterday';
  if (days < 7) return `Updated ${days}d ago`;
  if (days < 30) return `Updated ${Math.floor(days / 7)}w ago`;
  if (days < 365) return `Updated ${Math.floor(days / 30)}mo ago`;
  return `Updated ${isoDate}`;
}
