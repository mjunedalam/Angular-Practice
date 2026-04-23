import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DrillingDataStore } from '@store/drilling-data/drilling-data.store';

@Component({
  selector: 'app-wwells-logs-indicators',
  standalone: true,
  templateUrl: './wwells-logs-indicators.component.html',
  styleUrl: './wwells-logs-indicators.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellsLogsIndicatorsComponent {
  protected readonly store = inject(DrillingDataStore);
}