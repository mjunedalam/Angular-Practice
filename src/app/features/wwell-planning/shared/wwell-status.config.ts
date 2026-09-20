export interface WwellStatusMeta {
  readonly label: string;
  readonly bg: string;
  readonly color: string;
  readonly dot: string;
}

interface WwellStatusPalette {
  readonly bg: string;
  readonly color: string;
  readonly dot: string;
}

// Every colour is a `--wp-st-*` token, not a literal: the light and dark values live in
// `_wwell-theme.scss` and flip with the module theme, so a badge stays legible on either surface.
// Neutral tones (`slate`/`slateMuted`) are tuned for readable contrast at badge sizes; the semantic
// hues (indigo/purple/blue/green/amber/red) keep the same identity in both themes — already distinct
// and well-established for status recognition, so changing them would confuse users for no real gain.
// Consumers only pass these straight into inline `[style.*]` bindings (no colour math), which is
// what makes a `var()` reference safe here.
export const WWELL_STATUS_COLORS = {
  slate: { bg: 'var(--wp-st-slate-bg)', color: 'var(--wp-st-slate-ink)', dot: 'var(--wp-st-slate-dot)' },
  slateMuted: { bg: 'var(--wp-st-slate-muted-bg)', color: 'var(--wp-st-slate-muted-ink)', dot: 'var(--wp-st-slate-muted-dot)' },
  indigo: { bg: 'var(--wp-st-indigo-bg)', color: 'var(--wp-st-indigo-ink)', dot: 'var(--wp-st-indigo-dot)' },
  purple: { bg: 'var(--wp-st-purple-bg)', color: 'var(--wp-st-purple-ink)', dot: 'var(--wp-st-purple-dot)' },
  blue: { bg: 'var(--wp-st-blue-bg)', color: 'var(--wp-st-blue-ink)', dot: 'var(--wp-st-blue-dot)' },
  green: { bg: 'var(--wp-st-green-bg)', color: 'var(--wp-st-green-ink)', dot: 'var(--wp-st-green-dot)' },
  amber: { bg: 'var(--wp-st-amber-bg)', color: 'var(--wp-st-amber-ink)', dot: 'var(--wp-st-amber-dot)' },
  red: { bg: 'var(--wp-st-red-bg)', color: 'var(--wp-st-red-ink)', dot: 'var(--wp-st-red-dot)' },
} as const satisfies Record<string, WwellStatusPalette>;

export function wwellStatusMeta(label: string, palette: WwellStatusPalette): WwellStatusMeta {
  return { label, ...palette };
}
