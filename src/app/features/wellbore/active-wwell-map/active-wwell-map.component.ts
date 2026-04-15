import { Component, computed, inject, OnInit } from '@angular/core';
import { SHARED_MODULES } from '../../../shared/shared.module';
import { MorningReportStore } from '../../../core/stores/moringreport/morning-report.store';
import { WwellTestComponent } from "../wwell-test/wwell-test.component";
import { DatabaseInfoComponent } from "../database-info/database-info.component";
import { WwellHeaderComponent } from "../wwell-header/wwell-header.component";
import { OperationSummaryComponent } from "../operation-summary/operation-summary.component";
import { FormationTopsAndCasingComponent } from "../formation-tops-and-casing/formation-tops-and-casing.component";
import { FileUploadComponent } from "../../../shared/components/file-upload/file-upload.component";
import { WaterWellDataStore } from '../../../core/stores/wwell-data/wwell-data.store';
import { CasingInfoComponent } from '../casing-info/casing-info.component';

@Component({
  selector: 'app-active-wwell-view',
  imports: [...SHARED_MODULES, WwellTestComponent, DatabaseInfoComponent, WwellHeaderComponent, OperationSummaryComponent, FormationTopsAndCasingComponent, FileUploadComponent, CasingInfoComponent],
  templateUrl: './active-wwell-view.component.html',
  styleUrl: './active-wwell-view.component.scss'
})
export class ActiveWwellViewComponent implements OnInit {

  morningReportStore = inject(MorningReportStore)
  wwellDataStore = inject(WaterWellDataStore);


  selectedValue: string | undefined;
  statuses = [{ value: 'Test1' },
  { value: 'Test2' }
  ];

  selectedArea: string | undefined;
  areas = [{ value: 'RAK' },
  { value: 'Central' },
  { value: 'North West' },
  { value: 'Jafurah' },
  { value: 'Gh' }
  ];


  ngOnInit() {
    this.morningReportStore.showAll();
    this.morningReportStore.loadMorningReportData();
    this.wwellDataStore.loadWellNames();
  }

  files: File[] = [];

  onFileChange(event: any) {
    const files = event.target.files;
    this.files = Array.from(files);
  }

  previewFile(file: File) {
    // Add your preview logic here
    console.log(file);
  }

  removeFile(index: number) {
    this.files.splice(index, 1);
  }

  onWellSelect(id: any) {
    this.wwellDataStore.selectWell(id);
  }

}
