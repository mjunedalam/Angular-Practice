import {
  ChangeDetectionStrategy,
  Component,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalLoaderComponent } from '@shared/components/global-loader/global-loader.component';
import { NotificationComponent } from '@shared/components/notification/notification.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GlobalLoaderComponent, NotificationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <router-outlet />
    <app-global-loader />
    <app-notification />
  `,
  styles: [`:host { display: block; height: 100vh; overflow: hidden; }`],
})
export class AppComponent {}
