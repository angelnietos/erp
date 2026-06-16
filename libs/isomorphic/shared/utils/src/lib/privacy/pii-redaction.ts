import { mask } from '../string/string-utils';

/** Campos considerados PII según RGPD / ISO 27001 (registro de tratamiento). */
export const PII_FIELD_NAMES = new Set([
  'email',
  'phone',
  'taxid',
  'tax_id',
  'nif',
  'cif',
  'dni',
  'address',
  'licensenumber',
  'license_number',
  'password',
  'useremail',
  'user_email',
  'signaturebloburl',
  'signature_blob_url',
  'bio',
  'notes',
]);

export function isPiiFieldName(field: string): boolean {
  const n = field.toLowerCase().replace(/-/g, '_');
  if (PII_FIELD_NAMES.has(n)) return true;
  return (
    n.includes('email') ||
    n.includes('phone') ||
    n.includes('tax') ||
    n.includes('password') ||
    n.includes('address')
  );
}

export function maskEmail(value: string): string {
  const at = value.indexOf('@');
  if (at <= 1) return mask(value, 1);
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  const maskedLocal =
    local.length <= 2
      ? '*'.repeat(local.length)
      : local[0] + '*'.repeat(Math.max(1, local.length - 2)) + local.slice(-1);
  return `${maskedLocal}@${domain}`;
}

export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 4) return '*'.repeat(value.length);
  return mask(digits, 2, '*');
}

export function maskTaxId(value: string): string {
  const clean = value.replace(/\s/g, '');
  if (clean.length <= 4) return '*'.repeat(clean.length);
  return mask(clean, 2, '*');
}

export function redactPiiString(field: string, value: string): string {
  const n = field.toLowerCase();
  if (n.includes('email')) return maskEmail(value);
  if (n.includes('phone')) return maskPhone(value);
  if (n.includes('tax') || n.includes('nif') || n.includes('cif') || n.includes('dni')) {
    return maskTaxId(value);
  }
  if (n.includes('password')) return '[REDACTED]';
  if (n.includes('address')) return mask(value, 3);
  return mask(value, 2);
}

/** Enmascara PII en objetos JSON (respuestas API, logs). */
export function redactPiiDeep<T>(input: T, depth = 0): T {
  if (depth > 12 || input == null) {
    return input;
  }
  if (Array.isArray(input)) {
    return input.map((item) => redactPiiDeep(item, depth + 1)) as T;
  }
  if (typeof input !== 'object') {
    return input;
  }
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(input as Record<string, unknown>)) {
    if (typeof val === 'string' && val && isPiiFieldName(key)) {
      out[key] = redactPiiString(key, val);
    } else if (val && typeof val === 'object') {
      out[key] = redactPiiDeep(val, depth + 1);
    } else {
      out[key] = val;
    }
  }
  return out as T;
}

/** Permiso que desactiva el enmascaramiento en API (roles financieros / DPO). */
export const PII_UNMASKED_PERMISSION = 'pii.view_unmasked';

export function canViewUnmaskedPii(permissions: readonly string[] | undefined): boolean {
  const p = permissions ?? [];
  return p.includes('*') || p.includes(PII_UNMASKED_PERMISSION);
}
