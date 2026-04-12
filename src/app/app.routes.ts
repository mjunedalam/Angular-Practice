import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'main',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
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
      },
      {
        path: 'morning-report',
        loadComponent: () =>
          import('./features/morning-report/morning-report.component').then(
            (m) => m.MorningReportComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
