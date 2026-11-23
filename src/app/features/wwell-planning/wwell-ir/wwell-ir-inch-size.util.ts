const INCH_MARKED = /["″”]/;

/** "24" → 24", "9 5/8" → 9 5/8"; a size that already carries an inch mark is left alone, blank stays blank. */
export function formatInchSize(size: string | null | undefined): string {
  const trimmed = size?.trim() ?? '';
  if (!trimmed) return '';
  return INCH_MARKED.test(trimmed) ? trimmed : `${trimmed}"`;
}

const FRACTION_INCH_MARK = /(\d+(?:[-\s]\d+\/\d+|\/\d+))\s?;(?!\d)/g;
const WHOLE_INCH_MARK = /(?<![\d./-])(\d+(?:\.\d+)?);(?=\s+(?:pre-?perforated|perforated|slotted|screens?|screened|liner|casing|csg|tubing|pipe|hole|bit|shoe|blank|conductor|surface|production|open)\b)/gi;

/** Legacy remarks store an inch mark as ";" ("7; liner", "9-5/8; liner shoe"): a fraction size before ";" is always an inch size, a
 *  whole/decimal one only when a casing/hole word follows, so "3000 ft; 4000 ft" is left alone. Same rule as the letter PDF (LegacyIrTextUtil). */
export function normalizeInchMarks(text: string | null | undefined): string {
  return (text ?? '').replace(FRACTION_INCH_MARK, '$1"').replace(WHOLE_INCH_MARK, '$1"');
}
