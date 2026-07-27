import { ColDef, GridOptions, themeQuartz } from 'ag-grid-community';
import { IntegratedRequirement } from '@models/wwell-planning/wwell-planning.model';

export const wwellIrGridTheme = themeQuartz.withParams({
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

export const wwellIrColumnDefs: ColDef<IntegratedRequirement>[] = [
  { headerName: 'ID', field: 'id', flex: 0.6, minWidth: 90 },
  { headerName: 'Requirement Code', field: 'requirementCode', flex: 1, minWidth: 150, cellStyle: { fontWeight: '700', color: '#3b82f6' } },
  { headerName: 'Description', field: 'description', flex: 1.8, minWidth: 200 },
  { headerName: 'Related Request', field: 'requestId', flex: 0.8, minWidth: 130 },
  { headerName: 'Integrated Date', field: 'integratedDate', flex: 1, minWidth: 130 },
  { headerName: 'Status', field: 'status', flex: 0.8, minWidth: 110 },
];

export const wwellIrGridOptions: GridOptions<IntegratedRequirement> = {
  animateRows: true,
  suppressMovableColumns: true,
  domLayout: 'autoHeight',
  defaultColDef: { sortable: true, filter: true, resizable: true },
  onGridReady: params => params.api.sizeColumnsToFit(),
};
