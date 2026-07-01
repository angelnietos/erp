/** Panel de inicio / KPIs del shell Figma: solo administradores del tenant. */
export function canAccessJosanzFigmaAdminDashboard(
  permissions: readonly string[],
): boolean {
  return (
    permissions.includes('*') ||
    permissions.includes('users.manage') ||
    permissions.includes('roles.manage') ||
    permissions.includes('modules.manage')
  );
}

/** Primera ruta operativa segura cuando se deniega acceso (p. ej. técnico sin dashboard). */
export function resolveJosanzFigmaFallbackPath(
  permissions: readonly string[],
): string {
  if (permissions.includes('*') || permissions.includes('events.view')) {
    return '/events';
  }
  if (permissions.includes('clients.view')) {
    return '/clients';
  }
  if (permissions.includes('products.view')) {
    return '/stock';
  }
  if (permissions.includes('users.view')) {
    return '/staff';
  }
  if (permissions.includes('fleet.view')) {
    return '/vehicles';
  }
  if (permissions.includes('budgets.view')) {
    return '/budgets';
  }
  if (permissions.includes('billing.view')) {
    return '/billing';
  }
  return '/events';
}
