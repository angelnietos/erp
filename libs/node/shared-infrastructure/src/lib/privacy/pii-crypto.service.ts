import { Injectable } from '@nestjs/common';
import { encrypt, decrypt } from '../utils/encryption';

/**
 * Cifrado reversible de PII en reposo (AES-256-GCM).
 * Usa PII_ENCRYPTION_KEY o WEBHOOK_ENCRYPTION_KEY (mín. 32 caracteres en producción).
 * ISO 27001 A.8.24 / RGPD art. 32 — confidencialidad.
 */
@Injectable()
export class PiiCryptoService {
  private readonly prefix = 'enc:v1:';

  isEncrypted(value: string | null | undefined): boolean {
    return !!value?.startsWith(this.prefix);
  }

  encryptField(plain: string | null | undefined): string | null {
    if (plain == null || plain === '') return plain ?? null;
    if (this.isEncrypted(plain)) return plain;
    return this.prefix + encrypt(plain);
  }

  decryptField(stored: string | null | undefined): string | null {
    if (stored == null || stored === '') return stored ?? null;
    if (!this.isEncrypted(stored)) return stored;
    return decrypt(stored.slice(this.prefix.length));
  }

  /** Cifra campos PII conocidos de un objeto antes de persistir. */
  encryptRecordFields<T extends Record<string, unknown>>(
    record: T,
    fields: (keyof T)[],
  ): T {
    const out = { ...record };
    for (const field of fields) {
      const v = out[field];
      if (typeof v === 'string') {
        (out as Record<string, unknown>)[field as string] = this.encryptField(v);
      }
    }
    return out;
  }

  decryptRecordFields<T extends Record<string, unknown>>(
    record: T,
    fields: (keyof T)[],
  ): T {
    const out = { ...record };
    for (const field of fields) {
      const v = out[field];
      if (typeof v === 'string') {
        (out as Record<string, unknown>)[field as string] = this.decryptField(v);
      }
    }
    return out;
  }
}
