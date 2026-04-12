import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-wwell-header',
  standalone: true,
  imports: [],
  templateUrl: './wwell-header.component.html',
  styleUrl: './wwell-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellHeaderComponent {}
