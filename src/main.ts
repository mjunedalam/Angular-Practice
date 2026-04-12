import { bootstrapApplication } from '@angular/platform-browser';
import { NavigationCancel, NavigationEnd, NavigationError, Router } from '@angular/router';
import { filter, firstValueFrom, take } from 'rxjs';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { LoaderService } from './app/shared/components/global-loader/loader.service';
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';

ModuleRegistry.registerModules([AllCommunityModule]);

declare global {
  interface Window {
    __agwaBootLoader?: {
      complete: () => void;
      setProgress: (progress: number) => void;
    };
  }
}

function waitForNextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}

bootstrapApplication(AppComponent, appConfig)
  .then(async (appRef) => {
    const loader = appRef.injector.get(LoaderService);
    const appStable = firstValueFrom(
      appRef.isStable.pipe(
        filter((isStable) => isStable),
        take(1),
      ),
    );

    const router = appRef.injector.get(Router);
    const navigationDone = router.navigated
      ? Promise.resolve()
      : firstValueFrom(
          router.events.pipe(
            filter((event) =>
              event instanceof NavigationEnd ||
              event instanceof NavigationCancel ||
              event instanceof NavigationError,
            ),
            take(1),
          ),
        ).then(() => undefined);

    await Promise.all([appStable, navigationDone]);
    await waitForNextPaint();

    loader.markAppShellReady();
  })
  .catch((err: unknown) =>
    console.error(err),
  );
