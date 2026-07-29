import { ChangeDetectionStrategy, Component, ViewEncapsulation, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-wwell-form-dialog-shell',
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  templateUrl: './wwell-form-dialog-shell.component.html',
  styleUrl: './wwell-form-dialog-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class WwellFormDialogShellComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly requiredHint = input(true);
  readonly closed = output<void>();
}
