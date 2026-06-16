import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActiveWwellStore } from '../store/active-wwell.store';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, GridOptions, RowClassParams, themeQuartz } from 'ag-grid-community';
import { CasingInfoViewModel, FormationInfoViewModel } from '@models/active-wwell/active-wwell-view.model';

type RowType = 'formation' | 'casing' | 'liner';

interface MergedDepthRow {
  name: string;
  size: string | number | null;
  prognosed: number | string | null;
  actualDepth: number | string | null;
  difference: number | string | null;
  remarks: string | null;
  sortDepth: number;
  rowType: RowType;
}

function toFiniteDepth(val: number | string | null | undefined): number {
  if (val === null || val === undefined || val === '') return Infinity;
  const n = Number(val);
  return isFinite(n) ? n : Infinity;
}

function effectiveDepth(
  actual: number | string | null | undefined,
  prognosed: number | string | null | undefined,
): number {
  const a = toFiniteDepth(actual);
  return isFinite(a) ? a : toFiniteDepth(prognosed);
}

@Component({
  selector: 'app-formation-tops-and-casing',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './formation-tops-and-casing.component.html',
  styleUrl: './formation-tops-and-casing.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormationTopsAndCasingComponent {
  private readonly store = inject(ActiveWwellStore);

  protected readonly data = computed((): MergedDepthRow[] => {
    const formations: MergedDepthRow[] = this.store.allFormationTops().map(
      (f: FormationInfoViewModel): MergedDepthRow => ({
        name: f.formation,
        size: null,
        prognosed: f.prognosed,
        actualDepth: f.actualDepth,
        difference: f.difference,
        remarks: f.remarks,
        sortDepth: effectiveDepth(f.actualDepth, f.prognosed),
        rowType: 'formation',
      }),
    );

    const casings: MergedDepthRow[] = (this.store.allCasingData() ?? []).map(
      (c: CasingInfoViewModel): MergedDepthRow => ({
        name: c.csgType,
        size: c.csgSize,
        prognosed: c.csgDepth,
        actualDepth: c.csgBotDpth,
        difference: null,
        remarks: null,
        sortDepth: effectiveDepth(c.csgBotDpth, c.csgDepth),
        rowType: c.csgType.toLowerCase().includes('liner') ? 'liner' : 'casing',
      }),
    );

    return [...formations, ...casings].sort((a, b) => a.sortDepth - b.sortDepth);
  });

  private readonly blankIfInvalid = ({ value }: { value: unknown }) =>
    value !== null && value !== undefined && value !== '' && isFinite(Number(value)) ? String(value) : '';

  columnDefs: ColDef[] = [
    { headerName: 'Name / Formation', field: 'name', tooltipField: 'name', minWidth: 130 },
    { headerName: 'Size', field: 'size', minWidth: 65, valueFormatter: this.blankIfInvalid },
    { headerName: 'Prognosed Depth', field: 'prognosed', minWidth: 100, valueFormatter: this.blankIfInvalid },
    { headerName: 'Actual Depth (ft)', field: 'actualDepth', minWidth: 110, valueFormatter: this.blankIfInvalid },
    { headerName: 'Difference', field: 'difference', minWidth: 90, valueFormatter: this.blankIfInvalid },
    { headerName: 'Remarks', field: 'remarks', flex: 1, minWidth: 90 },
  ];

  readonly theme = themeQuartz.withParams({
    accentColor: '#2563eb',
    backgroundColor: '#ffffff',
    foregroundColor: '#1e3a8a',
    headerBackgroundColor: '#2563eb',
    headerTextColor: '#ffffff',
    headerFontSize: 13,
    headerFontWeight: 700,
    rowHoverColor: '#e0f2fe',
    borderColor: 'transparent',
    borderRadius: 0,
    fontSize: 12,
    rowHeight: 28,
    headerHeight: 34,
    spacing: 2,
    fontFamily: 'inherit',
    cellHorizontalPaddingScale: 1.2,
  });

  defaultColDef: ColDef = {
    sortable: true,
    filter: false,
    resizable: true,
    minWidth: 65,
  };

  readonly gridOptions: GridOptions<MergedDepthRow> = {
    animateRows: true,
    suppressMovableColumns: true,
    suppressCellFocus: true,
    domLayout: 'autoHeight',
    tooltipShowDelay: 300,
    defaultColDef: this.defaultColDef,
    overlayNoRowsTemplate: '<span class="no-rows">No data available.</span>',
    getRowStyle: (params: RowClassParams<MergedDepthRow>) => {
      switch (params.data?.rowType) {
        case 'formation': return { background: '#eff6ff', color: '#1e3a8a' };
        case 'casing':    return { background: '#fef3c7', color: '#78350f' };
        case 'liner':     return { background: '#dcfce7', color: '#14532d' };
        default:          return undefined;
      }
    },
    onGridReady: (params) => params.api.sizeColumnsToFit(),
  };
}
