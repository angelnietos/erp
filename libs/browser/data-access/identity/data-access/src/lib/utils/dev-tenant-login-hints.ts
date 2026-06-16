/** Contraseña común de cuentas seed en `apps/backend/prisma/seed.ts`. */
export const DEV_TENANT_LOGIN_PASSWORD = 'Admin123!';

export interface DevTenantLoginHint {
  slug: string;
  email: string;
  password: string;
  /** Nota corta (p. ej. alternativa solo-local). */
  note?: string;
  /** Cuenta principal para autocompletar en login dev. */
  primary?: boolean;
}

/** Cuentas de prueba por tenant — alineadas con el seed de Prisma. */
export const DEV_TENANT_LOGIN_HINTS: readonly DevTenantLoginHint[] = [
  {
    slug: 'josanz',
    email: 'admin@josanz.com',
    password: DEV_TENANT_LOGIN_PASSWORD,
    primary: true,
  },
  {
    slug: 'josanz',
    email: 'admin@josanz-erp.local',
    password: DEV_TENANT_LOGIN_PASSWORD,
    note: 'Alternativa solo login local (sin Keycloak)',
  },
  {
    slug: 'babooni',
    email: 'root@babooni.com',
    password: DEV_TENANT_LOGIN_PASSWORD,
    primary: true,
  },
  {
    slug: 'alexis',
    email: 'admin@alexis.local',
    password: DEV_TENANT_LOGIN_PASSWORD,
    primary: true,
  },
] as const;

export function getDevLoginHintsForTenant(slug: string): DevTenantLoginHint[] {
  const normalized = slug.trim().toLowerCase();
  return DEV_TENANT_LOGIN_HINTS.filter((h) => h.slug === normalized);
}

export function getPrimaryDevLoginHintForTenant(
  slug: string,
): DevTenantLoginHint | undefined {
  const hints = getDevLoginHintsForTenant(slug);
  return hints.find((h) => h.primary) ?? hints[0];
}

export function getDevLoginEmailPlaceholder(slug: string): string {
  const primary = getPrimaryDevLoginHintForTenant(slug);
  return primary?.email ?? 'Introduce tu e-mail';
}
