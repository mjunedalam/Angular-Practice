import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-casing-info',
  standalone: true,
  imports: [],
  templateUrl: './casing-info.component.html',
  styleUrl: './casing-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CasingInfoComponent {}
