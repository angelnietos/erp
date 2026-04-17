import { Component, computed, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { AppLayoutComponent } from '@josanz-erp/shared-ui-shell';
import { BabooniAppLayoutComponent } from '@josanz-erp/babooni-ui';
import { AuthStore, getErpTenantSlug } from '@josanz-erp/identity-data-access';

@Component({
  selector: 'app-main-app-shell',
  standalone: true,
  imports: [RouterModule, AppLayoutComponent, BabooniAppLayoutComponent],
  template: `
    @if (isBabooniTenant()) {
      <babooni-app-layout />
    } @else {
      <josanz-app-layout (logoutClick)="auth.logout()" />
    }
  `,
})
export class MainAppShellComponent {
  readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly navRefresh = toSignal(
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)),
  );

  /** Tenant `babooni` → shell Biosstel (`@josanz-erp/babooni-ui`); resto → Josanz gaming. */
  readonly isBabooniTenant = computed(() => {
    this.navRefresh();
    return getErpTenantSlug() === 'babooni';
  });
}
