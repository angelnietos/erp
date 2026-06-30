import { getTenantKeycloakConfig, tenantUsesKeycloakLogin } from '@josanz-erp/identity-api';

export function resolveForgotPasswordTenantSlug(
  fromQuery: string | null | undefined,
  fromSession: string | null | undefined,
  fallback: string,
): string {
  const slug = (fromQuery ?? fromSession ?? fallback).trim().toLowerCase();
  const normalized = slug.replace(/[^a-z0-9-]/g, '');
  return normalized || fallback;
}

export function buildKeycloakResetCredentialsUrl(
  keycloakBaseUrl: string,
  slug: string,
  returnOrigin?: string,
): string | null {
  if (!tenantUsesKeycloakLogin(slug)) {
    return null;
  }
  const tenantCfg = getTenantKeycloakConfig(slug);
  const kcBase = keycloakBaseUrl.replace(/\/$/, '');
  if (!tenantCfg || !kcBase) {
    return null;
  }

  const origin =
    returnOrigin ?? (typeof window !== 'undefined' ? window.location.origin : '');
  const resetUrl = new URL(
    `${kcBase}/realms/${tenantCfg.realm}/login-actions/reset-credentials`,
  );
  resetUrl.searchParams.set('client_id', tenantCfg.clientId);
  resetUrl.searchParams.set('redirect_uri', `${origin}/auth/login?tenant=${slug}`);
  resetUrl.searchParams.set('ui_locales', 'es en');
  return resetUrl.toString();
}

export function redirectToKeycloakResetCredentials(
  keycloakBaseUrl: string,
  slug: string,
): boolean {
  const url = buildKeycloakResetCredentialsUrl(keycloakBaseUrl, slug);
  if (!url || typeof window === 'undefined') {
    return false;
  }
  window.location.assign(url);
  return true;
}
