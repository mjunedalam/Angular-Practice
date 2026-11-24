import { PDFDocument } from 'pdf-lib';
import { WldaLetterView } from '@models/wwell-planning/wlda.model';
import { buildWldaPdf } from './wlda-pdf.util';

const baseView: WldaLetterView = {
  code: 'WLDA-7', wellName: 'SHYB-1031', cathodic: false, status: 'approved', date: '2026-02-10T10:00:00', field: 'SHYB', wellNumber: '1031', wellType: 'Drilling Water Supply',
  reservoir: 'UMM ER RADHUMA', totalDepth: '3000', gosp: '', north: '2499203', east: '809640', zone: '39',
  remarks: 'A remark', attachments: [], workflow: [], distribution: [],
};

const latin1 = (bytes: Uint8Array): string => Buffer.from(bytes).toString('latin1');
const pageCount = async (bytes: Uint8Array): Promise<number> => (await PDFDocument.load(bytes)).getPageCount();

describe('buildWldaPdf', () => {
  it('produces a one-page PDF with placeholders when no workflow or distribution exists', async () => {
    const bytes = await buildWldaPdf(baseView);
    expect(latin1(bytes.slice(0, 5))).toBe('%PDF-');
    expect(await pageCount(bytes)).toBe(1);
  });

  it('flows a long workflow table and distribution list onto more pages', async () => {
    const workflow = Array.from({ length: 60 }, (_, index) => ({ name: `Approver ${index}`, title: 'Manager', status: 'Reviewed', approvedDate: '2/10/26, 2:16 PM' }));
    const distribution = Array.from({ length: 12 }, (_, index) => `Director, Dept ${index}, R-E38${index}, DH`);
    expect(await pageCount(await buildWldaPdf({ ...baseView, workflow, distribution }))).toBeGreaterThan(1);
  });

  it('does not throw on characters the standard fonts cannot encode', async () => {
    await expect(buildWldaPdf({ ...baseView, remarks: 'موقع البئر — ✓' })).resolves.toBeInstanceOf(Uint8Array);
  });
});
