import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { GlobalAuthStore } from '../store/auth.store';
import { PluginStore } from '../store/plugin.store';
import {
  canAccessJosanzFigmaAdminDashboard,
  resolveJosanzFigmaFallbackPath,
} from '../utils/josanz-figma-rbac';

function redirectWhenDenied(
  router: Router,
  authStore: InstanceType<typeof GlobalAuthStore>,
): void {
  if (authStore.isAuthenticated()) {
    const target = resolveJosanzFigmaFallbackPath(authStore.permissions());
    void router.navigate([target], {
      queryParams: { access: 'denied' },
      replaceUrl: true,
    });
    return;
  }
  void router.navigate(['/auth/login'], { replaceUrl: true });
}

/** Exige módulo activo en el tenant y, opcionalmente, permiso RBAC. */
export const josanzFigmaAccessGuard = (
  moduleId: string,
  permission?: string,
): CanActivateFn => {
  return () => {
    const pluginStore = inject(PluginStore);
    const authStore = inject(GlobalAuthStore);
    const router = inject(Router);

    if (!pluginStore.enabledPlugins().includes(moduleId)) {
      redirectWhenDenied(router, authStore);
      return false;
    }

    if (permission && !authStore.hasPermission(permission)) {
      redirectWhenDenied(router, authStore);
      return false;
    }

    return true;
  };
};

/** Panel de inicio Figma (KPIs / cuadrante): solo administradores. */
export const josanzDashboardAccessGuard: CanActivateFn = () => {
  const pluginStore = inject(PluginStore);
  const authStore = inject(GlobalAuthStore);
  const router = inject(Router);
  const permissions = authStore.permissions();

  const allowed =
    pluginStore.enabledPlugins().includes('dashboard') &&
    canAccessJosanzFigmaAdminDashboard(permissions);

  if (allowed) {
    return true;
  }

  redirectWhenDenied(router, authStore);
  return false;
};

export const josanzSettingsAccessGuard: CanActivateFn = () => {
  const authStore = inject(GlobalAuthStore);
  const router = inject(Router);
  const permissions = authStore.permissions();

  const allowed =
    permissions.includes('*') ||
    permissions.includes('users.view') ||
    permissions.includes('users.manage') ||
    permissions.includes('roles.manage') ||
    permissions.includes('modules.manage');

  if (allowed) {
    return true;
  }

  redirectWhenDenied(router, authStore);
  return false;
};
