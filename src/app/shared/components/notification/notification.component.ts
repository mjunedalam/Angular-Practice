import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import { NotificationService } from './notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [NgFor, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss',
})
export class NotificationComponent {
  protected readonly svc = inject(NotificationService);
}
