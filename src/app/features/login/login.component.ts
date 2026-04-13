// login.component.ts
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { FloatLabelModule } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { LoginRequest } from 'src/app/core/store/auth/auth.selectors';

interface LoginForm {
  username: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    FloatLabelModule,
    InputTextModule,
    MessageModule,
    PasswordModule,
    DividerModule,
    AvatarModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  protected readonly authStore = inject(AuthStore);
  private readonly submitted = signal(false);
  
  // Collapsible state for credentials form - default collapsed (false)
  protected readonly isCredentialsExpanded = signal(false);

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

  protected isFieldInvalid(field: keyof LoginRequest): boolean {
    const control = this.loginForm.controls[field];
    return control.invalid && (control.dirty || control.touched || this.submitted());
  }
}