import { WellDoc, WellDocsState } from '@models/well-design/well-docs.model';

export const DUMMY_DOCS: WellDoc[] = [
  {
    id: 'dummy-1',
    title: 'Well Completion Report',
    docType: 'PDF',
    category: 'Completion',
    uploadedBy: 'System',
    uploadedAt: new Date().toISOString(),
    fileSize: 524_288,
    url: '',
    tags: [],
    wellName: 'N/A',
    date: new Date().toISOString().split('T')[0],
    description: 'Sample document — no data loaded for selected well/date.',
    pageCount: 12,
  },
  {
    id: 'dummy-2',
    title: 'Drilling Daily Report',
    docType: 'WORD',
    category: 'Daily Reports',
    uploadedBy: 'System',
    uploadedAt: new Date().toISOString(),
    fileSize: 262_144,
    url: '',
    tags: [],
    wellName: 'N/A',
    date: new Date().toISOString().split('T')[0],
  },
  {
    id: 'dummy-3',
    title: 'Mud Log Data',
    docType: 'EXCEL',
    category: 'Logs',
    uploadedBy: 'System',
    uploadedAt: new Date().toISOString(),
    fileSize: 131_072,
    url: '',
    tags: [],
    wellName: 'N/A',
    date: new Date().toISOString().split('T')[0],
  },
];

export const initialWellDocsState: WellDocsState = {
  docs: DUMMY_DOCS,
  selectedDoc: null,
  loading: false,
  uploading: false,
  error: null,
  viewerOpen: false,
};
