import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DrillingDataStore } from '@store/drilling-data/drilling-data.store';

@Component({
  selector: 'app-database-info',
  standalone: true,
  imports: [],
  templateUrl: './database-info.component.html',
  styleUrl: './database-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatabaseInfoComponent {
  private readonly store = inject(DrillingDataStore);

  protected readonly data = this.store.databaseInfo;
}
