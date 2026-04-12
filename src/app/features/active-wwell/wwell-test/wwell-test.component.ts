import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-wwell-test',
  standalone: true,
  imports: [],
  templateUrl: './wwell-test.component.html',
  styleUrl: './wwell-test.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellTestComponent {}
