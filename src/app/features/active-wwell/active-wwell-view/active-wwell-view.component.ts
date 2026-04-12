import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CasingInfoComponent } from '../casing-info/casing-info.component';
import { DatabaseInfoComponent } from '../database-info/database-info.component';
import { FormationTopsAndCasingComponent } from '../formation-tops-and-casing/formation-tops-and-casing.component';
import { OperationSummaryComponent } from '../operation-summary/operation-summary.component';
import { WwellHeaderComponent } from '../wwell-header/wwell-header.component';
import { WwellTestComponent } from '../wwell-test/wwell-test.component';

@Component({
  selector: 'app-active-wwell-view',
  standalone: true,
  imports: [
    WwellHeaderComponent,
    OperationSummaryComponent,
    DatabaseInfoComponent,
    CasingInfoComponent,
    FormationTopsAndCasingComponent,
    WwellTestComponent,
  ],
  templateUrl: './active-wwell-view.component.html',
  styleUrl: './active-wwell-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActiveWwellViewComponent {}
