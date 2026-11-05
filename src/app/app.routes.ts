import { Routes } from '@angular/router';
import { authGuard } from '@guards/auth.guard';
import { roleGuard } from '@guards/role.guard';
import { unsavedChangesGuard } from '@guards/unsaved-changes.guard';
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
        // New/edit no longer route anywhere — WwellIrComponent creates a draft in place and
        // authors it inline (WwellIrEditorComponent) in the same master-detail view. The
        // read-only "View" stepper is the same story: a display mode toggled in place on the
        // detail panel (see WwellIrComponent's `detailMode`), not a separate route — the master
        // list stays visible and clickable the whole time.
        path: 'integrated-requirements',
        providers: [EmailStore, WwellIrStore],
        canDeactivate: [unsavedChangesGuard],
        loadComponent: () =>
          import('./features/wwell-planning/wwell-ir/wwell-ir.component').then(
            (m) => m.WwellIrComponent,
          ),
      },
      {
        path: 'well-profile',
        loadComponent: () => import('./features/well-profile/well-profile.component').then(m => m.WellProfileComponent),
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
