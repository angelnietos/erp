import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PluginStore } from '../store/plugin.store';
import { GlobalAuthStore } from '../store/auth.store';

export const pluginGuard = (pluginId: string): CanActivateFn => {
  return () => {
    const store = inject(PluginStore);
    const router = inject(Router);

    if (store.enabledPlugins().includes(pluginId)) {
      return true;
    }

    void router.navigate(['/']);
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

    void router.navigate(['/']);
    return false;
  };
};

/** Shell `/users` (lista + disponibilidad): al menos uno de los módulos debe estar activo */
export const usersShellGuard: CanActivateFn = () => {
  const store = inject(PluginStore);
  const authStore = inject(GlobalAuthStore);
  const router = inject(Router);
  
  const p = store.enabledPlugins();
  const hasModule = p.includes('identity') || p.includes('availability');
  const hasPermission = authStore.hasPermission('users.view') || authStore.hasPermission('users.manage');

  if (hasModule && hasPermission) {
    return true;
  }
  
  void router.navigate(['/']);
  return false;
};
