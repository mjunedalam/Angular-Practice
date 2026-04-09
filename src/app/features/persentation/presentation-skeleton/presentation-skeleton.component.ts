import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-presentation-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './presentation-skeleton.component.html',
  styleUrl: './presentation-skeleton.component.scss',
})
export class PresentationSkeletonComponent {}
