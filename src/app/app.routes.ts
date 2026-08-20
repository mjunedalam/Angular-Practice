import { Routes } from '@angular/router';
import { authGuard } from '@guards/auth.guard';
import { roleGuard } from '@guards/role.guard';
import { EmailStore } from '@store/email/email.store';
import { WellDocsStore } from '@store/well-docs/well-docs.store';
import { PresentationStore } from './features/presentation/store/presentation.store';
import { ActiveWwellStore } from './features/active-wwell/store/active-wwell.store';
import { MorningReportStore } from './features/morning-report/store/morning-report.store';
import { WwellPlanningStore } from './features/wwell-planning/store/wwell-planning.store';
import { WwellIrStore } from './features/wwell-planning/wwell-ir/store/wwell-ir.store';

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
      // PLANNING — open to all roles for now, mirrors left-sidenav.component.ts (no RBAC gating yet)
      {
        path: 'requests',
        loadComponent: () =>
          import('./features/wwell-planning/wwell-requests/wwell-requests.component').then(
            (m) => m.WwellRequestsComponent,
          ),
        providers: [WwellPlanningStore],
      },
      {
        path: 'wlda-approvals',
        loadComponent: () =>
          import('./features/wwell-planning/wwell-wlda-approvals/wwell-wlda-approvals.component').then(
            (m) => m.WwellWldaApprovalsComponent,
          ),
        providers: [WwellPlanningStore],
      },
      {
        path: 'land-affairs-approvals',
        loadComponent: () =>
          import('./features/wwell-planning/wwell-land-affairs-approvals/wwell-land-affairs-approvals.component').then(
            (m) => m.WwellLandAffairsApprovalsComponent,
          ),
        providers: [WwellPlanningStore],
      },
      {
        path: 'integrated-requirements',
        // Store hoisted to this parent (not per-child) so 'new' shares one live store instance
        // with the list route — otherwise a freshly created IR would vanish on navigate-back.
        providers: [WwellIrStore],
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/wwell-planning/wwell-ir/wwell-ir.component').then(
                (m) => m.WwellIrComponent,
              ),
          },
          {
            path: 'new',
            loadComponent: () =>
              import('./features/wwell-planning/wwell-ir/wwell-ir-new-page/wwell-ir-new-page.component').then(
                (m) => m.WwellIrNewPageComponent,
              ),
          },
          {
            // Same component as 'new' — the :irSeq input (bound via withComponentInputBinding())
            // switches it into edit mode. Sibling to 'new', not nested under it, so '..' from
            // either one lands back on the plain list, matching the existing cancel/submit navigation.
            path: 'edit/:irSeq',
            loadComponent: () =>
              import('./features/wwell-planning/wwell-ir/wwell-ir-new-page/wwell-ir-new-page.component').then(
                (m) => m.WwellIrNewPageComponent,
              ),
          },
        ],
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
