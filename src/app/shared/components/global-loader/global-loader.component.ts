import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LoaderService } from './loader.service';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './global-loader.component.html',
  styleUrl:    './global-loader.component.scss',
})
export class GlobalLoaderComponent {
  protected readonly loader = inject(LoaderService);
}
