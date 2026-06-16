import { Component, computed, inject, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import {
  AppLayoutComponent,
  JosanzFigmaAppShellComponent,
} from '@josanz-erp/shared-ui-shell';
import { BabooniAppLayoutComponent } from '@josanz-erp/babooni-ui';
import {
  AuthStore,
  getErpTenantSlug,
  getTenantUiShell,
  syncErpTenantHtmlTheme,
} from '@josanz-erp/identity-data-access';

@Component({
  selector: 'app-main-app-shell',
  standalone: true,
  imports: [
    RouterModule,
    AppLayoutComponent,
    BabooniAppLayoutComponent,
    JosanzFigmaAppShellComponent,
  ],
  template: `
    @switch (uiShell()) {
      @case ('babooni') {
        <lib-babooni-app-layout />
      }
      @case ('josanz-figma') {
        <josanz-figma-app-shell />
      }
      @case ('document-generator') {
        <router-outlet />
      }
      @default {
        <josanz-app-layout (logoutClick)="auth.logout()" />
      }
    }
  `,
})
export class MainAppShellComponent implements OnInit {
  readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly navRefresh = toSignal(
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd)),
  );

  ngOnInit(): void {
    syncErpTenantHtmlTheme();
  }

  readonly uiShell = computed(() => {
    this.navRefresh();
    syncErpTenantHtmlTheme();
    return getTenantUiShell(getErpTenantSlug());
  });
}
