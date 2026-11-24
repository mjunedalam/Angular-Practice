import { PDFDocument, PDFFont, PDFPage, RGB, StandardFonts, rgb } from 'pdf-lib';
import { WldaLetterView } from '@models/wwell-planning/wlda.model';
import {
  WLDA_DISTRIBUTION_PLACEHOLDER,
  WLDA_FORM_NUMBER,
  WLDA_FORM_TITLE,
  WLDA_TO_LINE,
  WLDA_WORKFLOW_COLUMNS,
  WLDA_WORKFLOW_PLACEHOLDER,
} from './wlda.config';

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 34;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const BOTTOM_LIMIT = 48;

const INK = rgb(0.08, 0.1, 0.13);
const LABEL = rgb(0.36, 0.4, 0.45);
const LINE = rgb(0.17, 0.19, 0.23);
const GREEN = rgb(0.12, 0.48, 0.23);
const TABLE_HEAD_FILL = rgb(0.74, 0.82, 0.91);
const TABLE_LINE = rgb(0.55, 0.6, 0.67);

interface Fonts {
  readonly regular: PDFFont;
  readonly bold: PDFFont;
  readonly mono: PDFFont;
}

/** Top-down drawing cursor: `y` is the distance from the page's top edge, so layout reads like the form. */
class Sheet {
  y = MARGIN;
  page: PDFPage;

  constructor(
    private readonly doc: PDFDocument,
    readonly fonts: Fonts,
  ) {
    this.page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  }

  /** Starts a new page when `height` would not fit above the bottom margin. */
  ensureSpace(height: number): void {
    if (this.y + height <= PAGE_HEIGHT - BOTTOM_LIMIT) return;
    this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.y = MARGIN;
  }

  /** Text whose baseline sits `baselineFromTop` below the page top. Characters the font can't encode become `?`. */
  text(value: string, x: number, baselineFromTop: number, size: number, font: PDFFont, color: RGB = INK): void {
    this.page.drawText(printable(value, font), { x, y: PAGE_HEIGHT - baselineFromTop, size, font, color });
  }

  /** Text centred on `centerX`. */
  centered(value: string, centerX: number, baselineFromTop: number, size: number, font: PDFFont, color: RGB = INK): void {
    const safe = printable(value, font);
    this.text(safe, centerX - font.widthOfTextAtSize(safe, size) / 2, baselineFromTop, size, font, color);
  }

  hline(x1: number, x2: number, fromTop: number, thickness = 0.8, color: RGB = LINE): void {
    this.page.drawLine({ start: { x: x1, y: PAGE_HEIGHT - fromTop }, end: { x: x2, y: PAGE_HEIGHT - fromTop }, thickness, color });
  }

  vline(x: number, fromTop1: number, fromTop2: number, thickness = 0.8, color: RGB = LINE): void {
    this.page.drawLine({ start: { x, y: PAGE_HEIGHT - fromTop1 }, end: { x, y: PAGE_HEIGHT - fromTop2 }, thickness, color });
  }

  rect(x: number, topFromTop: number, width: number, height: number, options: { fill?: RGB; border?: RGB; borderWidth?: number }): void {
    this.page.drawRectangle({
      x,
      y: PAGE_HEIGHT - topFromTop - height,
      width,
      height,
      color: options.fill,
      borderColor: options.border,
      borderWidth: options.borderWidth ?? 0,
    });
  }
}

/** Standard PDF fonts only cover WinAnsi; anything else (e.g. Arabic) is replaced rather than crashing the download. */
function printable(value: string, font: PDFFont): string {
  const supported = new Set(font.getCharacterSet());
  return Array.from(value.replace(/[\r\n\t]+/g, ' '))
    .map(char => (supported.has(char.codePointAt(0) ?? 0) ? char : '?'))
    .join('');
}

/** Largest size (down to 6) at which `value` still fits `maxWidth`, so long values shrink instead of spilling over the cell border. */
function fitSize(value: string, font: PDFFont, size: number, maxWidth: number): number {
  const safe = printable(value, font);
  let current = size;
  while (current > 6 && font.widthOfTextAtSize(safe, current) > maxWidth) current -= 0.5;
  return current;
}

/** Greedy word wrap to `maxWidth`; a single word wider than the line is hard-split. */
function wrap(value: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of printable(value, font).split(/ {2,}|\n/)) {
    let line = '';
    for (const word of paragraph.split(' ')) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate;
        continue;
      }
      if (line) lines.push(line);
      line = word;
      while (font.widthOfTextAtSize(line, size) > maxWidth && line.length > 1) {
        let cut = line.length - 1;
        while (cut > 1 && font.widthOfTextAtSize(line.slice(0, cut), size) > maxWidth) cut -= 1;
        lines.push(line.slice(0, cut));
        line = line.slice(cut);
      }
    }
    lines.push(line);
  }
  return lines;
}

function formatLongDate(iso: string | null): string {
  const date = iso ? new Date(iso) : new Date();
  const valid = Number.isNaN(date.getTime()) ? new Date() : date;
  return valid.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

const dash = (value: string): string => value.trim() || '—';

/** Column x-edges for a row of cells sized by `weights`, spanning the full content width. */
function columnEdges(weights: readonly number[]): number[] {
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const edges = [MARGIN];
  for (const weight of weights) edges.push((edges[edges.length - 1] ?? MARGIN) + (CONTENT_WIDTH * weight) / total);
  return edges;
}

function drawHeader(sheet: Sheet, view: WldaLetterView): void {
  const { bold, regular } = sheet.fonts;
  sheet.text(WLDA_FORM_TITLE, MARGIN, sheet.y + 20, 19, bold);
  sheet.text(`${WLDA_FORM_NUMBER}  ·  ${view.code}`, MARGIN + 6, sheet.y + 33, 7.5, regular, LABEL);
  const dateX = MARGIN + CONTENT_WIDTH - 118;
  sheet.vline(dateX, sheet.y + 4, sheet.y + 38, 0.8);
  sheet.text('Date', dateX + 8, sheet.y + 14, 8, regular, LABEL);
  sheet.text(formatLongDate(view.date), dateX + 8, sheet.y + 31, 9.5, bold);
  sheet.y += 44;
  sheet.hline(MARGIN, MARGIN + CONTENT_WIDTH, sheet.y, 1.6);
}

function drawToLine(sheet: Sheet, approved: boolean): void {
  const { regular } = sheet.fonts;
  sheet.text('TO:', MARGIN + 2, sheet.y + 24, 11, regular);
  const lines = wrap(WLDA_TO_LINE, regular, 8.6, CONTENT_WIDTH - 190);
  lines.slice(0, 3).forEach((line, index) => sheet.text(line, MARGIN + 34, sheet.y + 15 + index * 11, 8.6, regular));
  if (approved) {
    const stampWidth = 118;
    const stampX = MARGIN + CONTENT_WIDTH - stampWidth - 6;
    sheet.rect(stampX, sheet.y + 8, stampWidth, 32, { border: GREEN, borderWidth: 2.4 });
    sheet.centered('APPROVED', stampX + stampWidth / 2, sheet.y + 30, 17, sheet.fonts.mono, GREEN);
  }
  sheet.y += 50;
  sheet.hline(MARGIN, MARGIN + CONTENT_WIDTH, sheet.y, 1.6);
}

/** A cell: small grey label at the top-left, then value lines centred in the lower part of the cell. */
function drawCell(
  sheet: Sheet,
  left: number,
  right: number,
  top: number,
  height: number,
  label: string,
  values: readonly string[] = [],
  options: { underline?: boolean } = {},
): void {
  const { regular, bold } = sheet.fonts;
  const labelLines = wrap(label, regular, 7, right - left - 8);
  labelLines.forEach((line, index) => sheet.text(line, left + 4, top + 10 + index * 8.5, 7, regular, LABEL));
  const center = (left + right) / 2;
  const startY = top + height - 8 - (values.length - 1) * 12;
  values.forEach((value, index) => {
    const size = fitSize(value, bold, 9, right - left - 8);
    sheet.centered(value, center, startY + index * 12, size, bold);
    if (options.underline) {
      const half = bold.widthOfTextAtSize(printable(value, bold), size) / 2;
      sheet.hline(center - half, center + half, startY + index * 12 + 1.6, 0.6, INK);
    }
  });
}

function drawCoordinates(sheet: Sheet, left: number, top: number, view: WldaLetterView): void {
  const { regular, bold } = sheet.fonts;
  const rows: [string, string][] = [
    ['NORTH', view.north],
    ['EAST', view.east],
    ['ZONE', view.zone],
  ];
  rows.forEach(([label, value], index) => {
    const baseline = top + 30 + index * 13;
    sheet.text(label, left + 18, baseline, 8, regular, LABEL);
    sheet.text(dash(value), left + 56, baseline, 9.5, bold);
  });
}

function drawFieldGrid(sheet: Sheet, view: WldaLetterView): void {
  const { regular } = sheet.fonts;
  const right = MARGIN + CONTENT_WIDTH;

  // Rows 1-2: Field | Well No | Type + Depth | Drillsite + Cathodic.
  const top1 = sheet.y;
  const rowHeight = 46;
  const a = columnEdges([24, 23, 25, 28]);
  [a[1], a[2], a[3]].forEach(x => sheet.vline(x ?? 0, top1, top1 + rowHeight * 2, 0.8));
  drawCell(sheet, a[0] ?? 0, a[1] ?? 0, top1, rowHeight * 2, 'Field:', [dash(view.field)]);
  drawCell(sheet, a[1] ?? 0, a[2] ?? 0, top1, rowHeight * 2, 'Well No.', [dash(view.wellName || `${view.field} ${view.wellNumber}`.trim())]);
  drawCell(sheet, a[2] ?? 0, a[3] ?? 0, top1, rowHeight, 'Well Type/Reservoir', [dash(view.wellType), dash(view.reservoir)]);
  drawCell(sheet, a[2] ?? 0, a[3] ?? 0, top1 + rowHeight, rowHeight, 'Total Depth:', [view.totalDepth.trim() ? `+/- ${view.totalDepth} ft` : '—']);
  drawCell(sheet, a[3] ?? 0, a[4] ?? right, top1, rowHeight, 'DRILLSITE No./Type:');
  drawCell(sheet, a[3] ?? 0, a[4] ?? right, top1 + rowHeight, rowHeight, 'Cathodic Protection Required:');
  sheet.hline(a[2] ?? 0, right, top1 + rowHeight, 0.8);
  const boxTop = top1 + rowHeight + 24;
  const boxX = (a[3] ?? 0) + 30;
  sheet.rect(boxX, boxTop, 12, 12, { border: LINE, borderWidth: 0.8 });
  sheet.text('Yes', boxX + 18, boxTop + 10, 8.5, regular);
  sheet.rect(boxX + 66, boxTop, 12, 12, { border: LINE, borderWidth: 0.8 });
  sheet.text('No', boxX + 84, boxTop + 10, 8.5, regular);
  if (view.cathodic !== null) sheet.centered('X', view.cathodic ? boxX + 6 : boxX + 72, boxTop + 9.5, 10, sheet.fonts.bold);
  sheet.y = top1 + rowHeight * 2;
  sheet.hline(MARGIN, right, sheet.y, 0.8);

  // Row 3: Surface | Bottomhole | Planning | GOSP.
  const top2 = sheet.y;
  const height2 = 70;
  const b = columnEdges([41, 22, 17, 20]);
  [b[1], b[2], b[3]].forEach(x => sheet.vline(x ?? 0, top2, top2 + height2, 0.8));
  drawCell(sheet, b[0] ?? 0, b[1] ?? 0, top2, height2, 'Surface Location (UTM Coordinates):');
  drawCoordinates(sheet, b[0] ?? 0, top2, view);
  drawCell(sheet, b[1] ?? 0, b[2] ?? 0, top2, height2, 'Bottomhole Location (for Deviated Wells Only):');
  sheet.text('NORTH', (b[1] ?? 0) + 14, top2 + 44, 7.5, regular, LABEL);
  sheet.text('EAST', (b[1] ?? 0) + 22, top2 + 58, 7.5, regular, LABEL);
  drawCell(sheet, b[2] ?? 0, b[3] ?? 0, top2, height2, 'Planning Designation');
  drawCell(sheet, b[3] ?? 0, b[4] ?? right, top2, height2, 'GOSP, Area or Injection Plant:', view.gosp.trim() ? [view.gosp] : []);
  sheet.y = top2 + height2;
  sheet.hline(MARGIN, right, sheet.y, 0.8);

  // Row 4: sign-off boxes (names come from the SAP workflow later).
  const top3 = sheet.y;
  const height3 = 50;
  const c = columnEdges([27, 22, 17, 34]);
  [c[1], c[2], c[3]].forEach(x => sheet.vline(x ?? 0, top3, top3 + height3, 0.8));
  drawCell(sheet, c[0] ?? 0, c[1] ?? 0, top3, height3, 'Initiated By:');
  drawCell(sheet, c[1] ?? 0, c[2] ?? 0, top3, height3, 'Endorsed By:', ['Production & Facilities', 'Development Dept.']);
  drawCell(sheet, c[2] ?? 0, c[3] ?? 0, top3, height3, 'Endorsed By:', ['Land Affairs Dept.'], { underline: true });
  drawCell(sheet, c[3] ?? 0, c[4] ?? right, top3, height3, 'Approved By:', ['Sr. VP PETROLEUM ENGRG & DEVEL']);
  sheet.y = top3 + height3;
  sheet.hline(MARGIN, right, sheet.y, 1.6);
}

function drawRelocationAndRemarks(sheet: Sheet, view: WldaLetterView): void {
  const { regular } = sheet.fonts;
  const right = MARGIN + CONTENT_WIDTH;
  sheet.centered('FOR RELOCATION OF WELL PREVIOUSLY APPROVED', MARGIN + CONTENT_WIDTH / 2, sheet.y + 16, 11, regular);
  sheet.y += 22;
  sheet.hline(MARGIN, right, sheet.y, 0.8);
  const split = MARGIN + CONTENT_WIDTH * 0.5;
  sheet.vline(split, sheet.y, sheet.y + 26, 0.8);
  sheet.text('Original Location (UTM Coordinates):', MARGIN + 4, sheet.y + 11, 7, regular, LABEL);
  sheet.text('Original Approval Date:', split + 4, sheet.y + 11, 7, regular, LABEL);
  sheet.y += 26;
  sheet.hline(MARGIN, right, sheet.y, 1.6);

  sheet.text('REMARKS:', MARGIN + 2, sheet.y + 12, 7, regular, LABEL);
  const lines = wrap(dash(view.remarks), regular, 9, CONTENT_WIDTH - 8);
  lines.forEach((line, index) => {
    sheet.ensureSpace(12);
    sheet.text(line, MARGIN + 4, sheet.y + 24 + index * 11.5, 9, regular);
  });
  sheet.y += 30 + lines.length * 11.5;
}

function drawWorkflowTable(sheet: Sheet, view: WldaLetterView): void {
  const { regular } = sheet.fonts;
  const right = MARGIN + CONTENT_WIDTH;
  const edges = columnEdges([25, 33, 17, 25]);
  const headHeight = 18;
  const rowHeight = 17;

  sheet.ensureSpace(headHeight + rowHeight * Math.max(view.workflow.length, 1) + 8);
  const top = sheet.y;
  sheet.rect(MARGIN, top, CONTENT_WIDTH, headHeight, { fill: TABLE_HEAD_FILL, border: TABLE_LINE, borderWidth: 0.6 });
  WLDA_WORKFLOW_COLUMNS.forEach((label, index) => {
    const from = edges[index] ?? MARGIN;
    const to = edges[index + 1] ?? right;
    sheet.centered(label, (from + to) / 2, top + 12.5, 10, sheet.fonts.mono);
  });
  sheet.y = top + headHeight;

  if (view.workflow.length === 0) {
    sheet.rect(MARGIN, sheet.y, CONTENT_WIDTH, rowHeight * 2, { border: TABLE_LINE, borderWidth: 0.6 });
    sheet.centered(WLDA_WORKFLOW_PLACEHOLDER, MARGIN + CONTENT_WIDTH / 2, sheet.y + 21, 8.5, regular, LABEL);
    sheet.y += rowHeight * 2;
    return;
  }
  for (const row of view.workflow) {
    sheet.ensureSpace(rowHeight);
    const rowTop = sheet.y;
    sheet.rect(MARGIN, rowTop, CONTENT_WIDTH, rowHeight, { border: TABLE_LINE, borderWidth: 0.6 });
    [row.name, row.title, row.status, row.approvedDate].forEach((cell, index) => {
      const from = edges[index] ?? MARGIN;
      sheet.text(cell, from + 4, rowTop + 11.5, 8.6, sheet.fonts.mono);
    });
    edges.slice(1, -1).forEach(x => sheet.vline(x, rowTop, rowTop + rowHeight, 0.6, TABLE_LINE));
    sheet.y += rowHeight;
  }
}

function drawDistribution(sheet: Sheet, view: WldaLetterView): void {
  const { regular } = sheet.fonts;
  sheet.ensureSpace(60);
  sheet.y += 14;
  sheet.text('DISTRIBUTION:', MARGIN + 2, sheet.y + 8, 8, regular, LABEL);
  if (view.distribution.length === 0) {
    sheet.text(WLDA_DISTRIBUTION_PLACEHOLDER, MARGIN + 24, sheet.y + 24, 9, regular, LABEL);
    sheet.y += 36;
    return;
  }
  const half = Math.ceil(view.distribution.length / 2);
  const columns = [view.distribution.slice(0, half), view.distribution.slice(half)];
  const columnWidth = CONTENT_WIDTH / 2 - 16;
  let used = 0;
  columns.forEach((entries, columnIndex) => {
    let offset = 0;
    entries.forEach(entry => {
      wrap(entry, regular, 8.2, columnWidth).forEach(line => {
        sheet.text(line, MARGIN + 18 + columnIndex * (CONTENT_WIDTH / 2), sheet.y + 22 + offset, 8.2, regular);
        offset += 10.5;
      });
    });
    used = Math.max(used, offset);
  });
  sheet.y += 26 + used;
}

/** Builds the WLDA letter as a PDF laid out like Aramco Form 6208, followed by the SAP workflow table and distribution list. */
export async function buildWldaPdf(view: WldaLetterView): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.setTitle(`${view.code} — Well Location & Drilling Approval`);
  const fonts: Fonts = {
    regular: await doc.embedFont(StandardFonts.Helvetica),
    bold: await doc.embedFont(StandardFonts.HelveticaBold),
    mono: await doc.embedFont(StandardFonts.CourierBold),
  };
  const sheet = new Sheet(doc, fonts);
  drawHeader(sheet, view);
  drawToLine(sheet, view.status === 'approved');
  drawFieldGrid(sheet, view);
  drawRelocationAndRemarks(sheet, view);
  drawWorkflowTable(sheet, view);
  drawDistribution(sheet, view);
  return doc.save();
}

/** Browser download of the generated PDF under `fileName`. */
export async function downloadWldaPdf(view: WldaLetterView, fileName: string): Promise<void> {
  const bytes = await buildWldaPdf(view);
  const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
