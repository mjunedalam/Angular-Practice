import { ColDef, GridOptions, themeQuartz } from 'ag-grid-community';
import { LEGEND_CHIP_COLORS, tilesArray } from 'src/app/shared/models/config/agwa-map.config';

export interface StatusStat {
  status: string;
  count: number;
  color: string;
}

export interface StatusGroupRow {
  status: string;
  count: number;
  wellNames: string;
  color: string;
}

export interface AllWellRow {
  rigName: string;
  wellName: string;
  targetAquifer: string;
  status: string;
}

export const STATUS_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#84cc16',
  '#ec4899', '#14b8a6',
];

export const legendItems = tilesArray.map(t => ({
  biNum: t.biNum,
  color: LEGEND_CHIP_COLORS[t.biNum] ?? `rgb(${t.color[0]}, ${t.color[1]}, ${t.color[2]})`,
}));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const statusGroupColumnDefs: ColDef<StatusGroupRow>[] = [
  {
    headerName: 'Status',
    field: 'status',
    flex: 1,
    minWidth: 90,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cellRenderer: (p: any) => {
      const color: string = p.data?.color ?? '#60a5fa';
      return `<div style="display:flex;align-items:center;height:100%"><span style="display:inline-flex;align-items:center;gap:4px;padding:2px 9px 2px 6px;border-radius:999px;background:${color}1a;border:1px solid ${color}50;color:${color};font-weight:700;font-size:10px;line-height:1.5;white-space:nowrap"><span style="width:5px;height:5px;border-radius:50%;background:${color};flex-shrink:0;display:inline-block"></span>${p.value ?? ''}</span></div>`;
    },
  },
  {
    headerName: '#',
    field: 'count',
    width: 44,
    maxWidth: 44,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cellRenderer: (p: any) =>
      `<div style="display:flex;align-items:center;justify-content:center;height:100%"><span style="display:inline-flex;align-items:center;justify-content:center;min-width:22px;height:22px;border-radius:50%;background:#eff6ff;border:1px solid #bfdbfe;color:#1d4ed8;font-weight:800;font-size:10px">${p.value ?? ''}</span></div>`,
  },
  {
    headerName: 'Wells',
    field: 'wellNames',
    flex: 2,
    minWidth: 80,
    wrapText: true,
    autoHeight: true,
    cellStyle: { lineHeight: '1.6', paddingTop: '6px', paddingBottom: '6px', whiteSpace: 'pre-line', color: '#64748b', fontSize: '10px' },
  },
];

export const allWellColumnDefs: ColDef<AllWellRow>[] = [
  {
    headerName: 'Rig Name',
    field: 'rigName',
    flex: 1,
    minWidth: 60,
    cellStyle: { fontWeight: '600', display: 'flex', alignItems: 'center', fontSize: '13px', color: '#334155' },
  },
  {
    headerName: 'Well Name',
    field: 'wellName',
    flex: 1.2,
    minWidth: 70,
    cellStyle: { fontWeight: '700', color: '#3b82f6', display: 'flex', alignItems: 'center', fontSize: '13px' },
  },
  {
    headerName: 'Target Aquifer',
    field: 'targetAquifer',
    flex: 1.8,
    minWidth: 120,
    wrapText: true,
    autoHeight: true,
    cellStyle: {
      lineHeight: '1.5',
      paddingTop: '6px',
      paddingBottom: '6px',
      whiteSpace: 'normal',
      overflow: 'visible',
      wordBreak: 'break-word',
      fontSize: '14px',
      fontWeight: '700',
      color: '#475569',
    },
  },
];

export const statusGroupGridTheme = themeQuartz.withParams({
  accentColor: '#3b82f6',
  backgroundColor: '#ffffff',
  foregroundColor: '#1e293b',
  headerBackgroundColor: '#dbeafe',
  headerTextColor: '#1d4ed8',
  headerFontSize: 10,
  headerFontWeight: 700,
  rowHoverColor: 'rgba(59, 130, 246, 0.07)',
  oddRowBackgroundColor: '#fafbfc',
  borderColor: '#e2e8f0',
  borderRadius: 0,
  fontSize: 11,
  headerHeight: 30,
  spacing: 2,
  fontFamily: 'inherit',
  cellHorizontalPaddingScale: 1.2,
});

export const allWellsGridTheme = themeQuartz.withParams({
  accentColor: '#3b82f6',
  backgroundColor: '#ffffff',
  foregroundColor: '#1e293b',
  headerBackgroundColor: '#dbeafe',
  headerTextColor: '#1d4ed8',
  headerFontSize: 15,
  headerFontWeight: 800,
  rowHoverColor: 'rgba(59, 130, 246, 0.07)',
  oddRowBackgroundColor: '#fafbfc',
  borderColor: '#e2e8f0',
  borderRadius: 0,
  fontSize: 15,
  rowHeight: 40,
  headerHeight: 38,
  spacing: 3,
  fontFamily: 'inherit',
  cellHorizontalPaddingScale: 1.2,
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const statusGroupGridOptions: GridOptions<any> = {
  animateRows: true,
  suppressMovableColumns: true,
  suppressCellFocus: true,
  domLayout: 'normal',
  tooltipShowDelay: 300,
  defaultColDef: { sortable: true, filter: false, resizable: true },
  overlayNoRowsTemplate: '<span style="color:#94a3b8;font-size:12px">No data</span>',
  onGridReady: (params) => params.api.sizeColumnsToFit(),
};

export const allWellsGridOptions: GridOptions<AllWellRow> = {
  animateRows: true,
  suppressMovableColumns: true,
  suppressCellFocus: true,
  domLayout: 'autoHeight',
  tooltipShowDelay: 300,
  defaultColDef: { sortable: true, filter: false, resizable: false, wrapHeaderText: true, autoHeaderHeight: true },
  overlayNoRowsTemplate: '<span style="color:#94a3b8;font-size:12px">No data</span>',
  onGridReady: (params) => params.api.sizeColumnsToFit(),
};
