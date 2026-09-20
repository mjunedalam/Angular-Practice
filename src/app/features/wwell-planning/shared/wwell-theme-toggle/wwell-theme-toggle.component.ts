import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { WwellThemeService } from '../wwell-theme.service';

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
}
