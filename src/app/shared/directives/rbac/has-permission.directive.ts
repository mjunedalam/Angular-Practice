import { computed, Directive, effect, inject, input, TemplateRef, ViewContainerRef } from '@angular/core';
import { RbacStore } from '@store/rbac/rbac.store';
import { Action, ACTIONS } from '@models/rbac/role.constants';

/**
 * Structural directive that renders its host element only when the current
 * user has the required permission for a given route.
 *
 * Usage:
 *   *appHasPermission="'active-wwell'"                          (read access)
 *   *appHasPermission="'active-wwell'; action: 'update'"        (write access)
 *   *appHasPermission="'morning-report'; action: 'email'"       (email access)
 */
@Directive({
  selector: '[appHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  readonly appHasPermission       = input.required<string>();
  readonly appHasPermissionAction = input<Action>(ACTIONS.READ);

  private readonly rbacStore = inject(RbacStore);
  private readonly vcr       = inject(ViewContainerRef);
  private readonly tmpl      = inject(TemplateRef<unknown>);
  private hasView = false;

  constructor() {
    const allowed = computed(() =>
      this.rbacStore.hasPermission(this.appHasPermission(), this.appHasPermissionAction()),
    );

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
