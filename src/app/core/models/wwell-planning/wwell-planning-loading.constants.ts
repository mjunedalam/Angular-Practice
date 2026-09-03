/**
 * Minimum time each wwell-planning CRUD loading indicator (button spinner, section shimmer) stays
 * visible, even when the backend answers faster than that — a sub-100ms local/CDN response would
 * otherwise flash a spinner on and off too quickly to read as real feedback. Centralized here so
 * every "does this action feel like it did something" tweak happens in one place instead of as a
 * magic number scattered across stores/components.
 *
 * `WWELL_LOAD_DELAY_MS` gates a UI-only selection transition (see `createPendingSelection` in
 * `features/wwell-planning/shared/wwell-pending-selection.util.ts`) — it does not touch the actual
 * fetch. The other three are applied directly to the mutating request's own observable (via
 * `delay()`) in each feature's store, so the loading flag that also disables its button stays true
 * for at least this long.
 */
export const WWELL_LOAD_DELAY_MS = 260;
export const WWELL_SAVE_DELAY_MS = 400;
export const WWELL_UPDATE_DELAY_MS = 400;
export const WWELL_DELETE_DELAY_MS = 400;
