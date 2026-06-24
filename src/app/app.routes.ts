import { Routes } from '@angular/router';
import { authGuard } from '@guards/auth.guard';
import { roleGuard } from '@guards/role.guard';
import { EmailStore } from '@store/email/email.store';
import { WellDocsStore } from '@store/well-docs/well-docs.store';
import { PresentationStore } from './features/presentation/store/presentation.store';
import { ActiveWwellStore } from './features/active-wwell/store/active-wwell.store';
import { MorningReportStore } from './features/morning-report/store/morning-report.store';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'main',
    loadComponent: () =>
      import('./layout/layout.component').then(
        (m) => m.LayoutComponent,
      ),
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./features/home/home.component').then(
            (m) => m.HomeComponent,
          ),
      },
      {
        path: 'presentations',
        data: { routeId: 'presentations' },
        canActivate: [roleGuard],
        loadComponent: () =>
          import('./features/presentation/presentation.component').then(
            (m) => m.PresentationComponent,
          ),
        providers: [PresentationStore, WellDocsStore],
      },
      {
        path: 'active-wwell',
        data: { routeId: 'active-wwell' },
        canActivate: [roleGuard],
        loadComponent: () =>
          import('./features/active-wwell/active-wwell-view/active-wwell-view.component').then(
            (m) => m.ActiveWwellViewComponent,
          ),
        providers: [ActiveWwellStore],
      },
      {
        path: 'morning-report',
        data: { routeId: 'morning-report' },
        canActivate: [roleGuard],
        loadComponent: () =>
          import('./features/morning-report/morning-report.component').then(
            (m) => m.MorningReportComponent,
          ),
        providers: [EmailStore, MorningReportStore],
      },
      {
        path: 'water-wells-overview',
        data: { routeId: 'presentations' },
        canActivate: [roleGuard],
        loadComponent: () =>
          import('./features/water-wells-overview/water-wells-overview.component').then(
            (m) => m.WaterWellsOverviewComponent,
          ),
        providers: [MorningReportStore],
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
