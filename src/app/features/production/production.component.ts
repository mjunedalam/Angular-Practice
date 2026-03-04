import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-production',
  imports: [],
  templateUrl: './production.component.html',
  styleUrl: './production.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductionComponent {

}
