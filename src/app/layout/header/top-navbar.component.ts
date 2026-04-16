import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  input,
  output,
  inject,
  signal,
} from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthStore } from 'src/app/features/auth/store/auth.store';

@Component({
  selector: 'app-top-navbar',
  standalone: true,
  imports: [MatBadgeModule],
  templateUrl: './top-navbar.component.html',
  styleUrl: './top-navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopNavbarComponent {
  readonly sidenavCollapsed = input<boolean>(false);
  readonly toggleSidenav = output<void>();

  protected readonly auth = inject(AuthStore);
  protected readonly menuOpen = signal(false);

  readonly appTitle = 'Aramco Ground Water Application';
  readonly logoText = 'AGWA';

  @HostListener('document:click')
  protected closeUserMenu(): void {
    this.menuOpen.set(false);
  }

  protected toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen.update((open) => !open);
  }

  protected logout(event?: MouseEvent): void {
    event?.stopPropagation();
    this.menuOpen.set(false);
    this.auth.logout();
  }

  protected userInitial(): string {
    return this.auth.displayUsername().charAt(0).toUpperCase() || 'U';
  }
}
