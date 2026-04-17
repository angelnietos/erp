export {
  DEFAULT_TENANT_MODULE_IDS,
  TENANT_MODULE_LABELS_ES,
  requiredModuleIdsForPermission,
  isPermissionAllowedForModules,
  filterPermissionsToEnabledModules,
  normalizeTenantModuleIds,
} from './lib/tenant-modules';

// Shared interfaces for Identity domain
export interface UserPayload {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  roles: string[];
  permissions: string[];
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
  category?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: UserPayload;
  /** Tenant cliente (UUID). Vacío en login del panel SaaS (`platform_users`). */
  tenantId?: string;
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
  category?: string;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  roles?: string[];
  category?: string;
  isActive?: boolean;
}
