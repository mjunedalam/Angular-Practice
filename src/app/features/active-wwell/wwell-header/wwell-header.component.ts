import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DrillingDataStore } from '@store/drilling-data/drilling-data.store';
import { ActiveWwellUiStore } from '../active-wwell-ui.store';
import { deriveStatusLabel } from '../active-wwell.helpers';

@Component({
  selector: 'app-wwell-header',
  standalone: true,
  imports: [],
  templateUrl: './wwell-header.component.html',
  styleUrl: './wwell-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellHeaderComponent {
  private readonly store = inject(DrillingDataStore);
  private readonly uiStore = inject(ActiveWwellUiStore);

  protected readonly data = this.store.wellHeaderData;

  protected readonly currentStatus = computed(() => {
    const epANum = this.store.selectedEpANum();
    return this.uiStore.statusForWell(epANum) ?? deriveStatusLabel(this.store.selectedWell());
  });
}
