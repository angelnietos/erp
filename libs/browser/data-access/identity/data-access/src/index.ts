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
export { ErpRouteThemeService } from './lib/services/erp-route-theme.service';
export {
  ERP_BFF_AUTH,
  ERP_AUTH_SESSION_MODE,
  type ErpBffAuthPort,
  type ErpBffLoginResult,
  type ErpAuthSessionMode,
} from './lib/ports/erp-bff-auth.port';
export {
  resolvePostLoginPath,
  resolveTenantHomePath,
  configureErpMainShellBaseUrl,
  resolveErpMainShellHandoffUrl,
  resolveErpTenantLoginHandoffUrl,
} from './lib/utils/post-login-navigation';
export {
  getErpTenantSlug,
  setErpTenantSlug,
  syncErpTenantHtmlTheme,
  syncErpRoutePhaseFromPath,
  resolveTenantSlugFromId,
  getErpTenantDisplayName,
  getClassicShellBrand,
  TENANT_ID_TO_SLUG,
  TENANT_DISPLAY_NAME_BY_SLUG,
} from './lib/utils/erp-tenant-theme';
export {
  getTenantUiShell,
  JOSANZ_FIGMA_TENANT_SLUG,
  usesJosanzFigmaLogin,
  prefersEmbeddedJosanzFigmaLogin,
  usesDocumentGeneratorLogin,
  isBabooniUiShell,
  isJosanzFigmaUiShell,
  isDocumentGeneratorUiShell,
  TENANT_UI_SHELL_BY_SLUG,
  type ErpTenantUiShell,
} from './lib/utils/tenant-ui-shell';
export {
  DEV_TENANT_LOGIN_PASSWORD,
  DEV_TENANT_LOGIN_HINTS,
  getDevLoginHintsForTenant,
  getPrimaryDevLoginHintForTenant,
  getDevLoginEmailPlaceholder,
  type DevTenantLoginHint,
} from './lib/utils/dev-tenant-login-hints';
export {
  josanzFigmaShellCanMatch,
  documentGeneratorShellCanMatch,
  classicErpShellCanMatch,
} from './lib/guards/tenant-shell-match.guards';
export {
  redirectFigmaShellFromClassicRoutes,
  redirectAlternateShellFromClassicRoutes,
} from './lib/guards/figma-shell-route.guard';
export { redirectToTenantHomeGuard } from './lib/guards/redirect-to-tenant-home.guard';

// Users
export { UsersService } from './lib/services/users.service';

// Interceptors
export { authInterceptor } from './lib/interceptors/auth.interceptor';
export { tenantInterceptor } from './lib/interceptors/tenant.interceptor';
export { sessionExpiryInterceptor, resetSessionInvalidationGuard } from './lib/interceptors/session-expiry.interceptor';

// Session keepalive (BFF)
export { provideBffSessionKeepalive } from './lib/providers/bff-session-keepalive.provider';
export { IdentitySessionHydrationService } from './lib/services/identity-session-hydration.service';

// Guards
export { erpAuthGuard } from './lib/guards/erp-auth.guard';

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
