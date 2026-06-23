/**
 * Política de autenticación multi-tenant (híbrida).
 *
 * - **Tenant (slug, módulos, shell)** → Postgres ERP (`Tenant` + seed). Fuente de verdad.
 * - **Keycloak** → IdP opcional para tenants listados en {@link TENANT_KEYCLOAK_REALM}.
 *   Infra: contenedor `keycloak` + BD `keycloak-db` (no es la BD del ERP).
 * - **Login local** → fallback / slugs sin KC: usuarios en seed ERP.
 *
 * Reglas BFF:
 * 1. Keycloak solo si el slug está en {@link TENANT_KEYCLOAK_REALM}.
 * 2. Tras KC, el tenant activo es el del picker (`tenantSlug`), no el `tenant_id` del JWT.
 * 3. El usuario debe existir en ese tenant en Postgres.
 */
export interface TenantKeycloakBinding {
  realm: string;
  clientId: string;
}

/** Slugs con realm Keycloak importado en `docker/keycloak/realms/`. */
export const TENANT_KEYCLOAK_REALM: Readonly<
  Record<string, TenantKeycloakBinding>
> = {
  josanz: { realm: 'josanz-web-app-realm', clientId: 'josanz-web-app-spa' },
  /** Mismo realm; cliente con tema Figma en Keycloak (`josanz-figma-spa`). */
  alexis: { realm: 'josanz-web-app-realm', clientId: 'josanz-figma-spa' },
  babooni: { realm: 'babooni-tenant', clientId: 'josanz-web-app-spa' },
};

export function normalizeAuthTenantSlug(slug: string | null | undefined): string {
  return (slug ?? '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
}

export function tenantUsesKeycloakLogin(slug: string | null | undefined): boolean {
  const key = normalizeAuthTenantSlug(slug);
  return key.length > 0 && key in TENANT_KEYCLOAK_REALM;
}

export function getTenantKeycloakConfig(
  slug: string | null | undefined,
): TenantKeycloakBinding | undefined {
  const key = normalizeAuthTenantSlug(slug);
  return TENANT_KEYCLOAK_REALM[key];
}

export type TenantAuthMode = 'keycloak' | 'local';

export interface TenantAuthPolicyView {
  slug: string;
  authMode: TenantAuthMode;
  keycloak?: TenantKeycloakBinding;
  /** Postgres sigue siendo fuente de verdad de roles/permisos ERP. */
  authorizationSource: 'postgres';
}

export function getTenantAuthPolicy(
  slug: string | null | undefined,
): TenantAuthPolicyView {
  const key = normalizeAuthTenantSlug(slug);
  const keycloak = getTenantKeycloakConfig(key);
  return {
    slug: key,
    authMode: keycloak ? 'keycloak' : 'local',
    keycloak,
    authorizationSource: 'postgres',
  };
}
