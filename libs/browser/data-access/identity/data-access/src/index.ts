// Auth
export { AuthStore } from './lib/store/auth.store';
export {
  AuthService,
  DEFAULT_LOGIN_TENANT_SLUG,
  ERP_TENANT_SLUG_SESSION_KEY,
} from './lib/services/auth.service';
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
