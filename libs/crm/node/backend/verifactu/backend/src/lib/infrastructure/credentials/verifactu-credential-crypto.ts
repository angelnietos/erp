import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'node:crypto';

const IV_LEN = 16;
const TAG_LEN = 16;

function masterKey(): Buffer {
  const raw = process.env['VERIFACTU_CREDENTIALS_ENCRYPTION_KEY']?.trim() ?? '';
  if (!raw) {
    throw new Error(
      'VERIFACTU_CREDENTIALS_ENCRYPTION_KEY no está definida (hex 64 chars o base64 de 32 bytes).',
    );
  }
  if (/^[0-9a-fA-F]{64}$/.test(raw)) {
    return Buffer.from(raw, 'hex');
  }
  try {
    const b = Buffer.from(raw, 'base64');
    if (b.length === 32) {
      return b;
    }
  } catch {
    /* fall through */
  }
  return scryptSync(raw, 'verifactu-cred-salt-v1', 32);
}

/** Cifra texto UTF-8; salida base64 (iv || tag || ciphertext). */
export function encryptCredentialSecret(plain: string): string {
  const key = masterKey();
  const iv = randomBytes(IV_LEN);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, enc]).toString('base64');
}

export function decryptCredentialSecret(blobB64: string): string {
  const key = masterKey();
  const buf = Buffer.from(blobB64, 'base64');
  if (buf.length < IV_LEN + TAG_LEN + 1) {
    throw new Error('Blob de credencial inválido');
  }
  const iv = buf.subarray(0, IV_LEN);
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN);
  const data = buf.subarray(IV_LEN + TAG_LEN);
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString(
    'utf8',
  );
}

export function isCredentialEncryptionConfigured(): boolean {
  const raw = process.env['VERIFACTU_CREDENTIALS_ENCRYPTION_KEY']?.trim() ?? '';
  return raw.length > 0;
}
