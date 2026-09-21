/**
 * Several `exad_gwd_ir_header` free-text remarks columns — `completion`, `acidization`, `logging`,
 * `mud_rmks`, `sampling`, `flow_rmks` — carry raw markup on older records instead of plain text:
 * a "Save As HTML" dump straight out of a legacy Windows RTF/rich-text control, e.g.
 * `<HTML><BODY><P ALIGN="left"><FONT FACE="Arial" SIZE="11" COLOR="#000000">7" diameter, 0.012"
 * slots</FONT></P></BODY></HTML>`, sometimes several such `<HTML>...</HTML>` documents
 * concatenated back-to-back in one column value (each `<P>` was originally its own remark line).
 * Other records hold bare fragments from a browser rich-text editor instead — no `<HTML>` wrapper,
 * e.g. `<p>The screen should be jetted…</p><p><br></p>`, possibly followed by plain option lines
 * (`Open Hole`, `Screened`). Both shapes are handled the same way.
 * Left as-is, every place that shows one of these fields — the KV read cards
 * (wwell-ir-detail-rows.util.ts), the editor's combo/select inputs, the printable Letter view —
 * renders the raw tags instead of the remark text.
 *
 * `mergeIrDetailBlocksIntoIntegratedRequirement` (wwell-ir-detail-response.mapper.ts) is the one
 * place backend column values become `IntegratedRequirement` field values, for both the initial
 * detail fetch on selecting a record and the post-save refetch — running every legacy-prone field
 * through `stripLegacyIrHtml` there means every downstream reader (including the editor's own
 * raw-form mapper, which a re-save resends unchanged for any section the user didn't open) only
 * ever sees plain text, so a save after that point persists plain text back to the backend even
 * though the column itself started out as markup.
 */
/** A real markup tag — an `<HTML>` dump's or a rich-text fragment's. A whitelist of tag names rather
 *  than "anything in angle brackets", so plain text with a stray `<` (`PWL < SWL`, `<5000 ppm`) is
 *  never mistaken for markup and rewritten. */
const LEGACY_MARKUP_TAG_PATTERN =
  /<\/?(?:html|body|p|br|div|span|font|b|i|u|s|strong|em|ul|ol|li|h[1-6]|a|sub|sup|hr|pre|blockquote|table|tr|td|th)(?:[\s/][^>]*)?>/i;

/** Where a legacy value's own line breaks were: a `<br>`, or the end of a block element. */
const LINE_BREAK_TAG_PATTERN = /<br\s*\/?>|<\/(?:p|div|li|h[1-6]|tr)>/gi;

/** True when `value` carries legacy markup — an `<HTML>...` dump or a bare `<p>…</p>` fragment —
 *  rather than plain text. A brand-new record's plain, user-typed remarks (or a blank value)
 *  always fail this check. */
export function isLegacyIrHtmlText(value: string | null | undefined): boolean {
  return !!value && LEGACY_MARKUP_TAG_PATTERN.test(value);
}

/** Collapses runs of horizontal whitespace within each line (left by adjacent `<FONT>` run
 *  boundaries) while keeping real paragraph breaks (`\n`, inserted for `<P>`/`<BR>`/separate
 *  `<HTML>` documents below) intact, and drops any resulting blank line. */
function collapseWhitespacePreservingLines(text: string): string {
  return text
    .split('\n')
    .map(line => line.replace(/[^\S\n]+/g, ' ').trim())
    .filter(Boolean)
    .join('\n');
}

/**
 * Strips a legacy `exad_gwd_ir_header` rich-text remarks value down to the plain text it actually
 * displays. Values that AREN'T legacy markup (a plain string, blank, or already-cleaned text from
 * a prior parse) pass through unchanged, so this is safe to call unconditionally on every
 * legacy-prone field rather than only on ones already known to carry HTML.
 *
 * Uses `DOMParser` rather than a hand-rolled tag-stripping regex so that whitespace between
 * adjacent `<FONT>` runs is preserved (or not) exactly as a browser would actually render that
 * markup — the legacy source sometimes omits the space between two runs, and the "exact
 * information" is whatever text the field actually displayed, gaps included.
 */
export function stripLegacyIrHtml(value: string | null | undefined): string {
  if (!value) return '';
  if (!isLegacyIrHtmlText(value)) return value.trim();

  const parser = new DOMParser();
  const paragraphs = value
    // Multiple concatenated `<HTML>...</HTML>` documents in one column value are separate
    // remark lines saved back-to-back — split them apart before parsing, since DOMParser only
    // ever reads the first document out of a string containing several.
    .split(/(?=<html[\s>])/i)
    .map(document => document.replace(LINE_BREAK_TAG_PATTERN, '\n'))
    .map(document => parser.parseFromString(document, 'text/html').body.textContent ?? '')
    .map(collapseWhitespacePreservingLines)
    .filter(Boolean);

  return paragraphs.join('\n');
}
