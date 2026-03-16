import { Routes } from '@angular/router';

export const routes: Routes = [
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
          import('./features/home/home/home.component').then(
            (m) => m.HomeComponent,
          ),
      },
      {
        path: 'presentations',
        loadComponent: () =>
          import('./features/persentation/persentation.component').then(
            (m) => m.PersentationComponent,
          ),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./features/reports/reports.component').then(
            (m) => m.ReportsComponent,
          ),
      },
      {
        path: 'maps',
        loadComponent: () =>
          import('./features/maps/maps.component').then(
            (m) => m.MapsComponent,
          ),
      },
      {
        path: 'production',
        loadComponent: () =>
          import('./features/production/production.component').then(
            (m) => m.ProductionComponent,
          ),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];