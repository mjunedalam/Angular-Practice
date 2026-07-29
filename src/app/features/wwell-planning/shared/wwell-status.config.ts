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

export const WWELL_STATUS_COLORS = {
  slate: { bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
  slateMuted: { bg: '#f1f5f9', color: '#64748b', dot: '#cbd5e1' },
  indigo: { bg: '#e0e7ff', color: '#4338ca', dot: '#6366f1' },
  purple: { bg: '#f3e8ff', color: '#7e22ce', dot: '#a855f7' },
  blue: { bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
  green: { bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
  red: { bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
} as const satisfies Record<string, WwellStatusPalette>;

export function wwellStatusMeta(label: string, palette: WwellStatusPalette): WwellStatusMeta {
  return { label, ...palette };
}
