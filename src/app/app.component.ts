import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GlobalLoaderComponent } from './shared/components/global-loader/global-loader.component';
import { AuthStore } from './core/store/auth/auth.store';
import { ThemeStore } from './core/store/theme/theme.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, GlobalLoaderComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <router-outlet />
    <app-global-loader />
  `,
  styles: [`:host { display: block; height: 100vh; overflow: hidden; }`],
})
export class AppComponent {
  // Injecting ThemeStore here triggers its instantiation at app startup,
  // which fires withHooks.onInit → sets data-theme on <html>
  private readonly _theme = inject(ThemeStore);
  private readonly _auth = inject(AuthStore);

  constructor() {
    this._auth.autoLogin();
  }
}
