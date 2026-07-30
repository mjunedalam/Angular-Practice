import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RbacStore } from '@store/rbac/rbac.store';
import { ACTIONS } from '@models/rbac/role.constants';
import { BuildInfoService } from '@shared/services/build-info.service';
import { NotificationService } from '@shared/components/notification/notification.service';

const ACCESS_RESTRICTED_MESSAGE =
  'Access Restricted — contact your administrator to request access to this module.';

export interface NavItem {
  id: string;
  label: string;
  icon: string;
  iconImage?: string;
  routeId?: string;
  badge?: string | number;
  active?: boolean;
  section?: string;
}

export interface NavGroup {
  section: string | null;
  items: NavItem[];
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
  private readonly rbacStore = inject(RbacStore);
  private readonly buildInfoService = inject(BuildInfoService);
  private readonly notificationService = inject(NotificationService);

  protected readonly buildInfo = this.buildInfoService.info;
  protected readonly shortHash = this.buildInfoService.shortHash;

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

    // PLANNING (open to all roles for now — no RBAC gating yet)
    {
      id: 'requests',
      label: 'Requests',
      section: 'PLANNING',
      icon: 'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
    },
    {
      id: 'wlda-approvals',
      label: 'WLDA Approvals',
      section: 'PLANNING',
      icon: 'M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3',
    },
    {
      id: 'land-affairs-approvals',
      label: 'Land Affairs Approvals',
      section: 'PLANNING',
      icon: 'M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3',
    },
    {
      id: 'integrated-requirements',
      label: 'Integrated Requirements',
      section: 'PLANNING',
      icon: 'M9 2h6a1 1 0 011 1v2H8V3a1 1 0 011-1z M8 4H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2 M9 12h6 M9 16h6',
    },

    // OPERATIONS
    {
      id: 'active-wwell',
      label: 'Active Water Well',
      section: 'OPERATIONS',
      routeId: 'active-wwell',
      icon: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
      iconImage: 'assets/images/oil-rig-icon.png',
    },
    {
      id: 'morning-report',
      label: 'Report',
      section: 'OPERATIONS',
      routeId: 'morning-report',
      icon: 'M5 4h14a3 3 0 013 3v10a3 3 0 01-3 3H5a3 3 0 01-3-3V7a3 3 0 013-3zM2 7l10 7 10-7',
    },
    {
      id: 'water-wells-overview',
      label: 'Presentation',
      section: 'OPERATIONS',
      routeId: 'presentations',
      icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    },
  ];

  protected readonly navGroups: NavGroup[] = this.navItems.reduce<NavGroup[]>((groups, item) => {
    const section = item.section ?? null;
    const last = groups[groups.length - 1];
    return last && last.section === section
      ? [...groups.slice(0, -1), { section, items: [...last.items, item] }]
      : [...groups, { section, items: [item] }];
  }, []);

  protected readonly lockedRouteIds = computed(() =>
    new Set(
      this.navItems
        .filter(item => item.routeId && !this.rbacStore.hasPermission(item.routeId, ACTIONS.READ))
        .map(item => item.routeId!),
    ),
  );

  protected isLocked(item: NavItem): boolean {
    return !!item.routeId && this.lockedRouteIds().has(item.routeId);
  }

  protected onItemClick(item: NavItem): void {
    if (this.isLocked(item)) {
      this.notificationService.error(ACCESS_RESTRICTED_MESSAGE);
      return;
    }
    this.navItemClick.emit(item.id);
  }
}
