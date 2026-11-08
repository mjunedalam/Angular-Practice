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
  OPEN_HOLE: 'Open-Hole',
  SCREEN: 'Liner Screen',
  SCREEN_GRAVEL_PACK: 'Liner Screen + Gravel pack',
  PRE_PERFORATED_LINER: 'Pre-perforated Liner',
} as const;

/** Picks that ask for a liner size — every pick except Open-Hole; see the schema's `visibleWhen` gates.
 *  Every pick asks for the open hole size, since the open hole is drawn with all of them. */
export const WWELL_LINER_COMPLETION_TYPES: readonly string[] = [
  WWELL_COMPLETION_TYPE.SCREEN,
  WWELL_COMPLETION_TYPE.SCREEN_GRAVEL_PACK,
  WWELL_COMPLETION_TYPE.PRE_PERFORATED_LINER,
];

export function isLinerCompletionType(completionType: string | null | undefined): boolean {
  return !!completionType && WWELL_LINER_COMPLETION_TYPES.includes(completionType);
}

/** Pre-selected Liner Screen Size whenever a form is opened without one (a new IR, or a record saved before the size existed). */
export const WWELL_DEFAULT_LINER_SIZE = '7"';
