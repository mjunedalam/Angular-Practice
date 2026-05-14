import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { TopNavbarComponent } from './header/top-navbar.component';
import { LeftSidenavComponent } from './sidebar/left-sidenav.component';
import { LoaderService } from '@shared/components/global-loader/loader.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [TopNavbarComponent, LeftSidenavComponent, RouterOutlet],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  private  readonly router           = inject(Router);
  private  readonly loader           = inject(LoaderService);
  protected readonly sidenavCollapsed = signal<boolean>(false);
  protected readonly activeRoute      = signal<string>('home');

  constructor() {
    // Keep active nav item in sync with browser URL
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const segment = e.urlAfterRedirects.split('/').filter(Boolean)[1] ?? 'home';
        this.activeRoute.set(segment);
      });

    // Fire after the first full render cycle — child ngOnInit calls (which register
    // boot tasks) have already run by this point, so completeBootIfReady() sees the
    // correct task count before deciding whether to close the native bar.
    afterNextRender(() => this.loader.markAppShellReady());
  }

  protected toggleSidenav(): void {
    this.sidenavCollapsed.update((v) => !v);
  }

  protected onNavItemClick(id: string): void {
    this.activeRoute.set(id);
    this.router.navigate(['main', id]);
  }
}
