import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { WellStore } from '@store/active-wwell/active-wwell.store';

@Component({
  selector: 'app-database-info',
  standalone: true,
  imports: [],
  templateUrl: './database-info.component.html',
  styleUrl: './database-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatabaseInfoComponent {
  private readonly store = inject(WellStore);

  protected readonly data = this.store.databaseInfo;
}
