import { Routes } from '@angular/router';
import { authGuard } from '@guards/auth.guard';
import { WellStore } from '@store/well.store';
import { MorningReportStore } from '@store/morning-report/morning-report';
import { EmailStore } from '@store/email/email.store';

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
        loadComponent: () =>
          import('./features/presentation/presentation.component').then(
            (m) => m.PresentationComponent,
          ),
        providers: [WellStore],
      },
      {
        path: 'morning-report',
        loadComponent: () =>
          import('./features/morning-report/morning-report.component').then(
            (m) => m.MorningReportComponent,
          ),
        providers: [MorningReportStore, EmailStore],
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
