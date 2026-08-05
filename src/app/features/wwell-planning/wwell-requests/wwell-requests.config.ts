import { ColDef, GridOptions, ICellRendererParams, themeQuartz } from 'ag-grid-community';
import { WwellPlanningRequest, WwellPlanningRequestStatus } from '@models/wwell-planning/wwell-planning.model';
import { WWELL_STATUS_COLORS, WwellStatusMeta, wwellStatusMeta } from '../shared/wwell-status.config';

export const wwellRequestsGridTheme = themeQuartz.withParams({
  accentColor: '#3b82f6',
  backgroundColor: '#ffffff',
  foregroundColor: '#1e293b',
  headerBackgroundColor: '#dbeafe',
  headerTextColor: '#1d4ed8',
  fontSize: 15,
  rowHeight: 44,
  headerHeight: 40,
  borderRadius: 0,
});

export const WWELL_REQUEST_STATUS_META: Record<WwellPlanningRequestStatus, WwellStatusMeta> = {
  draft: wwellStatusMeta('Draft', WWELL_STATUS_COLORS.slate),
  submitted: { label: 'Submitted', bg: '#f1f5f9', color: '#475569', dot: '#64748b' },
  'in-review': wwellStatusMeta('In Review', WWELL_STATUS_COLORS.purple),
  'in-progress': wwellStatusMeta('In Progress', WWELL_STATUS_COLORS.blue),
  approved: wwellStatusMeta('Approved', WWELL_STATUS_COLORS.green),
  rejected: wwellStatusMeta('Rejected', WWELL_STATUS_COLORS.red),
};

function statusCellRenderer(
  params: ICellRendererParams<WwellPlanningRequest, WwellPlanningRequestStatus>,
): string {
  const meta = WWELL_REQUEST_STATUS_META[params.value ?? 'draft'] ?? WWELL_REQUEST_STATUS_META.draft;
  return `<span style="display:inline-flex;align-items:center;gap:6px;padding:3px 10px;border-radius:999px;background:${meta.bg};color:${meta.color};font-size:12.5px;font-weight:700;line-height:1.6;white-space:nowrap;">
    <span style="width:6px;height:6px;border-radius:50%;background:${meta.dot};flex-shrink:0;"></span>${meta.label}
  </span>`;
}

function actionsCellRenderer(): string {
  return `<button type="button" data-action="open" style="display:inline-flex;align-items:center;gap:4px;padding:4px 12px;border-radius:6px;border:1px solid #dbeafe;background:#eff6ff;color:#1d4ed8;font-size:12.5px;font-weight:700;cursor:pointer;">Open</button>`;
}

export const WWELL_REQUESTS_ACTIONS_COL_ID = 'actions';

export const wwellRequestsColumnDefs: ColDef<WwellPlanningRequest>[] = [
  { headerName: 'REQ #', field: 'id', flex: 0.9, minWidth: 110, cellStyle: { fontWeight: '700', color: '#3b82f6' } },
  { headerName: 'Client', field: 'client', flex: 0.8, minWidth: 100 },
  { headerName: 'Well', field: 'wellName', flex: 1, minWidth: 120, cellStyle: { fontWeight: '700' } },
  { headerName: 'Supporting Business', field: 'supportingBusiness', flex: 1.3, minWidth: 160 },
  { headerName: 'Status', field: 'status', flex: 1, minWidth: 130, cellRenderer: statusCellRenderer },
  { headerName: 'Submitted', field: 'requestedDate', flex: 0.9, minWidth: 120 },
  {
    headerName: 'Assigned To',
    field: 'assignedTo',
    flex: 1.1,
    minWidth: 150,
    valueFormatter: params => params.value || 'Unassigned',
  },
  {
    headerName: 'Actions',
    colId: WWELL_REQUESTS_ACTIONS_COL_ID,
    field: 'id',
    flex: 0.7,
    minWidth: 100,
    sortable: false,
    filter: false,
    resizable: false,
    cellRenderer: actionsCellRenderer,
    cellStyle: { display: 'flex', alignItems: 'center' },
  },
];

export const wwellRequestsGridOptions: GridOptions<WwellPlanningRequest> = {
  animateRows: true,
  suppressMovableColumns: true,
  domLayout: 'autoHeight',
  pagination: true,
  paginationPageSize: 5,
  paginationPageSizeSelector: false,
  defaultColDef: { sortable: true, filter: true, resizable: true },
  onGridReady: params => params.api.sizeColumnsToFit(),
};
