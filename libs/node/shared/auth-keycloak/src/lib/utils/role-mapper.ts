import { KeycloakToken } from '../domain/entities/keycloak-token.entity';
import { PLATFORM_OWNER_PERMISSIONS } from '@josanz-erp/identity-api';

const KEYCLOAK_TO_ERP_ROLE_MAP: Record<string, string> = {
  PlatformOwner: 'platformAdmin',
  PlatformAdmin: 'platformAdmin',
  TenantAdmin: 'clientAdmin',
  admin: 'clientAdmin',
};

/** Permisos de plataforma unificados (local + Keycloak). Los ERP vienen de Postgres vía /session. */
const KEYCLOAK_TO_ERP_PERMISSION_MAP: Record<string, string[]> = {
  platformAdmin: [...PLATFORM_OWNER_PERMISSIONS],
  clientAdmin: [],
};

export function mapKeycloakRolesToErp(
  keycloakToken: KeycloakToken,
): { roles: string[]; permissions: string[] } {
  const realmRoles = keycloakToken.realm_access?.roles ?? [];
  const clientRoles = keycloakToken.client_roles ?? {};

  const allKeycloakRoles = [
    ...realmRoles,
    ...Object.values(clientRoles).flat(),
  ];

  const erpRoles: string[] = [];
  for (const kcRole of allKeycloakRoles) {
    const erpRole = KEYCLOAK_TO_ERP_ROLE_MAP[kcRole];
    if (erpRole && !erpRoles.includes(erpRole)) {
      erpRoles.push(erpRole);
    }
  }

  const permissions = new Set<string>();
  for (const erpRole of erpRoles) {
    const rolePerms = KEYCLOAK_TO_ERP_PERMISSION_MAP[erpRole] || [];
    rolePerms.forEach((p) => permissions.add(p));
  }

  if (realmRoles.includes('PlatformOwner') || realmRoles.includes('PlatformAdmin')) {
    erpRoles.push('platformAdmin');
    for (const p of PLATFORM_OWNER_PERMISSIONS) {
      permissions.add(p);
    }
  }

  return {
    roles: erpRoles.length > 0 ? erpRoles : ['authenticated'],
    permissions: Array.from(permissions),
  };
}
