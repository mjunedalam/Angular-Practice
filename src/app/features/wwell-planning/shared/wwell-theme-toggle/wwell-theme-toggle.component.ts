import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WwellThemeService } from '../wwell-theme.service';

/**
 * The shell's appearance control: a one-press light/dark button, and one Legacy button that swaps the
 * redesigned top bar and left nav for the old navy ones (and back). Both buttons only drive
 * `WwellThemeService`; there is nothing else to configure.
 */
@Component({
  selector: 'app-wwell-theme-toggle',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './wwell-theme-toggle.component.html',
  styleUrl: './wwell-theme-toggle.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WwellThemeToggleComponent {
  protected readonly theme = inject(WwellThemeService);

  protected toggleLegacy(): void {
    this.theme.setLegacyShell(!this.theme.isLegacyShell());
  }
}
