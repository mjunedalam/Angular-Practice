import {
  ALLOWED_UPLOAD_EXTENSIONS,
  MAX_UPLOAD_SIZE_BYTES,
  hasAllowedExtension,
  isUploadFileAllowed,
  toAcceptAttribute,
  toExtensionLabel,
} from './file-upload.config';

const file = (name: string, size = 10) => ({ name, size }) as File;

describe('file-upload.config', () => {
  it('allows images, pdf, word, excel, txt and csv', () => {
    for (const name of ['a.jpg', 'a.JPEG', 'a.png', 'a.pdf', 'a.doc', 'a.DOCX', 'a.xls', 'a.xlsx', 'a.xlsm', 'a.txt', 'a.csv']) {
      expect(hasAllowedExtension(name)).toBe(true);
    }
  });

  it('rejects everything else, extensionless names and double-extension tricks', () => {
    for (const name of ['a.exe', 'a.html', 'a.svg', 'a.js', 'README', 'a.pdf.exe']) {
      expect(hasAllowedExtension(name)).toBe(false);
    }
  });

  it('derives the accept attribute and hint from the list', () => {
    expect(toAcceptAttribute()?.split(',')).toHaveLength(ALLOWED_UPLOAD_EXTENSIONS?.length ?? -1);
    expect(toAcceptAttribute()).toContain('.csv');
    expect(toAcceptAttribute()).toContain('.xlsx');
  });

  it('keeps spreadsheet/csv types out of on-screen labels only', () => {
    expect(toExtensionLabel()).toBe('JPG · JPEG · PNG · PDF · DOC · DOCX · TXT');
    expect(hasAllowedExtension('a.xlsx')).toBe(true);
    expect(hasAllowedExtension('a.csv')).toBe(true);
  });

  it('enforces the size cap', () => {
    expect(isUploadFileAllowed(file('a.pdf', MAX_UPLOAD_SIZE_BYTES))).toBe(true);
    expect(isUploadFileAllowed(file('a.pdf', MAX_UPLOAD_SIZE_BYTES + 1))).toBe(false);
  });

  it('allows any type when the list is null', () => {
    expect(hasAllowedExtension('a.exe', null)).toBe(true);
    expect(toAcceptAttribute(null)).toBeNull();
    expect(toExtensionLabel(null)).toBe('Any file type');
  });
});
