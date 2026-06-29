import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthStore } from 'src/app/features/auth/store/auth.store';
import { RbacStore } from '@store/rbac/rbac.store';

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

  protected readonly auth     = inject(AuthStore);
  protected readonly rbac     = inject(RbacStore);
  protected readonly menuOpen = signal(false);

  protected readonly userRoleLabels = computed(() => {
    // After permissions load: if the backend granted nothing, the JWT groups are stale/revoked.
    if (this.rbac.isLoaded() && Object.keys(this.rbac.userPermissions()).length === 0) {
      return [];
    }
    return (this.auth.user()?.groups as string[] | undefined) ?? [];
  });

  protected readonly lastLoginDisplay = computed(() => {
    const d = this.auth.lastLogin();
    if (!d) return null;
    return d.toLocaleString('en-US', {
      timeZone: 'Asia/Riyadh',
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  });

  readonly appTitle = 'Aramco Ground Water Application';
  readonly logoText = 'AGWA';
  protected readonly profileSubtitle = computed(() => this.auth.userEmail() ?? 'Ground Water Team');
  protected readonly roleCountLabel = computed(() => {
    const count = this.userRoleLabels().length;
    if (count === 0) return 'No roles assigned';
    return count === 1 ? '1 role assigned' : `${count} roles assigned`;
  });

  @HostListener('document:click')
  protected closeUserMenu(): void {
    if (this.menuOpen()) {
      this.menuOpen.set(false);
    }
  }

  @HostListener('document:keydown.escape')
  protected closeUserMenuOnEscape(): void {
    this.menuOpen.set(false);
  }

  protected toggleUserMenu(event: MouseEvent): void {
    event.stopPropagation();
    this.menuOpen.update((open) => !open);
  }

  protected keepMenuOpen(event: Event): void {
    event.stopPropagation();
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
