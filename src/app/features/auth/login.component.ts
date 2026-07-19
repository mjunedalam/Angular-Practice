// login.component.ts
import { afterNextRender, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from 'src/app/features/auth/store/auth.store';
import { LoaderService } from '@shared/components/global-loader/loader.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    MatButtonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  protected readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly loader = inject(LoaderService);

  protected readonly sessionExpiredMessage = signal<string | null>(null);

  constructor() {
    // If the user already has a valid session, send them straight to the app.
    if (this.authStore.isAuthenticated() && !this.authStore.isTokenExpired()) {
      void this.router.navigate(['/main']);
      return;
    }

    // Show session-expired banner when redirected by the auth guard.
    if (this.route.snapshot.queryParamMap.get('reason') === 'session-expired') {
      this.sessionExpiredMessage.set('Your session has expired. Please log in again.');
    }

    // No app shell on the login page — complete the native bar once the page renders.
    afterNextRender(() => this.loader.completeBoot());
  }

  // SSO Login method
  protected ssoLogin(): void {
    this.authStore.login();
  }
}
