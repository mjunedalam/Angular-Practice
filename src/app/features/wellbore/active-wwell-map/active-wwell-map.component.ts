import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-active-wwell-map',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './active-wwell-map.component.html',
  styleUrl: './active-wwell-map.component.scss'
})
export class ActiveWwellMapComponent {}