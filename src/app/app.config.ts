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

    // Ordered startup: config → restore JWT → fetch permissions (needs JWT).
    provideAppInitializer(async () => {
      const configService = inject(ExternalConfigService);
      const authStore     = inject(AuthStore);
      const rbacStore     = inject(RbacStore);
      await configService.loadConfig();
      authStore.autoLogin();
      if (authStore.isAuthenticated()) {
        const baseUrl = configService.settings.dailyOperationServiceUrl;
        await rbacStore.loadPermissions(`${baseUrl}/daily-operations/api/v1/rbac/permissions`);
      }
    }),

    provideAppInitializer(() => {
      inject(MatIconRegistry).setDefaultFontSetClass('material-icons');
    }),
  ],
};
