import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PluginStore } from '../store/plugin.store';
import { GlobalAuthStore } from '../store/auth.store';

function redirectWhenAccessDenied(
  router: Router,
  authStore: InstanceType<typeof GlobalAuthStore>,
): void {
  if (authStore.isAuthenticated()) {
    void router.navigate(['/settings'], {
      queryParams: { access: 'denied' },
      replaceUrl: true,
    });
    return;
  }
  void router.navigate(['/auth/login'], { replaceUrl: true });
}

export const pluginGuard = (pluginId: string): CanActivateFn => {
  return () => {
    const store = inject(PluginStore);
    const authStore = inject(GlobalAuthStore);
    const router = inject(Router);

    if (store.enabledPlugins().includes(pluginId)) {
      return true;
    }

    redirectWhenAccessDenied(router, authStore);
    return false;
  };
};

export const permissionGuard = (permission: string): CanActivateFn => {
  return () => {
    const authStore = inject(GlobalAuthStore);
    const router = inject(Router);

    if (authStore.hasPermission(permission)) {
      return true;
    }

    redirectWhenAccessDenied(router, authStore);
    return false;
  };
};

export const usersShellGuard: CanActivateFn = () => {
  const store = inject(PluginStore);
  const authStore = inject(GlobalAuthStore);
  const router = inject(Router);

  const p = store.enabledPlugins();
  const hasModule = p.includes('identity') || p.includes('availability');

  if (hasModule) {
    return true;
  }

  redirectWhenAccessDenied(router, authStore);
  return false;
};
