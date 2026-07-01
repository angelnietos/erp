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
    note: 'Solo acceso local (no está en Keycloak)',
  },
  {
    slug: 'babooni',
    email: 'root@babooni.com',
    password: DEV_TENANT_LOGIN_PASSWORD,
    primary: true,
  },
  {
    slug: 'babooni',
    email: 'alvaro.ballesteros@babooni.com',
    password: DEV_TENANT_LOGIN_PASSWORD,
  },
  {
    slug: 'babooni',
    email: 'florina.mahalean@babooni.com',
    password: DEV_TENANT_LOGIN_PASSWORD,
  },
  {
    slug: 'alexis',
    email: 'admin@alexis.local',
    password: DEV_TENANT_LOGIN_PASSWORD,
    primary: true,
    note: 'SuperAdmin',
  },
  {
    slug: 'alexis',
    email: 'administrador@alexis.local',
    password: DEV_TENANT_LOGIN_PASSWORD,
    note: 'Administrador',
  },
  {
    slug: 'alexis',
    email: 'responsable@alexis.local',
    password: DEV_TENANT_LOGIN_PASSWORD,
    note: 'Responsable',
  },
  {
    slug: 'alexis',
    email: 'usuario@alexis.local',
    password: DEV_TENANT_LOGIN_PASSWORD,
    note: 'Usuario',
  },
  {
    slug: 'alexis',
    email: 'tecnico.audio@alexis.local',
    password: DEV_TENANT_LOGIN_PASSWORD,
    note: 'Dani Sonido · técnico',
  },
  {
    slug: 'alexis',
    email: 'tecnica.iluminacion@alexis.local',
    password: DEV_TENANT_LOGIN_PASSWORD,
    note: 'Laura Luces · técnico',
  },
  {
    slug: 'alexis',
    email: 'freelance.video@alexis.local',
    password: DEV_TENANT_LOGIN_PASSWORD,
    note: 'Marta Video · freelance',
  },
  {
    slug: 'docs',
    email: 'admin@docs.local',
    password: DEV_TENANT_LOGIN_PASSWORD,
    primary: true,
    note: 'App documentos (:4210)',
  },
  {
    slug: 'platform',
    email: 'platform@babooni.com',
    password: DEV_TENANT_LOGIN_PASSWORD,
    primary: true,
    note: 'Panel SaaS (:4300)',
  },
  {
    slug: 'verifactu',
    email: 'admin@demo.local',
    password: 'Demo12345!',
    note: 'Verifactu CRM (:4230)',
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
