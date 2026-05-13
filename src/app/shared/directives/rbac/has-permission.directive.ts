import { computed, Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthStore } from '../../../features/auth/store/auth.store';
import { RbacStore } from '@store/rbac/rbac.store';

/**
 * Structural directive that renders its host element only when the current
 * user has the required permission for a given route.
 *
 * Usage:
 *   *appHasPermission="'active-wwell'"                        (read access)
 *   *appHasPermission="'active-wwell'; action: 'update'"      (write access)
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  readonly appHasPermission       = input.required<string>();
  readonly appHasPermissionAction = input<'read' | 'update'>('read');

  private readonly authStore = inject(AuthStore);
  private readonly rbacStore = inject(RbacStore);
  private readonly vcr       = inject(ViewContainerRef);
  private readonly tmpl      = inject(TemplateRef<unknown>);
  private hasView = false;

  constructor() {
    const allowed = computed(() => {
      const routeId   = this.appHasPermission();
      const action    = this.appHasPermissionAction();
      const userRoles = this.authStore.user()?.groups ?? [];
      return action === 'update'
        ? this.rbacStore.canUpdateRoute(routeId, userRoles)
        : this.rbacStore.canAccessRoute(routeId, userRoles);
    });

    effect(() => {
      if (allowed() && !this.hasView) {
        this.vcr.createEmbeddedView(this.tmpl);
        this.hasView = true;
      } else if (!allowed() && this.hasView) {
        this.vcr.clear();
        this.hasView = false;
      }
    });
  }
}
