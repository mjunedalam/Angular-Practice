import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { LoaderService } from '../loader.service';

@Component({
  selector: 'app-global-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './global-loader.component.html',
  styleUrl:    './global-loader.component.scss',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.94)' }),
        animate('220ms cubic-bezier(.4,0,.2,1)', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate('200ms cubic-bezier(.4,0,.2,1)', style({ opacity: 0, transform: 'scale(0.94)' })),
      ]),
    ]),
  ],
})
export class GlobalLoaderComponent {
  protected readonly loader = inject(LoaderService);
}