import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActiveWwellStore } from '../store/active-wwell.store';
import { ActiveWwellFormService } from '../active-wwell-form.service';

@Component({
  selector: 'app-wwell-header',
  standalone: true,
  imports: [],
  templateUrl: './wwell-header.component.html',
  styleUrl: './wwell-header.component.scss'
})
export class WwellHeaderComponent {
  protected readonly store = inject(ActiveWwellStore);
  protected readonly activeWwellFormService = inject(ActiveWwellFormService);

  protected readonly data = this.store.wellHeaderData;

  protected readonly currentStatus = this.store.status();

  protected readonly drillingForm = this.activeWwellFormService.drillingRemarksForm
  
}
