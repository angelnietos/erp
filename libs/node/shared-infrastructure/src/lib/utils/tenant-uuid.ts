/** PostgreSQL @db.Uuid values must match this shape (RFC 4122 string form). */
const TENANT_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isTenantUuid(value: string | null | undefined): boolean {
  if (value == null || typeof value !== 'string') {
    return false;
  }
  return TENANT_UUID_RE.test(value.trim());
}
