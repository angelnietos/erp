/** Etiquetas amigables en el panel SaaS (slug técnico en BD puede seguir siendo `josanz`). */
export const PLATFORM_TENANT_LABELS: Readonly<
  Record<string, { name: string; slugLabel: string; realmHint?: string }>
> = {
  josanz: {
    name: 'Generic ERP',
    slugLabel: 'generic-erp',
    realmHint: 'Generic ERP · josanz-web-app-realm',
  },
  babooni: {
    name: 'Babooni Technologies',
    slugLabel: 'babooni',
    realmHint: 'babooni-tenant',
  },
  alexis: { name: 'Alexis', slugLabel: 'alexis' },
  docs: { name: 'Generador de Documentos', slugLabel: 'docs' },
  demo: { name: 'Organización demo', slugLabel: 'demo' },
};

export function platformTenantDisplayName(tenant: { slug: string; name: string }): string {
  const key = tenant.slug?.trim().toLowerCase() ?? '';
  return PLATFORM_TENANT_LABELS[key]?.name ?? tenant.name;
}

export function platformTenantSlugLabel(slug: string): string {
  const key = slug?.trim().toLowerCase() ?? '';
  return PLATFORM_TENANT_LABELS[key]?.slugLabel ?? slug;
}

export function platformTenantRealmHint(tenant: {
  slug: string;
  keycloakRealm?: string;
}): string {
  const key = tenant.slug?.trim().toLowerCase() ?? '';
  return PLATFORM_TENANT_LABELS[key]?.realmHint ?? tenant.keycloakRealm ?? '';
}
