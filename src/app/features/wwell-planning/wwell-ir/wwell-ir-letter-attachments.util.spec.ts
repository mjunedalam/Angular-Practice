import { PDFDocument } from 'pdf-lib';
import { appendAttachmentsToLetter, IrLetterAttachmentFile } from './wwell-ir-letter-attachments.util';

// A well-known minimal 1x1 transparent PNG — just enough for pdf-lib to embed as a real image.
const ONE_PIXEL_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUAIKe+bQMAAAAASUVORK5CYII=';

// `new Uint8Array(bytes)` (the array-like/iterable overload) always allocates a fresh, plain
// ArrayBuffer — unlike `.buffer`, which can type as `ArrayBuffer | SharedArrayBuffer`.
function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return new Uint8Array(bytes).buffer;
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  return toArrayBuffer(Buffer.from(base64, 'base64'));
}

async function onePagePdfBytes(): Promise<ArrayBuffer> {
  const doc = await PDFDocument.create();
  doc.addPage();
  return toArrayBuffer(await doc.save());
}

describe('appendAttachmentsToLetter', () => {
  it('returns the letter unchanged when there are no attachments', async () => {
    const letterBytes = await onePagePdfBytes();
    const result = await appendAttachmentsToLetter(letterBytes, []);
    const doc = await PDFDocument.load(result);
    expect(doc.getPageCount()).toBe(1);
  });

  it('merges a PDF attachment in verbatim as trailing pages', async () => {
    const letterBytes = await onePagePdfBytes();
    const attachmentDoc = await PDFDocument.create();
    attachmentDoc.addPage();
    attachmentDoc.addPage();
    const attachmentBytes = toArrayBuffer(await attachmentDoc.save());

    const attachments: IrLetterAttachmentFile[] = [
      { label: 'Initiation Request', contentType: 'application/pdf', bytes: attachmentBytes },
    ];
    const result = await appendAttachmentsToLetter(letterBytes, attachments);
    const merged = await PDFDocument.load(result);

    expect(merged.getPageCount()).toBe(3); // 1 letter page + 2 attachment pages
  });

  it('draws an image attachment onto its own captioned A4 page', async () => {
    const letterBytes = await onePagePdfBytes();
    const attachments: IrLetterAttachmentFile[] = [
      { label: 'Location Map', contentType: 'image/png', bytes: base64ToArrayBuffer(ONE_PIXEL_PNG_BASE64) },
    ];
    const result = await appendAttachmentsToLetter(letterBytes, attachments);
    const merged = await PDFDocument.load(result);

    expect(merged.getPageCount()).toBe(2);
    const imagePage = merged.getPage(1);
    expect(imagePage.getSize()).toEqual({ width: 595.28, height: 841.89 });
  });

  it('skips an unreadable attachment without failing the whole merge', async () => {
    const letterBytes = await onePagePdfBytes();
    const attachments: IrLetterAttachmentFile[] = [
      { label: 'Broken', contentType: 'image/png', bytes: toArrayBuffer(Buffer.from('not a real png')) },
      { label: 'Location Map', contentType: 'image/png', bytes: base64ToArrayBuffer(ONE_PIXEL_PNG_BASE64) },
    ];
    const result = await appendAttachmentsToLetter(letterBytes, attachments);
    const merged = await PDFDocument.load(result);

    // The broken attachment contributes nothing; the valid one still gets its page.
    expect(merged.getPageCount()).toBe(2);
  });
});
