import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { DrillingDataStore } from '@store/drilling-data/drilling-data.store';

@Component({
  selector: 'app-wwell-test',
  standalone: true,
  imports: [MatButtonModule],
  templateUrl: './wwell-test.component.html',
  styleUrl: './wwell-test.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellTestComponent {
  private readonly store = inject(DrillingDataStore);

  protected readonly data = this.store.wwellTest;

  protected readonly isFlowTest = computed(() => {
    const data = this.data();
    if (!data) return false;
    return data.flowType === 'Y' || data.testType.toLowerCase() === 'flow';
  });
}
