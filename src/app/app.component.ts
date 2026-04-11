import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { NavigationEnd, NavigationStart, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { GlobalLoaderComponent } from './shared/components/global-loader/global-loader.component';
import { LoaderService } from './shared/components/global-loader/loader.service';
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
export class AppComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly loader = inject(LoaderService);
  // Injecting ThemeStore here triggers its instantiation at app startup,
  // which fires withHooks.onInit → sets data-theme on <html>
  private readonly _theme = inject(ThemeStore);

  ngOnInit(): void {
    this.router.events
      .pipe(filter(e => e instanceof NavigationStart))
      .subscribe(() => this.loader.show());

    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.loader.hide());
  }
}
