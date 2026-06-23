/** Mapeo tenant CRM → realm/cliente Keycloak (hub + acceso directo). */
export const VERIFACTU_TENANT_KEYCLOAK: Record<
  string,
  { url: string; realm: string; clientId: string }
> = {
  demo: {
    url: 'http://localhost:8081',
    realm: 'josanz-web-app-realm',
    clientId: 'verifactu-crm-spa',
  },
  verifactu: {
    url: 'http://localhost:8081',
    realm: 'josanz-web-app-realm',
    clientId: 'verifactu-crm-spa',
  },
  josanz: {
    url: 'http://localhost:8081',
    realm: 'josanz-web-app-realm',
    clientId: 'verifactu-crm-spa',
  },
  alexis: {
    url: 'http://localhost:8081',
    realm: 'josanz-web-app-realm',
    clientId: 'josanz-figma-spa',
  },
  babooni: {
    url: 'http://localhost:8081',
    realm: 'babooni-tenant',
    clientId: 'josanz-web-app-spa',
  },
};

export function resolveVerifactuTenantKeycloak(
  tenantSlug: string | null | undefined,
  fallback?: { url: string; realm: string; clientId: string },
): { url: string; realm: string; clientId: string } | null {
  const key = tenantSlug?.trim().toLowerCase() ?? '';
  if (key && VERIFACTU_TENANT_KEYCLOAK[key]) {
    return VERIFACTU_TENANT_KEYCLOAK[key];
  }
  return fallback ?? VERIFACTU_TENANT_KEYCLOAK['demo'] ?? null;
}
