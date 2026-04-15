import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
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

  protected readonly barGradient = computed(() => {
    const p = this.loader.progress() / 100; // 0 → 1
    // Blue #3b82f6 → Green #22c55e
    const r = Math.round(59  + (34  - 59)  * p);
    const g = Math.round(130 + (197 - 130) * p);
    const b = Math.round(246 + (94  - 246) * p);
    return `linear-gradient(to right, #3b82f6, rgb(${r},${g},${b}))`;
  });
}
