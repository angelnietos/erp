import { readFileSync } from 'node:fs';
import * as https from 'node:https';
import { URL } from 'node:url';

export interface AeatHttpPostOptions {
  headers: Record<string, string>;
  /** Rutas PEM para mTLS hacia el endpoint AEAT / gateway (HTTPS). */
  clientCertPath?: string;
  clientKeyPath?: string;
  /** PEM en memoria (p. ej. credenciales por tenant en BD). */
  clientCertPem?: string;
  clientKeyPem?: string;
  /** Solo laboratorio: desactiva verificación TLS del servidor (no usar en producción). */
  tlsInsecure?: boolean;
  /** Tiempo máximo de espera (ms). Por defecto 120000. */
  timeoutMs?: number;
}

/**
 * POST JSON. Usa `fetch` salvo que haya certificado cliente PEM; entonces usa `https.request`.
 */
export async function postJson(
  urlString: string,
  body: unknown,
  options: AeatHttpPostOptions,
): Promise<{ status: number; text: string }> {
  const url = new URL(urlString);
  const payload = JSON.stringify(body);
  const hasPem =
    !!options.clientCertPem?.trim() && !!options.clientKeyPem?.trim();
  const hasPath =
    !!options.clientCertPath?.trim() && !!options.clientKeyPath?.trim();
  const useMtls = url.protocol === 'https:' && (hasPem || hasPath);

  if (useMtls) {
    return postHttpsWithClientCert(url, payload, options);
  }

  const timeoutMs = options.timeoutMs ?? 120_000;
  const res = await fetch(urlString, {
    method: 'POST',
    headers: options.headers,
    body: payload,
    signal: AbortSignal.timeout(timeoutMs),
  });
  const text = await res.text();
  return { status: res.status, text };
}

function postHttpsWithClientCert(
  url: URL,
  payload: string,
  options: AeatHttpPostOptions,
): Promise<{ status: number; text: string }> {
  const pemCert = options.clientCertPem?.trim();
  const pemKey = options.clientKeyPem?.trim();
  const hasPem = !!pemCert && !!pemKey;

  let cert: Buffer | string;
  let key: Buffer | string;
  if (hasPem && pemCert && pemKey) {
    cert = pemCert;
    key = pemKey;
  } else {
    const certPath = options.clientCertPath?.trim();
    const keyPath = options.clientKeyPath?.trim();
    if (!certPath || !keyPath) {
      throw new Error(
        'AEAT HTTPS: se requieren PEM en memoria o rutas a certificado y clave',
      );
    }
    cert = readFileSync(certPath);
    key = readFileSync(keyPath);
  }

  const timeoutMs = options.timeoutMs ?? 120_000;
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: url.hostname,
        port: url.port || 443,
        path: `${url.pathname}${url.search}`,
        method: 'POST',
        headers: {
          ...options.headers,
          'Content-Length': String(Buffer.byteLength(payload, 'utf8')),
        },
        cert,
        key,
        rejectUnauthorized: options.tlsInsecure !== true,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          resolve({
            status: res.statusCode ?? 0,
            text: Buffer.concat(chunks).toString('utf8'),
          });
        });
      },
    );
    req.setTimeout(timeoutMs, () => {
      req.destroy();
      reject(new Error(`AEAT HTTPS: timeout tras ${timeoutMs}ms`));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}
