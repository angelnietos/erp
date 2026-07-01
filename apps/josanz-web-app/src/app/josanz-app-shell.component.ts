import { Component, effect, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import {
  canAccessJosanzFigmaPath,
  MobileTabBarComponent,
  SidebarComponent,
  JosanzThemeService,
} from '@josanz-erp/josanz-ui';
import { AuthStore } from '@josanz-erp/identity-data-access';
import { GlobalAuthStore, PluginStore } from '@josanz-erp/shared-data-access';

@Component({
  selector: 'app-josanz-shell',
  standalone: true,
  imports: [RouterModule, SidebarComponent, MobileTabBarComponent],
  templateUrl: './josanz-app-shell.component.html',
  styleUrl: './josanz-app-shell.component.css',
})
export class JosanzAppShellComponent implements OnInit {
  private readonly authStore = inject(AuthStore);
  private readonly globalAuth = inject(GlobalAuthStore);
  private readonly pluginStore = inject(PluginStore);
  private readonly router = inject(Router);
  private readonly josanzTheme = inject(JosanzThemeService);

  constructor() {
    effect(() => {
      const permissions = this.globalAuth.permissions();
      const enabledModules = this.pluginStore.enabledPlugins();
      const currentUrl = this.router.url;

      if (
        currentUrl.startsWith('/auth/') ||
        canAccessJosanzFigmaPath(currentUrl, permissions, enabledModules)
      ) {
        return;
      }

      queueMicrotask(() => {
        void this.router.navigate(['/dashboard'], {
          queryParams: { access: 'denied' },
          replaceUrl: true,
        });
      });
    });
  }

  ngOnInit(): void {
    this.josanzTheme.setTheme('luxe-rounded');
  }

  onLogout(): void {
    this.authStore.logout();
  }
}
