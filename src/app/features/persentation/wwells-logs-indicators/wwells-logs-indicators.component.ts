import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WellStore } from 'src/app/core/store/well.store';

@Component({
  selector: 'app-wwells-logs-indicators',
  standalone: true,
  templateUrl: './wwells-logs-indicators.component.html',
  styleUrl: './wwells-logs-indicators.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellsLogsIndicatorsComponent {
  protected readonly store = inject(WellStore);
}