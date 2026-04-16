import { APP_INITIALIZER, ApplicationConfig, importProvidersFrom, inject, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { routes } from './app.routes';
import { ExternalConfigService } from '@shared/services/external-config.service';
import { AuthStore } from './features/auth/store/auth.store';

function initializeAppConfig(configService: ExternalConfigService): () => Promise<void> {
  return () => configService.loadConfig();
}

function initializeAuth(): () => void {
  const authStore = inject(AuthStore);
  return () => authStore.autoLogin();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withFetch()),
    provideAnimationsAsync(),
    importProvidersFrom(MatSnackBarModule),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppConfig,
      deps: [ExternalConfigService],
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAuth,
      deps: [],
      multi: true,
    },
  ],
};
