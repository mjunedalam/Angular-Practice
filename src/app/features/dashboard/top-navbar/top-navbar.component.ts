import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  ViewChild,
} from '@angular/core';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { ThemeStore } from 'src/app/core/store/theme/theme.store';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { Popover, PopoverModule } from 'primeng/popover';

@Component({
  selector: 'app-top-navbar',
  standalone: true,
  imports: [AvatarModule, BadgeModule, ButtonModule, PopoverModule],
  templateUrl: './top-navbar.component.html',
  styleUrl: './top-navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopNavbarComponent {
  @ViewChild('userMenu') private userMenu?: Popover;

  readonly sidenavCollapsed = input<boolean>(false);
  readonly toggleSidenav    = output<void>();

  protected readonly theme = inject(ThemeStore);
  protected readonly auth = inject(AuthStore);

  readonly appTitle = 'Aramco Ground Water Application';
  readonly logoText = 'AGWA';

  protected openUserMenu(event: MouseEvent): void {
    this.userMenu?.toggle(event);
  }

  protected logout(): void {
    this.userMenu?.hide();
    this.auth.logout();
  }

  protected userInitial(): string {
    return this.auth.displayUsername().charAt(0).toUpperCase() || 'U';
  }
}
