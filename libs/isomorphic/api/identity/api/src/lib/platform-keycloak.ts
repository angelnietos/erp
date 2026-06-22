/** Keycloak del panel SaaS (distinto de tenants ERP). */
export const PLATFORM_KEYCLOAK_BINDING = {
  realm: 'babooni-platform',
  clientId: 'babooni-saas-platform',
} as const;

export const PLATFORM_KEYCLOAK_REALM_ROLES = [
  'PlatformOwner',
  'PlatformAdmin',
] as const;
