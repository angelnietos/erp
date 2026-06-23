const INVALID_STORED = new Set(['undefined', 'null', 'unknown', '']);

/** Evita persistir valores corruptos (`localStorage` convierte `undefined` en la cadena "undefined"). */
export function normalizeTenantSlug(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim();
  if (!trimmed || INVALID_STORED.has(trimmed.toLowerCase())) {
    return null;
  }
  return trimmed;
}

export function normalizeTenantName(
  value: string | null | undefined,
): string | null {
  const trimmed = value?.trim();
  if (!trimmed || INVALID_STORED.has(trimmed.toLowerCase())) {
    return null;
  }
  return trimmed;
}

/** Slug CRM a partir del dominio del email (login local sin slug explícito). */
const EMAIL_DOMAIN_TENANT: Readonly<Record<string, string>> = {
  'babooni.com': 'babooni',
  'josanz.com': 'josanz',
  'demo.local': 'demo',
  'alexis.local': 'alexis',
  'acme.local': 'acme',
};

export function inferTenantSlugFromEmail(
  email: string | null | undefined,
): string | null {
  const normalized = email?.trim().toLowerCase() ?? '';
  const at = normalized.lastIndexOf('@');
  if (at < 0) {
    return null;
  }
  const domain = normalized.slice(at + 1);
  return EMAIL_DOMAIN_TENANT[domain] ?? null;
}

export const VERIFACTU_TENANT_LABELS: Readonly<Record<string, string>> = {
  demo: 'Organización demo',
  babooni: 'Babooni Technologies',
  josanz: 'Generic ERP',
  alexis: 'Alexis',
  acme: 'Acme Corp',
  verifactu: 'Organización demo',
};

export function resolveTenantDisplayName(
  slug: string,
  storedName?: string | null,
): string {
  const name = normalizeTenantName(storedName);
  if (name) {
    return name;
  }
  const key = slug.trim().toLowerCase();
  return VERIFACTU_TENANT_LABELS[key] ?? slug;
}
