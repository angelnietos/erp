import { Directive, TemplateRef, ViewContainerRef, inject, effect, input } from '@angular/core';
import { GlobalAuthStore as AuthStore } from '@josanz-erp/shared-data-access';

@Directive({
  selector: '[uiHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private readonly templateRef = inject(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authStore = inject(AuthStore);

  /** Permission key (e.g. `clients.view`). Wildcard `*` on the user grants all. */
  readonly permission = input.required<string>({ alias: 'uiHasPermission' });

  constructor() {
    effect(() => {
      const key = this.permission();
      const perms = this.authStore.user()?.permissions;
      const hasPermission =
        !!key &&
        !!perms &&
        (perms.includes('*') || perms.includes(key));

      this.viewContainer.clear();
      if (hasPermission) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }
}
