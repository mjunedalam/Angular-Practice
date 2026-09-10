// Canonical short BI number keyed by known/aliased backend codes.
const BI_CANONICAL_NUM: Record<string, string> = {
  '33':   '33',
  '58':   '58',
  '34':   '34',
  '1514': '34',  // same formation as 34
  '60':   '60',
};

/**
 * Normalizes a biNum value (e.g. 'BI1514', '1514', 'BI3300', '3300') to its
 * canonical short display number (e.g. '34', '33'). Strips a leading "BI" label
 * and matches padded/aliased backend codes (e.g. '3300' → '33'); falls back to
 * the stripped input when the code isn't recognized.
 */
export function resolveBiDisplayNum(biNum: string): string {
  const stripped = biNum.replace(/^bi[\s-]*/i, '').trim();
  if (BI_CANONICAL_NUM[stripped]) return BI_CANONICAL_NUM[stripped];
  const matched = Object.keys(BI_CANONICAL_NUM).find(k => stripped.startsWith(k));
  return matched ? BI_CANONICAL_NUM[matched] : stripped;
}
