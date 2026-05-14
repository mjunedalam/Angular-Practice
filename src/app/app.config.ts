import { ApplicationConfig, importProvidersFrom, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@interceptors/auth.interceptor';
import { errorInterceptor } from '@interceptors/error.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { routes } from './app.routes';
import { ExternalConfigService } from '@shared/services/external-config.service';
import { AuthStore } from './features/auth/store/auth.store';
import { RbacStore } from '@store/rbac/rbac.store';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    importProvidersFrom(MatSnackBarModule, MatDialogModule),

    // 1. Load external config, then RBAC roles (sequential so roleGuard
    //    has settings.rolesUrl before any protected route activates).
    provideAppInitializer(async () => {
      const configService = inject(ExternalConfigService);
      const rbacStore     = inject(RbacStore);
      await configService.loadConfig();
      await rbacStore.loadRoles(configService.settings.rolesUrl ?? 'assets/roles.json');
    }),

    // 2. Restore session from localStorage.
    provideAppInitializer(() => {
      inject(AuthStore).autoLogin();
    }),

    // 3. Configure Material icon font class.
    provideAppInitializer(() => {
      inject(MatIconRegistry).setDefaultFontSetClass('material-icons');
    }),
  ],
};
