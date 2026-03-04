import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { TopNavbarComponent } from './top-navbar/top-navbar.component';
import { LeftSidenavComponent } from './left-sidenav/left-sidenav.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [TopNavbarComponent, LeftSidenavComponent, RouterOutlet],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent {
  private  readonly router           = inject(Router);
  protected readonly sidenavCollapsed = signal<boolean>(false);
  protected readonly activeRoute      = signal<string>('home');

  constructor() {
    // Keep active nav item in sync with browser URL
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const segment = e.urlAfterRedirects.split('/').filter(Boolean)[0] ?? 'home';
        this.activeRoute.set(segment);
      });
  }

  protected toggleSidenav(): void {
    this.sidenavCollapsed.update((v) => !v);
  }

  protected onNavItemClick(id: string): void {
    this.activeRoute.set(id);
    this.router.navigate([id]);
  }
}