// Auth
export { AuthStore } from './lib/store/auth.store';
export {
  AuthService,
  AUTH_KEYCLOAK_CONFIG,
  DEFAULT_LOGIN_TENANT_SLUG,
  ERP_TENANT_SLUG_SESSION_KEY,
  IDENTITY_AUTH_MODE_SESSION_KEY,
  IDENTITY_KEYCLOAK_AVAILABLE_SESSION_KEY,
  type IdentityAuthMeta,
  type IdentityAuthMode,
} from './lib/services/auth.service';
export {
  ERP_BFF_AUTH,
  ERP_AUTH_SESSION_MODE,
  type ErpBffAuthPort,
  type ErpBffLoginResult,
  type ErpAuthSessionMode,
} from './lib/ports/erp-bff-auth.port';
export { resolvePostLoginPath } from './lib/utils/post-login-navigation';
export {
  getErpTenantSlug,
  syncErpTenantHtmlTheme,
} from './lib/utils/erp-tenant-theme';

// Users
export { UsersService } from './lib/services/users.service';

// Interceptors
export { authInterceptor } from './lib/interceptors/auth.interceptor';
export { tenantInterceptor } from './lib/interceptors/tenant.interceptor';

// Utils
export {
  getStoredTenantId,
  setStoredTenantId,
  clearStoredTenantId,
} from './lib/interceptors/tenant.interceptor';
// Tenant modules (persistidos por tenant en backend)
export { TenantModulesApiService } from './lib/services/tenant-modules-api.service';
export {
  TenantModulesRealtimeService,
  TENANT_MODULES_REALTIME_API_ORIGIN,
} from './lib/services/tenant-modules-realtime.service';

// Roles
export { RolesService } from './lib/services/roles.service';
export * from './lib/models/role.model';
