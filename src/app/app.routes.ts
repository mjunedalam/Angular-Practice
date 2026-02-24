import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/wellbore/presentation/presentation.component').then(
        (m) => m.PresentationComponent,
      ),
  },
  { path: '**', redirectTo: '' },
];
