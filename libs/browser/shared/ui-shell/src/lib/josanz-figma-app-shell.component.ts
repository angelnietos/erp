import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  MobileTabBarComponent,
  SidebarComponent,
  JosanzThemeService,
} from '@josanz-erp/josanz-ui';
import { AuthStore } from '@josanz-erp/identity-data-access';

/**
 * Shell Figma (`josanz-ui`) — mismo contrato que apps/josanz-web-app,
 * integrado en el ERP principal con AuthStore real (no demo auth).
 */
@Component({
  selector: 'josanz-figma-app-shell',
  standalone: true,
  imports: [RouterModule, SidebarComponent, MobileTabBarComponent],
  template: `
    <div class="flex h-[100dvh] min-h-0 overflow-hidden" [style.backgroundColor]="'var(--josanz-bg)'">
      <div class="relative z-[100] hidden h-full min-h-0 shrink-0 md:flex">
        <josanz-sidebar (logoutClick)="auth.logout()" />
      </div>
      <div class="relative flex min-h-0 min-w-0 flex-1 flex-col">
        <main class="josanz-page-main josanz-scroll-quiet">
          <router-outlet />
        </main>
        <josanz-mobile-tab-bar class="md:hidden" />
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
    `,
  ],
})
export class JosanzFigmaAppShellComponent implements OnInit {
  readonly auth = inject(AuthStore);
  private readonly josanzTheme = inject(JosanzThemeService);

  ngOnInit(): void {
    this.josanzTheme.setTheme('luxe-rounded');
  }
}
