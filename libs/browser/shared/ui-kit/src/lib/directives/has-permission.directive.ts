import { Directive, Input, TemplateRef, ViewContainerRef, inject, effect } from '@angular/core';
import { AuthStore } from '@josanz-erp/shared-data-access';

@Directive({
  selector: '[uiHasPermission]',
  standalone: true,
})
export class HasPermissionDirective {
  private readonly templateRef = inject(TemplateRef);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly authStore = inject(AuthStore);

  @Input('uiHasPermission') permission!: string;

  constructor() {
    effect(() => {
      const hasPermission = this.authStore.user()?.permissions?.includes('*') || 
                            this.authStore.user()?.permissions?.includes(this.permission);
      
      this.viewContainer.clear();
      if (hasPermission) {
        this.viewContainer.createEmbeddedView(this.templateRef);
      }
    });
  }
}
