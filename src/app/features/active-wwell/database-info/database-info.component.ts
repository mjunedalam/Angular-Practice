import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-database-info',
  standalone: true,
  imports: [],
  templateUrl: './database-info.component.html',
  styleUrl: './database-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatabaseInfoComponent {}
