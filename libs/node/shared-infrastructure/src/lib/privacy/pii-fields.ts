/** Campos PII de Client cifrados en reposo (AES-256-GCM). */
export const CLIENT_PII_FIELDS = [
  'taxId',
  'email',
  'phone',
  'address',
] as const;

export type ClientPiiField = (typeof CLIENT_PII_FIELDS)[number];

export const CLIENT_CONTACT_PII_FIELDS = ['email', 'phone', 'notes'] as const;
