/** Canonical UUID string (8-4-4-4-12 hex). Does not enforce RFC 4122 variant bits — legacy seed IDs may omit them. */
const TENANT_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isTenantUuid(value: string | null | undefined): boolean {
  if (value == null || typeof value !== 'string') {
    return false;
  }
  return TENANT_UUID_RE.test(value.trim());
}
