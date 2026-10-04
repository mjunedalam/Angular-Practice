import { PDFDocument, PDFFont, StandardFonts } from 'pdf-lib';

/** One attachment's raw bytes plus just enough metadata to place it in the merged letter — mirrors
 *  agwa-planning's (now-removed) IrAttachmentPdfAppender.SlotAttachment, since this replaces that
 *  server-side merge with the same behavior run in the browser. */
export interface IrLetterAttachmentFile {
  readonly label: string;
  readonly contentType: string;
  readonly bytes: ArrayBuffer;
}

const PAGE_WIDTH = 595.28; // A4 — matches iText's PageSize.A4 the backend used for the same job.
const PAGE_HEIGHT = 841.89;
const PAGE_MARGIN = 36;
const CAPTION_FONT_SIZE = 11;
const CAPTION_GAP = 12;

/**
 * Returns the rendered letter with each attachment appended as trailing pages — Location Map
 * first, then Initiation Request, each starting on its own fresh page (callers pass `attachments`
 * already in that order; see `irAttachmentsFor`/`WWELL_IR_ATTACHMENT_SLOTS`).
 *
 * A PDF attachment contributes its own pages verbatim; a JPG/PNG is drawn onto a single captioned
 * A4 page — the same two cases agwa-planning's IrAttachmentPdfAppender used to handle server-side,
 * now done here since Angular already holds the attachment bytes (same S3 proxy it uses for
 * upload/list/view/delete) with nothing left for the backend to add.
 *
 * A single unreadable attachment is skipped rather than failing the whole merge — the letter is
 * the document the user asked for; one damaged appendix shouldn't trade a complete-but-imperfect
 * PDF for no PDF at all.
 */
export async function appendAttachmentsToLetter(
  letterPdfBytes: ArrayBuffer,
  attachments: readonly IrLetterAttachmentFile[],
): Promise<Uint8Array> {
  if (attachments.length === 0) {
    return new Uint8Array(letterPdfBytes);
  }

  const target = await PDFDocument.load(letterPdfBytes);
  const captionFont = await target.embedFont(StandardFonts.HelveticaBold);

  for (const attachment of attachments) {
    try {
      if (isPdfContentType(attachment.contentType)) {
        await appendPdfPages(target, attachment.bytes);
      } else {
        await appendImagePage(target, attachment, captionFont);
      }
    } catch {
      // Skipped: a broken image header or unreadable PDF shouldn't fail the whole letter.
    }
  }

  return target.save();
}

function isPdfContentType(contentType: string): boolean {
  return contentType.toLowerCase() === 'application/pdf';
}

async function appendPdfPages(target: PDFDocument, bytes: ArrayBuffer): Promise<void> {
  const source = await PDFDocument.load(bytes);
  const pages = await target.copyPages(source, source.getPageIndices());
  pages.forEach(page => target.addPage(page));
}

/** Draws one image onto a captioned A4 page, scaled to fit inside the margins in both dimensions
 *  (iText's `setAutoScale` equivalent) while keeping its aspect ratio. */
async function appendImagePage(target: PDFDocument, attachment: IrLetterAttachmentFile, captionFont: PDFFont): Promise<void> {
  const image = isPngContentType(attachment.contentType)
    ? await target.embedPng(attachment.bytes)
    : await target.embedJpg(attachment.bytes);

  const page = target.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  const contentWidth = PAGE_WIDTH - 2 * PAGE_MARGIN;
  const captionY = PAGE_HEIGHT - PAGE_MARGIN - CAPTION_FONT_SIZE;
  const captionWidth = captionFont.widthOfTextAtSize(attachment.label, CAPTION_FONT_SIZE);
  page.drawText(attachment.label, {
    x: PAGE_MARGIN + (contentWidth - captionWidth) / 2,
    y: captionY,
    size: CAPTION_FONT_SIZE,
    font: captionFont,
  });

  const availableHeight = captionY - CAPTION_GAP - PAGE_MARGIN;
  const scale = Math.min(contentWidth / image.width, availableHeight / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  page.drawImage(image, {
    x: PAGE_MARGIN + (contentWidth - drawWidth) / 2,
    y: captionY - CAPTION_GAP - drawHeight,
    width: drawWidth,
    height: drawHeight,
  });
}

function isPngContentType(contentType: string): boolean {
  return contentType.toLowerCase() === 'image/png';
}
