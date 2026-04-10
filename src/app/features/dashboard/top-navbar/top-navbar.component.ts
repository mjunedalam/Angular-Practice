import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { ThemeStore } from 'src/app/core/store/theme/theme.store';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-top-navbar',
  standalone: true,
  imports: [AvatarModule, BadgeModule],
  templateUrl: './top-navbar.component.html',
  styleUrl: './top-navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopNavbarComponent {
  readonly sidenavCollapsed = input<boolean>(false);
  readonly toggleSidenav    = output<void>();

  protected readonly theme = inject(ThemeStore);

  readonly appTitle = 'Aramco Ground Water Application';
  readonly userName = 'Abdulrahman';
  readonly logoText = 'AGWA';
}