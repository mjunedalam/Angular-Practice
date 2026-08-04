import { ColDef, GridOptions, ValueFormatterParams, themeQuartz } from 'ag-grid-community';
import { IntegratedRequirementOffsetWell } from '@models/wwell-planning/wwell-planning.model';

const EMPTY_VALUE = '—';

function numFormatter(unit?: string) {
  return (params: ValueFormatterParams<IntegratedRequirementOffsetWell, number | null | undefined>): string => {
    if (params.value === null || params.value === undefined) return EMPTY_VALUE;
    return unit ? `${params.value} ${unit}` : `${params.value}`;
  };
}

function strFormatter(params: ValueFormatterParams<IntegratedRequirementOffsetWell, string | null | undefined>): string {
  return params.value ? params.value : EMPTY_VALUE;
}

// Same accent/navy tokens as `wwell-requests.config.ts`'s grid theme — kept as its own local
// const rather than a shared import, matching how every other embedded grid in this app
// (formation-tops-and-casing, picked-formation-tops, water-wells-overview) defines its own theme.
export const wwellIrOffsetWellsGridTheme = themeQuartz.withParams({
  accentColor: '#3b82f6',
  backgroundColor: '#ffffff',
  foregroundColor: '#1e293b',
  headerBackgroundColor: '#dbeafe',
  headerTextColor: '#1d4ed8',
  headerFontSize: 12,
  headerFontWeight: 700,
  rowHoverColor: '#eff6ff',
  borderColor: '#e2e8f0',
  borderRadius: 8,
  fontSize: 12.5,
  rowHeight: 38,
  headerHeight: 36,
});

// Every column below sets an explicit `width` — AG Grid falls back to its own 200px default
// for any column that only declares `minWidth`, which blew this grid out to ~2800px (14 × 200)
// instead of the ~1350px these columns actually need.
export const wwellIrOffsetWellsColumnDefs: ColDef<IntegratedRequirementOffsetWell>[] = [
  { headerName: 'Well Name', field: 'wellName', pinned: 'left', width: 150, minWidth: 130, cellStyle: { fontWeight: '700', color: '#1e293b' } },
  { headerName: 'Distance', field: 'distanceKm', width: 95, minWidth: 85, valueFormatter: numFormatter('km') },
  { headerName: 'Location', field: 'location', width: 110, minWidth: 90, valueFormatter: strFormatter },
  { headerName: 'Aquifer', field: 'aquifer', width: 120, minWidth: 100, valueFormatter: strFormatter },
  { headerName: 'TD', field: 'totalDepthFt', width: 85, minWidth: 75, valueFormatter: numFormatter('ft') },
  { headerName: 'Duration', field: 'testDurationMin', width: 95, minWidth: 85, valueFormatter: numFormatter('min') },
  { headerName: 'Rate', field: 'rateGpm', width: 95, minWidth: 85, valueFormatter: numFormatter('GPM') },
  { headerName: 'RPM', field: 'rpm', width: 80, minWidth: 70, valueFormatter: numFormatter() },
  { headerName: 'SWL', field: 'swlFt', width: 80, minWidth: 70, valueFormatter: numFormatter('ft') },
  { headerName: 'PWL', field: 'pwlFt', width: 80, minWidth: 70, valueFormatter: numFormatter('ft') },
  { headerName: 'Drawdown', field: 'drawdownFt', width: 100, minWidth: 90, valueFormatter: numFormatter('ft') },
  { headerName: 'Spec Cap', field: 'specificCapacity', width: 95, minWidth: 85, valueFormatter: numFormatter() },
  { headerName: 'TDS', field: 'tdsPpm', width: 85, minWidth: 75, valueFormatter: numFormatter('ppm') },
  { headerName: 'H2S', field: 'h2sPpm', width: 85, minWidth: 75, valueFormatter: numFormatter('ppm') },
];

export const wwellIrOffsetWellsGridOptions: GridOptions<IntegratedRequirementOffsetWell> = {
  animateRows: true,
  suppressMovableColumns: true,
  suppressCellFocus: true,
  domLayout: 'autoHeight',
  rowHeight: 38,
  headerHeight: 36,
  defaultColDef: { sortable: true, filter: false, resizable: true },
  overlayNoRowsTemplate:
    '<span style="font-size:0.82rem;color:#64748b;font-style:italic;">No offset wells recorded.</span>',
};
