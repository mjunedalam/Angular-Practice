import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthStore } from '../auth/store/auth.store';
import { RbacStore } from '@store/rbac/rbac.store';

interface QuickListItem {
  label: string;
  route: string;
  routeId?: string;
  iconPaths: string[];
  color: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MatTooltipModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly router    = inject(Router);
  private readonly authStore = inject(AuthStore);
  private readonly rbacStore = inject(RbacStore);

  protected readonly quickItems: QuickListItem[] = [
    {
      label: 'Reports',
      route: 'morning-report',
      routeId: 'morning-report',
      iconPaths: [
        'M9 17v-2m3 2v-4m3 4v-6M5 20h14a2 2 0 002-2V8l-5-5H5a2 2 0 00-2 2v13a2 2 0 002 2z',
      ],
      color: '#3b82f6',
    },
    {
      label: 'Active Water Well Map',
      route: 'active-wwell',
      routeId: 'active-wwell',
      iconPaths: [
        'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
        'M12 11.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z',
      ],
      color: '#06b6d4',
    },
    {
      label: 'Presentation',
      route: 'presentations',
      routeId: 'presentations',
      iconPaths: [
        'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
        'M15 12a3 3 0 11-6 0 3 3 0 016 0z',
      ],
      color: '#22d3ee',
    },
  ];

  protected readonly lockedRouteIds = computed(() => {
    const userRoles = this.authStore.user()?.groups ?? [];
    return new Set(
      this.quickItems
        .filter(item => item.routeId && !this.rbacStore.canAccessRoute(item.routeId, userRoles))
        .map(item => item.routeId!),
    );
  });

  protected isLocked(item: QuickListItem): boolean {
    return !!item.routeId && this.lockedRouteIds().has(item.routeId);
  }

  protected navigate(route: string): void {
    this.router.navigate(['main', route]);
  }
}
