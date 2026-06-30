import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RbacStore } from '@store/rbac/rbac.store';
import { ACTIONS } from '@models/rbac/role.constants';
import { NotificationService } from '@shared/components/notification/notification.service';

const ACCESS_RESTRICTED_MESSAGE =
  'Access Restricted — contact your administrator to request access to this module.';

interface QuickListItem {
  label: string;
  route: string;
  routeId?: string;
  iconPaths: string[];
  iconImage?: string;
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
  private readonly rbacStore = inject(RbacStore);
  private readonly notificationService = inject(NotificationService);

  protected readonly quickItems: QuickListItem[] = [
    {
      label: 'Active Water Well',
      route: 'active-wwell',
      routeId: 'active-wwell',
      iconPaths: [
        'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
        'M12 11.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z',
      ],
      iconImage: 'assets/images/oil-rig-icon.png',
      color: '#06b6d4',
    },
    {
      label: 'Reports',
      route: 'morning-report',
      routeId: 'morning-report',
      iconPaths: [
        'M5 4h14a3 3 0 013 3v10a3 3 0 01-3 3H5a3 3 0 01-3-3V7a3 3 0 013-3z',
        'M2 7l10 7 10-7',
      ],
      color: '#3b82f6',
    },
    
    {
      label: 'Presentation',
      route: 'water-wells-overview',
      routeId: 'presentations',
      iconPaths: [
        'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
      ],
      color: '#22d3ee',
    },
  ];

  protected readonly lockedRouteIds = computed(() =>
    new Set(
      this.quickItems
        .filter(item => item.routeId && !this.rbacStore.hasPermission(item.routeId, ACTIONS.READ))
        .map(item => item.routeId!),
    ),
  );

  protected isLocked(item: QuickListItem): boolean {
    return !!item.routeId && this.lockedRouteIds().has(item.routeId);
  }

  protected navigate(item: QuickListItem): void {
    if (this.isLocked(item)) {
      this.notificationService.error(ACCESS_RESTRICTED_MESSAGE);
      return;
    }
    this.router.navigate(['main', item.route]);
  }
}
