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
    const groups = this.auth.user()?.groups ?? [];
    const defs   = this.rbac.roleDefinitions();
    return groups.map(g => defs.find(d => d.name === g)?.label ?? g);
  });

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
