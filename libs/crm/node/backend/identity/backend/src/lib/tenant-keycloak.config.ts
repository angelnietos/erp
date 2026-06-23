/** Mapeo tenant CRM → realm/cliente Keycloak (alineado con apps/web). */
export const VERIFACTU_TENANT_KEYCLOAK: Record<
  string,
  { realm: string; clientId: string }
> = {
  demo: {
    realm: 'josanz-web-app-realm',
    clientId: 'verifactu-crm-spa',
  },
  verifactu: {
    realm: 'josanz-web-app-realm',
    clientId: 'verifactu-crm-spa',
  },
  josanz: {
    realm: 'josanz-web-app-realm',
    clientId: 'verifactu-crm-spa',
  },
  alexis: {
    realm: 'josanz-web-app-realm',
    clientId: 'josanz-figma-spa',
  },
  babooni: {
    realm: 'babooni-tenant',
    clientId: 'josanz-web-app-spa',
  },
};

export function resolveVerifactuTenantKeycloak(
  tenantSlug?: string | null,
): { realm: string; clientId: string } | null {
  const key = tenantSlug?.trim().toLowerCase() ?? '';
  if (key && VERIFACTU_TENANT_KEYCLOAK[key]) {
    return VERIFACTU_TENANT_KEYCLOAK[key];
  }
  return VERIFACTU_TENANT_KEYCLOAK['demo'] ?? null;
}
