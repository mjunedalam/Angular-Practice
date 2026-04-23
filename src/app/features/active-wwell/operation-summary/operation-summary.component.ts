import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DrillingDataStore } from '@store/drilling-data/drilling-data.store';

@Component({
  selector: 'app-operation-summary',
  standalone: true,
  imports: [],
  templateUrl: './operation-summary.component.html',
  styleUrl: './operation-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationSummaryComponent {
  private readonly store = inject(DrillingDataStore);

  protected readonly data = this.store.operationSummary;
}
