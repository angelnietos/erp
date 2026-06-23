export {
  DEFAULT_TENANT_MODULE_IDS,
  TENANT_MODULE_LABELS_ES,
  TENANT_MODULE_CATALOG,
  PROTECTED_TENANT_MODULE_IDS,
  requiredModuleIdsForPermission,
  isPermissionAllowedForModules,
  filterPermissionsToEnabledModules,
  normalizeTenantModuleIds,
  permissionsGroupedByModule,
  permissionsForEnabledModules,
} from './lib/tenant-modules';

export {
  PERMISSIONS_CATALOG,
  ALL_APP_PERMISSION_IDS,
} from './lib/permissions-catalog';
export type { PermissionCatalogEntry } from './lib/permissions-catalog';

export {
  mergeEffectiveUserPermissions,
  userHasAnyPermission,
} from './lib/permission-merge';

export {
  PLATFORM_PERMISSIONS_CATALOG,
  ALL_PLATFORM_PERMISSION_IDS,
  PLATFORM_OWNER_PERMISSIONS,
  resolvePlatformPermissionsForRoles,
  userHasPlatformPermission,
  isPlatformAdminRole,
} from './lib/platform-permissions';
export type { PlatformPermissionEntry } from './lib/platform-permissions';

export {
  TENANT_KEYCLOAK_REALM,
  tenantUsesKeycloakLogin,
  getTenantKeycloakConfig,
  getTenantAuthPolicy,
  normalizeAuthTenantSlug,
  type TenantKeycloakBinding,
  type TenantAuthMode,
  type TenantAuthPolicyView,
} from './lib/tenant-auth-policy';

export {
  PLATFORM_KEYCLOAK_BINDING,
  PLATFORM_KEYCLOAK_REALM_ROLES,
} from './lib/platform-keycloak';

export {
  ERP_PLATFORM_APP_SLUG,
  ERP_VERIFACTU_APP_SLUG,
  ERP_DOCS_APP_SLUG,
  ERP_EXTERNAL_APP_CATALOG,
  configureErpExternalAppBaseUrls,
  resetErpExternalAppBaseUrlsForTests,
  isExternalErpAppSlug,
  getExternalErpAppDefinition,
  resolveExternalAppLaunchUrl,
  type ErpExternalAppDefinition,
  type ErpExternalAppKind,
} from './lib/erp-app-launcher';

// Shared interfaces for Identity domain
export interface UserPayload {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  permissions: string[];
  /** Permisos asignados al usuario además de los de sus roles (se fusionan en el JWT). */
  extraPermissions?: string[];
  /** Permisos revocados explícitamente para este usuario. */
  deniedPermissions?: string[];
  category?: string;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  roles: string[];
  permissions: string[];
  extraPermissions?: string[];
  deniedPermissions?: string[];
  category?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserPayload;
  /** Tenant cliente (UUID). Vacío en login del panel SaaS (`platform_users`). */
  tenantId?: string;
  /** Tenant slug resuelto desde el backend (ej. "josanz", "babooni"). */
  tenantSlug?: string;
}

// DTOs shared between Backend and Frontend (no decorators - pure types)
export interface LoginCredentials {
  email: string;
  password: string;
  /** When no x-tenant-id header is sent, backend resolves tenant by slug (e.g. "josanz"). */
  tenantSlug?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  extraPermissions?: string[];
  deniedPermissions?: string[];
  category?: string;
  /** Si true (default), envía email de invitación para establecer contraseña. */
  sendInviteEmail?: boolean;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  extraPermissions?: string[];
  deniedPermissions?: string[];
  category?: string;
  isActive?: boolean;
}
