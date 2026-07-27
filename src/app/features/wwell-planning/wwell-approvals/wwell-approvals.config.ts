import { ColDef, GridOptions, themeQuartz } from 'ag-grid-community';
import { WwellPlanningApproval } from '@models/wwell-planning/wwell-planning.model';

export const wwellApprovalsGridTheme = themeQuartz.withParams({
  accentColor: '#3b82f6',
  backgroundColor: '#ffffff',
  foregroundColor: '#1e293b',
  headerBackgroundColor: '#dbeafe',
  headerTextColor: '#1d4ed8',
  fontSize: 15,
  rowHeight: 40,
  headerHeight: 38,
  borderRadius: 0,
});

export const wwellApprovalsColumnDefs: ColDef<WwellPlanningApproval>[] = [
  { headerName: 'ID', field: 'id', flex: 0.6, minWidth: 90 },
  { headerName: 'Request', field: 'requestTitle', flex: 1.4, minWidth: 170, cellStyle: { fontWeight: '700', color: '#3b82f6' } },
  { headerName: 'Approver', field: 'approver', flex: 1, minWidth: 130 },
  { headerName: 'Decision', field: 'decision', flex: 0.8, minWidth: 110 },
  { headerName: 'Decided Date', field: 'decidedDate', flex: 1, minWidth: 130 },
  { headerName: 'Comments', field: 'comments', flex: 1.4, minWidth: 160 },
];

export const wwellApprovalsGridOptions: GridOptions<WwellPlanningApproval> = {
  animateRows: true,
  suppressMovableColumns: true,
  domLayout: 'autoHeight',
  rowSelection: 'single',
  defaultColDef: { sortable: true, filter: true, resizable: true },
  onGridReady: params => params.api.sizeColumnsToFit(),
};
