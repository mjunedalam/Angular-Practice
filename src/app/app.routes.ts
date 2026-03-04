import { Routes } from '@angular/router';


export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/persentation/persentation.component').then(
        (m) => m.PersentationComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
