import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ColDef, themeQuartz } from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { ActiveWwellStore } from '../store/active-wwell.store';

@Component({
  selector: 'app-casing-info',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './casing-info.component.html',
  styleUrl: './casing-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CasingInfoComponent {
  private readonly store = inject(ActiveWwellStore);

  protected readonly data = this.store.allCasingData;

  columnDefs: ColDef[] = [
    { headerName: 'Casing Type', field: 'csgType' },
    { headerName: 'Casing Size', field: 'csgSize' },
    { headerName: 'Casing Depth', field: 'csgDepth' }
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


  defaultColDef: ColDef = {
    sortable: true,
    filter: false,
    resizable: true,
    minWidth: 130,
    //valueGetter: params => params.value ?? 'N/A'
  };

  onGridReady(params: any) {
    params.api.sizeColumnsToFit();
  }

}
