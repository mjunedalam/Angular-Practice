// login.component.ts
import { afterNextRender, ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthStore } from 'src/app/features/auth/store/auth.store';
import { LoginRequest } from 'src/app/features/auth/store/auth.selectors';
import { LoaderService } from '@shared/components/global-loader/loader.service';

interface LoginForm {
  username: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDividerModule,
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
  private readonly submitted = signal(false);

  protected readonly sessionExpiredMessage = signal<string | null>(null);

  // Collapsible state for credentials form - default collapsed (false)
  protected readonly isCredentialsExpanded = signal(false);
  protected readonly hidePassword = signal(true);

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

  protected readonly loginForm = new FormGroup<LoginForm>({
    username: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  // SSO Login method
  protected ssoLogin(): void {
    this.authStore.login();
  }

  // Toggle credentials form visibility
  protected toggleCredentials(): void {
    this.isCredentialsExpanded.update(expanded => !expanded);
    // Reset form and submission state when collapsing
    if (!this.isCredentialsExpanded()) {
      this.submitted.set(false);
      this.loginForm.reset();
      this.loginForm.markAsPristine();
    }
  }

  protected submit(): void {
    this.submitted.set(true);

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.authStore.login(this.loginForm.getRawValue() as LoginRequest);
  }

  protected togglePasswordVisibility(): void {
    this.hidePassword.update((hidden) => !hidden);
  }

  protected isFieldInvalid(field: keyof LoginRequest): boolean {
    const control = this.loginForm.controls[field];
    return control.invalid && (control.dirty || control.touched || this.submitted());
  }
}
