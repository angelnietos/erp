import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { GlobalAuthStore } from '@josanz-erp/shared-data-access';
import {
  AuthService,
  ERP_TENANT_SLUG_SESSION_KEY,
  IdentitySessionHydrationService,
  setErpTenantSlug,
  syncErpTenantHtmlTheme,
} from '@josanz-erp/identity-data-access';

const DOCS_TENANT_SLUG = 'docs';

/** App standalone :4210 — login local con tenant fijo `docs` (sin picker del Hub). */
export const docsAppAuthGuard: CanActivateFn = async () => {
  setErpTenantSlug(DOCS_TENANT_SLUG);
  syncErpTenantHtmlTheme();
  sessionStorage.setItem(ERP_TENANT_SLUG_SESSION_KEY, DOCS_TENANT_SLUG);

  const globalAuthStore = inject(GlobalAuthStore);
  const authService = inject(AuthService);
  const sessionHydration = inject(IdentitySessionHydrationService);
  const router = inject(Router);

  if (globalAuthStore.isAuthenticated()) {
    return true;
  }

  if (!authService.isBffMode() && authService.readPersistedSession()) {
    return true;
  }

  if (authService.isBffMode()) {
    const restored = await sessionHydration.tryRestoreFromBffCookie();
    if (restored) {
      return true;
    }
  }

  void router.navigate(['/auth/login'], {
    queryParams: { tenant: DOCS_TENANT_SLUG },
    replaceUrl: true,
  });
  return false;
};
