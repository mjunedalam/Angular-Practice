import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActiveWwellStore } from '../store/active-wwell.store';

@Component({
  selector: 'app-operation-summary',
  standalone: true,
  imports: [],
  templateUrl: './operation-summary.component.html',
  styleUrl: './operation-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationSummaryComponent {
  private readonly store = inject(ActiveWwellStore);

  protected readonly data = this.store.operationSummary;
}
