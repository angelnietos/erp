/** Devuelve timestamp de expiración (ms) del JWT o null si no se puede leer. */
export function readJwtExpiresAtMs(accessToken: string): number | null {
  try {
    const parts = accessToken.split('.');
    if (parts.length < 2) {
      return null;
    }
    const segment = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = segment.padEnd(segment.length + ((4 - (segment.length % 4)) % 4), '=');
    const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as {
      exp?: unknown;
    };
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function readJwtSubject(accessToken: string): string | null {
  try {
    const parts = accessToken.split('.');
    if (parts.length < 2) {
      return null;
    }
    const segment = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = segment.padEnd(segment.length + ((4 - (segment.length % 4)) % 4), '=');
    const payload = JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as {
      sub?: unknown;
    };
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}
