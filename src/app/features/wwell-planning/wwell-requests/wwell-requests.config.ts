import { ColDef, GridOptions, ICellRendererParams, themeQuartz } from 'ag-grid-community';
import { WwellPlanningRequest, WwellPlanningRequestStatus } from '@models/wwell-planning/wwell-planning.model';

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

interface WwellRequestStatusMeta {
  readonly label: string;
  readonly bg: string;
  readonly color: string;
  readonly dot: string;
}

export const WWELL_REQUEST_STATUS_META: Record<WwellPlanningRequestStatus, WwellRequestStatusMeta> = {
  draft: { label: 'Draft', bg: '#f1f5f9', color: '#475569', dot: '#94a3b8' },
  submitted: { label: 'Submitted', bg: '#f1f5f9', color: '#475569', dot: '#64748b' },
  'in-review': { label: 'In Review', bg: '#f3e8ff', color: '#7e22ce', dot: '#a855f7' },
  'in-progress': { label: 'In Progress', bg: '#dbeafe', color: '#1d4ed8', dot: '#3b82f6' },
  approved: { label: 'Approved', bg: '#dcfce7', color: '#15803d', dot: '#22c55e' },
  rejected: { label: 'Rejected', bg: '#fee2e2', color: '#b91c1c', dot: '#ef4444' },
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
  { headerName: 'Supporting', field: 'supporting', flex: 1.3, minWidth: 160 },
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
