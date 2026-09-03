import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';

/** Implemented by any routed component that can carry unsaved local edits (form sections open for
 *  editing, an unsaved "New IR" draft, …) — see WwellIrComponent.canDeactivate() for the reference
 *  implementation: it prompts Save / Discard / Stay and only resolves `true` once the user's
 *  choice (and any save it triggers) has actually settled. */
export interface ComponentCanDeactivate {
  canDeactivate(): Observable<boolean> | boolean;
}

/** Route-level guard for components with in-page unsaved edits — e.g. the wwell-ir master-detail
 *  page, where "navigate away" also has to cover an Angular route change (clicking a different
 *  sidenav item), not just switching the selected row in place (that path is guarded directly by
 *  the component itself; see WwellIrComponent.selectIr/viewIr/createNewIr). */
export const unsavedChangesGuard: CanDeactivateFn<ComponentCanDeactivate> = component => component.canDeactivate();
