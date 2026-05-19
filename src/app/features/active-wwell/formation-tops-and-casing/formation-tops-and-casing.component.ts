import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActiveWwellStore } from '../store/active-wwell.store';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef, themeQuartz } from 'ag-grid-community';

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

  protected readonly data = this.store.formationInfo;

  columnDefs: ColDef[] = [
    { headerName: 'Formation', field: 'formation', tooltipField: 'formation' },
    { headerName: 'Prognosed', field: 'prognosed', tooltipField: 'prognosed' },
    { headerName: 'Actual Depth (ft)', field: 'actualDepth', tooltipField: 'actualDepth' },
    { headerName: 'Difference', field: 'difference', tooltipField: 'difference' },
    { headerName: 'Remarks', field: 'remarks', tooltipField: 'remarks', flex: 1 }
  ];

  readonly theme = themeQuartz.withParams({
    accentColor: '#2563eb',
    backgroundColor: '#ffffff',
    foregroundColor: '#1e3a8a',
    headerBackgroundColor: '#2563eb',
    headerTextColor: '#ffffff',
    headerFontSize: 13,
    headerFontWeight: 700,
    rowHoverColor: '#eff6ff',
    oddRowBackgroundColor: '#eff6ff',
    borderColor: 'transparent',
    borderRadius: 0,
    fontSize: 12,
    rowHeight: 36,
    headerHeight: 40,
    spacing: 2,
    fontFamily: 'inherit',
    cellHorizontalPaddingScale: 1.5,
  });

  rowData = [
    {
      formation: 'Sandstone',
      prognosed: '1500',
      actualDepth: '1523',
      difference: '+23',
      remarks: 'Good quality'
    },
    {
      formation: 'Shale',
      prognosed: '2000',
      actualDepth: '1995',
      difference: '-5',
      remarks: 'High pressure'
    },
    {
      formation: 'Limestone',
      prognosed: '2500',
      actualDepth: null,
      difference: null,
      remarks: null
    }
  ];

  defaultColDef: ColDef = {
    sortable: true,
    filter: false,
    resizable: true,
    minWidth: 120
  };

  onGridReady(params: any) {
    params.api.sizeColumnsToFit();
  }

}
