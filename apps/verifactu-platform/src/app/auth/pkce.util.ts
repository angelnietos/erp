/** PKCE del CRM Verifactu (:4230) — claves separadas del ERP y SaaS. */
const PKCE_CHARSET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';

const VERIFIER_KEY = 'vf_pkce_verifier';
const STATE_KEY = 'vf_pkce_state';
const REDIRECT_URI_KEY = 'vf_pkce_redirect_uri';
const TENANT_SLUG_KEY = 'vf_pkce_tenant_slug';
const RETURN_URL_KEY = 'vf_pkce_return_url';
const REDIRECT_PENDING_KEY = 'vf_pkce_redirect_pending';

function randomString(length: number): string {
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
  const codeVerifier = randomString(64);
  const digest = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(codeVerifier),
  );
  return { codeVerifier, codeChallenge: base64UrlEncode(digest) };
}

export function createOidcState(): string {
  return randomString(32);
}

export function storeVerifactuPkceSession(params: {
  codeVerifier: string;
  state: string;
  redirectUri: string;
  tenantSlug: string;
  returnUrl: string;
}): void {
  sessionStorage.setItem(VERIFIER_KEY, params.codeVerifier);
  sessionStorage.setItem(STATE_KEY, params.state);
  sessionStorage.setItem(REDIRECT_URI_KEY, params.redirectUri);
  sessionStorage.setItem(TENANT_SLUG_KEY, params.tenantSlug);
  sessionStorage.setItem(RETURN_URL_KEY, params.returnUrl);
}

export function readVerifactuPkceSession(): {
  codeVerifier: string;
  state: string;
  redirectUri: string;
  tenantSlug: string;
  returnUrl: string;
} | null {
  const codeVerifier = sessionStorage.getItem(VERIFIER_KEY)?.trim() ?? '';
  const state = sessionStorage.getItem(STATE_KEY)?.trim() ?? '';
  const redirectUri = sessionStorage.getItem(REDIRECT_URI_KEY)?.trim() ?? '';
  const tenantSlug = sessionStorage.getItem(TENANT_SLUG_KEY)?.trim() ?? '';
  const returnUrl = sessionStorage.getItem(RETURN_URL_KEY)?.trim() ?? '';
  if (!codeVerifier || !state || !redirectUri) {
    return null;
  }
  return { codeVerifier, state, redirectUri, tenantSlug, returnUrl };
}

export function clearVerifactuPkceSession(): void {
  sessionStorage.removeItem(VERIFIER_KEY);
  sessionStorage.removeItem(STATE_KEY);
  sessionStorage.removeItem(REDIRECT_URI_KEY);
  sessionStorage.removeItem(TENANT_SLUG_KEY);
  sessionStorage.removeItem(RETURN_URL_KEY);
  sessionStorage.removeItem(REDIRECT_PENDING_KEY);
}

export function markVerifactuPkceRedirectPending(): void {
  sessionStorage.setItem(REDIRECT_PENDING_KEY, '1');
}

export function consumeVerifactuPkceRedirectAborted(): boolean {
  const aborted = sessionStorage.getItem(REDIRECT_PENDING_KEY) === '1';
  if (aborted) {
    sessionStorage.removeItem(REDIRECT_PENDING_KEY);
  }
  return aborted;
}

export function clearVerifactuPkceRedirectPending(): void {
  sessionStorage.removeItem(REDIRECT_PENDING_KEY);
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
  url.searchParams.set('ui_locales', 'es');
  return url.toString();
}

export function defaultOidcCallbackUri(path = '/login/callback'): string {
  return `${window.location.origin}${path.startsWith('/') ? path : `/${path}`}`;
}
