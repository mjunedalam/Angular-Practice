import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-operation-summary',
  standalone: true,
  imports: [],
  templateUrl: './operation-summary.component.html',
  styleUrl: './operation-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OperationSummaryComponent {}
