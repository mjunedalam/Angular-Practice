import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthStore } from '../../features/auth/store/auth.store';
import { RbacStore } from '@store/rbac/rbac.store';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  routeId?: string;
  badge?: string | number;
  active?: boolean;
}

@Component({
  selector: 'app-left-sidenav',
  standalone: true,
  imports: [MatTooltipModule],
  templateUrl: './left-sidenav.component.html',
  styleUrl: './left-sidenav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeftSidenavComponent {
  private readonly authStore = inject(AuthStore);
  private readonly rbacStore = inject(RbacStore);

  readonly collapsed    = input<boolean>(false);
  readonly activeRoute  = input<string>('home');
  readonly navItemClick = output<string>();

  readonly navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: 'M3 12L12 3l9 9M5 10v10a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V10',
      active: true,
    },
    {
      id: 'morning-report',
      label: 'Reports',
      routeId: 'morning-report',
      icon: 'M9 17v-2m3 2v-4m3 4v-6M5 20h14a2 2 0 002-2V8l-5-5H5a2 2 0 00-2 2v13a2 2 0 002 2z',
    },
    {
      id: 'active-wwell',
      label: 'Active Water Well',
      routeId: 'active-wwell',
      icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
    },
    {
      id: 'presentations',
      label: 'Presentations',
      routeId: 'presentations',
      icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    },
  ];

  protected readonly lockedRouteIds = computed(() => {
    const userRoles = this.authStore.user()?.groups ?? [];
    return new Set(
      this.navItems
        .filter(item => item.routeId && !this.rbacStore.canAccessRoute(item.routeId, userRoles))
        .map(item => item.routeId!),
    );
  });

  protected isLocked(item: NavItem): boolean {
    return !!item.routeId && this.lockedRouteIds().has(item.routeId);
  }

  protected onItemClick(id: string): void {
    this.navItemClick.emit(id);
  }
}
