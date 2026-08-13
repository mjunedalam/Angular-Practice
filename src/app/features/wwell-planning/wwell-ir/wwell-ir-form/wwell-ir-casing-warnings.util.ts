import { parseInchSize } from '@shared/utils/wellbore-math.util';
import { WwellIrRawCasingRow } from './wwell-ir-form.types';

/**
 * `mapCasings` (wwell-ir-wellbore-diagram.mapper.ts) now orders casings by entered SIZE, so
 * the diagram's width genuinely tracks the inch value a user typed rather than depth order —
 * see that function's doc comment. But `casing.renderer.ts` (presentation/well-bore-view —
 * off-limits to edit) always draws a casing as a full tube from ground level down to its own
 * depth, and paints later array entries — now the numerically widest — on top. A structurally
 * inverted pair (a deeper casing entered wider than some shallower casing) is therefore no
 * longer mislabeled, but the wider, deeper one now paints over the narrower, shallower one
 * wherever their depth ranges overlap, which can fully hide the shallower casing's shape. Two
 * casings can't really nest that way in a physical well either way, so this flags the
 * combination as a data-entry warning rather than trying to silently pick a "correct" look for
 * something that can't actually happen in reality.
 *
 * Liner rows are excluded — `casing.renderer.ts` skips them entirely for tier/width purposes
 * (liners hang from casing shoes via a separate anchor system, see
 * wwell-ir-wellbore-diagram.mapper.ts's `buildLinerTopAnchors`), so they're never part of the
 * telescoping width comparison this warns about.
 */
const NON_TIERED_CASING_TYPE = 'Liner';

export interface CasingSizeWarning {
  /** Index into the original `rows` array — matches the row's on-screen "#N" (1-based via +1). */
  readonly rowIndex: number;
  readonly size: string;
  readonly conflictsWithRowIndex: number;
  readonly conflictsWithSize: string;
}

interface StructuralCasingEntry {
  readonly index: number;
  readonly size: string;
  readonly depthFtBgl: number;
  readonly parsedSize: number;
}

function toStructuralEntries(rows: readonly WwellIrRawCasingRow[]): StructuralCasingEntry[] {
  const entries: StructuralCasingEntry[] = [];
  rows.forEach((row, index) => {
    if (row.type === NON_TIERED_CASING_TYPE || row.depthFtBgl === null) return;
    const parsedSize = parseInchSize(row.sizeIn);
    if (parsedSize === null) return;
    entries.push({ index, size: row.sizeIn, depthFtBgl: row.depthFtBgl, parsedSize });
  });
  return entries;
}

export function findInvertedCasingSizeRows(rows: readonly WwellIrRawCasingRow[]): readonly CasingSizeWarning[] {
  const structural = toStructuralEntries(rows);
  const warnings: CasingSizeWarning[] = [];

  for (const entry of structural) {
    const shallowerAndNarrower = structural.find(
      other =>
        other.index !== entry.index &&
        other.depthFtBgl < entry.depthFtBgl &&
        other.parsedSize < entry.parsedSize,
    );

    if (shallowerAndNarrower) {
      warnings.push({
        rowIndex: entry.index,
        size: entry.size,
        conflictsWithRowIndex: shallowerAndNarrower.index,
        conflictsWithSize: shallowerAndNarrower.size,
      });
    }
  }

  return warnings;
}
