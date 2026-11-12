import { computeSubSeaFt } from './wwell-ir-payload.mapper';

const LABEL = 'Sub-sea';
const INDENT = ' '.repeat(LABEL.length);
const fmt = (n: number): string => n.toLocaleString('en-US', { maximumFractionDigits: 1 });

/** The Sub-sea tooltip text, laid out like a worked sum with the "=" signs aligned (shown monospaced, see `.dyf-derived-tooltip`). */
export function explainSubSea(elevationFtAsl: number | null | undefined, depthFt: number | null | undefined): string {
  const formula = `${LABEL} = Elevation − Depth`;
  if (elevationFtAsl == null) return `${formula}\n${INDENT} = ?\n\nSurface Elevation is not set for this well.`;
  if (depthFt == null) return `${formula}\n${INDENT} = ${fmt(elevationFtAsl)} − ?\n\nEnter the Depth to calculate.`;
  const result = computeSubSeaFt(elevationFtAsl, depthFt);
  return [
    formula,
    `${INDENT} = ${fmt(elevationFtAsl)} − ${fmt(depthFt)}`,
    `${INDENT} = ${result == null ? '—' : fmt(result)} ft asl`,
  ].join('\n');
}
