/** Claves sessionStorage para el flujo Authorization Code + PKCE. */
export const PKCE_VERIFIER_KEY = 'josanz_pkce_verifier';
export const PKCE_STATE_KEY = 'josanz_pkce_state';
export const PKCE_TENANT_KEY = 'josanz_pkce_tenant';
export const PKCE_REDIRECT_URI_KEY = 'josanz_pkce_redirect_uri';

const PKCE_CHARSET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

function randomPkceVerifier(length = 64): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => PKCE_CHARSET[b % PKCE_CHARSET.length]).join('');
}

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function createPkcePair(): Promise<{
  codeVerifier: string;
  codeChallenge: string;
}> {
  const codeVerifier = randomPkceVerifier();
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(codeVerifier),
  );
  return {
    codeVerifier,
    codeChallenge: base64UrlEncode(digest),
  };
}

export function createOidcState(): string {
  return randomPkceVerifier(32);
}

export function storePkceSession(params: {
  codeVerifier: string;
  state: string;
  tenantSlug: string;
  redirectUri: string;
}): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }
  sessionStorage.setItem(PKCE_VERIFIER_KEY, params.codeVerifier);
  sessionStorage.setItem(PKCE_STATE_KEY, params.state);
  sessionStorage.setItem(PKCE_TENANT_KEY, params.tenantSlug);
  sessionStorage.setItem(PKCE_REDIRECT_URI_KEY, params.redirectUri);
}

export function readPkceSession(): {
  codeVerifier: string;
  state: string;
  tenantSlug: string;
  redirectUri: string;
} | null {
  if (typeof sessionStorage === 'undefined') {
    return null;
  }
  const codeVerifier = sessionStorage.getItem(PKCE_VERIFIER_KEY)?.trim() ?? '';
  const state = sessionStorage.getItem(PKCE_STATE_KEY)?.trim() ?? '';
  const tenantSlug = sessionStorage.getItem(PKCE_TENANT_KEY)?.trim() ?? '';
  const redirectUri = sessionStorage.getItem(PKCE_REDIRECT_URI_KEY)?.trim() ?? '';
  if (!codeVerifier || !state || !tenantSlug || !redirectUri) {
    return null;
  }
  return { codeVerifier, state, tenantSlug, redirectUri };
}

export function clearPkceSession(): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }
  sessionStorage.removeItem(PKCE_VERIFIER_KEY);
  sessionStorage.removeItem(PKCE_STATE_KEY);
  sessionStorage.removeItem(PKCE_TENANT_KEY);
  sessionStorage.removeItem(PKCE_REDIRECT_URI_KEY);
}

export function buildKeycloakAuthorizeUrl(params: {
  authServerUrl: string;
  realm: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  state: string;
}): string {
  const base = params.authServerUrl.replace(/\/$/, '');
  const url = new URL(
    `${base}/realms/${params.realm}/protocol/openid-connect/auth`,
  );
  url.searchParams.set('client_id', params.clientId);
  url.searchParams.set('redirect_uri', params.redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', 'openid email profile');
  url.searchParams.set('code_challenge', params.codeChallenge);
  url.searchParams.set('code_challenge_method', 'S256');
  url.searchParams.set('state', params.state);
  return url.toString();
}

export function defaultOidcCallbackUri(path = '/auth/callback'): string {
  if (typeof window === 'undefined') {
    return path;
  }
  return `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`;
}
