import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PresentationStore } from '../store/presentation.store';

@Component({
  selector: 'app-wwells-logs-indicators',
  standalone: true,
  templateUrl: './wwells-logs-indicators.component.html',
  styleUrl: './wwells-logs-indicators.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellsLogsIndicatorsComponent {
  protected readonly store = inject(PresentationStore);
}