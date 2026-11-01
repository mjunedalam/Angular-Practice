/**
 * The Program Details "Completion" dropdown's options (EXAD_DHUB_LKUP_DATA menu
 * `ir_completion_type_menu`, seeded by docs/ir/table/exad_dhub_lkup_data_insert.sql). The menu text
 * is what the user picks, so these must match the seeded values exactly — they are how the diagram
 * mapper recognises which completion element each pick means.
 *
 * Not to be confused with the free-text/multi-select field now labelled "Completion Remarks"
 * (form key `completion`, exad_gwd_ir_header.completion).
 */
export const WWELL_COMPLETION_TYPE = {
  OPEN_HOLE: 'Open Hole',
  SCREEN: 'Screen',
  SCREEN_GRAVEL_PACK: 'Screen with Gravel Pack',
  PRE_PERFORATED_LINER: 'Pre-Perforated Liner',
  PERFORATED_LINER: 'Perforated Liner',
} as const;

/** Picks that ask for a liner size (and, for Open Hole, the hole size) — see the schema's `visibleWhen` gates. */
export const WWELL_LINER_COMPLETION_TYPES: readonly string[] = [
  WWELL_COMPLETION_TYPE.PRE_PERFORATED_LINER,
  WWELL_COMPLETION_TYPE.PERFORATED_LINER,
];

export function isLinerCompletionType(completionType: string | null | undefined): boolean {
  return !!completionType && WWELL_LINER_COMPLETION_TYPES.includes(completionType);
}
